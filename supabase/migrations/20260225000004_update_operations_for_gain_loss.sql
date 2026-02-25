-- Update check constraint to allow gain/loss as standalone operations.
-- Rewritten to avoid referencing enum values directly (more resilient).
-- Logic: buy/sell require instrument fields; all other types do not.
ALTER TABLE operations DROP CONSTRAINT IF EXISTS operations_operation_type_check;
ALTER TABLE operations ADD CONSTRAINT operations_operation_type_check CHECK (
  operation_type NOT IN ('buy', 'sell')
  OR (instrument_id IS NOT NULL AND quantity IS NOT NULL AND price_per_unit IS NOT NULL)
);

-- Replace trigger function: gains ADD to balance, losses DEDUCT.
CREATE OR REPLACE FUNCTION update_balance_on_operation()
RETURNS TRIGGER AS $$
DECLARE
  total_deduction DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.operation_type = 'gain' THEN
      -- Gains increase the user's balance
      UPDATE user_balances
      SET amount_usd = amount_usd + NEW.total_amount_usd, updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSE
      -- All other types (buy, sell, dividend, fee, transfer, loss) deduct
      total_deduction := NEW.total_amount_usd + NEW.fee_amount;
      SELECT amount_usd INTO current_balance FROM user_balances
      WHERE user_id = NEW.user_id FOR UPDATE;
      IF current_balance < total_deduction THEN
        RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', total_deduction, current_balance;
      END IF;
      UPDATE user_balances
      SET amount_usd = amount_usd - total_deduction, updated_at = NOW()
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
