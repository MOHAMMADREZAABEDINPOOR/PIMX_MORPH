<div align="center">

# PIMXMORPH 🔒🔄

### Advanced 100% Client-Side Offline File Conversion Platform

[![Persian Description](https://img.shields.io/badge/Read-Persian%20Description-0A66C2?style=for-the-badge)](#persian-description)
[![Website](https://img.shields.io/badge/Live-pimxmorph.pages.dev-0ea5e9?style=for-the-badge)](https://pimxmorph.pages.dev/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](#license--legal)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-6366f1?style=for-the-badge)](#-data--privacy-model)

</div>

🌐 **Live Website**
Production URL: **https://pimxmorph.pages.dev/**

---

## 🧩 What is PIMXMORPH?

**PIMXMORPH** is a modern, privacy-first, **100% client-side** file conversion suite. All file processing runs entirely **inside your browser** using JavaScript and WebAssembly-style sandboxing — **no file is ever uploaded to any server**. It is designed for users who handle confidential documents (lawyers, doctors, accountants, and privacy-conscious users) and need to convert, merge, split, or compress files without leaking a single byte to the cloud.

### Key Capabilities
- 🔒 **Zero Network Traffic** — files never leave your device
- 🌍 **10-Language UI** (English, Persian, Russian, Chinese, French, Italian, German, Arabic, Latin, Greek)
- 📄 **Multi-Format Conversion** — PDF, DOCX, images, HEIC, and more
- ⚡ **WASM-Style Speed** — optimized client-side algorithms
- 🌐 **Full RTL/LTR Support** for Persian & Arabic
- 🌗 **Dark/Light Theme** with persistence
- 📱 **Fully Responsive Design**
- 🛡️ **Works Offline** — once loaded, you can cut your internet

---

## ✨ Core Features

### 🔐 Privacy-First Architecture
- **100% Client-Side Processing** — every byte stays in your browser memory
- **Zero Server Uploads** — no backend receives your files
- **Sandboxed Execution** — calculations run inside the browser sandbox
- **Offline Capable** — sever your connection after page load and keep working

### 🎨 User Experience
- **Drag-and-Drop Workspace** with instant feedback
- **Real-Time Processing** with live progress bars
- **Smart Auto-Detect** that classifies dropped files automatically
- **Copy / Download** results directly to your device
- **Persistent Preferences** (theme, language) via LocalStorage

### 🌐 Multilingual Support
- **Full UI Localization** across 10 languages
- **RTL/LTR Text Direction** handling for Persian & Arabic
- **Localized SEO Metadata** per converter

### ⚙️ Conversion Toolkit
| Tool | Description |
|------|-------------|
| 🪄 **Smart Auto-Detect** | Identifies file type and picks the right tool instantly |
| 🖼️ **PDF → JPG/PNG** | Render PDF pages into high-fidelity images |
| 📝 **PDF → Word (DOCX)** | Deconstruct PDF into editable Word documents |
| 🎚️ **Image Converter** | Convert/compress to JPG, PNG, WebP, GIF, BMP |
| 📄 **Image → PDF** | Compile photos into formatted PDF pages |
| 🔗 **Merge PDFs** | Combine multiple PDFs into one |
| ✂️ **Split PDF** | Extract specific page ranges |
| 📦 **Compress PDF** | Shrink PDF size without losing readability |
| 📱 **HEIC → JPG/PNG** | Unlock proprietary iOS HEIC/HEIF photos |

---

## 🔐 Data & Privacy Model

This project prioritizes user privacy with a strict **local-only** strategy:

**Stored Only in Browser (LocalStorage):**
- Theme preference (dark/light)
- Selected language
- Daily processed-file counter
- Pro membership flag

**Sent to Any Server:**
- ❌ **None.** Files are **never** transmitted anywhere.

> **Result:** Your documents remain **completely private**. ✅

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type-safe Development |
| **Vite 6** | Build Tool & Dev Server |
| **Tailwind CSS 4** | Styling & Theming |
| **Lucide React** | Icons & UI Components |
| **Motion** | Smooth Animations |
| **pdf-lib** | Client-side PDF manipulation |
| **heic2any** | iOS HEIC/HEIF decoding |
| **docx** | Word document generation |
| **Cloudflare Pages** | Hosting & Deployment |

---

## 🚀 Local Development

### Prerequisites
- **Node.js 16+** (18+ recommended)
- **npm** or **yarn**

### Setup Instructions

**1. Clone the repository:**
```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH.git
cd PIMX_MORPH
```

**2. Install dependencies:**
```bash
npm install
```

**3. Run development server:**
```bash
npm run dev
```
Open your browser at: **http://localhost:3000**

**4. Build for production:**
```bash
npm run build
```

**5. Preview production build:**
```bash
npm run preview
```

---

## ☁️ Cloudflare Pages Deployment

### Configuration Requirements

**Build Settings:**
- **Framework preset:** Vite (or None)
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** 18+ recommended

### `wrangler.toml` Configuration

Keep only these essential keys for Pages compatibility:

```toml
name = "pimxmorph"
pages_build_output_dir = "dist"
```

> ⚠️ **Important:** Avoid adding unsupported build blocks to `wrangler.toml` for Pages projects.

### Optional `_headers` (for high-performance WASM threading)
```txt
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

---

## 📁 Project Structure

```
PIMX_MORPH/
├── src/
│   ├── App.tsx                       # Main application orchestrator
│   ├── main.tsx                      # React DOM entry mount
│   ├── index.css                     # Tailwind CSS imports
│   ├── types.ts                      # TypeScript type definitions
│   │
│   ├── components/
│   │   ├── ConverterWidget.tsx       # Drag-and-drop conversion workspace
│   │   ├── LandingHero.tsx           # Hero, trust factors, SEO summaries
│   │   ├── LanguageDropdown.tsx      # Multilingual selector
│   │   ├── CustomSelect.tsx          # Reusable dropdown component
│   │   └── GuideSection.tsx          # Deploy guide & dynamic FAQ
│   │
│   ├── utils/
│   │   ├── converter.ts              # Pure offline conversion algorithms
│   │   └── translations.ts           # 10-language UI localization
│   │
│   └── assets/                       # Static assets
│
├── index.html                        # HTML shell
├── metadata.json                     # App metadata
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript config
├── .env.example                      # Environment variable template
└── package.json                      # Dependencies
```

---

## 🧪 Verify Zero Server Uploads

Want proof that nothing leaves your device?

1. Load the webpage in your browser.
2. Open developer tools (**F12** or **Option + Cmd + I**) → **Network Tab**.
3. Switch off your WiFi (or set network throttling to **Offline**).
4. Upload and run a conversion.
5. ✅ The processing completes **locally in your memory heap**!

---

## 📜 License & Legal

- **License:** MIT — free to use, modify, and distribute
- **Privacy:** Your files are never collected or transmitted

---

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

---

## 📞 Support & Contact

For issues, questions, or suggestions, please [open an issue on GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH/issues) or contact the maintainer.

<div align="center">

**Made with ❤️ by Mohammad Reza Abedinpoor**

</div>

---

<br>

# 🇮🇷 <a name="persian-description"></a>توضیحات فارسی

<div align="center">

# PIMXMORPH 🔒🔄

### پلتفرم پیشرفته تبدیل فایل کاملاً سمت کلاینت و آفلاین

</div>

🌐 **آدرس سایت:**
**https://pimxmorph.pages.dev/**

---

## 🧩 PIMXMORPH چیست؟

**PIMXMORPH** یک مجموعه‌ی **۱۰۰٪ سمت کلاینت و حریم‌خصوصی‌محور** برای تبدیل فایل است. تمام پردازش‌ها **کاملاً داخل مرورگر شما** و با جاوااسکریپت اجرا می‌شوند — **هیچ فایلی هرگز به هیچ سروری آپلود نمی‌شود**. این ابزار برای کاربرانی طراحی شده که با اسناد محرمانه سروکار دارند (وکلا، پزشکان، حسابداران و کاربران حساس به حریم خصوصی) و نیاز دارند فایل‌هایشان را بدون نشت حتی یک بایت به فضای ابری، تبدیل، ادغام، تقسیم یا فشرده کنند.

### قابلیت‌های کلیدی
- 🔒 **بدون ترافیک شبکه** — فایل‌ها هرگز دستگاه شما را ترک نمی‌کنند
- 🌍 **رابط کاربری ۱۰ زبانه** (انگلیسی، فارسی، روسی، چینی، فرانسوی، ایتالیایی، آلمانی، عربی، لاتین، یونانی)
- 📄 **تبدیل چند فرمتی** — PDF، DOCX، تصاویر، HEIC و بیشتر
- ⚡ **سرعت بالا** — الگوریتم‌های بهینه‌شده سمت کلاینت
- 🌐 **پشتیبانی کامل RTL/LTR** برای فارسی و عربی
- 🌗 **تم روشن/تاریک** با ذخیره‌سازی
- 📱 **طراحی کاملاً واکنش‌گرا**
- 🛡️ **کار آفلاین** — پس از بارگذاری، می‌توانید اینترنت را قطع کنید

---

## ✨ ویژگی‌های اصلی

### 🔐 معماری حریم‌خصوصی‌محور
- **پردازش ۱۰۰٪ سمت کلاینت** — هر بایت در مرورگر شما می‌ماند
- **بدون آپلود به سرور** — هیچ بک‌اندی فایل شما را دریافت نمی‌کند
- **اجرای سندباکس‌شده** — محاسبات داخل سندباکس مرورگر انجام می‌شود
- **قابل استفاده آفلاین** — پس از بارگذاری صفحه، اتصال را قطع کنید و ادامه دهید

### 🎨 تجربه کاربری
- **فضای کاری درگ‌اند‌دراپ** با بازخورد لحظه‌ای
- **پردازش بلادرنگ** با نوار پیشرفت زنده
- **تشخیص هوشمند خودکار** نوع فایل
- **کپی / دانلود** مستقیم نتایج به دستگاه
- **ذخیره تنظیمات** (تم، زبان) در LocalStorage

### 🌐 پشتیبانی چندزبانه
- **بومی‌سازی کامل رابط** در ۱۰ زبان
- **پشتیبانی جهت متن RTL/LTR** برای فارسی و عربی
- **متادیتای SEO بومی‌سازی‌شده** برای هر مبدل

### ⚙️ جعبه‌ابزار تبدیل
| ابزار | توضیحات |
|------|---------|
| 🪄 **تشخیص هوشمند** | تشخیص خودکار نوع فایل و انتخاب ابزار مناسب |
| 🖼️ **PDF → JPG/PNG** | رندر صفحات PDF به تصاویر باکیفیت |
| 📝 **PDF → Word** | تبدیل PDF به اسناد Word قابل ویرایش |
| 🎚️ **مبدل تصویر** | تبدیل/فشرده‌سازی به JPG، PNG، WebP، GIF، BMP |
| 📄 **تصویر → PDF** | ترکیب عکس‌ها در صفحات PDF |
| 🔗 **ادغام PDF** | ترکیب چند PDF در یک فایل |
| ✂️ **تقسیم PDF** | استخراج بازه‌های خاصی از صفحات |
| 📦 **فشرده‌سازی PDF** | کاهش حجم بدون افت کیفیت |
| 📱 **HEIC → JPG/PNG** | باز کردن عکس‌های iOS HEIC/HEIF |

---

## 🔐 مدل داده و حریم خصوصی

این پروژه با استراتژی سخت‌گیرانه **فقط محلی**، حریم خصوصی کاربر را در اولویت قرار می‌دهد:

**ذخیره‌شده فقط در مرورگر (LocalStorage):**
- تنظیمات تم (روشن/تاریک)
- زبان انتخاب‌شده
- شمارنده روزانه فایل‌های پردازش‌شده
- وضعیت عضویت Pro

**ارسال‌شده به سرور:**
- ❌ **هیچ‌چیز.** فایل‌ها **هرگز** منتقل نمی‌شوند.

> **نتیجه:** اسناد شما **کاملاً خصوصی** باقی می‌مانند. ✅

---

## 🛠️ پشته تکنولوژی

| تکنولوژی | هدف |
|----------|-----|
| **React 19** | فریم‌ورک UI |
| **TypeScript** | توسعه تایپ‌ایمن |
| **Vite 6** | ابزار Build و Dev Server |
| **Tailwind CSS 4** | استایل‌دهی و تم |
| **Lucide React** | آیکون‌ها و کامپوننت‌ها |
| **Motion** | انیمیشن‌های روان |
| **pdf-lib** | دستکاری PDF سمت کلاینت |
| **heic2any** | دیکود HEIC/HEIF اپل |
| **docx** | تولید اسناد Word |
| **Cloudflare Pages** | هاست و دیپلوی |

---

## 🚀 راه‌اندازی محلی

### پیش‌نیازها
- **Node.js 16+** (۱۸+ توصیه می‌شود)
- **npm** یا **yarn**

### مراحل نصب

**۱. کلون کردن مخزن:**
```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH.git
cd PIMX_MORPH
```

**۲. نصب وابستگی‌ها:**
```bash
npm install
```

**۳. اجرای سرور توسعه:**
```bash
npm run dev
```
آدرس: **http://localhost:3000**

**۴. ساخت نسخه تولید:**
```bash
npm run build
```

---

## ☁️ دیپلوی روی Cloudflare Pages

### تنظیمات ضروری

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js:** 18+

### فایل `wrangler.toml`
```toml
name = "pimxmorph"
pages_build_output_dir = "dist"
```

> ⚠️ **توجه:** برای پروژه‌های Pages، از افزودن بلوک‌های build پشتیبانی‌نشده به `wrangler.toml` خودداری کنید.

---

## 🧪 تأیید عدم آپلود به سرور

می‌خواهید ثابت کنیم چیزی دستگاه شما را ترک نمی‌کند؟

۱. صفحه را در مرورگر بارگذاری کنید.
۲. ابزار توسعه را باز کنید (**F12**) → تب **Network**.
۳. وای‌فای را خاموش کنید (یا حالت **Offline** را انتخاب کنید).
۴. یک فایل آپلود و تبدیل کنید.
۵. ✅ پردازش **به‌صورت محلی در حافظه شما** کامل می‌شود!

---

## 📜 مجوز و حقوقی
- **مجوز:** MIT — استفاده، تغییر و توزیع آزاد
- **حریم خصوصی:** فایل‌های شما هرگز جمع‌آوری یا منتقل نمی‌شوند

---

## 📞 پشتیبانی و تماس

برای مشکلات، سوالات یا پیشنهادات، لطفاً [در گیت‌هاب ایشو باز کنید](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH/issues) یا با نگهدارنده در تماس باشید.

<div align="center">

**ساخته‌شده با ❤️ توسط Mohammad Reza Abedinpoor**

</div>
