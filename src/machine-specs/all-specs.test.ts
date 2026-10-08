import { describe, it, expect } from "vitest";
import { specs, getSpec } from "./registry";
import { machine } from "../tests/fixtures";
import { decide } from "../engine/decision";
import type { MachineState } from "../models/types";
function state(id: string, raw: Record<string, unknown> = {}): MachineState {
  const spec = getSpec(id),
    s = machine();
  s.meta = { machineId: id, machineName: spec.name, seat: "1" };
  s.raw = spec.parse({ ...spec.emptyRaw(), ...raw });
  s.resolvedState = spec.resolve(s.raw, []);
  s.derived = spec.derive(s.raw);
  return s;
}
describe("全機種の独立した契約", () => {
  it("10個の異なる機種とカウンタ。未知のカウンタを受け付けない", () => {
    expect(specs).toHaveLength(10);
    expect(new Set(specs.map((s) => s.id)).size).toBe(10);
    for (const spec of specs.slice(1)) {
      expect(() => spec.parse({ ...spec.emptyRaw(), lcdGame: 600 })).toThrow();
      for (const field of spec.fields.filter((f) => f.kind === "number"))
        expect(spec.emptyRaw()[field.key]).toBeNull();
      expect(spec.guide.where.length).toBeGreaterThan(0);
    }
  });
  it.each([
    ["kabaneri_kaimon", "stIntervalGame", 600, 650],
    ["tokyo_ghoul", "atIntervalActualGame", 650, 800],
    ["monkey_turn_v", "currentGame", 500, 550],
    ["sengoku_otome_5", "atIntervalActualGame", 560, 650],
    ["valvrave_2", "bonusAtIntervalGame", 900, 1000],
    ["magia_record", "currentPoint", 750, 800],
    ["hokuto_tensei_2", "abeshi", 900, 975],
    ["enen_2", "bonusIntervalGame", 600, 650],
  ])("%sの交換別ライン・直前・上限", (id, key, eq, nonEq) => {
    const spec = getSpec(String(id));
    const extras =
      id === "hokuto_tensei_2" ? { tengekiFail: "contradicted" } : {};
    for (const [exchange, threshold] of [
      ["equivalent", eq],
      ["5.6", nonEq],
    ] as const) {
      const s = state(String(id), { [key]: threshold, ...extras });
      s.context.exchange = exchange;
      expect(decide(spec, s, 0).grade).toBe("A");
      expect(decide(spec, s, 30000).grade).toBe("D");
      s.raw[key] = Number(threshold) - 1;
      expect(decide(spec, s, 0).grade).not.toBe("A");
    }
  });
  it.each(["tokyo_ghoul", "valvrave_2", "magia_record", "enen_2"])(
    "%s reset possibleで専用EVを採用しない",
    (id) => {
      const spec = getSpec(id),
        field = {
          tokyo_ghoul: "resetIntervalActualGame",
          valvrave_2: "bonusAtIntervalGame",
          magia_record: "currentPoint",
          enen_2: "bonusIntervalGame",
        }[id]!;
      const point = {
        tokyo_ghoul: 120,
        valvrave_2: 600,
        magia_record: 550,
        enen_2: 500,
      }[id]!;
      const s = state(id, {
        [field]: point,
        ...(id === "tokyo_ghoul" ? { czHistory: 0 } : {}),
        resetVerification: "possible",
      });
      expect(decide(spec, s, 0).routes.some((r) => r.resetOnly)).toBe(false);
      s.raw.resetVerification = "confirmed";
      s.resolvedState = spec.resolve(s.raw, []);
      expect(decide(spec, s, 0).selectedRoute?.resetOnly).toBe(true);
    },
  );
  it("リコリコは深いG・12スタンプでも専用根拠不足でAにしない", () => {
    const s = state("lycoris_recoil", {
      atIntervalGame: 800,
      czIntervalGame: 590,
      stamps: 12,
      upperAtRebound: "confirmed",
    });
    expect(decide(getSpec("lycoris_recoil"), s, 0).grade).toBe("B");
    expect(
      decide(getSpec("lycoris_recoil"), s, 0).routes[0].missingSource,
    ).toContain("TODO_NEEDS_SOURCE");
  });
  it("通常CZと上位CZの失敗は独立", () => {
    const spec = getSpec("lycoris_recoil"),
      s = state(spec.id, {
        normalCzFails: 2,
        upperCzFails: 1,
        atIntervalGame: 700,
        czIntervalGame: 300,
      });
    const next = spec.applyEvent(s, "upper_cz_failure", {}).state;
    expect(next.raw.upperCzFails).toBe(2);
    expect(next.raw.normalCzFails).toBe(2);
    expect(next.raw.atIntervalGame).toBe(700);
    expect(next.raw.czIntervalGame).toBe(300);
  });
  it("VV2の決戦失敗だけ加算、CZ失敗では加算しない", () => {
    const spec = getSpec("valvrave_2"),
      s = state(spec.id, { decisiveBonusAtMissCount: 2, czIntervalGame: 100 });
    expect(
      spec.applyEvent(s, "cz_failure", {}).state.raw.decisiveBonusAtMissCount,
    ).toBe(2);
    expect(
      spec.applyEvent(s, "decisive_miss", {}).state.raw
        .decisiveBonusAtMissCount,
    ).toBe(3);
    expect(() =>
      spec.applyEvent(
        state(spec.id, { decisiveBonusAtMissCount: 3 }),
        "decisive_miss",
        {},
      ),
    ).toThrow();
  });
  it("炎炎のボーナス当選ではループ間を消さない", () => {
    const spec = getSpec("enen_2"),
      s = state(spec.id, {
        bonusIntervalGame: 600,
        loopIntervalGame: 1300,
        trapSkipCount: 4,
      });
    const update = spec.applyEvent(s, "bonus_started", {});
    expect(update.state.raw.bonusIntervalGame).toBe(0);
    expect(update.state.raw.loopIntervalGame).toBe(1300);
    expect(update.state.raw.trapSkipCount).toBe(4);
    expect(update.basisEnded).toBe(true);
  });
  it("あべしと実Gを分離し、金額不明の概算を捏造しない", () => {
    const s = state("hokuto_tensei_2", {
        abeshi: 975,
        actualGame: 50,
        tengekiFail: "contradicted",
      }),
      spec = getSpec(s.meta.machineId);
    const d = decide(spec, s, 0);
    expect(d.grade).toBe("A");
    expect(d.selectedRoute?.evYen).toBeNull();
    expect(d.reasons.join("")).toContain("個別EV金額は未算出");
    expect(s.raw.actualGame).toBe(50);
  });
  it("LIVEの表示更新・次状態入力は各機種のfieldを持つ", () => {
    for (const spec of specs.slice(1))
      for (const type of ["counters", "next_state_confirmed"])
        expect(spec.events.find((e) => e.type === type)?.fields).toEqual(
          spec.fields,
        );
  });
});
