# AI Control Tower Proxy

Standalone backend for the AI Control Tower Settings API. This proxy is separate from Product Studio and does not import or modify Product Studio source files.

## Local setup

From this directory:

```powershell
npm install
$env:PORT = "3001"
$env:ALLOWED_ORIGIN = "http://127.0.0.1:5174"
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = Read-Host "Enter pgt-dev service role key"
$env:CT_API_REFERENCE_URL = "http://127.0.0.1:3001/docs/"
npm run dev
```

`Read-Host` is only a local PowerShell prompt. Do not place the service-role key in the React `.env.local`, commit it, or send it through chat.

The SQL migration must already be applied to pgt-dev before app-list and Settings actions can work:

```text
../sql/20260916_ai_control_tower_settings.sql
```

The browser calls the proxy at `VITE_API_BASE_URL`, using the Supabase access token in `X-Auth-Token` and the selected company in `X-Company-Id`.

## Routes

- `GET /api/control-tower/settings/apps`
- `POST /api/control-tower/settings/apps`
- `PATCH /api/control-tower/settings/apps/:appId/capture`
- `POST /api/control-tower/settings/apps/:appId/credentials/issue`
- `POST /api/control-tower/settings/apps/:appId/credentials/rotate`
- `POST /api/control-tower/settings/apps/:appId/credentials/revoke`
- `POST /api/control-tower/settings/apps/:appId/disconnect`
- `GET /api/control-tower/settings/api-reference`
