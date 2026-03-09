# Tutorial: Pixel Manipulation in p5.js

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Overview

In the Mandelbrot CPU tutorial, you saw how to write individual pixels using `loadPixels()` and `updatePixels()`. This tutorial goes deeper into direct pixel manipulation: how the pixel array is structured, how to read and write individual pixels, and how to implement image processing algorithms like brightness adjustment, contrast, edge detection, and pixel sorting.

Working directly with pixels gives you complete control over the image. Every filter, every effect, every glitch art technique ultimately comes down to reading and writing pixel values.

---

## The Pixel Array

Every p5.js canvas has a `pixels[]` array that contains the color data for every pixel on the canvas. Before you can read or write this array, you must call `loadPixels()`. After writing, you must call `updatePixels()` to push the changes to the screen.

```js
function draw() {
  loadPixels();    // Copy canvas pixel data into the pixels[] array

  // ... read or modify pixels[] ...

  updatePixels();  // Push the modified data back to the canvas
}
```

### RGBA Structure

Each pixel is stored as **four consecutive values** in the array:

- `pixels[i + 0]` = **Red** (0-255)
- `pixels[i + 1]` = **Green** (0-255)
- `pixels[i + 2]` = **Blue** (0-255)
- `pixels[i + 3]` = **Alpha** (0-255, where 255 is fully opaque)

So the array looks like:

```
[R, G, B, A, R, G, B, A, R, G, B, A, ...]
 pixel 0      pixel 1      pixel 2
```

### Computing the Index

To access the pixel at position `(x, y)` on a canvas of width `w`:

```js
let index = (y * width + x) * 4;
let r = pixels[index + 0];
let g = pixels[index + 1];
let b = pixels[index + 2];
let a = pixels[index + 3];
```

The formula `y * width + x` converts 2D coordinates to a 1D array position. The `* 4` accounts for the four values per pixel.

---

## `pixelDensity(1)` -- Essential for Correct Pixel Access

On high-DPI (Retina) displays, p5.js doubles the pixel density by default. This means a 400x400 canvas actually has 800x800 pixels, and the `pixels[]` array is four times as large as you would expect.

**Always call `pixelDensity(1)` in `setup()`** when doing direct pixel manipulation:

```js
function setup() {
  createCanvas(400, 400);
  pixelDensity(1); // One canvas pixel = one screen pixel
}
```

Without this, your pixel math will be wrong on Retina displays.

---

## Reading Pixels

### Complete Example: Display Pixel Color Under Mouse

```js
function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
}

function draw() {
  // Draw something colorful
  colorMode(HSB, 360, 100, 100);
  noStroke();
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      let hue = map(x, 0, width, 0, 360);
      let brightness = map(y, 0, height, 100, 20);
      fill(hue, 80, brightness);
      rect(x, y, 10, 10);
    }
  }

  // Read pixel under mouse
  loadPixels();
  let mx = constrain(floor(mouseX), 0, width - 1);
  let my = constrain(floor(mouseY), 0, height - 1);
  let i = (my * width + mx) * 4;
  let r = pixels[i];
  let g = pixels[i + 1];
  let b = pixels[i + 2];

  // Display the color
  colorMode(RGB, 255);
  fill(r, g, b);
  stroke(255);
  strokeWeight(2);
  rect(10, 10, 50, 50);
  fill(255);
  noStroke();
  textSize(12);
  text(`R:${r} G:${g} B:${b}`, 10, 80);
  text(`(${mx}, ${my})`, 10, 95);
}
```

---

## Writing Pixels

### Complete Example: Generate an Image Entirely from Pixel Math

```js
function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
  noLoop();
}

function draw() {
  loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;

      // Create a pattern using math
      let r = (x ^ y) % 256;            // XOR pattern
      let g = (x * y) % 256;            // Multiplication pattern
      let b = (sin(x * 0.05) * 127 + 128) | 0; // Sine wave

      pixels[i + 0] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = 255;
    }
  }

  updatePixels();
}
```

### Complete Example: Plasma Effect

```js
function setup() {
  createCanvas(300, 300);
  pixelDensity(1);
}

function draw() {
  loadPixels();

  let t = frameCount * 0.03;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;

      let v1 = sin(x * 0.03 + t);
      let v2 = sin(y * 0.03 + t * 0.7);
      let v3 = sin((x + y) * 0.02 + t * 0.5);
      let v4 = sin(sqrt(x * x + y * y) * 0.04 + t * 1.3);

      let v = (v1 + v2 + v3 + v4) / 4.0; // Range: -1 to 1

      // Map to color
      pixels[i + 0] = (sin(v * PI) * 127 + 128) | 0;
      pixels[i + 1] = (sin(v * PI + 2) * 127 + 128) | 0;
      pixels[i + 2] = (sin(v * PI + 4) * 127 + 128) | 0;
      pixels[i + 3] = 255;
    }
  }

  updatePixels();
}
```

