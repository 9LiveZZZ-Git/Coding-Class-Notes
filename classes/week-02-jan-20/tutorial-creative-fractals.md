# Tutorial: Creative Fractals in GLSL

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## Overview

In the previous class we built a Mandelbrot set renderer in GLSL using the iteration rule $z_{n+1} = z_n^2 + c$. That single formula produces the iconic bulbous shape we all recognize. But what happens when we change the rule? What if we use $z^3 + c$, or $\sin(z) + c$, or $e^z + c$?

This is the "alchemy" of fractal exploration: we do not fully understand why each formula produces the structures it does. We are experimenting, trying things, looking at what emerges. Like alchemists mixing substances in search of gold, we mix mathematical operations in search of visual wonder.

This tutorial walks you through:

1. Reviewing the base Mandelbrot shader
2. Implementing complex math operations in GLSL
3. Swapping in alternative iteration rules
4. Adding mouse interactivity and time-based animation
5. Saving your canvas output

Starter code: <https://editor.p5js.org/kybr/sketches/NmgtHIKFc>

---

## 1. Review: The Base Mandelbrot Shader

Before we modify anything, let us make sure we understand the foundation. Here is a complete p5.js sketch with a GLSL Mandelbrot renderer.

### JavaScript (sketch.js)

```js
let s; // the shader

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vert, frag);
  noStroke();
}

function draw() {
  shader(s);
  s.setUniform("resolution", [width, height]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  saveCanvas();
}
```

### Vertex Shader (vert)

```glsl
let vert = `
precision highp float;
attribute vec3 aPosition;
varying vec2 vPosition;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  vPosition = gl_Position.xy;
}
`;
```

### Fragment Shader (frag)

```glsl
let frag = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;

// Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(
    a.x * b.x - a.y * b.y,
    a.x * b.y + a.y * b.x
  );
}

void main() {
  // Map pixel position to complex plane
  // Mandelbrot lives roughly in (-2.5, 1.0) x (-1.2, 1.2)
  float aspect = resolution.x / resolution.y;
  vec2 c = vPosition * vec2(aspect, 1.0) * 1.5 - vec2(0.5, 0.0);

  vec2 z = vec2(0.0);
  int iterations = 0;
  const int MAX_ITER = 200;

  for (int i = 0; i < MAX_ITER; i++) {
    z = cx_mul(z, z) + c;  // z = z^2 + c
    if (dot(z, z) > 4.0) break;
    iterations++;
  }

  float t = float(iterations) / float(MAX_ITER);
  vec3 color = vec3(t, t * 0.7, t * 0.4);
  gl_FragColor = vec4(color, 1.0);
}
`;
```

**Key idea**: The line `z = cx_mul(z, z) + c;` is where the magic happens. Everything else is scaffolding. To make a different fractal, we change this one line (and possibly the viewing bounds).

---

## 2. Complex Math Operations in GLSL

GLSL has no built-in complex number type. We represent complex numbers as `vec2` where `.x` is the real part and `.y` is the imaginary part. We need to build our own complex arithmetic library.

### Complex Multiplication

We derived this last class:

$$
(a + bi)(c + di) = (ac - bd) + (ad + bc)i
$$

```glsl
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(
    a.x * b.x - a.y * b.y,
    a.x * b.y + a.y * b.x
  );
}
```

### Complex Squaring

A special case of multiplication (slightly more efficient):

$$
(a + bi)^2 = (a^2 - b^2) + 2abi
$$

```glsl
vec2 cx_sqr(vec2 z) {
  return vec2(
    z.x * z.x - z.y * z.y,
    2.0 * z.x * z.y
  );
}
```

### Complex Division

$$
\frac{a + bi}{c + di} = \frac{(ac + bd) + (bc - ad)i}{c^2 + d^2}
$$

```glsl
vec2 cx_div(vec2 a, vec2 b) {
  float denom = dot(b, b); // c^2 + d^2
  return vec2(
    a.x * b.x + a.y * b.y,
    a.y * b.x - a.x * b.y
  ) / denom;
}
```

### Complex Conjugate

$$
\overline{a + bi} = a - bi
$$

```glsl
vec2 cx_conj(vec2 z) {
  return vec2(z.x, -z.y);
}
```

### Complex Exponential

This is where things get interesting. Using Euler's formula:

$$
e^{a + bi} = e^a(\cos b + i \sin b)
$$

```glsl
vec2 cx_exp(vec2 z) {
  float ea = exp(z.x);
  return vec2(ea * cos(z.y), ea * sin(z.y));
}
```

### Complex Sine

$$
\sin(a + bi) = \sin(a)\cosh(b) + i\cos(a)\sinh(b)
$$

```glsl
vec2 cx_sin(vec2 z) {
  return vec2(
    sin(z.x) * cosh(z.y),
    cos(z.x) * sinh(z.y)
  );
}
```

Note: GLSL does not have `cosh` and `sinh` built in on all platforms. You can define them:

```glsl
float cosh(float x) { return (exp(x) + exp(-x)) / 2.0; }
float sinh(float x) { return (exp(x) - exp(-x)) / 2.0; }
```

### Complex Cosine

$$
\cos(a + bi) = \cos(a)\cosh(b) - i\sin(a)\sinh(b)
$$

```glsl
vec2 cx_cos(vec2 z) {
  return vec2(
    cos(z.x) * cosh(z.y),
    -sin(z.x) * sinh(z.y)
  );
}
```

### Complex Power (Integer)

For $z^n$ where $n$ is an integer, we can multiply repeatedly or use polar form:

$$
z^n = r^n(\cos(n\theta) + i\sin(n\theta))
$$

where $r = |z|$ and $\theta = \text{atan2}(y, x)$.

```glsl
vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  float rn = pow(r, n);
  return vec2(rn * cos(n * theta), rn * sin(n * theta));
}
```

### Complex Logarithm (principal branch)

$$
\ln(z) = \ln|z| + i \cdot \text{arg}(z)
$$

```glsl
vec2 cx_log(vec2 z) {
  return vec2(log(length(z)), atan(z.y, z.x));
}
```

### Full Complex Math Library

Here is a complete library you can paste at the top of any fragment shader:

```glsl
// --- Complex number library for GLSL ---
// Represent complex numbers as vec2: (real, imaginary)

vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}

vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b,b);
}

vec2 cx_conj(vec2 z) { return vec2(z.x, -z.y); }

float cosh(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh(float x) { return (exp(x) - exp(-x)) * 0.5; }

vec2 cx_exp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}

vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));
}

vec2 cx_cos(vec2 z) {
  return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));
}

vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n*theta), sin(n*theta));
}

vec2 cx_log(vec2 z) {
  return vec2(log(length(z)), atan(z.y, z.x));
}

vec2 cx_one() { return vec2(1.0, 0.0); }
vec2 cx_i()   { return vec2(0.0, 1.0); }
// --- End complex library ---
```

---

## 3. Alternative Fractal Formulas

Now the fun part. We change a single line in the iteration loop. For each formula, we also need to think about **scale**: the Mandelbrot set fits neatly in a 4-unit-wide window, but $\sin(z) + c$ might need a different viewing range.

### Formula 1: $z^3 + c$ (The Cubic Mandelbrot / "Multibrot")

```glsl
// In the iteration loop, replace:
//   z = cx_mul(z, z) + c;
// with:
z = cx_mul(cx_mul(z, z), z) + c;
// or equivalently:
z = cx_pow(z, 3.0) + c;
```

**Viewing bounds**: Similar to Mandelbrot; try `c = vPosition * 1.5`.

**What to expect**: The set has 2-fold rotational symmetry instead of the Mandelbrot's mirror symmetry. The main body has a different shape, and the filaments branch differently.

### Formula 2: $e^z + c$ (Exponential)

```glsl
z = cx_exp(z) + c;
```

**Viewing bounds**: This one is very different! Try:
```glsl
vec2 c = vPosition * 3.0 - vec2(1.0, 0.0);
```

**Escape radius**: Use a larger value, like `dot(z, z) > 100.0`.

**What to expect**: Ribbon-like structures that repeat vertically (because $e^z$ is periodic in the imaginary direction with period $2\pi i$).

### Formula 3: $\sin(z) + c$ (Sine)

```glsl
z = cx_sin(z) + c;
```

**Viewing bounds**: Try a wider view:
```glsl
vec2 c = vPosition * vec2(aspect, 1.0) * 4.0;
```

**Escape radius**: Use `dot(z, z) > 50.0` (complex sine can grow very fast due to `cosh`).

**What to expect**: Intricate, tree-like branching structures. The fractal tends to repeat horizontally because $\sin(z)$ is periodic in the real direction.

### Formula 4: $\sin(z)^2 + c$

```glsl
vec2 s = cx_sin(z);
z = cx_mul(s, s) + c;
```

**Viewing bounds**: Similar to the sine fractal. Try `vPosition * 3.0`.

### Formula 5: $i^z + c$

Using the identity $i^z = e^{z \ln(i)} = e^{z \cdot i\pi/2}$:

```glsl
vec2 lni = vec2(0.0, 3.14159265 / 2.0); // ln(i) = i*pi/2
z = cx_exp(cx_mul(z, lni)) + c;
```

**Viewing bounds**: Try `vPosition * 5.0`.

### Formula 6: $c^z + i$

```glsl
// c^z = e^(z * ln(c))
z = cx_exp(cx_mul(z, cx_log(c))) + cx_i();
```

**Viewing bounds**: Try `vPosition * 4.0`.

---

## 4. Complete Example: Multi-Formula Fractal Explorer

Here is a complete sketch that lets you switch between formulas using keyboard keys 1--6.

### JavaScript

```js
let s;
let formula = 0;
let centerX = 0.0, centerY = 0.0;
let zoom = 1.5;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vertSrc, fragSrc);
  noStroke();
}

