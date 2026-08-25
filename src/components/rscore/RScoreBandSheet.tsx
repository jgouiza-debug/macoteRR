"use client";

import { Sheet } from "@/components/ui/Sheet";
import { SourceStamp } from "@/components/SourceStamp";
import {
  R_SCORE_BANDS,
  R_SCORE_BAND_SOURCE,
  bandForScore,
  bandLabel,
  bandMeaning,
  bandRangeLabel,
} from "@/lib/rscore/bands";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

const TONE_CLASSES = {
  neutral: "border-ink/20 bg-ink/[0.03]",
  positive: "border-moss/35 bg-moss/[0.07]",
  highlight: "border-ultramarine/40 bg-ultramarine/[0.07]",
} as const;

const TONE_TEXT = {
  neutral: "text-ink",
  positive: "text-moss",
  highlight: "text-ultramarine",
} as const;

/**
 * "What does 28,4 actually mean?" — the question every student asks the moment they type
 * their score, and the one the product previously left unanswered.
 *
 * The sheet leads with the student's own band and lists the rest below it for context. It is
 * explicit, twice, that no official classification exists: these ranges are read off the
 * published admission cutoffs, so the disclaimer and the BCI source stamp are not optional
 * decoration (guardrail #1).
 */
export function RScoreBandSheet({
  score,
  open,
  onClose,
  onContinue,
}: {
  score: number;
  open: boolean;
  onClose: () => void;
  onContinue?: () => void;
}) {
  const { t, locale } = useLocale();
  const f = useFormat();
  const current = bandForScore(score);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("band.title").replace("{score}", f.score(score))}
      footer={
        <button
          type="button"
          onClick={onContinue ?? onClose}
          className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {t("band.cta")}
        </button>
      }
    >
      <div className={`rounded border-[1.5px] p-4 ${TONE_CLASSES[current.tone]}`}>
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink/45">
          {t("band.yourBand")}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className={`font-display text-[21px] font-bold leading-tight ${TONE_TEXT[current.tone]}`}>
            {bandLabel(current, locale)}
          </h3>
          <span className="text-[13px] font-semibold tabular-nums text-ink/55">
            {bandRangeLabel(current, locale)}
          </span>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink/75">
          {bandMeaning(current, locale)}
        </p>
      </div>

      <h4 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-ink/45">
        {t("band.allBands")}
      </h4>

      <ul className="overflow-hidden rounded border border-ink/12">
        {R_SCORE_BANDS.filter((band) => band.id !== current.id).map((band) => (
          <li
            key={band.id}
            className="border-b border-ink/10 bg-paper px-3.5 py-3 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-ink">
                {bandLabel(band, locale)}
              </span>
              <span className="text-[12px] font-semibold tabular-nums text-ink/50">
                {bandRangeLabel(band, locale)}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink/55">
              {bandMeaning(band, locale)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded bg-ink/[0.04] p-3.5 text-[12px] leading-relaxed text-ink/60">
        {t("band.disclaimer")}
      </p>

      <SourceStamp
        date={R_SCORE_BAND_SOURCE.lastVerifiedAt}
        href={R_SCORE_BAND_SOURCE.url}
        className="pt-2.5"
      />
    </Sheet>
  );
}
