# Integration of AI Engine with Digital Twin Farming System

This plan outlines the steps to integrate the standalone FastAPI `ai-engine` into the Next.js `digital-twin-farming-system`.

## Objective
Enable real-time AI-driven recommendations and automation settings by connecting the Next.js API routes to the `ai-engine` service.

## Key Files & Context
- `digital-twin-farming-system/lib/types.ts`: Shared TypeScript interfaces.
- `digital-twin-farming-system/app/api/automation/ai-generate/route.ts`: API route for generating AI automation.
- `digital-twin-farming-system/app/api/recommendation/generate/route.ts`: API route for generating AI recommendations.
- `ai-engine/`: Standalone FastAPI service providing the AI logic.

## Implementation Steps

### Phase 1: Cleanup & Standardization
1.  **Fix Duplicate Interface**: Remove the redundant and incorrect `AutomationSettings` definition in `digital-twin-farming-system/lib/types.ts`.
2.  **Verify Environment Variable**: Ensure `FASTAPI_URL` is used to point to the `ai-engine` service.

### Phase 2: Automation Integration
1.  **Update `ai-generate` Route**:
    - Modify `digital-twin-farming-system/app/api/automation/ai-generate/route.ts` to call `POST /automation/recommend` on the `ai-engine`.
    - Inject the requested `trayId` into the returned `AIAutomationRecommendation` object.
    - Implement a try-catch block to fall back to `generateMockAutomationRecommendation` if the `ai-engine` is unavailable.

### Phase 3: Recommendation Integration (Review)
1.  **Verify `recommendation/generate` Route**:
    - Ensure it correctly passes the `trayId` through and handles the `ai-engine` response.
    - Inject the `trayId` into the `Recommendation` object returned from the `ai-engine`.
    - Confirm it persists generated recommendations to the database if available.

## Verification & Testing
1.  **Manual Test (Automation)**:
    - Trigger "Generate AI Automation" from the UI.
    - Verify that the request is sent to the `ai-engine` (check logs).
    - Verify that the UI updates with the AI-suggested settings.
2.  **Manual Test (Recommendation)**:
    - Trigger "Generate Recommendation" from the UI.
    - Verify the `ai-engine` is called and the recommendation is displayed.
3.  **Fallback Test**:
    - Stop the `ai-engine` service.
    - Verify that the Next.js app gracefully falls back to mock data without crashing.
