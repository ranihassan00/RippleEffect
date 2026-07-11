import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { useSimulationStore } from "@/stores/simulation-store";

describe("dashboard display layers", () => {
  it("renders incident configuration and blocks invalid forecast execution", async () => {
    useSimulationStore.getState().resetScenario();
    const user = userEvent.setup();
    render(<DashboardPage />);
    const name = screen.getByLabelText("Incident name");
    await user.clear(name);
    await user.click(screen.getAllByRole("button", { name: /run forecast/i })[1]);
    expect(await screen.findByText("Incident name is required.")).toBeInTheDocument();
  });

  it("supports keyboard-accessible hazard selection and local scenario controls", async () => {
    useSimulationStore.getState().resetScenario();
    const user = userEvent.setup();
    render(<DashboardPage />);
    const hazard = screen.getByRole("radio", { name: /chlorine/i });
    await user.click(hazard);
    expect(hazard).toBeChecked();
    await user.click(screen.getByRole("button", { name: /save scenario/i }));
    expect(await screen.findByText(/saved locally/i)).toBeInTheDocument();
  });

  it("lets responders hide the probable impact zone layer", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const layer = screen.getByRole("checkbox", { name: "Probable impact zone" });
    expect(layer).toBeChecked();

    await user.click(layer);

    expect(layer).not.toBeChecked();
  });
});
