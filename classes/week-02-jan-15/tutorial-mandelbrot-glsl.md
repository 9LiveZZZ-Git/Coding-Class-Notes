# Tutorial: Porting the Mandelbrot Set to GLSL

**MAT 200C: Computing Arts -- Week 2, January 15**

---

## Overview

In this tutorial, we take the Mandelbrot set algorithm we built on the CPU (using p5.js and math.js) and port it to a **GLSL fragment shader** running on the GPU. The result is the same fractal image, but rendered in a fraction of a second instead of 60 seconds.

We will cover:

1. Why GLSL is perfect for the Mandelbrot set
2. Representing complex numbers as `vec2`
3. Implementing complex multiplication in GLSL
4. Writing the iteration loop in the fragment shader
5. Sending parameters from JavaScript via uniforms
6. The complete working shader code
7. Understanding the massive speedup

---

## Why Move to the GPU?

The CPU Mandelbrot renderer has a critical performance problem: it processes pixels **one at a time**. For a 400x400 canvas, it must compute 160,000 pixels sequentially. Each pixel requires up to 100 iterations of complex arithmetic. The total time is often 30-60 seconds.

But notice something about the algorithm: **every pixel is independent**. The computation for pixel $(50, 73)$ does not depend on the result for pixel $(200, 150)$. Each pixel maps to a complex number $c$, iterates $z = z^2 + c$ on its own, and produces its own color. No pixel needs to know about any other pixel.

This is *perfectly parallel* -- and the GPU is designed for exactly this kind of work. A modern GPU has thousands of small cores. It runs our fragment shader on thousands of pixels simultaneously. The same computation that took 60 seconds on the CPU takes about $1/60$ of a second on the GPU.

```
CPU: pixel 1, pixel 2, pixel 3, pixel 4, pixel 5 ...  (serial)
GPU: pixel 1  pixel 2  pixel 3  pixel 4  pixel 5 ...  (parallel)
     pixel 6  pixel 7  pixel 8  pixel 9  pixel 10 ... (parallel)
     ...thousands more at the same time...
```

---

## The Challenge: GLSL Has No Complex Numbers

GLSL is a low-level language. It knows about `float`, `vec2`, `vec3`, `vec4`, and matrices. It does **not** know about complex numbers. There is no `math.complex()`, no `math.multiply()`.

We have to implement complex arithmetic ourselves. The key insight is:

> A complex number $a + bi$ has two components, just like a 2D vector. We can represent it as a `vec2` where `.x` is the real part and `.y` is the imaginary part.

```glsl
// The complex number 2 + 3i
vec2 c = vec2(2.0, 3.0);
// c.x = 2.0 (real part)
// c.y = 3.0 (imaginary part)
```

---

## Complex Addition in GLSL

Adding two complex numbers means adding their real parts and adding their imaginary parts:

$$(a + bi) + (c + di) = (a + c) + (b + d)i$$

This is exactly how `vec2` addition already works in GLSL:

```glsl
vec2 z1 = vec2(1.0, 2.0); // 1 + 2i
vec2 z2 = vec2(3.0, 4.0); // 3 + 4i
vec2 sum = z1 + z2;        // vec2(4.0, 6.0) = 4 + 6i
```

Addition works automatically. We do not need a special function for it.

---

## Complex Multiplication in GLSL

This is where things get tricky. Multiplying two complex numbers is **not** the same as component-wise vector multiplication. Let us derive it:

$$z_0 \cdot z_1 = (x_0 + y_0 i)(x_1 + y_1 i)$$

Expanding using FOIL:

$$= x_0 x_1 + x_0 y_1 i + y_0 x_1 i + y_0 y_1 i^2$$

Since $i^2 = -1$:

$$= x_0 x_1 + x_0 y_1 i + y_0 x_1 i - y_0 y_1$$

Grouping real and imaginary parts:

$$= (x_0 x_1 - y_0 y_1) + (y_0 x_1 + x_0 y_1) i$$

So the result is:

- **Real part:** $x_0 x_1 - y_0 y_1$
- **Imaginary part:** $y_0 x_1 + x_0 y_1$

### The GLSL Function

