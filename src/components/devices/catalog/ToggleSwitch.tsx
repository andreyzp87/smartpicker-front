import { joinClasses } from "../../../lib/ui";

export function ToggleSwitch({ active }: { active: boolean }) {
  return (
    <div
      className={joinClasses(
        "relative h-5 w-9 shrink-0 rounded-full border border-theme bg-elevated transition-all before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-surface before:shadow-sm before:transition-transform before:content-['']",
        active &&
          "border-[var(--sp-blue-500)] bg-[var(--sp-blue-bg)] before:translate-x-4 before:bg-[var(--sp-blue-500)]",
      )}
    />
  );
}
