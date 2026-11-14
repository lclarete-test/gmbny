# GMBNY migration status

Updated: 2026-11-13 (America/New_York).

## Repositories and scope

- Source: `lclarete-test/lclarete.github.io`, branch `master`.
- Source snapshot verified against remote: `57c0c35291412f8d9e845f2d6e50dd0f2af4aaed`.
- Source directory: `proto/`.
- Destination: `lclarete-test/gmbny`, branch `main`.
- Intended public URL: https://lclarete-test.github.io/gmbny/
- Destination before this batch: `24729e88e997ce11895d99ed5e6221aa8abe7df7`, containing only README.md. No previous migration status existed.
- This batch is limited to two sections. Publication and old-site redirects are deferred to a separate execution after all six sections are migrated.

## Migrated in batch 1

| Section | Source | Destination | Status |
| --- | --- | --- | --- |
| Visão geral | proto/diagnostico-situacional.html | index.html | Migrated; original image defect documented below |
| Revisão bibliográfica | proto/revisao-bibliografica.html | revisao-bibliografica.html | Migrated and statically verified |

`diagnostico-situacional.html` in the destination is a small compatibility alias to the destination root; it preserves the query string and fragment. It does not change the source site.

Only navigation links to `diagnostico-situacional.html` were changed to `index.html` in the two copied pages. All other source bytes, including embedded styles, text, image data and script, were retained. README.md was preserved.

## Verification

- Source blobs match the current remote files: overview `a635b7d1ff9b60e6a0ad6253c8628608ce6d7883`; literature `0cfc904d3a72bf702a72f23f1b7d136422dc5124`.
- Destination blobs: index `f8c62d016147d7d7a8ce186957a7d31c03c5ed1e`; literature `6e0a982a9456b43826b809df23484b25f3330802`.
- Exact byte comparison passed after the explicit navigation replacement (two overview links and three literature links).
- Parsed both pages; relative paths remain compatible with `/gmbny/`; links between the two migrated sections resolve locally.
- Local fragment targets passed. Literature's inline JavaScript passed `node --check`.
- Links to the four remaining sections are intentionally unresolved until those sections are migrated. Do not report the complete site's navigation as verified yet.
- No browser, live-site, external-link or full-dashboard verification was performed in this batch.

## Pre-existing source defect

The overview's embedded PNG for the five needs profiles is already corrupt in the source repository. Its base64 contains the literal marker `... 1161080 bytes omitted ...`, and image decoding fails. This is present in source blob `a635b7d1ff9b60e6a0ad6253c8628608ce6d7883` and was preserved verbatim. The recent source history does not contain an intact version of that same image; an older illustration is different and must not be substituted silently. Recover the original full image before claiming full visual functionality. No image was regenerated or replaced.

## Remaining sections

| Section | Source and intended destination | Status |
| --- | --- | --- |
| Resultados do Censo | proto/resultados-censo.html -> resultados-censo.html; include the required proto/censo-dashboard/ files | Pending |
| Anatomia da dor | proto/mapa-da-dor.html -> mapa-da-dor.html | Pending |
| Inovação | proto/inovacao.html -> inovacao.html | Pending |
| Impacto | proto/impacto.html -> impacto.html | Pending |

## Next execution

1. Read this file and verify the destination head. Skip sections already migrated.
2. Migrate at most two pending sections, preferably Resultados do Censo with its dashboard dependencies and Anatomia da dor. Copy the actual original files; do not build another dashboard or redesign anything.
3. Verify that batch, update this file and commit. Stop after that batch.
4. Once all six sections are migrated, use a separate execution to configure publication, validate the entire live site and then add old-to-new redirects in the source repository. Keep unrelated source content intact.

The source repository was not modified. GitHub Pages configuration, publication and redirects from old URLs were not changed in this batch.
