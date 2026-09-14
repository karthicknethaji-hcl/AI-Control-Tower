# AI Control Tower v0.01

Standalone React + TypeScript + Vite observability and governance workspace.

Product Studio is a producer/reference app. This project does not import Product Studio source files, and no files under `Product-Studio-v9.37.01/` are modified by this app.

## Run locally

```bash
npm install
# Create .env.local from .env.example and add local values.
npm run dev
npm run typecheck
npm run build
```

Required environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (optional)

Never commit `.env.local`.

## Implemented pages

- Command Center
- Outcome Economics
- Cost Analytics
- Trace Explorer
- Governance

## RPC-backed capabilities

The app uses the existing Supabase RPC contracts for company/app bootstrap, cost summaries and groupings, outcome types and outcomes, cost events, trace details and payload availability, budgets, alerts, opportunities, and supporting calls. Query state is scoped by company, producer app, and period where applicable.

## Validation evidence

- `npm run typecheck` passes.
- `npm run build` passes.
- Authenticated browser smoke validation passed across all five pages.
- Multiple producer apps and period switching were validated.
- Trace/span and Governance drawers were opened without executing persistent mutations.
- No protected Product Studio files changed.

## Known limitations

- Export is not implemented in v0.01 and is visibly disabled.
- Readonly behavior still needs validation with a real readonly account.
- Budget save, alert acknowledge, and alert dismiss require explicit test data before mutation testing.
- `npm audit` reports 5 development-toolchain vulnerabilities: 3 moderate, 1 high, and 1 critical.

## Safety rules

- Never commit `.env.local`.
- Never log payloads, prompts, responses, tokens, credentials, sessions, or secrets.
- Never modify `Product-Studio-v9.37.01/` from this app.