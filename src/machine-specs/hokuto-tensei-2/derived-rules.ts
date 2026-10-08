import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    remainingToNormalMaximum:
      typeof r.abeshi === "number" ? Math.max(0, 1536 - r.abeshi) : null,
  };
}
