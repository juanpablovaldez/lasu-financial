-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT CHECK (currency IN ('USD', 'ARS')) NOT NULL,
  exchange_rate NUMERIC(10, 4), -- ARS rate used if currency was ARS
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update balance after transaction
CREATE OR REPLACE FUNCTION update_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  usd_amount NUMERIC(15, 2);
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Convert to USD if necessary
    IF NEW.currency = 'ARS' THEN
      usd_amount := NEW.amount / NEW.exchange_rate;
    ELSE
      usd_amount := NEW.amount;
    END IF;

    -- Update balance based on transaction type
    IF NEW.type = 'deposit' THEN
      UPDATE user_balances
      SET amount_usd = amount_usd + usd_amount,
          last_updated = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE user_balances
      SET amount_usd = amount_usd - usd_amount,
          last_updated = NOW()
      WHERE user_id = NEW.user_id;
    END IF;

    -- Set completed_at timestamp
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update balance
CREATE TRIGGER on_transaction_status_change
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_on_transaction();
