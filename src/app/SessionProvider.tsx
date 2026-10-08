import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { liveQuery } from "dexie";
import { db } from "../persistence/db";
import { Repository } from "../persistence/repository";
export const repository = new Repository(db);
type Data = Awaited<ReturnType<Repository["readDay"]>>;
const SessionContext = createContext<{
  data: Data | null;
  error: string;
  run: <T>(action: () => Promise<T>) => Promise<T | undefined>;
  busy: boolean;
}>({ data: null, error: "", run: async () => undefined, busy: false });
export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dayId, setDayId] = useState("");
  useEffect(() => {
    repository
      .ensureToday()
      .then((day) => setDayId(day.id))
      .catch((e) => setError(`保存領域を開けません: ${e.message}`));
  }, []);
  useEffect(() => {
    if (!dayId) return;
    const sub = liveQuery(() => repository.readDay(dayId)).subscribe({
      next: setData,
      error: (e) => setError(String(e)),
    });
    return () => sub.unsubscribe();
  }, [dayId]);
  async function run<T>(action: () => Promise<T>) {
    setBusy(true);
    setError("");
    try {
      return await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  return (
    <SessionContext.Provider value={{ data, error, run, busy }}>
      {children}
    </SessionContext.Provider>
  );
}
export const useSession = () => useContext(SessionContext);
