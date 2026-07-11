import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("aligns the cyan track fill with the thumb at the current minute", () => {
    useSimulationStore.getState().setCurrentMinutes(20);
    render(<ForecastTimeline />);

    const slider = screen.getByRole("slider", { name: "Forecast timeline" });

    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "60");
    expect(slider).toHaveValue("20");
    expect(slider.style.getPropertyValue("--timeline-progress")).toBe("33.33333333333333%");
  });

  it("jumps to every timeline marker", () => {
    render(<ForecastTimeline />);

    for (const minute of [0, 15, 30, 60]) {
      fireEvent.click(screen.getByRole("button", { name: `Jump to ${minute} minutes` }));
      expect(useSimulationStore.getState().forecast.currentMinutes).toBe(minute);
    }
  });

  it("changes playback speed through the accessible upward menu", () => {
    render(<ForecastTimeline />);
    const speedButton = screen.getByRole("button", { name: "Change playback speed" });

    expect(speedButton).toHaveTextContent("1×");
    fireEvent.click(speedButton);
    expect(screen.getByRole("listbox", { name: "Playback speed" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "2×" }));
    expect(speedButton).toHaveTextContent("2×");
    expect(screen.queryByRole("listbox", { name: "Playback speed" })).not.toBeInTheDocument();
  });

  it("clears playback when paused", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    render(<ForecastTimeline />);

    fireEvent.click(screen.getByRole("button", { name: "Play forecast" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause forecast" }));

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
