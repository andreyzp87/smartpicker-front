import { buildPageItems } from "../../../lib/catalog/core";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="rounded-md border border-theme bg-transparent px-3 py-2 text-[13px] font-medium text-muted transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-theme-hover enabled:hover:bg-elevated enabled:hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={
              item === currentPage
                ? "rounded-md border border-blue bg-blue-subtle px-3 py-2 text-[13px] font-medium text-blue transition-all hover:-translate-y-0.5 hover:brightness-105"
                : "rounded-md border border-theme bg-transparent px-3 py-2 text-[13px] font-medium text-muted transition-all hover:-translate-y-0.5 hover:border-theme-hover hover:bg-elevated hover:text-secondary"
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="rounded-md border border-theme bg-transparent px-3 py-2 text-[13px] font-medium text-muted transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-theme-hover enabled:hover:bg-elevated enabled:hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
