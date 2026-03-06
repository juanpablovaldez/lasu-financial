-- Admins need to read all users' balances for the backoffice dashboard.
-- Without this policy, RLS blocks admin queries from seeing any row
-- other than their own, causing all client balances to appear as 0.
CREATE POLICY "Admins can view all balances"
  ON user_balances FOR SELECT
  TO authenticated
  USING (is_admin());
