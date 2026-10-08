import { it, expect, afterEach } from "vitest";
import { HallDB } from "./db";
import { Repository } from "./repository";
import { getSpec } from "../machine-specs/registry";
import { machine } from "../tests/fixtures";
const databases: HallDB[] = [];
afterEach(async () => {
  for (const db of databases.splice(0)) await db.delete();
});
it.each([
  ["kabaneri_kaimon", "stIntervalGame", 600],
  ["tokyo_ghoul", "atIntervalActualGame", 650],
  ["monkey_turn_v", "currentGame", 500],
  ["sengoku_otome_5", "atIntervalActualGame", 560],
  ["valvrave_2", "bonusAtIntervalGame", 900],
  ["magia_record", "currentPoint", 750],
  ["hokuto_tensei_2", "abeshi", 900],
  ["enen_2", "bonusIntervalGame", 600],
])("%sの保存→A→LIVE→ノイズ→上限→終了→店舗移動", async (id, field, point) => {
  const db = new HallDB(`multi-${crypto.randomUUID()}`);
  databases.push(db);
  const repo = new Repository(db);
  const day = await repo.ensureToday("2026-10-08"),
    visit = await repo.visit(day.id, "店舗A"),
    spec = getSpec(String(id));
  const m = await repo.createMachine(day.id, visit.id, spec.id, "1");
  const raw = {
    ...spec.emptyRaw(),
    [field]: point,
    ...(id === "hokuto_tensei_2" ? { tengekiFail: "contradicted" } : {}),
  };
  await repo.saveMachine(m.id, raw, machine().context, []);
  const judged = await repo.judge(m.id);
  expect(judged.decision?.grade).toBe("A");
  const live = await repo.startLive(m.id),
    entry = await repo.getEntry(live.entrySnapshotId);
  await repo.addInvestment(live.id, 1000);
  await repo.liveEvent(live.id, "loss_note", { note: "短期の負け" });
  expect((await repo.readDay(day.id)).live?.decision.grade).toBe("A");
  await expect(repo.addInvestment(live.id, 29001)).rejects.toThrow("30,000円");
  expect(await repo.getEntry(live.entrySnapshotId)).toEqual(entry);
  await repo.finishLive(live.id, 0);
  await repo.visit(day.id, "店舗B");
  expect((await repo.readDay(day.id)).day.dailyInvestment).toBe(1000);
});
it("リコリコの専用金額不足ではLIVE開始できない", async () => {
  const db = new HallDB(`lyco-${crypto.randomUUID()}`);
  databases.push(db);
  const repo = new Repository(db),
    day = await repo.ensureToday();
  const visit = await repo.visit(day.id, "店舗"),
    m = await repo.createMachine(day.id, visit.id, "lycoris_recoil", "2"),
    spec = getSpec("lycoris_recoil");
  await repo.saveMachine(
    m.id,
    { ...spec.emptyRaw(), atIntervalGame: 800, czIntervalGame: 550 },
    machine().context,
    [],
  );
  await repo.judge(m.id);
  await expect(repo.startLive(m.id)).rejects.toThrow("A以外");
});
