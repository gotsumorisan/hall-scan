import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { DecisionCard } from "./DecisionCard";
import { machine } from "../tests/fixtures";
import { decide } from "../engine/decision";
import { karakuri } from "../machine-specs/karakuri-circus-2/spec";
it("理由と次の行動を表示し、画像なしで成立する", () => {
  render(<DecisionCard decision={decide(karakuri, machine(), 0)} />);
  expect(screen.getByRole("region", { name: "判定 A" })).toBeVisible();
  expect(screen.getByText("次の行動")).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
