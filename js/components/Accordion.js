const $accordionTemplate = document.createElement('template');

const accordionStyle = `
  <style>
    .accordion {
      border: 1px solid var(--color-border);
      border-radius: 0.5em;
      margin: 1em 0;
      overflow: hidden;
    }

    .accordion-header {
      background-color: var(--color-table-bg);
      padding: 1em;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.3s;
    }

    .accordion-header:hover {
      background-color: var(--color-table-hover);
    }

    .accordion-content {
      padding: 1em;
      background-color: var(--color-table-bg);
      border-top: 1px solid var(--color-border);
      display: none;
    }

    .accordion-content.expanded {
      display: block;
    }

    .accordion-icon {
      transition: transform 0.3s;
    }

    .accordion-icon.expanded {
      transform: rotate(180deg);
    }
  </style>
`;

$accordionTemplate.innerHTML =
  `
  <div class="accordion">
    <div class="accordion-header">
      <slot name="collapsed"></slot>
      <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <div class="accordion-content">
      <slot name="expanded"></slot>
    </div>
  </div>
` + accordionStyle;

class Accordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($accordionTemplate.content.cloneNode(true));

    this.header = this.shadowRoot.querySelector('.accordion-header');
    this.content = this.shadowRoot.querySelector('.accordion-content');
    this.icon = this.shadowRoot.querySelector('.accordion-icon');

    this.header.addEventListener('click', () => this.toggle());
  }

  toggle() {
    const isExpanded = this.content.classList.toggle('expanded');
    this.icon.classList.toggle('expanded', isExpanded);
  }

  // Optional: Add methods to programmatically control the accordion
  expand() {
    this.content.classList.add('expanded');
    this.icon.classList.add('expanded');
  }

  collapse() {
    this.content.classList.remove('expanded');
    this.icon.classList.remove('expanded');
  }
}

window.customElements.define('app-accordion', Accordion);
