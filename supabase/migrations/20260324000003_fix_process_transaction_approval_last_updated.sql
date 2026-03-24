-- Fix: process_transaction_approval() references non-existent column 'updated_at'
-- user_balances uses 'last_updated', not 'updated_at'
CREATE OR REPLACE FUNCTION process_transaction_approval()
RETURNS TRIGGER AS $$
DECLARE
  amount_in_usd DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  -- APPROVAL: Admin approves transaction (sets status='completed' + approved_by)
  IF NEW.status = 'completed' AND OLD.status = 'pending' AND NEW.approved_by IS NOT NULL THEN

    IF NEW.currency = 'USD' THEN
      amount_in_usd := NEW.amount;
    ELSIF NEW.currency = 'ARS' THEN
      amount_in_usd := NEW.amount / NEW.exchange_rate;
    ELSE
      RAISE EXCEPTION 'Unsupported currency: %', NEW.currency;
    END IF;

    SELECT amount_usd INTO current_balance
    FROM user_balances
    WHERE user_id = NEW.user_id
    FOR UPDATE;

    IF NEW.type = 'withdrawal' AND current_balance < amount_in_usd THEN
      RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', amount_in_usd, current_balance;
    END IF;

    UPDATE user_balances
    SET
      amount_usd = CASE
        WHEN NEW.type = 'deposit' THEN amount_usd + amount_in_usd
        WHEN NEW.type = 'withdrawal' THEN amount_usd - amount_in_usd
        ELSE amount_usd
      END,
      last_updated = NOW()
    WHERE user_id = NEW.user_id;

    NEW.approved_at := NOW();
    NEW.completed_at := NOW();

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

    NEW.rejected_at := NOW();

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
