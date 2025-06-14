
// Extend the global window object to include grecaptcha for TypeScript
/// <reference types="vite/client" />

interface Grecaptcha {
  ready(cb: () => void): void;
  render(
    container: string | HTMLElement,
    parameters: {
      sitekey: string;
      badge?: string;
      size?: "invisible" | "normal";
      callback?: (token: string) => void;
    }
  ): number;
  execute(siteKey?: string, options?: object): Promise<string> | void;
}

interface Window {
  grecaptcha: Grecaptcha;
}
