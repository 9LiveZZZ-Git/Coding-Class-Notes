# Tutorial: Building a Mandelbrot Set Renderer on the CPU with p5.js

**MAT 200C: Computing Arts -- Week 2, January 15**

---

## Overview

In this tutorial, we will build a Mandelbrot set renderer from scratch using p5.js running on the CPU. By the end, you will have a working sketch that draws the iconic Mandelbrot fractal by iterating a simple equation over every pixel on the canvas.

We will cover:

1. What complex numbers are and why we need them
2. How to use the math.js library for complex arithmetic
3. The $z^2 + c$ iteration at the heart of the Mandelbrot set
4. Counting iterations until divergence
5. Mapping pixel positions to complex plane coordinates
6. Coloring pixels based on iteration count

---

## Prerequisites

- Basic familiarity with p5.js (setup/draw, creating a canvas)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: Understanding Complex Numbers (Quick Review)

A **complex number** has two parts: a *real* part and an *imaginary* part. We write it as:

$$z = a + bi$$

where $a$ is the real part, $b$ is the imaginary part, and $i = \sqrt{-1}$.

You can think of a complex number as a point on a 2D plane:

- The horizontal axis represents the **real** part
- The vertical axis represents the **imaginary** part

This 2D plane is called the **complex plane**. Every pixel on our canvas will correspond to a point on this plane.

### Why Complex Numbers?

The Mandelbrot set is defined by iterating a function on complex numbers. Complex multiplication has a special property: it simultaneously rotates and scales. This creates the swirling, spiraling, self-similar structures we see in fractals.

---

## Step 2: Setting Up math.js

JavaScript does not have built-in complex number support, so we use the **math.js** library. In the p5.js web editor, you can include it by adding this line to your `index.html` file, inside the `<head>` tag:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js"></script>
```

With math.js loaded, you can create and manipulate complex numbers:

```js
// Create a complex number: 2 + 3i
let z = math.complex(2, 3);

// Access the real and imaginary parts
print(z.re); // 2
print(z.im); // 3

// Basic operations
let sum = math.add(z, math.complex(1, 1)); // (3 + 4i)
let product = math.multiply(z, z);          // z squared
let magnitude = math.abs(z);               // |z| = sqrt(4 + 9) = sqrt(13)
```

### Key math.js Functions We Will Use

| Function | Purpose | Example |
|---|---|---|
| `math.complex(a, b)` | Create $a + bi$ | `math.complex(2, 3)` |
| `math.add(z1, z2)` | Addition | `math.add(z, c)` |
| `math.multiply(z1, z2)` | Multiplication | `math.multiply(z, z)` |
| `math.abs(z)` | Magnitude $\|z\| = \sqrt{a^2 + b^2}$ | `math.abs(z)` |

---

## Step 3: The Mandelbrot Iteration

The Mandelbrot set is defined by this recurrence relation:

$$z_{n+1} = z_n^2 + c$$

where both $z$ and $c$ are complex numbers. Here is the procedure:

1. Pick a point $c$ on the complex plane (this is our pixel).
2. Start with $z_0 = 0$.
3. Compute $z_1 = z_0^2 + c = c$.
4. Compute $z_2 = z_1^2 + c$.
5. Compute $z_3 = z_2^2 + c$.
6. Keep going...

Two things can happen:

- **The sequence stays bounded** (the magnitude $|z|$ stays small). This means $c$ is **in** the Mandelbrot set.
- **The sequence diverges** (the magnitude $|z|$ grows without bound). This means $c$ is **not in** the Mandelbrot set.

A key mathematical fact: if $|z|$ ever exceeds 2, the sequence is guaranteed to diverge. So we use 2 as our escape threshold.

### Counting Iterations

We do not iterate forever. We set a **maximum number of iterations** (e.g., 100). For each pixel, we count how many iterations it takes before $|z| > 2$. If we reach the maximum without escaping, we assume the point is in the set.

```js
function mandelbrotIterations(c, maxIter) {
  let z = math.complex(0, 0);
  for (let i = 0; i < maxIter; i++) {
    z = math.add(math.multiply(z, z), c);
    if (math.abs(z) > 2) {
      return i; // diverged after i iterations
    }
  }
  return maxIter; // did not diverge
}
```

---

## Step 4: Mapping Pixels to the Complex Plane

Our canvas is a grid of pixels with coordinates $(x, y)$ where $x$ goes from $0$ to `width` and $y$ goes from $0$ to `height`. We need to map these to a region of the complex plane.

The "interesting" part of the Mandelbrot set lives roughly in the region:

- Real part: $-2.5$ to $1.0$
- Imaginary part: $-1.2$ to $1.2$

We use p5.js's `map()` function to convert pixel coordinates:

```js
// For a pixel at position (px, py):
let real = map(px, 0, width, -2.5, 1.0);
let imag = map(py, 0, height, -1.2, 1.2);
let c = math.complex(real, imag);
```

Note that we map the vertical axis to the imaginary part. The top of the canvas ($y = 0$) corresponds to the top of the complex plane (positive imaginary), and the bottom ($y = $ `height`) corresponds to negative imaginary.

---

## Step 5: Coloring Based on Iteration Count

Points inside the Mandelbrot set (those that reach `maxIter`) are traditionally colored **black**. Points outside the set are colored based on how quickly they diverge:

- **Low iteration count** = diverged quickly = one color
- **High iteration count** = diverged slowly = another color

A simple approach maps the iteration count to a grayscale value:

```js
let brightness = map(iterations, 0, maxIter, 255, 0);
```

Points that escape quickly are bright; points that escape slowly are dark; points in the set are black.

---

## Step 6: Putting It All Together

Here is the complete, working sketch. Copy this into the p5.js web editor.

### index.html

Make sure your `index.html` includes math.js. Find the `<head>` section and add:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js"></script>
```

