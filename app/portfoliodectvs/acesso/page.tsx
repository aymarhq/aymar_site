import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { portfolioSession } from '../../../lib/portfolio-auth';
import PortfolioLogin from '../portfolio-login';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Acesso completo | Aymar Labs',
  robots: { index: false, follow: false },
};

export default async function PortfolioAdminAccessPage() {
  const session = await portfolioSession();
  if (session?.role === 'admin') redirect('/portfoliodectvs');

  return <PortfolioLogin configured={Boolean(process.env.PORTFOLIO_ADMIN_PASSWORD && process.env.PORTFOLIO_ADMIN_EMAIL)} />;
}
