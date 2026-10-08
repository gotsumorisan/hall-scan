import type { Evidence } from "../../models/types";
import { rawSchema } from "./raw-schema";
export function resolve(raw: Record<string, unknown>, evidence: Evidence[]) {
  const r = rawSchema.parse(raw);
  const resetEvidence = evidence.findLast(
    (e) => e.field === "resetVerification",
  );
  return {
    reset:
      resetEvidence?.verification === "contradicted"
        ? "contradicted"
        : r.resetVerification,
    modeEvidence: evidence.filter((e) => e.field === "pushPanel"),
    spotlightEvidence: evidence.filter((e) => e.field === "spotlight"),
  };
}
