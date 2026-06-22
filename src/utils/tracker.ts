export interface VisitLog {
  id: string;
  timestamp: string; // ISO string
  ip?: string;
  city?: string;
  country?: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  actionPerformed?: string;
}

// Detect client specifications natively
export function getClientSpecs() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  // Detect OS
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1 && ua.indexOf('Mobile') === -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1 && ua.indexOf('Android') === -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) {
    os = 'Android';
    deviceType = 'Mobile';
  } else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPod') !== -1) {
    os = 'iOS';
    deviceType = 'Mobile';
  } else if (ua.indexOf('iPad') !== -1) {
    os = 'iPadOS';
    deviceType = 'Tablet';
  }

  // Handle common Tablet detection
  if (deviceType === 'Desktop' && /Mobi|Android/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/Tablet|pad|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet';
  }

  // Detect Browser
  if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

  return { browser, os, deviceType };
}

// ── Record a visit via D1 API (with localStorage fallback for local dev) ──
export async function recordActiveVisit(actionName?: string): Promise<void> {
  try {
    const specs = getClientSpecs();

    // Try the D1-backed API first (works on Cloudflare Pages)
    const res = await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browser: specs.browser,
        os: specs.os,
        deviceType: specs.deviceType,
        actionPerformed: actionName,
      }),
    });

    if (!res.ok) {
      // API not available (e.g. local dev) — fall back to localStorage
      recordVisitLocal(specs, actionName);
    }
  } catch {
    // Network error / not on Cloudflare — fall back to localStorage
    const specs = getClientSpecs();
    recordVisitLocal(specs, actionName);
  }
}

// Local fallback: store in localStorage (used only when D1 API is unreachable)
function recordVisitLocal(
  specs: { browser: string; os: string; deviceType: string },
  actionName?: string,
) {
  try {
    // Simple geo for local dev
    let geo = { ip: '127.0.0.1', city: 'Local', country: 'Dev' };
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = tz.split('/');
      geo = { ip: 'Local', city: parts[1] || 'Unknown', country: parts[0] || 'Unknown' };
    } catch { /* ignore */ }

    const rawLogs = localStorage.getItem('pimxmorph_visit_logs');
    const logs: VisitLog[] = rawLogs ? JSON.parse(rawLogs) : [];

    logs.push({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ip: geo.ip,
      city: geo.city,
      country: geo.country,
      browser: specs.browser,
      os: specs.os,
      deviceType: specs.deviceType as VisitLog['deviceType'],
      actionPerformed: actionName,
    });

    if (logs.length > 2000) logs.shift();
    localStorage.setItem('pimxmorph_visit_logs', JSON.stringify(logs));
  } catch (err) {
    console.error('Error tracking visit locally:', err);
  }
}

// ── Fetch all visit logs from D1 API (with localStorage fallback) ──
export async function fetchVisitLogs(): Promise<VisitLog[]> {
  try {
    const res = await fetch('/api/visit');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API unreachable — fall back
  }
  return getOrCreateHistoricalLogs();
}

// ── Clear all visit logs from D1 (with localStorage fallback) ──
export async function clearVisitLogs(): Promise<boolean> {
  try {
    const res = await fetch('/api/visit', { method: 'DELETE' });
    if (res.ok) return true;
  } catch {
    // API unreachable — fall back
  }
  localStorage.setItem('pimxmorph_visit_logs', JSON.stringify([]));
  return true;
}

// ── localStorage-only helper (fallback for local dev) ──
export function getOrCreateHistoricalLogs(): VisitLog[] {
  const key = 'pimxmorph_visit_logs';
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      const logs: VisitLog[] = JSON.parse(existing);
      // Filter out old seeded mock data
      return logs.filter((log) => !log.id?.startsWith('seed_'));
    } catch {
      return [];
    }
  }
  return [];
}
