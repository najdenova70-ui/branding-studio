# Branding Studio — instructions for coding agents

Start by reading `CODEX.md`. It contains the current product contract, architecture, file map, and verification commands. Do not re-audit the entire repository unless the task genuinely requires it; inspect only the files relevant to the requested change.

## Non-negotiable product scope

- This is a narrow rebranding studio, not a general-purpose Figma clone.
- Users may change only approved brand assets and color tokens.
- Do not add controls for editing text, geometry, layout, navigation, slide contents, or arbitrary components.
- Existing visible text and pseudo-functional screen behavior must remain fixed unless the user explicitly changes this contract.
- Do not add a custom-screen builder or `.fig` file importer.
- New screens are implemented in code from user-approved Figma frames.
- Presentation mode and public share pages are read-only.
- The right inspector is contextual to the currently selected mobile screen: assets first, colors second.
- Prefer minimal visual changes and reuse the existing registries and renderers.

## Engineering priorities

- Frontend responsiveness and startup performance are first-class requirements.
- Keep export libraries lazy-loaded; do not move PDF/PPTX dependencies into the initial bundle.
- Preserve the two-container deployment: static Nginx frontend plus Node.js share API.
- Preserve read-only containers, healthchecks, the `share-data` volume, TTL storage, and same-origin API proxy.
- Never alter approved texts merely to make a layout easier to implement.
- Keep Figma-derived icons and visual assets local in the repository; production must not depend on live Figma URLs.
- Preserve unrelated user changes in the working tree.

## Minimum verification

Run the checks proportionate to the change:

```powershell
npm.cmd run build
npm.cmd audit
```

For presentation/export/share changes, also run:

```powershell
npm.cmd run test:export
docker compose config --quiet
```

For container changes, rebuild and confirm both services become healthy.
