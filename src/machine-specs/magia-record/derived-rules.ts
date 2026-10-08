import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.currentPoint === "number"
        ? Math.max(0, 950 - r.currentPoint)
        : null,
  };
}