function draw() {
  shader(s);
  s.setUniform("resolution", [width, height]);
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1)
  ]);
  s.setUniform("time", millis() / 1000.0);
  s.setUniform("formula", formula);
  s.setUniform("zoom", zoom);
  s.setUniform("center", [centerX, centerY]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === '1') formula = 0; // z^2 + c (Mandelbrot)
  if (key === '2') formula = 1; // z^3 + c
  if (key === '3') formula = 2; // e^z + c
  if (key === '4') formula = 3; // sin(z) + c
  if (key === '5') formula = 4; // sin(z)^2 + c
  if (key === '6') formula = 5; // i^z + c
  if (key === 's' || key === 'S') saveCanvas();
  if (key === '+' || key === '=') zoom *= 0.8; // zoom in
  if (key === '-') zoom *= 1.25; // zoom out
}
```

### Vertex Shader

```js
let vertSrc = `
precision highp float;
attribute vec3 aPosition;
varying vec2 vPosition;
void main() {
  gl_Position = vec4(aPosition, 1.0);
  vPosition = gl_Position.xy;
}
`;
```

### Fragment Shader

```js
let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform int formula;
uniform float zoom;
uniform vec2 center;

// --- Complex math library ---
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}
vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b,b);
}
float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }
vec2 cx_exp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}
vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x)*cosh_f(z.y), cos(z.x)*sinh_f(z.y));
}
vec2 cx_cos(vec2 z) {
  return vec2(cos(z.x)*cosh_f(z.y), -sin(z.x)*sinh_f(z.y));
}
vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n*theta), sin(n*theta));
}
vec2 cx_log(vec2 z) {
  return vec2(log(length(z)), atan(z.y, z.x));
}
vec2 cx_i() { return vec2(0.0, 1.0); }
// --- End complex library ---

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 c = (vPosition * vec2(aspect, 1.0)) * zoom + center;

  vec2 z = vec2(0.0);
  const int MAX_ITER = 200;
  int iterations = 0;
  float escape = 4.0;

  // Adjust escape radius for certain formulas
  if (formula == 2 || formula == 3 || formula == 4 || formula == 5) {
    escape = 50.0;
  }

  for (int i = 0; i < MAX_ITER; i++) {
    // Select iteration rule based on formula uniform
    if (formula == 0) {
      z = cx_sqr(z) + c;                           // z^2 + c
    } else if (formula == 1) {
      z = cx_mul(cx_sqr(z), z) + c;                // z^3 + c
    } else if (formula == 2) {
      z = cx_exp(z) + c;                            // e^z + c
    } else if (formula == 3) {
      z = cx_sin(z) + c;                            // sin(z) + c
    } else if (formula == 4) {
      vec2 sv = cx_sin(z);
      z = cx_mul(sv, sv) + c;                       // sin(z)^2 + c
    } else if (formula == 5) {
      vec2 lni = vec2(0.0, 3.14159265 / 2.0);
      z = cx_exp(cx_mul(z, lni)) + c;               // i^z + c
    }

    if (dot(z, z) > escape) break;
    iterations++;
  }

  // Coloring
  float t = float(iterations) / float(MAX_ITER);
  vec3 color = 0.5 + 0.5 * cos(6.28318 * (t * 3.0 + vec3(0.0, 0.1, 0.2)));
  if (iterations == MAX_ITER) color = vec3(0.0);

  gl_FragColor = vec4(color, 1.0);
}
`;
```

