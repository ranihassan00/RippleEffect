"use client";

import { CloudSun, Droplets, Thermometer, Wind } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { Panel, PanelHeading } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";

const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "WNW", "NW"];

export function WeatherPanel() {
  const { weather, setWeatherField } = useSimulation();
  return <Panel className="rail-panel weather-panel"><PanelHeading><span>WEATHER INPUT</span><span className="live-dot">LIVE</span></PanelHeading><div className="weather-primary"><Wind size={17} /><strong>{weather.windSpeedKmh} km/h {weather.windDirection}</strong><span>surface wind</span></div><div className="weather-grid"><div><CloudSun size={14} /><span>Stability</span><strong>{weather.stability}</strong></div><div><Thermometer size={14} /><span>Temperature</span><strong>{weather.temperatureC}°C</strong></div><div><Droplets size={14} /><span>Humidity</span><strong>{weather.humidityPct}%</strong></div><div><span className="weather-mini-label">SRC</span><strong>{weather.source === "Demo weather" ? "Open-Meteo" : "Manual"}</strong></div></div><div className="weather-edit"><label>Wind speed<input aria-label="Wind speed" type="number" value={weather.windSpeedKmh} onChange={(event) => setWeatherField("windSpeedKmh", Number(event.target.value))} /></label><label>Direction<Select aria-label="Wind direction" value={weather.windDirection} onChange={(event) => setWeatherField("windDirection", event.target.value)}>{directions.map((direction) => <option key={direction}>{direction}</option>)}</Select></label></div></Panel>;
}
