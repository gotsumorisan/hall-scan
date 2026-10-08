import type { MachineSpec } from "../../models/types";
import { rawSchema, emptyRaw } from "./raw-schema";
import { resolve } from "./resolver";
import { derive } from "./derived-rules";
import { patrol } from "./patrol-rules";
import { evaluate } from "./decision-rules";
import { applyEvent } from "./live-events";
import { fields, evidenceFields, events, guide } from "./guide";
export const spec: MachineSpec = {
  id: "enen_2",
  name: "炎炎ノ消防隊2",
  version: "1.0.0",
  source: "添付10機種リファレンスv2.0（2026-10-07）§10.8",
  fields,
  evidenceFields,
  events,
  guide,
  emptyRaw,
  parse: (r) => rawSchema.parse(r),
  resolve,
  derive,
  patrol,
  evaluate,
  applyEvent,
};
