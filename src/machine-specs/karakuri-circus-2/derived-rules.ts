import { rawSchema } from "./raw-schema";
export function derive(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  return {
    goddessRemainingActualGame:
      r.goddessIntervalActualGame === null
        ? null
        : Math.max(0, 890 - r.goddessIntervalActualGame),
    atRemainingActualGame:
      r.atIntervalActualGame === null
        ? null
        : Math.max(0, 2500 - r.atIntervalActualGame),
    nextGoddessIsFifth: r.goddessSkipCount === 4,
  };
}
