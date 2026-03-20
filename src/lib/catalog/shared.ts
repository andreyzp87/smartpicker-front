export type CatalogFeatureKey =
  | "localControl"
  | "matterCertified"
  | "noCloud"
  | "noHub";

export interface CatalogProduct {
  slug: string;
  name: string;
  manufacturerName: string;
  model: string | null;
  categoryName: string | null;
  primaryProtocol: string | null;
  localControl: boolean | null;
  compatibleHubCount: number;
  compatibilityStatus: string | null;
  updatedAt: number;
  searchText: string;
}

export interface CatalogFacetOption {
  slug: string;
  name: string;
  count: number;
}

export interface CatalogCategoryFacetOption {
  slug: string;
  path: string;
  name: string;
  count: number;
}

export interface CatalogFeatureFacetOption {
  key: CatalogFeatureKey;
  label: string;
  count: number;
}

export interface CatalogFilters {
  protocols: Record<string, number[]>;
  manufacturers: Record<string, number[]>;
  categories: Record<string, number[]>;
  hubs: Record<string, number[]>;
  features: Record<CatalogFeatureKey, number[]>;
}

export interface CatalogPayload {
  allProductIds: number[];
  productsById: Record<string, CatalogProduct>;
  filters: CatalogFilters;
  facets: {
    protocols: CatalogFacetOption[];
    manufacturers: CatalogFacetOption[];
    categories: CatalogCategoryFacetOption[];
    hubs: CatalogFacetOption[];
    features: CatalogFeatureFacetOption[];
  };
}

export const CATALOG_FEATURE_LABELS: Record<CatalogFeatureKey, string> = {
  localControl: "Local control",
  matterCertified: "Matter certified",
  noCloud: "No cloud required",
  noHub: "No hub required",
};
