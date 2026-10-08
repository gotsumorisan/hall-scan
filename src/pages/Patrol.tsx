import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
import { specs, getSpec } from "../machine-specs/registry";
export const patrolLabels = {
  skip: "見送り目安",
  watch: "観察",
  candidate: "相談候補",
  needs_judgment: "要確認",
};
export function Patrol() {
  const { data, run, busy } = useSession(),
    navigate = useNavigate(),
    [seat, setSeat] = useState("");
  if (!data) return null;
  const visit = data.visits.find((v) => !v.endedAt);
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">01 / PATROL</span>
        <h1>ホールを巡回</h1>
        <p>候補は「相談する台」。実戦許可はSMART CHECKで。</p>
      </div>
      <div className="notice blue">
        巡回ではA / B / C / Dの最終判定を出しません。
      </div>
      {!visit ? (
        <section className="card">
          <p>まずTODAYで店舗を記録してください。</p>
          <Link className="button primary" to="/">
            TODAYへ →
          </Link>
        </section>
      ) : data.live ? (
        <section className="card">
          <p>進行中のLIVEがあります。</p>
          <Link className="button primary" to="/live">
            LIVEへ →
          </Link>
        </section>
      ) : data.day.ended ? (
        <div className="notice">本日の巡回は終了しました。</div>
      ) : (
        <>
          {specs.map((spec) => (
            <section className="card machine-card" key={spec.id}>
              <div className="machine-art" aria-hidden="true">
                <div className="orbit" />
                <span>
                  KC<span>2</span>
                </span>
                <small>MACHINE SPEC / 001</small>
              </div>
              <div className="machine-summary">
                <span className="tag purple">実装済み · SMART SLOT</span>
                <h2>{spec.name}</h2>
                <p>{spec.guide.screening}</p>
                <div className="metric-tags">
                  <span>液晶G</span>
                  <span>女神間 実G</span>
                  <span>AT間 実G</span>
                  <span>女神スルー</span>
                </div>
                <label className="field">
                  台番号（任意）
                  <input
                    aria-label="台番号"
                    inputMode="numeric"
                    placeholder="例：128"
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                  />
                </label>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    const m = await run(() =>
                      repository.createMachine(
                        data.day.id,
                        visit.id,
                        spec.id,
                        seat,
                      ),
                    );
                    if (m) navigate(`/machine/${m.id}/quick`);
                  }}
                >
                  見る場所を確認 →
                </button>
              </div>
            </section>
          ))}
        </>
      )}
      <section className="card subtle">
        <h2>巡回メモ</h2>
        {data.machines.length === 0 ? (
          <p className="muted">確認した台がここに残ります。</p>
        ) : (
          data.machines.map((m) => (
            <Link className="list-row" to={`/machine/${m.id}/quick`} key={m.id}>
              <div>
                <strong>{m.meta.machineName}</strong>
                <small>{m.meta.seat}</small>
              </div>
              <span
                className={`patrol-tag ${getSpec(m.meta.machineId).patrol(m.raw)}`}
              >
                {patrolLabels[getSpec(m.meta.machineId).patrol(m.raw)]}
              </span>
              <span>→</span>
            </Link>
          ))
        )}
      </section>
      <p className="fine">
        残り9機種は次の段階で追加します。前作の数値を流用しません。
      </p>
    </>
  );
}
export function Candidates() {
  const { data } = useSession();
  if (!data) return null;
  const candidates = data.machines.filter(
    (m) => getSpec(m.meta.machineId).patrol(m.raw) === "candidate",
  );
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">CANDIDATE NOTES</span>
        <h1>相談候補</h1>
        <p>条件を満たしていても、着席にはA判定が必要です。</p>
      </div>
      <section className="card">
        {candidates.length ? (
          candidates.map((m) => (
            <Link className="list-row" key={m.id} to={`/machine/${m.id}/check`}>
              <div>
                <strong>{m.meta.machineName}</strong>
                <small>{m.meta.seat}</small>
              </div>
              <span className="patrol-tag candidate">相談候補</span>
              <span>→</span>
            </Link>
          ))
        ) : (
          <>
            <h2>今の候補はありません</h2>
            <p>十分な根拠がなければ、見送って大丈夫。</p>
            <Link className="button" to="/patrol">
              巡回に戻る →
            </Link>
          </>
        )}
      </section>
    </>
  );
}
