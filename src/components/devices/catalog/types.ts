import type {
  CatalogLockedFilters,
  InitialCatalogRender,
} from "../../../lib/catalog/core";
import type {
  CatalogCategoryFacetOption,
  CatalogFacetOption,
  CatalogFeatureKey,
} from "../../../lib/catalog/shared";

export interface ProtocolOption {
  slug: string;
  name: string;
  deviceCount?: number;
  count?: number;
}

export interface ManufacturerOption {
  slug: string;
  name: string;
  deviceCount?: number;
  count?: number;
}

export interface FeatureCounts {
  localControl: number;
  matterCertified: number;
  noCloud: number;
  noHub: number;
}

export interface CatalogHiddenSections {
  protocols?: boolean;
  manufacturers?: boolean;
  categories?: boolean;
  integrations?: boolean;
  platforms?: boolean;
  hubs?: boolean;
  features?: boolean;
}

export interface CatalogBrowserInitialFacets {
  protocols: ProtocolOption[];
  manufacturers: ManufacturerOption[];
  categories: CatalogCategoryFacetOption[];
  integrations: CatalogFacetOption[];
  platforms: CatalogFacetOption[];
  hubs: CatalogFacetOption[];
  featureCounts: Record<CatalogFeatureKey, number>;
}

export interface CatalogBrowserEndpoints {
  catalog?: string;
  search?: string;
  autoloadMode?: "idle" | "scroll" | "none";
}

export interface CatalogBrowserUiConfig {
  pageSize?: number;
  hiddenSections?: CatalogHiddenSections;
  lockedFilters?: CatalogLockedFilters;
}

export interface DeviceCatalogBrowserProps {
  initialCatalog: InitialCatalogRender;
  initialFacets: CatalogBrowserInitialFacets;
  endpoints?: CatalogBrowserEndpoints;
  uiConfig?: CatalogBrowserUiConfig;
}
