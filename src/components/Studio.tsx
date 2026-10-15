import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  File,
  FileImage,
  FileText,
  LoaderCircle,
  Music2,
  Plus,
  ShieldCheck,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Category, extension, tools } from "../utils/catalog";
import {
  fileCategory,
  fileFamily,
  isSupportedFile,
  outputChoices,
} from "../utils/fileFlow";
import { Language, CONVERTER_LOCALIZATION } from "../utils/translations";
import { copyFor } from "../utils/studioCopy";
import { flowCopy, FlowKey } from "../utils/flowCopy";
import { saveLibraryFiles } from "../utils/library";
interface Output {
  url: string;
  name: string;
  size: number;
}
const sizeLabel = (size: number) =>
  size < 1024
    ? `${size} B`
    : size < 1024 ** 2
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / 1024 ** 2).toFixed(1)} MB`;
function FilePreview({ file }: { file: File }) {
  const [url, setUrl] = useState(""),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    if (
      !["png", "jpg", "jpeg", "webp", "avif", "gif", "bmp", "svg"].includes(
        extension(file.name),
      )
    ) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  const family = fileFamily(file.name),
    Icon =
      family === "audio"
        ? Music2
        : family === "video"
          ? Video
          : family === "images"
            ? FileImage
            : FileText;
  return (
    <span className="flow-file-preview" aria-hidden="true">
      {url && !failed ? (
        <img src={url} alt="" onError={() => setFailed(true)} />
      ) : (
        <Icon size={23} />
      )}
    </span>
  );
}
export default function Studio({
  lang,
  onCategoryChange,
}: {
  lang: Language;
  onCategoryChange: (category: Category) => void;
}) {
  const say = copyFor(lang),
    text = (key: FlowKey) => flowCopy(lang, key);
  const [files, setFiles] = useState<File[]>([]),
    [choiceId, setChoiceId] = useState(""),
    [quality, setQuality] = useState(85),
    [pages, setPages] = useState("1");
  const [outputs, setOutputs] = useState<Output[]>([]),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [dragging, setDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'failed' | ''>('');
  const input = useRef<HTMLInputElement>(null),
    urls = useRef<string[]>([]),
    mounted = useRef(true),
    dragDepth = useRef(0);
  const choices = outputChoices(files),
    choice = choices.find((item) => item.id === choiceId) || choices[0],
    format = choice?.format || "",
    tool = choice?.tool;
  const nameOf = (id: string) => {
    const item = tools.find((item) => item.id === id);
    return item
      ? lang === "fa"
        ? item.fa
        : CONVERTER_LOCALIZATION[lang]?.[item.id]?.title ||
          say(item.en, item.fa)
      : id;
  };
  const release = () => {
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = [];
    setOutputs([]);
    setSaveStatus('');
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      urls.current.forEach(URL.revokeObjectURL);
    };
  }, []);
  useEffect(() => {
    onCategoryChange(files.length ? fileCategory(files[0].name) : "all");
  }, [files, onCategoryChange]);
  const clear = () => {
    if (busy) return;
    setFiles([]);
    setChoiceId("");
    setProgress(0);
    setError("");
    release();
    if (input.current) input.current.value = "";
  };
  const addFiles = (incoming: File[]) => {
    if (input.current) input.current.value = "";
    if (busy || !incoming.length) return;
    if (incoming.some((file) => !isSupportedFile(file.name))) {
      setError(text("unsupported"));
      return;
    }
    if (incoming.some((file) => file.size > 500 * 1024 ** 2)) {
      setError(
        say(
          "That file is over 500 MB. Try a smaller file so your device has room to work.",
          "این فایل بیشتر از ۵۰۰ مگابایته. یک فایل کوچک‌تر امتحان کن.",
        ),
      );
      return;
    }
    if (files.length + incoming.length > 50) {
      setError(
        say(
          "Add up to 50 files at a time.",
          "هر بار حداکثر ۵۰ فایل انتخاب کن.",
        ),
      );
      return;
    }
    const combined = [...files, ...incoming];
    if (new Set(combined.map((file) => fileFamily(file.name))).size > 1) {
      setError(text("mixedFiles"));
      return;
    }
    if (!files.length) {
      const options = outputChoices(combined),
        requested = new URLSearchParams(location.search).get("tool");
      setChoiceId(
        (options.find((item) => item.tool === requested) || options[0])?.id ||
          "",
      );
    }
    setFiles(combined);
    setError("");
    setProgress(0);
    release();
  };
  const select = (id: string) => {
    if (busy || id === choice?.id) return;
    setChoiceId(id);
    setError("");
    setProgress(0);
    release();
  };
  const move = (index: number, direction: number) => {
    release();
    setFiles((previous) => {
      const next = [...previous];
      [next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ];
      return next;
    });
  };
  const run = async () => {
    if (busy || !files.length || !choice) return;
    setBusy(true);
    setProgress(0);
    setError("");
    release();
    try {
      const { runConversion } = await import("../utils/runConversion");
      const results = await runConversion(
        choice.tool,
        files,
        { format: choice.format, quality: quality / 100, pages },
        (value) => {
          if (mounted.current) setProgress(value);
        },
      );
      if (mounted.current)
        setOutputs(
          results.map((result) => {
            const url = URL.createObjectURL(result.blob);
            urls.current.push(url);
            return { url, name: result.name, size: result.blob.size };
          }),
        );
      try {
        await saveLibraryFiles(results);
        if (mounted.current) setSaveStatus('saved');
      } catch {
        if (mounted.current) setSaveStatus('failed');
      }
    } catch (cause) {
      if (mounted.current)
        setError(
          lang === "en" && cause instanceof Error
            ? cause.message
            : `${say("That conversion didn’t finish. Try again with a valid file.", "تبدیل انجام نشد. فایل رو بررسی کن و دوباره امتحان کن.")} ${cause instanceof Error ? cause.message : ""}`,
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const media =
    tool === "audio-convert" ||
    tool === "video-convert" ||
    (tool === "image-convert" && ["gif", "bmp"].includes(format)) ||
    files.some((file) => ["tif", "tiff"].includes(extension(file.name)));
  const formats = choices.filter((item) => !item.operation),
    operations = choices.filter((item) => item.operation),
    ordered = tool === "merge-pdf" || tool === "image-to-pdf";
  const supported =
    ".pdf, .png, .jpg, .webp, .heic, .mp3, .mp4, .docx, .csv, .json";
  return (
    <section
      className="studio-section upload-first"
      id="studio"
      aria-labelledby="studio-heading"
    >
      <div className="section-heading">
        <div>
          <h2 id="studio-heading">{text("startTitle")}</h2>
          <p>{text("startHint")}</p>
        </div>
        <span className="local-status">
          <ShieldCheck size={16} />
          {say("Files stay on this device", "فایل روی همین دستگاه می‌مونه")}
        </span>
      </div>
      <motion.div
        aria-busy={busy}
        className={`file-flow ${files.length ? "has-selection" : ""} ${dragging ? "is-dragging" : ""}`}
        layout="size"
      >
        <input
          hidden
          ref={input}
          type="file"
          multiple
          accept={
            supported +
            ",.jpeg,.gif,.bmp,.svg,.avif,.tiff,.tif,.heif,.wav,.ogg,.m4a,.aac,.flac,.wma,.aiff,.aif,.opus,.webm,.mov,.avi,.mkv,.flv,.3gp,.m4v,.mpeg,.mpg,.txt,.md"
          }
          aria-label={say("Select files", "انتخاب فایل")}
          onChange={(event) => addFiles(Array.from(event.target.files || []))}
        />
        <div
          className={`flow-upload ${files.length ? "is-filled" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) {
              dragDepth.current++;
              setDragging(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = busy ? "none" : "copy";
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (--dragDepth.current <= 0) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!files.length ? (
              <motion.div
                className="flow-empty"
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.24 }}
              >
                <div className="flow-upload-art" aria-hidden="true">
                  <span className="flow-sheet back">
                    <FileText size={32} />
                  </span>
                  <span className="flow-sheet front">
                    <FileImage size={32} />
                  </span>
                  <span className="flow-upload-arrow">
                    <Upload size={21} />
                  </span>
                </div>
                <h3>
                  {dragging
                    ? say("Right here. Let go.", "همین‌جا رهاش کن.")
                    : text("dropHere")}
                </h3>
                <p>
                  {say(
                    "Or choose something from your device.",
                    "یا از روی دستگاهت انتخابش کن.",
                  )}
                </p>
                <button
                  className="button button-blue"
                  onClick={() => input.current?.click()}
                >
                  <Plus size={18} />
                  {say("Choose files", "انتخاب فایل")}
                </button>
                <p className="flow-accept">
                  PDF · {text("image")} · {text("audio")} · {text("video")} ·{" "}
                  {text("document")}
                </p>
                <span className="flow-size-note">
                  {say(
                    "Up to 500 MB per file · Nothing gets uploaded",
                    "هر فایل تا ۵۰۰ مگابایت · چیزی آپلود نمی‌شه",
                  )}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="files"
                className="flow-selected"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flow-selected-heading">
                  <span role="status" aria-live="polite">
                    <Check size={16} />
                    {text(
                      files.length === 1 ? "fileReady" : "filesReady",
                    ).replace(
                      "{count}",
                      new Intl.NumberFormat(lang === "la" ? "en" : lang).format(
                        files.length,
                      ),
                    )}
                  </span>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={clear}
                  >
                    <X size={15} />
                    {text("clearFiles")}
                  </button>
                </div>
                <div className="flow-file-list">
                  <AnimatePresence initial={false}>
                    {files.map((file, index) => (
                      <motion.div
                        layout
                        key={`${file.name}-${file.size}-${index}`}
                        className="file-row"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                      >
                        <FilePreview file={file} />
                        <div className="file-info">
                          <strong title={file.name} dir="auto">
                            {file.name}
                          </strong>
                          <span>
                            {extension(file.name).toUpperCase()}
                            <span aria-hidden="true"> · </span>
                            {sizeLabel(file.size)}
                          </span>
                        </div>
                        <div className="file-row-actions">
                          {ordered && (
                            <>
                              <button
                                className="icon-button"
                                disabled={busy || index === 0}
                                aria-label={`Move ${file.name} up`}
                                onClick={() => move(index, -1)}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                className="icon-button"
                                disabled={busy || index === files.length - 1}
                                aria-label={`Move ${file.name} down`}
                                onClick={() => move(index, 1)}
                              >
                                <ArrowDown size={16} />
                              </button>
                            </>
                          )}
                          <button
                            className="icon-button"
                            disabled={busy}
                            aria-label={`Remove ${file.name}`}
                            onClick={() => {
                              setFiles((previous) =>
                                previous.filter((_, i) => i !== index),
                              );
                              setError("");
                              release();
                            }}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <button
                  className="flow-add"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  <Plus size={16} />
                  {say("Add another file", "یک فایل دیگه اضافه کن")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false}>
          {files.length > 0 && choice && (
            <motion.div
              key="outputs"
              className="flow-destination"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flow-destination-heading">
                <div>
                  <h3>{text("chooseOutput")}</h3>
                  <p>{text("autoDetected")}</p>
                </div>
                <ArrowRight size={23} aria-hidden="true" />
              </div>
              <div
                className="output-choices"
                role="group"
                aria-label={text("outputFormat")}
              >
                {formats.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    aria-pressed={choice.id === item.id}
                    disabled={busy}
                    className={`output-choice ${choice.id === item.id ? "is-selected" : ""}`}
                    onClick={() => select(item.id)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.32,
                      delay: Math.min(index * 0.025, 0.1),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="output-file-fold" aria-hidden="true" />
                    <strong>{item.label}</strong>
                    <span>{text(item.kind)}</span>
                    <span className="output-check" aria-hidden="true">
                      {choice.id === item.id && <Check size={13} />}
                    </span>
                  </motion.button>
                ))}
              </div>
              {operations.length > 0 && (
                <div className="flow-operations">
                  <span>{text("otherActions")}</span>
                  <div role="group" aria-label={text("otherActions")}>
                    {operations.map((item) => (
                      <button
                        key={item.id}
                        disabled={busy}
                        aria-pressed={choice.id === item.id}
                        className={choice.id === item.id ? "is-selected" : ""}
                        onClick={() => select(item.id)}
                      >
                        {nameOf(item.tool)}
                        {choice.id === item.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flow-settings">
                {tool === "image-convert" &&
                  ["jpg", "webp"].includes(format) && (
                    <label className="quality-control">
                      {say("Quality", "کیفیت")}
                      <output>{quality}%</output>
                      <input
                        disabled={busy}
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(event) => {
                          setQuality(Number(event.target.value));
                          release();
                        }}
                      />
                    </label>
                  )}
                {tool === "split-pdf" && (
                  <label className="field-label page-range">
                    {say("Pages to keep", "صفحه‌های موردنظر")}
                    <input
                      disabled={busy}
                      value={pages}
                      onChange={(event) => {
                        setPages(event.target.value);
                        setError("");
                        release();
                      }}
                      placeholder="1-3, 5"
                      dir="ltr"
                    />
                    <small>
                      {say("For example: 1-3, 5", "برای مثال: 1-3, 5")}
                    </small>
                  </label>
                )}
                <button
                  className="button button-blue convert-button"
                  aria-label={
                    busy
                      ? say("Making the change…", "داریم تبدیلش می‌کنیم…")
                      : say("Convert files", "تبدیل فایل‌ها")
                  }
                  disabled={busy}
                  onClick={run}
                >
                  {busy ? (
                    <LoaderCircle size={19} className="spin" />
                  ) : (
                    <ArrowRight size={19} />
                  )}
                  <span>
                    {busy
                      ? say("Making the change…", "داریم تبدیلش می‌کنیم…")
                      : say("Convert files", "تبدیل فایل‌ها")}
                  </span>
                  {!busy && (
                    <span className="convert-target" dir="ltr">
                      {choice.label}
                    </span>
                  )}
                </button>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tool + (media ? "-media" : "")}
                  className="flow-context"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tool === "pdf-to-docx" ? (
                    <p>
                      {say(
                        "Creates an editable text document. Original layout and scanned text aren’t preserved.",
                        "یک سند متنی قابل ویرایش می‌سازه؛ چیدمان اصلی و متن اسکن‌شده حفظ نمی‌شن.",
                      )}
                    </p>
                  ) : tool === "compress-pdf" ? (
                    <p>{text("optimizeNote")}</p>
                  ) : media ? (
                    <p>
                      {say(
                        "The media engine (~32 MB) downloads on first use. Save it in “Take it offline” to use it without a connection.",
                        "موتور رسانه (حدود ۳۲ مگابایت) بار اول دریافت می‌شه. از بخش «همراهت ببر» ذخیره‌اش کن تا آفلاین هم کار کنه.",
                      )}
                    </p>
                  ) : (
                    <p>{text("localHint")}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {busy && (
            <motion.div
              key="working"
              className="processing-state flow-processing"
              role="status"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span>
                {say("Working on your device", "در حال پردازش روی دستگاهت")}
                <b>{Math.round(progress)}%</b>
              </span>
              <div
                className="progress-track"
                role="progressbar"
                aria-label={say("Conversion progress", "پیشرفت تبدیل")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div style={{ width: `${Math.max(2, progress)}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <>
          {error && (
            <motion.div
              key="error"
              className="error-message flow-error"
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span dir="auto">{error}</span>
              <button
                className="icon-button"
                aria-label={say("Dismiss error", "بستن پیام خطا")}
                onClick={() => setError("")}
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </>
        <>
          {outputs.length > 0 && (
            <motion.div
              key="results"
              className="results flow-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="results-heading" role="status">
                <Check size={20} />
                <strong>
                  {say("A new format. All yours.", "فرمت تازه‌ات آماده‌ست.")}
                </strong>
              </div>
                {saveStatus && <p className="save-status" role="status">{saveStatus === 'saved' ? <a href="/library">{say('Saved to your local library. View files →', 'در تاریخچه محلی ذخیره شد. دیدن فایل‌ها ←')}</a> : say('Your browser could not save this to the library. Download your file below.', 'مرورگر نتوانست در تاریخچه ذخیره کند. فایل را از پایین دانلود کن.')}</p>}
              {outputs.map((output) => (
                <a
                  key={output.url}
                  className="download-row"
                  href={output.url}
                  download={output.name}
                >
                  <span>
                    <strong dir="auto">{output.name}</strong>
                    <small>{sizeLabel(output.size)}</small>
                  </span>
                  <span>
                    {say("Download", "دریافت")}
                    <ArrowDownToLine size={18} />
                  </span>
                </a>
              ))}
              <button className="text-button" onClick={clear}>
                {say("Start fresh", "از نو شروع کنیم")}
                <Plus size={15} />
              </button>
            </motion.div>
          )}
        </>
        <div className="flow-bottom">
          <span>
            <ShieldCheck size={15} />
            {say("Files stay on this device", "فایل روی همین دستگاه می‌مونه")}
          </span>
          <span>{text("mobileMemory")}</span>
        </div>
      </motion.div>
    </section>
  );
}
