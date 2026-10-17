import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = 'https://prompt-motion.com';
const catalogPath = new URL('../lib/prompt-motion-catalog.json', import.meta.url);
const outputPath = new URL('../lib/prompt-motion-prompts.json', import.meta.url);
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

function elementContent(html, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<div\\b(?=[^>]*\\bid=["']${escapedId}["'])[^>]*>([\\s\\S]*?)<\\/div>`, 'i'))?.[1] ?? null;
}

function skillContent(html) {
  const heading = /<h2\b[^>]*>\s*Skill\s*<\/h2>/i.exec(html);
  if (!heading) return null;
  const section = html.slice(heading.index, heading.index + 12000);
  const descriptionHtml = section.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? null;
  const commandHtml = section.match(/<code\b[^>]*>([\s\S]*?)<\/code>/i)?.[1] ?? null;
  return descriptionHtml ? { descriptionHtml, commandHtml } : null;
}

async function fetchEntry(entry) {
  const response = await fetch(`${source}/${encodeURIComponent(entry.slug)}`, {
    headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 (compatible; AymarLabs/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`${entry.slug}: HTTP ${response.status}`);
  const html = await response.text();
  const promptHtml = elementContent(html, 'entry-prompt');
  const skill = entry.tags.includes('skill') ? skillContent(html) : null;
  if (!promptHtml && !skill) throw new Error(`${entry.slug}: prompt text was not found`);
  return { slug: entry.slug, promptHtml, skill };
}

const results = new Array(catalog.entries.length);
let cursor = 0;
const failures = [];
async function worker() {
  while (cursor < catalog.entries.length) {
    const index = cursor++;
    const entry = catalog.entries[index];
    try { results[index] = await fetchEntry(entry); }
    catch (error) { failures.push(error instanceof Error ? error.message : String(error)); }
  }
}

await Promise.all(Array.from({ length: 3 }, worker));
if (failures.length) throw new Error(`Prompt snapshot stopped (${failures.length}/${catalog.entries.length}): ${failures.slice(0, 12).join('; ')}`);

const snapshot = {
  source,
  capturedAt: new Date().toISOString(),
  entries: results,
};
const outputUrl = new URL(outputPath);
await writeFile(outputUrl, `${JSON.stringify(snapshot)}\n`, 'utf8');
console.log(`Saved ${results.length} prompts to ${fileURLToPath(outputUrl)}`);
