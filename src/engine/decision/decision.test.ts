import { describe, it, expect } from "vitest";
import { decide } from "./index";
import { machine } from "../../tests/fixtures";
import { karakuri } from "../../machine-specs/karakuri-circus-2/spec";
import { createEntry } from "../state/snapshots";
import { assertCanStart, investmentAfter } from "../live";
import { VERSIONS, type DailySession } from "../../models/types";
const day: DailySession = {
  ...VERSIONS,
  id: "day",
  businessDate: "2026-10-07",
  dailyInvestment: 0,
  maxDailyInvestment: 30000,
  visits: [],
  activeLiveSessionId: null,
  ended: false,
};
describe("共通ハードルール", () => {
  it.each(["B", "C", "D"] as const)("A以外 %s は開始不可", (grade) =>
    expect(() =>
      assertCanStart(day, { ...decide(karakuri, machine(), 0), grade }),
    ).toThrow(),
  );
  it("Aだけ開始できる", () =>
    expect(() =>
      assertCanStart(day, decide(karakuri, machine(), 0)),
    ).not.toThrow());
  it.each([1, 1000])("上限超過 %i 円を拒否", (amount) =>
    expect(() => investmentAfter(30000, amount)).toThrow(),
  );
  it("30,000円ちょうどは記録可能", () =>
    expect(investmentAfter(29000, 1000)).toBe(30000));
  it.each([-1, 0, 1.2, NaN, Infinity])("不正金額 %s を拒否", (amount) =>
    expect(() => investmentAfter(0, amount)).toThrow(),
  );
  it("上限ではD", () =>
    expect(decide(karakuri, machine(), 30000).grade).toBe("D"));
  it("Cは一項目だけ", () => {
    const d = decide(
      karakuri,
      machine({}, { exchange: "unknown", funding: "unknown" }),
      0,
    );
    expect(d.grade).toBe("C");
    expect(d.nextBestCheck?.field).toBe("exchange");
    expect(Array.isArray(d.nextBestCheck)).toBe(false);
  });
  it("C確認不能はB", () =>
    expect(decide(karakuri, machine(), 0, true).grade).toBe("B"));
  it("同一attemptでCを繰り返さない", () => {
    const m = machine({}, { exchange: "unknown", funding: "unknown" });
    m.session.checkUsed = true;
    expect(decide(karakuri, m, 0).grade).toBe("B");
  });
  it("EntrySnapshotはコピーを深くfreeze", () => {
    const m = machine();
    m.decision = decide(karakuri, m, 0);
    const entry = createEntry(m);
    m.raw.lcdGame = 0;
    expect(entry.state.raw.lcdGame).toBe(1000);
    expect(() => {
      entry.state.raw.lcdGame = 42;
    }).toThrow();
    expect(() => {
      entry.decision.reasons.push("改変");
    }).toThrow();
  });
  it("複数EVを単純加算しない", () => {
    const d = decide(
      karakuri,
      machine({
        lcdGame: 1100,
        goddessIntervalActualGame: 800,
        atIntervalActualGame: 2000,
      }),
      0,
    );
    expect(d.selectedRoute?.evYen).toBe(5854);
    expect(d.selectedRoute?.evYen).not.toBe(5633 + 5854 + 5095);
  });
  it("確認済み資金リスク過大はD", () =>
    expect(
      decide(karakuri, machine({}, { budgetRisk: "unsafe" }), 0).grade,
    ).toBe("D"));
  it("閉店リスク過大はD", () =>
    expect(decide(karakuri, machine({}, { timeRisk: "unsafe" }), 0).grade).toBe(
      "D",
    ));
});
