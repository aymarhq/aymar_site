import { del, list, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isPortfolioAdmin } from '../../../../lib/portfolio-auth';
import { isPortfolioUploadPathname, portfolioOffers } from '../../../../lib/portfolio';

export const runtime = 'nodejs';

const manifestPath = 'portfolio-admin/hidden-drive-videos.json';

async function readHiddenDriveVideos() {
  const page = await list({ prefix: manifestPath, limit: 1 });
  const manifest = page.blobs.find(({ pathname }) => pathname === manifestPath);
  if (!manifest) return { ids: [] as string[], etag: undefined as string | undefined };
  const response = await fetch(manifest.url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível ler o catálogo de vídeos removidos.');
  const data: unknown = await response.json();
  return {
    ids: Array.isArray(data) ? data.filter((id): id is string => typeof id === 'string') : [],
    etag: manifest.etag,
  };
}

export async function DELETE(request: Request) {
  if (!(await isPortfolioAdmin())) return NextResponse.json({ error: 'Acesso negado. Entre como administrador.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'O armazenamento ainda não está conectado.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  let body: { source?: unknown; pathname?: unknown; id?: unknown; pathnames?: unknown; ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    if (body.source === 'upload' && Array.isArray(body.pathnames)) {
      const pathnames = Array.from(new Set(body.pathnames.filter((value): value is string => typeof value === 'string')));
      if (!pathnames.length || pathnames.length !== body.pathnames.length || pathnames.length > 300) return NextResponse.json({ error: 'Seleção de vídeos inválida.' }, { status: 400 });
      const blobs = [];
      for (const pathname of pathnames) {
        if (!isPortfolioUploadPathname(pathname)) return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
        const page = await list({ prefix: pathname, limit: 2 });
        const blob = page.blobs.find(({ pathname: candidate }) => candidate === pathname);
        if (!blob) return NextResponse.json({ error: 'Um ou mais vídeos não estão mais no armazenamento.' }, { status: 404 });
        blobs.push(blob);
      }
      await del(pathnames);
      return NextResponse.json({ deleted: blobs.length, source: 'upload' });
    }

    if (body.source === 'drive' && Array.isArray(body.ids)) {
      const ids = Array.from(new Set(body.ids.filter((value): value is string => typeof value === 'string')));
      if (!ids.length || ids.length !== body.ids.length || ids.length > 300) return NextResponse.json({ error: 'Seleção de vídeos inválida.' }, { status: 400 });
      const knownIds = new Set(portfolioOffers.flatMap((offer) => offer.videos.map(({ id }) => id)));
      if (ids.some((id) => !knownIds.has(id))) return NextResponse.json({ error: 'Um ou mais vídeos são inválidos.' }, { status: 400 });
      const { ids: hiddenIds, etag } = await readHiddenDriveVideos();
      const hidden = new Set([...hiddenIds, ...ids]);
      await put(manifestPath, JSON.stringify(Array.from(hidden)), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return NextResponse.json({ deleted: ids.length, source: 'drive' });
    }

    if (body.source === 'upload' && typeof body.pathname === 'string') {
      if (!isPortfolioUploadPathname(body.pathname)) return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
      const page = await list({ prefix: body.pathname, limit: 2 });
      const blob = page.blobs.find(({ pathname }) => pathname === body.pathname);
      if (!blob) return NextResponse.json({ error: 'Esse vídeo não está mais no armazenamento.' }, { status: 404 });
      await del(body.pathname);
      return NextResponse.json({ deleted: true, source: 'upload' });
    }

    if (body.source === 'drive' && typeof body.id === 'string') {
      const knownId = portfolioOffers.some((offer) => offer.videos.some((video) => video.id === body.id));
      if (!knownId) return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
      const { ids, etag } = await readHiddenDriveVideos();
      if (!ids.includes(body.id)) {
        await put(manifestPath, JSON.stringify([...ids, body.id]), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          cacheControlMaxAge: 60,
          ...(etag ? { ifMatch: etag } : {}),
        });
      }
      return NextResponse.json({ deleted: true, source: 'drive' });
    }

    return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
  } catch (error) {
    console.error('Não foi possível remover vídeo do portfólio:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível remover o vídeo.' }, { status: 500 });
  }
}
