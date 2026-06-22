// Cloudflare Pages Function — Visit tracking API backed by D1
// Binding name: PIMX_VISITS  (set in Pages → Settings → Functions → D1 bindings)

interface Env {
  PIMX_VISITS: D1Database;
}

// Ensure the visits table exists (idempotent — safe to call every request)
async function ensureTable(db: D1Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id         TEXT PRIMARY KEY,
      timestamp  TEXT NOT NULL,
      ip         TEXT,
      city       TEXT,
      country    TEXT,
      browser    TEXT,
      os         TEXT,
      device_type TEXT NOT NULL,
      action_performed TEXT
    );
  `);
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ── CORS preflight ──────────────────────────────────────────────
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
};

// ── POST  /api/visit  — record a new visit ─────────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.PIMX_VISITS;
  await ensureTable(db);

  const body = await context.request.json() as {
    browser: string;
    os: string;
    deviceType: string;
    actionPerformed?: string;
  };

  // Real IP from Cloudflare edge
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  // Real geo from Cloudflare cf object (city / country come from IP at the edge)
  const cf = context.request.cf as Record<string, string> | undefined;
  const city = cf?.city || 'Unknown';
  const country = cf?.country || 'Unknown';

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO visits (id, timestamp, ip, city, country, browser, os, device_type, action_performed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, timestamp, ip, city, country, body.browser, body.os, body.deviceType, body.actionPerformed ?? null)
    .run();

  return new Response(JSON.stringify({ success: true, id }), { headers: JSON_HEADERS });
};

// ── GET  /api/visit  — fetch all visits (admin) ────────────────
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.PIMX_VISITS;
  await ensureTable(db);

  const url = new URL(context.request.url);
  const since = url.searchParams.get('since'); // ISO timestamp for filtering

  let query: string;
  let params: unknown[];

  if (since) {
    query = 'SELECT * FROM visits WHERE timestamp >= ? ORDER BY timestamp DESC';
    params = [since];
  } else {
    query = 'SELECT * FROM visits ORDER BY timestamp DESC LIMIT 5000';
    params = [];
  }

  const { results } = await db.prepare(query).bind(...params).all();

  // Map snake_case DB columns → camelCase frontend format
  const logs = (results as Record<string, unknown>[]).map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    ip: row.ip,
    city: row.city,
    country: row.country,
    browser: row.browser,
    os: row.os,
    deviceType: row.device_type,
    actionPerformed: row.action_performed,
  }));

  return new Response(JSON.stringify(logs), { headers: JSON_HEADERS });
};

// ── DELETE  /api/visit  — clear all visits (admin) ─────────────
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const db = context.env.PIMX_VISITS;
  await db.prepare('DELETE FROM visits').run();

  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
};
