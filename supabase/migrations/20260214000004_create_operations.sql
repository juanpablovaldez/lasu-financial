-- Operations Table
-- Tracks investment operations (buy, sell, dividend, fee, transfer)

-- Create operation type enum
CREATE TYPE operation_type AS ENUM ('buy', 'sell', 'dividend', 'fee', 'transfer');

-- Create operation status enum
CREATE TYPE operation_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');

-- Create operations table
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type operation_type NOT NULL,

  -- Investment details (nullable for non-investment operations like fees)
  instrument_id INTEGER REFERENCES instruments(id) ON DELETE SET NULL,
  quantity DECIMAL(18, 8),
  price_per_unit DECIMAL(18, 2),

  -- Financial amounts
  total_amount_usd DECIMAL(18, 2) NOT NULL CHECK (total_amount_usd > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'ARS')),
  fee_amount DECIMAL(18, 2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),

  -- Status and execution
  status operation_status NOT NULL DEFAULT 'pending',
  description TEXT,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,

  -- Constraints
  CHECK (
    (operation_type IN ('buy', 'sell') AND instrument_id IS NOT NULL AND quantity IS NOT NULL AND price_per_unit IS NOT NULL)
    OR
    (operation_type IN ('dividend', 'fee', 'transfer'))
  )
);

-- Create indexes
CREATE INDEX idx_operations_user_id ON operations(user_id);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_type ON operations(operation_type);
CREATE INDEX idx_operations_created_at ON operations(created_at DESC);
CREATE INDEX idx_operations_executed_by ON operations(executed_by) WHERE executed_by IS NOT NULL;

-- Enable RLS
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own operations
CREATE POLICY "Users can view own operations"
  ON operations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all operations
CREATE POLICY "Admins can view all operations"
  ON operations
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can create operations
CREATE POLICY "Admins can create operations"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update operations
CREATE POLICY "Admins can update operations"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Trigger to update balance when operation is completed
CREATE OR REPLACE FUNCTION update_balance_on_operation()
RETURNS TRIGGER AS $$
DECLARE
  total_deduction DECIMAL(18, 2);
  current_balance DECIMAL(18, 2);
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate total amount to deduct (operation amount + fee)
    total_deduction := NEW.total_amount_usd + NEW.fee_amount;

    -- Check current balance
    SELECT amount_usd INTO current_balance
    FROM user_balances
    WHERE user_id = NEW.user_id
    FOR UPDATE;

    -- Verify sufficient balance
    IF current_balance < total_deduction THEN
      RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', total_deduction, current_balance;
    END IF;

    -- Deduct from user balance
    UPDATE user_balances
    SET
      amount_usd = amount_usd - total_deduction,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- Set execution timestamp
    NEW.executed_at := NOW();

    -- If executed_by is not set, use the current user
    IF NEW.executed_by IS NULL THEN
      NEW.executed_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_balance_on_operation
  BEFORE UPDATE ON operations
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_balance_on_operation();

-- Updated at trigger
CREATE TRIGGER update_operations_updated_at
  BEFORE UPDATE ON operations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE operations IS 'Tracks investment operations that deduct from user balance';
COMMENT ON COLUMN operations.operation_type IS 'Type of operation: buy/sell (requires instrument), dividend/fee/transfer (standalone)';
COMMENT ON COLUMN operations.total_amount_usd IS 'Total amount in USD (always stored in USD regardless of currency)';
COMMENT ON COLUMN operations.fee_amount IS 'Additional fee charged for this operation';
COMMENT ON COLUMN operations.executed_by IS 'Admin user who created/approved this operation';
