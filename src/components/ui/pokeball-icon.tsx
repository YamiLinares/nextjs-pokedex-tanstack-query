export function PokeballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#13233f" strokeWidth="3" />
      <path d="M2 20a18 18 0 0 1 36 0z" fill="#e3350d" stroke="#13233f" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="5.5" fill="#ffffff" stroke="#13233f" strokeWidth="3" />
    </svg>
  );
}
