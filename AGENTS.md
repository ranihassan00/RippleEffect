# AGENTS.md

## Project Name

**Ripple Effect — Predictive Airborne-Hazard Intelligence**

## Project Vision

Ripple Effect is a decision-support interface for understanding how hazardous gases, vapours, smoke, and airborne particles may spread through communities.

The current implementation is a UI-only demo. Forecast values, weather, infrastructure, and hazard profiles remain local typed fixtures until a backend is intentionally added.

Ripple Effect must never claim that predictions are exact or that the product replaces trained emergency authorities, certified modelling software, environmental sensors, or formal emergency procedures.

## Core Product Principle

Physics and geospatial calculations are the source of truth when backend modelling is introduced.

AI may explain structured results but must never invent:

- Concentrations
- Weather conditions
- Impact zones
- Infrastructure intersections
- Exposure levels
- Model confidence
- Emergency orders

## Current Development Priority

Maintain the core incident-to-forecast UI workflow:

1. Place or move an incident location.
2. Select a hazard profile.
3. Edit release parameters.
4. Review or edit local weather inputs.
5. Run the local demo forecast.
6. Scrub forecast frames from 0 to 60 minutes.
7. Inspect concentration contours and infrastructure markers.
8. Present uncertainty and model limitations clearly.

Do not add authentication, billing, team management, persistence, backend services, live weather APIs, or external infrastructure providers without an explicit scope change.

## UI Direction

The interface should remain a dark, precise, mission-critical, GIS-first emergency-operations dashboard.

- Keep the central map dominant.
- Preserve the left incident rail, right forecast rail, top command header, and bottom timeline.
- Use compact uppercase operational labels and small technical readouts.
- Use thin cyan-blue borders, deep navy surfaces, restrained shadows, and semantic risk colors.
- Avoid generic SaaS card grids, oversized marketing typography, excessive rounded pills, large gradients, and decorative glow.
- Do not replace the map with a static screenshot; UI controls and forecast states must remain editable and code-native.

## Interaction and Motion

- Core controls must update real local UI state.
- Hazard, release, weather, display-layer, timeline, and playback controls must remain keyboard accessible.
- Motion should explain plume evolution and timeline changes without implying scientific certainty.
- Respect `prefers-reduced-motion`.
- Keep desktop and mobile layouts usable without horizontal overflow.

## Data and Modelling Policy

All current demo data must remain local, typed, deterministic, and clearly labelled as simulated or configurable.

Future modelling services should keep these concerns separate:

- Input validation
- Atmospheric stability
- Dispersion coefficients
- Coordinate transforms
- Concentration calculations
- Puff advection
- Decay and deposition
- Contour generation
- Risk-zone mapping
- Infrastructure intersection

Dense-gas hazards must display a visible model limitation. Do not claim CFD accuracy, regulatory approval, operational certification, or medical certainty.

## Code Quality

Frontend code should use strict TypeScript, focused components, typed state, accessible controls, and reusable UI primitives.

Do not put major business logic directly inside React components. Keep demo fixtures, state transitions, formatting, map helpers, and forecast helpers in focused modules.

Use explicit units in names such as `wind_speed_kmh`, `release_rate_kg_s`, `source_height_m`, and `duration_minutes`.

## Testing Requirements

Relevant changes must include focused tests where practical.

At minimum, protect:

- Forecast-frame generation
- Risk-zone mapping
- Timeline clamping
- Hazard and incident inputs
- Display-layer toggles
- Forecast execution state
- Dense-gas warning visibility
- Mobile layout usability

Run `npm test` and `npm run build` before considering frontend changes complete.

## Documentation and Safety

Keep `README.md` and `design-qa.md` aligned with the actual UI scope and verification state.

The safety disclaimer must remain visible in the product and documentation:

> Ripple Effect is a prototype decision-support system. Its forecasts are simplified probabilistic estimates and must not replace validated emergency-response procedures, certified atmospheric modelling tools, environmental monitoring, or decisions made by trained authorities.

## Execution Notes

- This file is the project-level instruction source.
- Keep fixes modular, reversible, and testable.
- Preserve the approved reference image’s visual hierarchy and density.
- Do not silently broaden the project into a backend or production emergency-response system.
