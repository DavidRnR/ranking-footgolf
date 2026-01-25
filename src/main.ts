import './components/Accordion/Accordion';
import './components/NoResults/NoResults';
import './components/Ranking/Ranking';
import './components/RankingTable/RankingTable';
import './components/Search/Search';
import './components/SwitchView/SwitchView';
import './components/ThemeMode/ThemeMode';
import type { Ranking } from './components/Ranking/Ranking';
import type { RankingTable } from './components/RankingTable/RankingTable';
import type { Search } from './components/Search/Search';
import type { SwitchView } from './components/SwitchView/SwitchView';
import type { ThemeMode } from './components/ThemeMode/ThemeMode';
import { RankingView } from './models/app';
import { Player } from './models/player';
import { getRanking } from './services/rankingService';

let ranking: Player[] = [];
const $container = document.querySelector('.container') as HTMLDivElement;
let $tableComponent: RankingTable;
let $rankingComponent = document.querySelector('app-ranking') as Ranking;
const $lastUpdateElement = document.querySelector('.last-update');
const $switchViewComponent = document.querySelector('app-switch-view') as SwitchView;
const $searchComponent = document.querySelector('app-search') as Search;

function initTheme() {
  console.log('Initializing theme...');
  const themeMode = document.querySelector('app-theme-mode') as ThemeMode;
  themeMode.initTheme();
}

function handleChangeView(view: RankingView) {
  const existingTable = $container.querySelector('app-ranking-table');
  const existingList = $container.querySelector('app-ranking');

  const searchTerm = $searchComponent.getSearchTerm();

  if (view === RankingView.TABLE) {
    // Remove list if exists
    if (existingList) {
      existingList.remove();
    }

    // Create and initialize table if it doesn't exist
    if (!existingTable) {
      $tableComponent = document.createElement('app-ranking-table') as RankingTable;
      $tableComponent.generateTableHeaders();
      $tableComponent.setRows(ranking);
      if (searchTerm) {
        $tableComponent.filterPlayers(searchTerm);
      }
      $container.appendChild($tableComponent);
    }
  } else {
    // Remove table if exists
    if (existingTable) {
      existingTable.remove();
    }

    // Create and initialize list if it doesn't exist
    if (!existingList) {
      $rankingComponent = document.createElement('app-ranking') as Ranking;
      $rankingComponent.setPlayers(ranking);
      if (searchTerm) {
        $rankingComponent.filterPlayers(searchTerm);
      }
      $container.appendChild($rankingComponent);
    }
  }
}

async function loadRanking() {
  try {
    $rankingComponent.showSkeleton();

    const { ranking: rankingData, lastUpdate } = await getRanking();
    ranking = rankingData;

    $lastUpdateElement!.textContent = `Última actualización: ${lastUpdate || 'No disponible'}`;

    const searchTerm = $searchComponent.getSearchTerm();

    $switchViewComponent.addEventListener('viewChange', ((e: CustomEvent<{ view: RankingView }>) => {
      handleChangeView(e.detail.view);
    }) as EventListener);

    $rankingComponent.setPlayers(ranking);

    if (searchTerm) {
      $rankingComponent.filterPlayers(searchTerm);
    }

    $searchComponent.addEventListener('search', ((e: CustomEvent<{ searchTerm: string }>) => {
      const activeView = $switchViewComponent.currentView === 'table' ? $tableComponent : $rankingComponent;
      activeView.filterPlayers?.(e.detail.searchTerm);
    }) as EventListener);

    console.log('CSV data loaded successfully');
  } catch (error) {
    console.error('Error loading CSV:', error);
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

// Add resize listener to handle window size changes
window.addEventListener('resize', () => {
  const view = window.innerWidth < 1366 ? RankingView.LIST : $switchViewComponent.currentView;
  $switchViewComponent.switchView(view as RankingView);
});

function initializeApp() {
  console.log('Initializing application...');
  initTheme();
  loadRanking();
  console.log('Application initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
