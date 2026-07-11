import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import DashboardPage from "@/components/dashboard/DashboardPage";

describe("dashboard display layers", () => {
  it("lets responders hide the probable impact zone layer", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const layer = screen.getByRole("checkbox", { name: "Probable impact zone" });
    expect(layer).toBeChecked();

    await user.click(layer);

    expect(layer).not.toBeChecked();
  });
});
