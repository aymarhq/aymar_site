import type { Metadata } from 'next';
import { en } from '../../dictionaries/en';
import { pt } from '../../dictionaries/pt';

export function generateStaticParams() { return [{ lang: 'pt' }, { lang: 'en' }]; }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = lang === 'en' ? en : pt;
  const path = lang === 'en' ? '/en' : '/';
  return {
    metadataBase: new URL('https://aymar.com.br'),
    title: { default: dict.metadata.title, template: '%s — aymar' },
    description: dict.metadata.description,
    alternates: { canonical: path, languages: { 'pt-BR': '/', en: '/en', 'x-default': '/' } },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: { type: 'website', locale: dict.locale, url: path, siteName: 'aymar', title: dict.metadata.title, description: dict.metadata.description },
    twitter: { card: 'summary_large_image', title: dict.metadata.title, description: dict.metadata.description },
    manifest: '/manifest.webmanifest', icons: { icon: '/favicon.jpg', apple: '/favicon.jpg' }
  };
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }, { media: '(prefers-color-scheme: light)', color: '#f5f4ef' }] };

export default async function LangLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  await params;
  return children;
}
