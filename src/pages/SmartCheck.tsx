import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
import { getSpec } from "../machine-specs/registry";
import type { MachineState } from "../models/types";
import { Field, ContextFields, EvidenceFields } from "../components/Fields";
import { DecisionCard } from "../components/DecisionCard";
import { id as makeId, now } from "../engine/state/snapshots";
export function SmartCheck() {
  const { id } = useParams(),
    { data } = useSession();
  const m = data?.machines.find((m) => m.id === id);
  if (!m)
    return (
      <p>
        台記録が見つかりません。<Link to="/patrol">巡回へ</Link>
      </p>
    );
  return <CheckForm key={m.id} machine={m} />;
}
function CheckForm({ machine: m }: { machine: MachineState }) {
  const spec = getSpec(m.meta.machineId),
    { run, busy, data } = useSession(),
    navigate = useNavigate();
  const [raw, setRaw] = useState(m.raw),
    [context, setContext] = useState(m.context),
    [evidence, setEvidence] = useState(m.evidence),
    [seat, setSeat] = useState(m.meta.seat),
    [dirty, setDirty] = useState(false);
  const decision = dirty ? null : m.decision,
    check = decision?.nextBestCheck;
  const locked = !!m.live || !!data?.day.ended;
  async function saveAndJudge(complete = false) {
    const updatedEvidence = [
      ...evidence,
      {
        id: makeId(),
        field: "resetVerification",
        value: String(raw.resetVerification),
        acquisition: "direct" as const,
        verification: raw.resetVerification as "unknown",
        observedAt: now(),
        source: "ユーザーがリセット根拠を確認",
      },
    ];
    const result = await run(async () => {
      await repository.saveMachine(m.id, raw, context, updatedEvidence, seat);
      return repository.judge(m.id, { completeCheck: complete });
    });
    if (result) {
      setDirty(false);
      setEvidence(result.evidence);
    }
  }
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">03 / SMART CHECK</span>
        <h1>根拠をそろえる</h1>
        <p>{spec.name} · 不明は空欄のまま。推測する必要はありません。</p>
      </div>
      {locked ? (
        <section className="card">
          <p>{m.live ? "この台はLIVE中です。" : "この日は終了しています。"}</p>
          <Link to={m.live ? "/live" : "/review"} className="button primary">
            記録を見る →
          </Link>
        </section>
      ) : (
        <>
          {decision && <DecisionCard decision={decision} />}{" "}
          {check ? (
            <section className="card check-card">
              <span className="eyebrow">ONE BEST CHECK</span>
              <h2>{check.question}</h2>
              <p>{check.whereToLook}</p>
              <p className="fine">
                {check.expectedImpact}{" "}
                確認不能ならB。同じ試行では追加Cを出しません。
              </p>
              {spec.fields.some((f) => f.key === check.field) ? (
                <Field
                  field={spec.fields.find((f) => f.key === check.field)!}
                  value={raw[check.field]}
                  onChange={(v) => setRaw({ ...raw, [check.field]: v })}
                />
              ) : (
                <ContextFields
                  value={context}
                  onChange={setContext}
                  only={check.field}
                />
              )}
              <div className="button-row">
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => saveAndJudge(true)}
                >
                  1項目を確認して再判定
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() => repository.judge(m.id, { unavailable: true }))
                  }
                >
                  確認できない → B
                </button>
              </div>
            </section>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveAndJudge();
              }}
            >
              <fieldset disabled={busy}>
                <section className="card">
                  <div className="section-head">
                    <h2>台の表示・履歴</h2>
                    <span className="tag">4 COUNTERS</span>
                  </div>
                  <label className="field">
                    台番号
                    <input
                      aria-label="台番号"
                      value={seat}
                      onChange={(e) => {
                        setSeat(e.target.value);
                        setDirty(true);
                      }}
                    />
                  </label>
                  <div className="form-grid">
                    {spec.fields.map((f) => (
                      <Field
                        key={f.key}
                        field={f}
                        value={raw[f.key]}
                        onChange={(v) => {
                          setRaw({ ...raw, [f.key]: v });
                          setDirty(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
                <details className="card">
                  <summary>PUSH・スポットライトの証拠</summary>
                  <p className="fine">
                    表示の記録です。判定の主根拠や追加EVにはしません。
                  </p>
                  <EvidenceFields
                    fields={spec.evidenceFields}
                    value={evidence}
                    onChange={(e) => {
                      setEvidence(e);
                      setDirty(true);
                    }}
                  />
                </details>
                <section className="card">
                  <h2>交換・資金・残り時間</h2>
                  <p className="fine">
                    残り軍資金 ¥
                    {(
                      30000 - (data?.day.dailyInvestment ?? 0)
                    ).toLocaleString()}
                    。情報が足りない場合は見送ります。
                  </p>
                  <ContextFields
                    value={context}
                    onChange={(c) => {
                      setContext(c);
                      setDirty(true);
                    }}
                  />
                </section>
                <button className="primary wide" type="submit">
                  保存して判定する →
                </button>
              </fieldset>
            </form>
          )}
          {decision && (
            <>
              <details className="card">
                <summary>評価したルート・計算条件</summary>
                <p className="fine">
                  各EVは独立した参考値。足し算しません。表の下限行を採用し、補間しません。
                </p>
                {decision.routes.map((r) => (
                  <div className="route" key={r.id}>
                    <strong>{r.label}</strong>
                    <span>
                      {r.evYen === null
                        ? "定量値不明"
                        : `${r.evYen >= 0 ? "+" : ""}¥${r.evYen.toLocaleString()}`}
                    </span>
                    <p>{r.basis}</p>
                    <small>
                      {r.eligible ? "正式候補ライン内" : "正式候補ライン外"}
                      {r.missingSource && ` · ${r.missingSource}`}
                    </small>
                  </div>
                ))}
              </details>
              {decision.grade === "A" && (
                <button
                  className="primary wide"
                  disabled={busy}
                  onClick={async () => {
                    const live = await run(() => repository.startLive(m.id));
                    if (live) navigate("/live");
                  }}
                >
                  A判定でLIVEを開始 →
                </button>
              )}
              <Link className="button wide" to="/patrol">
                巡回に戻る →
              </Link>
            </>
          )}
        </>
      )}
    </>
  );
}
