DO $$
DECLARE
  lms_admin_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lms.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', lms_admin_id, 'authenticated', 'authenticated',
      'admin@lms.com', crypt('admin123', gen_salt('bf')), now(),
      '{"first_name":"System","last_name":"Admin"}'::jsonb, now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), lms_admin_id::text, lms_admin_id, jsonb_build_object('sub', lms_admin_id::text, 'email', 'admin@lms.com'), 'email', now(), now(), now());

    UPDATE public.profiles SET role = 'SUPER_ADMIN', first_name = 'System', last_name = 'Admin' WHERE id = lms_admin_id;
  END IF;
END $$;
