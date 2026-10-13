# Ranking Footgolf

PWA for the Argentine national footgolf ranking. Vite and TypeScript, no UI framework. Custom elements, one published Google Sheet CSV, and a Workbox service worker from `vite-plugin-pwa`.

## Layout

- `src/main.ts` loads the ranking and is the only place that mounts the list or the table.
- `src/index.html` is the shell. Vite `root` is `src/`, output is `../dist`.
- `src/components/<Name>/` is one `<app-*>` element and its CSS.
- `src/services/rankingService.ts` fetches and parses the sheet.
- `src/utils/` holds CSV parsing, field formatting, search history, and `adoptStyles`.
- `src/css/base.css` holds design tokens. `src/css/responsive.css` holds shell breakpoints.
- `src/models/` holds `Player` and `RankingView`.

Cross-folder imports use `@components`, `@models`, `@services`, and `@utils`. Same-folder imports stay relative.

## Invariants

- The URL stores only `?search=`. List versus table stays in memory. See `src/utils/searchHistory.ts`.
- `(max-width: 1366px)` shows only the list. Keep `NARROW_LIST_QUERY` in `src/main.ts` equal to the media query in `src/css/responsive.css`.
- User-facing copy is Spanish. Identifiers and comments are English.
- Build player rows with DOM APIs. Sheet values stay out of `innerHTML`.
- Column labels exist in three places: `HEADERS` in `rankingService.ts`, `tableConfig` in `RankingTable.ts`, and the list markup in `Ranking.ts`. A new column updates all three, plus `Player`.

When adding a component, style, or ranking field, follow `.cursor/skills/ranking-footgolf/SKILL.md`.

## Checks

`npm test`, `npm run lint`, `npm run type-check`.
