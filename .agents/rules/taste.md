---
name: Taste Design Skill
description: Guidelines for high-tier aesthetic judgment and modern UI design patterns.
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

# Taste Design Skill

When designing or writing UI code, enforce the following aesthetic guidelines to ensure the application feels premium, modern, and bespoke rather than like a generic template:

- **Avoid Generic Patterns**: Do not use default UI library looks without customizing them.
- **Sophisticated Color Palette**: Avoid stark black (`#000`) or pure white (`#FFF`) for backgrounds or text. Use off-whites (e.g., `#FAFAFA`, `#FCFCFC`) and rich darks (e.g., `#111111`, `#1C1C1E`) to reduce eye strain and look more modern.
- **Subtle Styling**: Use very subtle borders (e.g., `1px solid rgba(0,0,0,0.05)` or `rgba(255,255,255,0.1)` in dark mode), soft diffuse shadows (e.g., `box-shadow: 0 4px 24px -4px rgba(0,0,0,0.05)`), and gentle gradients instead of flat, harsh, highly saturated colors.
- **Modern Corners (Border Radius)**: Use appropriate border-radiuses depending on the element size (e.g., 6px-8px for buttons, 12px-16px for cards, 24px for large modals). Always use nested border-radiuses correctly (outer radius = inner radius + padding).
- **Whitespace is a First-Class Citizen**: Embrace negative space. UI should feel breathable and uncrowded. Do not cram elements together.
- **Minimalism & Intent**: Every element must have a clear purpose. Remove unnecessary borders, dividers, or background colors if whitespace can do the job of separating content. Let the content speak for itself.