```glsl
vec2 complex_multiply(vec2 z0, vec2 z1) {
  return vec2(
    z0.x * z1.x - z0.y * z1.y,  // real part
    z0.y * z1.x + z0.x * z1.y   // imaginary part
  );
}
```

### A Critical Warning

The `*` operator on `vec2` in GLSL does **component-wise** multiplication, which is NOT the same as complex multiplication:

```glsl
vec2 z = vec2(2.0, 3.0);

// WRONG! This is component-wise: vec2(4.0, 9.0)
vec2 wrong = z * z;

// CORRECT! This is complex multiplication: vec2(-5.0, 12.0)
vec2 right = complex_multiply(z, z);
```

Let us verify: $(2 + 3i)^2 = 4 + 12i + 9i^2 = 4 + 12i - 9 = -5 + 12i$. The correct answer is $(-5, 12)$, not $(4, 9)$.

---

## Complex Magnitude in GLSL

The magnitude (absolute value) of a complex number $z = a + bi$ is:

$$|z| = \sqrt{a^2 + b^2}$$

This is the same as the length of a 2D vector. GLSL has a built-in function for this:

```glsl
float mag = length(z); // sqrt(z.x*z.x + z.y*z.y)
```

We use this to check if the iteration has diverged: if `length(z) > 2.0`, the sequence will escape to infinity.

---

## The Mandelbrot Iteration in GLSL

Here is the core algorithm translated to GLSL:

```glsl
uniform int max_iterations;

vec2 complex_multiply(vec2 z0, vec2 z1) {
  return vec2(
    z0.x * z1.x - z0.y * z1.y,
    z0.y * z1.x + z0.x * z1.y
  );
}

// Returns the number of iterations before divergence
int mandelbrot(vec2 c) {
  vec2 z = vec2(0.0, 0.0);
  for (int i = 0; i < max_iterations; i++) {
    z = complex_multiply(z, z) + c;
    if (length(z) > 2.0) {
      return i;
    }
  }
  return max_iterations;
}
```

Compare this to the CPU version:

```js
// CPU version with math.js
function mandelbrotIterations(c, maxIter) {
  let z = math.complex(0, 0);
  for (let i = 0; i < maxIter; i++) {
    z = math.add(math.multiply(z, z), c);
    if (math.abs(z) > 2) return i;
  }
  return maxIter;
}
```

The logic is identical. The only differences are:
1. We use `vec2` instead of `math.complex()`
2. We use our own `complex_multiply()` instead of `math.multiply()`
3. We use `length()` instead of `math.abs()`
4. We use GLSL syntax (C-like) instead of JavaScript

---

## Mapping Pixel Position to Complex Coordinates

In the CPU version, we used `map()` to convert pixel coordinates to complex plane coordinates. In the fragment shader, we receive `vPosition` in clip space $(-1, 1)$ and need to map it to the Mandelbrot's coordinate space.

We can send the bounds as uniforms:

```glsl
uniform vec2 bounds_min; // e.g., vec2(-2.5, -1.2)
uniform vec2 bounds_max; // e.g., vec2(1.0, 1.2)

void main() {
  // Map from clip space (-1,1) to complex plane
  vec2 uv = vPosition * 0.5 + 0.5; // now in (0, 1)
  vec2 c = mix(bounds_min, bounds_max, uv);
  // mix() linearly interpolates: bounds_min + uv * (bounds_max - bounds_min)

  int iterations = mandelbrot(c);
  // ... color based on iterations
}
```

Or, for simplicity, you can hardcode the mapping:

```glsl
void main() {
  // Map vPosition from (-1,1) to the Mandelbrot region
  float real = vPosition.x * 1.75 - 0.75; // real: -2.5 to 1.0
  float imag = vPosition.y * 1.2;          // imag: -1.2 to 1.2
  vec2 c = vec2(real, imag);

  int iterations = mandelbrot(c);
  // ...
}
```

---

## Complete Working Code

### sketch.js

```js
// MAT 200C - Mandelbrot Set in GLSL
// Massively parallel GPU computation

let s;

let vert = `
  precision highp float;
  attribute vec3 aPosition;
  varying vec2 vPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
    vPosition = gl_Position.xy;
  }
