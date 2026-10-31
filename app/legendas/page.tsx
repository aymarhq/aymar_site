import type { Metadata } from 'next';
import { deepgramStatus } from '../../lib/legendas-auth';
import { portfolioSession } from '../../lib/portfolio-auth';
import { productMagicLinkReady, productSession } from '../../lib/product-access';
import LegendasClient from './legendas-client';
import LegendasLogin from './legendas-login';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Legendas para Vídeos | Aymar Labs',
  description: 'Transcreva, edite, anime e exporte legendas para seus vídeos.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LegendasPage() {
  const portfolio = await portfolioSession();
  const buyer = portfolio?.role === 'admin' ? null : await productSession('legendas');
  const username = portfolio?.role === 'admin' ? portfolio.username : buyer?.username;
  if (!username) return <LegendasLogin configured={productMagicLinkReady()} />;
  const deepgram = await deepgramStatus();
  return <LegendasClient username={username} initialKeyConfigured={deepgram.configured} />;
}
