import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { legendasIdentity, sameOrigin } from '../../../../lib/legendas-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'O armazenamento ainda não foi configurado.' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  let body: HandleUploadBody;
  try { body = await request.json() as HandleUploadBody; }
  catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await legendasIdentity();
        if (!session) throw new Error('Entre na área exclusiva para enviar vídeos.');
        const expectedPrefix = `legendas/${session.username}/`;
        if (!pathname.startsWith(expectedPrefix) || !/\.(?:mp4|mov|webm|m4v)$/i.test(pathname)) throw new Error('Nome ou formato de vídeo inválido.');
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
          maximumSizeInBytes: 2 * 1024 * 1024 * 1024,
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
