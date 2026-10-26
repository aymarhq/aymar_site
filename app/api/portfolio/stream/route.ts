import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { portfolioSession } from '../../../../lib/portfolio-auth';
import { getHiddenDriveVideoIds } from '../../../../lib/portfolio-manifest';
import { isPortfolioUploadPathname, portfolioOffers } from '../../../../lib/portfolio';

export const runtime = 'nodejs';

function privateMediaHeaders(contentType: string, source: { get(name: string): string | null }) {
  const headers = new Headers({
    'Cache-Control': 'private, no-store, max-age=0',
    'Content-Disposition': 'inline',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Accept-Ranges': 'bytes',
  });
  for (const name of ['content-length', 'content-range']) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function getStoredFile(pathname: string, range: string | null) {
  const headers = range ? { Range: range } : undefined;
  for (const access of ['private', 'public'] as const) {
    try {
      const result = await get(pathname, { access, useCache: false, headers });
      if (result?.statusCode === 200 && result.stream) return result;
    } catch {
      // Existing portfolio uploads are public; newly uploaded files can be private.
    }
  }
  return null;
}

export async function GET(request: Request) {
  if (!(await portfolioSession())) return NextResponse.json({ error: 'Entre no portfólio para assistir aos vídeos.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');
  const poster = searchParams.get('poster') === '1';
  const range = request.headers.get('range');
  if (range && !/^bytes=\d*-\d*$/.test(range)) return new Response(null, { status: 416, headers: { 'Accept-Ranges': 'bytes' } });

  if (pathname) {
    if (poster || !isPortfolioUploadPathname(pathname)) return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'O armazenamento ainda não está conectado.' }, { status: 503 });
    const blob = await getStoredFile(pathname, range);
    if (!blob) return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 });
    const type = blob.blob.contentType || 'video/mp4';
    const partial = Boolean(blob.headers.get('content-range'));
    return new Response(blob.stream, { status: partial ? 206 : 200, headers: privateMediaHeaders(type, blob.headers) });
  }

  const slug = searchParams.get('offer') ?? '';
  const rawIndex = searchParams.get('index') ?? '';
  const index = /^\d+$/.test(rawIndex) ? Number(rawIndex) : -1;
  const offer = portfolioOffers.find((item) => item.slug === slug);
  const video = offer?.videos[index];
  if (!offer || !video) return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 404 });
  if ((await getHiddenDriveVideoIds()).includes(video.id)) return NextResponse.json({ error: 'Vídeo indisponível.' }, { status: 404 });

  const upstreamUrl = poster
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(video.id)}&sz=w600`
    : `https://drive.google.com/uc?export=download&id=${encodeURIComponent(video.id)}`;
  try {
    const upstream = await fetch(upstreamUrl, { cache: 'no-store', redirect: 'follow', headers: range ? { Range: range } : undefined });
    if (!upstream.ok || !upstream.body) return NextResponse.json({ error: 'Não foi possível carregar este vídeo.' }, { status: 502 });
    const type = upstream.headers.get('content-type') ?? (poster ? 'image/jpeg' : 'video/mp4');
    if (type.includes('text/html')) return NextResponse.json({ error: 'O Drive não liberou a reprodução deste vídeo.' }, { status: 502 });
    const headers = privateMediaHeaders(poster ? type : 'video/mp4', upstream.headers);
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    console.error('Não foi possível transmitir vídeo do portfólio:', error);
    return NextResponse.json({ error: 'Falha ao carregar vídeo.' }, { status: 502 });
  }
}
