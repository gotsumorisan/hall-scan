import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.atIntervalActualGame === "number"
        ? Math.max(0, 1200 - r.atIntervalActualGame)
        : null,
  };
}
