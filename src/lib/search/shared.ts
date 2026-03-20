import type { CatalogProduct } from "../catalog/shared";

export type SearchEntityType = "device" | "hub" | "manufacturer";

export interface SearchCountsByType {
  device: number;
  hub: number;
  manufacturer: number;
}

export interface SearchDevice extends CatalogProduct {
  entityType: "device";
  manufacturerSlug: string | null;
  categoryPath: string | null;
  cloudDependent: boolean | null;
  requiresHub: boolean | null;
  matterCertified: boolean | null;
  compatibleHubSlugs: string[];
}

export interface SearchHub {
  entityType: "hub";
  slug: string;
  name: string;
  manufacturerName: string | null;
  protocolsSupported: string[];
  deviceCount: number;
  searchText: string;
}

export interface SearchManufacturer {
  entityType: "manufacturer";
  slug: string;
  name: string;
  deviceCount: number;
  searchText: string;
}

export type SearchEntry = SearchDevice | SearchHub | SearchManufacturer;

export interface SearchPayload {
  entries: SearchEntry[];
}
