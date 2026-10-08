import { Link, useParams } from "react-router-dom";
import { useSession } from "../app/SessionProvider";
import { getSpec } from "../machine-specs/registry";
export function Quick() {
  const { id } = useParams(),
    { data } = useSession();
  const m = data?.machines.find((m) => m.id === id);
  if (!m)
    return (
      <p>
        台記録が見つかりません。<Link to="/patrol">巡回へ</Link>
      </p>
    );
  const spec = getSpec(m.meta.machineId);
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">02 / MACHINE QUICK</span>
        <h1>{spec.name}</h1>
        <p>{m.meta.seat} · まず、4つの情報を分けて見る。</p>
      </div>
      <div className="quick-metrics">
        {spec.fields
          .filter((f) => f.kind === "number")
          .map((f, i) => (
            <div className="card" key={f.key}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{f.label}</h2>
              <strong>
                {m.raw[f.key] === null ? "—" : String(m.raw[f.key])}
              </strong>
              <p>{f.help}</p>
            </div>
          ))}
      </div>
      <section className="card">
        <h2>相談ライン</h2>
        <p>{spec.guide.screening}</p>
        <span className="tag blue">候補 ≠ 打ってよい</span>
      </section>
      <div className="two-columns">
        <section className="card">
          <h2>天井・特殊状態</h2>
          <ul className="plain-list">
            {spec.guide.ceilings.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2>どこを見る？</h2>
          <ol className="plain-list">
            {spec.guide.where.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ol>
        </section>
      </div>
      <section className="notice">
        <h2>混同しないために</h2>
        {spec.guide.warnings.map((v) => (
          <p key={v}>{v}</p>
        ))}
      </section>
      <Link
        className="button primary wide"
        to={m.live ? "/live" : `/machine/${m.id}/check`}
      >
        {m.live ? "進行中のLIVEへ" : "SMART CHECKへ →"}
      </Link>
      <p className="fine">{spec.source}。最新情報の確認はSMART CHECKで。</p>
    </>
  );
}
