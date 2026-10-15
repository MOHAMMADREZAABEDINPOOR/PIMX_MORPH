import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt",
        injectRegister: null,
        manifestFilename: "site.webmanifest",
        manifest: {
          id: "/",
          name: "PIMX MORPH — File Studio",
          short_name: "MORPH",
          description:
            "A local file studio. Convert images, PDFs, documents, audio and video on your device.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#f5f5f0",
          theme_color: "#f5f5f0",
          categories: ["utilities", "productivity"],
          lang: "en",
          icons: [
            {
              src: "/pwa-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        includeAssets: [
          "favicon.svg",
          "icon.svg",
          "apple-touch-icon.png",
          "pwa-*.png",
        ],
        workbox: {
          globPatterns: [
            "**/*.{js,mjs,css,html,svg,png,woff2,ttf,bcmap,wasm,pfb}",
          ],
          globIgnores: ["engines/**"],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          navigateFallbackDenylist: [
            /^\/api\//,
            /^\/engines\//,
            /^\/pdf\//,
            /^\/pimxmorphadmin/,
          ],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin &&
                /^\/engines\/ffmpeg-core(?:\.js|-[01]\.bin)$/.test(
                  url.pathname,
                ),
              handler: "CacheFirst",
              options: {
                cacheName: "morph-media-v1",
                cacheableResponse: { statuses: [200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
