import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isPortfolioAdmin, uploadIsConfigured } from '../../../../lib/portfolio-auth';
import { portfolioOffers } from '../../../../lib/portfolio';

export const runtime = 'nodejs';

const validSlugs = new Set(portfolioOffers.map((offer) => offer.slug));

export async function POST(request: Request) {
  if (!uploadIsConfigured()) return NextResponse.json({ error: 'O envio ainda não foi configurado.' }, { status: 503 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  let body: HandleUploadBody;
  try {
    body = await request.json() as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isPortfolioAdmin())) throw new Error('Acesso negado. Entre como administrador.');
        const match = /^portfolio\/([a-z0-9-]+)\/([a-z0-9._-]+\.(?:mp4|mov|webm|m4v))$/.exec(pathname);
        if (!match || !validSlugs.has(match[1])) throw new Error('Pasta ou nome de arquivo inválido.');
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
          maximumSizeInBytes: 1024 * 1024 * 1024,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível enviar o vídeo.' }, { status: 400 });
  }
}
