import { readExportJson } from "./exports";

export interface SitemapEntry {
  path: string;
  lastModified?: string;
}

interface SiteExport {
  generated: string;
}

interface ProductSummary {
  slug: string;
  updatedAt: string;
}

interface ProductsExport {
  generated: string;
  products: ProductSummary[];
}

interface ManufacturerSummary {
  slug: string;
}

interface ManufacturersExport {
  generated: string;
  manufacturers: ManufacturerSummary[];
}

interface ProtocolSummary {
  slug: string;
}

interface ProtocolsExport {
  generated: string;
  protocols: ProtocolSummary[];
}

interface HubSummary {
  slug: string;
}

interface HubsExport {
  generated: string;
  hubs: HubSummary[];
}

interface CategoryPathEntry {
  path: string;
}

interface CategoryPathsExport {
  generated: string;
  categories: CategoryPathEntry[];
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
  const [site, products, manufacturers, protocols, hubs, categoryPaths] =
    await Promise.all([
      readExportJson<SiteExport>("site.json"),
      readExportJson<ProductsExport>("products.json"),
      readExportJson<ManufacturersExport>("manufacturers.json"),
      readExportJson<ProtocolsExport>("protocols.json"),
      readExportJson<HubsExport>("hubs.json"),
      readExportJson<CategoryPathsExport>("categories/paths.json"),
    ]);

  const staticLastModified = normalizeLastModified(site.generated);
  const collectionLastModified = {
    products: normalizeLastModified(products.generated) ?? staticLastModified,
    manufacturers:
      normalizeLastModified(manufacturers.generated) ?? staticLastModified,
    protocols: normalizeLastModified(protocols.generated) ?? staticLastModified,
    hubs: normalizeLastModified(hubs.generated) ?? staticLastModified,
    categories:
      normalizeLastModified(categoryPaths.generated) ?? staticLastModified,
  };

  const entries: SitemapEntry[] = [
    { path: "/", lastModified: staticLastModified },
    { path: "/about", lastModified: staticLastModified },
    { path: "/devices", lastModified: collectionLastModified.products },
    {
      path: "/manufacturers",
      lastModified: collectionLastModified.manufacturers,
    },
    { path: "/protocols", lastModified: collectionLastModified.protocols },
    { path: "/hubs", lastModified: collectionLastModified.hubs },
    { path: "/categories", lastModified: collectionLastModified.categories },
    ...products.products.map((product) => ({
      path: `/devices/${product.slug}`,
      lastModified:
        normalizeLastModified(product.updatedAt) ??
        collectionLastModified.products,
    })),
    ...manufacturers.manufacturers.map((manufacturer) => ({
      path: `/manufacturers/${manufacturer.slug}`,
      lastModified: collectionLastModified.manufacturers,
    })),
    ...protocols.protocols.map((protocol) => ({
      path: `/protocols/${protocol.slug}`,
      lastModified: collectionLastModified.protocols,
    })),
    ...hubs.hubs.map((hub) => ({
      path: `/hubs/${hub.slug}`,
      lastModified: collectionLastModified.hubs,
    })),
    ...categoryPaths.categories.map((category) => ({
      path: `/categories/${category.path}`,
      lastModified: collectionLastModified.categories,
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
