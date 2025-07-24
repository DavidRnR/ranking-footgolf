const $noResultsTemplate = document.createElement('template');

const noResultsStyle = `
    <style>
        .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5em;
            text-align: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--color-text);
            margin: 1em 0;
        }

        .empty-state svg {
            width: 24px;
            height: 24px;
        }

        @media (max-width: 768px) {
            .empty-state {
                font-size: 0.9rem;
            }

            .empty-state svg {
                width: 18px;
                height: 18px;
            }
        }
    </style>
`;

$noResultsTemplate.innerHTML =
  `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        <span>No se encontraron resultados</span>
      </div>
    ` + noResultsStyle;

export class NoResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild($noResultsTemplate.content.cloneNode(true));
  }
}

customElements.define('app-no-results', NoResults);
