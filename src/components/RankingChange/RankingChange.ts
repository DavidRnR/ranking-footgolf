import { adoptStyles } from '@utils/styles';
import rankingChangeStyle from './rankingChange.css?inline';

const $rankingChangeTemplate = document.createElement('template');

$rankingChangeTemplate.innerHTML = `
  <span class="rank-neutral" part="icon">•</span>
`;

export class RankingChange extends HTMLElement {
  private _value = 0;

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    this._value = newValue;
    this.render();
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const shadow = this.shadowRoot;

    if (!shadow) {
      return;
    }

    adoptStyles(shadow, rankingChangeStyle);
    shadow.appendChild($rankingChangeTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    const shadow = this.shadowRoot;

    if (!shadow) {
      return;
    }

    const icon = shadow.querySelector('span');

    if (!icon) {
      return;
    }

    if (this._value > 0) {
      icon.className = 'rank-up';
      icon.textContent = '↑';
      return;
    }

    if (this._value < 0) {
      icon.className = 'rank-down';
      icon.textContent = '↓';
      return;
    }

    icon.className = 'rank-neutral';
    icon.textContent = '•';
  }
}

globalThis.customElements.define('app-ranking-change', RankingChange);
