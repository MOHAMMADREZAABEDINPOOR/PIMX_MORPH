# PIMX MORPH — Folded M

The mark is an M made from folding file edges. Its cobalt body is paired with one apricot fold; the clipped right stem gives the shape a forward direction.

- `morph-logo.svg`: primary horizontal logo, with all lettering converted to vector outlines.
- `morph-logo.png`: transparent 1470 × 480 PNG.
- `morph-symbol.svg` and `.png`: standalone symbol; PNG is transparent 1024 × 1024.
- `morph-logo-white.*` and `morph-symbol-white.*`: paper-and-apricot versions for dark backgrounds.
- `morph-logo-mono.svg`, `morph-symbol-mono.svg`, `morph-symbol-mono-white.svg`: single-color variants.
- `morph-brand-preview.png`: presentation sheet.

Keep clear space of at least one quarter of the symbol width. Preserve aspect ratio and the right-hand clipped stem. Use the SVG at small sizes and for print. Avoid adding gradients, outlines or shadows to the primary mark.

Geometry is original project artwork. Lettering uses outlined Manrope, SIL OFL 1.1; source and license are in `assets/brand/`. Rebuild with `node scripts/create-brand.mjs`, followed by `node scripts/create-icons.mjs` for the site/PWA icons. These scripts need the project's existing dependencies and Chrome.
