/// <reference types="@cloudflare/workers-types" />
// Cloudflare Pages Function — Visit tracking API backed by KV
// Binding name: PIMX_VISITS  (set in Pages → Settings → Functions → KV bindings)

interface Env {
  PIMX_VISITS: KVNamespace;
}

interface VisitRecord {
  id: string;
  timestamp: string;
  ip: string;
  city: string;
  country: string;
  browser: string;
  os: string;
  deviceType: string;
  actionPerformed: string | null;
}

const KV_KEY = 'all_visits';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function getAllVisits(kv: KVNamespace): Promise<VisitRecord[]> {
  const raw = await kv.get(KV_KEY, 'json');
  return Array.isArray(raw) ? raw : [];
}

async function putAllVisits(kv: KVNamespace, visits: VisitRecord[]): Promise<void> {
  // Keep max 10000 visits to stay well under KV 25MB value limit
  const trimmed = visits.length > 10000 ? visits.slice(-10000) : visits;
  await kv.put(KV_KEY, JSON.stringify(trimmed));
}

// ── CORS preflight ──────────────────────────────────────────────
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
};

// ── POST  /api/visit  — record a new visit ─────────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const kv = context.env.PIMX_VISITS;

  const body = await context.request.json() as {
    browser: string;
    os: string;
    deviceType: string;
    actionPerformed?: string;
  };

  // Real IP from Cloudflare edge
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  // Real geo from Cloudflare cf object (city / country resolved from IP at the edge)
  const cf = context.request.cf as Record<string, string> | undefined;
  const city = cf?.city || 'Unknown';
  const country = cf?.country || 'Unknown';

  const newVisit: VisitRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ip,
    city,
    country,
    browser: body.browser,
    os: body.os,
    deviceType: body.deviceType,
    actionPerformed: body.actionPerformed ?? null,
  };

  const visits = await getAllVisits(kv);
  visits.push(newVisit);
  await putAllVisits(kv, visits);

  return new Response(JSON.stringify({ success: true, id: newVisit.id }), {
    headers: JSON_HEADERS,
  });
};

// ── GET  /api/visit  — fetch all visits (admin) ────────────────
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const kv = context.env.PIMX_VISITS;
  const visits = await getAllVisits(kv);

  return new Response(JSON.stringify(visits), { headers: JSON_HEADERS });
};

// ── DELETE  /api/visit  — clear all visits (admin) ─────────────
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const kv = context.env.PIMX_VISITS;
  await kv.put(KV_KEY, JSON.stringify([]));

  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
};
