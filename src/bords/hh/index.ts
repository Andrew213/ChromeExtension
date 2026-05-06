import { relocationGuard } from "./guards/relocation.guard";
import { applyFromSerpFlow } from "./flows/applyFromSerp.flow";
import { directResponseGuard } from "@/bords/hh/guards/directResponse.guard";
import { TickResult, TickState } from "@/api/jobAgent";

export function tickHH(state: TickState): TickResult {
  // глобальные guards
  const guarded = relocationGuard(state);
  const direct = directResponseGuard(state);
  if (direct) return direct;
  if (guarded) return guarded;

  // основной flow
  return applyFromSerpFlow(state);
}
