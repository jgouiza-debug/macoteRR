"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Bottom sheet on phones, centred dialog from `sm` up. Used for every interstitial in
 * onboarding — the estimate warning, the cote R band explainer, the quiz invitation.
 *
 * Built on <dialog> rather than a hand-rolled overlay so the browser supplies the focus trap,
 * the top-layer stacking, and Escape-to-close. `showModal()` has to be called imperatively,
 * hence the effect: rendering `open` as an attribute gives a non-modal dialog with none of
 * those behaviours.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** When false, the close affordance and light-dismiss are withheld — the footer must decide. */
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Escape fires `cancel` before `close`; intercept so a non-dismissible sheet stays put
    // and a dismissible one routes through the same onClose as every other exit.
    function handleCancel(event: Event) {
      event.preventDefault();
      if (dismissible) onClose();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [dismissible, onClose]);

  // Body scroll lock: <dialog> stops pointer interaction with the page but iOS Safari will
  // still rubber-band the document behind the sheet.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onClick={(event) => {
        // The backdrop is painted by the dialog element itself, so a click that lands on the
        // dialog box rather than its inner panel is a backdrop click.
        if (dismissible && event.target === ref.current) onClose();
      }}
      className="m-0 max-h-[100dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-w-[430px] sm:px-5"
    >
      <div className="fixed inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[18px] bg-paper shadow-overlay sm:static sm:max-h-[80dvh] sm:rounded-[18px]">
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5">
          <h2
            id="sheet-title"
            className="font-display text-[20px] font-bold leading-[1.2] tracking-tight text-ink"
          >
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="-mr-2 -mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink/45 transition-colors active:bg-ink/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="scroll-momentum flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && (
          <div className="flex flex-col gap-2.5 border-t border-ink/10 px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
