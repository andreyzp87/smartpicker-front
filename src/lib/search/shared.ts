import type { CatalogProduct } from "../catalog/shared";

export type SearchEntityType =
  | "device"
  | "integration"
  | "platform"
  | "hub"
  | "manufacturer";

export interface SearchCountsByType {
  device: number;
  integration: number;
  platform: number;
  hub: number;
  manufacturer: number;
}

export interface SearchDevice extends CatalogProduct {
  entityType: "device";
}

export interface SearchIntegration {
  entityType: "integration";
  slug: string;
  name: string;
  manufacturerName: string | null;
  primaryProtocol: string | null;
  integrationKind: string;
  platformCount: number;
  compatibleDeviceCount: number;
  searchText: string;
}

export interface SearchPlatform {
  entityType: "platform";
  slug: string;
  name: string;
  manufacturerName: string | null;
  kind: string;
  integrationCount: number;
  compatibleDeviceCount: number;
  searchText: string;
}

export interface SearchHub {
  entityType: "hub";
  slug: string;
  name: string;
  manufacturerName: string | null;
  compatibleDeviceCount: number;
  searchText: string;
}

export interface SearchManufacturer {
  entityType: "manufacturer";
  slug: string;
  name: string;
  deviceCount: number;
  searchText: string;
}

export type SearchEntry =
  | SearchDevice
  | SearchIntegration
  | SearchPlatform
  | SearchHub
  | SearchManufacturer;

export interface SearchPayload {
  entries: SearchEntry[];
}
