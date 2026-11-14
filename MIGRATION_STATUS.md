# GMBNY migration status

Updated: 2026-11-13 (America/New_York).

## Current scope

The user requested that all original pages be copied directly and published now. This supersedes the earlier two-sections-per-execution limit and publication deferral.

- Source: `lclarete-test/lclarete.github.io`, `master`, snapshot `57c0c35291412f8d9e845f2d6e50dd0f2af4aaed`.
- Destination: `lclarete-test/gmbny`, `main`.
- Public URL: https://lclarete-test.github.io/gmbny/
- GitHub Pages was disabled, causing HTTP 404. It has now been enabled on `main`, `/ (root)`.

## Copied sections

| Section | Destination |
| --- | --- |
| Visão geral | index.html; diagnostico-situacional.html is an alias |
| Revisão bibliográfica | revisao-bibliografica.html |
| Resultados do Censo | resultados-censo.html and censo-dashboard/ |
| Anatomia da Dor | mapa-da-dor.html |
| Inovação | inovacao.html |
| Impacto | impacto.html |

All 26 source files in `proto/` are represented in the destination, including the full original dashboard data (1,024 rows, 352 columns), JavaScript, stylesheets, and DPP pages required by existing links. The original content and layout were copied, not reconstructed. Links to the overview were changed to index.html. Existing README.md and the destination alias were preserved. `.nojekyll` enables direct static serving.

## Verification

- Source and destination bytes compared, allowing only the explicit overview-link adjustment in HTML.
- All 10 external JavaScript files passed Node syntax checks.
- Dashboard data parses as JSON, with row/definition dimensions checked.
- Anatomia da Dor embedded JPEG decodes successfully (768 x 1152).
- Local asset, module and page paths are checked before committing.
- Live-site and interactive checks are pending the Pages build.

## Known source issue

The overview image showing five needs profiles is already corrupt in source blob `a635b7d1ff9b60e6a0ad6253c8628608ce6d7883`: its base64 contains `... 1161080 bytes omitted ...`. It was preserved rather than replaced with an unrelated image. The original complete image is still needed to restore it.

## Remaining work

1. Confirm the complete destination is live, including dashboard tabs and filters.
2. After confirmation, redirect the six old section URLs and old dashboard entry point to the new corresponding addresses. Preserve other source content.
3. Record final verification and commit IDs here.
