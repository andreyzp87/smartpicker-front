import { useState } from "react";

import type { CatalogState } from "../../../lib/catalog/core";
import { getProtocolStyle } from "../../../lib/ui";
import type { CatalogFeatureKey } from "../../../lib/catalog/shared";
import { SearchInput } from "./SearchInput";
import { ToggleSwitch } from "./ToggleSwitch";
import type {
  FeatureCounts,
  ManufacturerOption,
  ProtocolOption,
} from "./types";

interface CatalogSidebarProps {
  protocols: ProtocolOption[];
  manufacturers: ManufacturerOption[];
  categoryCount: number;
  featureCounts: FeatureCounts;
  state: CatalogState;
  onToggleProtocol: (value: string) => void;
  onToggleManufacturer: (value: string) => void;
  onToggleFeature: (key: CatalogFeatureKey) => void;
  onResetFilters: () => void;
  hiddenSections?: {
    protocols?: boolean;
    manufacturers?: boolean;
    categories?: boolean;
    features?: boolean;
  };
}

const featureOptions = [
  ["localControl", "Local control"],
  ["matterCertified", "Matter certified"],
  ["noCloud", "No cloud required"],
  ["noHub", "No hub required"],
] as const;

export function CatalogSidebar({
  protocols,
  manufacturers,
  categoryCount,
  featureCounts,
  state,
  onToggleProtocol,
  onToggleManufacturer,
  onToggleFeature,
  onResetFilters,
  hiddenSections,
}: CatalogSidebarProps) {
  const [manufacturerSearch, setManufacturerSearch] = useState("");

  const visibleManufacturerOptions = manufacturers.filter((manufacturer) =>
    manufacturer.name.toLowerCase().includes(manufacturerSearch.trim().toLowerCase()),
  );

  function handleReset() {
    setManufacturerSearch("");
    onResetFilters();
  }

  return (
    <aside className="sticky top-[92px] flex flex-col gap-6 max-md:static">
      {!hiddenSections?.protocols && (
        <section className="flex flex-col gap-3.5">
        <h3 className="text-sm font-semibold text-primary">Protocol</h3>
        <div className="flex flex-wrap gap-1.5">
          {protocols.map((protocol) => {
            const styles = getProtocolStyle(protocol.slug);
            const active = state.protocols.includes(protocol.slug);
            const count = protocol.deviceCount ?? protocol.count ?? 0;

            return (
              <button
                key={protocol.slug}
                type="button"
                onClick={() => onToggleProtocol(protocol.slug)}
                data-filter-active={active}
                className={`${styles.badge} ${styles.text} inline-flex items-center gap-1 rounded-full border border-badge px-3 py-1 text-xs font-semibold transition-all hover:-translate-y-px hover:border-theme-hover data-[filter-active=true]:border-[var(--sp-blue-500)] data-[filter-active=true]:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]`}
              >
                <span>{protocol.name}</span>
                <span className="font-mono text-[10px] opacity-70">
                  {new Intl.NumberFormat("en-US").format(count)}
                </span>
              </button>
            );
          })}
        </div>
        </section>
      )}

      {!hiddenSections?.categories && (
        <section className="flex flex-col gap-3.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          Categories <span className="font-mono text-xs text-muted">{categoryCount}</span>
        </h3>
        <div className="rounded-2xl border border-theme bg-surface p-4 text-sm text-muted">
          Category exports are still empty in this snapshot, so the catalog is currently
          organized by protocol, manufacturer, and feature flags.
        </div>
        </section>
      )}

      {!hiddenSections?.features && (
        <section className="flex flex-col gap-3.5">
        <h3 className="text-sm font-semibold text-primary">Features</h3>
        <div className="flex flex-col gap-2">
          {featureOptions.map(([key, label]) => {
            const active = state.features[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleFeature(key)}
                data-filter-active={active}
                className="group flex items-center justify-between rounded-[10px] border border-transparent px-3 py-2.5 text-left text-sm text-secondary transition-all hover:bg-hover hover:text-primary data-[filter-active=true]:border-[var(--sp-blue-500)] data-[filter-active=true]:bg-[var(--sp-blue-bg)] data-[filter-active=true]:text-[var(--sp-blue-600)] data-[filter-active=true]:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              >
                <span>{label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted">
                    {featureCounts[key]}
                  </span>
                  <ToggleSwitch active={active} />
                </div>
              </button>
            );
          })}
        </div>
        </section>
      )}

      {!hiddenSections?.manufacturers && (
        <section className="flex flex-col gap-3.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          Manufacturers
          <span className="font-mono text-xs text-muted">{manufacturers.length}</span>
        </h3>
        <SearchInput
          id="manufacturer-filter-search"
          placeholder="Filter manufacturers..."
          compact
          value={manufacturerSearch}
          onChange={setManufacturerSearch}
        />
        <div className="flex max-h-[180px] flex-col overflow-y-auto scrollbar-thin">
          {visibleManufacturerOptions.map((manufacturer) => {
            const active = state.manufacturers.includes(manufacturer.slug);
            const count = manufacturer.deviceCount ?? manufacturer.count ?? 0;

            return (
              <button
                key={manufacturer.slug}
                type="button"
                onClick={() => onToggleManufacturer(manufacturer.slug)}
                data-filter-active={active}
                className="group flex items-center gap-2 rounded-[10px] border border-transparent px-2.5 py-2 text-left text-[13px] text-secondary transition-all hover:bg-hover hover:text-primary data-[filter-active=true]:border-[var(--sp-blue-500)] data-[filter-active=true]:bg-[var(--sp-blue-bg)] data-[filter-active=true]:text-[var(--sp-blue-600)] data-[filter-active=true]:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-[var(--sp-border-hover)] text-[10px] text-transparent group-data-[filter-active=true]:border-[var(--sp-blue-500)] group-data-[filter-active=true]:bg-surface group-data-[filter-active=true]:text-[var(--sp-blue-600)]">
                  ✓
                </span>
                <span>{manufacturer.name}</span>
                <span className="ml-auto font-mono text-[11px] text-muted">
                  {new Intl.NumberFormat("en-US").format(count)}
                </span>
              </button>
            );
          })}
        </div>
        </section>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="rounded-md border border-theme bg-transparent px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-theme-hover hover:text-secondary"
      >
        Clear all filters
      </button>
    </aside>
  );
}
