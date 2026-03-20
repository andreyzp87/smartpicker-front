import type {
  CategoriesResponse,
  HubsResponse,
  ManufacturersResponse,
  ProductsIndexResponse,
  ProtocolsResponse,
} from "../../../data/exports/types";
import { readExportJson } from "../exports";
import {
  CATALOG_FEATURE_LABELS,
  type CatalogCategoryFacetOption,
  type CatalogFeatureKey,
  type CatalogPayload,
} from "./shared";

function pushId(index: Map<string, number[]>, key: string | null, id: number) {
  if (!key) {
    return;
  }

  const existing = index.get(key);

  if (existing) {
    existing.push(id);
    return;
  }

  index.set(key, [id]);
}

function toSortedRecord(index: Map<string, number[]>) {
  return Object.fromEntries(
    [...index.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, ids]) => [key, ids.sort((left, right) => left - right)]),
  );
}

function sortFacetOptions<T extends { count: number; name: string }>(
  values: T[],
): T[] {
  return values.sort((left, right) =>
    right.count === left.count
      ? left.name.localeCompare(right.name)
      : right.count - left.count,
  );
}

function deriveCategoryFacets(
  categories: CategoriesResponse,
  categoryIndex: Map<string, number[]>,
  categoryNames: Map<string, string>,
): CatalogCategoryFacetOption[] {
  if (categories.categories.length > 0) {
    return sortFacetOptions(
      categories.categories
        .filter((category) => category.deviceCount > 0)
        .map((category) => ({
          slug: category.slug,
          path: category.path,
          name: category.name,
          count: categoryIndex.get(category.path)?.length ?? 0,
        }))
        .filter((category) => category.count > 0),
    );
  }

  return sortFacetOptions(
    [...categoryIndex.entries()].map(([path, ids]) => ({
      slug: path.split("/").at(-1) ?? path,
      path,
      name: categoryNames.get(path) ?? path,
      count: ids.length,
    })),
  );
}

async function buildCatalogPayload(): Promise<CatalogPayload> {
  const [products, protocols, manufacturers, hubs, categories] =
    await Promise.all([
      readExportJson<ProductsIndexResponse>("products.json"),
      readExportJson<ProtocolsResponse>("protocols.json"),
      readExportJson<ManufacturersResponse>("manufacturers.json"),
      readExportJson<HubsResponse>("hubs.json"),
      readExportJson<CategoriesResponse>("categories.json"),
    ]);

  const protocolIndex = new Map<string, number[]>();
  const manufacturerIndex = new Map<string, number[]>();
  const categoryIndex = new Map<string, number[]>();
  const hubIndex = new Map<string, number[]>();
  const categoryNames = new Map<string, string>();
  const featureIndex: Record<CatalogFeatureKey, number[]> = {
    localControl: [],
    matterCertified: [],
    noCloud: [],
    noHub: [],
  };

  const allProductIds: number[] = [];
  const productsById: CatalogPayload["productsById"] = {};

  for (const product of products.products) {
    allProductIds.push(product.id);
    const categoryPath =
      product.categoryPath.length > 0
        ? product.categoryPath.join("/")
        : (product.category?.slug ?? null);

    if (categoryPath && product.category?.name) {
      categoryNames.set(categoryPath, product.category.name);
    }

    productsById[String(product.id)] = {
      slug: product.slug,
      name: product.name,
      manufacturerName: product.manufacturer?.name ?? "Unknown manufacturer",
      model: product.model,
      categoryName: product.category?.name ?? null,
      primaryProtocol: product.primaryProtocol,
      localControl: product.localControl,
      compatibleHubCount: product.compatibleHubSlugs.length,
      compatibilityStatus: product.compatibilityStatuses[0] ?? null,
      updatedAt: Date.parse(product.updatedAt),
      searchText: product.searchText,
    };

    pushId(protocolIndex, product.primaryProtocol, product.id);
    pushId(manufacturerIndex, product.manufacturer?.slug ?? null, product.id);
    pushId(categoryIndex, categoryPath, product.id);

    for (const hubSlug of product.compatibleHubSlugs) {
      pushId(hubIndex, hubSlug, product.id);
    }

    if (product.localControl === true) {
      featureIndex.localControl.push(product.id);
    }
    if (product.matterCertified === true) {
      featureIndex.matterCertified.push(product.id);
    }
    if (product.cloudDependent === false) {
      featureIndex.noCloud.push(product.id);
    }
    if (product.requiresHub === false) {
      featureIndex.noHub.push(product.id);
    }
  }

  allProductIds.sort((left, right) => left - right);

  for (const key of Object.keys(featureIndex) as CatalogFeatureKey[]) {
    featureIndex[key].sort((left, right) => left - right);
  }

  return {
    allProductIds,
    productsById,
    filters: {
      protocols: toSortedRecord(protocolIndex),
      manufacturers: toSortedRecord(manufacturerIndex),
      categories: toSortedRecord(categoryIndex),
      hubs: toSortedRecord(hubIndex),
      features: featureIndex,
    },
    facets: {
      protocols: sortFacetOptions(
        protocols.protocols
          .filter((protocol) => protocol.deviceCount > 0)
          .map((protocol) => ({
            slug: protocol.slug,
            name: protocol.name,
            count: protocol.deviceCount,
          })),
      ),
      manufacturers: sortFacetOptions(
        manufacturers.manufacturers
          .filter((manufacturer) => manufacturer.deviceCount > 0)
          .map((manufacturer) => ({
            slug: manufacturer.slug,
            name: manufacturer.name,
            count: manufacturer.deviceCount,
          })),
      ),
      categories: deriveCategoryFacets(
        categories,
        categoryIndex,
        categoryNames,
      ),
      hubs: sortFacetOptions(
        hubs.hubs
          .filter((hub) => hub.deviceCount > 0)
          .map((hub) => ({
            slug: hub.slug,
            name: hub.name,
            count: hub.deviceCount,
          })),
      ),
      features: (
        Object.keys(CATALOG_FEATURE_LABELS) as CatalogFeatureKey[]
      ).map((key) => ({
        key,
        label: CATALOG_FEATURE_LABELS[key],
        count: featureIndex[key].length,
      })),
    },
  };
}

let catalogPayloadPromise: Promise<CatalogPayload> | undefined;

export function getCatalogPayload(): Promise<CatalogPayload> {
  catalogPayloadPromise ??= buildCatalogPayload();
  return catalogPayloadPromise;
}
