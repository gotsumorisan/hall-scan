import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.stIntervalGame === "number"
        ? Math.max(0, 996 - r.stIntervalGame)
        : null,
  };
}
