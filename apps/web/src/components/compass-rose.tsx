/* Decorative compass rose — used across the poster and the app mockup. */
export function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="100" cy="100" r="74" stroke="currentColor" strokeOpacity="0.18" />
      <circle
        cx="100"
        cy="100"
        r="86"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeDasharray="1 7"
      />
      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeOpacity="0.2" />
      <path
        d="M100 38 L112 100 L100 162 L88 100 Z"
        fill="currentColor"
        fillOpacity="0.25"
        transform="rotate(45 100 100)"
      />
      <path
        d="M38 100 L100 112 L162 100 L100 88 Z"
        fill="currentColor"
        fillOpacity="0.25"
        transform="rotate(45 100 100)"
      />
      <path d="M100 20 L110 100 L100 100 L90 100 Z" fill="currentColor" />
      <path d="M100 180 L110 100 L100 100 L90 100 Z" fill="currentColor" fillOpacity="0.8" />
      <path d="M20 100 L100 110 L100 100 L100 90 Z" fill="currentColor" fillOpacity="0.8" />
      <path d="M180 100 L100 110 L100 100 L100 90 Z" fill="currentColor" fillOpacity="0.8" />
      <circle cx="100" cy="100" r="5" fill="currentColor" />
    </svg>
  );
}
