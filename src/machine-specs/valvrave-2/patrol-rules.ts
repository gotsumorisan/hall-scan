import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return typeof r.bonusAtIntervalGame !== "number"
    ? ("needs_judgment" as const)
    : r.bonusAtIntervalGame >= 700
      ? ("candidate" as const)
      : ("watch" as const);
}
