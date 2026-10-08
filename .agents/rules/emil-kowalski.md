---
name: Emil Kowalski Design Skill
description: Motion design, animations, and micro-interactions for dynamic UIs.
trigger:
  - "html"
  - "css"
  - "js"
  - "ts"
  - "vue"
  - "frontend"
  - "ui"
  - "design"
---

# Emil Kowalski Design Engineering Skill

Focus heavily on the "feel" of the interface, motion design, and interaction engineering to make the UI feel alive, physical, and highly responsive:

- **Spring Animations & Custom Easing**: Avoid default `linear` or standard `ease` animations. Use custom cubic-bezier easing curves (e.g., `cubic-bezier(0.32, 0.72, 0, 1)`, or `cubic-bezier(0.22, 1, 0.36, 1)`) or spring-based physics to make motion feel natural, snappy, and physically grounded.
- **Micro-interactions**: Add subtle hover, focus, and active states to ALL interactive elements. Buttons should have a slight scale-down effect on active (e.g., `transform: scale(0.96)`) and a smooth hover transition (e.g., a subtle background color shift or shadow lift).
- **Staggered Animations**: When revealing a list or grid of items, stagger their entrance animations rather than having them appear all at once. This creates a sense of flow and rhythm.
- **Immediate Feedback & State Handling**: Always provide immediate visual feedback for user actions. Use skeleton loaders, spinners, or smooth layout transitions when data is loading. Never leave the user wondering if a click registered.
- **Fluid Layouts (Shared Element Transitions)**: Ensure transitions between different component states (e.g., expanding a card, opening a modal) animate the layout changes smoothly rather than snapping instantly into the new state.
- **Attention to Detail**: Ensure animations do not last too long. Keep most UI transitions under 250ms-300ms so the interface feels fast and never blocks the user.
