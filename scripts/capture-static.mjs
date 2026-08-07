import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const projects = [
  ['criarsaas', 'https://agenciapkg.com.br/criarsaas/', 1440, 900],
  ['dra-aline', 'https://agenciapkg.com.br/dra-aline/', 1440, 900],
  ['copie-ai', 'https://agenciapkg.com.br/copie-ai/', 1440, 900],
  ['jessica', 'https://agenciapkg.com.br/jessica/', 1440, 900],
  ['master-class', 'https://agenciapkg.com.br/master-class/', 1440, 900],
  ['mentoria-caio', 'https://agenciapkg.com.br/mentoria-caio-martins/', 1440, 900],
  ['isaque-mota', 'https://agenciapkg.com.br/isaquemota/', 720, 960]
];

const browser = await chromium.launch({ headless: true });
for (const [slug, url, width, height] of projects) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const source = `/tmp/aymar-static-${slug}.png`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: source, fullPage: false });
    await mkdir('public/projects', { recursive: true });
    await sharp(source).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(`public/projects/${slug}.webp`);
    console.log(`captured ${slug} ${width}x${height}`);
  } catch (error) {
    console.error(`failed ${slug}: ${error.message}`);
  } finally {
    await page.close();
  }
}
await browser.close();
