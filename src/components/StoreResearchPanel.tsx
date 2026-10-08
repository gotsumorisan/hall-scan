import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository, useSession } from "../app/SessionProvider";
import { db } from "../persistence/db";
import { saveResearch } from "../persistence/research";
import { specs } from "../machine-specs/registry";
import { id, now } from "../engine/state/snapshots";
import type { DailyResearchOverride } from "../models/types";
export function StoreResearchPanel() {
  const { data, run, busy } = useSession(),
    navigate = useNavigate();
  const [draft, setDraft] = useState<
    Omit<DailyResearchOverride, "id" | "businessDate" | "checkedAt">
  >({
    storeName: "",
    exchange: "unknown",
    closingTime: "",
    installedMachineIds: [],
    verification: "unknown",
    sourceUrl: "",
    note: "",
  });
  if (!data) return null;
  const rows = data.day.researchOverrides ?? [];
  const locked = data.day.ended;
  return (
    <section className="card">
      <h2>店舗候補を比較</h2>
      <p>
        営業時間・交換条件・設置機種を当日に確認して、巡回先を選びます。情報不足は不明のまま保存できます。
      </p>
      {rows.length === 0 && (
        <p className="muted">まだ当日の確認情報はありません。</p>
      )}
      <div className="form-stack">
        {rows.map((r) => (
          <article className="card subtle" key={r.id}>
            <div className="section-head">
              <h3>{r.storeName}</h3>
              <span className="tag blue">
                {r.verification === "confirmed" ? "出典確認済み" : "未確認"}
              </span>
            </div>
            <p>
              交換：
              {r.exchange === "unknown"
                ? "不明"
                : r.exchange === "equivalent"
                  ? "等価"
                  : "5.6枚"}{" "}
              · 閉店：{r.closingTime || "不明"}
            </p>
            <p>
              確認した設置：
              {r.installedMachineIds.length
                ? r.installedMachineIds
                    .map((key) => specs.find((s) => s.id === key)?.name ?? key)
                    .join("、")
                : "不明"}
            </p>
            <p>{r.note}</p>
            <small>
              確認日 {r.businessDate} ·{" "}
              {new Date(r.checkedAt).toLocaleTimeString("ja-JP")}
            </small>
            <div className="button-row">
              {r.sourceUrl && (
                <a
                  className="button"
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  確認先を開く
                </a>
              )}
              <button
                disabled={busy || locked || !!data.live}
                onClick={async () => {
                  const v = await run(() =>
                    repository.visit(data.day.id, r.storeName),
                  );
                  if (v) navigate("/patrol");
                }}
              >
                この店舗を巡回
              </button>
            </div>
          </article>
        ))}
      </div>
      {!locked && (
        <details>
          <summary>店舗候補・当日確認情報を追加</summary>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await run(() =>
                saveResearch(db, data.day.id, {
                  ...draft,
                  id: id(),
                  businessDate: data.day.businessDate,
                  checkedAt: now(),
                }),
              );
              if (result)
                setDraft({
                  ...draft,
                  storeName: "",
                  sourceUrl: "",
                  note: "",
                  verification: "unknown",
                  exchange: "unknown",
                  closingTime: "",
                  installedMachineIds: [],
                });
            }}
          >
            <label className="field">
              候補の店舗名
              <input
                aria-label="候補の店舗名"
                value={draft.storeName}
                maxLength={150}
                required
                onChange={(e) =>
                  setDraft({ ...draft, storeName: e.target.value })
                }
              />
            </label>
            <label className="field">
              店舗の交換条件
              <select
                aria-label="店舗の交換条件"
                value={draft.exchange}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    exchange: e.target
                      .value as DailyResearchOverride["exchange"],
                  })
                }
              >
                <option value="unknown">不明</option>
                <option value="equivalent">等価</option>
                <option value="5.6">5.6枚</option>
              </select>
            </label>
            <label className="field">
              店舗の閉店時刻
              <input
                aria-label="店舗の閉店時刻"
                type="time"
                value={draft.closingTime}
                onChange={(e) =>
                  setDraft({ ...draft, closingTime: e.target.value })
                }
              />
            </label>
            <details>
              <summary>設置を確認した機種</summary>
              {specs.map((spec) => (
                <label className="check" key={spec.id}>
                  <input
                    type="checkbox"
                    checked={draft.installedMachineIds.includes(spec.id)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        installedMachineIds: e.target.checked
                          ? [...draft.installedMachineIds, spec.id]
                          : draft.installedMachineIds.filter(
                              (key) => key !== spec.id,
                            ),
                      })
                    }
                  />
                  {spec.name}
                </label>
              ))}
            </details>
            <label className="field">
              確認した出典URL
              <input
                aria-label="確認した出典URL"
                type="url"
                placeholder="https://"
                value={draft.sourceUrl}
                maxLength={2000}
                onChange={(e) =>
                  setDraft({ ...draft, sourceUrl: e.target.value })
                }
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.verification === "confirmed"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    verification: e.target.checked ? "confirmed" : "unknown",
                  })
                }
              />
              当日の出典を開いて内容を確認した
            </label>
            <label className="field">
              調査メモ
              <textarea
                aria-label="調査メモ"
                value={draft.note}
                maxLength={2000}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </label>
            <button disabled={busy}>当日の確認情報を保存</button>
          </form>
        </details>
      )}
      <p className="fine">
        確認情報はこの営業日だけに保存します。店舗の選択や設置確認は着席許可ではありません。SMART
        CHECKでは台の条件を別に確認してください。
      </p>
    </section>
  );
}
