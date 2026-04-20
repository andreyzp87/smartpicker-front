import { useEffect } from "react";

import {
  createDefaultCatalogState,
  isDefaultCatalogState,
  type ActiveChip,
} from "../../lib/catalog/core";
import {
  hasCatalogSelectionFilters,
  getSearchCatalogResults,
  isSearchOnlyCatalogState,
} from "../../lib/search/core";
import { useSearchPayload } from "../search/useSearchPayload";
import { CatalogActiveChips } from "./catalog/CatalogActiveChips";
import { CatalogPagination } from "./catalog/CatalogPagination";
import { CatalogResults } from "./catalog/CatalogResults";
import { CatalogSidebar } from "./catalog/CatalogSidebar";
import { CatalogToolbar } from "./catalog/CatalogToolbar";
import type { DeviceCatalogBrowserProps } from "./catalog/types";
import { useCatalogPayload } from "./catalog/useCatalogPayload";
import { useCatalogResults } from "./catalog/useCatalogResults";
import { useCatalogState } from "./catalog/useCatalogState";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

const defaultCatalogState = createDefaultCatalogState();

function buildActiveChips(
  payload: ReturnType<typeof useCatalogPayload>["payload"],
  state: ReturnType<typeof useCatalogState>["state"],
  initialFacets: DeviceCatalogBrowserProps["initialFacets"],
) {
  const protocolNames = Object.fromEntries(
    (payload?.facets.protocols ?? initialFacets.protocols).map((protocol) => [
      protocol.slug,
      protocol.name,
    ]),
  );
  const manufacturerNames = Object.fromEntries(
    (payload?.facets.manufacturers ?? initialFacets.manufacturers).map(
      (manufacturer) => [manufacturer.slug, manufacturer.name],
    ),
  );
  const categoryNames = Object.fromEntries(
    (payload?.facets.categories ?? initialFacets.categories).map((category) => [
      category.path,
      category.name,
    ]),
  );
  const integrationNames = Object.fromEntries(
    (payload?.facets.integrations ?? initialFacets.integrations).map(
      (integration) => [integration.slug, integration.name],
    ),
  );
  const platformNames = Object.fromEntries(
    (payload?.facets.platforms ?? initialFacets.platforms).map((platform) => [
      platform.slug,
      platform.name,
    ]),
  );
  const hubNames = Object.fromEntries(
    (payload?.facets.hubs ?? initialFacets.hubs).map((hub) => [
      hub.slug,
      hub.name,
    ]),
  );

  const chips: ActiveChip[] = [
    ...state.protocols.map((value) => ({
      kind: "protocol" as const,
      value,
      label: protocolNames[value] ?? value,
    })),
    ...state.manufacturers.map((value) => ({
      kind: "manufacturer" as const,
      value,
      label: manufacturerNames[value] ?? value,
    })),
    ...state.categories.map((value) => ({
      kind: "category" as const,
      value,
      label: categoryNames[value] ?? value,
    })),
    ...state.integrations.map((value) => ({
      kind: "integration" as const,
      value,
      label: integrationNames[value] ?? value,
    })),
    ...state.platforms.map((value) => ({
      kind: "platform" as const,
      value,
      label: platformNames[value] ?? value,
    })),
    ...state.hubs.map((value) => ({
      kind: "hub" as const,
      value,
      label: hubNames[value] ?? value,
    })),
    ...(
      [
        ["localControl", "Local control"],
        ["matterCertified", "Matter certified"],
        ["noCloud", "No cloud required"],
        ["noHub", "No hub required"],
      ] as const
    )
      .filter(([key]) => state.features[key])
      .map(([key, label]) => ({
        kind: "feature" as const,
        value: key,
        label,
      })),
  ];

  if (state.q) {
    chips.unshift({
      kind: "search",
      value: "q",
      label: `Search: ${state.q}`,
    });
  }

  return chips;
}