**Try it**: Press keys 1--6 to switch formulas. Press `+` and `-` to zoom. Press `S` to save.

---

## 5. Adding Mouse Interactivity

The mouse can control parameters in real time. A common technique is to use the mouse position to set the `c` value (creating a Julia set explorer) or to control other parameters.

### Julia Set Mode

In the Mandelbrot set, each pixel determines $c$ and we iterate from $z = 0$. For a **Julia set**, we fix $c$ (for example, from the mouse position) and use each pixel's position as the starting $z$:

```glsl
void main() {
  float aspect = resolution.x / resolution.y;
  vec2 z = vPosition * vec2(aspect, 1.0) * zoom; // pixel = starting z
  vec2 c = mouse * 2.0;                           // mouse = fixed c

  const int MAX_ITER = 200;
  int iterations = 0;

  for (int i = 0; i < MAX_ITER; i++) {
    z = cx_sqr(z) + c;
    if (dot(z, z) > 4.0) break;
    iterations++;
  }

  float t = float(iterations) / float(MAX_ITER);
  vec3 color = vec3(t);
  if (iterations == MAX_ITER) color = vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
```

On the JavaScript side, pass the mouse uniform:

```js
function draw() {
  shader(s);
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1)
  ]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

**Why flip Y?** In p5.js, `mouseY` increases downward, but in our coordinate system, Y increases upward.

---

## 6. Adding Time-Based Animation

You can animate fractal parameters using the `time` uniform.

### Animated Julia Set

```js
function draw() {
  shader(s);
  s.setUniform("time", millis() / 1000.0);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

In the fragment shader, use `time` to slowly orbit the Julia parameter:

```glsl
uniform float time;

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 z = vPosition * vec2(aspect, 1.0) * 1.5;

  // c orbits slowly around a point known to produce nice Julia sets
  vec2 c = vec2(
    -0.7 + 0.3 * cos(time * 0.3),
    0.27015 + 0.3 * sin(time * 0.3)
  );

  const int MAX_ITER = 200;
  int iterations = 0;

  for (int i = 0; i < MAX_ITER; i++) {
    z = cx_sqr(z) + c;
    if (dot(z, z) > 4.0) break;
    iterations++;
  }

  float t = float(iterations) / float(MAX_ITER);
  vec3 color = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  if (iterations == MAX_ITER) color = vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
```

### Animated Iteration Rule

You can also animate the formula itself:

```glsl
// Blend between z^2 and z^3 over time
float power = 2.0 + sin(time * 0.5) * 0.5; // oscillates 1.5 to 2.5
z = cx_pow(z, power) + c;
```

---

## 7. Adding GUI Elements

p5.js provides sliders, buttons, and other HTML elements that can control shader uniforms.

```js
let maxIterSlider;
let zoomSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vertSrc, fragSrc);
  noStroke();

  // Create sliders
  maxIterSlider = createSlider(10, 500, 200, 1);
  maxIterSlider.position(10, 10);
  maxIterSlider.style('width', '200px');

  zoomSlider = createSlider(1, 100, 15, 1);
  zoomSlider.position(10, 40);
  zoomSlider.style('width', '200px');
}

function draw() {
  shader(s);
  s.setUniform("zoom", zoomSlider.value() / 10.0);
  // Note: max iterations in GLSL must be a compile-time constant,
  // so we pass it as a uniform and check against it inside the loop.
  s.setUniform("maxIter", maxIterSlider.value());
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1)
  ]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

In the shader, handle the max iteration check:

```glsl
uniform int maxIter;

// ...
for (int i = 0; i < 500; i++) { // compile-time max
  if (i >= maxIter) break;      // runtime limit
  z = cx_sqr(z) + c;
  if (dot(z, z) > 4.0) break;
  iterations++;
}
```

---

## 8. Saving Your Canvas

The simplest approach is to call `saveCanvas()` in a key handler:

```js
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('my-fractal', 'png');
  }
}
```

For higher resolution output, you can temporarily resize the canvas:

```js
function keyPressed() {
  if (key === 'h' || key === 'H') {
    // Render at 4K
    resizeCanvas(3840, 2160);
    draw(); // force a re-draw at the new resolution
    saveCanvas('fractal-hires', 'png');
    resizeCanvas(windowWidth, windowHeight);
  }
}
```

---

## 9. Adjusting Scale and Bounds

Different formulas live in different regions of the complex plane. If you switch from $z^2 + c$ to $\sin(z) + c$ without changing the viewing window, you might see nothing interesting (or the entire screen might escape).

**Rules of thumb**:

| Formula | Suggested scale | Center offset |
|---------|----------------|---------------|
| $z^2 + c$ | 1.5 | $(-0.5, 0)$ |
| $z^3 + c$ | 1.5 | $(0, 0)$ |
| $e^z + c$ | 3.0 | $(-1, 0)$ |
| $\sin(z) + c$ | 4.0 | $(0, 0)$ |
| $\sin^2(z) + c$ | 3.0 | $(0, 0)$ |

These are starting points. Zoom in and explore! The most interesting structures are often at the boundary between convergence and divergence.

**Escape radius** also matters. For $z^2 + c$, an escape radius of 2.0 (checking `dot(z,z) > 4.0`) is mathematically proven sufficient. For transcendental functions like $\sin(z)$ or $e^z$, the values can grow much faster, so you may need a larger escape radius (50.0 or 100.0).

---

## 10. Complete Standalone Example: Sine Fractal with Interactivity

Here is one complete, self-contained sketch you can paste directly into the p5.js web editor.

```js
// Creative Fractal Explorer: sin(z) + c
// MAT 200C -- Week 2
//
// Controls:
//   Move mouse to explore Julia sets
//   Press 1-4 to switch formulas
//   Press +/- to zoom
//   Press S to save

