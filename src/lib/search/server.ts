import type {
  HubsResponse,
  IntegrationsResponse,
  ManufacturersResponse,
  PlatformsResponse,
  ProductsIndexResponse,
} from "../../../data/exports/types";
import { readExportJson } from "../exports";
import type { SearchPayload } from "./shared";

async function buildSearchPayload(): Promise<SearchPayload> {
  const [products, integrations, platforms, hubs, manufacturers] =
    await Promise.all([
    readExportJson<ProductsIndexResponse>("products.json"),
    readExportJson<IntegrationsResponse>("integrations.json"),
    readExportJson<PlatformsResponse>("platforms.json"),
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
        id: product.id,
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
        compatibleIntegrationCount: product.compatibleIntegrationSlugs.length,
        compatiblePlatformCount: product.compatiblePlatformSlugs.length,
        compatibleHubCount: product.compatibleHubSlugs.length,
        compatibleIntegrationSlugs: product.compatibleIntegrationSlugs,
        compatiblePlatformSlugs: product.compatiblePlatformSlugs,
        compatibleHubSlugs: product.compatibleHubSlugs,
        compatibilityStatus: product.compatibilityStatuses[0] ?? null,
        updatedAt: Date.parse(product.updatedAt),
        searchText: product.searchText.toLowerCase(),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const integrationEntries = integrations.integrations
    .map((integration) => ({
      entityType: "integration" as const,
      slug: integration.slug,
      name: integration.name,
      manufacturerName: integration.manufacturer?.name ?? null,
      primaryProtocol: integration.primaryProtocol,
      integrationKind: integration.integrationKind,
      platformCount: integration.platformSlugs.length,
      compatibleDeviceCount: integration.compatibleDeviceCount,
      searchText: integration.searchText.toLowerCase(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const platformEntries = platforms.platforms
    .map((platform) => ({
      entityType: "platform" as const,
      slug: platform.slug,
      name: platform.name,
      manufacturerName: platform.manufacturer?.name ?? null,
      kind: platform.kind,
      integrationCount: platform.integrationSlugs.length,
      compatibleDeviceCount: platform.compatibleDeviceCountDerived,
      searchText: platform.searchText.toLowerCase(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const hubEntries = hubs.hubs
    .map((hub) => ({
      entityType: "hub" as const,
      slug: hub.slug,
      name: hub.name,
      manufacturerName: hub.manufacturer?.name ?? null,
      compatibleDeviceCount: hub.compatibleDeviceCount,
      searchText: hub.searchText.toLowerCase(),
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
    entries: [
      ...deviceEntries,
      ...integrationEntries,
      ...platformEntries,
      ...hubEntries,
      ...manufacturerEntries,
    ].sort((left, right) => left.name.localeCompare(right.name)),
  };
}

let searchPayloadPromise: Promise<SearchPayload> | undefined;

export function getSearchPayload(): Promise<SearchPayload> {
  searchPayloadPromise ??= buildSearchPayload();
  return searchPayloadPromise;
}
