import { adoptStyles } from '@utils/styles';
import noResultsStyle from './noresults.css?inline';

const $noResultsTemplate = document.createElement('template');

$noResultsTemplate.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        <span>No se encontraron resultados</span>
      </div>
    `;

export class NoResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, noResultsStyle);
    this.shadowRoot!.appendChild($noResultsTemplate.content.cloneNode(true));
  }
}

globalThis.customElements.define('app-no-results', NoResults);
