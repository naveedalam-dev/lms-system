-- Idempotently ensure admin@lms.com exists and is a SUPER_ADMIN.
-- Safe to run multiple times.
--
-- Why this is needed: the on_auth_user_created trigger inserts a profiles row
-- but never sets `role`, which defaults to 'STUDENT'. If admin@lms.com was
-- created without an explicit role update, it resolves to STUDENT and the root
-- page (src/app/page.tsx) routes it to /student instead of /admin.
--
-- Run either:
--   1. Supabase Dashboard -> SQL Editor -> paste this file -> Run
--   2. node scripts/run-sql.js scripts/fix-admin-profile.sql
--      (requires a valid Supabase management token in scripts/run-sql.js)

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@lms.com';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin@lms.com', crypt('admin123', gen_salt('bf')), now(),
      '{"first_name":"System","last_name":"Admin","role":"SUPER_ADMIN"}'::jsonb, now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), admin_id::text, admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@lms.com'),
      'email', now(), now(), now()
    );
  END IF;

  -- Guarantee the profiles row exists and carries the SUPER_ADMIN role.
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (admin_id, 'admin@lms.com', 'SUPER_ADMIN', 'System', 'Admin')
  ON CONFLICT (id) DO UPDATE
    SET role       = EXCLUDED.role,
        email      = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name;
END $$;

SELECT id, email, role, first_name, last_name
FROM public.profiles
WHERE email = 'admin@lms.com';
