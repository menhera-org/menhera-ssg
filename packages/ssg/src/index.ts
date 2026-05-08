
export interface MenheraSsgFrontmatter {
  title?: string;
  description?: string;
  lang?: string;
  eye_catch_image?: string;
  is404?: boolean;
}


export interface SiteConfig {
  favicon_url: string;
  branding_logo_url: string;
  site_name: string;
  site_short_name: string;
  site_slogan: string;

  /**
   * ex. https://www.example.org/
   */
  base_url: string;
}

export type CssVars = Record<string, string>;

export interface SiteShortcut {
  icon: string;
  title: string;
  url: string;
  selected?: boolean;
}

export interface Config {
  site_config: Partial<SiteConfig>;
  css_vars: CssVars;
  themes: Record<string, CssVars>;
  shortcuts: SiteShortcut[];
}
