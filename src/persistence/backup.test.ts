import { it, expect, afterEach } from "vitest";
import { HallDB } from "./db";
import { Repository } from "./repository";
import { exportBackup, importBackup, parseBackup } from "./backup";
import { machine } from "../tests/fixtures";
const opened: HallDB[] = [];
function database() {
  const db = new HallDB(`backup-${crypto.randomUUID()}`);
  opened.push(db);
  return db;
}
afterEach(async () => {
  for (const db of opened.splice(0)) await db.delete();
});
async function setup() {
  const db = database(),
    repo = new Repository(db),
    day = await repo.ensureToday("2026-10-07");
  const visit = await repo.visit(day.id, "店舗A"),
    m = await repo.createMachine(day.id, visit.id, "karakuri_circus_2", "128");
  const f = machine();
  await repo.saveMachine(m.id, f.raw, f.context, []);
  await repo.judge(m.id);
  const live = await repo.startLive(m.id);
  await repo.addInvestment(live.id, 12000);
  return { db, repo, day, m, live };
}
it("別端末へactive LIVE・投資・immutable snapshotを復元", async () => {
  const s = await setup(),
    json = await exportBackup(s.db),
    dest = database(),
    repo = new Repository(dest);
  await repo.ensureToday("2026-10-07");
  await importBackup(dest, json);
  const d = await repo.ensureToday("2026-10-08");
  expect(d.id).toBe(s.day.id);
  expect(d.dailyInvestment).toBe(12000);
  expect((await repo.readDay(d.id)).live?.id).toBe(s.live.id);
  const entry = await repo.getEntry(s.live.entrySnapshotId);
  expect(Object.isFrozen(entry.state.raw)).toBe(true);
  await expect(repo.addInvestment(s.live.id, 18001)).rejects.toThrow(
    "30,000円",
  );
});
it("同一バックアップの履歴追加は冪等", async () => {
  const s = await setup();
  await s.repo.finishLive(s.live.id, 10000);
  const json = await exportBackup(s.db),
    dest = database();
  await importBackup(dest, json);
  expect(await importBackup(dest, json)).toBe(0);
  expect(await dest.events.count()).toBe(1);
});
it("投資総額の破損・孤立参照・未知の保存版を拒否", async () => {
  const s = await setup(),
    b = JSON.parse(await exportBackup(s.db));
  b.tables.days[0].dailyInvestment = 0;
  expect(() => parseBackup(JSON.stringify(b))).toThrow("一致");
  b.tables.days[0].dailyInvestment = 12000;
  b.tables.machines[0].visitId = "missing";
  expect(() => parseBackup(JSON.stringify(b))).toThrow("一致");
  b.schemaVersion = 999;
  expect(() => parseBackup(JSON.stringify(b))).toThrow("保存版");
});
it("既存の投資額を古いバックアップで巻き戻さず、失敗時は全体rollback", async () => {
  const s = await setup(),
    old = await exportBackup(s.db);
  await s.repo.finishLive(s.live.id, 0);
  const before = await exportBackup(s.db);
  await expect(importBackup(s.db, old)).rejects.toThrow("上書き");
  expect(JSON.parse(await exportBackup(s.db)).tables).toEqual(
    JSON.parse(before).tables,
  );
});
it("LIVE中の復元を拒否", async () => {
  const s = await setup();
  await expect(importBackup(s.db, await exportBackup(s.db))).rejects.toThrow(
    "LIVE中",
  );
});
