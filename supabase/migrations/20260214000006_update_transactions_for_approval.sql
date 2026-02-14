-- Update Transactions for Admin Approval Workflow
-- CRITICAL CHANGE: Transactions now require manual admin approval before completing

-- Add admin approval fields to transactions table
ALTER TABLE transactions
ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN admin_notes TEXT;

-- Create indexes for admin queries
CREATE INDEX idx_transactions_approved_by ON transactions(approved_by) WHERE approved_by IS NOT NULL;
CREATE INDEX idx_transactions_rejected_by ON transactions(rejected_by) WHERE rejected_by IS NOT NULL;
CREATE INDEX idx_transactions_pending ON transactions(status) WHERE status = 'pending';

-- DROP the old auto-complete trigger
-- This trigger automatically set status='completed' on insert
DROP TRIGGER IF EXISTS on_transaction_status_change ON transactions;
DROP FUNCTION IF EXISTS update_balance_on_transaction();

-- Create NEW trigger for admin-approved transactions
CREATE OR REPLACE FUNCTION process_transaction_approval()
RETURNS TRIGGER AS $$
DECLARE
  amount_in_usd DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  -- APPROVAL: Admin approves transaction (sets status='completed' + approved_by)
  IF NEW.status = 'completed' AND OLD.status = 'pending' AND NEW.approved_by IS NOT NULL THEN

    -- Convert amount to USD if needed
    IF NEW.currency = 'USD' THEN
      amount_in_usd := NEW.amount;
    ELSIF NEW.currency = 'ARS' THEN
      -- Use exchange rate from transaction
      amount_in_usd := NEW.amount / NEW.exchange_rate;
    ELSE
      RAISE EXCEPTION 'Unsupported currency: %', NEW.currency;
    END IF;

    -- Get current balance for validation
    SELECT amount_usd INTO current_balance
    FROM user_balances
    WHERE user_id = NEW.user_id
    FOR UPDATE;

    -- For withdrawals, verify sufficient balance
    IF NEW.type = 'withdrawal' AND current_balance < amount_in_usd THEN
      RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', amount_in_usd, current_balance;
    END IF;

    -- Update balance based on transaction type
    UPDATE user_balances
    SET
      amount_usd = CASE
        WHEN NEW.type = 'deposit' THEN amount_usd + amount_in_usd
        WHEN NEW.type = 'withdrawal' THEN amount_usd - amount_in_usd
        ELSE amount_usd
      END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- Set timestamps
    NEW.approved_at := NOW();
    NEW.completed_at := NOW();

    -- Create audit log for approval
    PERFORM create_audit_log(
      'transaction_approved',
      'transaction',
      NEW.id,
      jsonb_build_object('status', OLD.status, 'balance_before', current_balance),
      jsonb_build_object('status', NEW.status, 'balance_after', current_balance + CASE WHEN NEW.type = 'deposit' THEN amount_in_usd ELSE -amount_in_usd END),
      NEW.admin_notes,
      jsonb_build_object('amount_usd', amount_in_usd, 'transaction_type', NEW.type)
    );

  -- REJECTION: Admin rejects transaction (sets status='failed' + rejected_by)
  ELSIF NEW.status = 'failed' AND OLD.status = 'pending' AND NEW.rejected_by IS NOT NULL THEN

    -- Set rejection timestamp
    NEW.rejected_at := NOW();

    -- Create audit log for rejection
    PERFORM create_audit_log(
      'transaction_rejected',
      'transaction',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'rejection_reason', NEW.rejection_reason),
      NEW.rejection_reason,
      jsonb_build_object('rejected_by', NEW.rejected_by)
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for transaction approval
CREATE TRIGGER trigger_process_transaction_approval
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  WHEN (
    (NEW.status = 'completed' AND OLD.status = 'pending' AND NEW.approved_by IS NOT NULL)
    OR
    (NEW.status = 'failed' AND OLD.status = 'pending' AND NEW.rejected_by IS NOT NULL)
  )
  EXECUTE FUNCTION process_transaction_approval();

-- Update RLS policies to allow admins to approve/reject
-- (Existing policies allow users to see their own transactions)

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow admins to update transactions (for approval/rejection)
CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Comments
COMMENT ON COLUMN transactions.approved_by IS 'Admin user who approved this transaction';
COMMENT ON COLUMN transactions.rejected_by IS 'Admin user who rejected this transaction';
COMMENT ON COLUMN transactions.rejection_reason IS 'Reason provided by admin for rejection';
COMMENT ON COLUMN transactions.admin_notes IS 'Internal notes from admin (not shown to user)';
