import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../app/SessionProvider";
import { UpdateNotice } from "./UpdateNotice";
export function Layout() {
  const { data, error, busy } = useSession();
  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="scan-mark">H</span>HALL<span>SCAN</span>
        </NavLink>
        <span className="save-status">
          <i /> LOCAL · 保存済み{busy ? "…" : ""}
        </span>
      </header>
      <UpdateNotice />
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {!data ? (
        <main>
          <p>当日の記録を読み込み中…</p>
        </main>
      ) : (
        <>
          <div className="session-strip">
            <span>
              {data.day.businessDate.replaceAll("-", ".")} <b>／</b>{" "}
              {data.visits.find((v) => !v.endedAt)?.storeName ?? "店舗未選択"}
            </span>
            <span>
              残り{" "}
              <strong>
                ¥{(30000 - data.day.dailyInvestment).toLocaleString()}
              </strong>
            </span>
          </div>
          <main>
            <Outlet />
          </main>
        </>
      )}
      <nav className="bottom-nav" aria-label="メインナビ">
        <NavLink to="/" end aria-label="TODAY">
          <span>⌂</span>TODAY
        </NavLink>
        <NavLink to="/patrol" aria-label="PATROL">
          <span>⌕</span>PATROL
        </NavLink>
        <NavLink to="/candidates" aria-label="候補">
          <span>◇</span>候補
        </NavLink>
        <NavLink to="/live" aria-label="LIVE">
          <span>◉</span>LIVE{data?.live && <i />}
        </NavLink>
        <NavLink to="/more" aria-label="MORE">
          <span>···</span>MORE
        </NavLink>
      </nav>
    </div>
  );
}
