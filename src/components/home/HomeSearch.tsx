import { useDeferredValue, useEffect, useId, useState } from "react";

import {
  getSearchEntityTypeLabel,
  getSearchPreviewResults,
} from "../../lib/search/core";
import type { SearchEntityType, SearchEntry } from "../../lib/search/shared";
import {
  formatProtocolLabel,
  getCompatibilityStatusStyle,
  getProtocolStyle,
  joinClasses,
} from "../../lib/ui";
import { useSearchPayload } from "../search/useSearchPayload";

interface Props {
  searchChips: string[];
  searchEndpoint: string;
  catalogHref: string;
  searchEntityTypes?: SearchEntityType[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const entityTypeOptions: SearchEntityType[] = [
  "device",
  "integration",
  "platform",
  "hub",
  "manufacturer",
];

function getInitials(value: string) {
  return value
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getEntryHref(entry: SearchEntry) {
  if (entry.entityType === "device") {
    return `/devices/${entry.slug}`;
  }

  if (entry.entityType === "hub") {
    return `/hubs/${entry.slug}`;
  }

  if (entry.entityType === "integration") {
    return `/integrations/${entry.slug}`;
  }

  if (entry.entityType === "platform") {
    return `/platforms/${entry.slug}`;
  }

  return `/manufacturers/${entry.slug}`;
}

function renderSearchResult(entry: SearchEntry) {
  if (entry.entityType === "device") {
    const protocolStyle = getProtocolStyle(entry.primaryProtocol);
    const compatibilityStyle = getCompatibilityStatusStyle(
      entry.compatibilityStatus,
      "Reported",
    );

    return (
      <a
        key={`${entry.entityType}:${entry.slug}`}
        href={getEntryHref(entry)}
        className="card-hover border-theme bg-elevated text-primary flex items-start gap-3 rounded-2xl border px-4 py-3"
      >
        <div className="bg-surface text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
          {protocolStyle.shortLabel}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{entry.name}</div>
              <div className="text-muted truncate text-[13px]">
                {entry.manufacturerName}
                {entry.model ? ` · ${entry.model}` : ""}
              </div>
            </div>
            <span
              className={joinClasses(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                protocolStyle.badge,
                protocolStyle.text,
              )}
            >
              {formatProtocolLabel(entry.primaryProtocol)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={joinClasses(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                compatibilityStyle.className,
              )}
            >
              {compatibilityStyle.label}
            </span>
            <span className="border-badge bg-badge text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {entry.compatibleIntegrationCount} integration
              {entry.compatibleIntegrationCount === 1 ? "" : "s"}
            </span>
            <span className="border-badge bg-badge text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {entry.compatiblePlatformCount} platform
              {entry.compatiblePlatformCount === 1 ? "" : "s"}
            </span>
            <span className="border-badge bg-badge text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {entry.compatibleHubCount} hub
              {entry.compatibleHubCount === 1 ? "" : "s"}
            </span>
            {entry.requiresHub === false && (
              <span className="border-green bg-green-subtle text-green rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                No hub required
              </span>
            )}
            {entry.localControl === true && (
              <span className="border-green bg-green-subtle text-green rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                Local control
              </span>
            )}
          </div>

          <div className="text-muted mt-2 text-[11px]">
            Updated {dateFormatter.format(new Date(entry.updatedAt))}
          </div>
        </div>
      </a>
    );
  }

  if (entry.entityType === "hub") {
    return (
      <a
        key={`${entry.entityType}:${entry.slug}`}
        href={getEntryHref(entry)}
        className="card-hover border-theme bg-elevated text-primary flex items-start gap-3 rounded-2xl border px-4 py-3"
      >
        <div className="bg-surface text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
          HB
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{entry.name}</div>
              <div className="text-muted truncate text-[13px]">
                {entry.manufacturerName ?? "Independent"} ·{" "}
                {entry.compatibleDeviceCount} compatible device
                {entry.compatibleDeviceCount === 1 ? "" : "s"}
              </div>
            </div>
            <span className="bg-blue-subtle text-blue inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
              Hub
            </span>
          </div>
        </div>
      </a>
    );
  }

  if (entry.entityType === "integration") {
    const protocolStyle = getProtocolStyle(entry.primaryProtocol);

    return (
      <a
        key={`${entry.entityType}:${entry.slug}`}
        href={getEntryHref(entry)}
        className="card-hover border-theme bg-elevated text-primary flex items-start gap-3 rounded-2xl border px-4 py-3"
      >
        <div className="bg-surface text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
          {protocolStyle.shortLabel}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{entry.name}</div>
              <div className="text-muted truncate text-[13px]">
                {entry.manufacturerName ?? "Independent"} ·{" "}
                {entry.compatibleDeviceCount} compatible device
                {entry.compatibleDeviceCount === 1 ? "" : "s"}
              </div>
            </div>
            <span className="bg-blue-subtle text-blue inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
              Integration
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={joinClasses(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                protocolStyle.badge,
                protocolStyle.text,
              )}
            >
              {formatProtocolLabel(entry.primaryProtocol)}
            </span>
            <span className="border-theme bg-badge text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {entry.platformCount} platform
              {entry.platformCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </a>
    );
  }

  if (entry.entityType === "platform") {
    return (
      <a
        key={`${entry.entityType}:${entry.slug}`}
        href={getEntryHref(entry)}
        className="card-hover border-theme bg-elevated text-primary flex items-start gap-3 rounded-2xl border px-4 py-3"
      >
        <div className="bg-surface text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
          PF
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{entry.name}</div>
              <div className="text-muted truncate text-[13px]">
                {entry.manufacturerName ?? "Independent"} ·{" "}
                {entry.compatibleDeviceCount} supported device
                {entry.compatibleDeviceCount === 1 ? "" : "s"}
              </div>
            </div>
            <span className="bg-blue-subtle text-blue inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
              Platform
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="border-theme bg-badge text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
              {entry.integrationCount} integration
              {entry.integrationCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      key={`${entry.entityType}:${entry.slug}`}
      href={getEntryHref(entry)}
      className="card-hover border-theme bg-elevated text-primary flex items-start gap-3 rounded-2xl border px-4 py-3"
    >
      <div className="bg-surface text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
        {getInitials(entry.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{entry.name}</div>
            <div className="text-muted truncate text-[13px]">
              {entry.deviceCount} device{entry.deviceCount === 1 ? "" : "s"} in
              the catalog
            </div>
          </div>
          <span className="border-theme bg-badge text-secondary inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
            Manufacturer
          </span>
        </div>
      </div>
    </a>
  );
}

export default function HomeSearch({
  searchChips,
  searchEndpoint,
  catalogHref,
  searchEntityTypes = entityTypeOptions,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | SearchEntityType>("all");
  const deferredQuery = useDeferredValue(query);
  const { payload, isFetching, error, ensureLoaded } =
    useSearchPayload(searchEndpoint);
  const resultsPanelId = useId();
  const normalizedQuery = deferredQuery.trim();
  const enabledEntityTypes =
    activeType === "all" ? searchEntityTypes : [activeType];
  const searchResults = getSearchPreviewResults(
    payload,
    normalizedQuery,
    8,
    enabledEntityTypes,
  );
  const hasQuery = normalizedQuery.length > 0;
  const browseHref = `${catalogHref}?q=${encodeURIComponent(query.trim())}`;
  const supportsDeviceSearch = enabledEntityTypes.includes("device");
  const supportsMultipleTypes = searchEntityTypes.length > 1;
  const placeholder =
    searchEntityTypes.includes("integration") ||
    searchEntityTypes.includes("platform") ||
    searchEntityTypes.includes("hub") ||
    searchEntityTypes.includes("manufacturer")
      ? "Search devices, integrations, platforms, hubs, manufacturers..."
      : "Search devices, manufacturers, models...";
  const noResultsLabel =
    activeType === "all"
      ? "results"
      : getSearchEntityTypeLabel(activeType).toLowerCase();

  useEffect(() => {
    if (!hasQuery) {
      return;
    }

    void ensureLoaded().catch(() => {
      return;
    });
  }, [ensureLoaded, hasQuery]);

  return (
    <div className="mx-auto max-w-[620px]">
      <form action={catalogHref} method="get">
        <div className="shadow-card focus-within:shadow-search border-theme-hover bg-input relative flex items-center rounded-[14px] border p-1 transition-all focus-within:border-[rgba(37,99,235,0.4)] max-md:flex-col max-md:items-stretch max-md:gap-1.5 max-md:p-2">
          <svg
            className="text-muted pointer-events-none absolute top-1/2 left-[18px] -translate-y-1/2 max-md:top-[22px] max-md:translate-y-0"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            type="search"
            name="q"
            value={query}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            className="text-primary placeholder:text-muted flex-1 border-none bg-transparent py-3.5 pr-4 pl-12 text-base font-[var(--font-sans)] outline-none max-md:w-full"
            onFocus={() => {
              void ensureLoaded().catch(() => {
                return;
              });
            }}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          <button
            type="submit"
            className="shadow-blue bg-blue-gradient hover:shadow-blue-lg rounded-[10px] px-6 py-2.5 text-[15px] font-semibold whitespace-nowrap text-white transition-all hover:brightness-110 max-md:w-full"
          >
            Search
          </button>
        </div>
      </form>

      {supportsMultipleTypes && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className={joinClasses(
              "rounded-full border px-3 py-1 text-[13px] font-medium transition-all",
              activeType === "all"
                ? "border-blue bg-blue-subtle text-blue"
                : "border-theme bg-badge text-muted hover:border-theme-hover hover:bg-hover hover:text-secondary",
            )}
            onClick={() => {
              setActiveType("all");
            }}
          >
            All
          </button>
          {searchEntityTypes.map((entityType) => (
            <button
              key={entityType}
              type="button"
              className={joinClasses(
                "rounded-full border px-3 py-1 text-[13px] font-medium transition-all",
                activeType === entityType
                  ? "border-blue bg-blue-subtle text-blue"
                  : "border-theme bg-badge text-muted hover:border-theme-hover hover:bg-hover hover:text-secondary",
              )}
              onClick={() => {
                setActiveType(entityType);
              }}
            >
              {getSearchEntityTypeLabel(entityType)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {searchChips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="border-theme bg-badge text-muted hover:border-theme-hover hover:bg-hover hover:text-secondary rounded-full border px-3 py-1 text-[13px] transition-all"
            onClick={() => {
              setQuery(chip);
              void ensureLoaded().catch(() => {
                return;
              });
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {hasQuery && (
        <div
          id={resultsPanelId}
          className="border-theme bg-surface/95 shadow-card mt-4 rounded-[22px] border p-3 text-left backdrop-blur"
        >
          {!payload && isFetching && (
            <div className="border-theme bg-elevated text-muted rounded-2xl border px-4 py-3 text-sm">
              Loading search suggestions...
            </div>
          )}

          {error && (
            <div className="border-red bg-red-subtle text-red rounded-2xl border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {payload && searchResults.totalCount === 0 && (
            <div className="border-theme bg-elevated rounded-2xl border px-4 py-4">
              <p className="text-primary text-sm">
                No {noResultsLabel} matched &quot;{normalizedQuery}&quot;.
              </p>
              <p className="text-muted mt-1 text-sm">
                Try a brand, model number, protocol, integration, or platform
                instead.
              </p>
              {supportsDeviceSearch && (
                <a
                  href={browseHref}
                  className="text-blue mt-3 inline-flex text-sm font-semibold transition-all hover:opacity-80"
                >
                  Search the device catalog
                </a>
              )}
            </div>
          )}

          {payload && searchResults.totalCount > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 px-1 pb-2">
                <div className="text-secondary text-sm">
                  {searchResults.totalCount === 1
                    ? "1 matching result"
                    : `${searchResults.totalCount} matching results`}
                </div>
                {supportsDeviceSearch && (
                  <a
                    href={browseHref}
                    className="text-blue text-sm font-semibold transition-all hover:opacity-80"
                  >
                    See all matching devices
                  </a>
                )}
              </div>

              {activeType === "all" && (
                <div className="text-muted mb-3 flex flex-wrap gap-2 px-1 text-[12px]">
                  {searchEntityTypes
                    .filter(
                      (entityType) =>
                        searchResults.countsByType[entityType] > 0,
                    )
                    .map((entityType) => (
                      <span
                        key={entityType}
                        className="border-theme bg-badge rounded-full border px-2.5 py-1"
                      >
                        {searchResults.countsByType[entityType]}{" "}
                        {getSearchEntityTypeLabel(entityType)}
                      </span>
                    ))}
                </div>
              )}

              <div className="grid gap-2">
                {searchResults.matches.map((entry) =>
                  renderSearchResult(entry),
                )}
              </div>

              {searchResults.totalCount > searchResults.matches.length && (
                <div className="text-muted px-1 pt-3 text-sm">
                  Showing {searchResults.matches.length} of{" "}
                  {searchResults.totalCount} matches.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
