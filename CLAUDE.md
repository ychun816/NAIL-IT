🛠️ Developer Instruction: "Aura-Grit" Design System
Context: All UI/UX components and visual assets generated must strictly adhere to the following CSS/Design specifications to replicate the "Aura-Grit" aesthetic.

1. Color Tokens (SCSS/CSS Variables)
CSS
:root {
  --bg-cobalt: #4A72E4;
  --aura-outer: #F0949F;
  --aura-mid: #F7A376;
  --aura-core: #FDE4C9;
  --text-primary: #FFFFFF;
}
2. Visual Layering Logic
The Background: Use --bg-cobalt. If a gradient is needed, use a subtle radial-gradient from center #5C85F5 to edges #3D60C2.

The Glow (Aura): Organic shapes must be rendered with a "multi-stop blur." Do not use single-color shadows.

Implementation: Layer three elements or use a filter: blur(40px) on a div containing a radial-gradient from --aura-core (0%) to --aura-mid (50%) to --aura-outer (100%).

Texture (The Grit): Apply a global overlay.

CSS/SVG Filter: Use an SVG feTurbulence filter with type="fractalNoise", baseFrequency="0.80", and numOctaves="4".

Blend Mode: Apply this texture using mix-blend-mode: overlay or soft-light at 15-20% opacity.

3. Typography Constraints
Headers: Use a high-contrast Serif font-family.

Styling: font-weight: 700; letter-spacing: -0.02em; line-height: 0.95;

Metadata/UI: Use a condensed heavy Sans-Serif.

Styling: text-transform: uppercase; font-stretch: condensed; font-weight: 900;

4. Rendering Instructions
Avoid: Crisp edges, flat vector shapes, and modern "glassmorphism."

Prefer: "Liquid" transitions, dithering effects, and simulated analog print artifacts.