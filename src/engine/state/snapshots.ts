import type { EntrySnapshot, MachineState } from "../../models/types";
import { VERSIONS } from "../../models/types";
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export function createEntry(state: MachineState): EntrySnapshot {
  if (state.decision?.grade !== "A") throw Error("A判定だけが着席できます。");
  return deepFreeze({
    ...VERSIONS,
    id: id(),
    machineStateId: state.id,
    dailyId: state.dailyId,
    createdAt: now(),
    state: structuredClone(state),
    decision: structuredClone(state.decision),
  });
}
export function businessDate(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
