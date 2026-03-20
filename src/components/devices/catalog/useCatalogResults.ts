import { useDeferredValue } from "react";

import {
  getCatalogResults,
  type CatalogLockedFilters,
  type CatalogState,
} from "../../../lib/catalog/core";
import type { CatalogPayload } from "../../../lib/catalog/shared";

export function useCatalogResults(
  payload: CatalogPayload | null,
  state: CatalogState,
  lockedFilters: CatalogLockedFilters | undefined,
  pageSize: number,
) {
  const deferredQuery = useDeferredValue(state.q);

  return getCatalogResults(payload, state, deferredQuery, lockedFilters, pageSize);
}
