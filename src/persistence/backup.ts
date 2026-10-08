import { z } from "zod";
import type { HallDB } from "./db";
import { VERSIONS } from "../models/types";
import { getSpec } from "../machine-specs/registry";
import { decide } from "../engine/decision";
import type { MachineState } from "../models/types";
import { researchSchema } from "./research";

const text = z.string().max(10000),
  id = z.string().min(1).max(200);
const money = z.number().int().min(0).max(30000);
const version = {
  schemaVersion: z.literal(2),
  rulesVersion: text,
  machineSpecVersion: text,
};
const context = z.object({
  exchange: z.enum(["equivalent", "5.6", "unknown"]),
  funding: z.enum(["cash", "medals", "unknown"]),
  budgetRisk: z.enum(["acceptable", "unsafe", "unknown"]),
  timeRisk: z.enum(["acceptable", "unsafe", "unknown"]),
  closingTime: text,
  sourceChecked: z.boolean(),
});
const evidence = z.object({
  id,
  field: text,
  value: text,
  acquisition: z.enum([
    "direct",
    "history_verified",
    "self_observed",
    "imported",
    "inferred",
    "unknown",
    "unrecoverable",
  ]),
  verification: z.enum([
    "confirmed",
    "strongly_supported",
    "possible",
    "unknown",
    "contradicted",
  ]),
  observedAt: text,
  source: text,
});
const route = z.object({
  id,
  label: text,
  eligible: z.boolean(),
  evYen: z.number().finite().nullable(),
  basis: text,
  goal: text,
  resetOnly: z.boolean().optional(),
  missingSource: text.optional(),
  sourceThresholdMet: z.boolean().optional(),
});
const decision = z.object({
  grade: z.enum(["A", "B", "C", "D"]),
  reasons: z.array(text),
  action: text,
  routes: z.array(route),
  selectedRoute: route.nullable(),
  nextBestCheck: z
    .object({
      field: text,
      question: text,
      whereToLook: text,
      expectedImpact: text,
      fallback: z.literal("B"),
    })
    .optional(),
});
const stateSchema = z.object({
  ...version,
  id,
  dailyId: id,
  visitId: id,
  meta: z.object({ machineId: id, machineName: text, seat: text }),
  raw: z.record(z.string(), z.unknown()),
  evidence: z.array(evidence),
  resolvedState: z.record(z.string(), z.unknown()),
  derived: z.record(z.string(), z.unknown()),
  session: z.object({
    attemptId: id,
    checkUsed: z.boolean(),
    revision: z.number().int().min(0),
  }),
  decision: decision.nullable(),
  live: id.nullable(),
  snapshots: z.array(id),
  context,
});
const daySchema = z.object({
  ...version,
  id,
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dailyInvestment: money,
  maxDailyInvestment: z.literal(30000),
  visits: z.array(id),
  activeLiveSessionId: id.nullable(),
  ended: z.boolean(),
  researchOverrides: z.array(researchSchema).max(30).optional(),
});
const schemas = {
  days: daySchema,
  visits: z.object({
    ...version,
    id,
    dailyId: id,
    storeName: text,
    startedAt: text,
    endedAt: text.nullable(),
  }),
  machines: stateSchema,
  entries: z.object({
    ...version,
    id,
    machineStateId: id,
    dailyId: id,
    createdAt: text,
    state: stateSchema,
    decision,
  }),
  decisions: z.object({
    ...version,
    id,
    machineStateId: id,
    createdAt: text,
    revision: z.number().int().min(0),
    decision,
  }),
  lives: z.object({
    ...version,
    id,
    dailyId: id,
    machineStateId: id,
    entrySnapshotId: id,
    startedAt: text,
    endedAt: text.nullable(),
    status: z.enum(["active", "ended"]),
    investment: money,
    returnYen: z.number().int().min(0),
    phase: text,
    entryBasisActive: z.boolean(),
    decision,
  }),
  events: z.object({
    ...version,
    id,
    liveSessionId: id,
    createdAt: text,
    type: text,
    payload: z.record(z.string(), z.unknown()),
  }),
  reviews: z.object({
    ...version,
    id,
    dailyId: id,
    createdAt: text,
    returnYen: z.number().int().min(0),
    profitLoss: z.number().int(),
    quality: z.record(z.string(), text),
    hypothesis: text,
    refutation: text,
    sideEffect: text,
    verdict: z.enum(["採用", "保留", "却下"]),
  }),
};
type TableName = keyof typeof schemas;
export const tableNames = Object.keys(schemas) as TableName[];
const backupSchema = z.object({
  format: z.literal("hall-scan-backup"),
  backupVersion: z.literal(1),
  schemaVersion: z.literal(VERSIONS.schemaVersion),
  exportedAt: text,
  tables: z.object({
    days: z.array(schemas.days),
    visits: z.array(schemas.visits),
    machines: z.array(schemas.machines),
    entries: z.array(schemas.entries),
    decisions: z.array(schemas.decisions),
    lives: z.array(schemas.lives),
    events: z.array(schemas.events),
    reviews: z.array(schemas.reviews),
  }),
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(json: string): Backup {
  if (json.length > 25_000_000) throw Error("バックアップは25MBまでです。");
  let b: Backup;
  try {
    b = backupSchema.parse(JSON.parse(json));
  } catch {
    throw Error(
      "HALL SCANの対応バックアップではありません。形式・保存版を確認してください。",
    );
  }
  for (const name of tableNames) {
    const rows = b.tables[name];
    if (
      rows.length > 50000 ||
      new Set(rows.map((r) => r.id)).size !== rows.length
    )
      throw Error("件数上限または重複IDの不正があります。");
  }
  const days = new Map(b.tables.days.map((d) => [d.id, d]));
  const visits = new Map(b.tables.visits.map((v) => [v.id, v]));
  const machines = new Map(b.tables.machines.map((m) => [m.id, m]));
  const entries = new Map(b.tables.entries.map((e) => [e.id, e]));
  const lives = new Map(b.tables.lives.map((l) => [l.id, l]));
  const require = (ok: unknown) => {
    if (!ok)
      throw Error("記録同士の参照や投資額が一致しません。復元を中止しました。");
  };
  const businessDates = b.tables.days.map((d) => d.businessDate);
  require(new Set(businessDates).size === businessDates.length);
  for (const v of visits.values())
    require(days.has(v.dailyId) && days.get(v.dailyId)!.visits.includes(v.id));
  for (const m of machines.values()) {
    require(
      visits.get(m.visitId)?.dailyId === m.dailyId && days.has(m.dailyId),
    );
    const spec = getSpec(m.meta.machineId);
    spec.parse(m.raw);
    for (const eid of m.snapshots)
      require(entries.get(eid)?.machineStateId === m.id);
    if (m.live)
      require(
        lives.get(m.live)?.machineStateId === m.id &&
          lives.get(m.live)?.status === "active",
      );
  }
  for (const e of entries.values()) {
    require(
      machines.get(e.machineStateId)?.dailyId === e.dailyId &&
        e.state.id === e.machineStateId &&
        e.state.dailyId === e.dailyId,
    );
    const spec = getSpec(e.state.meta.machineId);
    spec.parse(e.state.raw);
    const atEntry = {
      ...e.state,
      resolvedState: spec.resolve(e.state.raw, e.state.evidence),
    } as MachineState;
    require(e.decision.grade === "A" && decide(spec, atEntry, 0).grade === "A");
  }
  for (const l of lives.values()) {
    require(
      machines.get(l.machineStateId)?.dailyId === l.dailyId &&
        entries.get(l.entrySnapshotId)?.machineStateId === l.machineStateId,
    );
    if (l.status === "active")
      require(
        !l.endedAt &&
          days.get(l.dailyId)?.activeLiveSessionId === l.id &&
          machines.get(l.machineStateId)?.live === l.id,
      );
    else require(l.endedAt !== null);
  }
  require(b.tables.lives.filter((l) => l.status === "active").length <= 1);
  for (const d of days.values()) {
    for (const r of d.researchOverrides ?? []) {
      require(r.businessDate === d.businessDate);
      r.installedMachineIds.forEach(getSpec);
    }
    require(d.visits.every((vid) => visits.get(vid)?.dailyId === d.id));
    require(
      b.tables.lives
        .filter((l) => l.dailyId === d.id)
        .reduce((sum, l) => sum + l.investment, 0) === d.dailyInvestment,
    );
    if (d.activeLiveSessionId)
      require(
        !d.ended &&
          lives.get(d.activeLiveSessionId)?.dailyId === d.id &&
          lives.get(d.activeLiveSessionId)?.status === "active",
      );
  }
  for (const e of b.tables.events) require(lives.has(e.liveSessionId));
  for (const d of b.tables.decisions) require(machines.has(d.machineStateId));
  for (const r of b.tables.reviews) require(days.has(r.dailyId));
  return b;
}
export async function exportBackup(db: HallDB) {
  return db.transaction("r", db.tables, async () => {
    const tables: Record<string, unknown> = {};
    for (const name of tableNames)
      tables[name] = await db.table(name).toArray();
    return JSON.stringify(
      {
        format: "hall-scan-backup",
        backupVersion: 1,
        schemaVersion: VERSIONS.schemaVersion,
        exportedAt: new Date().toISOString(),
        tables,
      },
      null,
      2,
    );
  });
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export async function importBackup(db: HallDB, json: string) {
  const b = parseBackup(json);
  return db.transaction("rw", db.tables, async () => {
    if (await db.lives.where("status").equals("active").count())
      throw Error("LIVE中は復元できません。実戦終了後に操作してください。");
    let count = 0;
    for (const name of tableNames)
      for (const row of b.tables[name]) {
        const existing = await db.table(name).get(row.id);
        if (existing && canonical(existing) !== canonical(row)) {
          const blankDay =
            name === "days" &&
            existing.dailyInvestment === 0 &&
            existing.visits.length === 0 &&
            !existing.ended &&
            !existing.activeLiveSessionId &&
            existing.businessDate ===
              (row as z.infer<typeof daySchema>).businessDate;
          if (!blankDay)
            throw Error(
              "同じIDの異なる記録があります。既存記録を上書きせず復元を中止しました。",
            );
        }
        if (!existing || canonical(existing) !== canonical(row)) {
          await db.table(name).put(row);
          count++;
        }
      }
    // Imported active state must be the only active session after merging histories.
    if ((await db.lives.where("status").equals("active").count()) > 1)
      throw Error("進行中の実戦が重複するため復元できません。");
    return count;
  });
}
