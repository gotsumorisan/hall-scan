import { karakuri } from "./karakuri-circus-2/spec";
import type { MachineSpec } from "../models/types";
import { spec as spec0 } from "./kabaneri-kaimon/spec";
import { spec as spec1 } from "./tokyo-ghoul/spec";
import { spec as spec2 } from "./monkey-turn-v/spec";
import { spec as spec3 } from "./lycoris-recoil/spec";
import { spec as spec4 } from "./sengoku-otome-5/spec";
import { spec as spec5 } from "./valvrave-2/spec";
import { spec as spec6 } from "./magia-record/spec";
import { spec as spec7 } from "./hokuto-tensei-2/spec";
import { spec as spec8 } from "./enen-2/spec";
export const specs: MachineSpec[] = [
  karakuri,
  spec0,
  spec1,
  spec2,
  spec3,
  spec4,
  spec5,
  spec6,
  spec7,
  spec8,
];
export function getSpec(id: string) {
  const spec = specs.find((s) => s.id === id);
  if (!spec) throw Error("未対応の機種です。");
  return spec;
}
