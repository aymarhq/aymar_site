import type { Metadata } from 'next';
import { en } from '../../dictionaries/en';
import { pt } from '../../dictionaries/pt';
import { SITE_URL } from '../../lib/site';

export function generateStaticParams() { return [{ lang: 'pt' }, { lang: 'en' }]; }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = lang === 'en' ? en : pt;
  const path = lang === 'en' ? '/en' : '/';
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.metadata.title, template: '%s — Aymar' },
    description: dict.metadata.description,
    alternates: { canonical: `${SITE_URL}${path}`, languages: { 'pt-BR': `${SITE_URL}/`, en: `${SITE_URL}/en`, 'x-default': `${SITE_URL}/` } },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: { type: 'website', locale: dict.locale, url: `${SITE_URL}${path}`, siteName: 'Aymar', title: dict.metadata.title, description: dict.metadata.description, images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Aymar — tecnologia aplicada' }] },
    twitter: { card: 'summary_large_image', title: dict.metadata.title, description: dict.metadata.description, images: [{ url: `${SITE_URL}/opengraph-image`, alt: 'Aymar — tecnologia aplicada' }] },
    manifest: '/manifest.webmanifest', icons: { icon: '/favicon.jpg', apple: '/favicon.jpg' }
  };
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }, { media: '(prefers-color-scheme: light)', color: '#f5f4ef' }] };

export default async function LangLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  await params;
  return children;
}
