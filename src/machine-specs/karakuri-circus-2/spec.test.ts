import { describe, it, expect } from "vitest";
import { karakuri } from "./spec";
import { machine } from "../../tests/fixtures";
import { decide } from "../../engine/decision";
describe("からくり2 独立ルール", () => {
  it.each(["unknown", "possible", "strongly_supported", "contradicted"])(
    "reset %s で専用EVを使わない",
    (resetVerification) => {
      const d = decide(
        karakuri,
        machine({ lcdGame: 300, resetVerification }),
        0,
      );
      expect(d.routes.some((r) => r.resetOnly)).toBe(false);
      expect(d.grade).not.toBe("A");
    },
  );
  it("reset confirmed液晶300でA候補", () => {
    const d = decide(
      karakuri,
      machine({ lcdGame: 300, resetVerification: "confirmed" }),
      0,
    );
    expect(d.grade).toBe("A");
    expect(d.selectedRoute?.id).toBe("reset");
  });
  it("境界900G +2009円をAにしない", () =>
    expect(decide(karakuri, machine({ lcdGame: 900 }), 0).grade).toBe("B"));
  it("女神600実G +2004円をAにしない", () =>
    expect(
      decide(
        karakuri,
        machine({ lcdGame: 0, goddessIntervalActualGame: 600 }),
        0,
      ).grade,
    ).toBe("B"));
  it.each([
    ["equivalent", "cash", 1800, "A"],
    ["5.6", "medals", 1800, "A"],
    ["5.6", "cash", 1800, "B"],
    ["5.6", "cash", 2000, "A"],
  ])("AT間 %s %s %iG => %s", (exchange, funding, g, grade) =>
    expect(
      decide(
        karakuri,
        machine(
          {
            lcdGame: 0,
            goddessIntervalActualGame: 0,
            atIntervalActualGame: g as number,
          },
          { exchange: exchange as "equivalent", funding: funding as "cash" },
        ),
        0,
      ).grade,
    ).toBe(grade),
  );
  it("等価女神3スルー+500実G", () =>
    expect(
      decide(
        karakuri,
        machine({
          lcdGame: 0,
          goddessIntervalActualGame: 500,
          goddessSkipCount: 3,
        }),
        0,
      ).grade,
    ).toBe("A"));
  it("等価女神4スルー0実G", () =>
    expect(
      decide(
        karakuri,
        machine({
          lcdGame: 0,
          goddessIntervalActualGame: 0,
          goddessSkipCount: 4,
        }),
        0,
      ).grade,
    ).toBe("A"));
  it("非等価4スルー専用EVはTODO", () => {
    const d = decide(
      karakuri,
      machine(
        { lcdGame: 0, goddessIntervalActualGame: 0, goddessSkipCount: 4 },
        { exchange: "5.6" },
      ),
      0,
    );
    expect(d.grade).toBe("B");
    expect(d.routes.find((r) => r.id === "skip")?.missingSource).toContain(
      "TODO_NEEDS_SOURCE",
    );
  });
  it("不明を許容し推測で埋めない", () => {
    const raw = karakuri.parse(karakuri.emptyRaw());
    expect(raw.lcdGame).toBeNull();
    expect(karakuri.derive(raw).goddessRemainingActualGame).toBeNull();
  });
  it("4カウンタは別々に更新", () => {
    const m = machine({
      lcdGame: 720,
      goddessIntervalActualGame: 610,
      atIntervalActualGame: 1450,
      goddessSkipCount: 3,
    });
    const n = karakuri.applyEvent(m, "counters", { lcdGame: 900 }).state;
    expect(n.raw).toMatchObject({
      lcdGame: 900,
      goddessIntervalActualGame: 610,
      atIntervalActualGame: 1450,
      goddessSkipCount: 3,
    });
  });
  it.each(["intermission_failure", "theater_failure", "loss_note"])(
    "%s は女神スルーに含めない",
    (event) => {
      const m = machine({
        goddessSkipCount: 3,
        goddessIntervalActualGame: 610,
      });
      const next = karakuri.applyEvent(m, event, {
        note: "一時的な負け",
      }).state;
      expect(next.raw.goddessSkipCount).toBe(3);
      expect(next.raw.goddessIntervalActualGame).toBe(610);
    },
  );
  it("女神失敗だけを加算", () => {
    const m = machine({ goddessSkipCount: 3, atIntervalActualGame: 1450 });
    const next = karakuri.applyEvent(m, "goddess_failure", {}).state;
    expect(next.raw.goddessSkipCount).toBe(4);
    expect(next.raw.goddessIntervalActualGame).toBe(0);
    expect(next.raw.atIntervalActualGame).toBe(1450);
  });
  it("スルー不明に1回加算して確定にしない", () =>
    expect(
      karakuri.applyEvent(
        machine({ goddessSkipCount: null }),
        "goddess_failure",
        {},
      ).state.raw.goddessSkipCount,
    ).toBeNull());
  it("spotlightを女神間の残りとしない", () => {
    const m = machine({ goddessIntervalActualGame: 100 });
    m.evidence.push({
      id: "e",
      field: "spotlight",
      value: "あるるかんアップ",
      acquisition: "direct",
      verification: "confirmed",
      source: "実機",
      observedAt: "now",
    });
    expect(karakuri.derive(m.raw).goddessRemainingActualGame).toBe(790);
    expect(karakuri.resolve(m.raw, m.evidence).spotlightEvidence).toHaveLength(
      1,
    );
  });
  it("PATROL候補はAを返さない", () =>
    expect(karakuri.patrol(machine({ lcdGame: 600 }).raw)).toBe("candidate"));
});
