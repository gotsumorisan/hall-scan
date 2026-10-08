import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return typeof r.atIntervalActualGame !== "number"
    ? ("needs_judgment" as const)
    : r.atIntervalActualGame >= 500
      ? ("candidate" as const)
      : ("watch" as const);
}
