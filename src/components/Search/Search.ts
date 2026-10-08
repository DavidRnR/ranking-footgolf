import { adoptStyles } from '@utils/styles';
import {
  SEARCH_HISTORY_PAUSE_MS,
  SearchHistory,
  applySearchParam,
  readSearchParam,
  type HistoryDecision,
} from '@utils/searchHistory';
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
  searchClear: HTMLButtonElement;
  searchIcon: HTMLSpanElement;
  private readonly history: SearchHistory;
  private pauseTimer: ReturnType<typeof setTimeout> | undefined;
  private composing = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, searchStyle);
    this.shadowRoot!.appendChild($searchTemplate.content.cloneNode(true));

    this.searchInput = this.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    this.searchClear = this.shadowRoot!.querySelector('.search-clear') as HTMLButtonElement;
    this.searchIcon = this.shadowRoot!.querySelector('.search-icon') as HTMLSpanElement;

    const initial = readSearchParam(globalThis.location.search);
    this.history = new SearchHistory(initial);
    this.searchInput.value = initial;
    this.canonicalizeUrl(initial);
    this.toggleSearchIcon();

    this.searchInput.addEventListener('compositionstart', () => {
      this.composing = true;
    });
    this.searchInput.addEventListener('compositionend', () => {
      this.composing = false;
      this.onInput();
    });
    this.searchInput.addEventListener('input', () => {
      if (!this.composing) {
        this.onInput();
      }
    });
    this.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.commitNow(this.searchInput.value);
      }
    });
    this.searchClear.addEventListener('click', () => {
      this.commitNow('');
    });
    globalThis.addEventListener('popstate', () => {
      this.onPopState();
    });
  }

  private canonicalizeUrl(term: string) {
    const canonical = applySearchParam(globalThis.location.href, term);
    if (canonical !== globalThis.location.href) {
      globalThis.history.replaceState({ search: term }, '', canonical);
    }
  }

  private onInput() {
    this.apply(this.history.onType(this.searchInput.value));
    this.toggleSearchIcon();
    this.schedulePause();
  }

  /** Clear and Enter commit immediately so the list updates without waiting out the pause. */
  private commitNow(value: string) {
    this.searchInput.value = value;
    this.apply(this.history.onType(value));
    this.finishPause();
  }

  private schedulePause() {
    clearTimeout(this.pauseTimer);
    this.pauseTimer = setTimeout(() => {
      this.finishPause();
    }, SEARCH_HISTORY_PAUSE_MS);
  }

  private finishPause() {
    clearTimeout(this.pauseTimer);
    this.history.onPause();
    this.toggleSearchIcon();
    this.emitSearch();
  }

  private apply(decision: HistoryDecision) {
    if (decision.write === 'none') {
      return;
    }

    if (decision.write === 'discard') {
      globalThis.history.back();
      return;
    }

    const url = applySearchParam(globalThis.location.href, decision.term);
    const state = { search: decision.term };
    if (decision.write === 'push') {
      globalThis.history.pushState(state, '', url);
      return;
    }

    globalThis.history.replaceState(state, '', url);
  }

  private onPopState() {
    clearTimeout(this.pauseTimer);
    const term = this.history.onPopState(readSearchParam(globalThis.location.search));
    this.searchInput.value = term;
    this.toggleSearchIcon();
    this.emitSearch();
  }

  private emitSearch() {
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { searchTerm: this.history.term },
        bubbles: true,
        composed: true,
      }),
    );
  }

  toggleSearchIcon() {
    this.searchClear.style.display = this.searchInput.value ? 'block' : 'none';
    this.searchIcon.style.display = this.searchInput.value ? 'none' : 'block';
  }

  get searchTerm() {
    return this.searchInput.value.trim();
  }
}

globalThis.customElements.define('app-search', Search);
