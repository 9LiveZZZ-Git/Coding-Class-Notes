# Lesson: Debugging p5.js and GLSL Code

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Why Debugging Matters

Every programmer, at every skill level, spends a significant portion of their time debugging. Debugging is not a sign that you are doing something wrong -- it is a fundamental part of the process. The difference between a beginner and an expert is not that the expert writes fewer bugs; it is that the expert finds and fixes them faster.

This lesson covers practical debugging strategies for the two languages we use most in this course: **JavaScript** (in p5.js) and **GLSL** (fragment and vertex shaders).

---

## Part 1: Debugging p5.js (JavaScript)

### Tool 1: `console.log()`

The single most important debugging tool. It prints a value to the browser's console. Use it to answer the question: "What is the value of this variable right now?"

```js
function draw() {
  let angle = atan2(mouseY - height / 2, mouseX - width / 2);
  console.log("angle:", angle);  // What value does angle actually have?

  // ... rest of your code
}
```

**Tips for effective `console.log()` usage:**

1. **Label your output**: Always include a string label so you know what you are looking at.
   ```js
   console.log("x:", x, "y:", y, "vel:", vel.x, vel.y);
   ```

2. **Log once, not 60 times per second**: If you put `console.log()` in `draw()`, it runs 60 times per second and floods the console. Use `frameCount` to limit output:
   ```js
   if (frameCount % 60 === 0) {
     console.log("fps:", frameRate().toFixed(1), "particles:", particles.length);
   }
   ```

3. **Log at the point of failure**: If something goes wrong at a specific moment, log the values involved:
   ```js
   if (isNaN(pos.x)) {
     console.log("ERROR: pos.x is NaN! vel:", vel.x, vel.y, "acc:", acc.x, acc.y);
   }
   ```

4. **Use `console.table()`** for arrays of objects:
   ```js
   console.table(particles.slice(0, 5)); // show first 5 particles as a table
   ```

### Tool 2: The Browser Developer Console

Open it with:

- **Chrome/Edge**: F12 or Ctrl+Shift+J (Cmd+Option+J on Mac)
- **Firefox**: F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)

The console shows:

- Your `console.log()` output
- Error messages with file names and line numbers
- Warnings about deprecated features

**Always keep the console open while developing.** Many bugs are immediately explained by an error message that you would otherwise never see.

### Tool 3: p5.js Friendly Error System (FES)

p5.js has a built-in "Friendly Error System" that tries to explain errors in plain language. For example:

```
p5.js says: circle() was expecting Number for the first parameter, received string instead.
```

This is much more helpful than a raw JavaScript error. The FES catches common mistakes like:

- Wrong number of arguments to a function
- Wrong argument types
- Using a function before `setup()` has run
- Calling `loadImage()` outside `preload()`

### Common p5.js Errors and Fixes

#### "X is not defined"

```
ReferenceError: myVariable is not defined
```

**Cause**: You are using a variable that has not been declared, or you declared it inside a function and are trying to use it outside.

**Fix**: Check spelling. Check scope. Declare the variable in the right place.

```js
// WRONG: declared inside setup, used in draw
function setup() {
  createCanvas(400, 400);
  let myColor = color(255, 0, 0);
}

function draw() {
  fill(myColor); // ERROR: myColor is not defined here
}

// RIGHT: declare at the top level
let myColor;

function setup() {
  createCanvas(400, 400);
  myColor = color(255, 0, 0);
}

function draw() {
  fill(myColor); // works
}
```

#### "Cannot read property of undefined"

```
TypeError: Cannot read properties of undefined (reading 'x')
```

**Cause**: You are trying to access a property (`.x`) on something that is `undefined`.

**Fix**: Check what the variable actually is. Usually an array index is out of bounds or an object was not initialized.

```js
let particles = [];

function draw() {
  // BUG: if particles is empty, particles[0] is undefined
  let p = particles[0];
  circle(p.x, p.y, 10); // ERROR if particles is empty

  // FIX: check first
  if (particles.length > 0) {
    let p = particles[0];
    circle(p.x, p.y, 10);
  }
}
```

#### "X is not a function"

```
TypeError: myThing.display is not a function
```

**Cause**: You are calling `.display()` on something that does not have a `display` method. Check the object's type.

#### NaN (Not a Number)

NaN is insidious because it does not throw an error -- it silently spreads through your calculations. Any arithmetic involving NaN produces NaN.

```js
let x = 0 / 0;         // NaN
let y = x + 5;         // NaN (NaN is contagious)
let z = sqrt(-1);       // NaN
let w = parseInt("abc"); // NaN
```

**How to detect NaN:**

```js
if (isNaN(value)) {
  console.log("WARNING: value is NaN");
}
```

**Common causes of NaN in p5.js:**

- Dividing by zero: `velocity.x / distance` when `distance` is 0
- Normalizing a zero-length vector: `createVector(0, 0).normalize()` (returns NaN)
- Reading an uninitialized variable
- `atan2(0, 0)` (technically returns 0 in JavaScript, but be cautious)

**Fix**: Add safety checks before division and normalization:

