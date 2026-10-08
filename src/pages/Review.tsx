import { useState } from "react";
import { Link } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
import type { Review as ReviewModel } from "../models/types";
const questions = [
  "着席判断",
  "続行・撤退",
  "情報不足",
  "AI確認漏れ",
  "入力しやすさ",
  "スクリーニング",
  "やめ時",
  "短期ノイズへの過反応",
  "着席前根拠の維持",
];
export function Review() {
  const { data, run, busy } = useSession(),
    [saved, setSaved] = useState(false);
  const previous = data?.reviews[0];
  const [quality, setQuality] = useState<Record<string, string>>(
      previous?.quality ?? {},
    ),
    [hypothesis, setHypothesis] = useState(previous?.hypothesis ?? ""),
    [refutation, setRefutation] = useState(previous?.refutation ?? ""),
    [sideEffect, setSideEffect] = useState(previous?.sideEffect ?? ""),
    [verdict, setVerdict] = useState<ReviewModel["verdict"]>(
      previous?.verdict ?? "保留",
    );
  if (!data) return null;
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">06 / REVIEW</span>
        <h1>勝敗と、判断を分ける。</h1>
        <p>良い判断で負ける日もあります。結果だけで基準を変えません。</p>
      </div>
      <section className="card">
        <div className="section-head">
          <h2>本日の収支</h2>
          <span className="tag">
            {data.day.ended ? "終了済み" : "巡回継続可"}
          </span>
        </div>
        <div className="live-stats">
          <div>
            <small>総投資</small>
            <strong>¥{data.day.dailyInvestment.toLocaleString()}</strong>
          </div>
          <div>
            <small>回収額</small>
            <strong>
              {previous
                ? `¥${previous.returnYen.toLocaleString()}`
                : "保存時に集計"}
            </strong>
          </div>
          <div>
            <small>損益</small>
            <strong>
              {previous
                ? `${previous.profitLoss >= 0 ? "+" : ""}¥${previous.profitLoss.toLocaleString()}`
                : "—"}
            </strong>
          </div>
        </div>
        <p className="fine">候補なし・総投資¥0の1日も正常に終了できます。</p>
      </section>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await run(() =>
            repository.saveReview(data.day.id, {
              returnYen: 0,
              quality,
              hypothesis,
              refutation,
              sideEffect,
              verdict,
            }),
          );
          if (result) setSaved(true);
        }}
      >
        <fieldset disabled={busy}>
          <section className="card">
            <h2>意思決定の質</h2>
            <div className="review-grid">
              {questions.map((q) => (
                <label className="field" key={q}>
                  {q}
                  <select
                    aria-label={q}
                    value={quality[q] ?? "未評価"}
                    onChange={(e) =>
                      setQuality({ ...quality, [q]: e.target.value })
                    }
                  >
                    <option>未評価</option>
                    <option>適切だった</option>
                    <option>確認・改善が必要</option>
                    <option>該当なし</option>
                  </select>
                </label>
              ))}
            </div>
          </section>
          <section className="card">
            <h2>改善案を、順番に検討</h2>
            <div className="form-stack">
              <label className="field">
                仮説
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="どの判断を、なぜ改善したい？"
                />
              </label>
              <label className="field">
                反証
                <textarea
                  value={refutation}
                  onChange={(e) => setRefutation(e.target.value)}
                  placeholder="確率のブレ・入力ミス・確認不足ではない？"
                />
              </label>
              <label className="field">
                副作用
                <textarea
                  value={sideEffect}
                  onChange={(e) => setSideEffect(e.target.value)}
                  placeholder="他の判断を悪化させない？"
                />
              </label>
              <label className="field">
                最終評価
                <select
                  value={verdict}
                  onChange={(e) =>
                    setVerdict(e.target.value as ReviewModel["verdict"])
                  }
                >
                  <option>採用</option>
                  <option>保留</option>
                  <option>却下</option>
                </select>
              </label>
            </div>
          </section>
          <button className="primary wide">REVIEWを保存 →</button>
          {saved && (
            <p role="status" className="success">
              REVIEWを保存しました。
            </p>
          )}
        </fieldset>
      </form>
      {!data.day.ended && !data.live && (
        <div className="button-row">
          <Link className="button" to="/patrol">
            巡回へ戻る
          </Link>
          <button
            disabled={busy}
            onClick={() => run(() => repository.finishDay(data.day.id))}
          >
            今日を終了
          </button>
        </div>
      )}
      <Link className="button wide" to="/">
        TODAYへ →
      </Link>
    </>
  );
}
