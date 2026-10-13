# Ranking Footgolf reference

## File map

| Path | Role |
| --- | --- |
| `src/main.ts` | Boot, fetch, skeleton/error, mount list or table, apply search |
| `src/index.html` | Header, logos, title, last update, view switch, `.container` |
| `src/components/Ranking/` | `app-ranking` accordion list |
| `src/components/RankingTable/` | `app-ranking-table` |
| `src/components/Accordion/` | `app-accordion`, slots `collapsed` and `expanded` |
| `src/components/Search/` | `app-search`, URL sync |
| `src/components/SwitchView/` | `app-switch-view`, in-memory `RankingView` |
| `src/components/ThemeMode/` | `app-theme-mode`, `localStorage` key `theme` |
| `src/components/RankingChange/` | `app-ranking-change`, `value` setter |
| `src/components/NoResults/` | `app-no-results` |
| `src/services/rankingService.ts` | `SHEET_URL`, `HEADERS`, `getRanking`, `parseRankingCsv` |
| `src/utils/csv.ts` | RFC 4180 parser, BOM stripped |
| `src/utils/formatPlayer.ts` | Display strings for `Player` fields |
| `src/utils/searchHistory.ts` | `?search=` read/write and history burst |
| `src/utils/styles.ts` | `adoptStyles` via `CSSStyleSheet` |
| `src/css/base.css` | Tokens, page chrome |
| `src/css/responsive.css` | `1366px` and `1024px` |
| `vite.config.ts` | Base path, PWA/Workbox, Vitest |

Path aliases in `tsconfig.app.json`: `@components/*`, `@models/*`, `@services/*`, `@utils/*`.

## Player

`position`, `name`, `points`, `hcp`, `tournaments`, `origin`, `card15`, `pointsLost`, `card16`, `changes`, `lastUpdate`, `columns`.

Numbers are `number | null`. `name` and `origin` are strings. `columns` is every trimmed cell, used by both filters:

```ts
player.columns.some((column) => column.toLowerCase().includes(normalizedTerm))
```

Sheet header row (Spanish, matched case-insensitively): `POS`, `JUGADOR`, `PUNTOS`, `HCP`, `TORNEOS`, `PROCEDENCIA`, `TARJETA 15`, `PUNTOS QUE PIERDE`, `TARJETA 16`, `CAMBIOS`, `ULTIMA ACTUALIZACION`.

`lastUpdate` shown in `.last-update` is the first non-empty player value. Missing required headers throw.

## View mounting

`RankingView.LIST` (`list`) and `RankingView.TABLE` (`table`).

`renderVisibleView` removes the other element, creates the visible one if needed, then filters. `mountTable` calls `generateTableHeaders` and `setRows` once. Later updates call `filterPlayers` on the existing node.

`loadRanking` ignores re-entry while `loading` is true. Failure sets the last-update line and `Ranking.showError(retry)`.

## Events

| Event | From | Detail | Listener |
| --- | --- | --- | --- |
| `search` | `app-search` | `{ searchTerm }` | `main.ts` → `filterVisibleView` |
| `viewChange` | `app-switch-view` | `{ view }` | `main.ts` → `renderVisibleView` |
| `themeChange` | `app-theme-mode` | none | listened on the element itself |

`themeChange` is dispatched from inside the shadow root and handled on the host in `initTheme()`. `main.ts` calls `initTheme()` after the element exists.

## Tokens

Defined with `light-dark(light, dark)` on `:root`:

- `--color-bg`, `--color-text`
- `--color-primary`, `--color-alternate`
- `--color-border`
- `--color-table-bg`, `--color-table-header`, `--color-table-hover`, `--color-striped`
- `--color-success`, `--color-danger`
- `--app-font`, `--transition-duration` (`0.3s`)

Theme persistence: `localStorage.theme` is `light` or `dark`. Missing key follows `prefers-color-scheme`. Icons in the toggle follow the class actually applied on `body`.

## Breakpoints

- `max-width: 1366px` — hide `.switch-view-container` and `app-ranking-table`. JS mirror: `NARROW_LIST_QUERY`.
- `max-width: 1024px` — smaller logos and title, search grows in the header, accordion tap target `min-height: 44px`, theme toggle at least `2.75rem`.

## PWA

`vite.config.ts` precaches the app shell and uses `navigateFallback: index.html` with allowlist `/^\//`, so `/ranking-footgolf/?search=` still serves the shell. `ignoreURLParametersMatching` includes `/^search$/`.

Runtime caches: Google Sheet CSV (`NetworkFirst`, cache `ranking-sheet`, 4s timeout) and Google Fonts (`CacheFirst`). `filename: sw.js`, `registerType: autoUpdate`. The plugin is disabled when `VITEST=true`.
