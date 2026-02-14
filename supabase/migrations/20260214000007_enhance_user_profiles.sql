-- Enhance User Profiles for Admin Management
-- Adds KYC status, account management, and additional user information

-- Create KYC status enum
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending_review', 'approved', 'rejected', 'requires_update');

-- Create account status enum
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'closed', 'pending_activation');

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS kyc_status kyc_status NOT NULL DEFAULT 'not_submitted',
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'pending_activation',
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update RLS policies to allow admins to view all user profiles
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow admins to update user profiles (for KYC approval, suspension, etc.)
CREATE POLICY "Admins can update user profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to suspend user account
CREATE OR REPLACE FUNCTION suspend_user_account(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE user_profiles
  SET
    account_status = 'suspended',
    suspended_at = NOW(),
    suspended_by = auth.uid(),
    suspension_reason = p_reason,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create audit log
  PERFORM create_audit_log(
    'user_account_suspended',
    'user_profile',
    p_user_id,
    jsonb_build_object('account_status', 'active'),
    jsonb_build_object('account_status', 'suspended'),
    p_reason,
    jsonb_build_object('suspended_by', auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate user account
CREATE OR REPLACE FUNCTION activate_user_account(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE user_profiles
  SET
    account_status = 'active',
    suspended_at = NULL,
    suspended_by = NULL,
    suspension_reason = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create audit log
  PERFORM create_audit_log(
    'user_account_activated',
    'user_profile',
    p_user_id,
    jsonb_build_object('account_status', 'suspended'),
    jsonb_build_object('account_status', 'active'),
    NULL,
    jsonb_build_object('activated_by', auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create initial profile on user signup
CREATE OR REPLACE FUNCTION create_initial_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, account_status)
  VALUES (NEW.id, 'pending_activation')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_user_profile();

-- Updated at trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON COLUMN user_profiles.kyc_status IS 'KYC verification status for compliance';
COMMENT ON COLUMN user_profiles.account_status IS 'Overall account status (active, suspended, etc.)';
COMMENT ON COLUMN user_profiles.suspended_by IS 'Admin who suspended this account';
COMMENT ON COLUMN user_profiles.suspension_reason IS 'Reason for account suspension';
