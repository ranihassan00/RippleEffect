# Incident Configuration and Forecast Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build the frontend-only incident configuration, simulation controls, forecast, infrastructure, and risk panels for RippleEffect.

**Architecture:** Extend the existing Zustand simulation store and typed local fixtures. Keep business logic in pure `src/lib` helpers, keep panels focused on rendering and events, and preserve the current map/timeline layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, Vitest, Testing Library, existing CSS primitives and lucide-react icons.

## Global Constraints

- Frontend-only; no backend, database, API server, authentication, cloud function, real weather API, geocoding, or persistence service.
- Use typed local dummy data and deterministic calculations; never use random forecast values.
- Preserve the existing dark mission-control visual direction, central map, timeline, left/right rails, and safety disclaimer.
- Do not modify unrelated features or commit directly to `main`.

### Task 1: Domain types, fixtures, validation, and calculations

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/demo-data.ts`
- Modify: `src/lib/forecast.ts`
- Create: `src/lib/scenario.ts`
- Create: `src/lib/scenario.test.ts`

**Interfaces:**
- `validateScenario(scenario): ScenarioErrors`
- `calculateScenarioMetrics(incident, weather, hazard, infrastructure): ScenarioMetrics`
- `getRiskLevel(score): RiskLevel`
- `sanitizeScenario(value): SimulationScenario`
- `DEFAULT_SCENARIO` and `SCENARIO_STORAGE_KEY`

- [ ] Write failing tests for valid defaults, required-field errors, deterministic metrics, risk thresholds, and unsafe loaded values.
- [ ] Run `npm test -- --run src/lib/scenario.test.ts` and confirm the new tests fail for missing helpers.
- [ ] Implement the typed scenario model, hazard-sensitive defaults, infrastructure metadata, validation, sanitization, deterministic metric calculations, and risk scoring.
- [ ] Update existing forecast frame generation to use hazard and weather inputs while preserving current map/timeline interfaces.
- [ ] Run the focused tests and then `npm test`.
- [ ] Commit `feat(incident): add typed scenario calculations and validation`.

### Task 2: Store actions and persistence behavior

**Files:**
- Modify: `src/stores/simulation-store.ts`
- Modify: `src/hooks/useSimulation.ts`
- Create: `src/stores/simulation-store.test.ts`

**Interfaces:**
- `setScenarioField`, `resetScenario`, `runForecast`, `saveScenario`, `loadScenario`
- `simulationNotice`, `validationErrors`, and `modelTimestamp`

- [ ] Write failing store tests for reset, validation-blocked run, successful run, save, load, and safe missing-storage behavior.
- [ ] Run the focused store tests and confirm failure.
- [ ] Implement actions with functional Zustand updates, short simulated calculation state, versioned localStorage handling, and no backend calls.
- [ ] Run store tests and all tests.
- [ ] Commit `feat(simulation): connect scenario controls and local persistence`.

### Task 3: Left-rail configuration components

**Files:**
- Modify: `src/components/dashboard/IncidentPanel.tsx`
- Modify: `src/components/dashboard/WeatherPanel.tsx`
- Create: `src/components/dashboard/HazardSelector.tsx`
- Create: `src/components/dashboard/SimulationControls.tsx`
- Modify: `src/app/globals.overrides.css`
- Modify: `src/components/dashboard/DashboardPage.test.tsx`

- [ ] Add failing interaction tests for incident fields, keyboard hazard selection, numeric validation, reset, and run button behavior.
- [ ] Run the focused UI tests and confirm failure.
- [ ] Implement labeled controlled fields, release parameters, weather controls, hazard defaults, inline errors, and frontend-only simulation controls using existing panel/button/select/slider primitives.
- [ ] Add compact styles consistent with existing rails and responsive behavior.
- [ ] Run UI tests and all tests.
- [ ] Commit `feat(incident): add configuration panels and simulation controls`.

### Task 4: Right-rail forecast, infrastructure, and risk summaries

**Files:**
- Modify: `src/components/dashboard/ForecastPanel.tsx`
- Modify: `src/components/dashboard/InfrastructurePanel.tsx`
- Create: `src/components/dashboard/RiskPanel.tsx`
- Modify: `src/components/dashboard/DashboardPage.tsx`
- Modify: `src/app/globals.overrides.css`

- [ ] Add failing render tests for simulated forecast metrics, semantic infrastructure states, and five risk categories.
- [ ] Run focused tests and confirm failure.
- [ ] Implement reactive summaries from derived store metrics, visible DEMO MODEL/SIMULATED labels, and accessible semantic state text.
- [ ] Integrate panels without replacing the central map or timeline.
- [ ] Run all tests and build.
- [ ] Commit `feat(forecast): add forecast infrastructure and risk summaries`.

### Task 5: Synchronization and final verification

**Files:**
- Modify only files required by validation or conflict resolution.

- [ ] Fetch origin and compare the branch against the latest `origin/main`.
- [ ] Rebase safely onto the latest `origin/main`, preserving teammate changes.
- [ ] Run `npm test` and `npm run build`; inspect the final diff for unrelated changes.
- [ ] Run the app and verify desktop/mobile layout, validation, run/reset, save/load, reactive forecast, infrastructure, risk, map, and timeline behavior.
- [ ] Commit any scoped conflict-resolution or verification fixes.
- [ ] Fetch again, rebase again if needed, and push without force.

