-- Fix: update_balance_on_operation() may reference non-existent column 'updated_at'
-- user_balances uses 'last_updated', not 'updated_at'
-- This migration definitively recreates the function with the correct column name.
CREATE OR REPLACE FUNCTION update_balance_on_operation()
RETURNS TRIGGER AS $$
DECLARE
  total_deduction DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.operation_type IN ('ingreso', 'ganancia') THEN
      UPDATE user_balances
      SET amount_usd = amount_usd + NEW.total_amount_usd, last_updated = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.operation_type IN ('egreso', 'perdida') THEN
      total_deduction := NEW.total_amount_usd + NEW.fee_amount;
      SELECT amount_usd INTO current_balance FROM user_balances
      WHERE user_id = NEW.user_id FOR UPDATE;
      IF current_balance < total_deduction THEN
        RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', total_deduction, current_balance;
      END IF;
      UPDATE user_balances
      SET amount_usd = amount_usd - total_deduction, last_updated = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
    NEW.executed_at := NOW();
    IF NEW.executed_by IS NULL THEN
      NEW.executed_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
