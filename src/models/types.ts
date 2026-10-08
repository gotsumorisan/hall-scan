export const VERSIONS = {
  schemaVersion: 2,
  rulesVersion: "1.0.0",
  machineSpecVersion: "1.0.0",
} as const;
export type Grade = "A" | "B" | "C" | "D";
export type Verification =
  "confirmed" | "strongly_supported" | "possible" | "unknown" | "contradicted";
export type Acquisition =
  | "direct"
  | "history_verified"
  | "self_observed"
  | "imported"
  | "inferred"
  | "unknown"
  | "unrecoverable";
export interface Evidence {
  id: string;
  field: string;
  value: string;
  acquisition: Acquisition;
  verification: Verification;
  observedAt: string;
  source: string;
}
export interface Context {
  exchange: "equivalent" | "5.6" | "unknown";
  funding: "cash" | "medals" | "unknown";
  budgetRisk: "acceptable" | "unsafe" | "unknown";
  timeRisk: "acceptable" | "unsafe" | "unknown";
  closingTime: string;
  sourceChecked: boolean;
}
export const emptyContext: Context = {
  exchange: "unknown",
  funding: "unknown",
  budgetRisk: "unknown",
  timeRisk: "unknown",
  closingTime: "",
  sourceChecked: false,
};
export interface NextBestCheck {
  field: string;
  question: string;
  whereToLook: string;
  expectedImpact: string;
  fallback: "B";
}
export interface EVRoute {
  id: string;
  label: string;
  eligible: boolean;
  evYen: number | null;
  basis: string;
  goal: string;
  resetOnly?: boolean;
  missingSource?: string;
}
export interface Decision {
  grade: Grade;
  reasons: string[];
  action: string;
  routes: EVRoute[];
  selectedRoute: EVRoute | null;
  nextBestCheck?: NextBestCheck;
}
export interface Versioned {
  schemaVersion: number;
  rulesVersion: string;
  machineSpecVersion: string;
}
export interface DailySession extends Versioned {
  id: string;
  businessDate: string;
  dailyInvestment: number;
  maxDailyInvestment: 30000;
  visits: string[];
  activeLiveSessionId: string | null;
  ended: boolean;
}
export interface StoreVisitSession extends Versioned {
  id: string;
  dailyId: string;
  storeName: string;
  startedAt: string;
  endedAt: string | null;
}
export interface MachineState extends Versioned {
  id: string;
  dailyId: string;
  visitId: string;
  meta: { machineId: string; machineName: string; seat: string };
  raw: Record<string, unknown>;
  evidence: Evidence[];
  resolvedState: Record<string, unknown>;
  derived: Record<string, unknown>;
  session: { attemptId: string; checkUsed: boolean; revision: number };
  decision: Decision | null;
  live: string | null;
  snapshots: string[];
  context: Context;
}
export interface EntrySnapshot extends Versioned {
  id: string;
  machineStateId: string;
  dailyId: string;
  createdAt: string;
  state: Readonly<MachineState>;
  decision: Readonly<Decision>;
}
export interface DecisionSnapshot extends Versioned {
  id: string;
  machineStateId: string;
  createdAt: string;
  revision: number;
  decision: Decision;
}
export interface LiveSession extends Versioned {
  id: string;
  dailyId: string;
  machineStateId: string;
  entrySnapshotId: string;
  startedAt: string;
  endedAt: string | null;
  status: "active" | "ended";
  investment: number;
  returnYen: number;
  phase: string;
  entryBasisActive: boolean;
  decision: Decision;
}
export interface LiveEvent extends Versioned {
  id: string;
  liveSessionId: string;
  createdAt: string;
  type: string;
  payload: Record<string, unknown>;
}
export interface Review extends Versioned {
  id: string;
  dailyId: string;
  createdAt: string;
  returnYen: number;
  profitLoss: number;
  quality: Record<string, string>;
  hypothesis: string;
  refutation: string;
  sideEffect: string;
  verdict: "採用" | "保留" | "却下";
}
export interface InputField {
  key: string;
  label: string;
  help: string;
  kind: "number" | "select";
  options?: { value: string; label: string }[];
}
export interface EventDefinition {
  type: string;
  label: string;
  help: string;
  fields?: InputField[];
}
export interface RuleEvaluation {
  routes: EVRoute[];
  missing: NextBestCheck[];
  hasPotential: boolean;
}
export interface MachineSpec {
  id: string;
  name: string;
  version: string;
  source: string;
  fields: InputField[];
  evidenceFields: InputField[];
  events: EventDefinition[];
  guide: {
    primary: string[];
    ceilings: string[];
    warnings: string[];
    screening: string;
    where: string[];
  };
  emptyRaw: () => Record<string, unknown>;
  parse: (raw: Record<string, unknown>) => Record<string, unknown>;
  resolve: (
    raw: Record<string, unknown>,
    evidence: Evidence[],
  ) => Record<string, unknown>;
  derive: (raw: Record<string, unknown>) => Record<string, unknown>;
  patrol: (
    raw: Record<string, unknown>,
  ) => "skip" | "watch" | "candidate" | "needs_judgment";
  evaluate: (state: MachineState) => RuleEvaluation;
  applyEvent: (
    state: MachineState,
    type: string,
    payload: Record<string, unknown>,
  ) => { state: MachineState; phase?: string; basisEnded?: boolean };
}
