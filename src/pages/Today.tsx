import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
export function Today() {
  const { data, run, busy } = useSession(),
    navigate = useNavigate(),
    [store, setStore] = useState("");
  if (!data) return null;
  const { day, visits, live } = data;
  const current = visits.find((v) => !v.endedAt);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR FIELD NOTES</span>
        <h1>
          今日の判断を、
          <br />
          <em>根拠から。</em>
        </h1>
        <p>見る。確かめる。十分な条件だけを選ぶ。</p>
      </div>
      <div className="today-grid">
        <section className="card budget-card">
          <div className="section-head">
            <h2>本日の軍資金</h2>
            <span className="tag">DAILY LIMIT</span>
          </div>
          <div className="budget-value">
            <span>残り</span>
            <strong>¥{(30000 - day.dailyInvestment).toLocaleString()}</strong>
          </div>
          <div className="budget-track">
            <div style={{ width: `${(day.dailyInvestment / 30000) * 100}%` }} />
          </div>
          <div className="split muted">
            <span>総投資 ¥{day.dailyInvestment.toLocaleString()}</span>
            <span>上限 ¥30,000</span>
          </div>
          <p className="fine">店舗を移動しても上限と投資額は引き継がれます。</p>
        </section>
        <section className="card start-card">
          <span className="eyebrow">01 / START YOUR PATROL</span>
          <h2>
            {day.ended
              ? "本日の記録は終了しました"
              : live
                ? "実戦の続きがあります"
                : current
                  ? "次の候補を探す"
                  : "まず、巡回する店舗を記録"}
          </h2>
          <p>
            {live
              ? "前回の状態と着席時の根拠を復元しました。"
              : day.ended
                ? "候補なし・投資0円も、ひとつの正しい判断。"
                : current
                  ? `${current.storeName}で巡回中。候補は相談の入り口です。`
                  : "営業時間・設置機種・交換条件は当日に確認してください。"}
          </p>
          {live ? (
            <Link className="button primary" to="/live">
              LIVEを再開 <span>→</span>
            </Link>
          ) : day.ended ? (
            <Link className="button primary" to="/review">
              REVIEWを見る →
            </Link>
          ) : current ? (
            <Link className="button primary" to="/patrol">
              巡回を始める →
            </Link>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const v = await run(() => repository.visit(day.id, store));
                if (v) navigate("/patrol");
              }}
            >
              <label className="field">
                店舗名
                <input
                  aria-label="店舗名"
                  placeholder="例：○○店"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  required
                />
              </label>
              <button className="primary" disabled={busy}>
                店舗を記録して巡回 →
              </button>
            </form>
          )}
        </section>
      </div>
      <section className="principle">
        <span className="principle-icon">◇</span>
        <div>
          <h2>打たない日も、良い判断。</h2>
          <p>
            当たり台の予言ではなく、期待値の低い行動を避けるためのノート。
            <br className="desktop" />
            実戦を始められるのは、A判定だけです。
          </p>
        </div>
      </section>
      <div className="section-head spaced">
        <h2>今日の流れ</h2>
        <span className="muted">6 STEPS</span>
      </div>
      <ol className="flow">
        <li>
          <span>01</span>
          <b>PATROL</b>
          <small>相談候補を探す</small>
        </li>
        <li>
          <span>02</span>
          <b>QUICK</b>
          <small>見る場所を確認</small>
        </li>
        <li>
          <span>03</span>
          <b>SMART CHECK</b>
          <small>根拠を分けて入力</small>
        </li>
        <li>
          <span>04</span>
          <b>A / B / C / D</b>
          <small>次の行動を決める</small>
        </li>
        <li>
          <span>05</span>
          <b>LIVE</b>
          <small>Aのみ実戦・再判定</small>
        </li>
        <li>
          <span>06</span>
          <b>REVIEW</b>
          <small>判断の質を振り返る</small>
        </li>
      </ol>
      <section className="card subtle">
        <div className="section-head">
          <h2>店舗の記録・移動</h2>
          <span className="tag">{visits.length} VISITS</span>
        </div>
        {visits.length === 0 ? (
          <p className="muted">まだ店舗の記録はありません。</p>
        ) : (
          <div className="visit-list">
            {visits.map((v) => (
              <div key={v.id}>
                <span>{v.storeName}</span>
                <small>{v.endedAt ? "巡回終了" : "巡回中"}</small>
              </div>
            ))}
          </div>
        )}
        {current && !day.ended && !live && (
          <form
            className="inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const v = await run(() => repository.visit(day.id, store));
              if (v) {
                setStore("");
                navigate("/patrol");
              }
            }}
          >
            <input
              aria-label="次の店舗名"
              placeholder="次の店舗名"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
            />
            <button disabled={busy}>店舗を移動 →</button>
          </form>
        )}
      </section>
      {!day.ended && !live && (
        <button
          className="text-button"
          disabled={busy}
          onClick={async () => {
            const done = await run(async () => {
              await repository.finishDay(day.id);
              return true;
            });
            if (done) navigate("/review");
          }}
        >
          候補なしでも、今日を終了してREVIEWへ →
        </button>
      )}
    </>
  );
}
