React Animation
===
Animate multiple elements on a time-based scale.

Inspiration
---
The great work of Cheng Lou and Pete Hunt

How does it work?
---
It spawns the calculations of the animation into a webworker. The webworker updates the animation values when needed, and these animation values are picked up inside a requestAnimationFrame. 

What's missing?
---
- Easing, and easing
- Pause animation
- Jump to time position
- Jump to percentage
- Examples
