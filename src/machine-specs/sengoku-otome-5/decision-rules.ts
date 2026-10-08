import type { MachineState, EVRoute } from "../../models/types";
import { evaluateState } from "../shared";
import { fields } from "./raw-schema";
import { evRoutes } from "./ev-routes";
import { patrol } from "./patrol-rules";
export function evaluate(state: MachineState) {
  const routes: EVRoute[] = evRoutes(state);
  return evaluateState(
    state,
    fields,
    routes,
    patrol(state.raw) === "candidate",
  );
}
