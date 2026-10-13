---
name: ranking-footgolf
description: Implements features in the ranking-footgolf PWA using its Web Component architecture, CSS tokens, Google Sheet ranking pipeline, and search-history rules. Use when adding or changing components, styles, ranking columns, search, theme, list or table views, or the service worker.
---

# Ranking Footgolf

Work in the existing Vite + custom-element app. Read [reference.md](reference.md) for the file map, `Player` fields, tokens, and events.

## Choose the layer

- Shell layout, header, logos, title → `src/index.html`, `src/css/base.css`, `src/css/responsive.css`.
- A widget → new or existing folder in `src/components/`.
- Sheet shape, parsing, numbers → `src/services/rankingService.ts` and `src/models/player.ts`, with a test.
- Search URL or Back behavior → `src/utils/searchHistory.ts` and `Search.ts`, with a test.
- Offline caching of the sheet or `?search=` navigations → `vite.config.ts` together with `searchHistory.ts`.

## Add or change a component

1. Create `src/components/<Name>/<Name>.ts` and `<name>.css`.
2. Open shadow root, `adoptStyles`, clone a module-level template. See the components rule.
3. Side-effect import the module from `src/main.ts` before it is queried or constructed.
4. Put a static tag in `src/index.html` only when it is part of the first paint (search, theme, switch). List and table are mounted by `main.ts`.
5. Talk to `main.ts` with a composed `CustomEvent`, or expose a method the parent calls (`setPlayers`, `filterPlayers`, `value`).
6. User-facing strings in Spanish.

## Add a ranking column

Update every consumer of the field:

1. `Player` in `src/models/player.ts`.
2. `HEADERS` and `toPlayer` in `rankingService.ts`. Integer vs decimal matches the sheet.
3. `tableConfig.headers` and `tableConfig.columns` in `RankingTable.ts`.
4. The collapsed or expanded markup in `Ranking.ts`.
5. `DECIMAL_FIELDS` in `formatPlayer.ts` when the value needs two decimals.

Search already matches `player.columns`, so a column that stays on the raw row is searchable without extra filter code. Cover the parser in `rankingService.test.ts`.

## Style

- Prefer tokens from `base.css`. Add a token there when a new color is real.
- Component CSS is shadow-only. Selectors do not leak, and light-DOM selectors do not apply inside the root.
- Copy `.sr-only` into the component CSS when the template uses it.
- Keep `1366px` (list only) and `1024px` (compact shell) unless the layout truly needs another query. If `1366px` changes, update `NARROW_LIST_QUERY` in `main.ts`.

## Verify

- Parser, formatter, or history changes: `npm test`.
- Types: `npm run type-check`.
- CSS and TS style: `npm run lint`.
- UI changes: run `npm run dev` and exercise list, table, search (including Back), theme, and a viewport under 1366px.
