import type { ActiveChip } from "../../../lib/catalog/core";

interface CatalogActiveChipsProps {
  chips: ActiveChip[];
  onRemove: (chip: ActiveChip) => void;
}

export function CatalogActiveChips({
  chips,
  onRemove,
}: CatalogActiveChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pb-4">
      {chips.map((chip) => (
        <button
          key={`${chip.kind}:${chip.value}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue bg-blue-subtle px-2.5 py-1 text-xs font-medium text-blue"
        >
          {chip.label}
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px]">
            ✕
          </span>
        </button>
      ))}
    </div>
  );
}