```js
let distance = p5.Vector.dist(a, b);
if (distance > 0.001) {
  let force = direction.div(distance);
}
```

### Tool 4: Visual Debugging

Sometimes the best debugging tool is drawing the data you are inspecting.

```js
// Visualize velocity vectors
for (let p of particles) {
  // Draw particle
  fill(255);
  circle(p.pos.x, p.pos.y, 8);

  // Draw velocity as a green line
  stroke(0, 255, 0);
  let tip = p5.Vector.add(p.pos, p5.Vector.mult(p.vel, 10));
  line(p.pos.x, p.pos.y, tip.x, tip.y);

  // Draw acceleration as a red line
  stroke(255, 0, 0);
  let accTip = p5.Vector.add(p.pos, p5.Vector.mult(p.acc, 100));
  line(p.pos.x, p.pos.y, accTip.x, accTip.y);
}
```

This immediately shows you if vectors are pointing the wrong way, if velocities are too large, or if forces are not being applied correctly.

### Tool 5: The Debugger

The browser's built-in debugger lets you pause execution and step through code line by line. In the console, type `debugger;` in your code where you want to pause:

```js
function draw() {
  for (let p of particles) {
    if (isNaN(p.pos.x)) {
      debugger; // execution pauses here; inspect variables in the console
    }
    p.update();
  }
}
```

You can also set breakpoints by clicking line numbers in the Sources tab of Developer Tools.

---

## Part 2: Debugging GLSL Code

Debugging shaders is harder than debugging JavaScript because:

1. **No `console.log()`**: There is no way to print values from a shader.
2. **No debugger**: You cannot step through shader code.
3. **Errors are compile-time**: GLSL errors happen when the shader is compiled, before it runs.
4. **Silent failures**: Many mistakes produce no error -- just wrong visual output.

### GLSL Compile Errors

When a GLSL shader fails to compile, the browser reports an error in the console. These errors can be cryptic. Here are the most common ones:

#### Integer vs. Float Strictness

**The most common GLSL error in this course.** GLSL is strict about numeric types. A bare integer is not a float.

```glsl
// WRONG:
float x = 1;              // ERROR: cannot assign int to float
vec3 c = vec3(0);          // ERROR on some implementations
float y = x + 1;           // ERROR: cannot add int to float

// RIGHT:
float x = 1.0;
vec3 c = vec3(0.0);
float y = x + 1.0;
```

**The rule:** Every floating-point number must have a decimal point. Write `0.0`, not `0`. Write `1.0`, not `1`. Write `2.0`, not `2`.

#### Missing Precision Qualifier

```
ERROR: No precision specified for (float)
```

**Fix:** Add `precision mediump float;` at the top of your fragment shader:

```glsl
precision mediump float;

// ... rest of shader
```

#### Undeclared Variable or Function

```
ERROR: 'myVar' : undeclared identifier
```

**Fix:** Check spelling. Check that the variable is declared before use. Check that uniform declarations match what you pass from JavaScript.

#### Type Mismatch

```
ERROR: cannot convert from 'float' to 'vec2'
```

**Fix:** Check that operations match types. You cannot add a `float` to a `vec2` directly -- you need `vec2(float_val)` or use the float as a scalar multiplier.

```glsl
// WRONG:
vec2 uv = fragCoord + 0.5;      // ambiguous

// RIGHT:
vec2 uv = fragCoord + vec2(0.5); // explicit
// OR:
vec2 uv = fragCoord + 0.5;      // actually this works: scalar is broadcast
// But be explicit when unsure
```

### Visual Debugging Techniques for GLSL

Since you cannot print values, you **display them as colors**.

#### Technique 1: Output the Value as Color

```glsl
// What is the UV coordinate at each pixel?
vec2 uv = fragCoord / u_resolution;
gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
// Red channel shows X, Green shows Y
```

If the gradient looks wrong (e.g., upside down), you know the coordinate system is flipped.

#### Technique 2: Output a Single Value as Grayscale

```glsl
float value = someComputation();
// Visualize: 0.0 = black, 1.0 = white
gl_FragColor = vec4(vec3(value), 1.0);
```

If the screen is all black, the value is 0 (or negative). If it is all white, the value is 1 (or greater). If it is gray, the value is somewhere in between.

#### Technique 3: Color-Code Positive and Negative

```glsl
float value = someComputation();
if (value > 0.0) {
    gl_FragColor = vec4(value, 0.0, 0.0, 1.0); // positive = red
} else {
    gl_FragColor = vec4(0.0, 0.0, -value, 1.0); // negative = blue
}
```

#### Technique 4: Visualize Vector Direction

```glsl
vec2 flow = computeFlowField(uv);
// Map direction from [-1, 1] to [0, 1] for display
gl_FragColor = vec4(flow * 0.5 + 0.5, 0.0, 1.0);
```

#### Technique 5: Step-by-Step Isolation

Comment out parts of your shader and render intermediate results:

