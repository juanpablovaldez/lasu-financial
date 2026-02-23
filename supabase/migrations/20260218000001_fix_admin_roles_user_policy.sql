-- Fix: Allow users to read their own admin_roles row
-- Previously, only admins could SELECT from admin_roles (USING is_admin()).
-- This blocked normal users from querying their own row to check admin status,
-- causing unnecessary PGRST116 errors in the useAdminRole hook.

CREATE POLICY "Users can view own admin role"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
