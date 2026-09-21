-- ============================================================
-- MGN Platform-Wide Admin & Super Admin Control Plane Schema
-- sql/admin-migration.sql
-- ============================================================

-- 1. Admin Roles & User Role Assignments
CREATE TABLE IF NOT EXISTS admin_user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'ADMIN', 'VERIFICATION_ADMIN', 'CONTENT_ADMIN', 'RECRUITMENT_ADMIN', 'LEARN_ADMIN', 'SUPPORT_ADMIN', 'ANALYTICS_VIEWER'
    granted_by VARCHAR(36),
    granted_by_email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_admin_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user ON admin_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_email ON admin_user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role ON admin_user_roles(role);

-- 2. Immutable Platform Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'user.suspend', 'verification.approve', 'post.delete', 'feature_flag.update'
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'professional_profile', 'post', 'comment', 'course', 'job', 'setting'
    entity_id VARCHAR(36) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);

-- 3. Moderation Reports & Content Flagging Queue
CREATE TABLE IF NOT EXISTS admin_moderation_reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36),
    reporter_email VARCHAR(255),
    target_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'story', 'user', 'community', 'course', 'job'
    target_id VARCHAR(36) NOT NULL,
    target_content_preview TEXT,
    target_author_id VARCHAR(36),
    reason VARCHAR(100) NOT NULL, -- 'spam', 'harassment', 'medical_misinformation', 'impersonation', 'inappropriate', 'copyright'
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'under_review', 'resolved_action_taken', 'resolved_dismissed'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_to VARCHAR(36),
    resolved_by VARCHAR(36),
    resolution_action VARCHAR(50), -- 'content_deleted', 'user_suspended', 'warning_issued', 'dismissed'
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mod_status ON admin_moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_mod_target ON admin_moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_mod_created_at ON admin_moderation_reports(created_at DESC);

-- 4. Global Platform Configuration & Feature Flags
CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'safety', 'features', 'integrations', 'compliance'
    description TEXT,
    updated_by VARCHAR(36),
    updated_by_email VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Default Settings if not present
INSERT INTO admin_settings (key, value, category, description)
VALUES 
('maintenance_mode', '{"enabled": false, "allowed_ips": []}', 'general', 'System-wide maintenance mode'),
('user_registration_enabled', '{"enabled": true}', 'general', 'Allow new user registration'),
('doctor_verification_required_for_posting', '{"enabled": false}', 'safety', 'Require verified badge to create public network posts'),
('ai_moderation_enabled', '{"enabled": true, "auto_flag_keywords": true}', 'safety', 'Automated toxicity and keyword filtering'),
('story_creation_enabled', '{"enabled": true, "max_duration_hours": 24}', 'features', 'Enable 24h disappearing stories'),
('lms_public_access', '{"enabled": true}', 'features', 'Allow non-logged-in users to preview course catalogues')
ON CONFLICT (key) DO NOTHING;
