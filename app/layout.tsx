import { headers } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL } from '../lib/site';

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }, { media: '(prefers-color-scheme: light)', color: '#f5f4ef' }] };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = (await headers()).get('x-aymar-lang') === 'en' ? 'en' : 'pt-BR';
  const themeScript = { __html: `(() => { const saved = localStorage.getItem('aymar-theme'); const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = saved || system; })()` };
  return <html lang={lang} suppressHydrationWarning><head><script dangerouslySetInnerHTML={themeScript} /></head><body>{children}</body></html>;
}
