import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return typeof r.atIntervalGame !== "number"
    ? ("needs_judgment" as const)
    : r.atIntervalGame >= 300
      ? ("candidate" as const)
      : ("watch" as const);
}
