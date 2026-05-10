# Revised Digital Twin UI Plan

## Objective
Redesign the Sensor Data and Global Control cards based on user feedback. The sensor card will retain its list structure but use a new color palette. The global control card will feature a new "overlay" button structure where the status color is prominent.

## Proposed Changes

### 1. Sensor Data Card (Color Update)
- **Background**: Change from the solid `bg-green-600` to a deep, modern blue/slate theme (e.g., `bg-slate-800`).
- **Inner Elements (DataRow)**:
  - Update the icon background to a translucent accent color (e.g., `bg-blue-500/20 text-blue-400`).
  - Change text colors to crisp white for values and light gray for labels to ensure high contrast.
  - Retain the vertical list structure.

### 2. Global Control Card (Overlay Button Structure)
- **Container**: Retain the dark theme (`bg-gray-900`) but improve spacing.
- **StatusCard Redesign (Overlay Structure)**:
  - Redesign the `StatusCard` as an interactive, relative container.
  - **Overlay Element**: Instead of a small pill button, the "button" will act as an overlay that spans the card or sits prominently over a portion of it, retaining the semantic status color (Green for Normal/On, Red for Critical, Yellow for Warning, Gray for Off).
  - Structure: A base card containing the Title and Icon. Overlaid on the right side (or filling the background via a gradient/translucency) will be the large status button area that the user clicks.
  - This creates a more tactile "smart home tile" feel while keeping the exact same backend toggles.

## Verification
- Verify the sensor card color changes look cohesive.
- Verify the global control cards have a clear "overlay" button feel.
- Ensure all click events (toggles) function identically to the original implementation.
