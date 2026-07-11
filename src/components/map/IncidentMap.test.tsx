import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IncidentMap } from "@/components/map/IncidentMap";
import { useSimulationStore } from "@/stores/simulation-store";

describe("IncidentMap interactions", () => {
  it("places an incident when the map receives a click", () => {
    render(<IncidentMap />);
    const map = screen.getByRole("application");

    fireEvent.click(map, { clientX: 300, clientY: 200 });

    expect(useSimulationStore.getState().incident.latitude).not.toBe(45.4215);
    expect(useSimulationStore.getState().incident.longitude).not.toBe(-75.6972);
  });

  it("pans on drag without placing a new incident", () => {
    useSimulationStore.getState().placeIncident(45.4215, -75.6972);
    render(<IncidentMap />);
    const map = screen.getByRole("application");

    fireEvent.pointerDown(map, { clientX: 200, clientY: 200 });
    fireEvent.pointerMove(map, { clientX: 260, clientY: 230 });
    fireEvent.pointerUp(map, { clientX: 260, clientY: 230 });
    fireEvent.click(map, { clientX: 260, clientY: 230 });

    expect(useSimulationStore.getState().incident.latitude).toBe(45.4215);
    expect(useSimulationStore.getState().incident.longitude).toBe(-75.6972);
    expect(map).toHaveAttribute("data-dragging", "false");
  });

  it("zooms and recenters through keyboard-activatable toolbar buttons", () => {
    render(<IncidentMap />);
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const recenter = screen.getByRole("button", { name: "Recenter map" });
    const map = screen.getByRole("application");

    fireEvent.click(zoomIn);
    expect(map).toHaveAttribute("data-map-scale", "1.25");

    fireEvent.keyDown(recenter, { key: "Enter" });
    expect(map).toHaveAttribute("data-map-scale", "1");
  });

  it("opens a keyboard-accessible layer menu", () => {
    render(<IncidentMap />);
    const toggle = screen.getByRole("button", { name: "Toggle layers" });

    fireEvent.keyDown(toggle, { key: "Enter" });

    expect(screen.getByRole("group", { name: "Map layers" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Hide plume layer" })).toBeVisible();
  });
});
