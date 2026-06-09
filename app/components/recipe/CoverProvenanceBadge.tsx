import clsx from "clsx";

export function CoverProvenanceBadge({
  label,
  className,
}: {
  label?: string | null;
  className?: string;
}) {
  if (!label) return null;

  return (
    <span
      data-testid="cover-provenance-badge"
      className={clsx(
        "font-sj-ui inline-flex min-h-6 max-w-full items-center border border-[var(--sj-border)] bg-[color-mix(in_srgb,var(--sj-panel-solid)_92%,transparent)] px-2 py-0.5 text-xs/5 font-semibold text-[var(--sj-ink-soft)] shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
