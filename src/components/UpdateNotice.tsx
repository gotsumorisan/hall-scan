import { useRegisterSW } from "virtual:pwa-register/react";
import { useSession } from "../app/SessionProvider";
export function UpdateNotice() {
  const { data } = useSession();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <aside className="notice">
      <p>
        {data?.live
          ? "新しい版があります。LIVE終了後に更新できます。"
          : "新しい版があります。記録を保存した状態で更新できます。"}
      </p>
      <div className="button-row">
        <button
          disabled={!!data?.live}
          onClick={() => updateServiceWorker(true)}
        >
          更新する
        </button>
        <button onClick={() => setNeedRefresh(false)}>あとで</button>
      </div>
    </aside>
  );
}
