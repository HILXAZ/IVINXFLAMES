-- Run this in Supabase SQL Editor to manually confirm the user
-- This will confirm the user ivinnsibi19@gmail.com so they can sign in

UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = '';

-- Optional: Also update any related user profile
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = ''),
  '{"sub": "' || (SELECT id FROM auth.users WHERE email = '') || '", "email": "ivinnsibi19@gmail.com", "email_verified": true}',
  'email',
  '',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;
