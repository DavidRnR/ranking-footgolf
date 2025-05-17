const $themeTemplate = document.createElement('template');

const themeStyle = `
  <style>
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5em;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
      transition: background-color 0.3s ease;
    }

    .theme-toggle:hover {
      background-color: var(--color-table-hover);
    }

    .sun-icon,
    .moon-icon {
      width: 1.5em;
      height: 1.5em;
    }

    .sun-icon {
      display: none;
    }

    .moon-icon {
      display: none;
    }
  </style>
`;

$themeTemplate.innerHTML =
  `
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
` + themeStyle;

class ThemeMode extends HTMLElement {
  sunIcon;
  moonIcon;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($themeTemplate.content.cloneNode(true));

    // Get the theme toggle button
    const themeToggle = this.shadowRoot.getElementById('btn-theme-toggle');
    this.sunIcon = this.shadowRoot.querySelector('.sun-icon');
    this.moonIcon = this.shadowRoot.querySelector('.moon-icon');

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
