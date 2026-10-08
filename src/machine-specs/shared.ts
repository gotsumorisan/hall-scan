import { z } from "zod";
import type {
  InputField,
  MachineState,
  Evidence,
  EVRoute,
  EventDefinition,
} from "../models/types";
import { check } from "../engine/decision";

export function number(
  key: string,
  label: string,
  help: string,
  max = 100000,
): InputField {
  return { key, label, help, kind: "number", max };
}
export function select(
  key: string,
  label: string,
  help: string,
  values: string[],
): InputField {
  return {
    key,
    label,
    help,
    kind: "select",
    options: ["unknown", ...values].map((value) => ({
      value,
      label: value === "unknown" ? "不明" : value,
    })),
  };
}
export const resetField = select(
  "resetVerification",
  "リセット根拠",
  "朝一という理由だけで確定にしない。確定根拠がなければ不明またはpossible。",
  ["possible", "confirmed", "contradicted"],
);
export function schemaFor(fields: InputField[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields)
    shape[f.key] =
      f.kind === "number"
        ? z
            .number()
            .int()
            .min(0)
            .max(f.max ?? 100000)
            .nullable()
            .default(null)
        : z
            .enum(f.options!.map((o) => o.value) as [string, ...string[]])
            .default("unknown");
  shape.phase = z
    .enum(["normal", "at", "followup", "rebound"])
    .default("normal");
  return z.object(shape).strict();
}
export function resolveState(
  raw: Record<string, unknown>,
  evidence: Evidence[],
) {
  const e = evidence.findLast((e) => e.field === "resetVerification");
  return {
    reset:
      e?.verification === "contradicted"
        ? "contradicted"
        : raw.resetVerification,
    evidence: structuredClone(evidence),
  };
}
export interface RouteRule {
  id: string;
  label: string;
  field: string;
  threshold: [number, number];
  ceiling: number;
  resetCeiling?: number;
  goal: string;
  basis: string;
  resetOnly?: boolean;
  requires?: { field: string; value: unknown }[];
  ev?: [number, number];
}
export function routesFor(state: MachineState, rules: RouteRule[]): EVRoute[] {
  const col = state.context.exchange === "equivalent" ? 0 : 1;
  return rules.map((r) => {
    const value = state.raw[r.field];
    const specificRouteApplies = rules.some(
      (other) =>
        other !== r &&
        other.field === r.field &&
        (other.resetOnly || (other.requires?.length ?? 0) > 0) &&
        (!other.resetOnly || state.resolvedState.reset === "confirmed") &&
        (other.requires ?? []).every((c) => state.raw[c.field] === c.value),
    );
    const ceiling =
      state.resolvedState.reset === "confirmed"
        ? (r.resetCeiling ?? r.ceiling)
        : r.ceiling;
    const eligible =
      state.context.exchange !== "unknown" &&
      typeof value === "number" &&
      value >= r.threshold[col] &&
      value < ceiling &&
      !(!r.resetOnly && !r.requires?.length && specificRouteApplies) &&
      (!r.resetOnly || state.resolvedState.reset === "confirmed") &&
      (r.requires ?? []).every((c) => state.raw[c.field] === c.value);
    return {
      id: r.id,
      label: r.label,
      eligible,
      evYen: eligible && r.ev ? r.ev[col] : null,
      sourceThresholdMet: eligible && !r.ev,
      resetOnly: r.resetOnly,
      basis: r.basis,
      goal: r.goal,
    };
  });
}
export function evaluateState(
  state: MachineState,
  fields: InputField[],
  routes: EVRoute[],
  potential: boolean,
) {
  const first = fields.find((f) => f.kind === "number");
  const missing =
    first && state.raw[first.key] === null && !routes.some((r) => r.eligible)
      ? [check(first.key, `${first.label}を確認できますか？`, first.help)]
      : [];
  return {
    routes,
    missing,
    hasPotential:
      potential ||
      missing.length > 0 ||
      routes.some((r) => r.eligible || r.missingSource),
  };
}
export interface EventRule extends EventDefinition {
  set?: Record<string, unknown>;
  increment?: string[];
  basisEnded?: boolean;
}
export const commonEvents: EventRule[] = [
  {
    type: "counters",
    label: "現在の表示・履歴を更新",
    help: "表示されている独立した数値を更新。不明は空欄。",
  },
  {
    type: "loss_note",
    label: "負け・ハマリのメモ",
    help: "短期の負けだけで着席根拠を撤回しません。",
  },
  {
    type: "next_state_confirmed",
    label: "終了後の次状態を確認",
    help: "引き戻し・示唆・前兆を確認して最新表示を入力し、元の狙い終了後に再判定。",
    set: { phase: "normal" },
    basisEnded: true,
  },
];
export function applyStateEvent(
  state: MachineState,
  type: string,
  payload: Record<string, unknown>,
  schema: ReturnType<typeof schemaFor>,
  rules: EventRule[],
) {
  const rule = rules.find((r) => r.type === type);
  if (!rule) throw Error("未対応のイベントです。");
  const next = structuredClone(state);
  const raw = schema.parse(next.raw);
  if (type === "counters" || type === "next_state_confirmed")
    Object.assign(raw, schema.partial().parse(payload));
  if (type === "loss_note")
    z.object({ note: z.string().max(1000) }).parse(payload);
  Object.assign(raw, rule.set ?? {});
  for (const key of rule.increment ?? [])
    raw[key] = typeof raw[key] === "number" ? (raw[key] as number) + 1 : null;
  next.raw = schema.parse(raw);
  return {
    state: next,
    phase: String(next.raw.phase),
    basisEnded: rule.basisEnded === true,
  };
}
