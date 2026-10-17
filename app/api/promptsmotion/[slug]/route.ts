import { NextResponse } from 'next/server';
import snapshot from '../../../../lib/prompt-motion-catalog.json';
import { MOTION_SOURCE, type MotionEntry } from '../../../../lib/prompt-motion-shared';

type PromptCatalog = { entries: MotionEntry[] };

function elementContent(html: string, id: string) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<div\\b(?=[^>]*\\bid=["']${escapedId}["'])[^>]*>([\\s\\S]*?)<\\/div>`, 'i'))?.[1] ?? null;
}

function skillContent(html: string) {
  const heading = /<h2\b[^>]*>\s*Skill\s*<\/h2>/i.exec(html);
  if (!heading) return null;
  const section = html.slice(heading.index, heading.index + 12000);
  const descriptionHtml = section.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? null;
  const commandHtml = section.match(/<code\b[^>]*>([\s\S]*?)<\/code>/i)?.[1] ?? null;
  return descriptionHtml ? { descriptionHtml, commandHtml } : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = snapshot as PromptCatalog;
  const entry = catalog.entries.find((item) => item.slug === slug);
  if (!entry) return NextResponse.json({ error: 'Animação não encontrada.' }, { status: 404 });

  try {
    const response = await fetch(`${MOTION_SOURCE}/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`A fonte retornou ${response.status}.`);
    const html = await response.text();
    const promptHtml = elementContent(html, 'entry-prompt');
    const skill = entry.tags.includes('skill') ? skillContent(html) : null;
    if (!promptHtml && !skill) throw new Error('O conteúdo desta animação não está disponível.');

    return NextResponse.json({ promptHtml, skill }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar o prompt agora.' }, { status: 502 });
  }
}
