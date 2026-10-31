import type { Metadata } from 'next';
import PromptMotion from './prompt-motion';
import PromptMotionLogin from './prompt-motion-login';
import { getMotionCatalog } from '../../lib/prompt-motion';
import { portfolioSession } from '../../lib/portfolio-auth';
import { productMagicLinkReady, productSession } from '../../lib/product-access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Prompts Motion | Aymar Labs',
  description: 'Animações, prompts e skills do catálogo Prompt Motion na Aymar Labs.',
  robots: { index: false, follow: false },
};

export default async function PromptMotionPage() {
  const portfolio = await portfolioSession();
  const buyer = portfolio?.role === 'admin' ? null : await productSession('promptsmotion');
  const username = portfolio?.role === 'admin' ? portfolio.username : buyer?.username;
  if (!username) return <PromptMotionLogin configured={productMagicLinkReady()} />;
  return <PromptMotion entries={await getMotionCatalog()} />;
}
