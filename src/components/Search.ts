const $searchTemplate = document.createElement('template');

const searchStyle = `
  <style>
    .search-container {
      display: flex;
      align-items: center;
      gap: 0.5em;
      flex: 1;
      max-width: 400px;
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 0.5em 2.5em 0.5em 1em;
      border: 1px solid var(--color-border);
      border-radius: 0.5em;
      background-color: var(--color-table-bg);
      color: var(--color-text);
      font-size: 1em;
      transition: border-color 0.3s, background-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .search-input::placeholder {
      color: var(--color-text);
      opacity: 0.7;
    }

    .search-icon,
    .search-clear {
      position: absolute;
      right: 0.75em;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text);
      opacity: 0.7;
      width: 16px;
      height: 16px;
    }

    .search-clear {
      cursor: pointer;
    }

    @media screen and (max-width: 1024px) {
        .search-container {
            max-width: 100%;
        }
   }
  </style>
`;

$searchTemplate.innerHTML =
  `
  <div class="search-container">
    <input
      type="text"
      class="search-input"
      placeholder="Buscar..."
      maxlength="50"
    />
    <span class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
        </svg>
    </span>
    <span class="search-clear" style="display: none;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </span>
  </div>
` + searchStyle;

export class Search extends HTMLElement {
  searchInput: HTMLInputElement;
  debouncedSearch: () => void;
  searchClear: HTMLSpanElement;
  searchIcon: HTMLSpanElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild($searchTemplate.content.cloneNode(true));

    this.searchInput = this.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    this.debouncedSearch = this.debounce(() => this.handleSearch(), 300);
    this.searchClear = this.shadowRoot!.querySelector('.search-clear') as HTMLSpanElement;
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
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url);
  }

  getSearchTerm() {
    // Get search term from URL
    const urlParams = new URLSearchParams(window.location.search);
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

window.customElements.define('app-search', Search);
