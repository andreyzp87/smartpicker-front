/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly EXPORTS_SOURCE?: "local" | "remote";
  readonly EXPORTS_DIR?: string;
  readonly CMS_EXPORTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
