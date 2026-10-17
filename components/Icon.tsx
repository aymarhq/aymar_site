import type { ReactNode } from 'react';

type IconProps = { className?: string };

function Icon({ children, className = '' }: IconProps & { children: ReactNode }) {
  return <svg className={`ui-icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export function ArrowUpRight(props: IconProps) { return <Icon {...props}><path d="M7 17 17 7M7 7h10v10" /></Icon>; }
export function ArrowRight(props: IconProps) { return <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>; }
export function ArrowLeft(props: IconProps) { return <Icon {...props}><path d="M19 12H5m6 6-6-6 6-6" /></Icon>; }
export function ArrowDown(props: IconProps) { return <Icon {...props}><path d="M12 5v14M6 13l6 6 6-6" /></Icon>; }
export function ArrowUp(props: IconProps) { return <Icon {...props}><path d="M12 19V5M6 11l6-6 6 6" /></Icon>; }
export function Close(props: IconProps) { return <Icon {...props}><path d="M6 6 18 18M18 6 6 18" /></Icon>; }
export function Play(props: IconProps) { return <Icon {...props}><path d="m9 6 10 6-10 6V6Z" fill="currentColor" stroke="none" /></Icon>; }
export function Search(props: IconProps) { return <Icon {...props}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></Icon>; }
export function ChevronDown(props: IconProps) { return <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>; }
export function Home(props: IconProps) { return <Icon {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></Icon>; }
export function Grid(props: IconProps) { return <Icon {...props}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></Icon>; }
export function Circle(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="8" /></Icon>; }
export function Settings(props: IconProps) { return <Icon {...props}><path d="M10 2h4l.6 2.3a8 8 0 0 1 1.7 1l2.2-.7 2 3.5-1.7 1.6a8 8 0 0 1 0 2l1.7 1.6-2 3.5-2.2-.7a8 8 0 0 1-1.7 1L14 22h-4l-.6-2.3a8 8 0 0 1-1.7-1l-2.2.7-2-3.5 1.7-1.6a8 8 0 0 1 0-2L3.5 8.7l2-3.5 2.2.7a8 8 0 0 1 1.7-1L10 2Z" /><circle cx="12" cy="12" r="3" /></Icon>; }
export function TrendUp(props: IconProps) { return <Icon {...props}><path d="m4 16 6-6 4 4 6-7" /><path d="M14 7h6v6" /></Icon>; }
export function TrendDown(props: IconProps) { return <Icon {...props}><path d="m4 8 6 6 4-4 6 7" /><path d="M14 17h6v-6" /></Icon>; }
export function MenuLines({ open = false, className = '' }: IconProps & { open?: boolean }) {
  return <svg className={`ui-icon site-menu-icon ${open ? 'is-open' : ''} ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 9h16" /><path d="M4 15h16" /></svg>;
}
export function CheckDouble(props: IconProps) { return <Icon {...props}><path d="m2 12 4 4 7-8M9 12l4 4 9-9" /></Icon>; }
export function VolumeOn(props: IconProps) { return <Icon {...props}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></Icon>; }
export function VolumeOff(props: IconProps) { return <Icon {...props}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m16 9 5 6m0-6-5 6" /></Icon>; }
