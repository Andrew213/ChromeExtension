import type { TickResult, TickState } from "../../api/jobAgent";

export function relocationGuard(_: TickState): TickResult | null {
  const confirm = document.querySelector<HTMLButtonElement>(
    "[data-qa='relocation-warning-confirm']",
  );
  if (!confirm) return null;

  confirm.click();
  return { nextIdx: _.idx, hold: true };
}
