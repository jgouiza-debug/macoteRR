/**
 * In-page navigation for the long content pages. Each entry is a real link: coloured and
 * underlined at rest (so it reads as a link without hover, which never fires on touch) and
 * 44px tall with no gap between rows, so the six adjacent targets cannot be mis-tapped.
 */
export function TableOfContents({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string }[];
}) {
  return (
    <nav aria-label={title} className="mt-6 rounded-[3px] border border-border bg-paper px-4 py-3">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-secondary">{title}</p>
      <ol className="mt-1 flex list-none flex-col p-0">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-[44px] items-center text-[14.5px] font-medium text-ultramarine underline underline-offset-2 transition-colors hover:text-pressed"
            >
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
