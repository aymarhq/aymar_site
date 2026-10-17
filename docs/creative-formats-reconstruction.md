# Creative formats reconstruction

Source: https://dash.dvncopy.com/dashboard, inspected on 2026-10-17.
The user confirmed authorship or permission to republish the source content.

## Evidence

- `ev_feccfbe2c4e0a41917e410722287c293a7596ff93dc9a3d9df8e37913bdc9b66`:
  REA observed the original buyer-email login.
- `ev_47d78ebc1d0ce25018d36c23cdaa3f593181c7a5509845fe96ed733ed080c1c4`:
  REA performed the authorized login and observed the dashboard.
- `ev_d8e8ee2278e00e9d2fdbfb5761a0cf0e4df979b75229e81613ffe00674c9b0ad`:
  REA opened the first format and observed its explanation and example selectors.
- `ev_e3642088a7799d371a437a3c40f5cf7103e7f055ac530266ae69dd960a03532a`:
  retained REA static analysis of the dashboard data and interface chunks.
  Static syntax is not evidence of runtime execution; library behavior outside
  the selected chunks remains outside that analysis scope.
- `ev_459ef3f9b225ed102599a7dff4ee687f31121b05d066a5cf311eb311c0589efc`:
  REA used the original Bonuses control, which rendered all 50 formats. The
  initial observation of only 40 cards was the original incremental loading,
  not missing content.

The source data was extracted with TypeScript's syntax parser as inert literals.
No downloaded application scripts were executed for data extraction. The complete
catalog is 50 formats, 118 examples (109 videos, nine images), and four bonuses.

## Aymar adaptation

`/formatosdectvs` uses the Aymar black/blue visual system, as requested after the
source inspection. It retains all format titles and descriptions, every example
mapping and selector, the bonus assets and links, and the support/group links.
All 50 cards render directly, with a local title search.

The page uses the existing Aymar portfolio session for both students and admins.
The source buyer email and original application authentication are not shipped
in the new page. Catalog data is only passed to the client after checking the
server session. Bonus artwork is saved locally under `public/formats/bonus`.

Example media stays in the original Drive files and is embedded per example;
the original source dashboard itself is not embedded. External Drive links and
the original folders are also available. Embedded media still depends on Drive
availability and permissions. No original files or source sharing permissions
were changed.

## Verification

Production build passed. Browser verification exercised the real Aymar login
flow using a local-only test credential, checked unauthenticated content
protection, all 50 exact descriptions, all 118 example selectors and Drive IDs,
four bonus assets and links, player cleanup, search, mobile overflow and logout.
An anonymous source-media check returned HTTP 200 and the expected Drive file
title without an access-denied response. Browser checks reported no page errors.
