# Incident Configuration and Forecast Panels Design

## Goal

Extend the existing RippleEffect dark emergency-operations dashboard with a complete frontend-only incident configuration flow and deterministic forecast, infrastructure, and risk summaries.

## Architecture

Zustand remains the single source of truth for the editable scenario and simulation status. Existing map and timeline components continue consuming the current forecast frame. Typed local fixtures and pure calculation helpers provide hazard profiles, infrastructure records, forecast metrics, risk scores, validation, and default values without a backend or network dependency.

The existing `IncidentPanel`, `WeatherPanel`, `ForecastPanel`, and `InfrastructurePanel` will be enhanced in place. New `HazardSelector` and `SimulationControls` components will be added, and `RiskPanel` will be integrated into the right rail. Business logic stays in `src/lib` and store actions rather than inside large React components.

## Data flow

`IncidentScenario`-compatible state is represented by the existing incident and weather store slices plus release fields. Hazard selection updates hazard-sensitive release defaults. Any input derives a deterministic forecast preview; Run Forecast validates the scenario, marks the simulation as running briefly, then commits calculated frames and a model timestamp. Reset restores the typed default demo scenario. Save and Load use a versioned localStorage envelope with safe parsing and sanitization.

## UX and accessibility

The existing compact three-column mission-control layout, typography, colors, borders, map dominance, and timeline remain unchanged. All fields have labels, numeric ranges, error associations, visible focus styles, keyboard-accessible hazard options, and text-based state labels. Demo weather and forecast outputs carry visible simulated/demo labels. No real weather, geocoding, backend, persistence service, or authentication is introduced.

## Validation and testing

Pure validators reject missing incident name/location/date/time, unsupported hazard values, and out-of-range numeric inputs. Forecast execution is blocked when invalid. Tests cover deterministic calculations, validation, scenario persistence sanitization, reset/run behavior, and key panel interactions. Final verification includes `npm test`, `npm run build`, and rendered desktop/mobile checks.

