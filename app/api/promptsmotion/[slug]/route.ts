import { NextResponse } from 'next/server';
import snapshot from '../../../../lib/prompt-motion-prompts.json';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = snapshot.entries.find((item) => item.slug === slug);
  if (!entry) return NextResponse.json({ error: 'Animação não encontrada.' }, { status: 404 });

  return NextResponse.json(entry, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
