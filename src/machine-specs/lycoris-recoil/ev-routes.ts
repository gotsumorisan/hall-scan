import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
