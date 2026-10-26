import type { Metadata } from 'next';
import { list } from '@vercel/blob';
import { portfolioOffers } from '../../lib/portfolio';
import { getHiddenDriveVideoIds, getPortfolioVideoTitles } from '../../lib/portfolio-manifest';
import { portfolioSession, uploadIsConfigured } from '../../lib/portfolio-auth';
import PortfolioClient, { type LibraryOffer, type StoredVideo } from './portfolio-client';

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
      videos.push(...page.blobs.map(({ pathname, uploadedAt }) => ({ pathname, uploadedAt: uploadedAt.toISOString() })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch (error) {
    console.error('Não foi possível listar vídeos do portfólio:', error);
  }
  return videos;
}

export default async function PortfolioPage() {
  const session = await portfolioSession();
  const [uploads, hiddenDriveVideos, titles] = await Promise.all([getStoredVideos(), getHiddenDriveVideoIds(), getPortfolioVideoTitles()]);
  const hiddenIds = new Set(hiddenDriveVideos);
  const offers: LibraryOffer[] = portfolioOffers.map((offer) => {
    const driveVideos = offer.videos.flatMap((video, index) => {
      if (hiddenIds.has(video.id)) return [];
      const key = `drive:${offer.slug}:${index}`;
      const params = new URLSearchParams({ offer: offer.slug, index: String(index) });
      return [{
        key,
        name: titles[key] ?? video.name,
        source: 'Drive' as const,
        src: `/api/portfolio/stream?${params}`,
        thumbnail: `/api/portfolio/stream?${params}&poster=1`,
        driveIndex: index,
      }];
    });
    const uploadedVideos = uploads.filter(({ pathname }) => pathname.startsWith(`portfolio/${offer.slug}/`)).map(({ pathname }) => {
      const key = `upload:${pathname}`;
      return {
        key,
        name: titles[key] ?? pathname.split('/').at(-1) ?? 'Vídeo',
        source: 'Arquivo' as const,
        src: `/api/portfolio/stream?${new URLSearchParams({ pathname })}`,
        pathname,
      };
    });
    return { slug: offer.slug, name: offer.name, market: offer.market, videos: [...uploadedVideos, ...driveVideos] };
  });
  return <PortfolioClient offers={offers} uploadConfigured={uploadIsConfigured()} initialAdmin={session?.role === 'admin'} initialUsername={session?.role === 'admin' ? session.username : ''} />;
}
