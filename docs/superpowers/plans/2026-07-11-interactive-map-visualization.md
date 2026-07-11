# Interactive Map & Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the token-free SVG map, timeline, risk, wind, infrastructure, and layer interactions described in the Person 2 brief.

**Architecture:** Keep Zustand as the source of truth and add pure geometry helpers for viewport math and deterministic overlays. `IncidentMap` owns transient viewport/pointer state and composes focused SVG layers; `ForecastTimeline` owns playback state and uses the store's clamping boundary.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Zustand, Framer Motion, Vitest, Testing Library, existing SVG/CSS map presentation.

## Global Constraints

- Keep all demo data local, typed, deterministic, and clearly labelled as simulated.
- Do not add Mapbox credentials, backend services, live weather, authentication, persistence, or external infrastructure APIs.
- Preserve the dark GIS-first dashboard hierarchy and visible safety disclaimer.
- Keep public component APIs stable unless a focused change is required.
- Respect keyboard accessibility, reduced motion, and mobile no-overflow behavior.
- Synchronize with `origin/main` before each major feature, dependency change, shared-file edit, test/build, and final commit.

---

### Task 1: Add pure map viewport and risk geometry helpers

**Files:**
- Modify: `src/lib/map-utils.ts`
- Create: `src/lib/map-utils.test.ts`

**Interfaces:**
- Produce `MapViewport { scale: number; offsetX: number; offsetY: number }`.
- Produce `clampMapScale(scale: number): number`, `zoomViewport(viewport, factor): MapViewport`, `panViewport(viewport, dx, dy): MapViewport`, `resetViewport(): MapViewport`, and `viewportPointToPercent(point, viewport, width, height): { xPct: number; yPct: number }`.
- Produce `riskZoneRadius(zone: RiskZoneId, minutes: number): number` for deterministic map bands.

- [ ] **Step 1: Write failing unit tests** for scale bounds, pan bounds, reset, inverse coordinate conversion, and risk-zone ordering.
- [ ] **Step 2: Run `npm test -- src/lib/map-utils.test.ts`** and verify the new tests fail for missing helpers.
- [ ] **Step 3: Implement the helpers** with bounded scale `1..2.5`, bounded normalized pan, and pure arithmetic.
- [ ] **Step 4: Re-run the focused test** and verify it passes.
- [ ] **Step 5: Commit** with `git add src/lib/map-utils.ts src/lib/map-utils.test.ts && git commit -m "feat: add map viewport geometry helpers"`.

### Task 2: Make map controls interactive and accessible

**Files:**
- Modify: `src/components/map/IncidentMap.tsx`
- Modify: `src/components/map/WindIndicator.tsx`
- Modify: `src/app/globals.base.css`

**Interfaces:**
- `IncidentMap` keeps `placeIncident(latitude, longitude)` as the only persistent map mutation.
- Toolbar buttons expose `Recenter map`, `Zoom in`, `Zoom out`, and `Toggle layers` labels.
- Pointer drag pans without placing an incident; a click places an incident only when movement stays below the drag threshold.

- [ ] **Step 1: Add component tests** for click placement, drag-vs-click behavior, zoom button bounds, recenter, and keyboard activation.
- [ ] **Step 2: Run the focused tests** and verify failures describe the missing interactions.
- [ ] **Step 3: Add viewport state and pointer handlers** using the pure helpers; apply a bounded SVG transform and preserve the incident marker in geographic space.
- [ ] **Step 4: Make the wind layer honor `layers.wind`** and add an SVG directional vector derived from `windBearing` while retaining the current summary card.
- [ ] **Step 5: Add focus-visible and touch-action CSS** without introducing horizontal overflow.
- [ ] **Step 6: Run map/dashboard tests** and verify all interaction assertions pass.
- [ ] **Step 7: Commit** with `git add src/components/map src/hooks/useSimulation.ts src/app/globals.base.css && git commit -m "feat: add interactive map controls"`.

### Task 3: Add deterministic risk-zone and infrastructure map overlays

**Files:**
- Create: `src/components/map/RiskZoneLayer.tsx`
- Modify: `src/components/map/IncidentMap.tsx`
- Modify: `src/components/map/PlumeLayer.tsx`
- Modify: `src/components/map/RiskLegend.tsx`

**Interfaces:**
- `RiskZoneLayer({ minutes, visible }: { minutes: number; visible: boolean })` renders semantic nested bands using `RISK_ZONES` colors and the same `RiskZoneId` ordering used by the legend.
- Infrastructure markers render `aria-label` text from each fixture and use the current frame's infrastructure list when a forecast is ready.

- [ ] **Step 1: Add tests** for visible/hidden risk zones and current-frame infrastructure filtering.
- [ ] **Step 2: Run focused tests** and verify the new tests fail.
- [ ] **Step 3: Implement nested risk bands** with deterministic geometry derived from the current minute and shared risk-zone identifiers.
- [ ] **Step 4: Integrate the layer order** so risk zones sit beneath plume contours, with infrastructure markers above both.
- [ ] **Step 5: Update the legend** to expose the same semantic colors and hidden-layer state.
- [ ] **Step 6: Run map/dashboard tests** and verify rendering and accessibility assertions pass.
- [ ] **Step 7: Commit** with `git add src/components/map && git commit -m "feat: add risk zones and map overlays"`.

### Task 4: Harden timeline playback and responsive behavior

**Files:**
- Modify: `src/components/timeline/ForecastTimeline.tsx`
- Modify: `src/components/timeline/PlaybackControls.tsx`
- Modify: `src/stores/simulation-store.ts`
- Modify: `src/components/dashboard/DashboardPage.test.tsx`
- Modify: `src/app/globals.base.css`

**Interfaces:**
- Playback uses `clampTimeline` for every update, advances one minute, wraps from 60 to 0, and pauses when the user drags the slider.
- Timeline labels accurately reflect the selected frame and forecast status, including the idle state.

- [ ] **Step 1: Add tests** for one-minute playback increments, wraparound, slider clamping, pause-on-scrub, and reduced-motion-safe rendering.
- [ ] **Step 2: Run the focused tests** and verify failures expose the current behavior gaps.
- [ ] **Step 3: Implement the playback state transitions** with stable interval cleanup and explicit slider interaction handlers.
- [ ] **Step 4: Adjust responsive CSS** so the map, toolbar, timeline, and disclaimer remain usable below 760px without horizontal overflow.
- [ ] **Step 5: Run the complete test suite** with `npm test`.
- [ ] **Step 6: Commit** with `git add src/components/timeline src/stores/simulation-store.ts src/components/dashboard/DashboardPage.test.tsx src/app/globals.base.css && git commit -m "feat: harden timeline playback and responsive map layout"`.

### Task 5: Final synchronization, build, and handoff

**Files:**
- Modify: `README.md` and `design-qa.md` only if verification status or feature scope is outdated.

- [ ] **Step 1: Synchronize with `origin/main`** and inspect all concurrent changes in map, timeline, dashboard, simulation, library, CSS, package, and test files.
- [ ] **Step 2: Run `npm test`** and record the passing result.
- [ ] **Step 3: Run `npm run build`** and record the passing result.
- [ ] **Step 4: Inspect the final diff** for secrets, unrelated changes, missing accessibility labels, and safety-disclaimer regressions.
- [ ] **Step 5: Commit documentation corrections** if needed; the post-commit hook pushes the commit automatically.
- [ ] **Step 6: Verify the remote branch** with `git status --short --branch`, `git log --oneline --decorate -n 5`, and `git ls-remote origin feature/interactive-map-visualization`.
