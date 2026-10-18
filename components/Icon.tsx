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
export function Upload(props: IconProps) { return <Icon {...props}><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M5 14v5h14v-5" /></Icon>; }
export function Cloud(props: IconProps) { return <Icon {...props}><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18Z" /></Icon>; }
export function Phone(props: IconProps) { return <Icon {...props}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M10 5h4m-3 13.5h2" /></Icon>; }
export function Key(props: IconProps) { return <Icon {...props}><circle cx="8" cy="12" r="4" /><path d="m12 12 9-9m-4 4 3 3m-6 0 3 3" /></Icon>; }
export function Download(props: IconProps) { return <Icon {...props}><path d="M12 4v12m-5-5 5 5 5-5" /><path d="M5 20h14" /></Icon>; }
export function Trash(props: IconProps) { return <Icon {...props}><path d="M4 7h16m-10 4v6m4-6v6M8 7l1-3h6l1 3m2 0-1 14H7L6 7" /></Icon>; }
export function Eye(props: IconProps) { return <Icon {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></Icon>; }
export function Plus(props: IconProps) { return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>; }
export function Sparkles(props: IconProps) { return <Icon {...props}><path d="m12 2 1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" /></Icon>; }
