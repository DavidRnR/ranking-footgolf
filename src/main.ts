import './components/Accordion/Accordion';
import './components/NoResults/NoResults';
import './components/Ranking/Ranking';
import type { Ranking } from './components/Ranking/Ranking';
import './components/RankingChange/RankingChange';
import './components/RankingTable/RankingTable';
import type { RankingTable } from './components/RankingTable/RankingTable';
import './components/Search/Search';
import type { Search } from './components/Search/Search';
import './components/SwitchView/SwitchView';
import type { SwitchView } from './components/SwitchView/SwitchView';
import './components/ThemeMode/ThemeMode';
import type { ThemeMode } from './components/ThemeMode/ThemeMode';
import { RankingView } from './models/app';
import { Player } from './models/player';
import { getRanking } from './services/rankingService';

let ranking: Player[] = [];
let rankingReady = false;
let loading = false;
const $container = document.querySelector('.container') as HTMLDivElement;
const $lastUpdateElement = document.querySelector('.last-update');
const $switchViewComponent = document.querySelector('app-switch-view') as SwitchView;
const $searchComponent = document.querySelector('app-search') as Search;

// Matches the breakpoint in responsive.css, where the table and the view switch are hidden.
const NARROW_LIST_QUERY = '(max-width: 1366px)';

function initTheme() {
  console.log('Initializing theme...');
  const themeMode = document.querySelector('app-theme-mode') as ThemeMode;
  themeMode.initTheme();
}

function currentSearchTerm(): string {
  return $searchComponent.searchTerm.toLowerCase();
}

/** Below 1366px only the list is usable, but the switch still remembers the user's choice. */
function visibleView(): RankingView {
  if (window.matchMedia(NARROW_LIST_QUERY).matches) {
    return RankingView.LIST;
  }

  return $switchViewComponent.currentView;
}

function mountList(): Ranking {
  $container.querySelector('app-ranking-table')?.remove();

  let list = $container.querySelector('app-ranking') as Ranking | null;
  if (!list) {
    list = document.createElement('app-ranking') as Ranking;
    $container.append(list);
  }

  return list;
}

function mountTable(): RankingTable {
  $container.querySelector('app-ranking')?.remove();

  let table = $container.querySelector('app-ranking-table') as RankingTable | null;
  if (!table) {
    table = document.createElement('app-ranking-table') as RankingTable;
    table.generateTableHeaders();
    table.setRows(ranking);
    $container.append(table);
  }

  return table;
}

function renderVisibleView() {
  const searchTerm = currentSearchTerm();

  if (visibleView() === RankingView.TABLE) {
    mountTable().filterPlayers(searchTerm);
    return;
  }

  const list = mountList();
  list.setPlayers(ranking);
  list.filterPlayers(searchTerm);
}

function filterVisibleView(searchTerm: string) {
  if (!rankingReady) {
    return;
  }

  if (visibleView() === RankingView.TABLE) {
    const table = $container.querySelector('app-ranking-table') as RankingTable | null;
    (table ?? mountTable()).filterPlayers(searchTerm);
    return;
  }

  let list = $container.querySelector('app-ranking') as Ranking | null;
  if (!list) {
    list = mountList();
    list.setPlayers(ranking);
  }

  list.filterPlayers(searchTerm);
}

async function loadRanking() {
  if (loading) {
    return;
  }

  loading = true;
  const list = mountList();
  list.showSkeleton();

  try {
    const { ranking: rankingData, lastUpdate } = await getRanking();
    ranking = rankingData;

    if ($lastUpdateElement) {
      $lastUpdateElement.textContent = `Última actualización: ${lastUpdate || 'No disponible'}`;
    }

    rankingReady = true;
    renderVisibleView();
    console.log('CSV data loaded successfully');
  } catch (error) {
    console.error('Error loading CSV:', error);
    rankingReady = false;

    if ($lastUpdateElement) {
      $lastUpdateElement.textContent = 'Última actualización: No disponible';
    }

    mountList().showError(() => {
      void loadRanking();
    });
  } finally {
    loading = false;
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // The service worker will be built with the correct base path
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => {
        console.log('ServiceWorker registration successful');
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

function initializeApp() {
  console.log('Initializing application...');
  initTheme();

  $switchViewComponent.addEventListener('viewChange', () => {
    if (!rankingReady) {
      return;
    }

    renderVisibleView();
  });

  $searchComponent.addEventListener('search', ((event: CustomEvent<{ searchTerm: string }>) => {
    filterVisibleView(event.detail.searchTerm);
  }) as EventListener);

  window.matchMedia(NARROW_LIST_QUERY).addEventListener('change', () => {
    if (!rankingReady) {
      return;
    }

    renderVisibleView();
  });

  void loadRanking();
  console.log('Application initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
