-- Sync full_name from auth.users metadata into user_profiles

-- 1. Update signup trigger to also copy full_name from user metadata
CREATE OR REPLACE FUNCTION create_initial_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'pending_activation'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email     = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill full_name for existing rows that have it in metadata but not in profile
UPDATE public.user_profiles up
SET full_name = au.raw_user_meta_data->>'full_name'
FROM auth.users au
WHERE up.user_id = au.id
  AND up.full_name IS NULL
  AND au.raw_user_meta_data->>'full_name' IS NOT NULL;
