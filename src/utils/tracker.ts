export interface VisitLog {
  id: string;
  timestamp: string; // ISO string
  ip?: string;
  city?: string;
  country?: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  actionPerformed?: string; // is a "Test" action
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

// Global hook to track current visit and retrieve network geolocation properties
export async function recordActiveVisit(actionName?: string): Promise<void> {
  try {
    const specs = getClientSpecs();
    
    // Attempt local Storage fetch
    const rawLogs = localStorage.getItem('pimxmorph_visit_logs');
    let logs: VisitLog[] = rawLogs ? JSON.parse(rawLogs) : [];

    // Always fetch geographic data from a fast, secure JSON API
    let geo = { ip: '127.0.0.1', city: 'Unknown', country: 'Iran' };
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        geo = {
          ip: data.ip || '127.0.0.1',
          city: data.city || 'Unknown',
          country: data.country_name || 'Iran',
        };
      }
    } catch (e) {
      // Timezone fallback if API fails
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Tehran')) {
        geo = { ip: 'Local Stream', city: 'Tehran', country: 'Iran' };
      } else if (tz.includes('Berlin')) {
        geo = { ip: 'Local Stream', city: 'Berlin', country: 'Germany' };
      } else {
        const parts = tz.split('/');
        geo = { ip: 'Local Stream', city: parts[1] || 'Unknown', country: parts[0] || 'Unknown' };
      }
    }

    const newLog: VisitLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ip: geo.ip,
      city: geo.city,
      country: geo.country,
      browser: specs.browser,
      os: specs.os,
      deviceType: specs.deviceType,
      actionPerformed: actionName,
    };

    logs.push(newLog);
    // Keep logs within reasonable bounds (e.g., 2000 items)
    if (logs.length > 2000) {
      logs.shift();
    }
    localStorage.setItem('pimxmorph_visit_logs', JSON.stringify(logs));
  } catch (err) {
    console.error('Error tracking active visit:', err);
  }
}

// Get actual visitor logs stored locally without any fake or seeded data
export function getOrCreateHistoricalLogs(): VisitLog[] {
  const key = 'pimxmorph_visit_logs';
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      const logs: VisitLog[] = JSON.parse(existing);
      // Filter out any previously seeded mock data starting with 'seed_'
      // Also filter out development logs created before 2026-06-20T01:53:00-07:00 (1781945580000 ms) to start fresh from exactly 0
      const realLogs = logs.filter(log => {
        if (!log.id || log.id.startsWith('seed_')) return false;
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= 1781945580000;
      });
      if (realLogs.length !== logs.length) {
        localStorage.setItem(key, JSON.stringify(realLogs));
      }
      return realLogs;
    } catch (e) {
      return [];
    }
  }
  return [];
}
