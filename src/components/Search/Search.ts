import { adoptStyles } from '@utils/styles';
import searchStyle from './search.css?inline';

const $searchTemplate = document.createElement('template');

$searchTemplate.innerHTML = `
  <div class="search-container">
    <label for="search-input" class="sr-only">Buscar jugadores</label>
    <input
      id="search-input"
      type="text"
      class="search-input"
      placeholder="Buscar..."
      maxlength="50"
      aria-label="Buscar jugadores"
    />
    <span class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
        </svg>
    </span>
    <button type="button" class="search-clear" style="display: none;" aria-label="Limpiar búsqueda">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </button>
  </div>
`;

export class Search extends HTMLElement {
  searchInput: HTMLInputElement;
  debouncedSearch: () => void;
  searchClear: HTMLButtonElement;
  searchIcon: HTMLSpanElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, searchStyle);
    this.shadowRoot!.appendChild($searchTemplate.content.cloneNode(true));

    this.searchInput = this.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    this.debouncedSearch = this.debounce(() => this.handleSearch(), 300);
    this.searchClear = this.shadowRoot!.querySelector('.search-clear') as HTMLButtonElement;
    this.searchIcon = this.shadowRoot!.querySelector('.search-icon') as HTMLSpanElement;
    // Initialize search from URL if present
    this.initSearchFromURL();

    // Add search functionality with debounce
    this.searchInput.addEventListener('input', this.debouncedSearch);
    // Add search clear functionality
    this.searchClear.addEventListener('click', () => {
      this.searchInput.value = '';
      this.handleSearch();
    });
  }

  // Function to debounce search input
  debounce(func: (...args: unknown[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  toggleSearchIcon() {
    this.searchClear.style.display = this.searchInput.value ? 'block' : 'none';
    this.searchIcon.style.display = this.searchInput.value ? 'none' : 'block';
  }

  // Function to handle search filtering
  handleSearch() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    this.updateSearchInURL(searchTerm);
    this.toggleSearchIcon();

    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { searchTerm },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Function to update URL with search parameter
  updateSearchInURL(searchTerm: string) {
    const url = new URL(globalThis.location.href);
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    globalThis.history.replaceState({}, '', url);
  }

  getSearchTerm() {
    // Get search term from URL
    const urlParams = new URLSearchParams(globalThis.location.search);
    const searchTerm = urlParams.get('search');
    return searchTerm || '';
  }

  // Function to initialize search from URL
  initSearchFromURL() {
    this.searchInput.value = this.getSearchTerm();
    this.toggleSearchIcon();
  }

  // Getter for current search term
  get searchTerm() {
    return this.searchInput.value.trim();
  }
}

globalThis.customElements.define('app-search', Search);
