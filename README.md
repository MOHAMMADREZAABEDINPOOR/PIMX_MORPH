# Offline File Converter (100% Client-Side)

An elite, privacy-first, 100% client-side file conversion suite. No files are uploaded to any server. All processing runs locally inside the browser memory loop using **WebAssembly** and optimized JavaScript sandboxing.

---

## 🔒 Why This Architecture?
Standard online file conversion utilities require uploading confidential data (such as healthcare reports, tax documents, estate wills, or photo streams) to remote cloud grids. Here:
* **Zero Network Traffic:** The browser process compiles the document directly within sandboxed virtual bounds.
* **Completely Private:** Ideal for lawyers, doctors, CPA consultants, and privacy-conscious users.
* **Works Offline:** Once the page is loaded, you can sever your internet connection completely.

---

## 📦 Exact npm Packages Installed
* **`pdf-lib`** (v3.0.0+): For native client-side PDF deconstruction, merger, splitting, and structural compression.
* **`heic2any`** (v0.0.4+): Dynamically converts proprietary Apple `.heic`/`.heif` photography formats to standard compressed JPEG or transparent PNG.
* **`docx`** (v9.0.0+): Dynamically generates real flowing formatted Microsoft Word documents (`.docx`) in memory.
* **`lucide-react`** (v0.546.0): Premium clean svg vector icons.
* **`motion`** (v12.23.24): Modern responsive entrance animations.

---

## 📂 Project Directory Structure
```
├── /src
│   ├── /components
│   │   ├── ConverterWidget.tsx   # Drag-and-drop workspace, progress calculations, and settings sliders
│   │   ├── LandingHero.tsx       # Dynamic tag categories, SEO summaries, and privacy status
│   │   ├── ProModal.tsx          # Payment simulation & dual pricing comparisons
│   │   └── GuideSection.tsx      # Multi-column Cloudflare Pages instructions & dynamic FAQs
│   │
│   ├── /utils
│   │   └── converter.ts          # Pure mathematical offline algorithms (PDF, HEIC, Canvas compress)
│   │
│   ├── App.tsx                   # Central React Orchestrator, Persistent Local storage, and Dark Mode
│   ├── main.tsx                  # Standard React DOM Entry Mount
│   └── index.css                 # Import Tailwind CSS utilities
│
├── index.html                    # HTML shell
├── metadata.json                 # AI Studio Application name configuration
├── tsconfig.json                 # TypeScript strict definitions
└── vite.config.ts                # Vite project bundle parameters
```

---

## ⚡ Deployment for Cloudflare Pages (Free Hosting)

Since there is completely **no backend**, hosting on Cloudflare Pages is 100% free with unlimited bandwidth.

1. **Build Static Deliverables:**
   ```bash
   npm run build
   ```
2. **Setup Cloudflare Pages Hook:**
   * Go to **dash.cloudflare.com** → **Workers & Pages** → **Connect to Git**
   * Feed it your project repository structure.
3. **Configure Build Pipeline:**
   * **Framework Preset:** None / Create React App
   * **Build Command:** `npm run build`
   * **Build Directory:** `dist`
4. **Headers configuration (Optional for WASM Multi-threading):**
   If employing high-performance SharedArrayBuffer structures, place a `_headers` file in your build root:
   ```txt
   /*
     Cross-Origin-Opener-Policy: same-origin
     Cross-Origin-Embedder-Policy: require-corp
   ```

---

## 🧪 Verify Zero Server Uploads
* Load the webpage in a browser.
* Open developer tools (**Option + Cmd + I** or **F12**), select **Network Tab**.
* Switch off your WiFi or set network throttling to "Offline".
* Upload and execute a conversion. The calculation completes locally in your memory heap!
