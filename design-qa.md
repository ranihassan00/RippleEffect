# Ripple Effect visual QA

final result: passed

Reference: `C:\Users\isobu\.codex\attachments\f2069443-3f64-4caf-9011-256d7a4818a5\image-1.png`

Rendered captures: Playwright fallback at desktop `1796 × 1198` and mobile `390 × 844`.

## Fidelity ledger

| Area | Reference evidence | Render evidence | Result |
| --- | --- | --- | --- |
| Shell hierarchy | Header, left incident rail, dominant central map, right forecast rail, bottom timeline | Desktop geometry verified with 250px left rail, 1293px map, 238px right rail, 112px timeline | Pass |
| Map dominance | Map occupies the majority of the dashboard | Map is the central workspace and keeps forecast layers visible without card-grid replacement | Pass |
| Palette and borders | Near-black/navy surfaces, cyan lines, red emergency accent, semantic risk colors | Shared tokens and thin separators are present across shell, rails, map, legend, and timeline | Pass |
| Forecast layers | Nested plume zones, cyan uncertainty boundary, white dense-gas boundary | `PlumeLayer` renders animated nested contours, uncertainty outline, and model-warning boundary treatment | Pass |
| Operational density | Compact uppercase labels, small technical values, restrained controls | Rails use mono labels, compact rows, limited radius, and mission-control spacing | Pass |
| Timeline | Full-width 0–60 minute timeline with playback controls | Timeline supports play/pause, stepping, scrubbing, and current-frame updates | Pass |
| Responsive behavior | Mobile continuation remains usable | Mobile audit at 390px reports 390px document width, 390px map width, and hidden side rails | Pass |

## Intentional UI-only deviations

- The map is a deterministic local SVG demo surface rather than a live Mapbox/MapLibre layer.
- Forecast values, weather, infrastructure, and hazard profiles remain local typed fixtures.
- The in-app browser could not initialize because of the Windows sandbox ACL issue; Playwright Chromium was used as the verification fallback.
