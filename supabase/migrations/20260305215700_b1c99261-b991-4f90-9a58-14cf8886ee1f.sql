
-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Private schema for encryption config (not exposed via API)
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE private.app_config ENABLE ROW LEVEL SECURITY;
-- No RLS policies = no client access via PostgREST

-- Generate a random encryption passphrase
INSERT INTO private.app_config (key, value)
VALUES ('encryption_key', gen_random_uuid()::text || '-' || gen_random_uuid()::text)
ON CONFLICT (key) DO NOTHING;

-- Trigger function: auto-encrypts api_key on INSERT or UPDATE of api_key
CREATE OR REPLACE FUNCTION public.encrypt_integration_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  passphrase text;
BEGIN
  SELECT value INTO passphrase FROM private.app_config WHERE key = 'encryption_key';
  NEW.api_key = encode(pgp_sym_encrypt(NEW.api_key, passphrase)::bytea, 'base64');
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_key_on_save
  BEFORE INSERT OR UPDATE OF api_key ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_integration_key();

-- RPC function: returns decrypted integrations for the current user
CREATE OR REPLACE FUNCTION public.get_decrypted_integrations()
RETURNS TABLE(id uuid, integration_name text, api_key text, enabled boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  passphrase text;
BEGIN
  SELECT value INTO passphrase FROM private.app_config WHERE key = 'encryption_key';
  RETURN QUERY
    SELECT
      ui.id,
      ui.integration_name,
      pgp_sym_decrypt(decode(ui.api_key, 'base64')::bytea, passphrase) as api_key,
      ui.enabled
    FROM public.user_integrations ui
    WHERE ui.user_id = auth.uid();
END;
$$;

-- Encrypt any existing plaintext keys
DO $$
DECLARE
  passphrase text;
BEGIN
  SELECT value INTO passphrase FROM private.app_config WHERE key = 'encryption_key';
  -- Temporarily disable the trigger to avoid double encryption
  ALTER TABLE public.user_integrations DISABLE TRIGGER encrypt_key_on_save;
  UPDATE public.user_integrations
  SET api_key = encode(pgp_sym_encrypt(api_key, passphrase)::bytea, 'base64');
  ALTER TABLE public.user_integrations ENABLE TRIGGER encrypt_key_on_save;
END;
$$;
