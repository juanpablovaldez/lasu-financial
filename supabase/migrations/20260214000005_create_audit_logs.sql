-- Audit Logs Table
-- Immutable log of all admin actions for compliance and debugging

-- Create action type enum
CREATE TYPE audit_action_type AS ENUM (
  'transaction_approved',
  'transaction_rejected',
  'operation_created',
  'operation_completed',
  'operation_cancelled',
  'admin_role_granted',
  'admin_role_revoked',
  'user_account_suspended',
  'user_account_activated',
  'balance_adjusted'
);

-- Create entity type enum
CREATE TYPE audit_entity_type AS ENUM (
  'transaction',
  'operation',
  'admin_role',
  'user_profile',
  'user_balance'
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- What action was performed
  action audit_action_type NOT NULL,
  entity_type audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,

  -- State tracking
  previous_state JSONB,
  new_state JSONB,

  -- Additional context
  reason TEXT,
  metadata JSONB,

  -- IP and session info (for security auditing)
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- System can insert audit logs (via SECURITY DEFINER functions)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No updates or deletes allowed (immutable log)

-- Helper function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action audit_action_type,
  p_entity_type audit_entity_type,
  p_entity_id UUID,
  p_previous_state JSONB DEFAULT NULL,
  p_new_state JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    performed_by,
    action,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    reason,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_previous_state,
    p_new_state,
    p_reason,
    p_metadata
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all admin actions';
COMMENT ON COLUMN audit_logs.performed_by IS 'Admin user who performed the action';
COMMENT ON COLUMN audit_logs.previous_state IS 'Entity state before the action (JSON)';
COMMENT ON COLUMN audit_logs.new_state IS 'Entity state after the action (JSON)';
COMMENT ON COLUMN audit_logs.reason IS 'Admin-provided reason for the action (e.g., rejection reason)';