### sketch.js

```js
// MAT 200C - Mandelbrot Set on the CPU
// Uses math.js for complex number arithmetic
//
// WARNING: This is slow! It computes every pixel one at a time
// on the CPU. Expect it to take many seconds (or even a minute)
// depending on canvas size and maxIter.

let maxIter = 100;

// Boundaries of the region of the complex plane we are viewing
let realMin = -2.5;
let realMax = 1.0;
let imagMin = -1.2;
let imagMax = 1.2;

function setup() {
  createCanvas(400, 400);
  pixelDensity(1); // important: prevents high-DPI scaling issues
  noLoop();        // we only need to draw once
}

function draw() {
  loadPixels();

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {

      // Step 1: Map pixel position to complex plane
      let real = map(px, 0, width, realMin, realMax);
      let imag = map(py, 0, height, imagMax, imagMin);
      // Note: imagMax comes first because y=0 is the top of the canvas
      // but we want it to correspond to positive imaginary values

      let c = math.complex(real, imag);

      // Step 2: Iterate z = z^2 + c
      let z = math.complex(0, 0);
      let iteration = 0;

      for (let i = 0; i < maxIter; i++) {
        z = math.add(math.multiply(z, z), c);
        if (math.abs(z) > 2) {
          break;
        }
        iteration++;
      }

      // Step 3: Choose a color based on iteration count
      let brightness;
      if (iteration === maxIter) {
        // Point is in the Mandelbrot set
        brightness = 0; // black
      } else {
        // Point escaped; map iteration count to brightness
        brightness = map(iteration, 0, maxIter, 255, 0);
      }

      // Step 4: Set the pixel color
      let index = (py * width + px) * 4;
      pixels[index + 0] = brightness; // R
      pixels[index + 1] = brightness; // G
      pixels[index + 2] = brightness; // B
      pixels[index + 3] = 255;        // A (fully opaque)
    }
  }

  updatePixels();
  print("Done rendering!");
}
```

### What Each Section Does

**Lines 8-12: Defining the view.** These four numbers define which rectangle of the complex plane we are looking at. Changing them lets you "zoom in" to different parts of the fractal.

**Line 15-17: Canvas setup.** We use `pixelDensity(1)` to make sure one pixel in our code equals one pixel on screen (otherwise, on Retina displays, our pixel array would be the wrong size). We use `noLoop()` because we only need to render the image once.

