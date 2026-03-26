import { useState } from "react";

import type { CatalogState } from "../../../lib/catalog/core";
import type {
  CatalogCategoryFacetOption,
  CatalogFacetOption,
  CatalogFeatureKey,
} from "../../../lib/catalog/shared";
import { getProtocolStyle } from "../../../lib/ui";
import { SearchInput } from "./SearchInput";
import { ToggleSwitch } from "./ToggleSwitch";
import type {
  FeatureCounts,
  ManufacturerOption,
  ProtocolOption,
} from "./types";

interface FilterListSectionProps<T extends { name: string; count: number }> {
  title: string;
  options: T[];
  selected: string[];
  getValue: (option: T) => string;
  getMeta?: (option: T) => string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onToggle: (value: string) => void;
  emptyLabel: string;
}

interface CatalogSidebarProps {
  protocols: ProtocolOption[];
  manufacturers: ManufacturerOption[];
  categories: CatalogCategoryFacetOption[];
  integrations: CatalogFacetOption[];
  platforms: CatalogFacetOption[];
  hubs: CatalogFacetOption[];
  featureCounts: FeatureCounts;
  state: CatalogState;
  onToggleProtocol: (value: string) => void;
  onToggleManufacturer: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onToggleIntegration: (value: string) => void;
  onTogglePlatform: (value: string) => void;
  onToggleHub: (value: string) => void;
  onToggleFeature: (key: CatalogFeatureKey) => void;
  onResetFilters: () => void;
  hiddenSections?: {
    protocols?: boolean;
    manufacturers?: boolean;
    categories?: boolean;
    integrations?: boolean;
    platforms?: boolean;
    hubs?: boolean;
    features?: boolean;
  };
}

const featureOptions = [
  ["localControl", "Local control"],
  ["matterCertified", "Matter certified"],
  ["noCloud", "No cloud required"],
  ["noHub", "No hub required"],
] as const;

function FilterListSection<T extends { name: string; count: number }>({
  title,
  options,
  selected,
  getValue,
  getMeta,
  query,
  onQueryChange,
  onToggle,
  emptyLabel,
}: FilterListSectionProps<T>) {
  const visibleOptions = options.filter((option) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return option.name.toLowerCase().includes(normalizedQuery);
  });

  return (
    <section className="flex flex-col gap-3.5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
        {title}
        <span className="font-mono text-xs text-muted">{options.length}</span>
      </h3>
      <SearchInput
        id={`${title.toLowerCase().replace(/\s+/g, "-")}-filter-search`}
        placeholder={`Filter ${title.toLowerCase()}...`}
        compact
        value={query}
        onChange={onQueryChange}
      />
      <div className="flex max-h-[180px] flex-col overflow-y-auto scrollbar-thin">
        {visibleOptions.length > 0 ? (
          visibleOptions.map((option) => {
            const value = getValue(option);
            const active = selected.includes(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                data-filter-active={active}
                className="group flex items-start gap-2 rounded-[10px] border border-transparent px-2.5 py-2 text-left text-[13px] text-secondary transition-all hover:bg-hover hover:text-primary data-[filter-active=true]:border-[var(--sp-blue-500)] data-[filter-active=true]:bg-[var(--sp-blue-bg)] data-[filter-active=true]:text-[var(--sp-blue-600)] data-[filter-active=true]:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-[var(--sp-border-hover)] text-[10px] text-transparent group-data-[filter-active=true]:border-[var(--sp-blue-500)] group-data-[filter-active=true]:bg-surface group-data-[filter-active=true]:text-[var(--sp-blue-600)]">
                  ✓
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block">{option.name}</span>
                  {getMeta?.(option) && (
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {getMeta(option)}
                    </span>
                  )}
                </span>
                <span className="ml-auto font-mono text-[11px] text-muted">
                  {new Intl.NumberFormat("en-US").format(option.count)}
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-theme bg-surface p-4 text-sm text-muted">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

export function CatalogSidebar({
  protocols,
  manufacturers,
  categories,
  integrations,
  platforms,
  hubs,
  featureCounts,
  state,
  onToggleProtocol,
  onToggleManufacturer,
  onToggleCategory,
  onToggleIntegration,
  onTogglePlatform,
  onToggleHub,
  onToggleFeature,
  onResetFilters,
  hiddenSections,
}: CatalogSidebarProps) {
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [integrationSearch, setIntegrationSearch] = useState("");
  const [platformSearch, setPlatformSearch] = useState("");
  const [hubSearch, setHubSearch] = useState("");

  function handleReset() {
    setManufacturerSearch("");
    setCategorySearch("");
    setIntegrationSearch("");
    setPlatformSearch("");
    setHubSearch("");
    onResetFilters();
  }

  return (
    <aside className="sticky top-[92px] flex flex-col gap-6 max-md:static">
      {!hiddenSections?.protocols && (
        <section className="flex flex-col gap-3.5">
          <h3 className="text-sm font-semibold text-primary">Protocols</h3>
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
        <FilterListSection
          title="Categories"
          options={categories}
          selected={state.categories}
          getValue={(option) => option.path}
          getMeta={(option) => option.path}
          query={categorySearch}
          onQueryChange={setCategorySearch}
          onToggle={onToggleCategory}
          emptyLabel="No category filters are available yet."
        />
      )}

      {(!hiddenSections?.integrations ||
        !hiddenSections?.platforms ||
        !hiddenSections?.hubs) && (
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Works With</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Filter by integrations, platforms, or commercial hubs.
            </p>
          </div>

          {!hiddenSections?.integrations && (
            <FilterListSection
              title="Integrations"
              options={integrations}
              selected={state.integrations}
              getValue={(option) => option.slug}
              query={integrationSearch}
              onQueryChange={setIntegrationSearch}
              onToggle={onToggleIntegration}
              emptyLabel="No integration filters are available yet."
            />
          )}

          {!hiddenSections?.platforms && (
            <FilterListSection
              title="Platforms"
              options={platforms}
              selected={state.platforms}
              getValue={(option) => option.slug}
              query={platformSearch}
              onQueryChange={setPlatformSearch}
              onToggle={onTogglePlatform}
              emptyLabel="No platform filters are available yet."
            />
          )}

          {!hiddenSections?.hubs && (
            <FilterListSection
              title="Hubs"
              options={hubs}
              selected={state.hubs}
              getValue={(option) => option.slug}
              query={hubSearch}
              onQueryChange={setHubSearch}
              onToggle={onToggleHub}
              emptyLabel="No commercial hub filters are available yet."
            />
          )}
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
        <FilterListSection
          title="Manufacturers"
          options={manufacturers.map((manufacturer) => ({
            name: manufacturer.name,
            count: manufacturer.deviceCount ?? manufacturer.count ?? 0,
            slug: manufacturer.slug,
          }))}
          selected={state.manufacturers}
          getValue={(option) => option.slug}
          query={manufacturerSearch}
          onQueryChange={setManufacturerSearch}
          onToggle={onToggleManufacturer}
          emptyLabel="No manufacturer filters are available yet."
        />
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
