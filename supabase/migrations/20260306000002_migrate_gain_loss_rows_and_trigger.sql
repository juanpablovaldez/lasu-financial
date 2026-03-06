-- Step 2: Migrate existing rows to new enum values.
UPDATE operations SET operation_type = 'ingreso' WHERE operation_type = 'gain';
UPDATE operations SET operation_type = 'egreso'  WHERE operation_type = 'loss';

-- Step 3: Update the balance trigger to use ingreso/egreso.
CREATE OR REPLACE FUNCTION update_balance_on_operation()
RETURNS TRIGGER AS $$
DECLARE
  total_deduction DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.operation_type = 'ingreso' THEN
      -- Ingresos increase the user's balance
      UPDATE user_balances
      SET amount_usd = amount_usd + NEW.total_amount_usd, last_updated = NOW()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Egresos (and any legacy types) deduct from balance
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
