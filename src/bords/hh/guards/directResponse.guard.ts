import { TickResult, TickState } from "@/api/jobAgent";

export function directResponseGuard(_: TickState): TickResult | null {
  const modal = document.querySelector<HTMLElement>(
    'div[role="alertdialog"][aria-modal="true"]',
  );

  if (!modal) return null;

  const cancelBtn = modal.querySelector<HTMLButtonElement>(
    'button[data-qa="vacancy-response-link-advertising-cancel"]',
  );
  if (cancelBtn) {
    cancelBtn.click();
  }
  return { nextIdx: _.idx, hold: true };
}
