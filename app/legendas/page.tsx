import type { Metadata } from 'next';
import { assemblyAiStatus } from '../../lib/legendas-auth';
import { portfolioSession } from '../../lib/portfolio-auth';
import LegendasClient from './legendas-client';
import LegendasLogin from './legendas-login';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Legendas para Vídeos | Aymar Labs',
  description: 'Transcreva, edite, anime e exporte legendas para seus vídeos.',
  robots: { index: false, follow: false },
};

export default async function LegendasPage() {
  const session = await portfolioSession();
  if (!session) return <LegendasLogin configured={Boolean(process.env.PORTFOLIO_ADMIN_PASSWORD || process.env.PORTFOLIO_STUDENT_PASSWORD)} />;
  const assembly = await assemblyAiStatus();
  return <LegendasClient username={session.username} initialKeyConfigured={assembly.configured} initialKeySource={assembly.source} />;
}
