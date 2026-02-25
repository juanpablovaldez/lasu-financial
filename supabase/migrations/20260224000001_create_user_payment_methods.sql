CREATE TYPE payment_method_type AS ENUM ('bank_transfer', 'crypto', 'branch');

CREATE TABLE user_payment_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            payment_method_type NOT NULL,
  alias           TEXT NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  -- Bank transfer
  bank_name       TEXT,
  account_holder  TEXT,
  account_number  TEXT,
  account_type    TEXT CHECK (account_type IN ('checking', 'savings') OR account_type IS NULL),
  routing_code    TEXT,
  -- Crypto
  network         TEXT,
  coin            TEXT,
  wallet_address  TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upm_user_id ON user_payment_methods(user_id);
-- Enforce at most one default per user at DB level
CREATE UNIQUE INDEX idx_upm_one_default_per_user
  ON user_payment_methods(user_id) WHERE is_default = true;

ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS: users manage own, admins view all
CREATE POLICY "Users can view own payment methods"   ON user_payment_methods FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment methods" ON user_payment_methods FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment methods" ON user_payment_methods FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods" ON user_payment_methods FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment methods"  ON user_payment_methods FOR SELECT TO authenticated USING (is_admin());

-- Trigger: update updated_at (reuses function from migration 000003)
CREATE TRIGGER update_upm_updated_at
  BEFORE UPDATE ON user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: when a new default is set, unset all others for that user
CREATE OR REPLACE FUNCTION enforce_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_enforce_single_default
  BEFORE INSERT OR UPDATE ON user_payment_methods
  FOR EACH ROW WHEN (NEW.is_default = true)
  EXECUTE FUNCTION enforce_single_default_payment_method();
