import { adoptStyles } from '@utils/styles';
import themeStyle from './thememode.css?inline';

const $themeTemplate = document.createElement('template');

$themeTemplate.innerHTML = `
  <button id="btn-theme-toggle" class="theme-toggle" aria-label="Toggle theme" title="Tema">
    <svg
      class="sun-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg
      class="moon-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
`;

export class ThemeMode extends HTMLElement {
  sunIcon: SVGSVGElement;
  moonIcon: SVGSVGElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, themeStyle);
    this.shadowRoot!.appendChild($themeTemplate.content.cloneNode(true));

    // Get the theme toggle button
    const themeToggle = this.shadowRoot!.getElementById('btn-theme-toggle') as HTMLButtonElement;
    this.sunIcon = this.shadowRoot!.querySelector('.sun-icon') as SVGSVGElement;
    this.moonIcon = this.shadowRoot!.querySelector('.moon-icon') as SVGSVGElement;

    // Set initial icon visibility
    this.updateIcons();

    // Add click event listener
    themeToggle.addEventListener('click', () => {
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('themeChange'));
      // Update icons after theme change
      this.updateIcons();
    });
  }

  updateIcons() {
    if (document.body.classList.contains('dark')) {
      this.sunIcon.style.display = 'none';
      this.moonIcon.style.display = 'block';
    } else {
      this.sunIcon.style.display = 'block';
      this.moonIcon.style.display = 'none';
    }
  }

  initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Get theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Set initial theme
    document.body.classList.add(initialTheme);

    // Listen for theme changes from the web component
    this.addEventListener('themeChange', () => {
      const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        document.body.classList.toggle('dark');
        document.body.classList.toggle('light');
        // Save theme preference to localStorage
        localStorage.setItem('theme', newTheme);
      });
    });
  }
}

window.customElements.define('app-theme-mode', ThemeMode);
