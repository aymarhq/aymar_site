import type { Metadata } from 'next';
import { portfolioSession } from '../../lib/portfolio-auth';
import { formatsSession } from '../../lib/formats-access';
import type { FormatsCatalog } from '../../lib/creative-formats';
import catalog from '../../lib/creative-formats.json';
import FormatsLibrary from '../formatosdectvs/formats-library';
import FormatsLogin from '../formatosdectvs/formats-login';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '50 Formatos de Criativos que Escalam | Aymar Labs',
  description: '50 formatos de criativos, com explicações, exemplos e bônus.',
  robots: { index: false, follow: false },
};

export default async function FormatsPage() {
  const portfolio = await portfolioSession();
  if (portfolio?.role === 'admin') return <FormatsLibrary catalog={catalog as FormatsCatalog} username={portfolio.username} />;
  const buyer = await formatsSession();
  if (!buyer) return <FormatsLogin configured={Boolean(process.env.STRIPE_SECRET_KEY && process.env.BLOB_READ_WRITE_TOKEN)} />;
  return <FormatsLibrary catalog={catalog as FormatsCatalog} username={buyer.username} />;
}
