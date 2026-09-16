# AI Control Tower SQL migrations

## Dev-first execution

1. Open the Supabase SQL Editor for **pgt-dev**.
2. Review `20260916_ai_control_tower_settings.sql`.
3. Execute the migration as one script.
4. Run the verification queries at the end of that file.
5. Test the Settings proxy and ingestion lifecycle behavior against pgt-dev.
6. Do not run this migration against production until dev verification is complete and explicit approval is provided.

The application does not execute this file and must not assume the migration is applied. Until it is applied, the new Settings routes return an unavailable response from the missing RPCs; existing ingestion authentication retains its legacy fallback behavior.

If the original migration was already applied before the `app_id` qualification fix, run `20260916_ai_control_tower_settings_fix_ambiguous_app_id.sql` in pgt-dev. It replaces only `self_service_register_app`; no table changes are required.

**Confirmed live bug (2026-09-16):** `self_service_register_app` in pgt-dev is still throwing `column reference "app_id" is ambiguous` when calling "Connect app" from the Settings UI. The function body committed in this repo (both migration files) is already fully qualified (`ca.app_id` / `v_app_id`), so this is not a code defect — the version currently deployed to pgt-dev predates the qualification fix and was never re-applied. There is no automated migration runner and no reachable direct-Postgres tool in this workspace, so this must be run manually:

1. Open the Supabase SQL Editor for the pgt-dev project (`enozfttaoxhomesdonrc`).
2. Run `20260916_ai_control_tower_settings.sql` in full again — it is idempotent (`ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, re-issued `REVOKE`/`GRANT`) and will overwrite every self-service function, not just `self_service_register_app`, closing off the same ambiguity risk in any other function that may also still be stale.
3. Re-test "Connect app" from Settings; the 503 should be gone.

## Required dev verification

Confirm:

- all five nullable lifecycle columns exist on `public.mt_company_apps`;
- all eight self-service functions exist;
- self-service functions have no `PUBLIC`, `anon`, or `authenticated` execute grants;
- service-role grants are present;
- self-service registration defaults payload capture off;
- reconnect resets usage, trace, payload, and capture flags;
- issue, rotate, revoke, and disconnect behavior matches the approved spec.

Do not apply production changes from this workspace.
