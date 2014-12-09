React Animation
===
Animate multiple elements on a time-based scale.

Still very experimental! Code is really fugly at the moment - will improve this once the API feels complete-ish.

Inspiration
---
The great work of Cheng Lou and Pete Hunt

How does it work?
---
It spawns the calculations of the animation into a webworker. The webworker updates the animation values when needed, and these animation values are picked up inside a requestAnimationFrame. 

What's missing?
---
- Work with element dimensions

  Currently working on fixing this with:
  ```
          left: DOMOperation(function(refs) {
            return refs.animatingElement.getDOMNode().offsetLeft;
          }),
  ```
  Not sure if this is the right approach though - it does show a weak part in the current design.

- Pause animation
- Jump to time position
- Jump to percentage
- Examples

LICENSE
---
MIT