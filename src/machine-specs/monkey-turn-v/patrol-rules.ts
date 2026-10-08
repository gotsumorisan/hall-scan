import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return typeof r.currentGame !== "number"
    ? ("needs_judgment" as const)
    : r.currentGame >= 350
      ? ("candidate" as const)
      : ("watch" as const);
}
