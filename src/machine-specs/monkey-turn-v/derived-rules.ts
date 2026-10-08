import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.currentGame === "number"
        ? Math.max(0, 795 - r.currentGame)
        : null,
  };
}
