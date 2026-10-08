import { rawSchema } from "./raw-schema";
export function patrol(raw: Record<string, unknown>) {
  const r = rawSchema.parse(raw);
  if (
    (r.lcdGame ?? 0) >= 600 ||
    (r.goddessIntervalActualGame ?? 0) >= 500 ||
    (r.goddessSkipCount ?? 0) >= 3 ||
    (r.atIntervalActualGame ?? 0) >= 1800
  )
    return "candidate" as const;
  if (Object.values(r).some((v) => v === null))
    return "needs_judgment" as const;
  if ((r.lcdGame ?? 0) > 0) return "watch" as const;
  return "skip" as const;
}
