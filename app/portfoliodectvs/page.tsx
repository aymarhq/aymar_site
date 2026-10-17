import type { Metadata } from 'next';
import { list } from '@vercel/blob';
import { portfolioOffers } from '../../lib/portfolio';
import { portfolioRole, uploadIsConfigured } from '../../lib/portfolio-auth';
import PortfolioClient, { type StoredVideo } from './portfolio-client';
import PortfolioLogin from './portfolio-login';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portfólio de CTVs | Aymar Labs',
  description: 'Criativos em vídeo da Aymar Labs, organizados por oferta.',
  robots: { index: false, follow: false },
};

async function getStoredVideos(): Promise<StoredVideo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const videos: StoredVideo[] = [];
  let cursor: string | undefined;
  try {
    do {
      const page = await list({ prefix: 'portfolio/', cursor, limit: 1000 });
      videos.push(...page.blobs.map(({ pathname, url, uploadedAt }) => ({ pathname, url, uploadedAt: uploadedAt.toISOString() })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch (error) {
    console.error('Não foi possível listar vídeos do portfólio:', error);
  }
  return videos;
}

export default async function PortfolioPage() {
  const role = await portfolioRole();
  if (!role) return <PortfolioLogin configured={Boolean(process.env.PORTFOLIO_ADMIN_PASSWORD || process.env.PORTFOLIO_STUDENT_PASSWORD)} />;
  const uploads = await getStoredVideos();
  return <PortfolioClient offers={portfolioOffers} uploads={uploads} uploadConfigured={uploadIsConfigured()} initialAdmin={role === 'admin'} />;
}
