import type { SortMode, ViewMode } from "../../../lib/catalog/core";
import { SearchInput } from "./SearchInput";

interface CatalogToolbarProps {
  query: string;
  sort: SortMode;
  view: ViewMode;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSortChange: (value: SortMode) => void;
  onViewChange: (value: ViewMode) => void;
}

export function CatalogToolbar({
  query,
  sort,
  view,
  onSearchChange,
  onSearchFocus,
  onSortChange,
  onViewChange,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-4">
      <SearchInput
        id="catalog-search"
        placeholder="Search within results..."
        className="min-w-[220px] flex-1"
        value={query}
        onFocus={onSearchFocus}
        onChange={onSearchChange}
      />

      <div className="w-full max-w-[190px]">
        <label htmlFor="catalog-sort" className="sr-only">
          Sort catalog results
        </label>
        <select
          id="catalog-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortMode)}
          className="border-theme bg-surface text-primary w-full cursor-pointer rounded-[10px] border px-3.5 py-3 text-[13px] transition-all outline-none focus:border-[rgba(37,99,235,0.4)] focus:shadow-[var(--sp-shadow-search)]"
        >
          <option value="name-asc">Sort: Name A-Z</option>
          <option value="name-desc">Sort: Name Z-A</option>
          <option value="newest">Sort: Newest first</option>
          <option value="manufacturer">Sort: Manufacturer</option>
          <option value="compatibility">Sort: Most compatible</option>
        </select>
      </div>

      <div className="border-theme flex overflow-hidden rounded-[10px] border">
        {(["grid", "list"] as const).map((nextView) => (
          <button
            key={nextView}
            type="button"
            onClick={() => onViewChange(nextView)}
            data-filter-active={view === nextView}
            className="bg-surface text-muted hover:bg-hover hover:text-primary flex items-center justify-center px-3 py-3 transition-all data-[filter-active=true]:bg-[var(--sp-blue-bg)] data-[filter-active=true]:text-[var(--sp-blue-600)] data-[filter-active=true]:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
            title={nextView === "grid" ? "Grid view" : "List view"}
          >
            {nextView === "grid" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
