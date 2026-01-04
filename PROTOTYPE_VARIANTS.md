# Prototype Variants

This file contains all variant groups and their options for the prototype settings panel.

---

## Carousel Speed

Controls how fast the image carousel rotates between projects.

| Variant Name | Speed (ms) | Description |
|--------------|------------|-------------|
| Fastest | 1000 | 1 second per image |
| Faster | 1500 | 1.5 seconds per image |
| Default | 2000 | Current speed - 2 seconds per image |
| Slower | 2500 | 2.5 seconds per image |

---

## Image Transition

Controls how images transition when rotating in the carousel.

| Variant Name | Value | Description |
|--------------|-------|-------------|
| Instant | instant | Default - images switch immediately |
| Dissolve | dissolve | Smooth crossfade between images |

---

## Adding New Variants

To add a new variant group:

1. Add a new section below with the group name as heading
2. Create a table with variant options
3. Update `SettingsContext.jsx` with the new state
4. Update `SettingsPopover.jsx` with the new select field
5. Wire up the setting to the relevant component

