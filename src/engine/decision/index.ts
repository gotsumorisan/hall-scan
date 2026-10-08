import type {
  Decision,
  MachineSpec,
  MachineState,
  NextBestCheck,
} from "../../models/types";
export function check(
  field: string,
  question: string,
  whereToLook: string,
): NextBestCheck {
  return {
    field,
    question,
    whereToLook,
    expectedImpact: "確認できればA候補の適用可否を再判定します。",
    fallback: "B",
  };
}
export function decide(
  spec: MachineSpec,
  state: MachineState,
  dailyInvestment: number,
  unavailable = false,
): Decision {
  const evaluation = spec.evaluate(state);
  // Choose one independent route. The EVs describe overlapping outcomes; never sum them.
  const routes = evaluation.routes.filter(
    (r) => !r.resetOnly || state.resolvedState.reset === "confirmed",
  );
  const selectedRoute =
    routes
      .filter((r) => r.eligible && r.evYen !== null && r.evYen >= 2000)
      .sort((a, b) => (b.evYen ?? 0) - (a.evYen ?? 0))[0] ?? null;
  const result = (
    grade: Decision["grade"],
    reason: string,
    action: string,
  ): Decision => ({ grade, reasons: [reason], action, routes, selectedRoute });
  if (dailyInvestment >= 30000)
    return result(
      "D",
      "当日総投資が30,000円の上限に達しました。",
      "追加投資を止めてREVIEWへ。",
    );
  if (
    state.context.budgetRisk === "unsafe" ||
    state.context.timeRisk === "unsafe"
  )
    return result(
      "D",
      "資金切れ・取り切れないリスクが大きい状態です。",
      "着席せず、次の候補へ。",
    );
  if (unavailable)
    return result(
      "B",
      "追加確認ができないため、見送ります。",
      "PATROLに戻る。",
    );
  const missing: NextBestCheck[] = [];
  if (evaluation.hasPotential || selectedRoute) {
    if (state.context.exchange === "unknown")
      missing.push(
        check(
          "exchange",
          "交換条件は等価ですか、5.6枚ですか？",
          "店舗の交換条件を確認。分からなければ確認不能。",
        ),
      );
    if (state.context.funding === "unknown")
      missing.push(
        check(
          "funding",
          "現金で始めますか、持ちメダルですか？",
          "利用する資金を確認。",
        ),
      );
    missing.push(...evaluation.missing);
    if (state.context.budgetRisk === "unknown")
      missing.push(
        check(
          "budgetRisk",
          "残り資金で狙いを完了できる見込みを確認できましたか？",
          "残り軍資金とルートの必要投資を照合。判断不能なら見送る。",
        ),
      );
    if (state.context.timeRisk === "unknown" || !state.context.closingTime)
      missing.push(
        check(
          "timeRisk",
          "閉店時刻と、上位ルートまで取り切れる見込みを確認できましたか？",
          "店舗の閉店時刻・ATと上位ルートの残存価値を確認。",
        ),
      );
    if (!state.context.sourceChecked)
      missing.push(
        check(
          "sourceChecked",
          "当日の解析更新と、保存資料の計算前提を確認できましたか？",
          "MOREの出典・基準日を確認し、実戦当日の解析と照合。",
        ),
      );
  }
  if (missing.length) {
    if (state.session.checkUsed)
      return result(
        "B",
        "追加確認を1項目使いました。他の重要な不明が残るため見送ります。",
        "PATROLに戻る。",
      );
    return {
      ...result(
        "C",
        "判断が変わる確認を1項目だけ行います。",
        "表示された1項目を確認。",
      ),
      nextBestCheck: missing[0],
    };
  }
  if (selectedRoute)
    return {
      ...result(
        "A",
        `${selectedRoute.label}の正式候補ラインと、交換・資金・時間の条件を満たしています。`,
        selectedRoute.goal,
      ),
      reasons: [
        `${selectedRoute.label}を単独採用。参考EV +${selectedRoute.evYen?.toLocaleString()}円（信頼度C）。`,
        "資金・閉店・当日の情報を確認済み。",
      ],
    };
  return result(
    evaluation.hasPotential ? "B" : "D",
    evaluation.hasPotential
      ? "候補の可能性はありますが、正式Aラインまたは定量根拠が不足しています。"
      : "確認できた情報に、狙う根拠がありません。",
    "着席せずPATROLに戻る。",
  );
}
