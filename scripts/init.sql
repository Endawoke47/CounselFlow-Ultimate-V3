-- =============================================================================
-- CounselFlow Ultimate V3 - Database Initialization Script
-- =============================================================================

-- Create extensions for enhanced functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- For accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- For array indexes

-- Create custom functions for audit logging
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for audit trail trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log entry for any table changes
    INSERT INTO audit_logs (
        event_type,
        resource,
        resource_id,
        action,
        details,
        ip_address,
        user_agent,
        timestamp
    ) VALUES (
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        row_to_json(COALESCE(NEW, OLD)),
        '127.0.0.1', -- Default, will be overridden by application
        'system',
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;