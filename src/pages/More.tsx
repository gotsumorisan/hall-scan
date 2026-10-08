import { Link } from "react-router-dom";
import { specs } from "../machine-specs/registry";
export function More() {
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">ABOUT YOUR NOTES</span>
        <h1>使い方・出典</h1>
        <p>不明な情報を埋めず、根拠をそのまま残す。</p>
      </div>
      <section className="card">
        <h2>判定の読み方</h2>
        <div className="grade-guide">
          {[
            ["A", "打つ / 続行。唯一の実戦許可。"],
            ["B", "見送る。利益水準・確信度が不足。"],
            ["C", "追加確認は1項目だけ。確認できなければB。"],
            ["D", "打たない。根拠なし・上限・過大なリスク。"],
          ].map(([grade, text]) => (
            <div key={grade}>
              <span className={`grade-chip grade-${grade}`}>{grade}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>出典と数値の扱い</h2>
        {specs.map((s) => (
          <p key={s.id}>
            {s.name}：{s.source}
          </p>
        ))}
        <p>
          EVは添付資料の第三者シミュレーション（信頼度C）。正式候補ラインを採用し、交換率・投資方法の列を分けます。複数ルートを合算しません。
        </p>
        <p>
          最新解析の自動取得はありません。実戦当日の解析・店舗条件と照合してから判定してください。
        </p>
        <p className="fine">
          不足：非等価の女神スルーEV、モード示唆の金額、128G引き戻し単独EV、資金切れ確率・消化時間分布。TODO_NEEDS_SOURCE。
        </p>
      </section>
      <section className="card">
        <h2>保存とPWA</h2>
        <p>
          IndexedDBに当日・店舗・台・判定・着席根拠・LIVE・イベント・REVIEWを保存。再読み込みしても実戦を復元します。
        </p>
        <p>
          Safariの共有メニューから「ホーム画面に追加」。初回読み込み後はオフラインでも利用できます。本番PWAはHTTPSで起動してください。
        </p>
        <p className="fine">
          保存はこの端末・ブラウザ内。データを消す操作やブラウザの保存領域削除で記録は失われます。
        </p>
      </section>
      <Link className="button wide" to="/review">
        REVIEWへ →
      </Link>
    </>
  );
}
