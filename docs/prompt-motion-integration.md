# Prompt Motion integration

`/promptsmotion` presents the original public catalog inside the Aymar Labs layout.
The initial catalog contains 235 unique entries: 232 tagged Prompt and four tagged
Skill. One entry has both tags, so these counts overlap.

## Observed source

- Source: https://prompt-motion.com/ (observed 2026-10-17).
- REA browser scenario `ev_0cdf697b5fa74d4bb17d6d6585edc8f2a05ff0c1aebd774296a059ed62916662`
  captured the rendered catalog and requests to the original preview MP4 files.
- REA browser scenario `ev_e693e55f99fbe4d108b6179fd337fb68422553448c05acd997e84e21eced2188`
  opened an original detail page and exercised its Copy prompt control.
- The catalog metadata is embedded in the source page's public React payload under
  `cards`. Entries provide slug, title, date, creator, tags, poster, preview MP4,
  full MP4, and dimensions. No prompt body is included in this metadata.

## Implementation

- `lib/prompt-motion.ts` reads and validates that metadata with a one-hour Next.js
  fetch cache. It does not execute downloaded scripts. An invalid or unreachable
  catalog falls back to `lib/prompt-motion-catalog.json`.
- Videos use the original remote preview and full-video URLs. Previews and posters
  load near the viewport; offscreen previews pause. No videos are copied to Blob
  or committed to this repository.
- Original prompts and skill install controls are available through embedded
  original detail pages. The reader delegates clipboard-write to that frame.
  Template and customization tools are also embedded from their original routes.
- Creator and source links remain visible. The source site's subscription,
  submission, sponsorship and blog interfaces remain part of the original site,
  rather than new Aymar endpoints.

## Coverage and limits

The rendered gallery is checked against all 235 snapshot slugs, not a sample.
Browser verification covers search, Prompt/Skill and category filters, pause,
full-video loading, clipboard contents from an original prompt, template and
customizer readers, and a 390-pixel mobile viewport.

Media, original prompts and embedded tools still depend on the original hosts.
The saved metadata is a fallback for the catalog, not offline storage of videos
or prompt text. A future source markup or embedding-policy change may require an
adapter update; the reader includes a direct source link for that reason.