let s;
let formula = 3; // start with sin(z)+c

let vertSrc = `
precision highp float;
attribute vec3 aPosition;
varying vec2 vPosition;
void main() {
  gl_Position = vec4(aPosition, 1.0);
  vPosition = gl_Position.xy;
}
`;

let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform float zoom;
uniform int formula;

vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}

float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }

vec2 cx_exp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}
vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x)*cosh_f(z.y), cos(z.x)*sinh_f(z.y));
}
vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n*theta), sin(n*theta));
}

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 z = vPosition * vec2(aspect, 1.0) * zoom;
  vec2 c = mouse * 3.0;

  const int MAX_ITER = 200;
  int iterations = 0;

  for (int i = 0; i < MAX_ITER; i++) {
    if (formula == 0) {
      z = cx_sqr(z) + c;
    } else if (formula == 1) {
      z = cx_mul(cx_sqr(z), z) + c;
    } else if (formula == 2) {
      z = cx_exp(z) + c;
    } else {
      z = cx_sin(z) + c;
    }
    if (dot(z, z) > 50.0) break;
    iterations++;
  }

  float t = float(iterations) / float(MAX_ITER);

  // Colorful palette using cosine color ramp
  vec3 color = 0.5 + 0.5 * cos(
    6.28318 * (t * 2.0 + vec3(0.0, 0.1, 0.2))
  );

  if (iterations == MAX_ITER) color = vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vertSrc, fragSrc);
  noStroke();
}

function draw() {
  shader(s);
  s.setUniform("resolution", [width, height]);
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1)
  ]);
  s.setUniform("time", millis() / 1000.0);
  s.setUniform("formula", formula);
  s.setUniform("zoom", 2.0);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === '1') formula = 0;
  if (key === '2') formula = 1;
  if (key === '3') formula = 2;
  if (key === '4') formula = 3;
  if (key === 's' || key === 'S') saveCanvas('fractal', 'png');
}
```

---

## Exercises

1. **New formula**: Implement $\cos(z)^2 + c$ or $\tanh(z) + c$. What does complex `tanh` look like? (Hint: $\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}$.)

2. **Hybrid iteration**: Alternate between two different rules on odd and even iterations (for example, $z^2 + c$ on even steps, $\sin(z) + c$ on odd steps).

3. **Power slider**: Add a slider that controls the exponent in $z^n + c$, letting it vary continuously from 1.5 to 5.0.

4. **Animated formula**: Use `time` to slowly morph between $z^2 + c$ and $z^3 + c$ by animating the exponent.

5. **Zoom animation**: Make the view slowly zoom into a point on the boundary of one of the fractal sets.

---

## Resources

- Starter code: <https://editor.p5js.org/kybr/sketches/NmgtHIKFc>
- Fractal explorer for reference: <https://v8.zsnout.com/fractal-explorer>
- Paul Bourke's fractal collection: <https://paulbourke.net/fractals>
- Book of Shaders: <https://thebookofshaders.com/>
- WebGL reference: <https://www.khronos.org/files/webgl20-reference-guide.pdf>
