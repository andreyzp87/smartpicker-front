import type {
  CategoryPathsResponse,
  HubsResponse,
  IntegrationSlugsResponse,
  ManufacturerSlugsResponse,
  PlatformSlugsResponse,
  ProductSlugsResponse,
  ProtocolSlugsResponse,
  SiteResponse,
} from "../../data/exports/types";
import { readExportJson } from "./exports";

export interface SitemapEntry {
  path: string;
  lastModified?: string;
}

function normalizeLastModified(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return undefined;
  }

  return date.toISOString();
}

function normalizePath(path: string): string {
  if (path === "/") {
    return "/";
  }

  const trimmed = path.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [
    site,
    productSlugs,
    manufacturerSlugs,
    protocolSlugs,
    integrationSlugs,
    platformSlugs,
    hubs,
    categoryPaths,
  ] = await Promise.all([
    readExportJson<SiteResponse>("site.json"),
    readExportJson<ProductSlugsResponse>("products/slugs.json"),
    readExportJson<ManufacturerSlugsResponse>("manufacturers/slugs.json"),
    readExportJson<ProtocolSlugsResponse>("protocols/slugs.json"),
    readExportJson<IntegrationSlugsResponse>("integrations/slugs.json"),
    readExportJson<PlatformSlugsResponse>("platforms/slugs.json"),
    readExportJson<HubsResponse>("hubs.json"),
    readExportJson<CategoryPathsResponse>("categories/paths.json"),
  ]);

  const staticLastModified = normalizeLastModified(site.generated);
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: staticLastModified },
    { path: "/about", lastModified: staticLastModified },
    { path: "/devices", lastModified: staticLastModified },
    { path: "/integrations", lastModified: staticLastModified },
    { path: "/platforms", lastModified: staticLastModified },
    { path: "/hubs", lastModified: staticLastModified },
    { path: "/manufacturers", lastModified: staticLastModified },
    { path: "/protocols", lastModified: staticLastModified },
    { path: "/categories", lastModified: staticLastModified },
    ...productSlugs.slugs.map((slug) => ({
      path: `/devices/${slug}`,
      lastModified: staticLastModified,
    })),
    ...manufacturerSlugs.slugs.map((slug) => ({
      path: `/manufacturers/${slug}`,
      lastModified: staticLastModified,
    })),
    ...protocolSlugs.slugs.map((slug) => ({
      path: `/protocols/${slug}`,
      lastModified: staticLastModified,
    })),
    ...integrationSlugs.slugs.map((slug) => ({
      path: `/integrations/${slug}`,
      lastModified: staticLastModified,
    })),
    ...platformSlugs.slugs.map((slug) => ({
      path: `/platforms/${slug}`,
      lastModified: staticLastModified,
    })),
    ...hubs.hubs.map((hub) => ({
      path: `/hubs/${hub.slug}`,
      lastModified: normalizeLastModified(hub.updatedAt) ?? staticLastModified,
    })),
    ...categoryPaths.categories.map((category) => ({
      path: `/categories/${category.path}`,
      lastModified: staticLastModified,
    })),
  ];

  const uniqueEntries = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    uniqueEntries.set(normalizePath(entry.path), {
      path: normalizePath(entry.path),
      lastModified: entry.lastModified,
    });
  }

  return [...uniqueEntries.values()].sort((left, right) =>
    left.path.localeCompare(right.path),
  );
}
