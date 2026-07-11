# Ripple Effect

> Predictive airborne-hazard intelligence for emergency response.

This repository currently contains the UI-only hackathon dashboard concept for Ripple Effect. It is a local, typed interaction prototype with deterministic demo fixtures; it does not connect to live weather, a backend simulation service, a database, or emergency infrastructure data.

## Included workflow

- Place an incident on a dark Ottawa demo map.
- Configure a hazard, incident type, release rate, duration, source height, and weather inputs.
- Run a local simulated forecast.
- Scrub between 15, 30, and 60-minute forecast frames.
- Inspect animated-looking concentration contours, uncertainty boundaries, risk zones, and infrastructure markers.
- Review dense-gas limitations and the prototype safety disclaimer.

## Local commands

```bash
npm install
npm run dev
npm test
npm run build
```

Open `http://localhost:3000` only when you want to preview the local files. No deployment or external provider setup is required for this UI phase.

## Structure

The UI is organized around the requested boundaries:

- `src/components/map` — map canvas, plume, wind, and legend layers.
- `src/components/dashboard` — incident, weather, forecast, and infrastructure panels.
- `src/components/timeline` — playback controls and forecast timeline.
- `src/components/ui` — small reusable controls and panels.
- `src/hooks/useSimulation.ts` and `src/stores/simulation-store.ts` — local typed interaction state.
- `src/lib` — demo data, map helpers, forecast fixtures, types, and semantic UI data.

## Safety disclaimer

Ripple Effect is a prototype decision-support system. Its forecasts are simplified probabilistic estimates and must not replace validated emergency-response procedures, certified atmospheric modelling tools, environmental monitoring, or decisions made by trained authorities.
