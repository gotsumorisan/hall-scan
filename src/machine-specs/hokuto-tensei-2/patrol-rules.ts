import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return typeof r.abeshi !== "number"
    ? ("needs_judgment" as const)
    : r.abeshi >= 600
      ? ("candidate" as const)
      : ("watch" as const);
}
