-- Create user_balances table
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_usd NUMERIC(15, 2) DEFAULT 0.00 NOT NULL CHECK (amount_usd >= 0),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- RLS Policies
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
  ON user_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance"
  ON user_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balance"
  ON user_balances FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create initial balance on user signup
CREATE OR REPLACE FUNCTION create_initial_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_balances (user_id, amount_usd)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create balance on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_balance();
