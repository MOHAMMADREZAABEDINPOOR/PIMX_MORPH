import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Download,
  LoaderCircle,
  Monitor,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Language } from "../utils/translations";
import { copyFor } from "../utils/studioCopy";
import {
  MEDIA_CACHE as CACHE,
  MEDIA_URLS as URLS,
  MEDIA_BYTES,
} from "../utils/mediaAssets";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export default function InstallPanel({ lang }: { lang: Language }) {
  const say = copyFor(lang);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null),
    [standalone, setStandalone] = useState(
      () =>
        matchMedia("(display-mode: standalone)").matches ||
        !!(navigator as Navigator & { standalone?: boolean }).standalone,
    );
  const [cachedReady, setCachedReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine),
    [saved, setSaved] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [downloadProgress, setDownloadProgress] = useState(0),
    [showInstructions, setShowInstructions] = useState(false);
  const {
    offlineReady: [registeredReady],
    needRefresh: [update],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () =>
      setError(
        say(
          "Offline setup didn’t finish. Check your connection and reload.",
          "آماده‌سازی آفلاین کامل نشد. اتصال رو بررسی کن و صفحه رو دوباره باز کن.",
        ),
      ),
  });
  const ready = registeredReady || cachedReady;
  useEffect(() => {
    let mounted = true;
    if ("serviceWorker" in navigator && !import.meta.env.DEV)
      navigator.serviceWorker.ready
        .then(() => {
          if (mounted) setCachedReady(true);
        })
        .catch(() => {});
    const install = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const installed = () => {
      setStandalone(true);
      setPrompt(null);
    };
    const connection = () => setOnline(navigator.onLine);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    if ("caches" in window)
      Promise.all(URLS.map((url) => caches.match(url)))
        .then((responses) => setSaved(responses.every((r) => r?.ok)))
        .catch(() => {});
    return () => {
      mounted = false;
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);
  const install = async () => {
    if (!prompt) {
      setShowInstructions(!showInstructions);
      return;
    }
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setStandalone(true);
      setPrompt(null);
    } catch {
      setPrompt(null);
      setShowInstructions(true);
    }
  };
  const save = async () => {
    setSaving(true);
    setError("");
    setDownloadProgress(0);
    try {
      if (!("caches" in window) || !window.isSecureContext)
        throw new Error(
          say(
            "Offline saving needs HTTPS or localhost and a browser with storage support.",
            "ذخیرهٔ آفلاین به HTTPS یا localhost و مرورگر دارای پشتیبانی حافظه نیاز داره.",
          ),
        );
      const cache = await caches.open(CACHE);
      let received = 0;
      for (let index = 0; index < URLS.length; index++) {
        const cached = await caches.match(URLS[index]);
        if (cached?.ok) {
          received += (await cached.blob()).size;
          setDownloadProgress(
            Math.min(99, Math.round((received / MEDIA_BYTES) * 100)),
          );
          continue;
        }
        const response = await fetch(URLS[index]);
        if (
          !response.ok ||
          response.headers.get("content-type")?.includes("text/html")
        )
          throw new Error(
            say(
              "The engine download failed. Reconnect and try again.",
              "دریافت موتور کامل نشد. اتصال رو بررسی کن و دوباره امتحان کن.",
            ),
          );
        if (response.body) {
          const reader = response.body.getReader(),
            chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            setDownloadProgress(
              Math.min(99, Math.round((received / MEDIA_BYTES) * 100)),
            );
          }
          const type =
            index === 0 ? "text/javascript" : "application/octet-stream";
          await cache.put(
            URLS[index],
            new Response(new Blob(chunks as BlobPart[], { type }), {
              headers: { "Content-Type": type },
            }),
          );
        } else {
          const blob = await response.blob();
          received += blob.size;
          await cache.put(URLS[index], new Response(blob));
        }
      }
      await navigator.storage?.persist?.();
      setSaved(true);
      setDownloadProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : say(
              "Not enough space. Free some storage and try again.",
              "فضای کافی نیست. کمی حافظه آزاد کن و دوباره امتحان کن.",
            ),
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section
      className="offline-section"
      id="offline"
      aria-labelledby="offline-heading"
    >
      <div className="offline-copy">
        <span className="offline-symbol" aria-hidden="true">
          <WifiOff />
        </span>
        <h2 id="offline-heading">
          {say("Go somewhere.", "هر جا که رفتی،")}
          <br />
          {say("Take MORPH.", "MORPH رو ببر.")}
        </h2>
        <p>
          {say(
            "A window of its own. No tabs to find. Install the studio and keep your downloaded tools close, even when the Wi-Fi isn’t.",
            "یک پنجره برای خودش، بدون گشتن بین تب‌ها. استودیو رو نصب کن تا ابزارهایی که دریافت کردی، حتی بدون اینترنت هم همراهت باشن.",
          )}
        </p>
        <button
          className="button button-white"
          onClick={install}
          disabled={standalone}
        >
          {standalone ? <Check size={20} /> : <ArrowDownToLine size={20} />}
          {standalone
            ? say("You’re in the app", "داخل اپ هستی")
            : say("Install MORPH", "نصب MORPH")}
          <ArrowUpRight size={18} />
        </button>
        {showInstructions && (
          <div className="install-instructions" role="status">
            {say(
              "On iPhone or iPad: open in Safari, tap Share, then Add to Home Screen. On desktop or Android: open your browser’s menu and choose Install app or Add to Home Screen. Availability depends on your browser.",
              "روی آیفون و آیپد: در Safari، گزینهٔ Share و بعد Add to Home Screen رو بزن. روی کامپیوتر و اندروید: از منوی مرورگر Install app یا Add to Home Screen رو انتخاب کن. امکان نصب به مرورگرت بستگی داره.",
            )}
          </div>
        )}
      </div>
      <div className="offline-kit">
        <div className="kit-header">
          <Monitor size={22} />
          <strong>{say("Your offline kit", "بستهٔ آفلاین تو")}</strong>
          <span className="connection-state">
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            {online ? say("Online", "آنلاین") : say("Offline", "آفلاین")}
          </span>
        </div>
        <div className="kit-row">
          <span className={`kit-check ${ready ? "ready" : ""}`}>
            {ready ? <Check size={18} /> : <Download size={18} />}
          </span>
          <div>
            <strong>{say("The everyday essentials", "ابزارهای روزمره")}</strong>
            <p>
              {say(
                "Images, HEIC, PDFs, documents & data",
                "تصویر، HEIC، PDF، سند و داده",
              )}
            </p>
            <small role="status">
              {ready
                ? say("Saved on this device", "روی این دستگاه ذخیره شده")
                : say(
                    "Preparing after the first online visit…",
                    "پس از اولین بازدید آنلاین آماده می‌شه…",
                  )}
            </small>
          </div>
        </div>
        <div className="kit-row">
          <span className={`kit-check ${saved ? "ready" : ""}`}>
            {saved ? <Check size={18} /> : <ArrowDownToLine size={18} />}
          </span>
          <div>
            <strong>{say("A little more power", "کمی قدرت بیشتر")}</strong>
            <p>
              {say(
                "Audio, video, TIFF, GIF & BMP exports",
                "صوت، ویدئو، TIFF، خروجی GIF و BMP",
              )}
            </p>
            <small>
              {say(
                "Media engine · about 32 MB",
                "موتور رسانه · حدود ۳۲ مگابایت",
              )}
            </small>
          </div>
        </div>
        <button
          className="kit-download"
          disabled={saving || saved || !online}
          onClick={save}
        >
          {saving ? (
            <LoaderCircle className="spin" size={18} />
          ) : saved ? (
            <Check size={18} />
          ) : (
            <Download size={18} />
          )}
          {saving
            ? `${say("Saving", "در حال ذخیره")} ${downloadProgress}%`
            : saved
              ? say("Media tools saved", "ابزارهای رسانه ذخیره شدند")
              : say(
                  "Save media tools for offline",
                  "ذخیرهٔ ابزارهای رسانه برای آفلاین",
                )}
        </button>
        {saving && (
          <progress
            max="100"
            value={downloadProgress}
            aria-label={say("Engine download", "دریافت موتور")}
          />
        )}
        {update && (
          <button
            className="kit-download"
            onClick={() => updateServiceWorker(true)}
          >
            <RefreshCw size={17} />
            {say(
              "Update ready. Save your outputs, then reload.",
              "نسخهٔ تازه آماده‌ست. خروجی‌هات رو بگیر و دوباره باز کن.",
            )}
          </button>
        )}
        <p className="kit-footnote">
          {say(
            "Tools and converted outputs stay in this browser. Low storage or clearing browser data can remove them; download important files.",
            "ابزارها و خروجی‌های تبدیل در همین مرورگر می‌مانند. کمبود فضا یا پاک‌کردن داده‌های مرورگر ممکن است آن‌ها را حذف کند؛ فایل‌های مهم را دانلود کن.",
          )}
        </p>
        {error && (
          <p className="offline-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
