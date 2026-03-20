import { startTransition, useCallback, useEffect, useRef, useState } from "react";

import type { CatalogPayload } from "../../../lib/catalog/shared";

export function useCatalogPayload(
  endpoint: string,
  autoloadMode: "idle" | "scroll" | "none" = "idle",
) {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingPromiseRef = useRef<Promise<CatalogPayload> | null>(null);
  const idleHandleRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

  const ensureLoaded = useCallback(() => {
    if (payload) {
      return Promise.resolve(payload);
    }

    if (pendingPromiseRef.current) {
      return pendingPromiseRef.current;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    startTransition(() => {
      setIsFetching(true);
      setError(null);
    });

    const request = fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Catalog request failed with ${response.status}.`);
        }

        const nextPayload = (await response.json()) as CatalogPayload;

        startTransition(() => {
          setPayload(nextPayload);
          setIsFetching(false);
        });

        return nextPayload;
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) {
          throw fetchError;
        }

        console.error(fetchError);

        startTransition(() => {
          setError("Catalog data could not be loaded. Refresh the page and try again.");
          setIsFetching(false);
        });

        throw fetchError;
      })
      .finally(() => {
        if (pendingPromiseRef.current === request) {
          pendingPromiseRef.current = null;
        }
      });

    pendingPromiseRef.current = request;
    return request;
  }, [endpoint, payload]);

  useEffect(() => {
    if (autoloadMode === "none") {
      return () => {
        abortControllerRef.current?.abort();
      };
    }

    const scheduleIdleLoad = () => {
      void ensureLoaded().catch(() => {
        return;
      });
    };

    if (autoloadMode === "scroll") {
      const handleFirstScroll = () => {
        void ensureLoaded().catch(() => {
          return;
        });
      };

      window.addEventListener("scroll", handleFirstScroll, {
        once: true,
        passive: true,
      });

      return () => {
        window.removeEventListener("scroll", handleFirstScroll);
        abortControllerRef.current?.abort();
      };
    }

    if ("requestIdleCallback" in window) {
      idleHandleRef.current = window.requestIdleCallback(scheduleIdleLoad, {
        timeout: 1500,
      });
    } else {
      idleHandleRef.current = setTimeout(scheduleIdleLoad, 250);
    }

    return () => {
      if (
        typeof idleHandleRef.current === "number" &&
        "cancelIdleCallback" in window &&
        "requestIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleHandleRef.current);
      } else if (idleHandleRef.current != null) {
        clearTimeout(idleHandleRef.current);
      }

      abortControllerRef.current?.abort();
    };
  }, [autoloadMode, ensureLoaded]);

  return {
    payload,
    isFetching,
    error,
    ensureLoaded,
  };
}
