# Refactor Automation Logs Schema

## Background & Motivation
Currently, the `automation_logs` table uses a `device_type` and `action` column pattern. This enforces a strict single-device-per-event limitation. In the `simulateAutomation` function, if the fan and LED both need to change state at the exact same millisecond, only the highest priority device is logged. We are transitioning to a structure where the log records the status of each device directly (`led_status`, `fan_status`, `pump_status`), allowing a single log entry to capture multiple concurrent device state changes.

## Scope & Impact
This change affects the database schema, TypeScript interfaces, database mappers and repositories, automation API endpoints, and the frontend automation UI.

## Proposed Solution

### 1. Database Schema
Create a new migration file (e.g., `db/migrations/007_automation_logs_status.sql`) to alter the existing table:
*   Drop `device_type` and `action` columns.
*   Add `led_status`, `fan_status`, and `pump_status` columns (type `text`, nullable).

### 2. Type Definitions (`lib/types.ts`)
*   Update `AutomationEvent` to remove `device` and `action` properties.
*   Add optional `ledStatus`, `fanStatus`, and `pumpStatus` properties.

### 3. Data Access Layer (`lib/db-mappers.ts` & `lib/db-repository.ts`)
*   Update `AutomationLogRow` interface in mappers.
*   Update `mapAutomationEvent` to correctly map the new snake_case database columns to camelCase properties.
*   Update `insertAutomationLog` in `db-repository.ts` to include the new columns in the `INSERT INTO` SQL statement and the `RETURNING` clause.

### 4. API Routes & Simulation Logic
*   **`lib/mock-data.ts`**: Update the `simulateAutomation` function to accumulate all device state changes into a single `AutomationEvent` object, setting the respective `*Status` property if the device changed state. Update the `message` to reflect the combination of changes if multiple occur.
*   **`app/api/automation/manual/route.ts`**: Update the hardcoded `insertAutomationLog` call to pass the relevant device statuses instead of `device: "led", action: "on"`.
*   **`app/api/automation/apply-ai/route.ts`**: Update the hardcoded `insertAutomationLog` call similarly.

### 5. Frontend (`app/automation/page.tsx`)
*   Update the rendering of `automationEvent` at the bottom of the simulation section. Since `automationEvent.device` will no longer exist, update the UI to either just display the `message` or map over the changed statuses to show badge indicators for the affected devices.

## Alternatives Considered
*   **Keep schema, log multiple rows**: This would maintain the standard event sourcing pattern but would result in more rows in the database for simultaneous events. The chosen approach compresses simultaneous events into single contextual rows, which aligns better with the user's explicit preference.

## Verification & Testing
1.  Run the database migration successfully.
2.  Trigger a manual automation save and verify it writes correctly to the DB.
3.  Run the simulation in the UI and change the mock time/temperature such that *both* the LED schedule and Fan trigger are crossed simultaneously. Verify that a single log event is generated containing both statuses, and the frontend renders it without errors.