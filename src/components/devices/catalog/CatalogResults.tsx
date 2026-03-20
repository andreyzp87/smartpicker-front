import type { CatalogProduct } from "../../../lib/catalog/shared";
import {
  formatBooleanFact,
  formatProtocolLabel,
  getCompatibilityStatusStyle,
  getProtocolStyle,
  joinClasses,
} from "../../../lib/ui";
import type { ViewMode } from "../../../lib/catalog/core";

function CatalogGridCard({ product }: { product: CatalogProduct }) {
  const style = getProtocolStyle(product.primaryProtocol);
  const compatibility = getCompatibilityStatusStyle(
    product.compatibilityStatus,
    "Reported",
  );

  return (
    <a
      href={`/devices/${product.slug}`}
      className="card-hover border-theme bg-surface text-primary flex flex-col rounded-2xl border p-5"
    >
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="bg-elevated text-muted flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold">
          {style.shortLabel}
        </div>
        <span
          className={joinClasses(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
            style.badge,
            style.text,
          )}
        >
          {formatProtocolLabel(product.primaryProtocol)}
        </span>
      </div>
      <div className="mb-0.5 text-[15px] leading-tight font-semibold">
        {product.name}
      </div>
      <div className="text-muted mb-3 text-[13px]">
        {product.manufacturerName} · {product.model ?? "Model TBD"}
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        <span
          className={joinClasses(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            compatibility.className,
          )}
        >
          {compatibility.label}
        </span>
        {product.categoryName && (
          <span className="border-badge bg-badge text-secondary rounded-md border px-2 py-0.5 text-[11px] font-medium">
            {product.categoryName}
          </span>
        )}
      </div>
      <div className="border-theme mt-2.5 flex items-center gap-1 border-t pt-2.5">
        <span className="bg-green-subtle text-green flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold">
          ✓
        </span>
        <span className="bg-green-subtle text-green flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold">
          {product.compatibleHubCount}
        </span>
        <span className="text-muted ml-auto text-[11px]">
          {product.compatibleHubCount} hub
          {product.compatibleHubCount === 1 ? "" : "s"}
        </span>
      </div>
    </a>
  );
}

function CatalogListRow({ product }: { product: CatalogProduct }) {
  const style = getProtocolStyle(product.primaryProtocol);

  return (
    <a
      href={`/devices/${product.slug}`}
      className="bg-surface text-primary hover:border-theme-hover hover:shadow-card grid min-w-[720px] grid-cols-[52px_1fr_120px_120px_100px_140px] items-center gap-4 rounded-[10px] border border-transparent px-4 py-3 transition-all"
    >
      <div className="bg-elevated text-muted flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold">
        {style.shortLabel}
      </div>
      <div className="min-w-0">
        <div className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
          {product.name}
        </div>
        <div className="text-muted text-xs">
          {product.manufacturerName} · {product.model ?? "Model TBD"}
        </div>
      </div>
      <span
        className={joinClasses(
          "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
          style.badge,
          style.text,
        )}
      >
        {formatProtocolLabel(product.primaryProtocol)}
      </span>
      <span className="text-secondary text-[13px]">
        {product.categoryName ?? "Uncategorized"}
      </span>
      <span className="text-secondary text-xs font-medium">
        {formatBooleanFact(product.localControl)}
      </span>
      <div className="flex items-center gap-0.5">
        <span className="bg-green-subtle text-green flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold">
          {product.compatibleHubCount}
        </span>
        <span className="text-muted ml-auto text-[11px]">
          {product.compatibleHubCount}
        </span>
      </div>
    </a>
  );
}

function CatalogEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <section className="border-theme bg-surface shadow-card rounded-2xl border p-6">
      <div className="flex items-start gap-4">
        <div className="border-theme bg-elevated text-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-xl font-bold">
          ?
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-semibold tracking-tight">
            No matching devices
          </h3>
          <p className="text-muted mt-3 max-w-[760px] text-sm leading-relaxed">
            A few filters can narrow the catalog quickly. Clear one or two
            filters, or broaden the search, and the results will update
            immediately.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="bg-blue-gradient hover:shadow-blue-lg mt-5 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
}

interface CatalogResultsProps {
  loading: boolean;
  error: string | null;
  view: ViewMode;
  products: CatalogProduct[];
  onReset: () => void;
}

export function CatalogResults({
  loading,
  error,
  view,
  products,
  onReset,
}: CatalogResultsProps) {
  if (loading) {
    return (
      <div className="pb-4">
        <div className="border-theme bg-surface text-muted rounded-2xl border px-5 py-4 text-sm">
          Loading catalog index...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-4">
        <div className="border-red bg-red-subtle text-red rounded-2xl border px-5 py-4 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <CatalogEmptyState onReset={onReset} />;
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-0.5 overflow-x-auto">
        <div className="text-muted grid min-w-[720px] grid-cols-[52px_1fr_120px_120px_100px_140px] items-center gap-4 px-4 py-2 text-[11px] font-semibold tracking-wider uppercase">
          <span></span>
          <span>Device</span>
          <span>Protocol</span>
          <span>Category</span>
          <span>Local</span>
          <span>Hubs</span>
        </div>

        {products.map((product) => (
          <CatalogListRow key={product.slug} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
      {products.map((product) => (
        <CatalogGridCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
