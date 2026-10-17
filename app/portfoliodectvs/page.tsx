import type { Metadata } from 'next';
import { list } from '@vercel/blob';
import { portfolioOffers } from '../../lib/portfolio';
import { portfolioSession, uploadIsConfigured } from '../../lib/portfolio-auth';
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

async function getHiddenDriveVideos(): Promise<string[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const page = await list({ prefix: 'portfolio-admin/hidden-drive-videos.json', limit: 1 });
    const manifest = page.blobs.find(({ pathname }) => pathname === 'portfolio-admin/hidden-drive-videos.json');
    if (!manifest) return [];
    const response = await fetch(manifest.url, { cache: 'no-store' });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === 'string') : [];
  } catch (error) {
    console.error('Não foi possível carregar vídeos removidos do portfólio:', error);
    return [];
  }
}

export default async function PortfolioPage() {
  const session = await portfolioSession();
  if (!session) return <PortfolioLogin configured={Boolean(process.env.PORTFOLIO_ADMIN_PASSWORD || process.env.PORTFOLIO_STUDENT_PASSWORD)} />;
  const [uploads, hiddenDriveVideos] = await Promise.all([getStoredVideos(), getHiddenDriveVideos()]);
  const offers = portfolioOffers.map((offer) => ({ ...offer, videos: offer.videos.filter(({ id }) => !hiddenDriveVideos.includes(id)) }));
  return <PortfolioClient offers={offers} uploads={uploads} uploadConfigured={uploadIsConfigured()} initialAdmin={session.role === 'admin'} initialUsername={session.username} />;
}
