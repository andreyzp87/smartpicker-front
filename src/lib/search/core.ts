import type {
  CatalogLockedFilters,
  CatalogResults,
  CatalogState,
} from "../catalog/core";
import type { CatalogFeatureKey } from "../catalog/shared";
import type {
  SearchCountsByType,
  SearchDevice,
  SearchEntry,
  SearchEntityType,
  SearchPayload,
} from "./shared";

export interface SearchPreviewResults {
  matches: SearchEntry[];
  totalCount: number;
  countsByType: SearchCountsByType;
}

function createEmptyCountsByType(): SearchCountsByType {
  return {
    device: 0,
    integration: 0,
    platform: 0,
    hub: 0,
    manufacturer: 0,
  };
}

function countEntriesByType(entries: SearchEntry[]) {
  const counts = createEmptyCountsByType();

  for (const entry of entries) {
    counts[entry.entityType] += 1;
  }

  return counts;
}

export function getSearchEntityTypeLabel(type: SearchEntityType) {
  if (type === "device") {
    return "Devices";
  }

  if (type === "hub") {
    return "Hubs";
  }

  if (type === "integration") {
    return "Integrations";
  }

  if (type === "platform") {
    return "Platforms";
  }

  return "Manufacturers";
}

export function isSearchDeviceEntry(entry: SearchEntry): entry is SearchDevice {
  return entry.entityType === "device";
}

function matchesEntityTypes(
  entry: SearchEntry,
  entityTypes: SearchEntityType[],
) {
  return entityTypes.includes(entry.entityType);
}

function matchesFeature(product: SearchDevice, key: CatalogFeatureKey) {
  if (key === "localControl") {
    return product.localControl === true;
  }

  if (key === "matterCertified") {
    return product.matterCertified === true;
  }

  if (key === "noCloud") {
    return product.cloudDependent === false;
  }

  return product.requiresHub === false;
}

function matchesLockedFilters(
  product: SearchDevice,
  lockedFilters: CatalogLockedFilters | undefined,
) {
  if (
    lockedFilters?.protocols?.length &&
    !lockedFilters.protocols.includes(product.primaryProtocol ?? "")
  ) {
    return false;
  }

  if (
    lockedFilters?.manufacturers?.length &&
    !lockedFilters.manufacturers.includes(product.manufacturerSlug ?? "")
  ) {
    return false;
  }

  if (
    lockedFilters?.categories?.length &&
    !lockedFilters.categories.includes(product.categoryPath ?? "")
  ) {
    return false;
  }

  if (
    lockedFilters?.integrations?.length &&
    !lockedFilters.integrations.some((integrationSlug) =>
      product.compatibleIntegrationSlugs.includes(integrationSlug),
    )
  ) {
    return false;
  }

  if (
    lockedFilters?.platforms?.length &&
    !lockedFilters.platforms.some((platformSlug) =>
      product.compatiblePlatformSlugs.includes(platformSlug),
    )
  ) {
    return false;
  }

  if (
    lockedFilters?.hubs?.length &&
    !lockedFilters.hubs.some((hubSlug) =>
      product.compatibleHubSlugs.includes(hubSlug),
    )
  ) {
    return false;
  }

  for (const [key, enabled] of Object.entries(
    lockedFilters?.features ?? {},
  ) as Array<[CatalogFeatureKey, boolean | undefined]>) {
    if (enabled && !matchesFeature(product, key)) {
      return false;
    }
  }

  return true;
}

function sortProducts(products: SearchDevice[], state: CatalogState) {
  return [...products].sort((left, right) => {
    if (state.sort === "name-desc") {
      return right.name.localeCompare(left.name);
    }

    if (state.sort === "newest") {
      return right.updatedAt - left.updatedAt;
    }

    if (state.sort === "manufacturer") {
      const byManufacturer = left.manufacturerName.localeCompare(
        right.manufacturerName,
      );

      if (byManufacturer !== 0) {
        return byManufacturer;
      }

      return left.name.localeCompare(right.name);
    }

    if (state.sort === "compatibility") {
      const byCompatibility =
        right.compatibleIntegrationCount * 100 +
        right.compatiblePlatformCount * 10 +
        right.compatibleHubCount -
        (left.compatibleIntegrationCount * 100 +
          left.compatiblePlatformCount * 10 +
          left.compatibleHubCount);

      if (byCompatibility !== 0) {
        return byCompatibility;
      }

      return left.name.localeCompare(right.name);
    }

    return left.name.localeCompare(right.name);
  });
}

function buildPagedResults(
  products: SearchDevice[],
  page: number,
  pageSize: number,
): CatalogResults {
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = products.length === 0 ? 0 : (safePage - 1) * pageSize;
  const pagedProducts = products.slice(startIndex, startIndex + pageSize);

  return {
    filteredProducts: products,
    pagedProducts,
    totalPages,
    safePage,
    from: products.length === 0 ? 0 : startIndex + 1,
    to: startIndex + pagedProducts.length,
  };
}

export function hasCatalogSelectionFilters(state: CatalogState) {
  return (
    state.protocols.length > 0 ||
    state.manufacturers.length > 0 ||
    state.categories.length > 0 ||
    state.integrations.length > 0 ||
    state.platforms.length > 0 ||
    state.hubs.length > 0 ||
    Object.values(state.features).some(Boolean)
  );
}

export function isSearchOnlyCatalogState(state: CatalogState) {
  return state.q.trim().length > 0 && !hasCatalogSelectionFilters(state);
}

function getMatchingEntries(
  payload: SearchPayload | null,
  query: string,
  entityTypes: SearchEntityType[],
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!payload || !normalizedQuery) {
    return [];
  }

  return payload.entries.filter(
    (entry) =>
      matchesEntityTypes(entry, entityTypes) &&
      entry.searchText.includes(normalizedQuery),
  );
}

export function getSearchPreviewResults(
  payload: SearchPayload | null,
  query: string,
  limit: number,
  entityTypes: SearchEntityType[],
): SearchPreviewResults {
  const matches = getMatchingEntries(payload, query, entityTypes);

  if (matches.length === 0) {
    return {
      matches: [],
      totalCount: 0,
      countsByType: createEmptyCountsByType(),
    };
  }

  return {
    matches: matches.slice(0, limit),
    totalCount: matches.length,
    countsByType: countEntriesByType(matches),
  };
}

export function getSearchCatalogResults(
  payload: SearchPayload | null,
  state: CatalogState,
  lockedFilters: CatalogLockedFilters | undefined,
  pageSize: number,
): CatalogResults {
  const normalizedQuery = state.q.trim().toLowerCase();
  const matchingProducts = getMatchingEntries(payload, normalizedQuery, [
    "device",
  ]).filter(isSearchDeviceEntry);

  if (matchingProducts.length === 0) {
    return buildPagedResults([], state.page, pageSize);
  }

  const filteredProducts = sortProducts(
    matchingProducts.filter((product) =>
      matchesLockedFilters(product, lockedFilters),
    ),
    state,
  );

  return buildPagedResults(filteredProducts, state.page, pageSize);
}