---

## Working with Images

You can load an image and manipulate its pixels.

```js
let img;

function preload() {
  img = loadImage("photo.jpg"); // Put a photo in your sketch's files
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
}

function draw() {
  image(img, 0, 0); // Draw the image first

  loadPixels();

  // Now pixels[] contains the image data
  // Modify it...

  updatePixels();
  noLoop(); // Only process once
}
```

### Accessing Image Pixels Directly

You can also access an image's pixel array without drawing it to the canvas:

```js
img.loadPixels();
let i = (y * img.width + x) * 4;
let r = img.pixels[i];
// ...
img.updatePixels();
```

---

## Image Processing: Brightness

Adjusting brightness means adding or subtracting from each color channel.

```js
let img;

function preload() {
  img = loadImage("photo.jpg");
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
  noLoop();
}

function draw() {
  image(img, 0, 0);
  loadPixels();

  let brightnessAdjust = 50; // Positive = brighter, negative = darker

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = constrain(pixels[i + 0] + brightnessAdjust, 0, 255);
    pixels[i + 1] = constrain(pixels[i + 1] + brightnessAdjust, 0, 255);
    pixels[i + 2] = constrain(pixels[i + 2] + brightnessAdjust, 0, 255);
    // Leave alpha unchanged
  }

  updatePixels();
}
```

---

## Image Processing: Contrast

Contrast stretches color values away from or toward the midpoint (128).

```js
function adjustContrast(factor) {
  // factor > 1 increases contrast, < 1 decreases it
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = constrain((pixels[i + 0] - 128) * factor + 128, 0, 255);
    pixels[i + 1] = constrain((pixels[i + 1] - 128) * factor + 128, 0, 255);
    pixels[i + 2] = constrain((pixels[i + 2] - 128) * factor + 128, 0, 255);
  }
  updatePixels();
}
```

---

## Image Processing: Grayscale

Convert to grayscale by averaging the channels (or using luminance weights).

```js
function toGrayscale() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    // Luminance-weighted average (matches human perception)
    let gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    pixels[i + 0] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }
  updatePixels();
}
```

---

## Image Processing: Invert (Negative)

```js
function invert() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = 255 - pixels[i + 0];
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
  }
  updatePixels();
}
```

---

## Image Processing: Threshold (Black and White)

Convert each pixel to either pure black or pure white based on its brightness.

```js
function threshold(level) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    let val = gray > level ? 255 : 0;
    pixels[i + 0] = val;
    pixels[i + 1] = val;
    pixels[i + 2] = val;
  }
  updatePixels();
}
```

---

## Image Processing: Edge Detection (Sobel Filter)

Edge detection highlights boundaries between regions of different brightness. The Sobel filter uses two 3x3 kernels to detect horizontal and vertical edges.

```js
let img;

function preload() {
  img = loadImage("photo.jpg");
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
  noLoop();
}

function draw() {
  image(img, 0, 0);
  loadPixels();

  // Copy the original pixel data (we need to read from the original
  // while writing to the same array)
  let original = pixels.slice();

  // Sobel kernels
  let gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]; // Horizontal
  let gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];  // Vertical

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;

      // Apply kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let idx = ((y + ky) * width + (x + kx)) * 4;
          // Use grayscale value
          let gray = 0.299 * original[idx] + 0.587 * original[idx + 1] + 0.114 * original[idx + 2];
          sumX += gray * gx[ky + 1][kx + 1];
          sumY += gray * gy[ky + 1][kx + 1];
        }
      }

      // Magnitude of gradient
      let mag = min(sqrt(sumX * sumX + sumY * sumY), 255);

      let i = (y * width + x) * 4;
      pixels[i + 0] = mag;
      pixels[i + 1] = mag;
      pixels[i + 2] = mag;
      pixels[i + 3] = 255;
    }
  }

  updatePixels();
}
```

### How Sobel Works

The Sobel filter slides a 3x3 window across the image. At each position, it computes two sums: one that responds to horizontal brightness changes and one that responds to vertical changes. The magnitude of these two values indicates how strong an edge is at that pixel. Strong edges become bright; smooth areas become dark.

---

## Complete Example: Pixel Sorting

Pixel sorting is a glitch art technique popularized by Kim Asendorf. The idea: divide an image into runs of pixels (defined by a threshold), sort each run by brightness (or hue, or any criterion), and write the sorted pixels back.

