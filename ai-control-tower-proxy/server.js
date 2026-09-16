const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { createAuthMiddleware } = require('./middleware/requireAuth');
const { createCompanyAdminMiddleware } = require('./middleware/requireCompanyAdmin');
const createSettingsRouter = require('./routes/settings');

const app = express();
const port = Number(process.env.PORT || 3001);
const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://127.0.0.1:5174,http://localhost:5174').split(',').map((origin) => origin.trim()).filter(Boolean);
const apiReferenceUrl = String(process.env.CT_API_REFERENCE_URL || '').trim();
const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json({ limit: '20kb' }));
app.get('/', (req, res) => res.json({ status: 'ok', service: 'ai-control-tower-proxy' }));

const settingsLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.options('/api/control-tower/settings/*', cors({ origin: allowedOrigins }));
app.use('/api/control-tower/settings', settingsLimiter);
app.use('/api/control-tower/settings', createAuthMiddleware(supabaseUrl));
app.use('/api/control-tower/settings', createCompanyAdminMiddleware(supabaseAdmin));
app.use('/api/control-tower/settings', createSettingsRouter(supabaseAdmin, apiReferenceUrl));

app.use((req, res) => res.status(404).json({ error: { type: 'not_found', message: `Route not found: ${req.method} ${req.path}` } }));

if (!supabaseUrl) console.warn('[CONTROL TOWER] SUPABASE_URL is not set.');
if (!serviceRoleKey) console.warn('[CONTROL TOWER] SUPABASE_SERVICE_ROLE_KEY is not set. Settings data routes will be unavailable.');
if (!apiReferenceUrl) console.warn('[CONTROL TOWER] CT_API_REFERENCE_URL is not set.');
app.listen(port, () => console.log(`[CONTROL TOWER] Proxy listening on http://127.0.0.1:${port}`));
