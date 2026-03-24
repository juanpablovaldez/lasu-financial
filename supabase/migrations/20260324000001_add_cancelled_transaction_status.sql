-- Add 'cancelled' as a valid transaction status
-- Users can cancel their own pending transactions

-- Drop existing check constraint and recreate with 'cancelled'
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- Allow users to update their own pending transactions to cancelled
CREATE POLICY "Users can cancel own pending transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
