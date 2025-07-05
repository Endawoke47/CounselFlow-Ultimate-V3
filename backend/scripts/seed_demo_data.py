"""
CounselFlow Ultimate V3 - Demo Data Seeding Script
Comprehensive legal demo data for testing and demonstration
"""

import asyncio
import random
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Dict, Any
import structlog
from prisma import Prisma

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


class DemoDataSeeder:
    """Comprehensive demo data seeder for CounselFlow"""
    
    def __init__(self):
        self.prisma = Prisma()
        self.created_data = {
            "tenants": [],
            "users": [],
            "clients": [],
            "contracts": [],
            "matters": [],
            "ip_assets": [],
            "documents": [],
            "tasks": [],
            "notifications": []
        }
    
    async def seed_all_data(self):
        """Seed all demo data"""
        try:
            await self.prisma.connect()
            
            logger.info("Starting demo data seeding...")
            
            # Seed in dependency order
            await self.seed_tenants()
            await self.seed_users()
            await self.seed_clients()
            await self.seed_contracts()
            await self.seed_matters()
            await self.seed_ip_assets()
            await self.seed_documents()
            await self.seed_tasks()
            await self.seed_privacy_assessments()
            await self.seed_risk_events()
            await self.seed_compliance_items()
            await self.seed_disputes()
            await self.seed_notifications()
            
            await self.print_summary()
            
            logger.info("Demo data seeding completed successfully!")
            
        except Exception as e:
            logger.error("Failed to seed demo data", error=str(e))
            raise
        finally:
            await self.prisma.disconnect()
    
    async def seed_tenants(self):
        """Seed tenant organizations"""
        tenants_data = [
            {
                "name": "TechCorp Industries",
                "domain": "techcorp.com",
                "settings": {
                    "contract_approval_workflow": True,
                    "ai_analysis_enabled": True,
                    "compliance_framework": "SOX"
                }
            },
            {
                "name": "Global Manufacturing Ltd",
                "domain": "globalmanufacturing.com", 
                "settings": {
                    "contract_approval_workflow": True,
                    "ai_analysis_enabled": True,
                    "compliance_framework": "ISO27001"
                }
            },
            {
                "name": "StartupVentures Inc",
                "domain": "startupventures.com",
                "settings": {
                    "contract_approval_workflow": False,
                    "ai_analysis_enabled": True,
                    "compliance_framework": "GDPR"
                }
            }
        ]
        
        for tenant_data in tenants_data:
            tenant = await self.prisma.tenant.create(data=tenant_data)
            self.created_data["tenants"].append(tenant)
            logger.info(f"Created tenant: {tenant.name}")
    
    async def seed_users(self):
        """Seed users with different roles"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        users_data = [
            # Admin users
            {
                "email": "admin@techcorp.com",
                "first_name": "Sarah",
                "last_name": "Admin",
                "password_hash": pwd_context.hash("admin123"),
                "role": "ADMIN",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][0].id
            },
            
            # In-house counsel
            {
                "email": "john.counsel@techcorp.com",
                "first_name": "John",
                "last_name": "Counsel",
                "password_hash": pwd_context.hash("counsel123"),
                "role": "IN_HOUSE_COUNSEL",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][0].id
            },
            {
                "email": "maria.lawyer@globalmanufacturing.com",
                "first_name": "Maria",
                "last_name": "Rodriguez",
                "password_hash": pwd_context.hash("lawyer123"),
                "role": "IN_HOUSE_COUNSEL",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][1].id
            },
            
            # Legal Ops
            {
                "email": "david.ops@techcorp.com",
                "first_name": "David",
                "last_name": "Operations",
                "password_hash": pwd_context.hash("ops123"),
                "role": "LEGAL_OPS",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][0].id
            },
            
            # External counsel
            {
                "email": "lisa.external@lawfirm.com",
                "first_name": "Lisa",
                "last_name": "External",
                "password_hash": pwd_context.hash("external123"),
                "role": "EXTERNAL_COUNSEL",
                "active": True,
                "email_verified": True,
                "tenant_id": None  # External counsel not tied to tenant
            },
            
            # Business stakeholders
            {
                "email": "mike.business@techcorp.com",
                "first_name": "Mike",
                "last_name": "Business",
                "password_hash": pwd_context.hash("business123"),
                "role": "BUSINESS_STAKEHOLDER",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][0].id
            },
            {
                "email": "anna.stakeholder@startupventures.com",
                "first_name": "Anna",
                "last_name": "Stakeholder",
                "password_hash": pwd_context.hash("stakeholder123"),
                "role": "BUSINESS_STAKEHOLDER",
                "active": True,
                "email_verified": True,
                "tenant_id": self.created_data["tenants"][2].id
            }
        ]
        
        for user_data in users_data:
            user = await self.prisma.user.create(data=user_data)
            self.created_data["users"].append(user)
            logger.info(f"Created user: {user.email} ({user.role})")
    
    async def seed_clients(self):
        """Seed client organizations"""
        clients_data = [
            {
                "name": "Acme Software Solutions",
                "type": "CORPORATION",
                "industry": "Software",
                "description": "Leading provider of enterprise software solutions",
                "website": "https://acmesoftware.com",
                "address": "123 Tech Street, Silicon Valley, CA 94000",
                "primary_contact_name": "Robert Johnson",
                "primary_contact_email": "robert.johnson@acmesoftware.com",
                "primary_contact_phone": "+1-555-0101",
                "relationship_manager_id": self.created_data["users"][1].id,  # John Counsel
                "tenant_id": self.created_data["tenants"][0].id
            },
            {
                "name": "Global Logistics Corp",
                "type": "CORPORATION",
                "industry": "Logistics",
                "description": "International shipping and logistics company",
                "website": "https://globallogistics.com",
                "address": "456 Harbor Blvd, Los Angeles, CA 90001",
                "primary_contact_name": "Jennifer Chen",
                "primary_contact_email": "jennifer.chen@globallogistics.com",
                "primary_contact_phone": "+1-555-0102",
                "relationship_manager_id": self.created_data["users"][2].id,  # Maria Rodriguez
                "tenant_id": self.created_data["tenants"][1].id
            },
            {
                "name": "Innovative Startups LLC",
                "type": "LLC",
                "industry": "Technology",
                "description": "Emerging technology startup specializing in AI",
                "website": "https://innovativestartups.com",
                "address": "789 Innovation Drive, Austin, TX 78701",
                "primary_contact_name": "Alex Thompson",
                "primary_contact_email": "alex.thompson@innovativestartups.com",
                "primary_contact_phone": "+1-555-0103",
                "relationship_manager_id": self.created_data["users"][1].id,
                "tenant_id": self.created_data["tenants"][0].id
            },
            {
                "name": "Healthcare Partners Inc",
                "type": "CORPORATION",
                "industry": "Healthcare",
                "description": "Healthcare technology and services provider",
                "website": "https://healthcarepartners.com",
                "address": "321 Medical Center Dr, Boston, MA 02101",
                "primary_contact_name": "Dr. Sarah Williams",
                "primary_contact_email": "sarah.williams@healthcarepartners.com",
                "primary_contact_phone": "+1-555-0104",
                "relationship_manager_id": self.created_data["users"][2].id,
                "tenant_id": self.created_data["tenants"][1].id
            },
            {
                "name": "Green Energy Solutions",
                "type": "CORPORATION",
                "industry": "Energy",
                "description": "Renewable energy development and consulting",
                "website": "https://greenenergysolutions.com",
                "address": "555 Solar Way, Denver, CO 80202",
                "primary_contact_name": "Michael Green",
                "primary_contact_email": "michael.green@greenenergysolutions.com",
                "primary_contact_phone": "+1-555-0105",
                "relationship_manager_id": self.created_data["users"][1].id,
                "tenant_id": self.created_data["tenants"][0].id
            }
        ]
        
        for client_data in clients_data:
            client = await self.prisma.client.create(data=client_data)
            self.created_data["clients"].append(client)
            logger.info(f"Created client: {client.name}")
    
    async def seed_contracts(self):
        """Seed contracts with various types and statuses"""
        contract_types = ["NDA", "SERVICE_AGREEMENT", "VENDOR", "LICENSING", "CONSULTING", "SOFTWARE_LICENSE"]
        contract_statuses = ["DRAFT", "UNDER_REVIEW", "PENDING_APPROVAL", "APPROVED", "EXECUTED", "ACTIVE"]
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        risk_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        
        # Generate contract numbers
        contract_number_counter = 1000
        
        contracts_data = []
        
        for i in range(25):  # Create 25 contracts
            client = random.choice(self.created_data["clients"])
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "EXTERNAL_COUNSEL"]])
            contract_type = random.choice(contract_types)
            status = random.choice(contract_statuses)
            
            # Generate realistic dates
            start_date = date.today() - timedelta(days=random.randint(0, 365))
            end_date = start_date + timedelta(days=random.randint(90, 1095))  # 3 months to 3 years
            expiry_date = end_date + timedelta(days=random.randint(0, 30))
            
            # Generate contract value
            contract_value = random.choice([None, Decimal(str(random.randint(10000, 5000000)))])
            
            # AI analysis data
            ai_risk_score = random.uniform(1.0, 10.0) if random.choice([True, False]) else None
            risk_level = random.choice(risk_levels) if ai_risk_score else None
            
            contract_data = {
                "contract_number": f"CON-2024-{contract_number_counter + i:04d}",
                "title": f"{contract_type.replace('_', ' ').title()} - {client.name}",
                "description": f"Comprehensive {contract_type.lower().replace('_', ' ')} agreement with {client.name}",
                "type": contract_type,
                "status": status,
                "priority": random.choice(priorities),
                "client_id": client.id,
                "counterparty_name": client.name,
                "counterparty_contact": client.primary_contact_email,
                "contract_value": float(contract_value) if contract_value else None,
                "currency": "USD",
                "start_date": start_date,
                "end_date": end_date,
                "expiry_date": expiry_date,
                "renewal_date": expiry_date + timedelta(days=365) if random.choice([True, False]) else None,
                "governing_law": random.choice(["New York", "California", "Delaware", "Texas"]),
                "jurisdiction": random.choice(["New York", "California", "Delaware", "Texas"]),
                "assigned_attorney_id": attorney.id,
                "responsible_team": random.choice(["Legal", "Contracts", "Compliance"]),
                "auto_renewal": random.choice([True, False]),
                "renewal_notice_days": random.choice([30, 60, 90]) if random.choice([True, False]) else None,
                "tags": random.sample(["high-value", "strategic", "vendor", "compliance", "ip-related", "international"], k=random.randint(1, 3)),
                "metadata": {
                    "created_via": "demo_seed",
                    "business_unit": random.choice(["Engineering", "Sales", "Marketing", "Operations"]),
                    "original_requestor": random.choice([u.email for u in self.created_data["users"]])
                },
                "ai_risk_score": ai_risk_score,
                "risk_level": risk_level,
                "ai_summary": f"AI analysis indicates {risk_level.lower() if risk_level else 'medium'} risk level for this {contract_type.lower().replace('_', ' ')} agreement." if ai_risk_score else None,
                "ai_key_terms": {
                    "payment_terms": "Net 30 days",
                    "termination_clause": "Either party may terminate with 30 days notice",
                    "liability_limit": "$1,000,000",
                    "intellectual_property": "Each party retains ownership of pre-existing IP"
                } if ai_risk_score else None,
                "ai_recommendations": [
                    "Review liability limitations carefully",
                    "Consider adding force majeure clause",
                    "Clarify data protection requirements"
                ] if ai_risk_score else None,
                "created_by": attorney.id,
                "last_analyzed_at": datetime.utcnow() if ai_risk_score else None
            }
            
            contracts_data.append(contract_data)
        
        # Create some specific high-profile contracts
        specific_contracts = [
            {
                "contract_number": "CON-2024-0001",
                "title": "Master Services Agreement - Acme Software Solutions",
                "description": "Comprehensive master services agreement covering all software development services",
                "type": "SERVICE_AGREEMENT",
                "status": "ACTIVE",
                "priority": "HIGH",
                "client_id": self.created_data["clients"][0].id,
                "counterparty_name": self.created_data["clients"][0].name,
                "counterparty_contact": self.created_data["clients"][0].primary_contact_email,
                "contract_value": 2500000.00,
                "currency": "USD",
                "start_date": date.today() - timedelta(days=180),
                "end_date": date.today() + timedelta(days=545),  # About 1.5 years from start
                "expiry_date": date.today() + timedelta(days=575),
                "governing_law": "California",
                "jurisdiction": "California",
                "assigned_attorney_id": self.created_data["users"][1].id,  # John Counsel
                "responsible_team": "Legal",
                "auto_renewal": True,
                "renewal_notice_days": 60,
                "tags": ["high-value", "strategic", "master-agreement"],
                "metadata": {
                    "created_via": "demo_seed",
                    "business_unit": "Engineering",
                    "contract_importance": "critical"
                },
                "ai_risk_score": 3.2,
                "risk_level": "MEDIUM",
                "ai_summary": "Well-structured master services agreement with standard commercial terms. Moderate risk level due to high contract value.",
                "ai_key_terms": {
                    "payment_terms": "Net 30 days, milestone-based payments",
                    "termination_clause": "Either party may terminate with 90 days notice",
                    "liability_limit": "$5,000,000 aggregate",
                    "intellectual_property": "Work product owned by client, background IP retained by service provider"
                },
                "ai_recommendations": [
                    "Consider adding performance benchmarks",
                    "Review data security requirements annually",
                    "Include specific SLA definitions"
                ],
                "created_by": self.created_data["users"][1].id,
                "last_analyzed_at": datetime.utcnow()
            },
            {
                "contract_number": "CON-2024-0002",
                "title": "Software License Agreement - Global Logistics Corp",
                "description": "Enterprise software licensing agreement for logistics management platform",
                "type": "SOFTWARE_LICENSE",
                "status": "EXECUTED",
                "priority": "HIGH",
                "client_id": self.created_data["clients"][1].id,
                "counterparty_name": self.created_data["clients"][1].name,
                "counterparty_contact": self.created_data["clients"][1].primary_contact_email,
                "contract_value": 850000.00,
                "currency": "USD",
                "start_date": date.today() - timedelta(days=90),
                "end_date": date.today() + timedelta(days=635),  # About 2 years from start
                "expiry_date": date.today() + timedelta(days=665),
                "governing_law": "New York",
                "jurisdiction": "New York",
                "assigned_attorney_id": self.created_data["users"][2].id,  # Maria Rodriguez
                "responsible_team": "Legal",
                "auto_renewal": False,
                "tags": ["software", "licensing", "enterprise"],
                "metadata": {
                    "created_via": "demo_seed",
                    "business_unit": "Operations",
                    "license_type": "enterprise"
                },
                "ai_risk_score": 6.7,
                "risk_level": "HIGH",
                "ai_summary": "Complex software licensing agreement with potential risks in termination and data migration clauses.",
                "ai_key_terms": {
                    "payment_terms": "Annual license fee, paid in advance",
                    "termination_clause": "Limited termination rights, 180 days notice required",
                    "liability_limit": "License fees paid in preceding 12 months",
                    "data_rights": "Limited data portability upon termination"
                },
                "ai_recommendations": [
                    "Negotiate better termination terms",
                    "Clarify data migration assistance",
                    "Add service level agreements",
                    "Review vendor escrow arrangements"
                ],
                "created_by": self.created_data["users"][2].id,
                "last_analyzed_at": datetime.utcnow()
            }
        ]
        
        # Add specific contracts to the list
        contracts_data.extend(specific_contracts)
        
        for contract_data in contracts_data:
            contract = await self.prisma.contract.create(data=contract_data)
            self.created_data["contracts"].append(contract)
            logger.info(f"Created contract: {contract.title}")
    
    async def seed_matters(self):
        """Seed legal matters"""
        matter_types = ["LITIGATION", "REGULATORY", "TRANSACTIONAL", "EMPLOYMENT", "IP_DISPUTE", "COMPLIANCE", "INVESTIGATION"]
        matter_statuses = ["ACTIVE", "ON_HOLD", "CLOSED", "PENDING"]
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        
        matters_data = []
        
        for i in range(15):  # Create 15 matters
            client = random.choice(self.created_data["clients"])
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "EXTERNAL_COUNSEL"]])
            matter_type = random.choice(matter_types)
            status = random.choice(matter_statuses)
            
            matter_data = {
                "matter_number": f"MAT-2024-{1000 + i:04d}",
                "title": f"{matter_type.replace('_', ' ').title()} Matter - {client.name}",
                "description": f"Legal matter involving {matter_type.lower().replace('_', ' ')} for {client.name}",
                "type": matter_type,
                "status": status,
                "priority": random.choice(priorities),
                "client_id": client.id,
                "responsible_attorney_id": attorney.id,
                "billing_rate": random.uniform(300.0, 800.0),
                "estimated_hours": random.randint(10, 500),
                "actual_hours": random.randint(0, 300) if status != "PENDING" else 0,
                "budget": random.uniform(25000.0, 500000.0),
                "start_date": date.today() - timedelta(days=random.randint(0, 365)),
                "target_completion_date": date.today() + timedelta(days=random.randint(30, 365)),
                "tags": random.sample(["urgent", "complex", "regulatory", "high-stakes", "confidential"], k=random.randint(1, 3)),
                "metadata": {
                    "created_via": "demo_seed",
                    "court_jurisdiction": random.choice(["Federal", "State", "International"]) if matter_type == "LITIGATION" else None,
                    "regulatory_body": random.choice(["SEC", "FTC", "FDA", "DOJ"]) if matter_type == "REGULATORY" else None
                },
                "created_by": attorney.id
            }
            
            matters_data.append(matter_data)
        
        for matter_data in matters_data:
            matter = await self.prisma.matter.create(data=matter_data)
            self.created_data["matters"] = getattr(self.created_data, "matters", [])
            self.created_data["matters"].append(matter)
            logger.info(f"Created matter: {matter.title}")
    
    async def seed_ip_assets(self):
        """Seed intellectual property assets"""
        ip_types = ["PATENT", "TRADEMARK", "COPYRIGHT", "TRADE_SECRET"]
        ip_statuses = ["PENDING", "ACTIVE", "EXPIRED", "ABANDONED"]
        
        ip_assets_data = []
        
        for i in range(12):  # Create 12 IP assets
            owner_client = random.choice(self.created_data["clients"])
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "EXTERNAL_COUNSEL"]])
            ip_type = random.choice(ip_types)
            status = random.choice(ip_statuses)
            
            ip_data = {
                "name": f"{ip_type.title()} Asset {i+1} - {owner_client.name}",
                "type": ip_type,
                "status": status,
                "description": f"Valuable {ip_type.lower()} asset for {owner_client.name}",
                "owner_id": owner_client.id,
                "registration_number": f"{ip_type[:2]}{random.randint(1000000, 9999999)}" if status == "ACTIVE" else None,
                "application_date": date.today() - timedelta(days=random.randint(0, 730)),
                "registration_date": date.today() - timedelta(days=random.randint(0, 365)) if status == "ACTIVE" else None,
                "expiry_date": date.today() + timedelta(days=random.randint(365, 7300)) if status == "ACTIVE" else None,  # 1-20 years
                "jurisdiction": random.choice(["US", "EU", "JP", "CN", "International"]),
                "responsible_attorney_id": attorney.id,
                "tags": random.sample(["high-value", "strategic", "defensive", "licensing", "core-tech"], k=random.randint(1, 3)),
                "metadata": {
                    "created_via": "demo_seed",
                    "technology_area": random.choice(["Software", "Hardware", "Biotech", "AI/ML", "Fintech"]),
                    "commercial_value": random.choice(["High", "Medium", "Low"])
                },
                "created_by": attorney.id
            }
            
            ip_assets_data.append(ip_data)
        
        for ip_data in ip_assets_data:
            ip_asset = await self.prisma.ipasset.create(data=ip_data)
            self.created_data["ip_assets"] = getattr(self.created_data, "ip_assets", [])
            self.created_data["ip_assets"].append(ip_asset)
            logger.info(f"Created IP asset: {ip_asset.name}")
    
    async def seed_documents(self):
        """Seed documents associated with contracts and matters"""
        document_types = ["CONTRACT", "AMENDMENT", "EXHIBIT", "CORRESPONDENCE", "LEGAL_MEMO", "FILING", "EVIDENCE"]
        document_statuses = ["DRAFT", "UNDER_REVIEW", "APPROVED", "EXECUTED", "ARCHIVED"]
        
        documents_data = []
        
        # Documents for contracts
        for contract in self.created_data["contracts"][:10]:  # First 10 contracts
            for i in range(random.randint(1, 4)):  # 1-4 documents per contract
                doc_data = {
                    "title": f"{random.choice(document_types).replace('_', ' ').title()} - {contract.title}",
                    "type": random.choice(document_types),
                    "status": random.choice(document_statuses),
                    "description": f"Legal document related to {contract.title}",
                    "file_name": f"document_{len(documents_data)+1}.pdf",
                    "file_path": f"/documents/contracts/{contract.id}/document_{len(documents_data)+1}.pdf",
                    "file_size": random.randint(50000, 5000000),  # 50KB to 5MB
                    "mime_type": "application/pdf",
                    "contract_id": contract.id,
                    "version": 1,
                    "is_template": False,
                    "requires_signature": random.choice([True, False]),
                    "tags": random.sample(["confidential", "executed", "template", "amendment"], k=random.randint(1, 2)),
                    "metadata": {
                        "created_via": "demo_seed",
                        "document_category": random.choice(["Primary", "Supporting", "Reference"])
                    },
                    "uploaded_by": contract.assigned_attorney_id
                }
                documents_data.append(doc_data)
        
        # Documents for matters
        if hasattr(self.created_data, "matters"):
            for matter in self.created_data["matters"][:8]:  # First 8 matters
                for i in range(random.randint(1, 3)):  # 1-3 documents per matter
                    doc_data = {
                        "title": f"{random.choice(document_types).replace('_', ' ').title()} - {matter.title}",
                        "type": random.choice(document_types),
                        "status": random.choice(document_statuses),
                        "description": f"Legal document related to {matter.title}",
                        "file_name": f"matter_document_{len(documents_data)+1}.pdf",
                        "file_path": f"/documents/matters/{matter.id}/document_{len(documents_data)+1}.pdf",
                        "file_size": random.randint(50000, 5000000),
                        "mime_type": "application/pdf",
                        "matter_id": matter.id,
                        "version": 1,
                        "is_template": False,
                        "requires_signature": random.choice([True, False]),
                        "tags": random.sample(["confidential", "evidence", "filing", "correspondence"], k=random.randint(1, 2)),
                        "metadata": {
                            "created_via": "demo_seed",
                            "document_category": random.choice(["Evidence", "Filing", "Correspondence"])
                        },
                        "uploaded_by": matter.responsible_attorney_id
                    }
                    documents_data.append(doc_data)
        
        for doc_data in documents_data:
            document = await self.prisma.document.create(data=doc_data)
            self.created_data["documents"].append(document)
            logger.info(f"Created document: {document.title}")
    
    async def seed_tasks(self):
        """Seed tasks for contracts and matters"""
        task_types = ["REVIEW", "APPROVAL", "SIGNATURE", "FILING", "NEGOTIATION", "RESEARCH", "COMPLIANCE_CHECK", "DUE_DILIGENCE"]
        task_statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "OVERDUE"]
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        
        tasks_data = []
        
        # Tasks for contracts
        for contract in self.created_data["contracts"][:12]:  # First 12 contracts
            for i in range(random.randint(1, 3)):  # 1-3 tasks per contract
                assignee = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "LEGAL_OPS", "EXTERNAL_COUNSEL"]])
                task_type = random.choice(task_types)
                status = random.choice(task_statuses)
                
                # Calculate dates
                created_date = datetime.utcnow() - timedelta(days=random.randint(0, 90))
                due_date = created_date + timedelta(days=random.randint(1, 30))
                completed_date = due_date - timedelta(days=random.randint(0, 5)) if status == "COMPLETED" else None
                
                task_data = {
                    "title": f"{task_type.replace('_', ' ').title()} - {contract.title}",
                    "description": f"Task to {task_type.lower().replace('_', ' ')} for contract {contract.title}",
                    "type": task_type,
                    "status": status,
                    "priority": random.choice(priorities),
                    "assignee_id": assignee.id,
                    "contract_id": contract.id,
                    "due_date": due_date,
                    "estimated_hours": random.randint(1, 20),
                    "actual_hours": random.randint(1, 25) if status == "COMPLETED" else None,
                    "tags": random.sample(["urgent", "review", "approval", "client-facing"], k=random.randint(1, 2)),
                    "metadata": {
                        "created_via": "demo_seed",
                        "task_category": "Contract Management"
                    },
                    "created_by": contract.assigned_attorney_id,
                    "created_at": created_date,
                    "completed_at": completed_date
                }
                tasks_data.append(task_data)
        
        # Tasks for matters
        if hasattr(self.created_data, "matters"):
            for matter in self.created_data["matters"][:8]:  # First 8 matters
                for i in range(random.randint(1, 2)):  # 1-2 tasks per matter
                    assignee = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "LEGAL_OPS", "EXTERNAL_COUNSEL"]])
                    task_type = random.choice(task_types)
                    status = random.choice(task_statuses)
                    
                    created_date = datetime.utcnow() - timedelta(days=random.randint(0, 60))
                    due_date = created_date + timedelta(days=random.randint(1, 45))
                    completed_date = due_date - timedelta(days=random.randint(0, 5)) if status == "COMPLETED" else None
                    
                    task_data = {
                        "title": f"{task_type.replace('_', ' ').title()} - {matter.title}",
                        "description": f"Task to {task_type.lower().replace('_', ' ')} for matter {matter.title}",
                        "type": task_type,
                        "status": status,
                        "priority": random.choice(priorities),
                        "assignee_id": assignee.id,
                        "matter_id": matter.id,
                        "due_date": due_date,
                        "estimated_hours": random.randint(2, 40),
                        "actual_hours": random.randint(2, 50) if status == "COMPLETED" else None,
                        "tags": random.sample(["litigation", "research", "filing", "deadline"], k=random.randint(1, 2)),
                        "metadata": {
                            "created_via": "demo_seed",
                            "task_category": "Matter Management"
                        },
                        "created_by": matter.responsible_attorney_id,
                        "created_at": created_date,
                        "completed_at": completed_date
                    }
                    tasks_data.append(task_data)
        
        for task_data in tasks_data:
            task = await self.prisma.task.create(data=task_data)
            self.created_data["tasks"].append(task)
            logger.info(f"Created task: {task.title}")
    
    async def seed_privacy_assessments(self):
        """Seed privacy impact assessments"""
        assessment_statuses = ["DRAFT", "UNDER_REVIEW", "APPROVED", "REQUIRES_UPDATES"]
        risk_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        
        assessments_data = []
        
        for i in range(8):  # Create 8 privacy assessments
            client = random.choice(self.created_data["clients"])
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "LEGAL_OPS"]])
            
            assessment_data = {
                "title": f"Privacy Impact Assessment - {client.name} Data Processing",
                "description": f"Comprehensive privacy impact assessment for data processing activities at {client.name}",
                "status": random.choice(assessment_statuses),
                "client_id": client.id,
                "data_types": random.sample([
                    "Personal Identifiers", "Financial Data", "Health Information", 
                    "Location Data", "Behavioral Data", "Biometric Data"
                ], k=random.randint(2, 4)),
                "processing_purposes": random.sample([
                    "Service Delivery", "Marketing", "Analytics", "Compliance", 
                    "Customer Support", "Product Improvement"
                ], k=random.randint(2, 3)),
                "data_subjects": random.sample([
                    "Customers", "Employees", "Partners", "Vendors", "Website Visitors"
                ], k=random.randint(1, 3)),
                "legal_basis": random.choice([
                    "Consent", "Contract", "Legal Obligation", "Legitimate Interest", "Vital Interest"
                ]),
                "retention_period": f"{random.randint(1, 7)} years",
                "risk_level": random.choice(risk_levels),
                "mitigation_measures": [
                    "Data encryption in transit and at rest",
                    "Access controls and authentication",
                    "Regular security audits",
                    "Employee training on data protection"
                ],
                "compliance_frameworks": random.sample(["GDPR", "CCPA", "HIPAA", "SOX"], k=random.randint(1, 2)),
                "responsible_person_id": attorney.id,
                "review_date": date.today() + timedelta(days=random.randint(90, 365)),
                "metadata": {
                    "created_via": "demo_seed",
                    "assessment_type": "Standard",
                    "scope": random.choice(["Organization-wide", "Department-specific", "Project-specific"])
                },
                "created_by": attorney.id
            }
            assessments_data.append(assessment_data)
        
        for assessment_data in assessments_data:
            assessment = await self.prisma.privacyimpactassessment.create(data=assessment_data)
            logger.info(f"Created privacy assessment: {assessment.title}")
    
    async def seed_risk_events(self):
        """Seed risk events and compliance items"""
        risk_types = ["OPERATIONAL", "LEGAL", "FINANCIAL", "REPUTATIONAL", "REGULATORY", "CYBERSECURITY"]
        risk_statuses = ["OPEN", "IN_PROGRESS", "MITIGATED", "CLOSED"]
        impact_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        
        risk_events_data = []
        
        for i in range(10):  # Create 10 risk events
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "LEGAL_OPS"]])
            client = random.choice(self.created_data["clients"])
            
            risk_data = {
                "title": f"{random.choice(risk_types).title()} Risk - {client.name}",
                "description": f"Risk event identified in relation to {client.name} operations",
                "type": random.choice(risk_types),
                "status": random.choice(risk_statuses),
                "impact_level": random.choice(impact_levels),
                "probability": random.choice(["LOW", "MEDIUM", "HIGH"]),
                "client_id": client.id,
                "identified_date": date.today() - timedelta(days=random.randint(0, 180)),
                "target_resolution_date": date.today() + timedelta(days=random.randint(30, 180)),
                "mitigation_actions": [
                    "Implement additional controls",
                    "Regular monitoring and review",
                    "Staff training and awareness",
                    "Update policies and procedures"
                ],
                "responsible_person_id": attorney.id,
                "tags": random.sample(["urgent", "compliance", "regulatory", "high-impact"], k=random.randint(1, 2)),
                "metadata": {
                    "created_via": "demo_seed",
                    "risk_category": random.choice(["Strategic", "Operational", "Compliance"]),
                    "escalation_level": random.choice(["Department", "Executive", "Board"])
                },
                "created_by": attorney.id
            }
            risk_events_data.append(risk_data)
        
        for risk_data in risk_events_data:
            risk_event = await self.prisma.riskevent.create(data=risk_data)
            logger.info(f"Created risk event: {risk_event.title}")
    
    async def seed_compliance_items(self):
        """Seed compliance monitoring items"""
        compliance_statuses = ["COMPLIANT", "NON_COMPLIANT", "UNDER_REVIEW", "REQUIRES_ACTION"]
        
        compliance_data = []
        
        frameworks = ["GDPR", "CCPA", "HIPAA", "SOX", "PCI_DSS", "ISO27001"]
        
        for framework in frameworks:
            for i in range(3):  # 3 items per framework
                attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "LEGAL_OPS"]])
                
                item_data = {
                    "title": f"{framework} Compliance - Requirement {i+1}",
                    "description": f"Compliance monitoring for {framework} requirement {i+1}",
                    "framework": framework,
                    "status": random.choice(compliance_statuses),
                    "requirement_reference": f"{framework}-{random.randint(100, 999)}",
                    "last_assessment_date": date.today() - timedelta(days=random.randint(0, 90)),
                    "next_assessment_date": date.today() + timedelta(days=random.randint(90, 365)),
                    "responsible_person_id": attorney.id,
                    "evidence_required": [
                        "Policy documentation",
                        "Training records",
                        "Audit findings",
                        "Implementation evidence"
                    ],
                    "compliance_notes": f"Regular monitoring required for {framework} compliance",
                    "metadata": {
                        "created_via": "demo_seed",
                        "criticality": random.choice(["High", "Medium", "Low"]),
                        "automation_level": random.choice(["Manual", "Semi-automated", "Automated"])
                    },
                    "created_by": attorney.id
                }
                compliance_data.append(item_data)
        
        for item_data in compliance_data:
            compliance_item = await self.prisma.complianceitem.create(data=item_data)
            logger.info(f"Created compliance item: {compliance_item.title}")
    
    async def seed_disputes(self):
        """Seed dispute and litigation cases"""
        dispute_types = ["CONTRACT_DISPUTE", "IP_INFRINGEMENT", "EMPLOYMENT", "REGULATORY", "COMMERCIAL", "PERSONAL_INJURY"]
        dispute_statuses = ["ACTIVE", "SETTLED", "DISMISSED", "PENDING_APPEAL", "CLOSED"]
        
        disputes_data = []
        
        for i in range(6):  # Create 6 disputes
            client = random.choice(self.created_data["clients"])
            attorney = random.choice([u for u in self.created_data["users"] if u.role in ["IN_HOUSE_COUNSEL", "EXTERNAL_COUNSEL"]])
            
            dispute_data = {
                "case_number": f"CASE-2024-{1000 + i:04d}",
                "title": f"{random.choice(dispute_types).replace('_', ' ').title()} - {client.name}",
                "description": f"Legal dispute involving {client.name}",
                "type": random.choice(dispute_types),
                "status": random.choice(dispute_statuses),
                "client_id": client.id,
                "opposing_party": f"Opposing Party {i+1} Corp",
                "court_jurisdiction": random.choice(["Federal District Court", "State Court", "Appellate Court", "Arbitration"]),
                "case_value": random.uniform(50000.0, 10000000.0),
                "filing_date": date.today() - timedelta(days=random.randint(30, 730)),
                "target_resolution_date": date.today() + timedelta(days=random.randint(90, 730)),
                "lead_attorney_id": attorney.id,
                "external_counsel": "External Law Firm LLP" if random.choice([True, False]) else None,
                "case_summary": f"Dispute regarding commercial matters between {client.name} and opposing party",
                "key_issues": [
                    "Breach of contract claims",
                    "Damage calculations",
                    "Liability determinations",
                    "Settlement negotiations"
                ],
                "litigation_hold": random.choice([True, False]),
                "metadata": {
                    "created_via": "demo_seed",
                    "case_complexity": random.choice(["Simple", "Moderate", "Complex"]),
                    "media_attention": random.choice(["None", "Low", "Medium", "High"])
                },
                "created_by": attorney.id
            }
            disputes_data.append(dispute_data)
        
        for dispute_data in disputes_data:
            dispute = await self.prisma.dispute.create(data=dispute_data)
            logger.info(f"Created dispute: {dispute.title}")
    
    async def seed_notifications(self):
        """Seed notifications for users"""
        notification_types = [
            "CONTRACT_EXPIRY_WARNING", "CONTRACT_APPROVAL_REQUIRED", "TASK_ASSIGNED", 
            "DOCUMENT_REQUIRES_SIGNATURE", "MATTER_DEADLINE_APPROACHING", "COMPLIANCE_ALERT"
        ]
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        
        notifications_data = []
        
        # Create notifications for each user
        for user in self.created_data["users"][:5]:  # First 5 users
            for i in range(random.randint(3, 8)):  # 3-8 notifications per user
                notification_type = random.choice(notification_types)
                priority = random.choice(priorities)
                
                # Select related entity based on notification type
                related_entity_id = None
                related_entity_type = None
                action_url = None
                
                if "CONTRACT" in notification_type and self.created_data["contracts"]:
                    contract = random.choice(self.created_data["contracts"])
                    related_entity_id = contract.id
                    related_entity_type = "contract"
                    action_url = f"/contracts/{contract.id}"
                elif "TASK" in notification_type and self.created_data["tasks"]:
                    task = random.choice(self.created_data["tasks"])
                    related_entity_id = task.id
                    related_entity_type = "task"
                    action_url = f"/tasks/{task.id}"
                elif "MATTER" in notification_type and hasattr(self.created_data, "matters"):
                    matter = random.choice(self.created_data["matters"])
                    related_entity_id = matter.id
                    related_entity_type = "matter"
                    action_url = f"/matters/{matter.id}"
                
                notification_data = {
                    "user_id": user.id,
                    "type": notification_type,
                    "title": f"{notification_type.replace('_', ' ').title()}",
                    "message": f"Demo notification for {notification_type.lower().replace('_', ' ')}",
                    "priority": priority,
                    "related_entity_id": related_entity_id,
                    "related_entity_type": related_entity_type,
                    "action_url": action_url,
                    "is_read": random.choice([True, False]),
                    "metadata": {
                        "created_via": "demo_seed",
                        "notification_category": "System Generated"
                    },
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
                }
                
                notifications_data.append(notification_data)
        
        for notification_data in notifications_data:
            notification = await self.prisma.notification.create(data=notification_data)
            self.created_data["notifications"].append(notification)
            logger.info(f"Created notification: {notification.title}")
    
    async def print_summary(self):
        """Print summary of created demo data"""
        summary = "\n" + "="*60
        summary += "\n🎯 COUNSELFLOW ULTIMATE V3 - DEMO DATA SUMMARY"
        summary += "\n" + "="*60
        
        for entity_type, entities in self.created_data.items():
            if entities:
                summary += f"\n📊 {entity_type.upper().replace('_', ' ')}: {len(entities)} created"
        
        summary += "\n" + "-"*60
        summary += "\n🔐 TEST USER CREDENTIALS:"
        summary += "\n" + "-"*60
        
        for user in self.created_data["users"]:
            # Extract password from description (this is just for demo)
            role_passwords = {
                "ADMIN": "admin123",
                "IN_HOUSE_COUNSEL": "counsel123" if "john" in user.email.lower() else "lawyer123",
                "LEGAL_OPS": "ops123",
                "EXTERNAL_COUNSEL": "external123",
                "BUSINESS_STAKEHOLDER": "business123" if "mike" in user.email.lower() else "stakeholder123"
            }
            password = role_passwords.get(user.role, "default123")
            summary += f"\n👤 {user.email} | {user.role} | Password: {password}"
        
        summary += "\n" + "-"*60
        summary += "\n📈 DEMO SCENARIOS AVAILABLE:"
        summary += "\n" + "-"*60
        summary += "\n• Contract lifecycle management with AI analysis"
        summary += "\n• Multi-tenant legal operations"
        summary += "\n• IP portfolio management"
        summary += "\n• Privacy impact assessments"
        summary += "\n• Risk and compliance monitoring"
        summary += "\n• Dispute and litigation tracking"
        summary += "\n• Document management and workflows"
        summary += "\n• Task assignment and tracking"
        summary += "\n• Real-time notifications"
        
        summary += "\n" + "="*60
        summary += "\n🚀 Ready for testing and demonstration!"
        summary += "\n" + "="*60
        
        print(summary)
        logger.info("Demo data summary printed")


async def main():
    """Main function to run the demo data seeder"""
    print("🌟 CounselFlow Ultimate V3 - Demo Data Seeder")
    print("=" * 60)
    
    seeder = DemoDataSeeder()
    await seeder.seed_all_data()


if __name__ == "__main__":
    asyncio.run(main())