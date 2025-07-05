"""
CounselFlow Ultimate V3 - Notification Service
Real-time notifications for legal workflows and contract events
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
import structlog
from prisma import Prisma

from app.core.redis import get_cache_manager
from app.core.config import settings

logger = structlog.get_logger()


class NotificationType(str, Enum):
    CONTRACT_EXPIRY_WARNING = "CONTRACT_EXPIRY_WARNING"
    CONTRACT_EXPIRED = "CONTRACT_EXPIRED"
    CONTRACT_APPROVAL_REQUIRED = "CONTRACT_APPROVAL_REQUIRED"
    CONTRACT_APPROVED = "CONTRACT_APPROVED"
    CONTRACT_REJECTED = "CONTRACT_REJECTED"
    CONTRACT_ASSIGNED = "CONTRACT_ASSIGNED"
    CONTRACT_AI_ANALYSIS_COMPLETE = "CONTRACT_AI_ANALYSIS_COMPLETE"
    CONTRACT_HIGH_RISK = "CONTRACT_HIGH_RISK"
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_OVERDUE = "TASK_OVERDUE"
    TASK_COMPLETED = "TASK_COMPLETED"
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
    DOCUMENT_REQUIRES_SIGNATURE = "DOCUMENT_REQUIRES_SIGNATURE"
    MATTER_STATUS_CHANGED = "MATTER_STATUS_CHANGED"
    MATTER_DEADLINE_APPROACHING = "MATTER_DEADLINE_APPROACHING"
    COMPLIANCE_ALERT = "COMPLIANCE_ALERT"
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE"


class NotificationPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class NotificationService:
    """Service for managing notifications and alerts"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        related_entity_id: Optional[str] = None,
        related_entity_type: Optional[str] = None,
        action_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new notification"""
        try:
            notification = await self.prisma.notification.create(
                data={
                    "user_id": user_id,
                    "type": notification_type,
                    "title": title,
                    "message": message,
                    "priority": priority,
                    "related_entity_id": related_entity_id,
                    "related_entity_type": related_entity_type,
                    "action_url": action_url,
                    "metadata": metadata or {},
                    "is_read": False,
                    "created_at": datetime.utcnow()
                }
            )
            
            # Send real-time notification if enabled
            await self._send_realtime_notification(notification)
            
            # Send email if high priority
            if priority in [NotificationPriority.HIGH, NotificationPriority.URGENT]:
                await self._send_email_notification(notification)
            
            logger.info(
                "Notification created",
                notification_id=notification.id,
                user_id=user_id,
                type=notification_type,
                priority=priority
            )
            
            return {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority,
                "created_at": notification.created_at,
                "action_url": notification.action_url
            }
            
        except Exception as e:
            logger.error("Failed to create notification", error=str(e))
            raise
    
    async def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 20,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        try:
            where_clause = {"user_id": user_id}
            if unread_only:
                where_clause["is_read"] = False
            
            notifications = await self.prisma.notification.find_many(
                where=where_clause,
                order_by={"created_at": "desc"},
                take=limit,
                skip=skip
            )
            
            return [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "priority": n.priority,
                    "is_read": n.is_read,
                    "created_at": n.created_at,
                    "action_url": n.action_url,
                    "related_entity_id": n.related_entity_id,
                    "related_entity_type": n.related_entity_type,
                    "metadata": n.metadata
                }
                for n in notifications
            ]
            
        except Exception as e:
            logger.error("Failed to get user notifications", error=str(e))
            raise
    
    async def mark_notification_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            updated = await self.prisma.notification.update(
                where={
                    "id": notification_id,
                    "user_id": user_id
                },
                data={"is_read": True, "read_at": datetime.utcnow()}
            )
            
            logger.info(
                "Notification marked as read",
                notification_id=notification_id,
                user_id=user_id
            )
            
            return True
            
        except Exception as e:
            logger.error("Failed to mark notification as read", error=str(e))
            return False
    
    async def mark_all_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        try:
            result = await self.prisma.notification.update_many(
                where={
                    "user_id": user_id,
                    "is_read": False
                },
                data={"is_read": True, "read_at": datetime.utcnow()}
            )
            
            logger.info(
                "All notifications marked as read",
                user_id=user_id,
                count=result.count
            )
            
            return result.count
            
        except Exception as e:
            logger.error("Failed to mark all notifications as read", error=str(e))
            return 0
    
    async def get_notification_stats(self, user_id: str) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        try:
            total = await self.prisma.notification.count(
                where={"user_id": user_id}
            )
            
            unread = await self.prisma.notification.count(
                where={"user_id": user_id, "is_read": False}
            )
            
            high_priority_unread = await self.prisma.notification.count(
                where={
                    "user_id": user_id,
                    "is_read": False,
                    "priority": {"in": ["HIGH", "URGENT"]}
                }
            )
            
            # Get counts by type
            type_counts = {}
            for notification_type in NotificationType:
                count = await self.prisma.notification.count(
                    where={
                        "user_id": user_id,
                        "type": notification_type,
                        "is_read": False
                    }
                )
                if count > 0:
                    type_counts[notification_type.value] = count
            
            return {
                "total": total,
                "unread": unread,
                "high_priority_unread": high_priority_unread,
                "unread_by_type": type_counts
            }
            
        except Exception as e:
            logger.error("Failed to get notification stats", error=str(e))
            return {"total": 0, "unread": 0, "high_priority_unread": 0, "unread_by_type": {}}
    
    # Contract-specific notification methods
    async def notify_contract_expiry_warning(
        self,
        contract_id: str,
        contract_title: str,
        days_until_expiry: int,
        responsible_users: List[str]
    ):
        """Notify about contract expiring soon"""
        for user_id in responsible_users:
            await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.CONTRACT_EXPIRY_WARNING,
                title=f"Contract Expiring Soon: {contract_title}",
                message=f"Contract '{contract_title}' expires in {days_until_expiry} days. Review renewal options.",
                priority=NotificationPriority.HIGH,
                related_entity_id=contract_id,
                related_entity_type="contract",
                action_url=f"/contracts/{contract_id}",
                metadata={
                    "contract_id": contract_id,
                    "days_until_expiry": days_until_expiry
                }
            )
    
    async def notify_contract_high_risk(
        self,
        contract_id: str,
        contract_title: str,
        risk_score: float,
        risk_factors: List[str],
        responsible_users: List[str]
    ):
        """Notify about high-risk contract analysis"""
        for user_id in responsible_users:
            await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.CONTRACT_HIGH_RISK,
                title=f"High Risk Contract: {contract_title}",
                message=f"AI analysis identified high risk (score: {risk_score}/10) in contract '{contract_title}'. Immediate review recommended.",
                priority=NotificationPriority.URGENT,
                related_entity_id=contract_id,
                related_entity_type="contract",
                action_url=f"/contracts/{contract_id}/analysis",
                metadata={
                    "contract_id": contract_id,
                    "risk_score": risk_score,
                    "risk_factors": risk_factors
                }
            )
    
    async def notify_contract_approval_required(
        self,
        contract_id: str,
        contract_title: str,
        approver_user_id: str,
        requester_name: str
    ):
        """Notify about contract requiring approval"""
        await self.create_notification(
            user_id=approver_user_id,
            notification_type=NotificationType.CONTRACT_APPROVAL_REQUIRED,
            title=f"Contract Approval Required: {contract_title}",
            message=f"Contract '{contract_title}' submitted by {requester_name} requires your approval.",
            priority=NotificationPriority.HIGH,
            related_entity_id=contract_id,
            related_entity_type="contract",
            action_url=f"/contracts/{contract_id}/approval",
            metadata={
                "contract_id": contract_id,
                "requester_name": requester_name
            }
        )
    
    async def notify_contract_assigned(
        self,
        contract_id: str,
        contract_title: str,
        assigned_user_id: str,
        assigned_by_name: str
    ):
        """Notify about contract assignment"""
        await self.create_notification(
            user_id=assigned_user_id,
            notification_type=NotificationType.CONTRACT_ASSIGNED,
            title=f"Contract Assigned: {contract_title}",
            message=f"You have been assigned to contract '{contract_title}' by {assigned_by_name}.",
            priority=NotificationPriority.MEDIUM,
            related_entity_id=contract_id,
            related_entity_type="contract",
            action_url=f"/contracts/{contract_id}",
            metadata={
                "contract_id": contract_id,
                "assigned_by": assigned_by_name
            }
        )
    
    async def notify_ai_analysis_complete(
        self,
        contract_id: str,
        contract_title: str,
        analysis_type: str,
        user_id: str
    ):
        """Notify about completed AI analysis"""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.CONTRACT_AI_ANALYSIS_COMPLETE,
            title=f"AI Analysis Complete: {contract_title}",
            message=f"{analysis_type.title()} analysis completed for contract '{contract_title}'. View results and recommendations.",
            priority=NotificationPriority.MEDIUM,
            related_entity_id=contract_id,
            related_entity_type="contract",
            action_url=f"/contracts/{contract_id}/analysis",
            metadata={
                "contract_id": contract_id,
                "analysis_type": analysis_type
            }
        )
    
    # Background job for checking contract expiries
    async def check_contract_expiries(self):
        """Background job to check for expiring contracts"""
        try:
            # Get contracts expiring in the next 30 days
            thirty_days_from_now = datetime.utcnow().date() + timedelta(days=30)
            
            expiring_contracts = await self.prisma.contract.find_many(
                where={
                    "expiry_date": {"lte": thirty_days_from_now},
                    "status": {"in": ["ACTIVE", "EXECUTED"]},
                    "expiry_notification_sent": {"not": True}
                },
                include={
                    "assigned_attorney": True,
                    "client": True
                }
            )
            
            for contract in expiring_contracts:
                days_until_expiry = (contract.expiry_date - datetime.utcnow().date()).days
                
                if days_until_expiry <= 30:  # 30-day warning
                    # Determine who to notify
                    responsible_users = []
                    
                    if contract.assigned_attorney_id:
                        responsible_users.append(contract.assigned_attorney_id)
                    
                    # Also notify legal ops and admins
                    legal_users = await self.prisma.user.find_many(
                        where={
                            "role": {"in": ["ADMIN", "LEGAL_OPS"]},
                            "active": True
                        },
                        select={"id": True}
                    )
                    
                    responsible_users.extend([user.id for user in legal_users])
                    
                    if responsible_users:
                        await self.notify_contract_expiry_warning(
                            contract_id=contract.id,
                            contract_title=contract.title,
                            days_until_expiry=days_until_expiry,
                            responsible_users=list(set(responsible_users))  # Remove duplicates
                        )
                        
                        # Mark as notified
                        await self.prisma.contract.update(
                            where={"id": contract.id},
                            data={"expiry_notification_sent": True}
                        )
            
            logger.info(
                "Contract expiry check completed",
                contracts_checked=len(expiring_contracts)
            )
            
        except Exception as e:
            logger.error("Failed to check contract expiries", error=str(e))
    
    async def _send_realtime_notification(self, notification):
        """Send real-time notification via WebSocket or Server-Sent Events"""
        try:
            # In a real implementation, you would:
            # 1. Use WebSocket connections to send notifications
            # 2. Store notification in Redis for immediate delivery
            # 3. Use Server-Sent Events for real-time updates
            
            cache_manager = await get_cache_manager()
            
            # Store in Redis for real-time delivery
            notification_data = {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority,
                "created_at": notification.created_at.isoformat(),
                "action_url": notification.action_url
            }
            
            # Add to user's real-time notification queue
            await cache_manager.set(
                f"realtime_notification:{notification.user_id}:{notification.id}",
                notification_data,
                expire=3600  # 1 hour
            )
            
            logger.debug(
                "Real-time notification queued",
                notification_id=notification.id,
                user_id=notification.user_id
            )
            
        except Exception as e:
            logger.error("Failed to send real-time notification", error=str(e))
    
    async def _send_email_notification(self, notification):
        """Send email notification for high-priority alerts"""
        try:
            # In a real implementation, you would:
            # 1. Get user's email address
            # 2. Format email template
            # 3. Send via email service (SendGrid, AWS SES, etc.)
            
            if not settings.email_configured:
                logger.debug("Email not configured, skipping email notification")
                return
            
            user = await self.prisma.user.find_unique(
                where={"id": notification.user_id},
                select={"email": True, "first_name": True, "last_name": True}
            )
            
            if not user:
                logger.warning("User not found for email notification", user_id=notification.user_id)
                return
            
            # TODO: Implement actual email sending
            logger.info(
                "Email notification would be sent",
                user_email=user.email,
                notification_title=notification.title,
                notification_priority=notification.priority
            )
            
        except Exception as e:
            logger.error("Failed to send email notification", error=str(e))


# Global notification service factory
def get_notification_service(prisma: Prisma) -> NotificationService:
    """Factory function to get notification service"""
    return NotificationService(prisma)