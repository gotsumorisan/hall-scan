import Dexie, { type Table } from "dexie";
import type {
  DailySession,
  StoreVisitSession,
  MachineState,
  EntrySnapshot,
  DecisionSnapshot,
  LiveSession,
  LiveEvent,
  Review,
} from "../models/types";
import { VERSIONS } from "../models/types";
const stores = {
  days: "id, businessDate, ended",
  visits: "id, dailyId",
  machines: "id, dailyId, visitId",
  entries: "id, machineStateId, dailyId",
  decisions: "id, machineStateId",
  lives: "id, dailyId, status",
  events: "id, liveSessionId",
  reviews: "id, dailyId",
};
export class HallDB extends Dexie {
  days!: Table<DailySession, string>;
  visits!: Table<StoreVisitSession, string>;
  machines!: Table<MachineState, string>;
  entries!: Table<EntrySnapshot, string>;
  decisions!: Table<DecisionSnapshot, string>;
  lives!: Table<LiveSession, string>;
  events!: Table<LiveEvent, string>;
  reviews!: Table<Review, string>;
  constructor(name = "hall-scan") {
    super(name);
    this.version(1).stores(stores);
    this.version(2)
      .stores(stores)
      .upgrade(async (tx) => {
        for (const name of Object.keys(stores))
          await tx
            .table(name)
            .toCollection()
            .modify((value) => {
              Object.assign(value, { ...VERSIONS, ...value, schemaVersion: 2 });
            });
      });
  }
}
export const db = new HallDB();
