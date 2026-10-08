import type { Decision } from "../models/types";
const labels = { A: "打つ / 続行", B: "見送る", C: "追加確認", D: "打たない" };
export function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <section
      className={`decision grade-${decision.grade}`}
      aria-label={`判定 ${decision.grade}`}
    >
      <div className="decision-head">
        <strong className="grade">{decision.grade}</strong>
        <div>
          <span className="eyebrow">DECISION</span>
          <h2>{labels[decision.grade]}</h2>
        </div>
      </div>
      {decision.reasons.map((r) => (
        <p key={r}>{r}</p>
      ))}
      <div className="next-action">
        <span>次の行動</span>
        <p>{decision.action}</p>
      </div>
      {decision.selectedRoute && (
        <details>
          <summary>採用した根拠・計算前提</summary>
          <p>{decision.selectedRoute.basis}</p>
          {decision.selectedRoute.evYen === null && (
            <p>
              概算の候補目安です。個別の期待値金額を算出したものではありません。
            </p>
          )}
        </details>
      )}
    </section>
  );
}
