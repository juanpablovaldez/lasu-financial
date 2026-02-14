-- Admin Roles Table
-- Manages admin permissions for the backoffice system

-- Create helper function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create role enum
CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin', 'viewer');

-- Create admin_roles table
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role_type NOT NULL DEFAULT 'viewer',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one active role per user
  CONSTRAINT unique_active_admin_role UNIQUE NULLS NOT DISTINCT (user_id, revoked_at)
);

-- Create index for fast user lookups
CREATE INDEX idx_admin_roles_user_id ON admin_roles(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_admin_roles_role ON admin_roles(role) WHERE revoked_at IS NULL;

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND revoked_at IS NULL
    AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(check_user_id UUID DEFAULT NULL)
RETURNS admin_role_type AS $$
DECLARE
  user_role admin_role_type;
BEGIN
  SELECT role INTO user_role
  FROM admin_roles
  WHERE user_id = COALESCE(check_user_id, auth.uid())
  AND revoked_at IS NULL
  LIMIT 1;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
-- Admins can view all roles
CREATE POLICY "Admins can view all admin roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Super admins can insert new admin roles
CREATE POLICY "Super admins can grant admin roles"
  ON admin_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND revoked_at IS NULL
    )
  );

-- Super admins can revoke roles
CREATE POLICY "Super admins can revoke admin roles"
  ON admin_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND revoked_at IS NULL
    )
  );

-- Updated at trigger
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE admin_roles IS 'Stores admin role assignments for backoffice access';
COMMENT ON COLUMN admin_roles.role IS 'super_admin: full access, admin: approve/manage, viewer: read-only';
COMMENT ON COLUMN admin_roles.revoked_at IS 'When set, the role is no longer active';
