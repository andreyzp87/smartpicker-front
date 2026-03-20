import type {
  HubsResponse,
  ManufacturersResponse,
  ProductsIndexResponse,
} from "../../../data/exports/types";
import { readExportJson } from "../exports";
import type { SearchPayload } from "./shared";

async function buildSearchPayload(): Promise<SearchPayload> {
  const [products, hubs, manufacturers] = await Promise.all([
    readExportJson<ProductsIndexResponse>("products.json"),
    readExportJson<HubsResponse>("hubs.json"),
    readExportJson<ManufacturersResponse>("manufacturers.json"),
  ]);

  const deviceEntries = products.products
    .map((product) => {
      const categoryPath =
        product.categoryPath.length > 0
          ? product.categoryPath.join("/")
          : (product.category?.slug ?? null);

      return {
        entityType: "device" as const,
        slug: product.slug,
        name: product.name,
        manufacturerSlug: product.manufacturer?.slug ?? null,
        manufacturerName: product.manufacturer?.name ?? "Unknown manufacturer",
        model: product.model,
        categoryName: product.category?.name ?? null,
        categoryPath,
        primaryProtocol: product.primaryProtocol,
        localControl: product.localControl,
        cloudDependent: product.cloudDependent,
        requiresHub: product.requiresHub,
        matterCertified: product.matterCertified,
        compatibleHubCount: product.compatibleHubSlugs.length,
        compatibleHubSlugs: product.compatibleHubSlugs,
        compatibilityStatus: product.compatibilityStatuses[0] ?? null,
        updatedAt: Date.parse(product.updatedAt),
        searchText: product.searchText.toLowerCase(),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const hubEntries = hubs.hubs
    .map((hub) => ({
      entityType: "hub" as const,
      slug: hub.slug,
      name: hub.name,
      manufacturerName: hub.manufacturer?.name ?? null,
      protocolsSupported: hub.protocolsSupported,
      deviceCount: hub.deviceCount,
      searchText: [
        hub.name,
        hub.manufacturer?.name,
        hub.description,
        ...hub.protocolsSupported,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const manufacturerEntries = manufacturers.manufacturers
    .map((manufacturer) => ({
      entityType: "manufacturer" as const,
      slug: manufacturer.slug,
      name: manufacturer.name,
      deviceCount: manufacturer.deviceCount,
      searchText: [manufacturer.name, manufacturer.website]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    entries: [...deviceEntries, ...hubEntries, ...manufacturerEntries].sort(
      (left, right) => left.name.localeCompare(right.name),
    ),
  };
}

let searchPayloadPromise: Promise<SearchPayload> | undefined;

export function getSearchPayload(): Promise<SearchPayload> {
  searchPayloadPromise ??= buildSearchPayload();
  return searchPayloadPromise;
}
