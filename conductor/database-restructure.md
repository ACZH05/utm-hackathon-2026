# Database Restructure: Racks and Trays

## Background & Motivation
The current application uses a global, single-context database schema. To support multiple "Racks" and "Trays", and allow users to select a specific rack and tray to set automation, we need to restructure the database. This involves adding explicit `Rack` and `Tray` entities and establishing relationships between the trays and the telemetry/automation tables.

## Scope & Impact
This is a comprehensive change that affects the database schema, the data access layer (`db-repository.ts`), the API routes, and the frontend components (Dashboard and Automation pages).

## Proposed Solution

### 1. Database Schema (New Migration)
Create a new migration file (e.g., `db/migrations/003_racks_and_trays.sql`) to:
*   **Create `racks` table:** `id`, `name`, `created_at`.
*   **Create `trays` table:** `id`, `rack_id` (foreign key to `racks`), `name`, `plant_profile_id` (foreign key to `plant_profiles`), `created_at`.
*   **Alter existing tables:** Add `tray_id` as a foreign key to `sensor_readings`, `device_states`, `automation_profiles`, `automation_logs`, `alerts`, and `recommendations`.
*   **Data Migration (Optional):** If needed, create a default "Demo Rack" and "Demo Tray" and associate all existing records with it to prevent data loss.

### 2. Type Definitions (`lib/types.ts`)
*   Add `Rack` and `Tray` interfaces.
*   Update `SensorReading`, `DeviceState`, `AutomationSettings`, `Alert`, and `Recommendation` to include `trayId`.

### 3. Data Access Layer (`lib/db-repository.ts` and `lib/db-mappers.ts`)
*   Add new methods: `getRacks()` and `getTrays(rackId)`.
*   Update all `getLatest...` and `insert...` methods to accept and utilize `trayId` for filtering and inserting. For example, `getLatestSensorReading(sql, trayId)`.
*   Update mapper functions to include `tray_id`.

### 4. API Routes
*   Create new API routes to fetch racks and trays (e.g., `/api/racks`, `/api/racks/[rackId]/trays`).
*   Update existing API routes (e.g., `/api/dashboard`, `/api/automation/*`) to require a `trayId` parameter (via URL query or request body).

### 5. Frontend Modifications
*   **Automation Page (`app/automation/page.tsx`):** Add a UI section at the top to select a Rack and a Tray. Update state management to fetch the dashboard state specific to the selected tray.
*   **Dashboard Page (`app/dashboard/page.tsx`):** Similar to the automation page, add Rack/Tray selectors to filter the displayed sensor readings and device states.

## Verification
*   Verify that the new database migration runs successfully (`npm run db:migrate` or equivalent).
*   Verify that racks and trays can be created and fetched.
*   Verify that selecting a specific rack and tray in the UI loads the correct sensor readings, device states, and automation profiles.
*   Verify that saving an automation profile associates it only with the selected tray.