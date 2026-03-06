
const configElement = document.getElementById('config');

export function jsonFromScript<T>(element: unknown): T {
  if (!(element instanceof HTMLScriptElement)) {
    throw new TypeError('Not a <script> element');
  }

  const json = element.text ?? '';
  return JSON.parse(json) as T;
}

export interface SiteConfig {
  favicon_url: string;
  site_name: string;
  site_short_name: string;
  site_slogan: string;

  /**
   * Markdown supported.
   */
  site_copyright: string;

  /**
   * ex. https://www.example.org/
   */
  base_url: string;
}

export type CssVars = Record<string, string>;

export interface Config {
  site_config: Partial<SiteConfig>;
  css_vars: CssVars;
  themes: Record<string, CssVars>;
}

export const config: Config = jsonFromScript(configElement);
