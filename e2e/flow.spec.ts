import { test, expect, type Page } from "@playwright/test";
async function toCheck(page: Page) {
  await page.goto("./");
  await page.getByLabel("店舗名", { exact: true }).fill("テスト店舗A");
  await page.getByRole("button", { name: "店舗を記録して巡回" }).click();
  await page.getByLabel("台番号", { exact: true }).fill("128");
  await page.getByRole("button", { name: "見る場所を確認" }).click();
  await expect(
    page.getByRole("heading", { name: "からくりサーカス2" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "SMART CHECKへ" }).click();
}
async function validInputs(page: Page) {
  await page.getByLabel("液晶G", { exact: true }).fill("1000");
  await page.getByLabel("女神間 実G", { exact: true }).fill("200");
  await page.getByLabel("AT間 実G", { exact: true }).fill("500");
  await page.getByLabel("女神スルー", { exact: true }).fill("0");
  await page.getByLabel("交換条件", { exact: true }).selectOption("equivalent");
  await page.getByLabel("投資方法", { exact: true }).selectOption("cash");
  await page
    .getByLabel("資金リスク", { exact: true })
    .selectOption("acceptable");
  await page.getByLabel("閉店時刻", { exact: true }).fill("23:59");
  await page
    .getByLabel("取り切れリスク", { exact: true })
    .selectOption("acceptable");
  await page.getByLabel("当日の解析更新").check();
}
test("TODAY→PATROL→QUICK→CHECK→A→LIVE→reload→再判定→REVIEW", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await toCheck(page);
  await validInputs(page);
  await page.getByRole("button", { name: "保存して判定する" }).click();
  await expect(page.getByRole("region", { name: "判定 A" })).toBeVisible();
  await page.getByRole("button", { name: "A判定でLIVEを開始" }).click();
  await expect(page).toHaveURL(/\/live$/);
  await page.getByLabel("追加投資額", { exact: true }).fill("1000");
  await page.getByRole("button", { name: "投資を記録" }).click();
  await expect(page.getByText("¥1,000", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("region", { name: "判定 A" })).toBeVisible();
  await page.getByLabel("実機のイベント").selectOption("intermission_failure");
  await page.getByRole("button", { name: "記録して再判定" }).click();
  await expect(page.getByRole("region", { name: "判定 A" })).toBeVisible();
  await page.getByLabel("実機のイベント").selectOption("goddess_failure");
  await page.getByRole("button", { name: "記録して再判定" }).click();
  await expect(page.getByRole("region", { name: "判定 D" })).toBeVisible();
  await expect(page.getByRole("button", { name: "投資を記録" })).toBeDisabled();
  await page.getByLabel("回収額", { exact: true }).fill("0");
  await page.getByRole("button", { name: "終了してREVIEWへ" }).click();
  await page.getByRole("button", { name: "REVIEWを保存" }).click();
  await expect(page.getByRole("status")).toHaveText("REVIEWを保存しました。");
  await expect(page.getByText("¥1,000", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "TODAYへ" }).click();
  await page.getByLabel("次の店舗名").fill("テスト店舗B");
  await page.getByRole("button", { name: "店舗を移動" }).click();
  await page.getByRole("link", { name: "TODAY", exact: true }).click();
  await expect(
    page.getByRole("main").getByText("¥29,000", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("Cは1項目、確認不能でB・LIVE開始なし", async ({ page }) => {
  await toCheck(page);
  await page.getByRole("button", { name: "保存して判定する" }).click();
  await expect(page.getByRole("region", { name: "判定 C" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "交換条件は等価ですか、5.6枚ですか？" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "確認できない" }).click();
  await expect(page.getByRole("region", { name: "判定 B" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "A判定でLIVEを開始" }),
  ).toHaveCount(0);
  await page.goto("./#/live");
  await expect(
    page.getByRole("heading", { name: "進行中の実戦なし" }),
  ).toBeVisible();
});
test("候補なし・0円の日を終了できる", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "候補なしでも" }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole("button", { name: "REVIEWを保存" }).click();
  await expect(page.getByText("+¥0", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("+¥0", { exact: true })).toBeVisible();
});
test("30,000円超過拒否、上限到達でD", async ({ page }) => {
  await toCheck(page);
  await validInputs(page);
  await page.getByRole("button", { name: "保存して判定する" }).click();
  await page.getByRole("button", { name: "A判定でLIVEを開始" }).click();
  await page.getByLabel("追加投資額", { exact: true }).fill("30001");
  await page.getByRole("button", { name: "投資を記録" }).click();
  await expect(page.getByRole("alert")).toContainText("30,000円");
  await page.getByLabel("追加投資額", { exact: true }).fill("30000");
  await page.getByRole("button", { name: "投資を記録" }).click();
  await expect(page.getByRole("region", { name: "判定 D" })).toBeVisible();
  await expect(page.getByRole("button", { name: "投資を記録" })).toBeDisabled();
});
test("オフラインreloadでPWAとLIVEを復元", async ({ page, context }) => {
  await toCheck(page);
  await validInputs(page);
  await page.getByRole("button", { name: "保存して判定する" }).click();
  await page.getByRole("button", { name: "A判定でLIVEを開始" }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("region", { name: "判定 A" })).toBeVisible();
  await page.getByLabel("実機のイベント").selectOption("loss_note");
  await page.getByLabel("負け・ハマリのメモ").fill("オフラインで記録");
  await page.getByRole("button", { name: "記録して再判定" }).click();
  await expect(page.getByRole("region", { name: "判定 A" })).toBeVisible();
  await context.setOffline(false);
});
test("モバイルTODAYは横はみ出しなし", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: /今日の判断を/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/today-mobile.png",
    fullPage: true,
  });
});