export default function DeviceCatalogBrowser({
  initialCatalog,
  initialFacets,
  endpoints,
  uiConfig,
}: DeviceCatalogBrowserProps) {
  const catalogEndpoint = endpoints?.catalog ?? "/catalog.json";
  const searchEndpoint = endpoints?.search ?? "/search.json";
  const autoloadMode = endpoints?.autoloadMode ?? "idle";
  const pageSize = uiConfig?.pageSize ?? 20;
  const hiddenSections = uiConfig?.hiddenSections;
  const lockedFilters = uiConfig?.lockedFilters;
  const {
    protocols,
    manufacturers,
    categories,
    integrations,
    platforms,
    hubs,
    featureCounts,
  } = initialFacets;
  const {
    payload: catalogPayload,
    isFetching: isCatalogFetching,
    error: catalogError,
    ensureLoaded: ensureCatalogLoaded,
  } = useCatalogPayload(catalogEndpoint, autoloadMode);
  const {
    payload: searchPayload,
    isFetching: isSearchFetching,
    error: searchError,
    ensureLoaded: ensureSearchLoaded,
  } = useSearchPayload(searchEndpoint);
  const { state, syncUrl, actions } = useCatalogState();
  const catalogResults = useCatalogResults(
    catalogPayload,
    state,
    lockedFilters,
    pageSize,
  );
  const searchResults = getSearchCatalogResults(
    searchPayload,
    state,
    lockedFilters,
    pageSize,
  );
  const searchOnlyState = isSearchOnlyCatalogState(state);
  const interactiveDataRequested =
    catalogPayload != null || searchOnlyState || !isDefaultCatalogState(state);
  const activeResults = catalogPayload
    ? catalogResults
    : searchOnlyState && searchPayload
      ? searchResults
      : null;
  const activeFetching =
    catalogPayload == null &&
    (searchOnlyState ? isSearchFetching : isCatalogFetching);
  const activeError =
    catalogPayload == null
      ? searchOnlyState
        ? searchError
        : catalogError
      : null;
  const renderedProducts = activeResults
    ? activeResults.pagedProducts
    : initialCatalog.products;
  const renderedTotalCount = activeResults
    ? activeResults.filteredProducts.length
    : initialCatalog.totalCount;
  const renderedTotalPages = activeResults
    ? activeResults.totalPages
    : initialCatalog.totalPages;
  const renderedPage = activeResults ? activeResults.safePage : initialCatalog.page;
  const renderedFrom = activeResults ? activeResults.from : initialCatalog.from;
  const renderedTo = activeResults ? activeResults.to : initialCatalog.to;
  const hasServerRenderedFallback = initialCatalog.products.length > 0;
  const blockingLoad =
    activeResults == null && !hasServerRenderedFallback && activeFetching;
  const blockingError =
    activeResults == null && !hasServerRenderedFallback ? activeError : null;

  useEffect(() => {
    const safePage = activeResults?.safePage;

    if (safePage && safePage !== state.page) {
      actions.setPage(safePage);
    }
  }, [actions, activeResults?.safePage, state.page]);

  useEffect(() => {
    syncUrl(activeResults?.safePage ?? initialCatalog.page);
  }, [activeResults?.safePage, initialCatalog.page, state, syncUrl]);

  useEffect(() => {
    if (catalogPayload) {
      return;
    }

    if (searchOnlyState) {
      if (searchPayload) {
        return;
      }

      void ensureSearchLoaded().catch(() => {
        return;
      });
      return;
    }

    if (!isDefaultCatalogState(state)) {
      void ensureCatalogLoaded().catch(() => {
        return;
      });
    }
  }, [
    catalogPayload,
    ensureCatalogLoaded,
    ensureSearchLoaded,
    searchOnlyState,
    searchPayload,
    state,
  ]);

  const activeChips = buildActiveChips(catalogPayload, state, initialFacets);

  function loadSearchData() {
    if (catalogPayload || searchPayload) {
      return;
    }

    void ensureSearchLoaded().catch(() => {
      return;
    });
  }

  function loadCatalogData() {
    if (catalogPayload) {
      return;
    }

    void ensureCatalogLoaded().catch(() => {
      return;
    });
  }

  function handleSearchFocus() {
    if (hasCatalogSelectionFilters(state)) {
      loadCatalogData();
      return;
    }

    loadSearchData();
  }

  function handleSearchChange(value: string) {
    const nextSearchOnlyState =
      value.trim().length > 0 && !hasCatalogSelectionFilters(state);
    const nextStateNeedsCatalog =
      hasCatalogSelectionFilters(state) ||
      state.sort !== defaultCatalogState.sort ||
      state.view !== defaultCatalogState.view;

    if (nextSearchOnlyState) {
      loadSearchData();
    } else if (nextStateNeedsCatalog) {
      loadCatalogData();
    }

    actions.setSearch(value);
  }

  function handleSortChange(value: Parameters<typeof actions.setSort>[0]) {
    if (searchOnlyState) {
      loadSearchData();
    } else {
      loadCatalogData();
    }

    actions.setSort(value);
  }

  function handlePageChange(value: number) {
    if (searchOnlyState) {
      loadSearchData();
    } else {
      loadCatalogData();
    }

    actions.setPage(value);
  }

  function handleRemoveChip(chip: ActiveChip) {
    if (chip.kind !== "search") {
      loadCatalogData();
    }

    actions.clearChip(chip);
  }

  return (
    <div className="grid grid-cols-[260px_1fr] items-start gap-7 py-7 pb-20 max-md:grid-cols-1">
      <CatalogSidebar
        protocols={protocols}
        manufacturers={manufacturers}
        categories={categories}
        integrations={integrations}
        platforms={platforms}
        hubs={hubs}
        featureCounts={featureCounts}
        state={state}
        onToggleProtocol={(value) => {
          loadCatalogData();
          actions.toggleProtocol(value);
        }}
        onToggleManufacturer={(value) => {
          loadCatalogData();
          actions.toggleManufacturer(value);
        }}
        onToggleCategory={(value) => {
          loadCatalogData();
          actions.toggleCategory(value);
        }}
        onToggleIntegration={(value) => {
          loadCatalogData();
          actions.toggleIntegration(value);
        }}
        onTogglePlatform={(value) => {
          loadCatalogData();
          actions.togglePlatform(value);
        }}
        onToggleHub={(value) => {
          loadCatalogData();
          actions.toggleHub(value);
        }}
        onToggleFeature={(value) => {
          loadCatalogData();
          actions.toggleFeature(value);
        }}
        onResetFilters={actions.resetFilters}
        hiddenSections={hiddenSections}
      />

      <section className="min-w-0">
        <CatalogToolbar
          query={state.q}
          sort={state.sort}
          view={state.view}
          onSearchChange={handleSearchChange}
          onSearchFocus={handleSearchFocus}
          onSortChange={handleSortChange}
          onViewChange={actions.setView}
        />

        <CatalogActiveChips chips={activeChips} onRemove={handleRemoveChip} />

        {!catalogPayload && interactiveDataRequested && activeFetching && (
          <div className="pb-4">
            <div className="border-theme bg-surface text-muted rounded-2xl border px-5 py-4 text-sm">
              {searchOnlyState
                ? "Loading search index..."
                : "Loading full catalog for interactive filtering..."}
            </div>
          </div>
        )}

        {!catalogPayload && interactiveDataRequested && activeError && (
          <div className="pb-4">
            <div className="border-red bg-red-subtle text-red rounded-2xl border px-5 py-4 text-sm">
              {searchOnlyState
                ? "Search results could not be loaded yet. The preloaded device list is still available."
                : "Interactive filtering could not be loaded yet. The preloaded device list is still available."}
            </div>
          </div>
        )}

        <CatalogResults
          loading={blockingLoad}
          error={blockingError}
          view={state.view}
          products={renderedProducts}
          onReset={actions.resetFilters}
        />

        <div className="border-theme mt-5 flex items-center justify-between gap-3 border-t py-6 max-sm:flex-col max-sm:items-start">
          <div className="text-muted text-[13px]">
            {blockingLoad && "Loading catalog..."}
            {!blockingLoad &&
              !blockingError &&
              (renderedTotalCount === 0 ? (
                <>
                  Showing <strong>0</strong> results
                </>
              ) : (
                <>
                  Showing{" "}
                  <strong>
                    {formatCount(renderedFrom)}-{formatCount(renderedTo)}
                  </strong>{" "}
                  of <strong>{formatCount(renderedTotalCount)}</strong> results
                </>
              ))}
            {!blockingLoad && blockingError && "Catalog failed to load."}
          </div>

          {!blockingLoad && !blockingError && renderedTotalCount > 0 && (
            <CatalogPagination
              currentPage={renderedPage}
              totalPages={renderedTotalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
    </div>
  );
}