```js
let img;

function preload() {
  img = loadImage("photo.jpg");
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
  noLoop();
}

function draw() {
  image(img, 0, 0);
  loadPixels();

  let threshold = 80;

  // Sort each row
  for (let y = 0; y < height; y++) {
    // Collect runs of pixels above the brightness threshold
    let runStart = -1;

    for (let x = 0; x <= width; x++) {
      let bright = 0;
      if (x < width) {
        let i = (y * width + x) * 4;
        bright = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      }

      if (bright > threshold && x < width) {
        if (runStart === -1) runStart = x;
      } else {
        if (runStart !== -1) {
          // Sort this run
          sortPixelRun(y, runStart, x - 1);
          runStart = -1;
        }
      }
    }
  }

  updatePixels();
}

function sortPixelRun(row, startX, endX) {
  // Extract the run as an array of pixel objects
  let run = [];
  for (let x = startX; x <= endX; x++) {
    let i = (row * width + x) * 4;
    run.push({
      r: pixels[i],
      g: pixels[i + 1],
      b: pixels[i + 2],
      a: pixels[i + 3],
      brightness: 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    });
  }

  // Sort by brightness
  run.sort((a, b) => a.brightness - b.brightness);

  // Write back
  for (let j = 0; j < run.length; j++) {
    let x = startX + j;
    let i = (row * width + x) * 4;
    pixels[i] = run[j].r;
    pixels[i + 1] = run[j].g;
    pixels[i + 2] = run[j].b;
    pixels[i + 3] = run[j].a;
  }
}
```

### Variations on Pixel Sorting

- Sort vertically instead of horizontally (swap the x and y loops)
- Sort by hue instead of brightness
- Sort by red channel only
- Use different thresholds for starting and stopping runs
- Combine with edge detection: only sort along detected edges

---

## Complete Example: Real-Time Pixel Effect (No Image Required)

This sketch generates a visual pattern and applies a real-time pixel effect.

```js
function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
}

function draw() {
  // Draw something first
  background(0);
  noStroke();
  for (let i = 0; i < 20; i++) {
    let x = width / 2 + cos(frameCount * 0.02 + i * 0.5) * (100 + i * 5);
    let y = height / 2 + sin(frameCount * 0.03 + i * 0.7) * (80 + i * 4);
    fill(i * 12, 100 + i * 7, 255 - i * 10);
    circle(x, y, 30 + i * 2);
  }

  // Apply pixel-level effect
  loadPixels();

  // Horizontal mirror effect on the right half
  for (let y = 0; y < height; y++) {
    for (let x = width / 2; x < width; x++) {
      let mirrorX = width - 1 - x; // Corresponding pixel on the left
      let srcIdx = (y * width + mirrorX) * 4;
      let dstIdx = (y * width + x) * 4;

      pixels[dstIdx + 0] = pixels[srcIdx + 0];
      pixels[dstIdx + 1] = pixels[srcIdx + 1];
      pixels[dstIdx + 2] = pixels[srcIdx + 2];
      pixels[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  updatePixels();
}
```

---

## Performance Considerations

Direct pixel manipulation on the CPU is slow for large canvases because you are touching every pixel every frame. Some tips:

- **Use `pixelDensity(1)`** to avoid processing 4x the pixels on Retina displays
- **Use smaller canvases** (200x200 instead of 800x800) for real-time effects
- **Avoid `get(x, y)`** for reading individual pixels -- it is much slower than direct array access
- **Use `noLoop()` and `redraw()`** for static image processing -- no need to process 60 times per second
- **Move effects to GLSL** for real-time performance -- the GPU processes all pixels in parallel (see the GLSL lecture notes)

---

## Helper Functions

These functions make pixel manipulation code cleaner:

```js
function getPixel(x, y) {
  let i = (y * width + x) * 4;
  return {
    r: pixels[i],
    g: pixels[i + 1],
    b: pixels[i + 2],
    a: pixels[i + 3]
  };
}

function setPixel(x, y, r, g, b, a) {
  let i = (y * width + x) * 4;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a !== undefined ? a : 255;
}

function pixelBrightness(x, y) {
  let i = (y * width + x) * 4;
  return 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
}
```

---

## Exercises

1. **Color Channel Swap**: Load an image and swap the red and blue channels. What does it look like? Try other permutations.

2. **Posterize**: Reduce each color channel to only 4 levels (0, 85, 170, 255) by rounding. This creates a poster-like effect.

3. **Mosaic/Pixelate**: Divide the image into blocks of, say, 10x10 pixels. Set every pixel in each block to the average color of that block.

4. **Horizontal Gradient Blend**: Generate a smooth horizontal gradient using only pixel math (no `fill()` or `rect()`). The left edge should be one color, the right edge another, with smooth interpolation in between.

5. **Interactive Edge Detection**: Combine the Sobel edge detector with a slider that controls the threshold. Below the threshold, show the original image. Above it, show the edge-detected version.

---

## Further Reading

- p5.js reference: pixels: <https://p5js.org/reference/p5/pixels/>
- Kim Asendorf pixel sorting: <https://github.com/kimasendorf/ASDFPixelSort>
- _p5.js Coding Tutorial | Pixel Sorting_ (YouTube): <https://www.youtube.com/watch?v=nNQk9AMYYGk>
- Convolution kernels explained: <https://en.wikipedia.org/wiki/Kernel_(image_processing)>