`;

let frag = `
  precision highp float;

  varying vec2 vPosition;

  uniform int max_iterations;
  uniform vec2 bounds_min;
  uniform vec2 bounds_max;

  // Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
  vec2 complex_multiply(vec2 z0, vec2 z1) {
    return vec2(
      z0.x * z1.x - z0.y * z1.y,
      z0.y * z1.x + z0.x * z1.y
    );
  }

  void main() {
    // Map pixel position from clip space to complex plane
    vec2 uv = vPosition * 0.5 + 0.5;
    vec2 c = mix(bounds_min, bounds_max, uv);

    // Mandelbrot iteration: z = z^2 + c
    vec2 z = vec2(0.0, 0.0);
    int iteration_count = 0;

    for (int i = 0; i < 1000; i++) {
      if (i >= max_iterations) break;

      z = complex_multiply(z, z) + c;

      if (length(z) > 2.0) {
        break;
      }
      iteration_count++;
    }

    // Color based on iteration count
    if (iteration_count >= max_iterations) {
      // In the set: black
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      // Outside the set: color by how quickly it escaped
      float t = float(iteration_count) / float(max_iterations);

      // A nice color palette
      vec3 color = vec3(
        0.5 + 0.5 * cos(6.28318 * (t + 0.0)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.33)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.67))
      );

      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

function setup() {
  createCanvas(800, 800, WEBGL);
  s = createShader(vert, frag);
  noStroke();
}

