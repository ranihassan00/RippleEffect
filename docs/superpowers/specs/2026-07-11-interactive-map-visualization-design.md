# Interactive Map & Visualization Design

## Goal

Complete Person 2's frontend scope for Ripple Effect using the existing token-free SVG Ottawa demo map. The map remains a deterministic decision-support visualization: it is interactive and responsive, but it does not claim live geographic, weather, or atmospheric-model accuracy.

## Product boundaries

- Preserve the dark mission-control dashboard hierarchy: command header, incident rail, dominant map, forecast rail, and timeline.
- Keep all data local, typed, and deterministic.
- Do not add Mapbox credentials, a backend, live weather, external infrastructure APIs, authentication, or persistence.
- Keep the safety disclaimer visible in the dashboard and README.
- Respect keyboard interaction and `prefers-reduced-motion`.

## Architecture

The existing `useSimulation` hook and Zustand store remain the source of truth for incident, weather, forecast frames, current timeline position, and layer visibility. Map presentation is split into focused SVG overlay components:

- `IncidentMap` owns the map viewport, pointer interaction, zoom/pan/recenter state, marker placement, and composition of overlays.
- `PlumeLayer` renders deterministic concentration contours and uncertainty boundaries from the current frame.
- `WindIndicator` renders the current wind direction and speed, with an explicit layer visibility state.
- A risk-zone overlay renders semantic zone bands derived from the current forecast frame.
- Infrastructure markers remain typed demo features and are independently toggleable.
- `ForecastTimeline` owns playback state and clamps all timeline updates through the store.

The map viewport uses a normalized transform over the existing SVG. Pointer placement converts the transformed SVG coordinates back to geographic coordinates through `mapPercentToGeo`; zoom and pan alter only presentation state. Recenter restores the initial viewport without changing the incident location. Toolbar controls are real buttons with accessible labels and keyboard activation.

## Interaction model

1. Clicking the map places or moves the incident marker.
2. Dragging pans the map while preventing accidental placement after a drag.
3. Zoom in/out changes the viewport scale within bounded limits; recenter restores the default transform.
4. The layer control exposes plume, uncertainty, infrastructure, and wind visibility. Hidden layers are not rendered and their legend/annotation state reflects that.
5. Running a forecast transitions through the existing running state, then exposes frames at 15, 30, and 60 minutes.
6. Playback advances in one-minute increments, wraps at 60 minutes, and stops or continues predictably when the user interacts with the slider.
7. Reduced-motion users receive immediate geometry updates and no decorative animation.

## Visualization rules

- The plume is deterministic and wind-aware using the existing forecast inputs; it is labelled as a modelled estimate.
- Risk zones use the existing semantic risk colors and frame data. The map and right-rail legend share the same zone identifiers.
- Uncertainty is shown as a dashed boundary and remains visually distinct from the concentration bands.
- Wind direction uses the existing bearing helper and is shown as a directional vector, not as a live sensor claim.
- Infrastructure markers use the existing demo fixtures and retain labels/accessible descriptions where feasible.
- The map retains a visible estimate label and the dashboard retains the prototype safety disclaimer.

## Testing and verification

Add focused tests for:

- map coordinate conversion under zoom/pan;
- bounded zoom, pan, and recenter behavior;
- layer visibility, including wind and uncertainty;
- timeline clamping, playback stepping, and wraparound;
- risk-zone rendering from forecast frames;
- incident placement without moving the marker during a drag;
- keyboard-accessible toolbar controls and mobile no-overflow behavior.

Run `npm test` and `npm run build` after implementation. Before each major feature and before final commit, synchronize with `origin/main` and inspect concurrent changes in map, timeline, simulation, dashboard, library, CSS, package, and test files.

## Repository workflow

Work on `feature/interactive-map-visualization`. The local clone uses a post-commit hook to push each commit to its matching branch on `origin`. Pull requests remain subject to normal review and repository checks; no blanket auto-approval or auto-merge rule is installed.
