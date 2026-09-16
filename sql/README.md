# AI Control Tower SQL migrations

## Dev-first execution

1. Open the Supabase SQL Editor for **pgt-dev**.
2. Review `20260916_ai_control_tower_settings.sql`.
3. Execute the migration as one script.
4. Run the verification queries at the end of that file.
5. Test the Settings proxy and ingestion lifecycle behavior against pgt-dev.
6. Do not run this migration against production until dev verification is complete and explicit approval is provided.

The application does not execute this file and must not assume the migration is applied. Until it is applied, the new Settings routes return an unavailable response from the missing RPCs; existing ingestion authentication retains its legacy fallback behavior.

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
