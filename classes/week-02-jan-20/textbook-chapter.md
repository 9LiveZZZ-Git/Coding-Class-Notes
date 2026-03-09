# Chapter: Creative Fractal Exploration, Coloring, Newton Fractals, and Frame Feedback

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## Table of Contents

1. [Introduction: From the Mandelbrot to Creative Exploration](#1-introduction)
2. [Complex Arithmetic in GLSL](#2-complex-arithmetic-in-glsl)
3. [Alternative Fractal Formulas](#3-alternative-fractal-formulas)
4. [Coloring Fractals: Beyond Iteration Count](#4-coloring-fractals)
5. [Color Spaces: HSV and CIELAB](#5-color-spaces)
6. [Newton Fractals](#6-newton-fractals)
7. [GLSL with Frame Feedback](#7-glsl-with-frame-feedback)
8. [Interactivity and Animation](#8-interactivity-and-animation)
9. [Early Abstract Animation](#9-early-abstract-animation)
10. [Exercises](#10-exercises)

---

## 1. Introduction

In the previous class, we built a Mandelbrot set renderer in GLSL. The iteration rule was simple:

$$
z_{n+1} = z_n^2 + c
$$

with $z_0 = 0$ and $c$ determined by the pixel position. For each pixel, we iterate until $|z|$ exceeds an escape radius or we hit a maximum iteration count. Pixels that escape are colored by iteration count; pixels that do not escape are colored black (they are "in the set").

This gave us the iconic Mandelbrot image. But we can go much further in two directions:

1. **Different formulas**: What happens if we replace $z^2$ with $z^3$, or $\sin(z)$, or $e^z$? Each function has its own geometry, its own symmetries, and produces its own fractal landscape.

2. **Better coloring**: Instead of just counting iterations, we can extract rich statistics from the iteration process and map them to color in sophisticated ways.

This chapter explores both directions, introduces Newton fractals as a fundamentally different kind of fractal iteration, covers the technique of frame feedback in GLSL, and connects our computational work to the history of abstract animation.

Starter code for this chapter: <https://editor.p5js.org/kybr/sketches/NmgtHIKFc>

---

## 2. Complex Arithmetic in GLSL

GLSL has no native complex number type. We represent a complex number $a + bi$ as a `vec2` where `.x` is the real part $a$ and `.y` is the imaginary part $b$. We then build complex operations as functions.

### 2.1 The Essential Operations

**Addition and subtraction** work automatically because GLSL's `vec2` addition is component-wise:

```glsl
vec2 z1 = vec2(1.0, 2.0); // 1 + 2i
vec2 z2 = vec2(3.0, 4.0); // 3 + 4i
vec2 sum = z1 + z2;        // 4 + 6i  (correct!)
```

**Scalar multiplication** also works automatically:

```glsl
vec2 scaled = z1 * 3.0; // 3 + 6i (correct!)
```

**Complex multiplication** does NOT work with `*`, because `vec2 * vec2` in GLSL does component-wise multiplication, not complex multiplication:

```glsl
vec2 wrong = z1 * z2; // (3, 8) -- this is NOT (1+2i)(3+4i)!
```

We need to implement it from the formula $(a+bi)(c+di) = (ac-bd) + (ad+bc)i$:

```glsl
vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(
    a.x * b.x - a.y * b.y,  // real: ac - bd
    a.x * b.y + a.y * b.x   // imag: ad + bc
  );
}
```

**Complex squaring** (a special case of multiplication, slightly optimized):

```glsl
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}
```

**Complex division** uses the conjugate trick:

$$
\frac{a+bi}{c+di} = \frac{(a+bi)(c-di)}{c^2+d^2} = \frac{(ac+bd) + (bc-ad)i}{c^2+d^2}
$$

```glsl
vec2 cx_div(vec2 a, vec2 b) {
  float denom = dot(b, b); // b.x^2 + b.y^2
  return vec2(
    a.x*b.x + a.y*b.y,
    a.y*b.x - a.x*b.y
  ) / denom;
}
```

### 2.2 Transcendental Functions

These are functions that go beyond polynomials. They are where the most interesting fractal formulas live.

**Complex exponential** (from Euler's formula $e^{a+bi} = e^a(\cos b + i\sin b)$):

```glsl
vec2 cx_exp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}
```

**Complex sine** ($\sin(a+bi) = \sin a \cosh b + i\cos a \sinh b$):

```glsl
// GLSL may not have cosh/sinh on all platforms, so define them:
float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }

vec2 cx_sin(vec2 z) {
  return vec2(sin(z.x)*cosh_f(z.y), cos(z.x)*sinh_f(z.y));
}
```

**Complex cosine** ($\cos(a+bi) = \cos a \cosh b - i\sin a \sinh b$):

```glsl
vec2 cx_cos(vec2 z) {
  return vec2(cos(z.x)*cosh_f(z.y), -sin(z.x)*sinh_f(z.y));
}
```

**Complex power** (using polar form $z^n = r^n e^{in\theta}$):

```glsl
vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n*theta), sin(n*theta));
}
```

**Complex logarithm** (principal branch):

```glsl
vec2 cx_log(vec2 z) {
  return vec2(log(length(z)), atan(z.y, z.x));
}
```

### 2.3 The Complete Library

Here is a self-contained complex math library for GLSL. Paste this at the top of your fragment shader:

```glsl
// === Complex number library ===
// Represent complex numbers as vec2: (real, imaginary)

vec2 cx_mul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}
vec2 cx_div(vec2 a, vec2 b) {
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b);
}
vec2 cx_conj(vec2 z) { return vec2(z.x, -z.y); }

float cosh_f(float x) { return (exp(x) + exp(-x)) * 0.5; }
float sinh_f(float x) { return (exp(x) - exp(-x)) * 0.5; }

vec2 cx_exp(vec2 z) { return exp(z.x) * vec2(cos(z.y), sin(z.y)); }
vec2 cx_sin(vec2 z) { return vec2(sin(z.x)*cosh_f(z.y), cos(z.x)*sinh_f(z.y)); }
vec2 cx_cos(vec2 z) { return vec2(cos(z.x)*cosh_f(z.y), -sin(z.x)*sinh_f(z.y)); }
vec2 cx_pow(vec2 z, float n) {
  float r = length(z);
  float theta = atan(z.y, z.x);
  return pow(r, n) * vec2(cos(n*theta), sin(n*theta));
}
vec2 cx_log(vec2 z) { return vec2(log(length(z)), atan(z.y, z.x)); }

vec2 cx_one() { return vec2(1.0, 0.0); }
vec2 cx_i()   { return vec2(0.0, 1.0); }
// === End complex library ===
```

---

## 3. Alternative Fractal Formulas

The Mandelbrot iteration $z_{n+1} = z^2 + c$ is just one of infinitely many possible iteration rules. By changing the formula, we explore entirely different fractal landscapes.

This is the **alchemy** of fractal exploration: we do not have a complete theory that predicts what each formula will look like. We must compute it and see.

### 3.1 $z^3 + c$ (Cubic Mandelbrot / Multibrot)

```glsl
z = cx_mul(cx_sqr(z), z) + c;
```

- **Symmetry**: 2-fold rotational (the standard Mandelbrot has mirror symmetry)
- **Scale**: Similar to Mandelbrot; use `c = vPosition * 1.5`
- **Structure**: Fewer, larger bulbs than the Mandelbrot. The filaments branch in threes.

More generally, $z^n + c$ gives an $(n-1)$-fold rotational symmetry. These are called **Multibrot sets**.

### 3.2 $e^z + c$ (Exponential)

```glsl
z = cx_exp(z) + c;
```

- **Scale**: Wider view needed. Try `c = vPosition * 3.0 - vec2(1.0, 0.0)`
- **Escape radius**: Use `dot(z,z) > 100.0`
- **Structure**: Ribbon-like, vertically periodic (because $e^z$ has period $2\pi i$ in the imaginary direction). The shapes look like flowing curtains or jellyfish tentacles.

### 3.3 $\sin(z) + c$ (Sine)

```glsl
z = cx_sin(z) + c;
```

- **Scale**: Use `c = vPosition * 4.0`
- **Escape radius**: Use `dot(z,z) > 50.0`
- **Structure**: Tree-like branching, horizontally periodic (because $\sin(z)$ has period $2\pi$ in the real direction). Complex sinh causes rapid growth in the imaginary direction.

### 3.4 $\sin(z)^2 + c$

```glsl
vec2 sv = cx_sin(z);
z = cx_mul(sv, sv) + c;
```

- Combines the periodicity of sine with the doubling behavior of squaring.

### 3.5 $i^z + c$

Using $i^z = e^{z \cdot \ln(i)} = e^{z \cdot i\pi/2}$:

```glsl
vec2 lni = vec2(0.0, 3.14159265 / 2.0);
z = cx_exp(cx_mul(z, lni)) + c;
```

### 3.6 $c^z + i$

```glsl
z = cx_exp(cx_mul(z, cx_log(c))) + cx_i();
```

### 3.7 Adjusting Scale and Escape Radius

Different formulas need different viewing parameters. The core issue is that each function maps the complex plane differently:

| Formula | Suggested `zoom` | Suggested center | Escape radius |
|---------|-------------------|-----------------|---------------|
| $z^2 + c$ | 1.5 | $(-0.5, 0)$ | 4 |
| $z^3 + c$ | 1.5 | $(0, 0)$ | 4 |
| $e^z + c$ | 3.0 | $(-1, 0)$ | 100 |
| $\sin(z) + c$ | 4.0 | $(0, 0)$ | 50 |
| $\cos(z) + c$ | 4.0 | $(0, 0)$ | 50 |

If you switch formulas and see only black or only color, your viewing window is probably wrong. Zoom out (increase scale) or shift the center.

---

## 4. Coloring Fractals

Reference: <https://mandelbrowser.y0.pl/tutorial/computing.html>

### 4.1 The Basic Problem

With just the iteration count, we get a limited color palette. Points inside the set all get the same color (black, typically). Points outside get one of $N$ possible colors (where $N$ is the maximum iteration count). This produces visible **banding** -- sharp lines where the iteration count changes by 1.

### 4.2 The Iteration Path

Each iteration step moves $z$ to a new position in the complex plane. The sequence $z_0, z_1, z_2, \ldots, z_N$ traces a **path**. We can extract statistics from this path.

Visualization of iteration paths: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>

### 4.3 Statistics We Can Extract

**Total path length**: The sum of all segment lengths.

$$
L = \sum_{i=0}^{N-1} |z_{i+1} - z_i|
$$

```glsl
float pathLength = 0.0;
for (int i = 0; i < MAX_ITER; i++) {
  vec2 newZ = cx_sqr(z) + c;
  pathLength += distance(newZ, z);
  z = newZ;
  if (dot(z, z) > 256.0) break;
  iterations++;
}
```

**Average segment length**: Path length divided by number of iterations.

```glsl
float avgSegment = pathLength / max(float(iterations), 1.0);
```

**Displacement (distance from start to end)**: How far $z$ ends up from $z_0$.

```glsl
float displacement = length(z); // z_0 was (0,0)
```

**Path curvature / tortuosity**: Ratio of path length to displacement. A value of 1.0 means the path is perfectly straight; higher values mean it is winding.

```glsl
float tortuosity = pathLength / max(displacement, 0.001);
```

**Average orbit distance**: The average $|z|$ during iteration.

```glsl
float sumR = 0.0;
for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  sumR += length(z);
  if (dot(z, z) > 256.0) break;
  iterations++;
}
float avgOrbit = sumR / max(float(iterations), 1.0);
```

**Orbit trap**: The minimum distance from $z$ to some geometric feature (a point, a line, a circle) during iteration.

```glsl
float minDist = 1e10;
for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  minDist = min(minDist, length(z)); // trap at origin
  if (dot(z, z) > 256.0) break;
  iterations++;
}
```

### 4.4 Smooth Iteration Count

The standard iteration count is an integer, causing banding. We can compute a **smooth** (continuous) value:

$$
n_{\text{smooth}} = n + 1 - \frac{\log(\log|z_n|)}{\log 2}
$$

This formula works for $z^2 + c$ specifically. It gives a fractional iteration count that varies continuously from pixel to pixel.

```glsl
float smoothIter = float(iterations);
if (iterations < MAX_ITER) {
  float logZn = log(dot(z, z)) / 2.0; // log|z|
  float nu = log(logZn / log(2.0)) / log(2.0);
  smoothIter = float(iterations) + 1.0 - nu;
}
```

For this to work well, use a larger escape radius (`dot(z,z) > 256.0` instead of `> 4.0`).

### 4.5 Combining Statistics into Color

There is no single "correct" mapping. This is where artistic judgment comes in. Some approaches:

**Map to RGB channels directly**:

```glsl
float r = sin(smoothIter * 0.1) * 0.5 + 0.5;
float g = sin(pathLength * 0.05 + 2.0) * 0.5 + 0.5;
float b = sin(avgOrbit * 0.2 + 4.0) * 0.5 + 0.5;
vec3 color = vec3(r, g, b);
```

**Use a cosine palette** (Inigo Quilez technique):

```glsl
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

// Usage:
float t = smoothIter / float(MAX_ITER);
vec3 color = palette(t,
  vec3(0.5), vec3(0.5),
  vec3(1.0), vec3(0.0, 0.33, 0.67)
);
```

**Map to HSV** (detailed in the next section):

```glsl
float hue = fract(smoothIter / 30.0);
float sat = clamp(avgSegment * 0.5, 0.3, 1.0);
float val = clamp(1.0 - tortuosity * 0.05, 0.2, 1.0);
vec3 color = hsv2rgb(vec3(hue, sat, val));
```

### 4.6 Complete Coloring Example

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

let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;

vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(
    abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 c = vPosition * vec2(aspect, 1.0) * 1.5 - vec2(0.5, 0.0);
  vec2 z = vec2(0.0);

  const int MAX_ITER = 300;
  int iterations = 0;
  float pathLength = 0.0;
  float sumOrbitDist = 0.0;
  float minDist = 1e10;

  for (int i = 0; i < MAX_ITER; i++) {
    vec2 newZ = cx_sqr(z) + c;
    pathLength += distance(newZ, z);
    sumOrbitDist += length(newZ);
    minDist = min(minDist, length(newZ));
    z = newZ;
    if (dot(z, z) > 256.0) break;
    iterations++;
  }

  // Smooth iteration count
  float smoothIter = float(iterations);
  if (iterations < MAX_ITER) {
    float logZn = log(dot(z, z)) / 2.0;
    float nu = log(logZn / log(2.0)) / log(2.0);
    smoothIter = float(iterations) + 1.0 - nu;
  }

  float avgOrbit = sumOrbitDist / max(float(iterations), 1.0);

  // Multi-statistic HSV coloring
  float hue = fract(smoothIter / 25.0);
  float sat = 0.5 + 0.5 * sin(pathLength * 0.1);
  float val = clamp(smoothIter / float(MAX_ITER) * 3.0, 0.0, 1.0);

  vec3 color = hsv2rgb(vec3(hue, clamp(sat, 0.3, 1.0), val));
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
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === 's') saveCanvas('colored-mandelbrot', 'png');
}
```

---

## 5. Color Spaces

### 5.1 RGB: The Default

RGB is the native color space of screens. Each color is a mix of Red, Green, and Blue intensities. GLSL's `vec4` output for `gl_FragColor` is in RGBA format.

**Problem**: RGB is not intuitive for artistic color design. "Make this color warmer" does not map to a simple RGB change. Also, RGB is not perceptually uniform -- equal numerical distances in RGB do not correspond to equal perceived color differences.

### 5.2 HSV (Hue, Saturation, Value)

**HSV** rearranges color into more intuitive dimensions:

- **Hue** (H): The "color" -- position on the rainbow. Cyclic (0 degrees = 360 degrees = red).
- **Saturation** (S): Vividness. 0 = gray (no color), 1 = fully vivid.
- **Value** (V): Brightness. 0 = black, 1 = maximum brightness.

This is excellent for fractals because we can:
- Cycle through all colors by varying hue (mapping iteration count to hue gives a rainbow)
- Control vividness and brightness independently

**HSV to RGB in GLSL**:

```glsl
vec3 hsv2rgb(vec3 c) {
  // c.x = hue [0,1], c.y = saturation [0,1], c.z = value [0,1]
  vec3 rgb = clamp(
    abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
  return c.z * mix(vec3(1.0), rgb, c.y);
}
```

**How to use it**:

```glsl
// Rainbow coloring based on iteration
float hue = fract(float(iterations) / 30.0); // cycles every 30 iterations
float sat = 0.8;
float val = 0.9;
vec3 color = hsv2rgb(vec3(hue, sat, val));
```

### 5.3 CIELAB (L\*a\*b\*)

[CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space) is a color space designed by the International Commission on Illumination (CIE) to be **perceptually uniform**. This means:

- A distance of 1 unit in CIELAB looks like the same "amount of color change" everywhere in the space.
- In RGB, a change from (0, 0, 200) to (0, 0, 201) is barely visible, while a change from (200, 200, 0) to (201, 201, 0) might be quite noticeable. CIELAB corrects this.

The three channels are:

- **L\*** (0 to 100): Lightness. Perceptually linear -- L\*=50 looks "halfway between black and white."
- **a\*** (roughly -128 to +127): Green (negative) to Red (positive).
- **b\*** (roughly -128 to +127): Blue (negative) to Yellow (positive).

**CIELAB to RGB in GLSL** (via XYZ color space):

```glsl
vec3 lab2rgb(vec3 lab) {
  // Lab to XYZ
  float fy = (lab.x + 16.0) / 116.0;
  float fx = lab.y / 500.0 + fy;
  float fz = fy - lab.z / 200.0;

  float delta = 6.0 / 29.0;
  float d2 = delta * delta;

  float x = (fx > delta) ? fx*fx*fx : (fx - 16.0/116.0) * 3.0 * d2;
  float y = (fy > delta) ? fy*fy*fy : (fy - 16.0/116.0) * 3.0 * d2;
  float z = (fz > delta) ? fz*fz*fz : (fz - 16.0/116.0) * 3.0 * d2;

  // D65 white point
  x *= 0.95047; z *= 1.08883;

  // XYZ to linear sRGB
  float r =  3.2406*x - 1.5372*y - 0.4986*z;
  float g = -0.9689*x + 1.8758*y + 0.0415*z;
  float b =  0.0557*x - 0.2040*y + 1.0570*z;

  // Gamma correction
  r = r > 0.0031308 ? 1.055*pow(r, 1.0/2.4) - 0.055 : 12.92*r;
  g = g > 0.0031308 ? 1.055*pow(g, 1.0/2.4) - 0.055 : 12.92*g;
  b = b > 0.0031308 ? 1.055*pow(b, 1.0/2.4) - 0.055 : 12.92*b;

  return clamp(vec3(r, g, b), 0.0, 1.0);
}
```

**Usage for fractal coloring**:

```glsl
float t = smoothIter / float(MAX_ITER);
float L = 50.0 + 40.0 * cos(t * 6.28318);
float a = 80.0 * cos(t * 6.28318 * 3.0);
float b = 80.0 * sin(t * 6.28318 * 3.0 + 1.0);
vec3 color = lab2rgb(vec3(L, a, b));
```

### 5.4 When to Use Which Color Space

| Color Space | Strengths | Best For |
|-------------|-----------|----------|
| RGB | Native to screens, no conversion | Direct pixel manipulation |
| HSV | Intuitive hue/saturation/brightness | Cycling through colors, artistic control |
| CIELAB | Perceptually uniform | Smooth gradients, scientific visualization |

For most fractal work, **HSV** is the pragmatic choice: easy to understand, easy to convert, and the cyclic nature of hue maps naturally to the cyclic nature of iteration count. Use **CIELAB** when you want especially smooth, natural-looking gradients.

---

## 6. Newton Fractals

### 6.1 Newton's Method in the Complex Plane

[Newton's method](https://en.wikipedia.org/wiki/Newton%27s_method) finds zeros of a function by iterating:

$$
z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}
$$

In one dimension (real numbers), this converges to a root near the starting point. In the complex plane, a polynomial of degree $n$ has $n$ roots (by the Fundamental Theorem of Algebra), and each starting point converges to one of them.

**The fractal arises from the boundaries between basins of attraction.** Points near the boundary between two basins exhibit chaotic behavior, creating infinitely complex, fractal boundaries.

### 6.2 The Standard Example: $f(z) = z^3 - 1$

This function has three roots, equally spaced on the unit circle:

$$
z = 1, \quad z = -\frac{1}{2} + \frac{\sqrt{3}}{2}i, \quad z = -\frac{1}{2} - \frac{\sqrt{3}}{2}i
$$

Newton's iteration:

$$
z_{n+1} = z_n - \frac{z_n^3 - 1}{3z_n^2}
$$

In GLSL:

```glsl
vec2 dz = cx_div(
  cx_powr3(z) - cx_one(),  // z^3 - 1
  cx_sqr(z) * 3.0           // 3z^2
);
z = z - dz;
```

where `cx_powr3(z) = cx_mul(z, cx_sqr(z))`.

### 6.3 Coloring by Root

For each pixel, we iterate until $z$ is close to one of the known roots, then color by which root it converged to:

```glsl
vec2 root1 = vec2(1.0, 0.0);
vec2 root2 = vec2(-0.5, 0.866025);
vec2 root3 = vec2(-0.5, -0.866025);

// After the iteration loop:
int whichRoot = 0;
float tol = 0.0001;
if (distance(z, root1) < tol) whichRoot = 1;
if (distance(z, root2) < tol) whichRoot = 2;
if (distance(z, root3) < tol) whichRoot = 3;

// Shade by iteration count (darker = more iterations)
float shade = 1.0 - float(iterations) / float(MAX_ITER) * 0.7;

vec3 color = vec3(0.0);
if (whichRoot == 1) color = vec3(1.0, 0.2, 0.2) * shade;
if (whichRoot == 2) color = vec3(0.2, 1.0, 0.2) * shade;
if (whichRoot == 3) color = vec3(0.3, 0.3, 1.0) * shade;
```

### 6.4 The Multiplier Parameter $m$

The generalized Newton iteration introduces a parameter $m$:

$$
z_{n+1} = z_n - m \cdot \frac{f(z_n)}{f'(z_n)}
$$

- $m = 1$: Standard Newton's method
- $m \neq 1$: Relaxed or over-relaxed Newton; produces dramatic fractal variations
- $m$ complex: Produces spiraling, twisting basin boundaries

```glsl
uniform vec2 m; // complex multiplier from JavaScript

vec2 dz = cx_div(cx_powr3(z) - cx_one(), cx_sqr(z) * 3.0);
z = z - cx_mul(m, dz); // apply complex multiplier
```

Map the mouse position to $m$:

```js
s.setUniform("m", [
  map(mouseX, 0, width, 0.5, 1.5),   // real part
  map(mouseY, 0, height, -0.5, 0.5)  // imaginary part
]);
```

### 6.5 Complete Newton Fractal Example

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

let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;
uniform vec2 m;

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

  vec2 roots[3];
  roots[0] = vec2(1.0, 0.0);
  roots[1] = vec2(-0.5, 0.866025);
  roots[2] = vec2(-0.5, -0.866025);

  const int MAX_ITER = 100;
  int iterations = 0;
  int whichRoot = -1;

  for (int i = 0; i < MAX_ITER; i++) {
    // Newton step for z^3 - 1
    vec2 z3 = cx_mul(z, cx_sqr(z));
    vec2 dz = cx_div(z3 - cx_one(), cx_sqr(z) * 3.0);
    z = z - cx_mul(m, dz);
    iterations++;

    // Check convergence
    for (int j = 0; j < 3; j++) {
      if (distance(z, roots[j]) < 0.0001) {
        whichRoot = j;
      }
    }
    if (whichRoot >= 0) break;
  }

  float shade = 1.0 - float(iterations) / float(MAX_ITER) * 0.8;
  float hue = (whichRoot >= 0) ? float(whichRoot) / 3.0 : 0.0;
  vec3 color = (whichRoot >= 0)
    ? hsv2rgb(vec3(hue, 0.8, shade))
    : vec3(0.0);

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
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === 's') saveCanvas('newton', 'png');
}
```

References:
- <https://en.wikipedia.org/wiki/Newton_fractal>
- <https://newton.bobin.at/>
- <https://paulbourke.net/fractals/newtonraphson/>
- <https://editor.p5js.org/kybr/sketches/QVXaYFrWA>
- 3Blue1Brown: <https://www.youtube.com/watch?v=-RdOwhmqP5s>

---

## 7. GLSL with Frame Feedback

### 7.1 The Concept

So far, each frame is computed from scratch. The shader does not know what it drew last frame. **Frame feedback** changes this: we save the previous frame as a texture and feed it back into the shader as an input.

This enables:
- **Cellular automata** (Game of Life)
- **Reaction-diffusion systems**
- **Trail effects** (fading afterimages)
- **Iterative refinement** (progressively rendering more detail)
- **Video feedback** (recursive visual effects)

### 7.2 How It Works in p5.js

p5.js provides `createGraphics()` to make off-screen buffers. We can render to a buffer, then use that buffer as a texture in the next frame.

The pattern:

1. Create two off-screen graphics buffers (ping-pong pattern)
2. Each frame, read from one buffer and write to the other
3. Swap the buffers

### 7.3 Game of Life in GLSL

Conway's [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) is a cellular automaton where each pixel is alive (1) or dead (0). The rules for each frame:

- A dead cell with **exactly 3** live neighbors becomes alive (birth)
- A live cell with **2 or 3** live neighbors stays alive (survival)
- All other live cells die (underpopulation or overpopulation)

Game of Life in GLSL: <https://editor.p5js.org/kybr/sketches/hV5wnBKNQ>

Here is a complete implementation:

```js
// Game of Life in GLSL with Frame Feedback
// MAT 200C -- Week 2

let shaderGOL;
let bufferA, bufferB;
let currentBuffer;

let vertSrc = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
  gl_Position = vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`;

let fragGOLSrc = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D prevFrame;
uniform vec2 resolution;

void main() {
  vec2 pixel = 1.0 / resolution;

  // Read current cell
  float current = texture2D(prevFrame, vTexCoord).r;

  // Count live neighbors (8 surrounding cells)
  float neighbors = 0.0;
  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      if (dx == 0 && dy == 0) continue; // skip self
      vec2 neighborCoord = vTexCoord + vec2(float(dx), float(dy)) * pixel;
      neighbors += step(0.5, texture2D(prevFrame, neighborCoord).r);
    }
  }

  // Apply Game of Life rules
  float alive = 0.0;
  if (current > 0.5) {
    // Currently alive: survive with 2 or 3 neighbors
    if (neighbors > 1.5 && neighbors < 3.5) alive = 1.0;
  } else {
    // Currently dead: birth with exactly 3 neighbors
    if (neighbors > 2.5 && neighbors < 3.5) alive = 1.0;
  }

  gl_FragColor = vec4(vec3(alive), 1.0);
}
`;

let fragDisplaySrc = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D frame;
void main() {
  vec4 color = texture2D(frame, vTexCoord);
  gl_FragColor = color;
}
`;

function setup() {
  createCanvas(512, 512, WEBGL);
  pixelDensity(1);

  // Create two buffers for ping-pong rendering
  bufferA = createGraphics(512, 512, WEBGL);
  bufferB = createGraphics(512, 512, WEBGL);

  bufferA.pixelDensity(1);
  bufferB.pixelDensity(1);

  shaderGOL = createShader(vertSrc, fragGOLSrc);

  // Initialize with random state
  bufferA.loadPixels();
  for (let i = 0; i < bufferA.pixels.length; i += 4) {
    let alive = random() > 0.7 ? 255 : 0;
    bufferA.pixels[i] = alive;
    bufferA.pixels[i+1] = alive;
    bufferA.pixels[i+2] = alive;
    bufferA.pixels[i+3] = 255;
  }
  bufferA.updatePixels();

  currentBuffer = 0;
  noStroke();
}

function draw() {
  let readBuffer = (currentBuffer === 0) ? bufferA : bufferB;
  let writeBuffer = (currentBuffer === 0) ? bufferB : bufferA;

  // Run GOL shader: read from readBuffer, write to writeBuffer
  writeBuffer.shader(shaderGOL);
  shaderGOL.setUniform("prevFrame", readBuffer);
  shaderGOL.setUniform("resolution", [512, 512]);
  writeBuffer.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  // Display the result
  image(writeBuffer, -width/2, -height/2, width, height);

  // Swap buffers
  currentBuffer = 1 - currentBuffer;
}

function mousePressed() {
  // Click to add live cells
  let readBuffer = (currentBuffer === 0) ? bufferA : bufferB;
  readBuffer.loadPixels();
  let x = int(mouseX);
  let y = int(mouseY);
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      let px = x + dx;
      let py = y + dy;
      if (px >= 0 && px < 512 && py >= 0 && py < 512) {
        let idx = (py * 512 + px) * 4;
        readBuffer.pixels[idx] = 255;
        readBuffer.pixels[idx+1] = 255;
        readBuffer.pixels[idx+2] = 255;
      }
    }
  }
  readBuffer.updatePixels();
}
```

### 7.4 The Ping-Pong Pattern

The key technique is **double buffering** (also called "ping-pong"):

- Frame 1: Read from buffer A, write to buffer B
- Frame 2: Read from buffer B, write to buffer A
- Frame 3: Read from buffer A, write to buffer B
- ...

We alternate which buffer we read from and which we write to. This avoids the problem of reading from and writing to the same buffer simultaneously (which would give unpredictable results since the GPU processes pixels in parallel).

### 7.5 Frame Feedback for Visual Effects

Frame feedback is not limited to cellular automata. You can use it for:

**Trail effect (fading)**: Blend the previous frame with new content:

```glsl
vec4 prev = texture2D(prevFrame, vTexCoord) * 0.95; // fade slightly
vec4 current = /* compute new content */;
gl_FragColor = max(prev, current); // keep the brighter of the two
```

**Reaction-diffusion**: Each pixel's new value depends on its neighbors' previous values:

```glsl
// Gray-Scott reaction-diffusion (simplified)
float a = texture2D(prevFrame, vTexCoord).r;
float b = texture2D(prevFrame, vTexCoord).g;

// Laplacian (average of neighbors minus center)
float laplacianA = 0.0, laplacianB = 0.0;
for (int dx = -1; dx <= 1; dx++) {
  for (int dy = -1; dy <= 1; dy++) {
    vec2 nc = vTexCoord + vec2(float(dx), float(dy)) * pixel;
    vec4 n = texture2D(prevFrame, nc);
    float w = (dx == 0 || dy == 0) ? 0.2 : 0.05;
    if (dx == 0 && dy == 0) w = -1.0;
    laplacianA += n.r * w;
    laplacianB += n.g * w;
  }
}

float feed = 0.055;
float kill = 0.062;
float Da = 1.0;
float Db = 0.5;

float newA = a + (Da * laplacianA - a*b*b + feed*(1.0-a));
float newB = b + (Db * laplacianB + a*b*b - (kill+feed)*b);

gl_FragColor = vec4(newA, newB, 0.0, 1.0);
```

---

## 8. Interactivity and Animation

### 8.1 Mouse Uniforms

The mouse position can be sent to the shader as a uniform. In p5.js:

```js
function draw() {
  shader(s);
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1) // flip Y
  ]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

In the shader:

```glsl
uniform vec2 mouse;
// Use mouse.x and mouse.y as parameters
```

Common uses:
- **Julia set $c$ parameter**: `vec2 c = mouse * 2.0;`
- **Newton multiplier**: `vec2 m = mouse;`
- **Zoom center**: pan the view to the mouse position
- **Color parameter**: control palette phase or saturation

### 8.2 Mouse Dragged

For more precise control, use `mouseDragged()`:

```js
let cx = 0, cy = 0;

function mouseDragged() {
  cx += (mouseX - pmouseX) / width * 2;
  cy -= (mouseY - pmouseY) / height * 2;
  s.setUniform("center", [cx, cy]);
}
```

### 8.3 Time Animation

Send the current time to the shader:

```js
s.setUniform("time", millis() / 1000.0);
```

Use it for:

**Animated Julia parameter**:

```glsl
vec2 c = vec2(
  -0.7 + 0.3 * cos(time * 0.3),
  0.27 + 0.3 * sin(time * 0.3)
);
```

**Animated color palette**:

```glsl
float hue = fract(smoothIter / 30.0 + time * 0.05);
```

**Animated power**:

```glsl
float power = 2.0 + sin(time * 0.5) * 0.5;
z = cx_pow(z, power) + c;
```

### 8.4 GUI Elements (Sliders)

p5.js provides DOM elements that can control shader parameters:

```js
let iterSlider, zoomSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vertSrc, fragSrc);
  noStroke();

  iterSlider = createSlider(10, 500, 200, 1);
  iterSlider.position(10, 10);
  iterSlider.style('width', '200px');

  zoomSlider = createSlider(1, 100, 15, 1);
  zoomSlider.position(10, 40);
  zoomSlider.style('width', '200px');
}

function draw() {
  shader(s);
  s.setUniform("maxIter", iterSlider.value());
  s.setUniform("zoom", zoomSlider.value() / 10.0);
  // ...
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

**Important GLSL note**: Loop bounds must be compile-time constants. Use this pattern for runtime-controlled iteration limits:

```glsl
uniform int maxIter;

for (int i = 0; i < 500; i++) { // compile-time max
  if (i >= maxIter) break;      // runtime limit
  // ... iteration ...
}
```

### 8.5 Saving Output

```js
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('my-fractal', 'png');
  }
}
```

For high-resolution output:

```js
function keyPressed() {
  if (key === 'h') {
    resizeCanvas(3840, 2160);
    draw();
    saveCanvas('fractal-4k', 'png');
    resizeCanvas(windowWidth, windowHeight);
  }
}
```

---

## 9. Early Abstract Animation

The computational approaches we have been studying -- generating images from mathematical functions, creating patterns through iterative processes, mapping data to visual form -- have a rich history that predates computers.

### 9.1 Oskar Fischinger (1900--1967)

Fischinger was a German-American animator who pioneered **visual music** -- abstract animated films synchronized to music. His "Wax Experiments" (1921--1926) created animation by slicing through layered wax blocks, each cross-section becoming a frame. This is essentially 3D volumetric data rendered as a 2D sequence.

- [Wax Experiments (excerpt)](https://www.youtube.com/watch?v=zXqIKlCzqL0)

Fischinger's approach -- designing a 3D structure and extracting 2D images from it -- anticipates modern techniques like CT scanning, volume rendering, and slicing through 3D fractal data.

### 9.2 Heider and Simmel (1944)

Fritz Heider and Marianne Simmel created a short animation of geometric shapes (triangles, circles) moving around a rectangle. When shown to test subjects, nearly everyone described the shapes as intentional agents: "the big triangle is chasing the small one," "the circle is hiding."

- [Heider and Simmel (1944) animation](https://www.youtube.com/watch?v=VTNmLt7QX8E)

This demonstrates that **humans automatically attribute agency to moving shapes**. This is directly relevant when we create agent-based simulations: viewers will see intentions and emotions in our agents' movements even if we coded no such thing.

### 9.3 Norman McLaren (1914--1987)

McLaren pioneered **direct animation** -- drawing and scratching directly on film. In _Dots_ (1940), he created both the visuals and soundtrack by hand-marking the film strip.

- [Norman McLaren - Dots (1940)](https://www.youtube.com/watch?v=E3-vsKwQ0Cg)

McLaren's key insight: "Animation is not the art of drawings that move, but the art of movements that are drawn." This resonates directly with shader programming, where we design *processes* that produce visual output.

### 9.4 Mary Ellen Bute (1906--1983)

Bute used oscilloscopes and electronic signals to generate abstract visual forms, synchronized to music. _Tarantella_ (1940) combined electronic Lissajous figures with hand-animation.

- [Mary Ellen Bute - Tarantella (1940)](https://www.youtube.com/watch?v=czDsy8BYP1M)

Bute's oscilloscope work is a direct predecessor of shader-based visualization: converting mathematical functions to visual patterns in real time.

### 9.5 The Continuity

These artists share a set of principles that run directly through computing arts:

- **Abstract form as a complete artistic language** (no representation needed)
- **Process over product** (design the system, not individual frames)
- **Mathematics as aesthetics** (functions and transformations are inherently visual)
- **Cross-modal correspondence** (visual-musical synesthesia)
- **Technology as artistic instrument** (film, oscilloscopes, GPUs)

---

## 10. Exercises

### Exploration Exercises

1. **Formula explorer**: Starting from the starter code (<https://editor.p5js.org/kybr/sketches/NmgtHIKFc>), implement at least three different iteration rules ($z^3 + c$, $\sin(z) + c$, $e^z + c$). For each, adjust the viewing bounds and escape radius to capture an interesting region. Save an image of each.

2. **Julia set gallery**: Pick one formula and create a gallery of 5 Julia set images using different fixed $c$ values. Describe how the Julia set changes as $c$ moves through the complex plane.

3. **Smooth coloring**: Implement the smooth iteration count formula and compare it side-by-side with raw integer iteration count coloring. Zoom into a region where banding is visible and show the improvement.

### Coloring Exercises

4. **Four-statistic coloring**: Track total path length, average segment length, displacement, and curvature during iteration. Map each statistic to a different aspect of color (e.g., hue, saturation, value, and alpha). Describe what each statistic reveals about the fractal structure.

5. **Orbit trap design**: Implement a circle orbit trap centered at $(0.5, 0)$ with radius 0.3. Color the fractal using the minimum distance to this trap. Then try different trap shapes (line, cross, another circle at a different position).

6. **Cosine palette design**: Using the formula $\text{color}(t) = a + b\cos(2\pi(ct + d))$, design three different palettes by choosing different $a$, $b$, $c$, $d$ vectors. Apply each to the same fractal and compare.

### Newton Fractal Exercises

7. **Newton fractal basics**: Implement the Newton fractal for $z^3 - 1$ with the three roots colored red, green, and blue. Verify that your image matches the one on Wikipedia.

8. **Multiplier exploration**: Add mouse control to the Newton multiplier $m$. Move the mouse slowly around $(1, 0)$. At what values of $m$ does the fractal look most chaotic? Most orderly?

9. **Higher-degree Newton**: Implement the Newton fractal for $z^5 - 1$ (five roots). Choose five visually distinct colors. Describe the 5-fold symmetry.

### Frame Feedback Exercises

10. **Game of Life**: Implement Conway's Game of Life using GLSL frame feedback. Start with a random initial state. Then try specific patterns: a glider, a pulsar, a glider gun. (Look these up on the Game of Life wiki.)

11. **Trail effect**: Use frame feedback to add fading trails to a fractal Julia set animation. As the $c$ parameter changes over time, previously drawn pixels should slowly fade.

### Creative Exercises

12. **Hybrid fractal**: Create a fractal that alternates between two different iteration rules on odd and even steps (e.g., $z^2 + c$ on even steps, $\sin(z) + c$ on odd steps).

13. **Animated Newton**: Animate the Newton multiplier $m$ using `time` to trace a circle in the complex plane. Record a screen capture of the result.

14. **Personal fractal**: Design your own iteration rule. It must be nonlinear (not just $az + b$). Document why you chose it, what you expected, and what you actually saw. Save your best image.

### Reading and Reflection

15. **Heider and Simmel**: Watch the [Heider and Simmel animation](https://www.youtube.com/watch?v=VTNmLt7QX8E). Write a one-paragraph description of what you see. Then read about the original experiment. Reflect on the gap between geometric reality and perceptual experience.

16. **Fischinger connection**: Watch [Fischinger's Wax Experiments](https://www.youtube.com/watch?v=zXqIKlCzqL0). How does the technique of slicing through a 3D structure to produce 2D frames relate to our technique of evaluating a 2D function to produce a pixel grid? Write a short paragraph connecting the two.

---

## Summary

This chapter covered a wide arc from mathematical foundations to artistic vision:

- **Complex arithmetic in GLSL** provides the computational substrate for all our fractal work. We built multiplication, division, exponentiation, sine, cosine, power, and logarithm for complex numbers.

- **Alternative fractal formulas** ($z^3 + c$, $\sin(z) + c$, $e^z + c$, etc.) produce entirely different fractal landscapes. Each function's geometry -- its symmetries, periodicities, growth rates -- shapes the fractal it produces. We are doing alchemy: experimenting without complete theoretical understanding, observing what emerges.

- **Fractal coloring** goes far beyond counting iterations. We can extract path length, segment statistics, curvature, orbit traps, and other data from the iteration process and map these to color using HSV, cosine palettes, or CIELAB for perceptually smooth gradients.

- **Newton fractals** arise from applying Newton's root-finding method to complex polynomials. They are colored by which root each starting point converges to, revealing fractal basin boundaries. The multiplier $m$ parameter creates dramatic variations.

- **Frame feedback** in GLSL enables cellular automata (Game of Life), reaction-diffusion, and trail effects by feeding the previous frame back as a texture input.

- **Interactivity** through mouse uniforms, time-based animation, and GUI sliders transforms static fractal renderers into real-time exploration tools.

- **Early abstract animation** -- Fischinger, McLaren, Bute, and the Heider-Simmel experiment -- establishes that abstract moving forms carry meaning, that process can be art, and that mathematics and aesthetics are deeply intertwined.

---

## Resources

### Starter Code and Examples
- Fractal starter: <https://editor.p5js.org/kybr/sketches/NmgtHIKFc>
- Coloring sketch: <https://editor.p5js.org/kybr/sketches/NR0obTTlL>
- Iteration paths: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>
- Newton fractal: <https://editor.p5js.org/kybr/sketches/QVXaYFrWA>
- Game of Life GLSL: <https://editor.p5js.org/kybr/sketches/hV5wnBKNQ>

### Fractal Explorers
- <https://v8.zsnout.com/fractal-explorer>
- <https://newton.bobin.at/>
- <https://www.malinc.se/m/NewtonFractals.php>
- <https://codepen.io/mherreshoff/full/RwZPazd>
- <https://mandelbrotandco.com/newton/index.html>

### References
- Paul Bourke's fractals: <https://paulbourke.net/fractals>
- Coloring tutorial: <https://mandelbrowser.y0.pl/tutorial/computing.html>
- Inigo Quilez palettes: <https://iquilezles.org/articles/palettes/>
- Book of Shaders: <https://thebookofshaders.com/>
- WebGL reference: <https://www.khronos.org/files/webgl20-reference-guide.pdf>
- HSV: <https://en.wikipedia.org/wiki/HSL_and_HSV>
- CIELAB: <https://en.wikipedia.org/wiki/CIELAB_color_space>

### Videos
- [The meaning within the Mandelbrot set](https://www.youtube.com/watch?v=y9BK--OxZpY) (3Blue1Brown)
- [Beyond the Mandelbrot set](https://www.youtube.com/watch?v=LqbZpur38nw) (3Blue1Brown)
- [Newton's fractal](https://www.youtube.com/watch?v=-RdOwhmqP5s) (3Blue1Brown)
- [Mandelbrot's Evil Twin](https://www.youtube.com/watch?v=Ed1gsyxxwM0) (Two Swap)
- [Oskar Fischinger, Wax Experiments](https://www.youtube.com/watch?v=zXqIKlCzqL0)
- [Heider and Simmel (1944)](https://www.youtube.com/watch?v=VTNmLt7QX8E)
- [Norman McLaren - Dots (1940)](https://www.youtube.com/watch?v=E3-vsKwQ0Cg)
- [Mary Ellen Bute - Tarantella (1940)](https://www.youtube.com/watch?v=czDsy8BYP1M)
- [Curtis Roads - Half-life](https://www.youtube.com/watch?v=jOzOZvoyUJ4)
