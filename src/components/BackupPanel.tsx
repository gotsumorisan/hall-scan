import { useState } from "react";
import { db } from "../persistence/db";
import { exportBackup, importBackup, parseBackup } from "../persistence/backup";
import { useSession } from "../app/SessionProvider";
export function BackupPanel() {
  const { data, run, busy } = useSession();
  const [pending, setPending] = useState(""),
    [summary, setSummary] = useState(""),
    [message, setMessage] = useState("");
  return (
    <section className="card">
      <h2>記録のバックアップ</h2>
      <p>
        この端末の記録をJSONファイルに保存できます。復元は既存の記録を上書きせず、一致しない記録があれば中止します。
      </p>
      <button
        disabled={busy}
        onClick={async () => {
          await run(async () => {
            const json = await exportBackup(db),
              url = URL.createObjectURL(
                new Blob([json], { type: "application/json" }),
              );
            const a = document.createElement("a");
            a.href = url;
            a.download = `hall-scan-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 30000);
            setMessage("保存先でバックアップファイルを確認してください。");
          });
        }}
      >
        バックアップを保存
      </button>
      <label className="field">
        復元するファイル
        <input
          aria-label="復元するファイル"
          type="file"
          accept=".json,application/json"
          disabled={busy || !!data?.live}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            setPending("");
            setSummary("");
            if (!file) return;
            await run(async () => {
              if (file.size > 25_000_000)
                throw Error("バックアップは25MBまでです。");
              const json = await file.text(),
                b = parseBackup(json);
              setPending(json);
              setSummary(
                `${b.tables.days.length}日・${b.tables.machines.length}台・${b.tables.lives.length}実戦。書き出し日時：${b.exportedAt}`,
              );
            });
          }}
        />
      </label>
      {data?.live && (
        <p className="fine">LIVE中は復元できません。保存は可能です。</p>
      )}
      {pending && (
        <>
          <p>{summary}</p>
          <button
            disabled={busy}
            onClick={async () => {
              const result = await run(() => importBackup(db, pending));
              if (result !== undefined) {
                setPending("");
                setMessage(`${result}件を復元しました。`);
                window.location.reload();
              }
            }}
          >
            確認したバックアップを復元
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
