import './components/ThemeMode.js';
import './components/Search.js';
import './components/RankingTable.js';
import './components/Accordion.js';
import './components/Ranking.js';
import './components/SwitchView.js';
import { VIEWS } from './components/SwitchView.js';
import { getRanking } from './services/rankingService.js';

let ranking = [];
const $container = document.querySelector('.container');
let $tableComponent;
let $rankingComponent = document.querySelector('app-ranking');
const $lastUpdateElement = document.querySelector('.last-update');
const $switchViewComponent = document.querySelector('app-switch-view');
const $searchComponent = document.querySelector('app-search');

// Theme switching functionality
function initTheme() {
  console.log('Initializing theme...');
  const themeMode = document.querySelector('app-theme-mode');
  themeMode.initTheme();
}

function handleChangeView(view) {
  const existingTable = $container.querySelector('app-ranking-table');
  const existingList = $container.querySelector('app-ranking');

  const searchTerm = $searchComponent.getSearchTerm();

  if (view === VIEWS.TABLE) {
    // Remove list if exists
    if (existingList) {
      existingList.remove();
    }

    // Create and initialize table if it doesn't exist
    if (!existingTable) {
      $tableComponent = document.createElement('app-ranking-table');
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
      $rankingComponent = document.createElement('app-ranking');
      $rankingComponent.setPlayers(ranking);
      if (searchTerm) {
        $rankingComponent.filterPlayers(searchTerm);
      }
      $container.appendChild($rankingComponent);
    }
  }
}

// Function to load and parse CSV data
async function loadRanking() {
  try {
    // Show skeleton loading state for initial list view
    $rankingComponent.showSkeleton();

    const { ranking: rankingData, lastUpdate } = await getRanking();
    ranking = rankingData;

    $lastUpdateElement.textContent = `Última actualización: ${lastUpdate || 'No disponible'}`;

    // Get search term from URL
    const searchTerm = $searchComponent.getSearchTerm();

    // Initialize view switching
    $switchViewComponent.addEventListener('viewChange', (e) => {
      handleChangeView(e.detail.view);
    });

    // Initialize players list
    $rankingComponent.setPlayers(ranking);

    // If there's a search term, filter the rows
    if (searchTerm) {
      $rankingComponent.filterPlayers(searchTerm);
    }

    // Add search event listener
    $searchComponent.addEventListener('search', (e) => {
      const activeView = $switchViewComponent.currentView === 'table' ? $tableComponent : $rankingComponent;
      activeView.filterPlayers?.(e.detail.searchTerm);
    });

    console.log('CSV data loaded successfully');
  } catch (error) {
    console.error('Error loading CSV:', error);
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
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
  const view = window.innerWidth < 1024 ? 'list' : $switchViewComponent.currentView;
  $switchViewComponent.switchView(view);
});

// Initialize everything when the page loads
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

// Fallback to window.onload
window.onload = function () {
  // Check if initialization hasn't happened yet
  if (!document.body.classList.contains('dark') && !document.body.classList.contains('light')) {
    initializeApp();
  }
};
