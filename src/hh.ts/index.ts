import type { TickResult, TickState } from "../api/jobAgent";
import { relocationGuard } from "./guards/relocation.guard";
import { applyFromSerpFlow } from "./flows/applyFromSerp.flow";

export function tickHH(state: TickState): TickResult {
  // 1) глобальные guards
  const guarded = relocationGuard(state);
  if (guarded) return guarded;

  // 2) основной flow
  return applyFromSerpFlow(state);
}
