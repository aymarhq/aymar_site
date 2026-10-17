import type { Metadata } from 'next';
import { portfolioSession } from '../../lib/portfolio-auth';
import type { FormatsCatalog } from '../../lib/creative-formats';
import catalog from '../../lib/creative-formats.json';
import FormatsLibrary from './formats-library';
import FormatsLogin from './formats-login';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '50 Formatos de Criativos que Escalam | Aymar Labs',
  description: '50 formatos de criativos, com explicações, exemplos e bônus.',
  robots: { index: false, follow: false },
};

export default async function FormatsPage() {
  const session = await portfolioSession();
  if (!session) return <FormatsLogin configured={Boolean(process.env.PORTFOLIO_ADMIN_PASSWORD || process.env.PORTFOLIO_STUDENT_PASSWORD)} />;
  return <FormatsLibrary catalog={catalog as FormatsCatalog} username={session.username} />;
}
