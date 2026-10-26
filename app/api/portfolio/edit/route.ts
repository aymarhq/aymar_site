import { NextResponse } from 'next/server';
import { isPortfolioAdmin } from '../../../../lib/portfolio-auth';
import { savePortfolioVideoTitle } from '../../../../lib/portfolio-manifest';
import { isPortfolioUploadPathname, portfolioOffers } from '../../../../lib/portfolio';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isPortfolioAdmin())) return NextResponse.json({ error: 'Acesso negado. Entre como administrador.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'O armazenamento ainda não está conectado.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const body = await request.json().catch(() => null) as { source?: unknown; offer?: unknown; index?: unknown; pathname?: unknown; title?: unknown } | null;
  if (typeof body?.title !== 'string' || body.title.trim().length > 100) return NextResponse.json({ error: 'O título deve ter até 100 caracteres.' }, { status: 400 });
  const title = body.title.trim();
  let key: string;

  if (body.source === 'drive' && typeof body.offer === 'string' && Number.isInteger(body.index)) {
    const offer = portfolioOffers.find((item) => item.slug === body.offer);
    const index = body.index as number;
    if (!offer || index < 0 || index >= offer.videos.length) return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
    key = `drive:${offer.slug}:${index}`;
  } else if (body.source === 'upload' && typeof body.pathname === 'string' && isPortfolioUploadPathname(body.pathname)) {
    key = `upload:${body.pathname}`;
  } else {
    return NextResponse.json({ error: 'Vídeo inválido.' }, { status: 400 });
  }

  try {
    await savePortfolioVideoTitle(key, title);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Não foi possível editar o vídeo do portfólio:', error);
    return NextResponse.json({ error: 'Não foi possível salvar o título.' }, { status: 500 });
  }
}
