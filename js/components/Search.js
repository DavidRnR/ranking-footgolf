const $searchTemplate = document.createElement('template');

const searchStyle = `
  <style>
    .search-container {
      display: flex;
      align-items: center;
      gap: 0.5em;
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 0.5em 1em;
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
    />
  </div>
` + searchStyle;

class Search extends HTMLElement {
  searchInput;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($searchTemplate.content.cloneNode(true));

    this.searchInput = this.shadowRoot.querySelector('.search-input');
    this.debouncedSearch = this.debounce(() => this.handleSearch(), 300);

    // Initialize search from URL if present
    this.initSearchFromURL();

    // Add search functionality with debounce
    this.searchInput.addEventListener('input', this.debouncedSearch);
  }

  // Function to debounce search input
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Function to handle search filtering
  handleSearch() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    this.updateSearchInURL(searchTerm);
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { searchTerm },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Function to update URL with search parameter
  updateSearchInURL(searchTerm) {
    const url = new URL(window.location);
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
  }

  // Getter for current search term
  get searchTerm() {
    return this.searchInput.value.trim();
  }
}

window.customElements.define('app-search', Search);
