import type { ReactNode } from 'react';

type IconProps = { className?: string };

function Icon({ children, className = '' }: IconProps & { children: ReactNode }) {
  return <svg className={`ui-icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export function ArrowUpRight(props: IconProps) { return <Icon {...props}><path d="M7 17 17 7M7 7h10v10" /></Icon>; }
export function ArrowRight(props: IconProps) { return <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>; }
export function ArrowDown(props: IconProps) { return <Icon {...props}><path d="M12 5v14M6 13l6 6 6-6" /></Icon>; }
export function ArrowUp(props: IconProps) { return <Icon {...props}><path d="M12 19V5M6 11l6-6 6 6" /></Icon>; }
export function CheckDouble(props: IconProps) { return <Icon {...props}><path d="m2 12 4 4 7-8M9 12l4 4 9-9" /></Icon>; }
