import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.bonusAtIntervalGame === "number"
        ? Math.max(0, 1500 - r.bonusAtIntervalGame)
        : null,
  };
}
