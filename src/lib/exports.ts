import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  getExportSource,
  getLocalExportsDir,
  getRemoteExportsBaseUrl,
} from "./config";

function normalizeExportPath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "");
}

async function readLocalExport(relativePath: string): Promise<string> {
  const fullPath = path.join(
    getLocalExportsDir(),
    normalizeExportPath(relativePath),
  );
  return readFile(fullPath, "utf8");
}

async function readRemoteExport(relativePath: string): Promise<string> {
  const baseUrl = getRemoteExportsBaseUrl();

  if (!baseUrl) {
    throw new Error("CMS_EXPORTS_URL is required when EXPORTS_SOURCE=remote.");
  }

  const url = new URL(
    normalizeExportPath(relativePath),
    `${baseUrl.replace(/\/$/, "")}/`,
  );
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch export "${relativePath}": ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

export async function readExportText(relativePath: string): Promise<string> {
  if (getExportSource() === "remote") {
    return readRemoteExport(relativePath);
  }

  return readLocalExport(relativePath);
}

export async function readExportJson<T>(relativePath: string): Promise<T> {
  const contents = await readExportText(relativePath);
  return JSON.parse(contents) as T;
}
