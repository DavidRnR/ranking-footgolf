const $switchViewTemplate = document.createElement('template');

const switchViewStyle = `
  <style>
    .switch-view {
      display: flex;
      gap: 0.5em;
      padding: 1em;
    }

    .view-button {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: 50%;
      padding: 0.5em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
      transition: all 0.3s;
    }

    .view-button:hover {
      background-color: var(--color-table-hover);
    }

    .view-button.active {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .view-button svg {
      width: 24px;
      height: 24px;
    }
  </style>
`;

$switchViewTemplate.innerHTML =
  `
  <div class="switch-view">
    <button class="view-button" data-view="list" aria-label="List view" title="Lista">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    </button>
    <button class="view-button" data-view="table" aria-label="Table view" title="Tabla">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    </button>
  </div>
` + switchViewStyle;

export const VIEWS = {
  LIST: 'list',
  TABLE: 'table',
};

class SwitchView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($switchViewTemplate.content.cloneNode(true));

    this.buttons = this.shadowRoot.querySelectorAll('.view-button');
    this.currentView = VIEWS.LIST; // Default view

    // Add click listeners
    this.buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        this.switchView(view);
      });
    });

    // Set initial active state
    this.updateActiveButton();
  }

  switchView(view) {
    if (view === this.currentView) return;

    this.currentView = view;
    this.updateActiveButton();

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('viewChange', {
        detail: { view },
        bubbles: true,
        composed: true,
      }),
    );
  }

  updateActiveButton() {
    this.buttons.forEach((button) => {
      if (button.dataset.view === this.currentView) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}

customElements.define('app-switch-view', SwitchView);
