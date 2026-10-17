import snapshot from './prompt-motion-catalog.json';
import { MOTION_SOURCE, type MotionEntry } from './prompt-motion-shared';

function isMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return new URL(value).origin === 'https://media.prompt-motion.com'; }
  catch { return false; }
}

function isEntry(value: unknown): value is MotionEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.slug === 'string' && /^[a-z0-9-]+$/.test(item.slug)
    && typeof item.title === 'string' && typeof item.date === 'string'
    && typeof item.handle === 'string' && /^[a-zA-Z0-9_]+$/.test(item.handle)
    && Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === 'string')
    && Array.isArray(item.contentTags) && item.contentTags.every((tag) => typeof tag === 'string')
    && typeof item.promptShared === 'boolean'
    && [item.avatar, item.poster, item.preview, item.video].every(isMediaUrl)
    && typeof item.width === 'number' && item.width > 0
    && typeof item.height === 'number' && item.height > 0;
}

// Read only the public catalog metadata. Prompts remain in their original reader.
export function parseMotionCatalog(html: string): MotionEntry[] {
  const payload = Array.from(html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g))
    .map((match) => {
      try { const value: unknown = JSON.parse(match[1]); return Array.isArray(value) && typeof value[1] === 'string' ? value[1] : ''; }
      catch { return ''; }
    }).join('');
  const marker = '"cards":[';
  const markerIndex = payload.indexOf(marker);
  if (markerIndex < 0) throw new Error('Motion catalog was not found.');
  const start = markerIndex + marker.length - 1;
  let depth = 0, quoted = false, escaped = false;
  for (let end = start; end < payload.length; end++) {
    const char = payload[end];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '[' || char === '{') depth++;
    else if (char === ']' || char === '}') {
      depth--;
      if (depth === 0) {
        const items: unknown = JSON.parse(payload.slice(start, end + 1));
        if (!Array.isArray(items) || !items.length || !items.every(isEntry)) throw new Error('Invalid motion catalog.');
        if (new Set(items.map((item) => item.slug)).size !== items.length) throw new Error('Duplicate motion entries.');
        return items.map(({ slug, title, date, tags, contentTags, promptShared, handle, avatar, poster, preview, video, width, height }) =>
          ({ slug, title, date, tags, contentTags, promptShared, handle, avatar, poster, preview, video, width, height }));
      }
    }
  }
  throw new Error('Incomplete motion catalog.');
}

export async function getMotionCatalog(): Promise<MotionEntry[]> {
  try {
    const response = await fetch(`${MOTION_SOURCE}/`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Motion source returned ${response.status}.`);
    return parseMotionCatalog(await response.text());
  } catch (error) {
    console.error('Using saved motion catalog:', error instanceof Error ? error.message : error);
    return snapshot.entries;
  }
}
