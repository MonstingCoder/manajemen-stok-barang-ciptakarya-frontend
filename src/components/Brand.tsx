export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand${compact ? " brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8.25 12 4l8 4.25v7.5L12 20l-8-4.25v-7.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="m4.5 8.5 7.5 4 7.5-4M12 12.5V20" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>Cipta Karya</strong>
        <small>INVENTARIS</small>
      </span>
    </div>
  );
}
