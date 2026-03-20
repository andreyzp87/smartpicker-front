import type { InitialCatalogRender } from "../../../lib/catalog/core";
import type { CatalogFeatureKey } from "../../../lib/catalog/shared";

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

export interface DeviceCatalogBrowserProps {
  catalogEndpoint: string;
  searchEndpoint?: string;
  pageSize?: number;
  autoloadMode?: "idle" | "scroll" | "none";
  protocols: ProtocolOption[];
  manufacturers: ManufacturerOption[];
  categoryCount: number;
  featureCounts: Record<CatalogFeatureKey, number>;
  initialRender: InitialCatalogRender;
  hiddenSections?: {
    protocols?: boolean;
    manufacturers?: boolean;
    categories?: boolean;
    features?: boolean;
  };
}
