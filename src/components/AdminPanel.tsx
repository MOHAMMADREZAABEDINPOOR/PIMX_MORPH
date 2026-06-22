import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, LogOut, Check, ChevronDown, RefreshCw, BarChart2, ShieldCheck, Activity, Users, Settings, Trash2 } from 'lucide-react';
import { VisitLog, fetchVisitLogs, clearVisitLogs } from '../utils/tracker';
import { motion, AnimatePresence } from 'motion/react';

// Specific timeline filters requested by the user
const TIMELINE_OPTIONS = [
  { value: 'min_1', label: '۱ دقیقه (min 1)', ms: 1 * 60 * 1000 },
  { value: 'min_3', label: '۳ دقیقه (min 3)', ms: 3 * 60 * 1000 },
  { value: 'min_5', label: '۵ دقیقه (min 5)', ms: 5 * 60 * 1000 },
  { value: 'min_7', label: '۷ دقیقه (min 7)', ms: 7 * 60 * 1000 },
  { value: 'min_10', label: '۱۰ دقیقه (min 10)', ms: 10 * 60 * 1000 },
  { value: 'min_30', label: '۳۰ دقیقه (min 30)', ms: 30 * 60 * 1000 },
  { value: 'hour_1', label: '۱ ساعت (hour 1)', ms: 1 * 60 * 60 * 1000 },
  { value: 'hour_2', label: '۲ ساعت (hours 2)', ms: 2 * 60 * 60 * 1000 },
  { value: 'hour_3', label: '۳ ساعت (hours 3)', ms: 3 * 60 * 60 * 1000 },
  { value: 'hour_5', label: '۵ ساعت (hours 5)', ms: 5 * 60 * 60 * 1000 },
  { value: 'hour_10', label: '۱۰ ساعت (hours 10)', ms: 10 * 60 * 60 * 1000 },
  { value: 'hour_17', label: '۱۷ ساعت (hours 17)', ms: 17 * 60 * 60 * 1000 },
  { value: 'hour_22', label: '۲۲ ساعت (hours 22)', ms: 2 * 60 * 60 * 1000 },
  { value: 'day_1', label: '۱ روز (day 1)', ms: 1 * 24 * 60 * 60 * 1000 },
  { value: 'day_2', label: '۲ روز (days 2)', ms: 2 * 24 * 60 * 60 * 1000 },
  { value: 'day_3', label: '۳ روز (days 3)', ms: 3 * 24 * 60 * 60 * 1000 },
  { value: 'day_5', label: '۵ روز (days 5)', ms: 5 * 24 * 60 * 60 * 1000 },
  { value: 'day_7', label: '۷ روز (days 7)', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: 'day_9', label: '۹ روز (days 9)', ms: 9 * 24 * 60 * 60 * 1000 },
  { value: 'day_10', label: '۱۰ روز (days 10)', ms: 10 * 24 * 60 * 60 * 1000 },
  { value: 'month_1', label: '۱ ماهه (month 1)', ms: 1 * 30 * 24 * 60 * 60 * 1000 },
  { value: 'month_3', label: '۳ ماهه (months 3)', ms: 3 * 30 * 24 * 60 * 60 * 1000 },
  { value: 'month_6', label: '۶ ماهه (months 6)', ms: 6 * 30 * 24 * 60 * 60 * 1000 },
  { value: 'month_8', label: '۸ ماهه (months 8)', ms: 8 * 30 * 24 * 60 * 60 * 1000 },
  { value: 'month_10', label: '۱۰ ماهه (months 10)', ms: 10 * 30 * 24 * 60 * 60 * 1000 },
  { value: 'year_1', label: '۱ ساله (year 1)', ms: 1 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_2', label: '۲ ساله (years 2)', ms: 2 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_4', label: '۴ ساله (years 4)', ms: 4 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_7', label: '۷ ساله (years 7)', ms: 7 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_10', label: '۱۰ ساله (years 10)', ms: 10 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_12', label: '۱۲ ساله (years 12)', ms: 12 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_15', label: '۱۵ ساله (years 15)', ms: 15 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_18', label: '۱۸ ساله (years 18)', ms: 18 * 365 * 24 * 60 * 60 * 1000 },
  { value: 'year_20', label: '۲۰ ساله (years 20)', ms: 20 * 365 * 24 * 60 * 60 * 1000 },
];

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState('year_1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authenticate Admin Credentials
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'pimxmorph' && password === '123456789PIMX_MORPh@#$%^&') {
      setIsLoggedIn(true);
      setErrorMsg('');
      localStorage.setItem('pimxmorph_admin_session', 'authenticated');
    } else {
      setErrorMsg('نام کاربری یا رمز عبور نادرست است.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('pimxmorph_admin_session');
  };

  const loadData = async () => {
    setIsRefreshing(true);
    const data = await fetchVisitLogs();
    setLogs(data);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleClearData = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات و آمار بازدید را پاک کنید؟ آمار صفر خواهد شد.')) {
      await clearVisitLogs();
      setLogs([]);
    }
  };

  useEffect(() => {
    // Check local session
    const session = localStorage.getItem('pimxmorph_admin_session');
    if (session === 'authenticated') {
      setIsLoggedIn(true);
    }
    loadData();
  }, []);

  // Filter logs based on chosen timespan offset
  const getSelectedTimelineMs = () => {
    const opt = TIMELINE_OPTIONS.find((t) => t.value === selectedTimeline);
    return opt ? opt.ms : 365 * 24 * 60 * 60 * 1000;
  };

  const filteredLogs = React.useMemo(() => {
    const msLimit = getSelectedTimelineMs();
    const thresholdDate = Date.now() - msLimit;
    return logs.filter((log) => new Date(log.timestamp).getTime() >= thresholdDate);
  }, [logs, selectedTimeline]);

  // Aggregate stats dynamically
  const stats = React.useMemo(() => {
    // Visits: count of all logs in filtered timeline (or base default scale)
    const totalVisits = filteredLogs.length;

    // Group devices
    let desktop = 0, mobile = 0, tablet = 0;
    filteredLogs.forEach((l) => {
      if (l.deviceType === 'Desktop') desktop++;
      else if (l.deviceType === 'Mobile') mobile++;
      else if (l.deviceType === 'Tablet') tablet++;
    });
    const devTotal = desktop + mobile + tablet || 1;
    const desktopPct = Math.round((desktop / devTotal) * 100);
    const mobilePct = Math.round((mobile / devTotal) * 100);
    const tabletPct = 100 - desktopPct - mobilePct;

    // Group locations
    const locMap: Record<string, { count: number; country: string }> = {};
    filteredLogs.forEach((l) => {
      const city = l.city || 'Unknown';
      const country = l.country || 'Iran';
      if (!locMap[city]) {
        locMap[city] = { count: 0, country };
      }
      locMap[city].count++;
    });

    const locationsList = Object.entries(locMap)
      .map(([city, v]) => ({
        city,
        country: v.country,
        count: v.count,
        percentage: Math.round((v.count / totalVisits) * 100) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalVisits,
      desktopPct,
      desktopCount: desktop,
      mobilePct,
      mobileCount: mobile,
      tabletPct,
      tabletCount: tablet,
      locationsList,
    };
  }, [filteredLogs]);

  // Compute 10-point timelines for SVG trends
  const trendData = React.useMemo(() => {
    const msLimit = getSelectedTimelineMs();
    const segmentDuration = msLimit / 10;
    const now = Date.now();

    const segments = Array.from({ length: 11 }).map((_, idx) => {
      const timeStamp = now - (10 - idx) * segmentDuration;
      return {
        timestamp: timeStamp,
        visits: 0,
      };
    });

    filteredLogs.forEach((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const relativeIndex = Math.min(
        10,
        Math.max(0, Math.floor((logTime - (now - msLimit)) / segmentDuration))
      );
      if (segments[relativeIndex]) {
        segments[relativeIndex].visits++;
      }
    });

    // Extract stats for trend widgets
    const visitCounts = segments.map((s) => s.visits);
    const minVisits = Math.min(...visitCounts);
    const maxVisits = Math.max(...visitCounts);
    const avgVisits = Math.round(visitCounts.reduce((a, b) => a + b, 0) / segments.length);

    return {
      segments,
      minVisits,
      maxVisits,
      avgVisits,
    };
  }, [filteredLogs, selectedTimeline]);

  // Helper to draw clean CSS paths for sparklines
  const getSvgPathStr = (dataPoints: number[], width = 500, height = 120) => {
    if (dataPoints.length === 0) return '';
    const max = Math.max(...dataPoints) || 1;
    const min = Math.min(...dataPoints);
    const range = max - min || 1;

    const coords = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      // Flip Y axis for SVG (padding of 15% top/bottom)
      const y = height - 15 - ((val - min) / range) * (height - 30);
      return `${x},${y}`;
    });

    return coords.length > 1 ? `M ${coords.join(' L ')}` : '';
  };

  const getSvgAreaPathStr = (dataPoints: number[], width = 500, height = 120) => {
    if (dataPoints.length === 0) return '';
    const max = Math.max(...dataPoints) || 1;
    const min = Math.min(...dataPoints);
    const range = max - min || 1;

    const coords = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - 15 - ((val - min) / range) * (height - 30);
      return `${x},${y}`;
    });

    if (coords.length < 2) return '';
    return `M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`;
  };

  if (!isLoggedIn) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-4">
        {/* Animated Card Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shrink-0 shadow-2xl relative overflow-hidden"
          id="admin-login-box"
        >
          {/* Subtle Glowing Spotlights */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

          <div className="text-center space-y-2 mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PIMXMORPH SECURITY CAPTURE
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">ورود به پنل مدیریت</h1>
            <p className="text-slate-400 text-xs">جهت دسترسی به آمار واقعی بازدید دیوایس‌ها، هویت خود را تأیید کنید.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نام کاربری</label>
              <input
                type="text"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="pimxmorph"
                className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white font-semibold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز عبور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white font-semibold transition"
              />
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-rose-500 font-bold bg-rose-950/20 py-2.5 px-3 border border-rose-900/30 rounded-xl"
              >
                {errorMsg}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition font-bold text-xs text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> احراز هویت و ورود
            </button>
          </form>

          {/* Footer Back Button */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <a
              href="/"
              className="text-slate-400 text-xs font-semibold inline-flex items-center gap-1.5 hover:text-white transition"
            >
              بازگشت به مبدل فرمت <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Admin Panel View (Matches requested layout precisely)
  const activeTimelineLabel = TIMELINE_OPTIONS.find((t) => t.value === selectedTimeline)?.label || '۱ ساله';

  // Extract variables for trends mapping
  const visitsPoints = trendData.segments.map((s) => s.visits);

  return (
    <div dir="rtl" className="min-h-screen bg-[#070b13] text-slate-100 font-sans pb-16 flex flex-col">
      {/* Admin header */}
      <nav className="border-b border-[#141a29] bg-[#0c1222]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/10">
              <Settings className="w-5 h-5 animate-spin-[spin_3s_linear_infinite]" />
            </div>
            <div>
              <span className="text-white font-extrabold text-sm tracking-widest block uppercase">PIMXMORPH MONITOR</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> اتصال ایمن و زنده (D1 Database)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Refresh Trigger */}
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-[#1d273e] bg-[#0c1222] text-slate-400 hover:text-white transition cursor-pointer"
              title="بارگذاری مجدد اطلاعات"
              id="admin-refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Trash/Reset Trigger to clear localStorage logs */}
            <button
              onClick={handleClearData}
              className="p-2.5 rounded-xl border border-rose-950/40 bg-[#0c1222] text-rose-400 hover:text-rose-300 hover:bg-rose-950/15 transition cursor-pointer"
              title="پاک کردن کل آمار بازدید"
              id="admin-clear-btn"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Custom Timespan Dialog Dropdown Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#1d273e] bg-[#0c1222] text-white hover:bg-[#141d33] transition cursor-pointer"
                id="admin-timeline-dropdown-trigger"
              >
                <span>محدوده زمانی: {activeTimelineLabel}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 left-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#1c263c] bg-[#0c1222]/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 text-right w-64"
                  >
                    {TIMELINE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedTimeline(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3.5 py-2 text-xs rounded-lg transition-all text-right ${
                          selectedTimeline === opt.value
                            ? 'bg-blue-600 text-white font-extrabold'
                            : 'text-slate-300 hover:bg-[#131b2d] font-semibold'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedTimeline === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600/20 border border-rose-500/10 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 shrink-0" /> خروج
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Total stats counter */}
        <div className="grid grid-cols-1 gap-5" id="stats-cards-row">
          <div className="bg-[#0c1222] border border-[#141a29] rounded-2xl p-6 relative overflow-hidden shadow-xl flex items-center justify-between min-h-[120px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-600/15 text-blue-400 rounded-xl border border-blue-500/10">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold block">تعداد کل بازدیدها (VISITS)</span>
                <span className="text-4xl font-black text-white mt-1 block tracking-tight">
                  {stats.totalVisits.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xs text-left leading-relaxed hidden sm:block">
              تعداد دقیق و واقعی بارگذاری صفحه‌ی مبدل فایل PIMXMORPH بر اساس رویداد مرورگر کاربران.
            </p>
          </div>
        </div>

        {/* Dashboard grid mapping: One chart and Spec sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visits Trend Chart */}
          <div className="lg:col-span-2 bg-[#0c1222] border border-[#141a29] rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[350px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#141a29]/60">
              <span className="text-[10px] font-extrabold bg-[#6366f1]/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/10">
                Live Line
              </span>
              <span className="text-xs font-black text-white">VISITS TREND (نمودار بازدیدها)</span>
            </div>

            {/* Sparkline Canvas Area Chart */}
            <div className="h-48 w-full mt-2 relative">
              {visitsPoints.length > 0 ? (
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getSvgAreaPathStr(visitsPoints, 640, 192)}
                    fill="url(#purpleAreaGrad)"
                  />
                  <path
                    d={getSvgPathStr(visitsPoints, 640, 192)}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  اطلاعاتی در این بازه زمانی یافت نشد
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-slate-500">پایان بازه</div>
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500">شروع بازه</div>
            </div>

            {/* Stat Widgets */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#141a29] text-center">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold">کمترین</span>
                <span className="block text-xs font-black text-slate-100 font-mono">{trendData.minVisits}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold">بیشترین</span>
                <span className="block text-xs font-black text-slate-100 font-mono">{trendData.maxVisits}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold">میانگین</span>
                <span className="block text-xs font-black text-slate-100 font-mono">{trendData.avgVisits.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* DEVICE SHARE section */}
          <div className="bg-[#0c1222] border border-[#141a29] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#141a29]/60">
              <span className="text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md border border-cyan-500/10">
                Spec Breakdown
              </span>
              <span className="text-xs font-black text-white">DEVICE SHARE (دستگاه‌های ورودی)</span>
            </div>

            <div className="space-y-5 my-auto">
              {/* Desktop Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-100 flex items-center gap-1.5">
                    <span>Desktop</span> <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  </span>
                  <span className="text-slate-400 font-mono">({stats.desktopCount}) {stats.desktopPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.desktopPct}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              {/* Mobile Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-100 flex items-center gap-1.5">
                    <span>Mobile</span> <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  </span>
                  <span className="text-slate-400 font-mono">({stats.mobileCount}) {stats.mobilePct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.mobilePct}%` }}
                    className="h-full bg-cyan-400 rounded-full"
                  />
                </div>
              </div>

              {/* Tablet Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-100 flex items-center gap-1.5">
                    <span>Tablet</span> <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  </span>
                  <span className="text-slate-400 font-mono">({stats.tabletCount}) {stats.tabletPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.tabletPct}%` }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-right mt-4 leading-relaxed">
              دستگاه‌های بازدیدکنندگان فعال مبدل فایل در بازه انتخابی با تکنولوژی ردیاب امن.
            </p>
          </div>
        </div>

        {/* User Locations Section */}
        <div className="bg-[#0c1222] border border-[#141a29] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#141a29]/60">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span className="text-emerald-400">🌐</span> USER LOCATIONS (جغرافیا و سورس بازدید)
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">دسته‌بندی اتصالات بر اساس آدرس آی‌پی بازدیدکننده</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
            {stats.locationsList.map((loc, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="text-slate-500 text-[10px]">({loc.count} بار)</span>
                    <span>{loc.city}, {loc.country}</span>
                  </span>
                  <span className="text-emerald-400 font-mono">{loc.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${loc.percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}

            {stats.locationsList.length === 0 && (
              <p className="text-xs text-slate-500 py-4 col-span-2 text-center font-semibold">
                اطلاعات مکانی ثبت نشده است. این بخش با بازدید واقعی به کار می‌افتد.
              </p>
            )}
          </div>
        </div>

        {/* Security / System Footer Credits */}
        <div className="pt-6 border-t border-[#141a29] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>پروتکل حفاظت از هویت PIMXMORPH کاملاً فعال است.</span>
          </div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-white transition font-bold">بازگشت به خانه</a>
            <span>•</span>
            <span>آمار ۱۰۰ درصد واقعی و بدون دخالت اطلاعات فیک</span>
          </div>
        </div>
      </main>
    </div>
  );
}
