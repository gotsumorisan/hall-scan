import type { InputField, EventDefinition } from "../../models/types";
export const fields: InputField[] = [
  {
    key: "lcdGame",
    label: "液晶G",
    kind: "number",
    help: "リール左側。液晶加算を含む規定Gカウンタ。",
  },
  {
    key: "goddessIntervalActualGame",
    label: "女神間 実G",
    kind: "number",
    help: "前回女神またはATから。台データ・遊技履歴で確認。",
  },
  {
    key: "atIntervalActualGame",
    label: "AT間 実G",
    kind: "number",
    help: "前回ATから。液晶Gの加算分は含めない。",
  },
  {
    key: "goddessSkipCount",
    label: "女神スルー",
    kind: "number",
    help: "機械仕掛けの女神の連続失敗だけ。0〜4回。",
  },
  {
    key: "resetVerification",
    label: "リセット根拠",
    kind: "select",
    help: "朝一・0Gだけでは確定にしない。",
    options: [
      { value: "unknown", label: "不明" },
      { value: "possible", label: "可能性あり" },
      { value: "strongly_supported", label: "強い根拠あり（未確定）" },
      { value: "confirmed", label: "確認済み・確定" },
      { value: "contradicted", label: "否定" },
    ],
  },
];
export const evidenceFields: InputField[] = [
  {
    key: "pushPanel",
    label: "PUSHパネル",
    kind: "select",
    help: "モード示唆として保存。円換算しない。",
    options: [
      "不明",
      "鳴海",
      "勝",
      "しろがね",
      "祈るフランシーヌ",
      "アンジェリーナ",
      "笑顔フランシーヌ",
      "フランシーヌ人形",
      "リーゼロッテ",
      "手",
      "真夜中のサーカス",
      "ギイ＆オリンピア",
      "敵キャラ4人",
      "フェイスレス",
      "ピエロ",
    ].map((v) => ({ value: v, label: v })),
  },
  {
    key: "spotlight",
    label: "スポットライト",
    kind: "select",
    help: "液晶規定Gまでの示唆。女神間実Gの残りではない。",
    options: [
      "不明",
      "なし",
      "スポットライトのみ",
      "あるるかんシルエット",
      "あるるかんアップ",
    ].map((v) => ({ value: v, label: v })),
  },
];
export const events: EventDefinition[] = [
  {
    type: "counters",
    label: "カウンタを更新",
    help: "確認できた表示値を個別に更新。空欄は不明。",
    fields: fields.slice(0, 4),
  },
  {
    type: "goddess_failure",
    label: "機械仕掛けの女神 失敗",
    help: "女神スルーだけ+1。女神間と液晶Gを0へ。",
  },
  {
    type: "intermission_failure",
    label: "幕間チャンス 失敗",
    help: "女神間・女神スルーを変更しません。",
  },
  {
    type: "theater_failure",
    label: "劇場ジャッジ 失敗",
    help: "女神スルーには含めません。",
  },
  {
    type: "at_started",
    label: "AT当選",
    help: "AT間・女神間・女神スルーをリセット。",
  },
  {
    type: "at_ended",
    label: "通常AT 終了",
    help: "幕間を消化 → PUSH → タッチ → 次状態を確認。",
  },
  {
    type: "upper_at_ended",
    label: "上位AT 終了",
    help: "運命の一劇までが一連の状態。",
  },
  {
    type: "one_shot_failure",
    label: "運命の一劇 失敗",
    help: "128実Gの状態単独は自動Aにしません。",
  },
  {
    type: "next_state_confirmed",
    label: "終了後の次状態を確認済み",
    help: "一連のルートが終了。最新の表示と証拠で再判定。",
  },
  {
    type: "loss_note",
    label: "負け・ハマリを記録",
    help: "短期的な負けだけでは着席時のA根拠を捨てません。",
  },
];
export const guide = {
  primary: ["液晶G", "女神間実G", "AT間実G", "女神スルー"],
  ceilings: [
    "女神間 890実G → 機械仕掛けの女神",
    "AT間 2500実G → AT＋成功濃厚激情J",
    "女神4連続失敗後の5回目 → AT直撃",
    "液晶 通常A/C/D 1101G+α（最深1200G級）／B 701G+α／天国100G以内",
    "リセット確定時 液晶CZ天井500G",
  ],
  warnings: [
    "液晶G ≠ 実ゲーム数。4つのカウンタを分ける。",
    "幕間・劇場ジャッジの失敗は女神スルーに含めない。",
    "PUSH・スポットライトの価値をEVに加算しない。",
    "女神スルー非等価EV・128G引き戻し単独EVは TODO_NEEDS_SOURCE。",
  ],
  screening:
    "液晶600G / 女神間500実G / 女神3スルーから相談。着席基準ではありません。",
  where: [
    "液晶G：リール左側",
    "スルー：液晶下部「台データ」→遊技履歴",
    "女神間・AT間：履歴で明確に読める場合だけ。読めなければ不明。",
  ],
};
