import { z } from "zod";
import type { HallDB } from "./db";
import type { DailyResearchOverride } from "../models/types";
import { getSpec } from "../machine-specs/registry";
export const researchSchema = z
  .object({
    id: z.string().min(1).max(200),
    businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    storeName: z.string().trim().min(1).max(150),
    exchange: z.enum(["equivalent", "5.6", "unknown"]),
    closingTime: z.string().regex(/^$|^(?:[01]\d|2[0-3]):[0-5]\d$/),
    installedMachineIds: z.array(z.string()).max(10),
    verification: z.enum(["confirmed", "unknown"]),
    sourceUrl: z.union([
      z.literal(""),
      z
        .string()
        .url()
        .max(2000)
        .refine((url) => new URL(url).protocol === "https:"),
    ]),
    checkedAt: z.string().datetime(),
    note: z.string().max(2000),
  })
  .refine((r) => r.verification !== "confirmed" || r.sourceUrl.length > 0, {
    message: "確認済みには出典URLが必要です。",
  });
export async function saveResearch(
  db: HallDB,
  dailyId: string,
  value: DailyResearchOverride,
) {
  const research = researchSchema.parse(value);
  research.installedMachineIds.forEach(getSpec);
  return db.transaction("rw", db.days, async () => {
    const day = await db.days.get(dailyId);
    if (!day || day.businessDate !== research.businessDate)
      throw Error("当日の確認情報だけを保存できます。");
    if (day.ended) throw Error("終了済みの日の調査情報は変更できません。");
    const old = day.researchOverrides ?? [];
    if (old.length >= 30 && !old.some((r) => r.id === research.id))
      throw Error("店舗候補は1日30件までです。");
    day.researchOverrides = [
      ...old.filter((r) => r.id !== research.id),
      research,
    ];
    await db.days.put(day);
    return research;
  });
}
