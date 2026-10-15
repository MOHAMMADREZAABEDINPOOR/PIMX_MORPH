import geometry from "../../assets/brand/geometry.json";

/** Shift monogram: opposing file ribbons cross through an apricot bridge. */
export default function BrandMark() {
  return (
    <svg viewBox={geometry.viewBox} aria-hidden="true" focusable="false">
      <path d={geometry.body} fill="currentColor" fillRule="evenodd" />
      <path d={geometry.fold} fill="var(--brand-fold, #ed8058)" />
    </svg>
  );
}