function draw() {
  shader(s);

  s.setUniform("max_iterations", 100);
  s.setUniform("bounds_min", [-2.5, -1.2]);
  s.setUniform("bounds_max", [1.0, 1.2]);

  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

---

## Understanding the Loop Construct

You may have noticed something odd about the `for` loop:

```glsl
for (int i = 0; i < 1000; i++) {
  if (i >= max_iterations) break;
  // ...
}
```

Why not just write `for (int i = 0; i < max_iterations; i++)`? On some GPUs and older GLSL versions, the loop bound must be a **compile-time constant**. By using a fixed upper bound (1000) and breaking early based on the uniform, we satisfy this requirement while still allowing `max_iterations` to be adjustable from JavaScript.

---

## Adding Interactivity

Let us add zoom and pan with the mouse:

```js
let centerX = -0.75;
let centerY = 0.0;
let zoom = 1.75;
let maxIter = 100;

function setup() {
  createCanvas(800, 800, WEBGL);
  s = createShader(vert, frag);
  noStroke();
}

function draw() {
  shader(s);

  // Compute bounds from center and zoom
  let aspect = width / height;
  let bMinX = centerX - zoom * aspect;
  let bMaxX = centerX + zoom * aspect;
  let bMinY = centerY - zoom;
  let bMaxY = centerY + zoom;

  s.setUniform("max_iterations", maxIter);
  s.setUniform("bounds_min", [bMinX, bMinY]);
  s.setUniform("bounds_max", [bMaxX, bMaxY]);

  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function mousePressed() {
  // Re-center on the clicked point
  let uv_x = mouseX / width;
  let uv_y = 1.0 - mouseY / height; // flip y
  let aspect = width / height;

  centerX = (centerX - zoom * aspect) + uv_x * (2.0 * zoom * aspect);
  centerY = (centerY - zoom) + uv_y * (2.0 * zoom);

  // Zoom in by a factor of 2
  zoom *= 0.5;

  // Increase iterations for deeper zooms
  maxIter = min(maxIter + 50, 1000);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Reset
    centerX = -0.75;
    centerY = 0.0;
    zoom = 1.75;
    maxIter = 100;
  }
  if (key === 's' || key === 'S') {
    saveCanvas();
  }
}
```

Now you can click anywhere to zoom in, and press 'r' to reset. Each zoom reveals more detail at the boundary of the set -- detail that renders in real time because the GPU is doing all the work.

---

## Alternative Iteration Rules

The beauty of this approach is that changing the fractal is trivial. The Mandelbrot set uses $z^2 + c$, but you can try any nonlinear function:

### $z^3 + c$ (Multibrot)

```glsl
z = complex_multiply(complex_multiply(z, z), z) + c;
```

### $\sin(z) + c$

For complex sine, we need the formula:

$$\sin(a + bi) = \sin(a)\cosh(b) + i\cos(a)\sinh(b)$$

```glsl
vec2 complex_sin(vec2 z) {
  return vec2(
    sin(z.x) * cosh(z.y),
    cos(z.x) * sinh(z.y)
  );
}

// In the loop:
z = complex_sin(z) + c;
```

Note: GLSL provides `sinh()` and `cosh()` as built-in functions.

### $z^2 \cdot c + z$ (Variation)

```glsl
z = complex_multiply(complex_multiply(z, z), c) + z;
```

When you change the iteration rule, you will likely need to change the bounds too, because the interesting region may be at a different location and scale.

---

## The Speedup: CPU vs. GPU

| | CPU (p5.js + math.js) | GPU (GLSL) |
|---|---|---|
| Time for 400x400, 100 iterations | ~60 seconds | ~0.016 seconds (1/60 sec) |
| Speedup factor | 1x | ~3,600x |
| Pixels computed in parallel | 1 | Thousands |
| Can animate in real time | No | Yes |
| Interactive zoom | Impractical | Smooth |

The GPU version is roughly **3,600 times faster**. This is not a small optimization -- it is a fundamental change in how the computation is organized. The algorithm is exactly the same; only the execution model is different.

---

## Common Errors When Writing GLSL Mandelbrot

### 1. Using `*` Instead of `complex_multiply`

```glsl
z = z * z + c;                      // WRONG: component-wise multiply
z = complex_multiply(z, z) + c;     // CORRECT: complex multiply
```

The code with `z * z` will compile and run without errors, but it will produce the wrong image. It computes $(x^2, y^2)$ instead of $(x^2 - y^2, 2xy)$. You will see a boring shape instead of the Mandelbrot set.

### 2. Integer/Float Mismatch

```glsl
vec2 z = vec2(0, 0);     // ERROR: 0 is int, vec2 needs float
vec2 z = vec2(0.0, 0.0); // CORRECT

if (length(z) > 2) { ... }     // ERROR: 2 is int
if (length(z) > 2.0) { ... }   // CORRECT
```

### 3. Forgetting to Convert Iteration Count to Float

```glsl
float t = iteration_count / max_iterations;         // WRONG: integer division
float t = float(iteration_count) / float(max_iterations); // CORRECT
```

Integer division in GLSL truncates: `7 / 10` equals `0`, not `0.7`. You must cast to `float` first.

### 4. Wrong Bounds Mapping

Make sure your complex plane mapping is correct. A common mistake is forgetting to flip the y-axis or getting the aspect ratio wrong, producing a stretched or inverted image.

---

## Exercises

1. **Change the color palette.** Instead of the cosine-based palette, try mapping the iteration count to a gradient from dark blue to white, or use an HSV-like scheme.

2. **Implement $z^3 + c$.** The resulting fractal (a "Multibrot") has 3-fold symmetry instead of the Mandelbrot's 2-fold symmetry.

3. **Smooth coloring.** Instead of integer iteration count, use the "smooth iteration count" formula: `float smooth_iter = float(iteration_count) + 1.0 - log(log(length(z))) / log(2.0);` This removes the sharp color banding.

4. **Julia sets.** Instead of varying $c$ per pixel and starting $z = 0$, fix $c$ to a constant and vary $z_0$ per pixel. Send $c$ as a uniform controlled by the mouse position.

5. **Animate the fractal.** Use a `time` uniform to slowly change the bounds, creating a continuous zoom animation.

---

## References

- Starting GLSL Mandelbrot sketch from class: <https://editor.p5js.org/kybr/sketches/SwCJ9wJtK>
- Complete solution from class: <https://editor.p5js.org/kybr/sketches/faBZETS5F>
- Assignment starter code: <https://editor.p5js.org/kybr/sketches/NmgtHIKFc>
- Fractal explorers for inspiration:
  - <https://v8.zsnout.com/fractal-explorer>
  - <https://jsdw.me/js-fractal-explorer>
  - <https://fractaldex.org>
- 3Blue1Brown - The meaning within the Mandelbrot set: <https://www.youtube.com/watch?v=y9BK--OxZpY>
