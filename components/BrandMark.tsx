type BrandMarkProps = { className?: string };

export default function BrandMark({ className = '' }: BrandMarkProps) {
  return <svg className={`brand-mark ${className}`.trim()} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
    <path d="M50 15.5A34.5 34.5 0 0 1 84.5 50H50V84.5A34.5 34.5 0 1 1 50 15.5Z" fill="currentColor" />
    <circle cx="64.3" cy="64.3" r="10.1" fill="#2F70EF" />
  </svg>;
}
