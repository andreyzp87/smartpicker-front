import { startTransition, useEffect, useState } from "react";

import {
  createDefaultCatalogState,
  parseCatalogState,
  serializeCatalogState,
  toggleStringValue,
  type ActiveChip,
  type CatalogState,
  type SortMode,
  type ViewMode,
} from "../../../lib/catalog/core";
import type { CatalogFeatureKey } from "../../../lib/catalog/shared";

export function useCatalogState() {
  const [state, setState] = useState<CatalogState>(createDefaultCatalogState);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setState(parseCatalogState(window.location.search));
      setUrlReady(true);
    });
  }, []);

  function syncUrl(safePage = state.page) {
    if (!urlReady) {
      return;
    }

    const query = serializeCatalogState(state, safePage);
    const nextUrl = query ? `?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }

  function setSearch(value: string) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        q: value,
        page: 1,
      }));
    });
  }

  function setSort(value: SortMode) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        sort: value,
      }));
    });
  }

  function setView(value: ViewMode) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        view: value,
      }));
    });
  }

  function setPage(value: number) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        page: value,
      }));
    });
  }

  function toggleProtocol(value: string) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        protocols: toggleStringValue(current.protocols, value),
        page: 1,
      }));
    });
  }

  function toggleManufacturer(value: string) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        manufacturers: toggleStringValue(current.manufacturers, value),
        page: 1,
      }));
    });
  }

  function toggleFeature(key: CatalogFeatureKey) {
    startTransition(() => {
      setState((current) => ({
        ...current,
        features: {
          ...current.features,
          [key]: !current.features[key],
        },
        page: 1,
      }));
    });
  }

  function clearChip(chip: ActiveChip) {
    startTransition(() => {
      setState((current) => {
        if (chip.kind === "search") {
          return {
            ...current,
            q: "",
            page: 1,
          };
        }

        if (chip.kind === "protocol") {
          return {
            ...current,
            protocols: current.protocols.filter((value) => value !== chip.value),
            page: 1,
          };
        }

        if (chip.kind === "manufacturer") {
          return {
            ...current,
            manufacturers: current.manufacturers.filter((value) => value !== chip.value),
            page: 1,
          };
        }

        if (chip.kind === "category") {
          return {
            ...current,
            categories: current.categories.filter((value) => value !== chip.value),
            page: 1,
          };
        }

        if (chip.kind === "hub") {
          return {
            ...current,
            hubs: current.hubs.filter((value) => value !== chip.value),
            page: 1,
          };
        }

        return {
          ...current,
          features: {
            ...current.features,
            [chip.value]: false,
          },
          page: 1,
        };
      });
    });
  }

  function resetFilters() {
    startTransition(() => {
      setState(createDefaultCatalogState());
    });
  }

  return {
    state,
    urlReady,
    syncUrl,
    actions: {
      setSearch,
      setSort,
      setView,
      setPage,
      toggleProtocol,
      toggleManufacturer,
      toggleFeature,
      clearChip,
      resetFilters,
    },
  };
}
