import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { portfolioSession } from '../../../../lib/portfolio-auth';
import { isPortfolioUploadPathname, portfolioOffers } from '../../../../lib/portfolio';

export const runtime = 'nodejs';

function attachmentHeaders(name: string, contentType: string) {
  const safeName = name.replace(/[\r\n"\\]/g, '_');
  return {
    'Content-Disposition': `attachment; filename="${safeName.replace(/[^\x20-\x7E]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    'Content-Type': contentType,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

export async function GET(request: Request) {
  if (!(await portfolioSession())) return NextResponse.json({ error: 'Entre no portfólio para baixar vídeos.' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  let downloadUrl: string | undefined;
  let filename = 'video.mp4';

  if (source === 'drive') {
    const id = searchParams.get('id') ?? '';
    const video = portfolioOffers.flatMap((offer) => offer.videos).find((item) => item.id === id);
    if (!video) return NextResponse.json({ error: 'Vídeo do Drive inválido.' }, { status: 400 });
    filename = video.name;
    downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  } else if (source === 'upload') {
    const pathname = searchParams.get('pathname') ?? '';
    if (!isPortfolioUploadPathname(pathname) || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Vídeo armazenado inválido.' }, { status: 400 });
    const page = await list({ prefix: pathname, limit: 2 });
    const blob = page.blobs.find(({ pathname: candidate }) => candidate === pathname);
    if (!blob) return NextResponse.json({ error: 'Esse vídeo não está mais no armazenamento.' }, { status: 404 });
    downloadUrl = blob.url;
    filename = pathname.split('/').at(-1) ?? filename;
  } else {
    return NextResponse.json({ error: 'Origem do vídeo inválida.' }, { status: 400 });
  }

  try {
    const response = await fetch(downloadUrl, { cache: 'no-store', redirect: 'follow' });
    if (!response.ok || !response.body) return NextResponse.json({ error: 'Não foi possível obter o arquivo. Confira o acesso ao vídeo no Drive.' }, { status: 502 });
    const type = response.headers.get('content-type') ?? 'application/octet-stream';
    if (source === 'drive' && type.includes('text/html')) return NextResponse.json({ error: 'O Drive não liberou o download direto deste arquivo. Confira se ele está compartilhado para visualização.' }, { status: 502 });
    return new Response(response.body, { headers: attachmentHeaders(filename, type) });
  } catch (error) {
    console.error('Não foi possível baixar vídeo do portfólio:', error);
    return NextResponse.json({ error: 'Falha ao baixar o vídeo.' }, { status: 502 });
  }
}
