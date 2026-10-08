import { karakuri } from "./karakuri-circus-2/spec";
import type { MachineSpec } from "../models/types";
export const specs: MachineSpec[] = [karakuri];
export function getSpec(id: string) {
  const spec = specs.find((s) => s.id === id);
  if (!spec) throw Error("この機種はまだ実装されていません。");
  return spec;
}