```glsl
// Step 1: Is the UV coordinate correct?
// gl_FragColor = vec4(uv, 0.0, 1.0); // uncomment to check

// Step 2: Is the noise function working?
float n = noise(uv * 10.0);
// gl_FragColor = vec4(vec3(n), 1.0); // uncomment to check

// Step 3: Final color
vec3 col = palette(n);
gl_FragColor = vec4(col, 1.0);
```

By uncommenting each step one at a time, you can find exactly where the computation goes wrong.

---

## Part 3: Common Pitfalls in p5.js

### Pitfall 1: Using `color()` Before `createCanvas()`

```js
let bg = color(20, 0, 40); // ERROR: p5.js is not yet initialized

function setup() {
  createCanvas(400, 400);
}
```

**Fix:** Create colors inside or after `setup()`:

```js
let bg;

function setup() {
  createCanvas(400, 400);
  bg = color(20, 0, 40); // works
}
```

### Pitfall 2: WEBGL Coordinate Origin

In 2D mode, `(0, 0)` is the top-left corner. In WEBGL mode, `(0, 0)` is the **center** of the canvas.

```js
// 2D mode:
circle(0, 0, 50);  // draws at top-left corner

// WEBGL mode:
circle(0, 0, 50);  // draws at CENTER of canvas
```

If your WEBGL sketch looks offset, this is probably why. Convert mouse coordinates:

```js
let mx = mouseX - width / 2;
let my = mouseY - height / 2;
```

### Pitfall 3: Drawing Order and `background()`

If you call `background()` at the end of `draw()`, it erases everything you just drew:

```js
// WRONG:
function draw() {
  circle(mouseX, mouseY, 50);
  background(0); // oops, erased the circle
}

// RIGHT:
function draw() {
  background(0);
  circle(mouseX, mouseY, 50);
}
```

### Pitfall 4: Array Modification During Iteration

Removing elements from an array while iterating forward skips elements:

```js
// WRONG:
for (let i = 0; i < particles.length; i++) {
  if (particles[i].isDead()) {
    particles.splice(i, 1); // element at i+1 shifts to i, gets skipped
  }
}

// RIGHT: iterate backward
for (let i = particles.length - 1; i >= 0; i--) {
  if (particles[i].isDead()) {
    particles.splice(i, 1);
  }
}
```

### Pitfall 5: `loadImage()` Outside `preload()`

```js
// WRONG:
let img;

function setup() {
  createCanvas(400, 400);
  img = loadImage("photo.jpg"); // image may not be loaded when draw() starts
}

function draw() {
  image(img, 0, 0); // might fail or show nothing
}

// RIGHT:
let img;

function preload() {
  img = loadImage("photo.jpg"); // guaranteed to load before setup() runs
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  image(img, 0, 0); // works
}
```

---

## Part 4: Common Pitfalls in GLSL

### Pitfall 1: Integer Division

```glsl
float x = 1 / 3;   // Result: 0 (integer division!)
float x = 1.0 / 3.0; // Result: 0.333...
```

### Pitfall 2: Uninitialized Variables

GLSL does not initialize variables to zero:

```glsl
float total; // could be anything!
for (int i = 0; i < 10; i++) {
    total += values[i]; // adding to garbage
}

// FIX:
float total = 0.0;
```

### Pitfall 3: Branching on Float Equality

```glsl
// DANGEROUS:
if (x == 0.5) { ... } // floating point may never be exactly 0.5

// SAFER:
if (abs(x - 0.5) < 0.001) { ... }
```

### Pitfall 4: Texture Coordinate Range

Texture coordinates in GLSL should be in `[0, 1]`. If you accidentally pass pixel coordinates (e.g., 0-600), the texture lookup wraps or clamps and you get a single pixel color across the entire screen.

```glsl
// WRONG:
vec4 c = texture2D(tex, fragCoord); // fragCoord is in pixels!

// RIGHT:
vec2 uv = fragCoord / u_resolution;
vec4 c = texture2D(tex, uv);        // uv is in [0, 1]
```

---

## Part 5: A Debugging Methodology

When something goes wrong, follow these steps in order:

1. **Read the error message.** Most errors are explained by the error message. Read it carefully.

2. **Check the console.** Open the browser console (F12) and look for errors you might have missed.

3. **Isolate the problem.** Comment out code until the error goes away, then uncomment pieces one at a time to find the exact line that causes the issue.

4. **Check your assumptions.** Use `console.log()` (JavaScript) or color-output (GLSL) to verify that variables have the values you expect.

5. **Simplify.** Create the smallest possible sketch that reproduces the bug. Often, the act of simplifying reveals the problem.

6. **Search the error message.** Copy the error text into a search engine. Someone else has almost certainly had the same problem.

7. **Take a break.** Seriously. Walk away for 10 minutes. Fresh eyes find bugs faster.

---

## Further Resources

- p5.js Field Guide to Debugging: <https://beta.p5js.org/tutorials/field-guide-to-debugging>
- p5.js Error Reference: <https://p5js.org/reference/>
- Chrome DevTools Documentation: <https://developer.chrome.com/docs/devtools/>
- GLSL Error Messages explained: <https://thebookofshaders.com/04/>
- Common p5.js mistakes: <https://github.com/processing/p5.js/wiki/Frequently-Asked-Questions>
