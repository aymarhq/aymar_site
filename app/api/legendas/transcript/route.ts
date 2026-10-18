import { NextResponse } from 'next/server';
import { assemblyAiKey, isAllowedMediaUrl, sameOrigin } from '../../../../lib/legendas-auth';
import { portfolioSession } from '../../../../lib/portfolio-auth';

export const runtime = 'nodejs';
const languages = new Set(['pt', 'en', 'es', 'fr', 'de', 'it', 'nl', 'pl']);

async function authorizedKey() {
  if (!(await portfolioSession())) return null;
  return assemblyAiKey();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const apiKey = await authorizedKey();
  if (!apiKey) return NextResponse.json({ error: 'Conecte sua chave AssemblyAI antes de gerar legendas.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { audioUrl?: unknown; language?: unknown } | null;
  const audioUrl = typeof body?.audioUrl === 'string' ? body.audioUrl : '';
  const language = typeof body?.language === 'string' ? body.language : 'auto';
  if (!isAllowedMediaUrl(audioUrl)) return NextResponse.json({ error: 'Use um vídeo enviado pela página ou um link válido do Google Drive.' }, { status: 400 });
  if (language !== 'auto' && !languages.has(language)) return NextResponse.json({ error: 'Idioma inválido.' }, { status: 400 });

  const payload: Record<string, unknown> = {
    audio_url: audioUrl,
    speech_models: ['universal-3-pro', 'universal-2'],
    format_text: true,
    punctuate: true,
  };
  if (language === 'auto') payload.language_detection = true;
  else payload.language_code = language;

  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({})) as { id?: string; status?: string; error?: string };
  if (!response.ok || !result.id) return NextResponse.json({ error: result.error || 'A AssemblyAI não conseguiu iniciar a transcrição.' }, { status: response.status || 502 });
  return NextResponse.json({ id: result.id, status: result.status || 'queued' });
}

export async function GET(request: Request) {
  const apiKey = await authorizedKey();
  if (!apiKey) return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[A-Za-z0-9-]{10,80}$/.test(id)) return NextResponse.json({ error: 'Transcrição inválida.' }, { status: 400 });
  const response = await fetch(`https://api.assemblyai.com/v2/transcript/${encodeURIComponent(id)}`, {
    headers: { authorization: apiKey },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) return NextResponse.json({ error: typeof result.error === 'string' ? result.error : 'Não foi possível consultar a transcrição.' }, { status: response.status || 502 });
  return NextResponse.json({
    id: result.id,
    status: result.status,
    text: result.text,
    words: result.words,
    language_code: result.language_code,
    confidence: result.confidence,
    error: result.error,
  });
}
