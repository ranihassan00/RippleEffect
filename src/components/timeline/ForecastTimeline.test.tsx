import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ForecastTimeline } from "@/components/timeline/ForecastTimeline";
import { useSimulationStore } from "@/stores/simulation-store";

describe("ForecastTimeline playback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSimulationStore.setState({ forecast: { frames: [], currentMinutes: 30, status: "idle" } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances one minute while playing", () => {
    render(<ForecastTimeline />);

    fireEvent.click(screen.getByRole("button", { name: "Play forecast" }));
    act(() => vi.advanceTimersByTime(90));

    expect(useSimulationStore.getState().forecast.currentMinutes).toBe(31);
  });

  it("wraps from 60 minutes back to zero", () => {
    useSimulationStore.getState().setCurrentMinutes(60);
    render(<ForecastTimeline />);

    fireEvent.click(screen.getByRole("button", { name: "Play forecast" }));
    act(() => vi.advanceTimersByTime(90));

    expect(useSimulationStore.getState().forecast.currentMinutes).toBe(0);
  });

  it("pauses playback when the user scrubs the slider", () => {
    render(<ForecastTimeline />);
    fireEvent.click(screen.getByRole("button", { name: "Play forecast" }));
    fireEvent.change(screen.getByRole("slider", { name: "Forecast timeline" }), { target: { value: "42" } });
    act(() => vi.advanceTimersByTime(180));

    expect(useSimulationStore.getState().forecast.currentMinutes).toBe(42);
    expect(screen.getByRole("button", { name: "Play forecast" })).toBeVisible();
  });
});
