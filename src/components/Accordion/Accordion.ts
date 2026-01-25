import { adoptStyles } from '@utils/styles';
import accordionStyle from './accordion.css?inline';
const $accordionTemplate = document.createElement('template');

$accordionTemplate.innerHTML = `
  <div class="accordion">
    <button class="accordion-header" aria-expanded="false" aria-controls="accordion-content">
      <slot name="collapsed"></slot>
      <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    <div class="accordion-content" id="accordion-content" role="region">
      <slot name="expanded"></slot>
    </div>
  </div>
`;

export class Accordion extends HTMLElement {
  header: HTMLButtonElement;
  content: HTMLElement;
  icon: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, accordionStyle);
    this.shadowRoot!.appendChild($accordionTemplate.content.cloneNode(true));

    this.header = this.shadowRoot!.querySelector('.accordion-header') as HTMLButtonElement;
    this.content = this.shadowRoot!.querySelector('.accordion-content') as HTMLElement;
    this.icon = this.shadowRoot!.querySelector('.accordion-icon') as HTMLElement;

    // Generate unique ID for aria-controls
    const contentId = `accordion-content-${Math.random().toString(36).substr(2, 9)}`;
    this.content.id = contentId;
    this.header.setAttribute('aria-controls', contentId);

    // Click handler
    this.header.addEventListener('click', () => this.toggle());

    // Keyboard handler (Enter and Space)
    this.header.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    const isExpanded = this.content.classList.toggle('expanded');
    this.icon.classList.toggle('expanded', isExpanded);
    this.header.setAttribute('aria-expanded', isExpanded.toString());
  }

  expand() {
    this.content.classList.add('expanded');
    this.icon.classList.add('expanded');
    this.header.setAttribute('aria-expanded', 'true');
  }

  collapse() {
    this.content.classList.remove('expanded');
    this.icon.classList.remove('expanded');
    this.header.setAttribute('aria-expanded', 'false');
  }
}

window.customElements.define('app-accordion', Accordion);
