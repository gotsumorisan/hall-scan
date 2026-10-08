import { z } from "zod";
const counter = z.number().int().nonnegative().max(100000).nullable();
export const rawSchema = z.object({
  lcdGame: counter,
  goddessIntervalActualGame: counter,
  atIntervalActualGame: counter,
  goddessSkipCount: z.number().int().min(0).max(4).nullable(),
  resetVerification: z.enum([
    "confirmed",
    "strongly_supported",
    "possible",
    "unknown",
    "contradicted",
  ]),
  phase: z
    .enum(["normal", "goddess", "at", "followup", "rebound"])
    .default("normal"),
});
export type Raw = z.infer<typeof rawSchema>;
export const emptyRaw = (): Raw => ({
  lcdGame: null,
  goddessIntervalActualGame: null,
  atIntervalActualGame: null,
  goddessSkipCount: null,
  resetVerification: "unknown",
  phase: "normal",
});
