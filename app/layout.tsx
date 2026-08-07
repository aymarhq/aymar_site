import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aymar.com.br'),
  title: { default: 'aymar — tecnologia aplicada', template: '%s — aymar' },
  description: 'Software próprio, dados unificados e IA aplicada para operações que precisam avançar.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: { type: 'website', locale: 'pt_BR', url: '/', siteName: 'aymar', title: 'aymar — tecnologia aplicada', description: 'Software próprio, dados unificados e IA aplicada para operações que precisam avançar.' },
  twitter: { card: 'summary_large_image', title: 'aymar — tecnologia aplicada', description: 'Software próprio, dados unificados e IA aplicada para operações que precisam avançar.' },
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.jpg', apple: '/favicon.jpg' }
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }, { media: '(prefers-color-scheme: light)', color: '#f5f4ef' }] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = { __html: `(() => { const saved = localStorage.getItem('aymar-theme'); const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = saved || system; })()` };
  return <html lang="pt-BR" suppressHydrationWarning><head><script dangerouslySetInnerHTML={themeScript} /></head><body>{children}</body></html>;
}
