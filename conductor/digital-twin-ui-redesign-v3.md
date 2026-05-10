# Digital Twin UI Redesign (v3 - No Truncation)

## Objective
Update the `DataRow` and `StatusCard` components to ensure all text information is fully visible without any truncation. To create more space for text, we will reduce the size of the icons and adjust the internal padding/margins.

## Proposed Changes

### 1. DataRow (Sensor Data)
- **Remove Truncation**: Remove the `truncate` class from the label so that long sensor names wrap naturally or are fully displayed.
- **Icon Sizing**: Reduce the icon wrapper padding (e.g., from `p-2` to `p-1.5`) to save horizontal space.
- **Layout Adjustments**: Change `flex-1 min-w-0` behavior if needed so that the label and value gracefully share space, allowing the label to wrap instead of cut off.

### 2. StatusCard (Global Controls)
- **Remove Truncation**: Remove the `truncate` class from the `title` element.
- **Icon Sizing**: Shrink the icon wrapper from `p-2.5 rounded-xl` to a smaller footprint like `p-1.5 rounded-lg` and use slightly smaller SVG icons if necessary, freeing up more width for the text.
- **Information Layout**: 
  - Ensure the flex container allows the title and subtitle to wrap onto multiple lines if needed.
  - Keep the full-card clickable "overlay" structure from the previous step but tighten the internal gaps to make the text the primary focus.
  - The status indicator badge on the right will remain, but its padding can be slightly reduced to give the title more breathing room.

## Verification
- Verify that no text is hidden by ellipses (`...`).
- Verify that icons are visually smaller but still clear.
- Ensure the interactive overlay feel is maintained for the controls.
