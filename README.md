React Magician
===
Declaratively animate React components. React Magician aims to be simple to use, yet flexible and powerful.

Example:
```
this.animations = {
      fooBarAnimation: Animation.create({
        '0ms': { // time based
          blockA: {
            left: 0,
            position: 'absolute',
            top: 0,
            width: 200,
            transform: 'rotate(0deg)'
          },
          blockB: { // yes, we support multiple elements
            left: 0
          }
        },
        'a: ?ms': { // we don't know how long this lasts, the spring easing determines when it ends.
                    // a: indicates a label with the name a
          blockA: {
            left: 100,
            transform: 'rotate(90deg)', // we automatically make this work for you
            easing: EasingTypes.spring({
              mass: 1,
              spring: 30,
              damping: 4
            })
          }
        },
        '400ms': { // here we animate the top based on time, with the default linear easing
          blockA: {
            top: 300
          }
        },
        'b: ?ms': {
          blockB: {
            left: 1000,
            easing: EasingTypes.spring({
              mass: 1,
              spring: 50,
              damping: 3
            })
          }
        },
        'a + 100ms': { // 100ms after animation block with label a is done
          blockA: {
            left: 20
          }
        },
        'a + 2000ms': {
          blockA: {
            left: 100
          }
        },
        'a + b + 200ms': { // 200ms after both a and b are done
          blockB: {
            left: 100
          }
        }
      })
};
```

Future plans
---
The current focus is on the API, and making it simple to orchestrate complex animations based on time, touch or mouse.
For now we're mostly focusing on making sure the timing API provides everything that's needed.

Performance:
- re-use objects


LICENSE
---
MIT

