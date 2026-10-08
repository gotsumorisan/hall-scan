import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { HallDB } from "./db";
import { Repository } from "./repository";
import { machine } from "../tests/fixtures";
import { VERSIONS } from "../models/types";
let db: HallDB, repo: Repository;
async function setup(raw: Record<string, unknown> = {}) {
  const day = await repo.ensureToday("2026-10-07");
  const visit = await repo.visit(day.id, "店舗A");
  const m = await repo.createMachine(
    day.id,
    visit.id,
    "karakuri_circus_2",
    "128",
  );
  const fixture = machine(raw);
  await repo.saveMachine(m.id, fixture.raw, fixture.context, []);
  await repo.judge(m.id);
  return { day, visit, m };
}
async function liveSetup(raw: Record<string, unknown> = {}) {
  const s = await setup(raw);
  return { ...s, live: await repo.startLive(s.m.id) };
}
beforeEach(() => {
  db = new HallDB(`test-${crypto.randomUUID()}`);
  repo = new Repository(db);
});
afterEach(async () => {
  await db.delete();
});
describe("永続化と原子的な上限", () => {
  it("reload後にactive LIVE復元", async () => {
    const { day, live } = await liveSetup();
    await repo.addInvestment(live.id, 1000);
    db.close();
    db = new HallDB(db.name);
    const reload = new Repository(db);
    const restored = await reload.ensureToday("2026-10-08");
    expect(restored.id).toBe(day.id);
    expect((await reload.readDay(day.id)).live?.id).toBe(live.id);
    expect(restored.dailyInvestment).toBe(1000);
  });
  it("店舗移動後も当日総投資を維持", async () => {
    const { day, live } = await liveSetup();
    await repo.addInvestment(live.id, 12000);
    await repo.finishLive(live.id, 8000);
    await repo.visit(day.id, "店舗B");
    const result = await repo.readDay(day.id);
    expect(result.day.dailyInvestment).toBe(12000);
    expect(result.visits).toHaveLength(2);
  });
  it("並列投資でも上限を超えない", async () => {
    const { day, live } = await liveSetup();
    const res = await Promise.allSettled([
      repo.addInvestment(live.id, 20000),
      repo.addInvestment(live.id, 20000),
    ]);
    expect(res.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect((await repo.readDay(day.id)).day.dailyInvestment).toBe(20000);
    expect(
      await db.events.where("liveSessionId").equals(live.id).toArray(),
    ).toHaveLength(1);
  });
  it("上限到達でLIVE Dになり追加不可", async () => {
    const { day, live } = await liveSetup();
    await repo.addInvestment(live.id, 30000);
    expect((await repo.readDay(day.id)).live?.decision.grade).toBe("D");
    await expect(repo.addInvestment(live.id, 1)).rejects.toThrow();
  });
  it("BからLIVE開始拒否はUI外でも有効", async () => {
    const { m } = await setup({ lcdGame: 800 });
    await expect(repo.startLive(m.id)).rejects.toThrow("A以外");
  });
  it("C確認不能は保存後もB・checkUsed保持", async () => {
    const { m } = await setup({
      lcdGame: null,
      goddessIntervalActualGame: null,
      atIntervalActualGame: null,
      goddessSkipCount: null,
    });
    expect((await db.machines.get(m.id))?.decision?.grade).toBe("C");
    expect(
      (await repo.judge(m.id, { unavailable: true })).decision?.grade,
    ).toBe("B");
    expect((await repo.judge(m.id)).decision?.grade).toBe("B");
  });
  it("着席時snapshotはLIVE更新でも変更されない", async () => {
    const { live } = await liveSetup();
    const before = await repo.getEntry(live.entrySnapshotId);
    await repo.liveEvent(live.id, "counters", { lcdGame: 1100 });
    const after = await repo.getEntry(live.entrySnapshotId);
    expect(after).toEqual(before);
    expect(after.state.raw.lcdGame).toBe(1000);
    expect(Object.isFrozen(after.state.raw)).toBe(true);
  });
  it("短期負けだけでAを撤回しない", async () => {
    const { day, live } = await liveSetup();
    await repo.addInvestment(live.id, 10000);
    await repo.liveEvent(live.id, "loss_note", {
      note: "持ちメダル0、数百Gハマり",
    });
    expect((await repo.readDay(day.id)).live?.decision.grade).toBe("A");
  });
  it("女神1回狙い失敗で元ルートを消費し再判定", async () => {
    const { day, live } = await liveSetup();
    await repo.liveEvent(live.id, "goddess_failure", {});
    const restored = await repo.readDay(day.id);
    expect(restored.live?.entryBasisActive).toBe(false);
    expect(restored.live?.decision.grade).not.toBe("A");
  });
  it("3スルー狙いは次回失敗でもスルー天井まで根拠維持", async () => {
    const { day, live } = await liveSetup({
      lcdGame: 0,
      goddessIntervalActualGame: 500,
      goddessSkipCount: 3,
    });
    await repo.liveEvent(live.id, "goddess_failure", {});
    expect((await repo.readDay(day.id)).live?.decision.grade).toBe("A");
  });
  it("AT終了直後はfollowup、次状態確認で再判定", async () => {
    const { day, live } = await liveSetup();
    await repo.liveEvent(live.id, "at_started", {});
    await repo.liveEvent(live.id, "at_ended", {});
    expect((await repo.readDay(day.id)).live?.phase).toBe("followup");
    expect((await repo.readDay(day.id)).live?.decision.grade).toBe("A");
    await repo.liveEvent(live.id, "next_state_confirmed", {});
    expect((await repo.readDay(day.id)).live?.decision.grade).not.toBe("A");
  });
  it("¥0・候補なしで終了してreview保存", async () => {
    const d = await repo.ensureToday("2026-10-07");
    await repo.finishDay(d.id);
    const review = await repo.saveReview(d.id, {
      returnYen: 0,
      quality: {},
      hypothesis: "",
      refutation: "",
      sideEffect: "",
      verdict: "保留",
    });
    expect(review.profitLoss).toBe(0);
    expect((await repo.readDay(d.id)).day.ended).toBe(true);
  });
  it("同日終了後の再読み込みで軍資金をリセットしない", async () => {
    const { day, live } = await liveSetup();
    await repo.addInvestment(live.id, 2000);
    await repo.finishLive(live.id, 0);
    await repo.finishDay(day.id);
    expect((await repo.ensureToday(day.businessDate)).dailyInvestment).toBe(
      2000,
    );
  });
  it("ルール版変更後は古いAでLIVEを開始しない", async () => {
    const { m } = await setup();
    await db.machines.update(m.id, { rulesVersion: "old" });
    await expect(repo.startLive(m.id)).rejects.toThrow("ルール");
  });
  it("UI画像が無くても判定できる", async () => {
    const { m } = await setup();
    expect((await db.machines.get(m.id))?.decision?.grade).toBe("A");
  });
  it("v1→v2 migrationは投資とLIVE参照を保持", async () => {
    const name = db.name;
    db.close();
    const old = new (await import("dexie")).default(name);
    old
      .version(1)
      .stores({
        days: "id, businessDate, ended",
        visits: "id, dailyId",
        machines: "id, dailyId, visitId",
        entries: "id, machineStateId, dailyId",
        decisions: "id, machineStateId",
        lives: "id, dailyId, status",
        events: "id, liveSessionId",
        reviews: "id, dailyId",
      });
    await old
      .table("days")
      .add({
        ...VERSIONS,
        schemaVersion: 1,
        id: "2026-10-07",
        businessDate: "2026-10-07",
        dailyInvestment: 12000,
        maxDailyInvestment: 30000,
        visits: [],
        activeLiveSessionId: null,
        ended: false,
      });
    old.close();
    db = new HallDB(name);
    repo = new Repository(db);
    const d = await repo.ensureToday("2026-10-07");
    expect(d.schemaVersion).toBe(2);
    expect(d.dailyInvestment).toBe(12000);
  });
});
