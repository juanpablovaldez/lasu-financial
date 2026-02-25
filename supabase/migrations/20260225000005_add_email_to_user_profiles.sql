-- Add email column to user_profiles and sync from auth.users

-- 1. Add the email column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Backfill existing rows
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id;

-- 3. Update the signup trigger to also copy email
CREATE OR REPLACE FUNCTION create_initial_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, account_status)
  VALUES (NEW.id, NEW.email, 'pending_activation')
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Keep email in sync if it changes in auth.users
CREATE OR REPLACE FUNCTION sync_user_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.user_profiles
    SET email = NEW.email, updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile_email();
