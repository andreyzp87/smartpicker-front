import type {
  CatalogFeatureKey,
  CatalogPayload,
  CatalogProduct,
} from "./shared";

export type SortMode =
  | "name-asc"
  | "name-desc"
  | "newest"
  | "manufacturer"
  | "compatibility";

export type ViewMode = "grid" | "list";

export interface CatalogLockedFilters {
  protocols?: string[];
  manufacturers?: string[];
  categories?: string[];
  integrations?: string[];
  platforms?: string[];
  hubs?: string[];
  features?: Partial<Record<CatalogFeatureKey, boolean>>;
}

export interface CatalogState {
  q: string;
  protocols: string[];
  manufacturers: string[];
  categories: string[];
  integrations: string[];
  platforms: string[];
  hubs: string[];
  features: Record<CatalogFeatureKey, boolean>;
  sort: SortMode;
  view: ViewMode;
  page: number;
}

export type ActiveChip =
  | {
      kind: "search";
      value: "q";
      label: string;
    }
  | {
      kind:
        | "protocol"
        | "manufacturer"
        | "category"
        | "integration"
        | "platform"
        | "hub"
        | "feature";
      value: string;
      label: string;
    };

export interface CatalogResults {
  filteredProducts: CatalogProduct[];
  pagedProducts: CatalogProduct[];
  totalPages: number;
  safePage: number;
  from: number;
  to: number;
}

export interface InitialCatalogRender {
  products: CatalogProduct[];
  totalCount: number;
  totalPages: number;
  page: number;
  from: number;
  to: number;
}

export function createDefaultCatalogState(): CatalogState {
  return {
    q: "",
    protocols: [],
    manufacturers: [],
    categories: [],
    integrations: [],
    platforms: [],
    hubs: [],
    features: {
      localControl: false,
      matterCertified: false,
      noCloud: false,
      noHub: false,
    },
    sort: "name-asc",
    view: "grid",
    page: 1,
  };
}

export function isDefaultCatalogState(state: CatalogState) {
  const defaults = createDefaultCatalogState();

  return (
    state.q === defaults.q &&
    state.protocols.length === 0 &&
    state.manufacturers.length === 0 &&
    state.categories.length === 0 &&
    state.integrations.length === 0 &&
    state.platforms.length === 0 &&
    state.hubs.length === 0 &&
    state.features.localControl === defaults.features.localControl &&
    state.features.matterCertified === defaults.features.matterCertified &&
    state.features.noCloud === defaults.features.noCloud &&
    state.features.noHub === defaults.features.noHub &&
    state.sort === defaults.sort &&
    state.view === defaults.view &&
    state.page === defaults.page
  );
}

