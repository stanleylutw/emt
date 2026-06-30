# EMT 協勤日誌

Single-page EMT duty log for volunteer shift tracking. The app runs as a static HTML/CSS/JS site, stores fast local state in IndexedDB/localStorage, and syncs authenticated data to Supabase.

## Main Features

- Google login through Supabase Auth.
- Today duty timeline with event/standby rows.
- Offline-first pending queue for insert/update/delete/profile changes.
- History view by day or month with TXT/CSV export.
- Profile page with local cache and no-op save detection.
- Summary dashboard for today/month/year/all records.
- Vital-sign warning backgrounds in the edit sheet.

## Project Files

- `index.html`: Static page structure and UI hooks.
- `styles.css`: Shared visual system and responsive layout.
- `app.js`: Application state, Supabase access, IndexedDB cache, sync queue, timeline/history logic.
- `FUNCTION_UI_PLAN.md`: Canonical function/UI plan. Update this before changing major behavior.
- `supabase/`: Production SQL migrations and fresh-install schema.

## Local Development

This project has no build step.

```bash
# Syntax check JavaScript
node --check app.js

# Serve locally, for example
python3 -m http.server 5500
```

Then open `http://localhost:5500/`.

## Supabase Setup

Run SQL files in order in the Supabase SQL editor for a new database:

1. `supabase/v1_0_init.sql`
2. `supabase/v1_1_profiles.sql`
3. `supabase/v1_2_dispatch_constraints.sql`
4. `supabase/v1_3_summary_rpc.sql`

For existing production databases, apply only migrations that have not yet been run. `v1_3_summary_rpc.sql` creates `get_duty_summary(p_start, p_end)`, used by the dashboard. If the RPC is missing, the frontend falls back to the older two-query summary path.

## Release Notes

- `APP_VERSION` and `APP_RELEASE_STAMP` live in `app.js`.
- `APP_RELEASE_STAMP` should be regenerated for each release/build time.
- When bumping `APP_RELEASE_STAMP` in `app.js`, also update the matching `?v=` query string on the `app.js` and `styles.css` tags in `index.html` to the same value — this is what forces browsers/GitHub Pages cache to fetch the new build.
- The deployed site is served by GitHub Pages from this repository/branch configuration.
- After changing Supabase constraints, apply the matching SQL to production before relying on the frontend change.

## Sync Queue Notes

Pending writes are stored locally and retried in the background. Constraint or invalid-payload failures are marked as blocked so they do not create a retry storm. The top header shows pending status; blocked items can be expanded, retried, or cleared after a 4-digit confirmation.

## Maintenance Rule

Before adding or changing a feature, update `FUNCTION_UI_PLAN.md` when the change affects user flow, persistence, database schema, or UI structure. This keeps implementation and interface behavior aligned.
