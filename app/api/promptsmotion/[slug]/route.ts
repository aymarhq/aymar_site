import { NextResponse } from 'next/server';
import snapshot from '../../../../lib/prompt-motion-prompts.json';
import { portfolioSession } from '../../../../lib/portfolio-auth';
import { productSession } from '../../../../lib/product-access';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const portfolio = await portfolioSession();
  if (portfolio?.role !== 'admin' && !(await productSession('promptsmotion'))) return NextResponse.json({ error: 'Entre na área exclusiva para continuar.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  const { slug } = await params;
  const entry = snapshot.entries.find((item) => item.slug === slug);
  if (!entry) return NextResponse.json({ error: 'Animação não encontrada.' }, { status: 404 });

  return NextResponse.json(entry, { headers: { 'Cache-Control': 'private, no-store' } });
}
