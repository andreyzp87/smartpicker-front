import { joinClasses } from "../../../lib/ui";

interface SearchInputProps {
  id?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  compact?: boolean;
  className?: string;
}

export function SearchInput({
  id,
  placeholder,
  value,
  onChange,
  onFocus,
  compact = false,
  className,
}: SearchInputProps) {
  return (
    <label className={joinClasses("relative block", className)}>
      <svg
        className={joinClasses(
          "text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2",
          compact && "left-3.5",
        )}
        width={compact ? "14" : "16"}
        height={compact ? "14" : "16"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        className={joinClasses(
          "border-theme bg-surface text-primary w-full rounded-[10px] border transition-all outline-none placeholder:text-[var(--sp-text-muted)] focus:border-[rgba(37,99,235,0.4)] focus:shadow-[var(--sp-shadow-search)]",
          compact
            ? "py-2.5 pr-3.5 pl-9 text-[13px]"
            : "py-3 pr-4 pl-10 text-sm",
        )}
      />
    </label>
  );
}
