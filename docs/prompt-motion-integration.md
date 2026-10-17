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
- The detail modal fetches only the selected public prompt or skill text from its
  local snapshot, then displays it beside the motion preview with an Aymar copy
  button. The reference page, creator profile, outbound source links, template
  pages, and customization tools are not shown in the Aymar experience.
- `lib/prompt-motion-prompts.json` stores the extracted prompt and skill text for
  all 235 catalog entries. `scripts/snapshot-prompt-motion-prompts.mjs` refreshes
  this snapshot from the publicly rendered source pages.
- The Aymar page has no outbound links to creator profiles or source pages.

## Coverage and limits

The rendered gallery is checked against all 235 snapshot slugs, not a sample.
Earlier browser verification covered search, Prompt/Skill and category filters,
pause, full-video loading, clipboard contents from an original prompt, template
and customizer readers, and a 390-pixel mobile viewport. The updated dialog was
checked against the observed prompt and skill markup before the production build.

Preview and full-size media still depend on the original media host. Prompt text
is served from the committed snapshot, so copying it does not require a live
request to the reference page. A future source markup change may require the
snapshot script's adapter to be updated.
