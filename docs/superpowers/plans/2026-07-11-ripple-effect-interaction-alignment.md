# Ripple Effect Interaction and Alignment Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make targeted accessibility, alignment, disclosure, textarea, and forecast timeline fixes while preserving the approved dashboard.

**Architecture:** Keep the existing Zustand store and component structure. Preserve native scenario selects because their browser menus overlay content and already provide keyboard, Escape, outside-dismiss, and selected-value behavior. Add local summary disclosure and playback speed state only where those behaviors belong.

**Tech Stack:** Next.js App Router, React, TypeScript, Zustand, Vitest, Testing Library, existing CSS.

## Global Constraints

- Preserve layout, colors, typography, borders, spacing, panel widths, map, timeline, fixed full-screen behavior, local data, and component structure.
- No backend, APIs, authentication, database, new features, or component libraries.
- Keep page-level overflow hidden; dropdowns must not push layout; collapsed panels keep width.

### Task 1: Infrastructure icon alignment

Files: modify `src/app/globals.overrides.css`; test `src/components/dashboard/InfrastructurePanel.test.tsx`.

- [ ] Add a focused render test covering school, hospital, transit, road, and fire-station rows.
- [ ] Make `.infra-icon` a 52px square with `flex: 0 0 52px`, `display:flex`, centered alignment, zero padding, and `line-height:1`.
- [ ] Preserve existing border and color styling.

### Task 2: Operational note and Forecast Summary disclosure

Files: modify `src/components/dashboard/IncidentPanel.tsx`, `src/components/dashboard/ForecastPanel.tsx`, `src/app/globals.overrides.css`; tests `src/components/dashboard/IncidentPanel.test.tsx`, `src/components/dashboard/ForecastPanel.test.tsx`.

- [ ] Add a stable `operational-note` class; fix its height to the current visual height, disable manual resize, wrap text normally, and allow internal vertical scrolling.
- [ ] Turn the Forecast Summary heading into an accessible button with `aria-expanded`, `aria-controls`, a visible header in both states, and a rotating chevron.
- [ ] Conditionally render only existing summary contents so the right rail width and outer layout do not change.
- [ ] Test editing the note, disclosure state, aria attributes, and stable panel width.

### Task 3: Forecast Timeline and playback speed

Files: modify `src/components/timeline/ForecastTimeline.tsx`, `src/components/timeline/PlaybackControls.tsx`, `src/app/globals.overrides.css`; test `src/components/timeline/ForecastTimeline.test.tsx`.

- [ ] Keep `forecast.currentMinutes` as the single minute source; add local `playing` and playback-speed state with 0.5x, 1x, 1.5x, and 2x options defaulting to 1x.
- [ ] Ensure exactly one interval exists while playing, speed changes replace its delay immediately, pause/unmount clear it, and 60 minutes loops predictably to 0.
- [ ] Keep progress fill, thumb, CURRENT label, map frame, metrics, and infrastructure values derived from the same current minute.
- [ ] Make Play, Pause, Step Forward, speed, and timeline markers accessible; clicking or keyboard-activating 0, 15, 30, or 60 jumps to those values.
- [ ] Test play/pause/step, marker jumps, speed interval differences, synchronization, and cleanup.

### Task 4: Verify and commit

- [ ] Run focused tests, then the full Vitest suite, `git diff --check`, and `npm run build`.
- [ ] Run an HTTP smoke check against the local dev server and confirm no framework error overlay or page-level scrollbar.
- [ ] Review the diff for unintended layout changes and commit on `agent/ripple-effect-interaction-alignment`.
