# Change Automation Profile Save Logic to Upsert

## Objective
Change the behavior of saving automation profiles so that it updates the existing profile for a tray instead of appending a new row every time.

## Key Files & Context
- `lib/db-repository.ts`: Contains the `insertAutomationProfile` function which currently executes an `INSERT` statement.

## Implementation Steps
1. **Modify `insertAutomationProfile`**:
   - Check if an automation profile already exists for the given `trayId` using a `SELECT` query.
   - If a row exists, execute an `UPDATE` statement to modify the existing row's fields (mode, start time, end time, spectrum, temperatures, pump intervals) and update its `created_at` timestamp.
   - If no row exists, fallback to the current behavior and execute an `INSERT` statement to create a new row for the tray.
   - Both branches must return the saved/updated `AutomationSettingsRow` to maintain compatibility with the rest of the application.

## Verification & Testing
- Use the UI to save a manual profile for a tray.
- Check the database (via a mock or separate query) to confirm only one row exists for that tray in `automation_profiles` and that its values have been updated.
- Verify that creating a profile for a brand new tray correctly inserts a new row.