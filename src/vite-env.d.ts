/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string;
  export default css;
}

declare module '*?inline' {
  const content: string;
  export default content;
}
