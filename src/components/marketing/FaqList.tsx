import { ChevronDown } from "lucide-react";

/**
 * FAQ as native disclosure rows. A reader scanning for one answer opens that one instead of
 * reading four expanded blocks of equal weight; the answers stay in the DOM, so the FAQPage
 * JSON-LD on the route still matches what is rendered.
 */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-3 flex flex-col">
      {items.map((item) => (
        <details key={item.q} className="group border-t border-hairline first:border-t-0">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-5 w-5 flex-shrink-0 text-secondary transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="max-w-[68ch] pb-4 text-[15px] leading-relaxed text-ink/80">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
