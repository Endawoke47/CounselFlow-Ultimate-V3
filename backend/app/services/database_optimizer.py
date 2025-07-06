"""
CounselFlow Ultimate V3 - Database Performance Optimization Service
"""

import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, inspect
from sqlalchemy.sql import Select
from sqlalchemy.pool import Pool
import time

from app.core.database import get_db_session, engine, get_prisma_client
from app.core.redis import get_cache_manager

logger = structlog.get_logger()


class DatabaseOptimizer:
    """Database performance optimization and monitoring service"""
    
    def __init__(self):
        self.slow_query_threshold = 1.0  # seconds
        self.query_cache_ttl = 300  # 5 minutes
        self.performance_metrics = {}
    
    async def analyze_query_performance(self, query: str, params: Dict = None) -> Dict[str, Any]:
        """Analyze query performance and provide optimization suggestions"""
        start_time = time.time()
        
        try:
            async with get_db_session() as session:
                # Execute EXPLAIN ANALYZE
                explain_query = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query}"
                result = await session.execute(text(explain_query), params or {})
                explain_data = result.fetchone()[0]
                
                execution_time = time.time() - start_time
                
                analysis = {
                    "query": query,
                    "execution_time": execution_time,
                    "explain_plan": explain_data,
                    "is_slow": execution_time > self.slow_query_threshold,
                    "suggestions": self._generate_optimization_suggestions(explain_data, execution_time),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Log slow queries
                if execution_time > self.slow_query_threshold:
                    logger.warning(
                        "Slow query detected",
                        query=query[:200],
                        execution_time=execution_time,
                        suggestions=analysis["suggestions"]
                    )
                
                return analysis
                
        except Exception as e:
            logger.error("Query analysis failed", query=query[:100], error=str(e))
            return {"error": str(e), "execution_time": time.time() - start_time}
    
    def _generate_optimization_suggestions(self, explain_data: List[Dict], execution_time: float) -> List[str]:
        """Generate optimization suggestions based on explain plan"""
        suggestions = []
        
        try:
            plan = explain_data[0]["Plan"]
            
            # Check for sequential scans
            if self._has_sequential_scan(plan):
                suggestions.append("Consider adding indexes for sequential scans")
            
            # Check for high cost operations
            if plan.get("Total Cost", 0) > 1000:
                suggestions.append("Query has high cost - consider optimization")
            
            # Check for nested loops with high row estimates
            if self._has_expensive_nested_loops(plan):
                suggestions.append("Expensive nested loops detected - consider joins optimization")
            
            # Check execution time
            if execution_time > 5.0:
                suggestions.append("Very slow query - consider query rewrite or caching")
            elif execution_time > self.slow_query_threshold:
                suggestions.append("Slow query - monitor and optimize if frequent")
            
            # Check buffer usage
            if plan.get("Shared Hit Blocks", 0) < plan.get("Shared Read Blocks", 0):
                suggestions.append("Low buffer cache hit ratio - query may benefit from more frequent execution")
                
        except Exception as e:
            logger.error("Failed to generate suggestions", error=str(e))
            suggestions.append("Unable to analyze query plan")
        
        return suggestions
    
    def _has_sequential_scan(self, plan: Dict) -> bool:
        """Check if plan contains sequential scans"""
        if plan.get("Node Type") == "Seq Scan":
            return True
        
        for child in plan.get("Plans", []):
            if self._has_sequential_scan(child):
                return True
        
        return False
    
    def _has_expensive_nested_loops(self, plan: Dict) -> bool:
        """Check for expensive nested loop joins"""
        if (plan.get("Node Type") == "Nested Loop" and 
            plan.get("Plan Rows", 0) > 10000):
            return True
        
        for child in plan.get("Plans", []):
            if self._has_expensive_nested_loops(child):
                return True
        
        return False
    
    async def get_connection_pool_stats(self) -> Dict[str, Any]:
        """Get database connection pool statistics"""
        try:
            if not engine:
                return {"status": "not_initialized"}
            
            pool: Pool = engine.pool
            
            stats = {
                "pool_size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid(),
                "total_connections": pool.size() + pool.overflow(),
                "utilization_percent": round(
                    (pool.checkedout() / (pool.size() + pool.overflow())) * 100, 2
                ) if (pool.size() + pool.overflow()) > 0 else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Add health indicators
            stats["health_status"] = "healthy"
            if stats["utilization_percent"] > 80:
                stats["health_status"] = "warning"
                stats["warning"] = "High connection pool utilization"
            elif stats["utilization_percent"] > 95:
                stats["health_status"] = "critical"
                stats["warning"] = "Critical connection pool utilization"
            
            return stats
            
        except Exception as e:
            logger.error("Failed to get connection pool stats", error=str(e))
            return {"status": "error", "error": str(e)}
    
    async def analyze_table_statistics(self) -> Dict[str, Any]:
        """Analyze database table statistics and sizes"""
        try:
            async with get_db_session() as session:
                # Get table sizes
                table_sizes_query = """
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
                    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
                """
                
                result = await session.execute(text(table_sizes_query))
                table_stats = [dict(row._mapping) for row in result]
                
                # Get index usage statistics
                index_usage_query = """
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes
                ORDER BY idx_scan DESC;
                """
                
                result = await session.execute(text(index_usage_query))
                index_stats = [dict(row._mapping) for row in result]
                
                # Get table access statistics
                table_access_query = """
                SELECT 
                    schemaname,
                    tablename,
                    seq_scan,
                    seq_tup_read,
                    idx_scan,
                    idx_tup_fetch,
                    n_tup_ins,
                    n_tup_upd,
                    n_tup_del,
                    n_tup_hot_upd
                FROM pg_stat_user_tables
                ORDER BY seq_scan + idx_scan DESC;
                """
                
                result = await session.execute(text(table_access_query))
                access_stats = [dict(row._mapping) for row in result]
                
                return {
                    "table_sizes": table_stats,
                    "index_usage": index_stats,
                    "table_access": access_stats,
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                    "recommendations": self._generate_table_recommendations(table_stats, index_stats, access_stats)
                }
                
        except Exception as e:
            logger.error("Failed to analyze table statistics", error=str(e))
            return {"status": "error", "error": str(e)}
    
    def _generate_table_recommendations(
        self, 
        table_stats: List[Dict], 
        index_stats: List[Dict], 
        access_stats: List[Dict]
    ) -> List[str]:
        """Generate recommendations based on table statistics"""
        recommendations = []
        
        try:
            # Check for large tables
            for table in table_stats[:5]:  # Top 5 largest tables
                if table['size_bytes'] > 100 * 1024 * 1024:  # > 100MB
                    recommendations.append(
                        f"Table {table['tablename']} is large ({table['size']}) - "
                        "consider partitioning or archiving old data"
                    )
            
            # Check for unused indexes
            unused_indexes = [idx for idx in index_stats if idx['idx_scan'] == 0]
            if unused_indexes:
                recommendations.append(
                    f"Found {len(unused_indexes)} unused indexes - consider dropping to save space"
                )
            
            # Check for tables with high sequential scan ratio
            for table in access_stats:
                total_scans = (table['seq_scan'] or 0) + (table['idx_scan'] or 0)
                if total_scans > 100:  # Only consider frequently accessed tables
                    seq_ratio = (table['seq_scan'] or 0) / total_scans
                    if seq_ratio > 0.3:  # More than 30% sequential scans
                        recommendations.append(
                            f"Table {table['tablename']} has high sequential scan ratio "
                            f"({seq_ratio:.1%}) - consider adding indexes"
                        )
            
        except Exception as e:
            logger.error("Failed to generate table recommendations", error=str(e))
            recommendations.append("Unable to analyze table statistics")
        
        return recommendations
    
    async def optimize_queries_with_cache(self, operation_type: str = "read") -> Dict[str, Any]:
        """Implement intelligent query caching strategies"""
        try:
            cache_manager = await get_cache_manager()
            
            # Cache configuration by operation type
            cache_configs = {
                "read": {"ttl": 300, "prefix": "query_cache:read:"},
                "aggregate": {"ttl": 600, "prefix": "query_cache:agg:"},
                "report": {"ttl": 1800, "prefix": "query_cache:report:"}
            }
            
            config = cache_configs.get(operation_type, cache_configs["read"])
            
            # Get cache statistics
            cache_stats = {
                "operation_type": operation_type,
                "ttl": config["ttl"],
                "prefix": config["prefix"],
                "recommendations": [
                    f"Use caching for {operation_type} operations with {config['ttl']}s TTL",
                    "Implement cache warming for frequently accessed data",
                    "Use cache versioning for data consistency"
                ]
            }
            
            return cache_stats
            
        except Exception as e:
            logger.error("Failed to optimize query caching", error=str(e))
            return {"status": "error", "error": str(e)}
    
    async def monitor_database_performance(self) -> Dict[str, Any]:
        """Comprehensive database performance monitoring"""
        try:
            # Collect multiple performance metrics
            pool_stats = await self.get_connection_pool_stats()
            table_stats = await self.analyze_table_statistics()
            
            # Get active query statistics
            async with get_db_session() as session:
                active_queries_query = """
                SELECT 
                    COUNT(*) as total_active,
                    COUNT(*) FILTER (WHERE state = 'active') as active,
                    COUNT(*) FILTER (WHERE state = 'idle') as idle,
                    COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
                    AVG(EXTRACT(EPOCH FROM (now() - query_start))) as avg_query_duration
                FROM pg_stat_activity 
                WHERE datname = current_database();
                """
                
                result = await session.execute(text(active_queries_query))
                query_stats = dict(result.fetchone()._mapping)
                
                # Get database size
                db_size_query = """
                SELECT pg_size_pretty(pg_database_size(current_database())) as database_size,
                       pg_database_size(current_database()) as database_size_bytes;
                """
                
                result = await session.execute(text(db_size_query))
                db_size = dict(result.fetchone()._mapping)
            
            # Compile comprehensive report
            performance_report = {
                "timestamp": datetime.utcnow().isoformat(),
                "connection_pool": pool_stats,
                "active_queries": query_stats,
                "database_size": db_size,
                "table_analysis": {
                    "table_count": len(table_stats.get("table_sizes", [])),
                    "largest_table": table_stats.get("table_sizes", [{}])[0] if table_stats.get("table_sizes") else None,
                    "recommendations": table_stats.get("recommendations", [])
                },
                "overall_health": self._calculate_overall_health(pool_stats, query_stats),
                "optimization_suggestions": self._generate_performance_suggestions(pool_stats, query_stats, table_stats)
            }
            
            return performance_report
            
        except Exception as e:
            logger.error("Failed to monitor database performance", error=str(e))
            return {"status": "error", "error": str(e)}
    
    def _calculate_overall_health(self, pool_stats: Dict, query_stats: Dict) -> str:
        """Calculate overall database health score"""
        try:
            health_score = 100
            
            # Penalize high connection pool utilization
            utilization = pool_stats.get("utilization_percent", 0)
            if utilization > 80:
                health_score -= (utilization - 80) * 2
            
            # Penalize long-running queries
            avg_duration = query_stats.get("avg_query_duration", 0) or 0
            if avg_duration > 1.0:
                health_score -= min(avg_duration * 10, 30)
            
            # Penalize idle in transaction connections
            idle_in_transaction = query_stats.get("idle_in_transaction", 0) or 0
            if idle_in_transaction > 5:
                health_score -= idle_in_transaction * 5
            
            health_score = max(0, health_score)
            
            if health_score >= 90:
                return "excellent"
            elif health_score >= 70:
                return "good"
            elif health_score >= 50:
                return "warning"
            else:
                return "critical"
                
        except Exception:
            return "unknown"
    
    def _generate_performance_suggestions(
        self, 
        pool_stats: Dict, 
        query_stats: Dict, 
        table_stats: Dict
    ) -> List[str]:
        """Generate performance improvement suggestions"""
        suggestions = []
        
        try:
            # Connection pool suggestions
            utilization = pool_stats.get("utilization_percent", 0)
            if utilization > 80:
                suggestions.append("Consider increasing connection pool size")
            
            # Query performance suggestions
            avg_duration = query_stats.get("avg_query_duration", 0) or 0
            if avg_duration > 2.0:
                suggestions.append("Average query time is high - analyze slow queries")
            
            # Idle connection suggestions
            idle_in_transaction = query_stats.get("idle_in_transaction", 0) or 0
            if idle_in_transaction > 5:
                suggestions.append("High number of idle in transaction connections - check application connection handling")
            
            # Add table-specific suggestions
            table_recommendations = table_stats.get("recommendations", [])
            suggestions.extend(table_recommendations[:3])  # Limit to top 3
            
            # General suggestions
            suggestions.extend([
                "Regularly run VACUUM and ANALYZE on large tables",
                "Monitor and optimize frequently executed queries",
                "Implement query result caching for read-heavy operations"
            ])
            
        except Exception as e:
            logger.error("Failed to generate performance suggestions", error=str(e))
            suggestions.append("Unable to generate specific suggestions")
        
        return suggestions[:10]  # Limit to 10 suggestions
    
    async def create_optimized_indexes(self) -> Dict[str, Any]:
        """Create performance-optimized indexes based on query patterns"""
        try:
            indexes_created = []
            
            async with get_db_session() as session:
                # Define high-impact indexes based on common query patterns
                performance_indexes = [
                    # User authentication and lookup optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_status ON "User" (email, status) WHERE "deletedAt" IS NULL;',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_department ON "User" (role, department) WHERE status = \'ACTIVE\';',
                    
                    # Contract management optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_client_status_date ON "Contract" ("clientId", status, "createdAt");',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_expiry_alert ON "Contract" ("expirationDate", status) WHERE "expirationDate" > NOW();',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_risk_analysis ON "Contract" ("aiRiskScore", "riskLevel") WHERE "aiRiskScore" IS NOT NULL;',
                    
                    # Matter management optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matters_assignee_status ON "Matter" ("assigneeId", status, priority);',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matters_client_active ON "Matter" ("clientId", status) WHERE "deletedAt" IS NULL;',
                    
                    # Document search optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_type_date ON "Document" (type, "createdAt" DESC);',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_content_search ON "Document" USING gin(to_tsvector(\'english\', title || \' \' || COALESCE(content, \'\')));',
                    
                    # Task and timeline optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assignee_due ON "Task" ("assigneeId", "dueDate") WHERE status != \'COMPLETED\';',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_entity ON "TimelineEvent" ("entityType", "entityId", "createdAt" DESC);',
                    
                    # Audit and compliance optimizations
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_date ON "AuditLog" ("userId", "timestamp" DESC);',
                    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity_action ON "AuditLog" ("entityType", "entityId", action);',
                ]
                
                for index_sql in performance_indexes:
                    try:
                        await session.execute(text(index_sql))
                        await session.commit()
                        
                        index_name = index_sql.split("idx_")[1].split()[0] if "idx_" in index_sql else "unknown"
                        indexes_created.append(index_name)
                        
                        logger.info("Created performance index", index=index_name)
                        
                    except Exception as e:
                        # Index might already exist or there might be a conflict
                        logger.debug("Index creation skipped", sql=index_sql[:100], error=str(e))
                        await session.rollback()
            
            return {
                "status": "completed",
                "indexes_created": indexes_created,
                "total_indexes": len(indexes_created),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to create optimized indexes", error=str(e))
            return {"status": "error", "error": str(e)}


# Global optimizer instance
db_optimizer = DatabaseOptimizer()


# Convenience functions
async def get_database_optimizer() -> DatabaseOptimizer:
    """Get database optimizer instance"""
    return db_optimizer


async def analyze_slow_queries() -> Dict[str, Any]:
    """Analyze and report on slow queries"""
    return await db_optimizer.monitor_database_performance()


async def optimize_database_performance() -> Dict[str, Any]:
    """Run comprehensive database optimization"""
    try:
        # Create optimized indexes
        index_result = await db_optimizer.create_optimized_indexes()
        
        # Get performance analysis
        performance_analysis = await db_optimizer.monitor_database_performance()
        
        return {
            "optimization_completed": True,
            "index_creation": index_result,
            "performance_analysis": performance_analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error("Database optimization failed", error=str(e))
        return {"status": "error", "error": str(e)}