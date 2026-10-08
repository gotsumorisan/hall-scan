import type { HallDB } from "./db";
import type {
  Context,
  DailySession,
  DecisionSnapshot,
  Evidence,
  MachineState,
  Review,
  LiveSession,
} from "../models/types";
import { VERSIONS, emptyContext } from "../models/types";
import {
  businessDate,
  createEntry,
  deepFreeze,
  id,
  now,
} from "../engine/state/snapshots";
import { getSpec } from "../machine-specs/registry";
import { decide } from "../engine/decision";
import { assertCanStart, investmentAfter, reevaluate } from "../engine/live";
export class Repository {
  constructor(private db: HallDB) {}
  async ensureToday(date = businessDate()) {
    return this.db.transaction("rw", this.db.days, async () => {
      const days = await this.db.days.toArray();
      const active = days.find((d) => d.activeLiveSessionId);
      if (active) return active;
      const existing = days.find((d) => d.businessDate === date);
      if (existing) return existing;
      const day: DailySession = {
        ...VERSIONS,
        id: date,
        businessDate: date,
        dailyInvestment: 0,
        maxDailyInvestment: 30000,
        visits: [],
        activeLiveSessionId: null,
        ended: false,
      };
      await this.db.days.add(day);
      return day;
    });
  }
  async readDay(dailyId: string) {
    const day = await this.db.days.get(dailyId);
    if (!day) throw Error("当日セッションがありません。");
    const [visits, machines, live, reviews, events] = await Promise.all([
      this.db.visits.where("dailyId").equals(day.id).toArray(),
      this.db.machines.where("dailyId").equals(day.id).toArray(),
      day.activeLiveSessionId
        ? this.db.lives.get(day.activeLiveSessionId)
        : Promise.resolve(undefined),
      this.db.reviews.where("dailyId").equals(day.id).toArray(),
      this.db.events.toArray(),
    ]);
    return {
      day,
      visits,
      machines,
      live,
      reviews,
      events: events.filter((e) => e.liveSessionId === live?.id),
    };
  }
  async visit(dailyId: string, storeName: string) {
    if (!storeName.trim()) throw Error("店舗名を入力してください。");
    return this.db.transaction("rw", this.db.days, this.db.visits, async () => {
      const d = await this.requireDay(dailyId);
      if (d.ended || d.activeLiveSessionId)
        throw Error("店舗移動はLIVE終了後に行ってください。");
      for (const visitId of d.visits)
        await this.db.visits.update(visitId, { endedAt: now() });
      const visit = {
        ...VERSIONS,
        id: id(),
        dailyId,
        storeName: storeName.trim(),
        startedAt: now(),
        endedAt: null,
      };
      await this.db.visits.add(visit);
      d.visits.push(visit.id);
      await this.db.days.put(d);
      return visit;
    });
  }
  async createMachine(
    dailyId: string,
    visitId: string,
    machineId: string,
    seat: string,
  ) {
    const spec = getSpec(machineId);
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.visits,
      this.db.machines,
      async () => {
        const day = await this.requireDay(dailyId);
        const visit = await this.db.visits.get(visitId);
        if (
          day.ended ||
          day.activeLiveSessionId ||
          !visit ||
          visit.dailyId !== dailyId ||
          visit.endedAt
        )
          throw Error("巡回中の店舗が必要です。");
        const raw = spec.emptyRaw();
        const m: MachineState = {
          ...VERSIONS,
          machineSpecVersion: spec.version,
          id: id(),
          dailyId,
          visitId,
          meta: {
            machineId,
            machineName: spec.name,
            seat: seat.trim() || "台番号未入力",
          },
          raw,
          evidence: [],
          resolvedState: spec.resolve(raw, []),
          derived: spec.derive(raw),
          session: { attemptId: id(), checkUsed: false, revision: 0 },
          decision: null,
          live: null,
          snapshots: [],
          context: { ...emptyContext },
        };
        await this.db.machines.add(m);
        return m;
      },
    );
  }
  async saveMachine(
    machineId: string,
    raw: Record<string, unknown>,
    context: Context,
    evidence: Evidence[],
    seat?: string,
  ) {
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.machines,
      async () => {
        const m = await this.requireMachine(machineId);
        const day = await this.requireDay(m.dailyId);
        if (day.ended || m.live)
          throw Error("LIVE中は状態更新を利用してください。");
        const spec = getSpec(m.meta.machineId);
        m.raw = spec.parse(raw);
        m.context = context;
        m.evidence = structuredClone(evidence);
        m.resolvedState = spec.resolve(m.raw, evidence);
        m.derived = spec.derive(m.raw);
        m.session.revision++;
        m.decision = null;
        if (seat !== undefined) m.meta.seat = seat.trim() || "台番号未入力";
        await this.db.machines.put(m);
        return m;
      },
    );
  }
  async judge(
    machineId: string,
    options: { completeCheck?: boolean; unavailable?: boolean } = {},
  ) {
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.machines,
      this.db.decisions,
      this.db.entries,
      async () => {
        const m = await this.requireMachine(machineId),
          day = await this.requireDay(m.dailyId);
        if (day.ended || m.live) throw Error("この台は着席前判定できません。");
        if (options.completeCheck || options.unavailable)
          m.session.checkUsed = true;
        const spec = getSpec(m.meta.machineId);
        m.raw = spec.parse(m.raw);
        m.resolvedState = spec.resolve(m.raw, m.evidence);
        m.derived = spec.derive(m.raw);
        m.schemaVersion = VERSIONS.schemaVersion;
        m.rulesVersion = VERSIONS.rulesVersion;
        m.machineSpecVersion = spec.version;
        m.decision = decide(spec, m, day.dailyInvestment, options.unavailable);
        await this.storeDecision(m);
        if (m.decision.grade === "A") {
          const entry = createEntry(m);
          await this.db.entries.add(structuredClone(entry));
          m.snapshots.push(entry.id);
        }
        await this.db.machines.put(m);
        return m;
      },
    );
  }
  async startLive(machineId: string) {
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.machines,
      this.db.entries,
      this.db.lives,
      async () => {
        const m = await this.requireMachine(machineId),
          day = await this.requireDay(m.dailyId);
        if (m.decision?.grade !== "A")
          throw Error("A以外ではLIVEを開始できません。");
        const spec = getSpec(m.meta.machineId);
        if (
          m.rulesVersion !== VERSIONS.rulesVersion ||
          m.machineSpecVersion !== spec.version
        )
          throw Error("ルールが更新されました。再判定してください。");
        const decision = decide(spec, m, day.dailyInvestment);
        assertCanStart(day, decision);
        const snapshot = await this.db.entries.get(m.snapshots.at(-1) ?? "");
        if (!snapshot || snapshot.state.session.revision !== m.session.revision)
          throw Error("着席根拠を再判定してください。");
        const live: LiveSession = {
          ...VERSIONS,
          machineSpecVersion: spec.version,
          id: id(),
          dailyId: day.id,
          machineStateId: m.id,
          entrySnapshotId: snapshot.id,
          startedAt: now(),
          endedAt: null,
          status: "active",
          investment: 0,
          returnYen: 0,
          phase: "normal",
          entryBasisActive: true,
          decision,
        };
        await this.db.lives.add(live);
        m.live = live.id;
        day.activeLiveSessionId = live.id;
        await this.db.machines.put(m);
        await this.db.days.put(day);
        return live;
      },
    );
  }
  async addInvestment(liveId: string, amount: number) {
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.machines,
      this.db.entries,
      this.db.lives,
      this.db.events,
      async () => {
        const live = await this.requireLive(liveId),
          day = await this.requireDay(live.dailyId);
        if (live.decision.grade !== "A")
          throw Error("A以外では追加投資できません。");
        day.dailyInvestment = investmentAfter(day.dailyInvestment, amount);
        live.investment += amount;
        const m = await this.requireMachine(live.machineStateId);
        const entry = await this.getEntry(live.entrySnapshotId);
        live.decision = reevaluate(
          getSpec(m.meta.machineId),
          m,
          live,
          entry,
          day,
        );
        m.decision = live.decision;
        await this.db.events.add({
          ...VERSIONS,
          id: id(),
          liveSessionId: live.id,
          createdAt: now(),
          type: "investment",
          payload: { amount },
        });
        await this.db.days.put(day);
        await this.db.lives.put(live);
        await this.db.machines.put(m);
      },
    );
  }
  async liveEvent(
    liveId: string,
    type: string,
    payload: Record<string, unknown>,
    evidence?: Evidence[],
    context?: Context,
  ) {
    return this.db.transaction(
      "rw",
      [
        this.db.days,
        this.db.machines,
        this.db.lives,
        this.db.entries,
        this.db.decisions,
        this.db.events,
      ],
      async () => {
        const live = await this.requireLive(liveId),
          day = await this.requireDay(live.dailyId),
          m = await this.requireMachine(live.machineStateId);
        const spec = getSpec(m.meta.machineId),
          entry = await this.getEntry(live.entrySnapshotId);
        if (
          live.rulesVersion !== VERSIONS.rulesVersion ||
          live.machineSpecVersion !== spec.version
        )
          throw Error(
            "LIVEのルール版が変わりました。記録を確認して終了してください。",
          );
        const update = spec.applyEvent(m, type, payload);
        const next = update.state;
        if (evidence) next.evidence = evidence;
        if (context) next.context = context;
        next.resolvedState = spec.resolve(next.raw, next.evidence);
        next.derived = spec.derive(next.raw);
        next.session.revision++;
        next.session.checkUsed = true;
        if (update.phase) live.phase = update.phase;
        if (update.basisEnded) live.entryBasisActive = false;
        live.decision = reevaluate(spec, next, live, entry, day);
        next.decision = live.decision;
        await this.storeDecision(next);
        await this.db.events.add({
          ...VERSIONS,
          id: id(),
          liveSessionId: live.id,
          createdAt: now(),
          type,
          payload: structuredClone(payload),
        });
        await this.db.machines.put(next);
        await this.db.lives.put(live);
        return live;
      },
    );
  }
  async finishLive(liveId: string, returnYen: number) {
    if (!Number.isSafeInteger(returnYen) || returnYen < 0)
      throw Error("回収額は0以上の整数で入力してください。");
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.lives,
      this.db.machines,
      async () => {
        const live = await this.requireLive(liveId),
          day = await this.requireDay(live.dailyId),
          m = await this.requireMachine(live.machineStateId);
        live.status = "ended";
        live.endedAt = now();
        live.returnYen = returnYen;
        day.activeLiveSessionId = null;
        m.live = null;
        m.session.checkUsed = true;
        m.decision = null;
        await this.db.lives.put(live);
        await this.db.days.put(day);
        await this.db.machines.put(m);
      },
    );
  }
  async finishDay(dailyId: string) {
    return this.db.transaction("rw", this.db.days, async () => {
      const d = await this.requireDay(dailyId);
      if (d.activeLiveSessionId)
        throw Error("LIVEを終了してから1日を終了してください。");
      d.ended = true;
      await this.db.days.put(d);
    });
  }
  async saveReview(
    dailyId: string,
    input: Omit<
      Review,
      "id" | "dailyId" | "createdAt" | "profitLoss" | keyof typeof VERSIONS
    >,
  ) {
    return this.db.transaction(
      "rw",
      this.db.days,
      this.db.lives,
      this.db.reviews,
      async () => {
        const day = await this.requireDay(dailyId);
        const lives = await this.db.lives
          .where("dailyId")
          .equals(dailyId)
          .toArray();
        const returnYen = lives.reduce((sum, l) => sum + l.returnYen, 0);
        const existing = await this.db.reviews
          .where("dailyId")
          .equals(dailyId)
          .first();
        const review: Review = {
          ...VERSIONS,
          ...input,
          returnYen,
          id: existing?.id ?? id(),
          dailyId,
          createdAt: now(),
          profitLoss: returnYen - day.dailyInvestment,
        };
        await this.db.reviews.put(review);
        return review;
      },
    );
  }
  async getEntry(entryId: string) {
    const e = await this.db.entries.get(entryId);
    if (!e) throw Error("着席スナップショットがありません。");
    return deepFreeze(e);
  }
  private async storeDecision(m: MachineState) {
    if (!m.decision) return;
    const d: DecisionSnapshot = {
      ...VERSIONS,
      machineSpecVersion: m.machineSpecVersion,
      id: id(),
      machineStateId: m.id,
      createdAt: now(),
      revision: m.session.revision,
      decision: structuredClone(m.decision),
    };
    await this.db.decisions.add(d);
  }
  private async requireDay(dayId: string) {
    const d = await this.db.days.get(dayId);
    if (!d) throw Error("当日記録がありません。");
    return d;
  }
  private async requireMachine(machineId: string) {
    const m = await this.db.machines.get(machineId);
    if (!m) throw Error("台記録がありません。");
    return m;
  }
  private async requireLive(liveId: string) {
    const l = await this.db.lives.get(liveId);
    if (!l || l.status !== "active") throw Error("進行中のLIVEがありません。");
    return l;
  }
}
