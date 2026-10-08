import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
import { getSpec } from "../machine-specs/registry";
import type { EntrySnapshot, MachineState, LiveSession } from "../models/types";
import { DecisionCard } from "../components/DecisionCard";
import { Field, ContextFields, EvidenceFields } from "../components/Fields";
export function Live() {
  const { data } = useSession();
  const live = data?.live,
    m = data?.machines.find((m) => m.id === live?.machineStateId);
  if (!live || !m)
    return (
      <>
        <div className="page-heading compact">
          <span className="eyebrow">05 / LIVE SESSION</span>
          <h1>進行中の実戦なし</h1>
          <p>SMART CHECKでAになった台だけ、実戦を始められます。</p>
        </div>
        <Link className="button primary" to="/patrol">
          候補を探す →
        </Link>
      </>
    );
  return <LiveForm key={live.id} live={live} machine={m} />;
}
function LiveForm({
  live,
  machine: m,
}: {
  live: LiveSession;
  machine: MachineState;
}) {
  const { data, run, busy } = useSession(),
    spec = getSpec(m.meta.machineId),
    navigate = useNavigate();
  const [amount, setAmount] = useState("1000"),
    [returnYen, setReturnYen] = useState("0"),
    [type, setType] = useState(spec.events[0].type),
    [raw, setRaw] = useState(m.raw),
    [note, setNote] = useState(""),
    [evidence, setEvidence] = useState(m.evidence),
    [context, setContext] = useState(m.context),
    [entry, setEntry] = useState<EntrySnapshot | null>(null);
  useEffect(() => {
    repository.getEntry(live.entrySnapshotId).then(setEntry);
  }, [live.entrySnapshotId]);
  useEffect(() => {
    setRaw(m.raw);
  }, [m.session.revision]);
  const event = spec.events.find((e) => e.type === type)!;
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow live-dot">05 / LIVE SESSION</span>
        <h1>{spec.name}</h1>
        <p>{m.meta.seat} · 着席時の根拠を保持して、状態変化で再判定。</p>
      </div>
      <div className="live-stats">
        <div>
          <small>当日総投資</small>
          <strong>¥{data?.day.dailyInvestment.toLocaleString()}</strong>
        </div>
        <div>
          <small>この実戦の投資</small>
          <strong>¥{live.investment.toLocaleString()}</strong>
        </div>
        <div>
          <small>残り軍資金</small>
          <strong>
            ¥{(30000 - (data?.day.dailyInvestment ?? 0)).toLocaleString()}
          </strong>
        </div>
      </div>
      <DecisionCard decision={live.decision} />
      <div className="two-columns">
        <section className="card">
          <h2>追加投資</h2>
          <form
            className="inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              await run(() =>
                repository.addInvestment(live.id, Number(amount)),
              );
            }}
          >
            <label className="field">
              追加投資額（円）
              <input
                type="number"
                aria-label="追加投資額"
                min="1"
                step="1"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <button disabled={busy || live.decision.grade !== "A"}>
              投資を記録
            </button>
          </form>
          <p className="fine">
            30,000円を超える投資は保存できません。既投資額はサンクコスト。
          </p>
        </section>
        <section className="card">
          <h2>現在のカウンタ</h2>
          <dl className="metric-list">
            {spec.fields
              .filter((f) => f.kind === "number")
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>
                    {m.raw[f.key] === null ? "不明" : String(m.raw[f.key])}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      </div>
      <section className="card">
        <h2>状態更新 → 再判定</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = event.fields
              ? Object.fromEntries(
                  (event.fields ?? []).map((f) => [f.key, raw[f.key]]),
                )
              : type === "loss_note"
                ? { note }
                : {};
            await run(() =>
              repository.liveEvent(live.id, type, payload, evidence, context),
            );
          }}
        >
          <fieldset disabled={busy}>
            <label className="field">
              実機のイベント
              <select
                aria-label="実機のイベント"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {spec.events.map((e) => (
                  <option key={e.type} value={e.type}>
                    {e.label}
                  </option>
                ))}
              </select>
              <small>{event.help}</small>
            </label>
            {event.fields && (
              <div className="form-grid">
                {event.fields.map((f) => (
                  <Field
                    key={f.key}
                    field={f}
                    value={raw[f.key]}
                    onChange={(v) => setRaw({ ...raw, [f.key]: v })}
                  />
                ))}
              </div>
            )}
            {type === "loss_note" && (
              <label className="field">
                メモ
                <input
                  aria-label="負け・ハマリのメモ"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                />
              </label>
            )}
            <details>
              <summary>表示の証拠・資金／閉店条件の更新</summary>
              <EvidenceFields
                fields={spec.evidenceFields}
                value={evidence}
                onChange={setEvidence}
              />
              <ContextFields value={context} onChange={setContext} />
            </details>
            <button className="primary wide">記録して再判定 →</button>
          </fieldset>
        </form>
      </section>
      <details className="card">
        <summary>着席時の根拠（変更不可）</summary>
        {entry && (
          <>
            <p>
              {new Date(entry.createdAt).toLocaleString("ja-JP")} ·{" "}
              {entry.decision.selectedRoute?.label}
            </p>
            <DecisionCard decision={entry.decision} />
            <dl className="metric-list">
              {spec.fields
                .filter((f) => f.kind === "number")
                .map((f) => (
                  <div key={f.key}>
                    <dt>{f.label}</dt>
                    <dd>
                      {entry.state.raw[f.key] === null
                        ? "不明"
                        : String(entry.state.raw[f.key])}
                    </dd>
                  </div>
                ))}
            </dl>
          </>
        )}
      </details>
      <details className="card">
        <summary>実戦のイベント履歴</summary>
        {data?.events.map((e) => (
          <div className="list-row" key={e.id}>
            <small>{new Date(e.createdAt).toLocaleTimeString("ja-JP")}</small>
            <span>
              {spec.events.find((d) => d.type === e.type)?.label ?? "投資"}
            </span>
          </div>
        ))}
      </details>
      <section className="card subtle">
        <h2>この実戦を終了</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const done = await run(async () => {
              await repository.finishLive(live.id, Number(returnYen));
              return true;
            });
            if (done) navigate("/review");
          }}
        >
          <label className="field">
            回収額（円）
            <input
              type="number"
              aria-label="回収額"
              min="0"
              step="1"
              inputMode="numeric"
              value={returnYen}
              onChange={(e) => setReturnYen(e.target.value)}
              required
            />
          </label>
          <button disabled={busy}>終了してREVIEWへ →</button>
        </form>
      </section>
    </>
  );
}
