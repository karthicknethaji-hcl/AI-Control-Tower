-- Corrective patch for pgt-dev.
-- Run this after 20260916_ai_control_tower_settings.sql when that migration
-- has already been applied. Execute in pgt-dev first; do not run in production
-- without explicit approval.

CREATE OR REPLACE FUNCTION public.self_service_register_app(
  p_actor_user_id uuid,
  p_company_id uuid,
  p_display_name text
)
RETURNS TABLE(app_id text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_slug text;
  v_app_id text;
  v_suffix text;
BEGIN
  PERFORM public._ct_require_company_admin(p_actor_user_id, p_company_id);
  IF nullif(trim(p_display_name), '') IS NULL THEN
    RAISE EXCEPTION 'App name is required.';
  END IF;
  IF length(trim(p_display_name)) > 80 THEN
    RAISE EXCEPTION 'App name must be 80 characters or fewer.';
  END IF;

  v_slug := lower(regexp_replace(trim(p_display_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug = '' THEN
    RAISE EXCEPTION 'App name must include at least one letter or number.';
  END IF;
  v_suffix := substr(replace(p_company_id::text, '-', ''), 1, 8);
  v_app_id := v_slug || '-' || v_suffix;

  IF EXISTS (
    SELECT 1
    FROM public.mt_company_apps ca
    WHERE ca.company_id = p_company_id
      AND ca.app_id = v_app_id
      AND ca.is_active = true
  ) THEN
    RAISE EXCEPTION 'An app with this name is already connected for your company.';
  END IF;

  INSERT INTO public.mt_apps (app_id, name, supports_enforcement)
  VALUES (v_app_id, trim(p_display_name), false)
  ON CONFLICT ON CONSTRAINT mt_apps_pkey DO UPDATE SET name = EXCLUDED.name;

  INSERT INTO public.mt_company_apps (
    company_id, app_id, is_active, granted_at, granted_by,
    scope_usage_write, scope_traces_write, scope_payloads_write,
    payload_capture_enabled, disconnected_at, disconnected_by,
    credential_hash, credential_created_at, credential_expires_at,
    credential_revoked_at, credential_revoked_by
  ) VALUES (
    p_company_id, v_app_id, true, now(), p_actor_user_id,
    true, true, false, false, null, null,
    null, null, null, null, null
  )
  ON CONFLICT ON CONSTRAINT mt_company_apps_pkey DO UPDATE SET
    is_active = true, granted_at = now(), granted_by = p_actor_user_id,
    scope_usage_write = true, scope_traces_write = true,
    scope_payloads_write = false, payload_capture_enabled = false,
    disconnected_at = null, disconnected_by = null,
    credential_hash = null, credential_created_at = null,
    credential_expires_at = null, credential_revoked_at = null,
    credential_revoked_by = null;

  RETURN QUERY SELECT v_app_id, trim(p_display_name);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.self_service_register_app(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.self_service_register_app(uuid, uuid, text)
TO service_role;

-- Verification: this must return the corrected function definition.
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'self_service_register_app';