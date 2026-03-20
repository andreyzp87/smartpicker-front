import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { SearchPayload } from "../../lib/search/shared";

export function useSearchPayload(endpoint: string) {
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingPromiseRef = useRef<Promise<SearchPayload> | null>(null);

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
          throw new Error(`Search request failed with ${response.status}.`);
        }

        const nextPayload = (await response.json()) as SearchPayload;

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
          setError(
            "Search data could not be loaded. You can still browse the catalog.",
          );
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
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    payload,
    isFetching,
    error,
    ensureLoaded,
  };
}
