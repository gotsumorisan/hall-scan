import { it, expect, afterEach } from "vitest";
import { HallDB } from "./db";
import { Repository } from "./repository";
import { saveResearch } from "./research";
import { exportBackup, parseBackup } from "./backup";
import type { DailyResearchOverride } from "../models/types";
const dbs: HallDB[] = [];
async function setup() {
  const db = new HallDB(`research-${crypto.randomUUID()}`);
  dbs.push(db);
  const repo = new Repository(db);
  await repo.ensureToday("2026-10-08");
  return { db, repo };
}
function record(): DailyResearchOverride {
  return {
    id: "store-1",
    businessDate: "2026-10-08",
    storeName: "候補A",
    exchange: "unknown",
    closingTime: "",
    installedMachineIds: [],
    verification: "unknown",
    sourceUrl: "",
    checkedAt: new Date().toISOString(),
    note: "不明な条件は推測しない",
  };
}
afterEach(async () => {
  for (const db of dbs.splice(0)) await db.delete();
});
it("不明の店舗条件を保存し、翌日へ確定情報として転記しない", async () => {
  const { db, repo } = await setup();
  await saveResearch(db, "2026-10-08", record());
  expect(
    (await repo.readDay("2026-10-08")).day.researchOverrides?.[0].exchange,
  ).toBe("unknown");
  expect(
    (await repo.ensureToday("2026-10-09")).researchOverrides,
  ).toBeUndefined();
  expect(
    parseBackup(await exportBackup(db)).tables.days.find(
      (d) => d.id === "2026-10-08",
    )?.researchOverrides,
  ).toHaveLength(1);
});
it("古い日・出典なし確認済み・不正URLを拒否", async () => {
  const { db } = await setup();
  await expect(
    saveResearch(db, "2026-10-08", { ...record(), businessDate: "2026-10-07" }),
  ).rejects.toThrow("当日");
  await expect(
    saveResearch(db, "2026-10-08", { ...record(), verification: "confirmed" }),
  ).rejects.toThrow();
  await expect(
    saveResearch(db, "2026-10-08", {
      ...record(),
      sourceUrl: "javascript:alert(1)",
    }),
  ).rejects.toThrow();
  expect((await db.days.get("2026-10-08"))?.researchOverrides).toBeUndefined();
});
it("終了済み営業日の当日情報を上書きしない", async () => {
  const { db, repo } = await setup();
  await saveResearch(db, "2026-10-08", record());
  await repo.finishDay("2026-10-08");
  await expect(
    saveResearch(db, "2026-10-08", { ...record(), exchange: "equivalent" }),
  ).rejects.toThrow("終了済み");
  expect(
    (await db.days.get("2026-10-08"))?.researchOverrides?.[0].exchange,
  ).toBe("unknown");
});
