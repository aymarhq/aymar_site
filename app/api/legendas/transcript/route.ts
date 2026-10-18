import { NextResponse } from 'next/server';
import { deepgramKey, isAllowedMediaUrl, sameOrigin } from '../../../../lib/legendas-auth';
import { portfolioSession } from '../../../../lib/portfolio-auth';

export const runtime = 'nodejs';
export const maxDuration = 300;
const languages = new Set(['pt', 'en', 'es', 'fr', 'de', 'it', 'nl', 'pl']);

async function authorizedKey() {
  if (!(await portfolioSession())) return null;
  return deepgramKey();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const apiKey = await authorizedKey();
  if (!apiKey) return NextResponse.json({ error: 'Conecte sua chave Deepgram antes de gerar legendas.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { audioUrl?: unknown; language?: unknown } | null;
  const audioUrl = typeof body?.audioUrl === 'string' ? body.audioUrl : '';
  const language = typeof body?.language === 'string' ? body.language : 'auto';
  if (!isAllowedMediaUrl(audioUrl)) return NextResponse.json({ error: 'Use um vídeo enviado pela página ou um link válido do Google Drive.' }, { status: 400 });
  if (language !== 'auto' && !languages.has(language)) return NextResponse.json({ error: 'Idioma inválido.' }, { status: 400 });

  const query = new URLSearchParams({ model: 'nova-3', smart_format: 'true', punctuate: 'true', utterances: 'true' });
  if (language === 'auto') query.set('detect_language', 'true');
  else query.set('language', language);
  const response = await fetch(`https://api.deepgram.com/v1/listen?${query}`, {
    method: 'POST',
    headers: { authorization: `Token ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ url: audioUrl }),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({})) as {
    err_msg?: string;
    results?: { channels?: Array<{ detected_language?: string; alternatives?: Array<{ transcript?: string; words?: Array<{ word?: string; punctuated_word?: string; start?: number; end?: number; confidence?: number }> }> }> };
  };
  if (!response.ok) return NextResponse.json({ error: result.err_msg || 'A Deepgram não conseguiu transcrever este vídeo.' }, { status: response.status || 502 });
  const channel = result.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];
  const words = (alternative?.words || []).map((word) => ({
    text: word.punctuated_word || word.word || '',
    start: Math.round((word.start || 0) * 1000),
    end: Math.round((word.end || 0) * 1000),
    confidence: word.confidence,
  })).filter((word) => word.text);
  return NextResponse.json({
    status: 'completed',
    text: alternative?.transcript || '',
    words,
    language_code: channel?.detected_language || language,
  });
}
