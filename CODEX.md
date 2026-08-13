# Branding Studio — current project context

Updated: 2026-08-13.

## What this product is

Branding Studio applies brand styling to a fixed mobile application prototype and its fixed presentation. It intentionally does **not** provide freeform design editing.

The user can replace prepared images/logos and approved colors. Texts, component placement, screen composition, navigation, and pseudo-functionality remain unchanged. New screens are added collaboratively from Figma by implementing them as fixed React components, not through an end-user screen builder.

## Current user experience

The workspace has four left-navigation modes:

1. **Веб-версия** — read-only fixed Figma screens with a size/view switcher.
2. **Мобильная версия** — interactive fixed screen flow.
3. **Презентация** — read-only presentation viewer.
4. **Экспорт** — PDF, PPTX, and public share creation.

The old top rows labelled “Экраны” and “Поток” were removed. In mobile mode, moving the pointer to the bottom reveals a translucent thumbnail dock. The right inspector appears only in the editable mobile mode and shows settings for the selected screen: replaceable assets above editable colors, in collapsible groups.

Public links use `/share/:id`. A third party can view the presentation, click through the mobile prototype, and export PDF/PPTX, but cannot edit or create another share. Public mode currently omits the web section.

## Important architecture

- `src/App.tsx` — editor/public routing and workspace shell.
- `src/navigation/WorkspaceNav.tsx` — four workspace modes and public-mode filtering.
- `src/modes/PrototypeMode.tsx` — mobile phone renderer and bottom thumbnail dock.
- `src/modes/PresentationMode.tsx` — read-only presentation navigation.
- `src/modes/ExportMode.tsx` — PDF, PPTX, and share actions.
- `src/modes/WebMode.tsx` — fixed read-only web frames imported from Figma.
- `src/panels/ScreenSettings.tsx` — current-screen contextual inspector.
- `src/brand/BrandConfig.ts` — approved asset slots and color configuration.
- `src/brand/BrandContext.tsx` — the only brand mutation layer; enforces read-only mode.
- `src/brand/assetCatalog.ts` and `src/brand/tokens.ts` — editable asset/color catalogs.
- `src/registry/ScreenRegistry.ts` — fixed screen catalog and per-screen brand fields.
- `src/registry/NavigationGraph.ts` — fixed interactive transitions.
- `src/registry/SlideRegistry.ts` — fixed presentation content.
- `src/presentation/SlideCanvas.tsx` — shared presentation/export slide rendering.
- `src/export/presentationExport.ts` — lazy screenshot capture and PDF/PPTX dispatch.
- `src/export/pptxBuilder.ts` — compact OOXML PPTX generator; slides are full-slide images to preserve layout.
- `src/share/client.ts` — creates portable brand snapshots by inlining assets.
- `server/server.mjs` — small Node.js share API with TTL, record cap, validation, and JSON persistence.
- `deploy/nginx.conf` — SPA hosting, immutable assets, and same-origin `/api` proxy.
- `docker-compose.yml` — `web`, `share-api`, and persistent `share-data` volume.
- `tests/browser-export-smoke.mjs` — headless Edge test for UI contract, PDF, PPTX, sharing, and read-only viewer.

## Figma workflow

The official remote Figma MCP is configured globally as `figma` at `https://mcp.figma.com/mcp` using OAuth. A newly opened Codex session should have its tools after VS Code reload.

When the user supplies a Figma selection link:

1. Read the selected frame/component through Figma MCP.
2. Compare it with the existing implementation before editing.
3. Change only requested visual details such as icons, spacing, sizing, typography, backgrounds, and presentation composition.
4. Do not rewrite approved text or expand product functionality.
5. Export required icons as local SVG assets rather than referencing live Figma URLs.
6. Validate presentation view and both PDF/PPTX exports after visual changes.

The presentation has been aligned to the user-selected Figma section `8432:46325`, which contains exactly three 1920x1080 frames: cover `8408:34319`, content slide `8408:34336`, and content slide `8408:32457`. The cover uses the exact fixed Figma purple `#965DF5`, live brand app icon/name, and the `home` plus `splash` screens. The third slide is titled `Главная и профиль` and renders `mainBanner`, `mainContent`, and `profile` in the Figma order. The shared renderer matches the Figma composition, spacing, device placement, pagination, and background pattern. The phone/home icons, Wi-Fi glyphs, and pattern are stored locally under `src/assets/presentation/`. PDF and PPTX use this same renderer.

The navigation drawer matches Figma node `6135:23134`. Its menu glyphs are exact Figma exports assembled into the local `src/assets/drawer-icons/drawer-icons.svg` sprite and rendered by `src/screens/DrawerIcon.tsx`; the fixed existing labels, order, and navigation behavior remain unchanged.

The mobile selector also contains the fixed Figma home screen `11:21468`. `src/screens/HomeScreen.tsx` uses local assets from `src/assets/home-screen/`; the translucent dock background and four exact system-icon exports are immutable, while only the shared application icon and application display name are editable. Clicking that application opens the existing splash screen (`home -> splash`). The display name control is intentionally limited to this brand label and must not become general text editing. The workspace shell supports a persistent light/dark theme toggle in the upper-right header; it affects only the constructor UI, never the rendered mobile screens or slides. The product title shown in the browser and left navigation is `Конструктор экранов`.

The fixed Figma screens `6137:110093` (`mainBanner`) and `6135:32247` (`mainContent`) are stored as optimized immutable WebP renders under `src/assets/figma-screens/` and ordered immediately after `drawer`. The image layer of `mainBanner` (`6135:66705`, 343×343) is the only replaceable part of that screen; its text and button remain fixed. Both screens are included in the third presentation slide. The first slide uses `home` and `splash`, matching Figma frame `8408:34319`. Shared iOS status bars use local exact black/white Wi-Fi SVGs from Figma. The left workspace mark renders the current brand application icon; the editor has no redundant “Изменения доступны справа” footer.

The web category contains two local Figma renders: home `4206:201963` (1312×760) and course detail `6785:27550` (1280×768). On home, only the source image of banner instance `6759:41703` is replaceable; its text, controls, placement, and geometry stay fixed. Clicking the fixed “Основы веб-разработки” card opens the course detail view. The course screen has no editable elements.

## Performance and deployment facts

- React 18, strict TypeScript, Vite 8.
- PDF/PPTX dependencies use dynamic imports and must remain out of the initial bundle.
- Current initial application JS is roughly 64 KB gzip; avoid regressions without a clear reason.
- Production uses read-only Nginx and Node.js containers.
- Share snapshots default to 30 days and persist in Docker volume `share-data`.
- Relevant environment variables: `STUDIO_PORT`, `SHARE_TTL_DAYS`, `SHARE_MAX_RECORDS`, `ALLOWED_ORIGINS`.
- Local Docker URL: `http://127.0.0.1:8088`.

## Known verification baseline

At the last completed check:

- TypeScript and Vite production build passed.
- `npm audit` reported zero vulnerabilities.
- Real PDF and PPTX downloads passed the Edge smoke test.
- PPTX contained three valid slides.
- Public sharing loaded a three-section read-only viewer without settings.
- Both Docker services were healthy.

Commands:

```powershell
npm.cmd run build
npm.cmd audit
npm.cmd run test:export
docker compose up -d --build
docker compose ps
```

## Working-tree caution

The repository may contain an uncommitted implementation from the current product iteration. Treat all existing modifications as intentional user work. Do not reset, discard, or broadly rewrite them. Check `git status --short` before making changes and keep diffs focused.
