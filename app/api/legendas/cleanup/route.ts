import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { sameOrigin } from '../../../../lib/legendas-auth';
import { portfolioSession } from '../../../../lib/portfolio-auth';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const session = await portfolioSession();
  if (!session) return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  const value = typeof body?.url === 'string' ? body.url : '';
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith('.blob.vercel-storage.com') || !url.pathname.includes(`/legendas/${session.username}/`)) throw new Error('Arquivo inválido.');
    await del(value);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível remover o arquivo temporário.' }, { status: 400 });
  }
}
