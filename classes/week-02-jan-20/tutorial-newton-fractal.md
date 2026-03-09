# Tutorial: Newton Fractals in GLSL

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## Overview

Newton fractals arise from a surprising connection: **Newton's method**, an algorithm for finding roots of equations, produces fractal patterns when applied to complex-valued functions.

Newton's method is deterministic and well-understood. There is nothing random or chaotic in the algorithm itself. Yet when we ask "which root does this starting point converge to?" and color the complex plane accordingly, we get intricate fractal boundaries. This is one of the deepest and most beautiful examples of chaos emerging from simple, deterministic rules.

This tutorial covers:

1. Newton's method for root finding (review)
2. Extending Newton's method to the complex plane
3. Complex division in GLSL
4. Building a complete Newton fractal shader
5. Coloring by convergent root
6. The multiplier parameter $m$ for variations

References:
- 3Blue1Brown: [Newton's fractal (which Newton knew nothing about)](https://www.youtube.com/watch?v=-RdOwhmqP5s)
- Wikipedia: <https://en.wikipedia.org/wiki/Newton_fractal>
- Interactive explorer: <https://newton.bobin.at/>
- Starter code: <https://editor.p5js.org/kybr/sketches/QVXaYFrWA>

---

## 1. Newton's Method (Review)

Newton's method finds zeros (roots) of a function $f(x) = 0$. Starting from an initial guess $x_0$, we repeatedly apply:

$$
x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}
$$

Geometrically: at each step, we draw the tangent line to $f$ at the current point and follow it to where it crosses the x-axis.

**Example**: Find a root of $f(x) = x^3 + 2x^2 + 1$.

- $f'(x) = 3x^2 + 4x$
- Starting from $x_0 = 1.2$:

```js
function setup() {
  let x = 1.2;
  for (let i = 0; i < 20; i++) {
    print(x);
    x = x - (x*x*x + 2*x*x + 1) / (3*x*x + 4*x);
  }
}
// Converges to approximately -2.2056...
```

Newton's method usually converges very fast (quadratically) once it gets close to a root.

---

## 2. Newton's Method in the Complex Plane

Here is the key insight: real polynomials can be extended to complex numbers. A polynomial of degree $n$ has exactly $n$ roots in the complex plane (by the Fundamental Theorem of Algebra).

Consider $f(z) = z^3 - 1$. This has three roots:

$$
z = 1, \quad z = e^{2\pi i/3} = -\frac{1}{2} + \frac{\sqrt{3}}{2}i, \quad z = e^{4\pi i/3} = -\frac{1}{2} - \frac{\sqrt{3}}{2}i
$$

These three roots are equally spaced around the unit circle, 120 degrees apart.

When we apply Newton's method from every point in the complex plane, each starting point will (usually) converge to one of these three roots. We color each pixel according to **which root** it converges to.

**The fractal emerges at the boundaries**: points near the boundary between two basins of attraction exhibit chaotic behavior, bouncing between roots before settling. The boundary itself is infinitely complex -- a fractal.

### The Iteration Formula

For $f(z) = z^3 - 1$:
- $f'(z) = 3z^2$

Newton's iteration:

$$
z_{n+1} = z_n - \frac{z_n^3 - 1}{3z_n^2}
$$

We can define the "step":

$$
dz = \frac{z^3 - 1}{3z^2}
$$

$$
z_{n+1} = z_n - dz
$$

---

## 3. Complex Division in GLSL

The Newton iteration requires dividing two complex numbers. This is the operation GLSL does not provide for `vec2`, so we must implement it ourselves.

### Derivation

To divide $(a + bi)$ by $(c + di)$, we multiply numerator and denominator by the conjugate of the denominator:

$$
\frac{a + bi}{c + di} = \frac{(a + bi)(c - di)}{(c + di)(c - di)} = \frac{(ac + bd) + (bc - ad)i}{c^2 + d^2}
$$

### GLSL Implementation

