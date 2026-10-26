import { get, put } from '@vercel/blob';

const HIDDEN_PRIVATE_PATH = 'portfolio-admin/hidden-drive-videos-private.json';
const HIDDEN_LEGACY_PATH = 'portfolio-admin/hidden-drive-videos.json';
const TITLES_PATH = 'portfolio-admin/video-titles.json';

async function readJson(pathname: string, access: 'private' | 'public'): Promise<unknown> {
  try {
    const result = await get(pathname, { access, useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).json();
  } catch {
    return null;
  }
}

function stringIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export async function getHiddenDriveVideoIds(): Promise<string[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const [current, legacy] = await Promise.all([
    readJson(HIDDEN_PRIVATE_PATH, 'private'),
    readJson(HIDDEN_LEGACY_PATH, 'public'),
  ]);
  return Array.from(new Set([...stringIds(legacy), ...stringIds(current)]));
}

export async function saveHiddenDriveVideoIds(ids: string[]) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('O armazenamento ainda não está conectado.');
  await put(HIDDEN_PRIVATE_PATH, JSON.stringify(Array.from(new Set(ids))), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function getPortfolioVideoTitles(): Promise<Record<string, string>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  const value = await readJson(TITLES_PATH, 'private');
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, title]) =>
    typeof key === 'string' && typeof title === 'string' && title.length <= 160,
  ));
}

export async function savePortfolioVideoTitle(key: string, title: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('O armazenamento ainda não está conectado.');
  const titles = await getPortfolioVideoTitles();
  if (title) titles[key] = title;
  else delete titles[key];
  await put(TITLES_PATH, JSON.stringify(titles), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}