export function parseMultiValue(params: URLSearchParams, key: string) {
  return [
    ...new Set(
      params
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

export function parseCatalogState(search: string): CatalogState {
  const params = new URLSearchParams(search);
  const sort = params.get("sort");
  const page = Number.parseInt(params.get("page") ?? "1", 10);

  return {
    q: params.get("q") ?? "",
    protocols: parseMultiValue(params, "protocol"),
    manufacturers: parseMultiValue(params, "manufacturer"),
    categories: parseMultiValue(params, "category"),
    integrations: parseMultiValue(params, "integration"),
    platforms: parseMultiValue(params, "platform"),
    hubs: parseMultiValue(params, "hub"),
    features: {
      localControl: params.get("local") === "1",
      matterCertified: params.get("matter") === "1",
      noCloud: params.get("noCloud") === "1",
      noHub: params.get("noHub") === "1",
    },
    sort: (
      [
        "name-asc",
        "name-desc",
        "newest",
        "manufacturer",
        "compatibility",
      ] as const
    ).includes(sort as SortMode)
      ? (sort as SortMode)
      : "name-asc",
    view: params.get("view") === "list" ? "list" : "grid",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function serializeCatalogState(
  state: CatalogState,
  safePage = state.page,
) {
  const params = new URLSearchParams();

  if (state.q) {
    params.set("q", state.q);
  }

  for (const value of state.protocols) {
    params.append("protocol", value);
  }
  for (const value of state.manufacturers) {
    params.append("manufacturer", value);
  }
  for (const value of state.categories) {
    params.append("category", value);
  }
  for (const value of state.integrations) {
    params.append("integration", value);
  }
  for (const value of state.platforms) {
    params.append("platform", value);
  }
  for (const value of state.hubs) {
    params.append("hub", value);
  }

  if (state.features.localControl) {
    params.set("local", "1");
  }
  if (state.features.matterCertified) {
    params.set("matter", "1");
  }
  if (state.features.noCloud) {
    params.set("noCloud", "1");
  }
  if (state.features.noHub) {
    params.set("noHub", "1");
  }
  if (state.sort !== "name-asc") {
    params.set("sort", state.sort);
  }
  if (state.view !== "grid") {
    params.set("view", state.view);
  }
  if (safePage > 1) {
    params.set("page", String(safePage));
  }

  return params.toString();
}

export function toggleStringValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value].sort((left, right) => left.localeCompare(right));
}

function unionOrderedIds(groups: number[][]) {
  const merged = new Set<number>();

  for (const group of groups) {
    for (const id of group) {
      merged.add(id);
    }
  }

  return [...merged].sort((left, right) => left - right);
}

function intersectOrderedIds(left: number[], right: number[]) {
  const matches: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      matches.push(left[leftIndex]);
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    if (left[leftIndex] < right[rightIndex]) {
      leftIndex += 1;
    } else {
      rightIndex += 1;
    }
  }

  return matches;
}

function facetUnion(selected: string[], index: Record<string, number[]>) {
  if (selected.length === 0) {
    return null;
  }

  return unionOrderedIds(
    [...new Set(selected)]
      .map((value) => index[value] ?? [])
      .filter((ids) => ids.length > 0),
  );
}

export function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  const orderedPages = [...pages].sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  for (const page of orderedPages) {
    const previous = items.at(-1);

    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

export function getCatalogResults(
  payload: CatalogPayload | null,
  state: CatalogState,
  query: string,
  lockedFilters: CatalogLockedFilters | undefined,
  pageSize: number,
): CatalogResults {
  if (!payload) {
    return {
      filteredProducts: [],
      pagedProducts: [],
      totalPages: 1,
      safePage: 1,
      from: 0,
      to: 0,
    };
  }

  const groups = [
    facetUnion(state.protocols, payload.filters.protocols),
    facetUnion(state.manufacturers, payload.filters.manufacturers),
    facetUnion(state.categories, payload.filters.categories),
    facetUnion(state.integrations, payload.filters.integrations),
    facetUnion(state.platforms, payload.filters.platforms),
    facetUnion(state.hubs, payload.filters.hubs),
  ].filter((group): group is number[] => Boolean(group));

  if (lockedFilters?.protocols?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.protocols)]
          .map((value) => payload.filters.protocols[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  if (lockedFilters?.manufacturers?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.manufacturers)]
          .map((value) => payload.filters.manufacturers[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  if (lockedFilters?.categories?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.categories)]
          .map((value) => payload.filters.categories[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  if (lockedFilters?.hubs?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.hubs)]
          .map((value) => payload.filters.hubs[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  if (lockedFilters?.integrations?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.integrations)]
          .map((value) => payload.filters.integrations[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  if (lockedFilters?.platforms?.length) {
    groups.push(
      unionOrderedIds(
        [...new Set(lockedFilters.platforms)]
          .map((value) => payload.filters.platforms[value] ?? [])
          .filter((ids) => ids.length > 0),
      ),
    );
  }

  const lockedFeatureState = lockedFilters?.features ?? {};

  for (const key of Object.keys(state.features) as CatalogFeatureKey[]) {
    if (state.features[key] || lockedFeatureState[key]) {
      groups.push(payload.filters.features[key]);
    }
  }

  let matchingIds = payload.allProductIds;

  for (const group of groups) {
    matchingIds = intersectOrderedIds(matchingIds, group);
  }

  if (query.trim()) {
    const normalizedQuery = query.trim().toLowerCase();
    matchingIds = matchingIds.filter((id) =>
      payload.productsById[String(id)].searchText
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }

  const filteredProducts = matchingIds
    .map((id) => payload.productsById[String(id)])
    .filter(Boolean)
    .sort((left, right) => {
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(state.page, totalPages);
  const startIndex =
    filteredProducts.length === 0 ? 0 : (safePage - 1) * pageSize;
  const pagedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize,
  );

  return {
    filteredProducts,
    pagedProducts,
    totalPages,
    safePage,
    from: filteredProducts.length === 0 ? 0 : startIndex + 1,
    to: startIndex + pagedProducts.length,
  };
}