```glsl
vec2 cx_div(vec2 a, vec2 b) {
  float denom = b.x * b.x + b.y * b.y;  // same as dot(b, b)
  return vec2(
    (a.x * b.x + a.y * b.y) / denom,
    (a.y * b.x - a.x * b.y) / denom
  );
}
```

Or more concisely:

```glsl
vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b);
}
```

### Other Complex Operations We Need

```glsl
// Complex multiplication
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

// Complex squaring
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}

// z^3 = z * z^2
vec2 cx_cube(vec2 z) {
  return cx_mul(z, cx_sqr(z));
}

// Complex number representing 1 + 0i
vec2 cx_one() { return vec2(1.0, 0.0); }

// Multiply complex by real scalar
vec2 cx_mulS(vec2 z, float s) { return z * s; }
```

---

## 4. Building the Newton Fractal Step by Step

### Step 1: Set Up the p5.js Scaffold

```js
let s;

let vertSrc = `
precision highp float;
attribute vec3 aPosition;
varying vec2 vPosition;
void main() {
  gl_Position = vec4(aPosition, 1.0);
  vPosition = gl_Position.xy;
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
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

### Step 2: Write the Fragment Shader

```glsl
let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;

// --- Complex math ---
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}
vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b);
}
vec2 cx_one() { return vec2(1.0, 0.0); }

// z^3
vec2 cx_powr3(vec2 z) {
  return cx_mul(z, cx_sqr(z));
}

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 z = vPosition * vec2(aspect, 1.0) * 1.5;

  // The three roots of z^3 - 1 = 0
  vec2 root1 = vec2(1.0, 0.0);
  vec2 root2 = vec2(-0.5, 0.866025);   // e^(2*pi*i/3)
  vec2 root3 = vec2(-0.5, -0.866025);  // e^(4*pi*i/3)

  const int MAX_ITER = 100;
  int iterations = 0;
  int whichRoot = 0;

  for (int i = 0; i < MAX_ITER; i++) {
    // Newton step: z = z - (z^3 - 1) / (3*z^2)
    vec2 numerator = cx_powr3(z) - cx_one();  // z^3 - 1
    vec2 denominator = cx_sqr(z) * 3.0;       // 3*z^2
    vec2 dz = cx_div(numerator, denominator);
    z = z - dz;

    iterations++;

    // Check convergence: did we get close to a root?
    float tol = 0.0001;
    if (distance(z, root1) < tol) { whichRoot = 1; break; }
    if (distance(z, root2) < tol) { whichRoot = 2; break; }
    if (distance(z, root3) < tol) { whichRoot = 3; break; }
  }

  // Color by which root
  vec3 color = vec3(0.0);
  float shade = 1.0 - float(iterations) / float(MAX_ITER);

  if (whichRoot == 1) color = vec3(1.0, 0.2, 0.2) * shade; // red
  if (whichRoot == 2) color = vec3(0.2, 1.0, 0.2) * shade; // green
  if (whichRoot == 3) color = vec3(0.3, 0.3, 1.0) * shade; // blue

  gl_FragColor = vec4(color, 1.0);
}
`;
```

### What You Should See

Three large colored regions (red, green, blue) meeting at intricate fractal boundaries. The boundaries have a 3-fold rotational symmetry. Darker areas within each region indicate that convergence took more iterations.

---

## 5. The Multiplier Parameter $m$

The standard Newton iteration is:

$$
z_{n+1} = z_n - \frac{f(z)}{f'(z)}
$$

We can introduce a **multiplier** $m$:

$$
z_{n+1} = z_n - m \cdot \frac{f(z)}{f'(z)}
$$

When $m = 1$, this is standard Newton's method. Other values of $m$ create "relaxed" or "over-relaxed" variants:

- $m < 1$: Under-relaxation. Takes smaller steps. Converges more slowly but may find different patterns.
- $m > 1$: Over-relaxation. Takes larger steps. Can be chaotic.
- $m$ complex: Produces wild, beautiful variations.

### Adding the Multiplier

In the fragment shader, change the Newton step:

```glsl
uniform vec2 m; // complex multiplier, passed from JavaScript

// Newton step with multiplier
vec2 dz = cx_div(
  cx_powr3(z) - cx_one(),
  cx_sqr(z) * 3.0
);
z = z - cx_mul(m, dz);
```

On the JavaScript side, map the mouse to $m$:

```js
function draw() {
  shader(s);
  s.setUniform("resolution", [width, height]);
  // Map mouse to multiplier
  // Real part: 0.5 to 1.5, Imaginary part: -0.5 to 0.5
  s.setUniform("m", [
    map(mouseX, 0, width, 0.5, 1.5),
    map(mouseY, 0, height, -0.5, 0.5)
  ]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

As you move the mouse, the fractal morphs dramatically. Near $(1, 0)$ (standard Newton), you get the classic image. As the imaginary part of $m$ increases, the basins of attraction twist and spiral.

---

## 6. Other Polynomials

You can apply Newton's method to any polynomial. Here are some examples.

### $f(z) = z^4 - 1$ (Four roots at $\pm 1, \pm i$)

```glsl
// f(z) = z^4 - 1
// f'(z) = 4z^3
vec2 numerator = cx_mul(cx_sqr(z), cx_sqr(z)) - cx_one(); // z^4 - 1
vec2 denominator = cx_powr3(z) * 4.0;                      // 4z^3
vec2 dz = cx_div(numerator, denominator);
z = z - dz;

// Four roots to check:
vec2 r1 = vec2(1.0, 0.0);
vec2 r2 = vec2(-1.0, 0.0);
vec2 r3 = vec2(0.0, 1.0);
vec2 r4 = vec2(0.0, -1.0);
```

### $f(z) = z^5 - 1$ (Five roots, pentagonal symmetry)

```glsl
// f(z) = z^5 - 1
// f'(z) = 5z^4
vec2 z2 = cx_sqr(z);
vec2 z4 = cx_sqr(z2);
vec2 z5 = cx_mul(z4, z);

vec2 numerator = z5 - cx_one();
vec2 denominator = z4 * 5.0;
vec2 dz = cx_div(numerator, denominator);
z = z - dz;

// Five roots of unity:
// e^(2*pi*i*k/5) for k = 0,1,2,3,4
```

### $f(z) = z^3 - 2z + 2$ (Asymmetric roots)

```glsl
// f(z) = z^3 - 2z + 2
// f'(z) = 3z^2 - 2
vec2 numerator = cx_powr3(z) - 2.0*z + vec2(2.0, 0.0);
vec2 denominator = cx_sqr(z) * 3.0 - vec2(2.0, 0.0);
vec2 dz = cx_div(numerator, denominator);
z = z - dz;
```

For polynomials with non-symmetric roots, the fractal pattern will also be asymmetric, which can be visually interesting.

---

## 7. Complete Example with Interactivity

Here is a complete, self-contained sketch.

```js
// Newton Fractal Explorer
// MAT 200C -- Week 2
//
// Move mouse to change the multiplier m
// Press 1-3 to switch polynomials
// Press S to save

let s;
let poly = 0;

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
uniform vec2 m;       // complex multiplier
uniform int poly;     // which polynomial

// --- Complex math ---
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}
vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b);
}
vec2 cx_one() { return vec2(1.0, 0.0); }
vec2 cx_powr3(vec2 z) { return cx_mul(z, cx_sqr(z)); }

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(
    abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 z = vPosition * vec2(aspect, 1.0) * 2.0;

  const int MAX_ITER = 100;
  int iterations = 0;
  int whichRoot = 0;

  // Roots for z^3 - 1
  vec2 roots3[3];
  roots3[0] = vec2(1.0, 0.0);
  roots3[1] = vec2(-0.5, 0.866025);
  roots3[2] = vec2(-0.5, -0.866025);

  // Roots for z^4 - 1
  vec2 roots4[4];
  roots4[0] = vec2(1.0, 0.0);
  roots4[1] = vec2(0.0, 1.0);
  roots4[2] = vec2(-1.0, 0.0);
  roots4[3] = vec2(0.0, -1.0);

  // Roots for z^5 - 1
  vec2 roots5[5];
  roots5[0] = vec2(1.0, 0.0);
  roots5[1] = vec2(0.309017, 0.951057);
  roots5[2] = vec2(-0.809017, 0.587785);
  roots5[3] = vec2(-0.809017, -0.587785);
  roots5[4] = vec2(0.309017, -0.951057);

  for (int i = 0; i < MAX_ITER; i++) {
    vec2 dz;

    if (poly == 0) {
      // z^3 - 1, derivative 3z^2
      dz = cx_div(cx_powr3(z) - cx_one(), cx_sqr(z) * 3.0);
    } else if (poly == 1) {
      // z^4 - 1, derivative 4z^3
      vec2 z4 = cx_sqr(cx_sqr(z));
      dz = cx_div(z4 - cx_one(), cx_powr3(z) * 4.0);
    } else {
      // z^5 - 1, derivative 5z^4
      vec2 z2 = cx_sqr(z);
      vec2 z4 = cx_sqr(z2);
      vec2 z5 = cx_mul(z4, z);
      dz = cx_div(z5 - cx_one(), z4 * 5.0);
    }

    // Apply multiplier
    z = z - cx_mul(m, dz);
    iterations++;

    // Check convergence to roots
    float tol = 0.0001;

    if (poly == 0) {
      for (int j = 0; j < 3; j++) {
        if (distance(z, roots3[j]) < tol) {
          whichRoot = j + 1;
        }
      }
    } else if (poly == 1) {
      for (int j = 0; j < 4; j++) {
        if (distance(z, roots4[j]) < tol) {
          whichRoot = j + 1;
        }
      }
    } else {
      for (int j = 0; j < 5; j++) {
        if (distance(z, roots5[j]) < tol) {
          whichRoot = j + 1;
        }
      }
    }

    if (whichRoot > 0) break;
  }

  // Number of roots for current polynomial
  int numRoots = 3;
  if (poly == 1) numRoots = 4;
  if (poly == 2) numRoots = 5;

  // Color by root using HSV
  float shade = 1.0 - float(iterations) / float(MAX_ITER) * 0.7;
  float hue = float(whichRoot - 1) / float(numRoots);
  vec3 color = hsv2rgb(vec3(hue, 0.8, shade));

  if (whichRoot == 0) color = vec3(0.0); // did not converge

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
  s.setUniform("m", [
    map(mouseX, 0, width, 0.5, 1.5),
    map(mouseY, 0, height, -0.5, 0.5)
  ]);
  s.setUniform("poly", poly);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === '1') poly = 0; // z^3 - 1
  if (key === '2') poly = 1; // z^4 - 1
  if (key === '3') poly = 2; // z^5 - 1
  if (key === 's' || key === 'S') saveCanvas('newton-fractal', 'png');
}
```

---

## 8. Understanding the Fractal Structure

### Why Are the Boundaries Fractal?

Consider two starting points that are very close together but on opposite sides of a basin boundary. One converges to root A, the other to root B. Between them, there must be a point that does not cleanly converge to either -- it sits on the boundary. Near this point, the slightest perturbation changes which root you converge to. This sensitivity at every scale produces the fractal structure.

### The Julia Set Connection

Newton fractals are closely related to Julia sets. The Newton iteration can be rewritten as:

$$
z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)} = \frac{z_n f'(z_n) - f(z_n)}{f'(z_n)}
$$

For $f(z) = z^3 - 1$:

$$
z_{n+1} = \frac{2z_n^3 + 1}{3z_n^2}
$$

This is a rational function, and studying its iteration is part of the field of **holomorphic dynamics** -- the same field that produces Julia sets and the Mandelbrot set.

### Fixed Points and Attractors

Each root of $f(z)$ is a **fixed point** of the Newton iteration (if $z = r$ where $f(r) = 0$, then $z_{n+1} = r - 0/f'(r) = r$). Each root is an **attractor**: nearby points converge to it. The fractal boundary is the **Julia set** of the Newton iteration function.

---

## 9. Going Further: Non-Polynomial Functions

Newton's method works on any differentiable function, not just polynomials.

### $f(z) = \sin(z)$

Roots are at $z = n\pi$ for all integers $n$.

$$
z_{n+1} = z_n - \frac{\sin(z_n)}{\cos(z_n)} = z_n - \tan(z_n)
$$

```glsl
float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }

vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x)*cosh_f(z.y), cos(z.x)*sinh_f(z.y));
}
vec2 cx_cos(vec2 z) {
  return vec2(cos(z.x)*cosh_f(z.y), -sin(z.x)*sinh_f(z.y));
}

// In the iteration loop:
vec2 dz = cx_div(cx_sin(z), cx_cos(z)); // tan(z)
z = z - dz;
```

This produces a fractal with infinite periodicity (the roots repeat along the real axis).

### $f(z) = e^z - 1$

One root at $z = 0$.

$$
z_{n+1} = z_n - \frac{e^{z_n} - 1}{e^{z_n}} = z_n - 1 + e^{-z_n}
$$

```glsl
vec2 cx_exp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}

// In the iteration loop:
vec2 ez = cx_exp(z);
vec2 dz = cx_div(ez - cx_one(), ez);
z = z - dz;
```

---

## 10. Enhancing the Visualization

### Smooth Shading

Instead of a flat shade based on iteration count, use smooth interpolation:

```glsl
// After the loop, use distance to the converged root for sub-iteration smoothing
float d = distance(z, convergdRoot);
float smoothShade = float(iterations) + log(tol / max(d, 1e-10)) / log(2.0);
smoothShade = smoothShade / float(MAX_ITER);
```

### Edge Detection (Highlighting Boundaries)

To emphasize the fractal boundaries, you can detect where neighboring pixels converge to different roots. A simpler approach: use the number of iterations as brightness, which naturally darkens the boundaries.

### Adding the Derivative's Magnitude

The magnitude of the Newton step $|dz|$ gives information about the "speed" of convergence:

```glsl
float dzMag = length(dz);
// Use log(dzMag) for coloring -- large steps near boundaries
```

---

## Exercises

1. **Symmetric beauty**: Render the Newton fractal for $z^6 - 1$. This has 6 roots equally spaced around the unit circle. Choose 6 distinct colors.

2. **Custom polynomial**: Try $f(z) = z^3 - z$. The roots are $0, 1, -1$. How does the fractal differ from $z^3 - 1$?

3. **Multiplier exploration**: With $f(z) = z^3 - 1$ and $m = 1 + 0.5i$, describe what happens to the basins of attraction.

4. **Animated Newton**: Animate the multiplier $m$ using `time`, tracing a slow circle in the complex plane. What patterns emerge?

5. **Newton meets Mandelbrot**: For each pixel, use the pixel position as the multiplier $m$ and a fixed starting $z$. Color by which root is reached. This creates a "Mandelbrot-like" map of the Newton parameter space.

---

## Resources

- Newton fractal Wikipedia: <https://en.wikipedia.org/wiki/Newton_fractal>
- Interactive explorer: <https://newton.bobin.at/>
- Malin Christersson's page: <https://www.malinc.se/m/NewtonFractals.php>
- Paul Bourke's page: <https://paulbourke.net/fractals/newtonraphson/>
- 3Blue1Brown video: <https://www.youtube.com/watch?v=-RdOwhmqP5s>
- Starter code: <https://editor.p5js.org/kybr/sketches/QVXaYFrWA>
- Codepen explorer: <https://codepen.io/mherreshoff/full/RwZPazd>
