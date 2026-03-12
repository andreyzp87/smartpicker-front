import path from "node:path";

export type ExportSource = "local" | "remote";

const DEFAULT_EXPORTS_DIR = path.resolve(process.cwd(), "data/exports");

export function getExportSource(): ExportSource {
  const source = import.meta.env.EXPORTS_SOURCE;

  return source === "remote" ? "remote" : "local";
}

export function getLocalExportsDir(): string {
  return import.meta.env.EXPORTS_DIR || DEFAULT_EXPORTS_DIR;
}

export function getRemoteExportsBaseUrl(): string | null {
  return import.meta.env.CMS_EXPORTS_URL || null;
}
