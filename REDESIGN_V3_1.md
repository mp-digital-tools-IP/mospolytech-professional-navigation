# Redesign V3.1 — UX/UI iteration

## Goal
Bring the public MVP closer to the visual language and user flow expected from an official Moscow Polytechnic digital product.

## P0 — completed in this iteration
- Official Moscow Polytechnic logo asset in the sidebar.
- Gilroy-first typography stack with larger readable text and stronger hierarchy.
- Rebuilt left navigation with aligned SVG icons and consistent row rhythm.
- New hero block with a real student visual instead of an abstract placeholder.
- Five-step working diagnostic flow:
  1. professional interests;
  2. work values;
  3. study readiness;
  4. educational conditions;
  5. work preferences.
- LocalStorage persistence and resume-after-reload.
- Real progress 0/5 → 5/5 in the right sidebar.
- Recommendations recalculated after diagnostics.
- Results screen shows RIASEC scales and explanation instead of a hard personality diagnosis.
- TOP-10 remains explainable and links to profession/program/market details.
- Offline/fallback mode remains available when backend is disconnected.
- Educational trajectory keeps EGE/DVI before admission, entrance exam before master's degree, DPO as a separate node, and three career branches.

## Brand basis
- Primary typeface: Gilroy (official Moscow Polytechnic logo/brand guide).
- Monochrome logo remains the default visual anchor.
- Accent colors are restrained; interface avoids overusing non-brand decorative colors.

## Acceptance scenarios
1. A grade-11 student understands the purpose of the site within 5 seconds.
2. Diagnostics can be completed from start to finish without external instructions.
3. The user sees why a profession was recommended.
4. A creative-program applicant sees DVI preparation before the educational program.
5. A bachelor graduate sees the master's entrance exam before the master's program.
6. The public page remains usable when live backend is unavailable.

## Next sprint
- Exact production webfont connection after an official licensed webfont source is provided.
- Deeper UX test of diagnostics on mobile.
- Real event feed from mospolytech.ru.
- Authentication/profile synchronization.
- Backend tunnel connection and live market/master-data updates.