**Lines 23-24: Mapping pixel to complex number.** Notice that `imagMax` and `imagMin` are swapped in the `map()` call. This is because the canvas y-axis points downward (y=0 at top), but we want the imaginary axis to point upward (positive imaginary at top).

**Lines 29-39: The Mandelbrot iteration.** This is the core algorithm. We start with $z = 0$ and repeatedly compute $z = z^2 + c$. If $|z|$ exceeds 2, the point has escaped and we stop counting.

**Lines 42-48: Coloring.** Points that never escaped (iteration equals maxIter) are colored black. Points that escaped are colored based on how many iterations it took.

**Lines 51-55: Writing to the pixel array.** The p5.js pixel array stores colors as RGBA values, four consecutive numbers per pixel.

---

## Step 7: Making It More Colorful

Grayscale is fine, but the Mandelbrot set is famous for its colorful renderings. Here is a simple color scheme using HSB (Hue, Saturation, Brightness) mode:

```js
function draw() {
  colorMode(HSB, 360, 100, 100);
  loadPixels();

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let real = map(px, 0, width, realMin, realMax);
      let imag = map(py, 0, height, imagMax, imagMin);
      let c = math.complex(real, imag);

      let z = math.complex(0, 0);
      let iteration = 0;

      for (let i = 0; i < maxIter; i++) {
        z = math.add(math.multiply(z, z), c);
        if (math.abs(z) > 2) {
          break;
        }
        iteration++;
      }

      let index = (py * width + px) * 4;

      if (iteration === maxIter) {
        // In the set: black
        pixels[index + 0] = 0;
        pixels[index + 1] = 0;
        pixels[index + 2] = 0;
        pixels[index + 3] = 255;
      } else {
        // Outside the set: colorful
        let hue = map(iteration, 0, maxIter, 0, 360);
        let col = color(hue, 90, 90);
        pixels[index + 0] = red(col);
        pixels[index + 1] = green(col);
        pixels[index + 2] = blue(col);
        pixels[index + 3] = 255;
      }
    }
  }

  updatePixels();
}
```

---

## Step 8: Zooming In

One of the most remarkable properties of the Mandelbrot set is its **infinite detail**. You can zoom in forever and keep finding new structure. To zoom in, just change the boundary variables:

```js
// Zoom into the "Seahorse Valley" region
let realMin = -0.8;
let realMax = -0.7;
let imagMin = 0.05;
let imagMax = 0.15;

// You may want to increase maxIter when zooming in
let maxIter = 300;
```

Try different regions. The boundary of the Mandelbrot set is where all the interesting detail lives.

---

## Why Is This Slow?

This CPU implementation is **serial**: it computes one pixel at a time, one after another. For a 400x400 canvas, that is 160,000 pixels, each requiring up to 100 iterations of complex multiplication. That is up to 16 million complex multiplications.

Furthermore, math.js creates new objects for every operation, which adds overhead. The CPU must process each pixel sequentially -- it cannot work on multiple pixels at the same time.

In the GLSL tutorial, we will move this computation to the **GPU**, which can process thousands of pixels simultaneously. The same image that takes 60 seconds on the CPU will render in a fraction of a second on the GPU.

---

## Exercises

1. **Change the color mapping.** Instead of mapping iteration count linearly, try `sqrt(iteration)` or `log(iteration)` to bring out more detail in the boundary regions.

2. **Zoom into different regions.** Try the coordinates $(-0.745, 0.186)$ with a very small window (e.g., $\pm 0.01$). Increase `maxIter` to 500.

3. **Change the recurrence rule.** Instead of $z^2 + c$, try $z^3 + c$. What happens to the shape?

4. **Interactive zoom.** Add `mousePressed()` to re-center the view on the clicked point and zoom in by a factor of 2.

---

## References

- p5.js web editor sketch from class: <https://editor.p5js.org/kybr/sketches/ZPu-iKF82>
- math.js complex number docs: <https://mathjs.org/docs/datatypes/complex_numbers.html>
- 3Blue1Brown - The meaning within the Mandelbrot set: <https://www.youtube.com/watch?v=y9BK--OxZpY>
- Wikipedia - Mandelbrot set: <https://en.wikipedia.org/wiki/Mandelbrot_set>
