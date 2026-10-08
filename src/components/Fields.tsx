import type { InputField, Context, Evidence } from "../models/types";
import { id, now } from "../engine/state/snapshots";
export function Field({
  field,
  value,
  onChange,
}: {
  field: InputField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <label className="field">
      <span>{field.label}</span>
      {field.kind === "number" ? (
        <input
          aria-label={field.label}
          type="number"
          min="0"
          step="1"
          max={field.max ?? 100000}
          inputMode="numeric"
          placeholder="不明"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      ) : (
        <select
          aria-label={field.label}
          value={String(value ?? "unknown")}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {(
                {
                  confirmed: "根拠を確認済み",
                  possible: "可能性あり",
                  contradicted: "該当しないことを確認",
                  unknown: "不明",
                } as Record<string, string>
              )[o.label] ?? o.label}
            </option>
          ))}
        </select>
      )}
      <small>{field.help}</small>
    </label>
  );
}
export function ContextFields({
  value,
  onChange,
  only,
}: {
  value: Context;
  onChange: (c: Context) => void;
  only?: string;
}) {
  const show = (key: string) => !only || key === only;
  return (
    <div className="form-stack">
      {show("exchange") && (
        <label className="field">
          交換条件
          <select
            aria-label="交換条件"
            value={value.exchange}
            onChange={(e) =>
              onChange({
                ...value,
                exchange: e.target.value as Context["exchange"],
              })
            }
          >
            <option value="unknown">不明</option>
            <option value="equivalent">等価（20円）</option>
            <option value="5.6">5.6枚交換</option>
          </select>
        </label>
      )}
      {show("funding") && (
        <label className="field">
          投資方法
          <select
            aria-label="投資方法"
            value={value.funding}
            onChange={(e) =>
              onChange({
                ...value,
                funding: e.target.value as Context["funding"],
              })
            }
          >
            <option value="unknown">不明</option>
            <option value="cash">現金</option>
            <option value="medals">持ちメダル</option>
          </select>
        </label>
      )}
      {show("budgetRisk") && (
        <label className="field">
          資金リスク
          <select
            aria-label="資金リスク"
            value={value.budgetRisk}
            onChange={(e) =>
              onChange({
                ...value,
                budgetRisk: e.target.value as Context["budgetRisk"],
              })
            }
          >
            <option value="unknown">必要投資の見込みは不明</option>
            <option value="acceptable">残り資金と必要投資を照合済み</option>
            <option value="unsafe">資金切れリスクが大きい</option>
          </select>
          <small>
            平均追加投資・深い場合の必要額を確認。分からなければ不明。
          </small>
        </label>
      )}
      {show("timeRisk") && (
        <>
          <label className="field">
            閉店時刻
            <input
              aria-label="閉店時刻"
              type="time"
              value={value.closingTime}
              onChange={(e) =>
                onChange({ ...value, closingTime: e.target.value })
              }
            />
          </label>
          <label className="field">
            取り切れリスク
            <select
              aria-label="取り切れリスク"
              value={value.timeRisk}
              onChange={(e) =>
                onChange({
                  ...value,
                  timeRisk: e.target.value as Context["timeRisk"],
                })
              }
            >
              <option value="unknown">不明</option>
              <option value="acceptable">AT・上位ルートを含め確認済み</option>
              <option value="unsafe">取り切れないリスクが大きい</option>
            </select>
            <small>
              固定の時間閾値はありません。残り営業時間と状態を照合。
            </small>
          </label>
        </>
      )}
      {show("sourceChecked") && (
        <label className="check">
          <input
            type="checkbox"
            checked={value.sourceChecked}
            onChange={(e) =>
              onChange({ ...value, sourceChecked: e.target.checked })
            }
          />
          当日の解析更新・計算前提を確認した
        </label>
      )}
    </div>
  );
}
export function EvidenceFields({
  fields,
  value,
  onChange,
}: {
  fields: InputField[];
  value: Evidence[];
  onChange: (e: Evidence[]) => void;
}) {
  return (
    <div className="form-stack">
      {fields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={value.findLast((e) => e.field === f.key)?.value ?? "不明"}
          onChange={(v) =>
            onChange([
              ...value,
              {
                id: id(),
                field: f.key,
                value: String(v),
                acquisition: v === "不明" ? "unknown" : "direct",
                verification: v === "不明" ? "unknown" : "confirmed",
                observedAt: now(),
                source: "実機の表示を直接確認",
              },
            ])
          }
        />
      ))}
    </div>
  );
}
