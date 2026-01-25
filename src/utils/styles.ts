export function adoptStyles(shadowRoot: ShadowRoot, styles: string) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  shadowRoot.adoptedStyleSheets = [sheet];
}
