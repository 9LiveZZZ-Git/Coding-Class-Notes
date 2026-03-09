# Tutorial: Webcam Effects in p5.js

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Introduction

The webcam is one of the most accessible sensors available to creative coders. Every laptop has one, and p5.js makes it remarkably easy to capture video, manipulate pixels, and even pass the video as a texture to GLSL shaders for GPU-accelerated effects.

In this tutorial, you will learn to:

- Capture webcam video with `createCapture()`
- Display and mirror the video feed
- Invert colors (negative effect)
- Apply a vignette effect
- Detect motion using frame differencing
- Pass the webcam as a texture to a GLSL shader

---

## Step 1: Capturing and Displaying the Webcam

The simplest possible webcam sketch:

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Hide the default HTML video element
}

function draw() {
  image(video, 0, 0);
}
```

**What each line does:**

- `createCapture(VIDEO)` -- Asks the browser for access to the webcam. The browser will show a permission prompt. Once granted, video frames are continuously captured.
- `video.size(640, 480)` -- Sets the resolution of the capture.
- `video.hide()` -- By default, p5.js creates a visible HTML video element below the canvas. We hide it because we will draw the video ourselves onto the canvas.
- `image(video, 0, 0)` -- Draws the current video frame onto the canvas at position (0, 0).

### Mirroring the Video

Webcam video typically feels more natural when mirrored (like looking in a mirror). You can do this with `translate()` and `scale()`:

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
}

function draw() {
  // Mirror horizontally
  push();
  translate(width, 0);  // Move origin to the right edge
  scale(-1, 1);          // Flip horizontally
  image(video, 0, 0);
  pop();
}
```

---

## Step 2: Pixel Manipulation -- Color Inversion (Negative)

To manipulate individual pixels, we load the pixel array from the video, modify it, and display the result.

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  pixelDensity(1); // Important: ensures pixel array matches canvas size
}

function draw() {
  video.loadPixels();
  loadPixels();

  for (let i = 0; i < video.pixels.length; i += 4) {
    // video.pixels[i]   = Red
    // video.pixels[i+1] = Green
    // video.pixels[i+2] = Blue
    // video.pixels[i+3] = Alpha

    // Invert each color channel: 255 - value
    pixels[i]     = 255 - video.pixels[i];     // Inverted Red
    pixels[i + 1] = 255 - video.pixels[i + 1]; // Inverted Green
    pixels[i + 2] = 255 - video.pixels[i + 2]; // Inverted Blue
    pixels[i + 3] = 255;                         // Full opacity
  }

  updatePixels();
}
```

**How the pixel array works:**

The pixel array is a flat array of numbers. Every four consecutive numbers represent one pixel: `[R, G, B, A, R, G, B, A, R, G, B, A, ...]`. For a 640x480 image, there are 640 * 480 * 4 = 1,228,800 numbers in the array.

Inverting a color means subtracting each channel from 255. Black (0, 0, 0) becomes white (255, 255, 255). Red (255, 0, 0) becomes cyan (0, 255, 255). This produces a photographic negative effect.

---

## Step 3: Vignette Effect

A **vignette** darkens the edges of the image, drawing the viewer's eye toward the center. We compute the distance from each pixel to the center, and darken pixels based on that distance.

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  pixelDensity(1);
}

function draw() {
  video.loadPixels();
  loadPixels();

  let cx = width / 2;
  let cy = height / 2;
  let maxDist = dist(0, 0, cx, cy); // Distance from corner to center

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;

      // Distance from this pixel to the center
      let d = dist(x, y, cx, cy);

      // Vignette factor: 1.0 at center, 0.0 at corners
      let vignette = 1.0 - (d / maxDist);
      // Make the falloff more dramatic with a power curve
      vignette = pow(vignette, 1.5);

      // Apply vignette by multiplying each color channel
      pixels[index]     = video.pixels[index]     * vignette;
      pixels[index + 1] = video.pixels[index + 1] * vignette;
      pixels[index + 2] = video.pixels[index + 2] * vignette;
      pixels[index + 3] = 255;
    }
  }

  updatePixels();
}
```

**How the vignette works:**
- `d / maxDist` gives a value from 0 (at center) to 1 (at corners).
- `1.0 - (d / maxDist)` flips it: 1 at center, 0 at corners.
- `pow(vignette, 1.5)` makes the darkening more gradual near the center and more abrupt near the edges. Try different exponents: 1.0 is linear, 3.0 is very dramatic.
- Multiplying the color channels by this factor darkens the edges.

---

## Step 4: Frame Differencing for Motion Detection

**Frame differencing** compares the current frame to the previous frame. Pixels that have changed significantly indicate motion. This is a simple but effective motion detection technique.

```js
let video;
let prevFrame;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  pixelDensity(1);

  // Create an image to store the previous frame
  prevFrame = createImage(640, 480);
}

function draw() {
  video.loadPixels();
  prevFrame.loadPixels();
  loadPixels();

  let motionAmount = 0;
  let threshold = 30; // Minimum difference to count as motion

  for (let i = 0; i < video.pixels.length; i += 4) {
    // Current frame color
    let r1 = video.pixels[i];
    let g1 = video.pixels[i + 1];
    let b1 = video.pixels[i + 2];

    // Previous frame color
    let r2 = prevFrame.pixels[i];
    let g2 = prevFrame.pixels[i + 1];
    let b2 = prevFrame.pixels[i + 2];

    // Compute the difference (using brightness approximation)
    let diff = abs(r1 - r2) + abs(g1 - g2) + abs(b1 - b2);
    diff = diff / 3; // Average across channels

    // Apply threshold
    if (diff > threshold) {
      // Motion detected at this pixel: show it in white
      pixels[i]     = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
      motionAmount++;
    } else {
      // No significant motion: show black
      pixels[i]     = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 255;
    }
  }

  updatePixels();

  // Save current frame as the previous frame for next time
  prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, prevFrame.width, prevFrame.height);

  // Display motion amount
  fill(255, 200, 0);
  noStroke();
  textSize(16);
  let motionPercent = (motionAmount / (width * height) * 100).toFixed(1);
  text("Motion: " + motionPercent + "%", 10, 25);
}
```

**What you will see:** A mostly black canvas that flashes white wherever there is motion. Moving your hand produces a white silhouette of the motion. Staying still produces a black screen. The percentage at the top tells you how much of the frame contains motion.

**Try these variations:**
- Instead of white/black, show the original video color where motion is detected and black elsewhere (a "motion mask").
- Instead of a hard threshold, map the difference to alpha transparency for a softer effect.

---

## Step 5: Combining Effects -- Colored Motion

Here is a more artistic version that shows the video with a vignette, but highlights motion areas with bright colors:

```js
let video;
let prevFrame;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  pixelDensity(1);
  prevFrame = createImage(640, 480);
}

function draw() {
  video.loadPixels();
  prevFrame.loadPixels();
  loadPixels();

  let cx = width / 2;
  let cy = height / 2;
  let maxDist = dist(0, 0, cx, cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;

      // Vignette
      let d = dist(x, y, cx, cy);
      let vignette = pow(1.0 - d / maxDist, 1.5);

      // Frame difference
      let diff = (
        abs(video.pixels[index] - prevFrame.pixels[index]) +
        abs(video.pixels[index + 1] - prevFrame.pixels[index + 1]) +
        abs(video.pixels[index + 2] - prevFrame.pixels[index + 2])
      ) / 3;

      if (diff > 25) {
        // Motion: show bright, saturated color based on position
        let hueAngle = atan2(y - cy, x - cx) + PI;
        let r = sin(hueAngle) * 127 + 128;
        let g = sin(hueAngle + 2.094) * 127 + 128; // +120 degrees
        let b = sin(hueAngle + 4.189) * 127 + 128; // +240 degrees
        pixels[index]     = r * vignette;
        pixels[index + 1] = g * vignette;
        pixels[index + 2] = b * vignette;
      } else {
        // No motion: show darkened grayscale video
        let gray = (
          video.pixels[index] * 0.299 +
          video.pixels[index + 1] * 0.587 +
          video.pixels[index + 2] * 0.114
        );
        gray *= vignette * 0.4; // Darken
        pixels[index]     = gray;
        pixels[index + 1] = gray;
        pixels[index + 2] = gray;
      }
      pixels[index + 3] = 255;
    }
  }

  updatePixels();
  prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, prevFrame.width, prevFrame.height);
}
```

This creates a dramatic effect: still parts of the scene appear as dark grayscale, while moving areas burst with rainbow colors based on their angle from the center. The vignette darkens the edges.

---

## Step 6: Webcam as a GLSL Shader Texture

For real-time high-performance effects, we can pass the webcam video to a **fragment shader** (GLSL). The GPU processes all pixels in parallel, making this dramatically faster than CPU-based pixel manipulation.

### Setting Up the Shader

A shader in p5.js requires two files: a vertex shader and a fragment shader. For a simple full-screen effect, the vertex shader is always the same.

First, the p5.js sketch:

```js
let video;
let myShader;

function preload() {
  myShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
}

function draw() {
  shader(myShader);
  myShader.setUniform('uTexture', video);
  myShader.setUniform('uResolution', [width, height]);
  myShader.setUniform('uTime', millis() / 1000.0);

  // Draw a rectangle that covers the entire canvas
  // In WEBGL mode, the origin is at the center
  rect(-width / 2, -height / 2, width, height);
}
```

### The Vertex Shader (shader.vert)

This vertex shader simply passes positions and texture coordinates through to the fragment shader:

```glsl
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
```

### Fragment Shader: Color Inversion (shader.frag)

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;

void main() {
  // Flip the y-coordinate (webcam is upside down in WEBGL)
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

  // Sample the video texture
  vec4 color = texture2D(uTexture, uv);

  // Invert colors
  gl_FragColor = vec4(1.0 - color.rgb, 1.0);
}
```

This does the same color inversion as our CPU version, but runs on the GPU and is much faster.

### Fragment Shader: Vignette

Replace the fragment shader with:

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform vec2 uResolution;

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

  // Sample the video
  vec4 color = texture2D(uTexture, uv);

  // Compute distance from center (in normalized coordinates)
  vec2 center = vec2(0.5, 0.5);
  float d = distance(uv, center);

  // Vignette: darken based on distance from center
  float vignette = 1.0 - smoothstep(0.2, 0.7, d);

  gl_FragColor = vec4(color.rgb * vignette, 1.0);
}
```

`smoothstep(0.2, 0.7, d)` creates a smooth transition: values of `d` below 0.2 return 0 (no darkening), values above 0.7 return 1 (full darkness), and values in between transition smoothly. The `1.0 - smoothstep(...)` inverts it so the center is bright and edges are dark.

### Fragment Shader: Animated RGB Shift

This shader shifts the red, green, and blue channels to sample from slightly different positions, creating a chromatic aberration / RGB split effect:

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform float uTime;

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec2 center = vec2(0.5, 0.5);

  // Direction from center to this pixel
  vec2 dir = uv - center;

  // Offset amount (oscillates with time)
  float amount = 0.005 + 0.003 * sin(uTime * 2.0);

  // Sample each channel from a slightly different position
  float r = texture2D(uTexture, uv + dir * amount).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - dir * amount).b;

  // Vignette
  float d = distance(uv, center);
  float vignette = 1.0 - smoothstep(0.3, 0.75, d);

  gl_FragColor = vec4(r, g, b, 1.0) * vignette;
}
```

This produces a pulsing chromatic aberration effect with a vignette, running entirely on the GPU.

---

## Alternative: Inline Shader Strings

If you do not want to create separate shader files, you can define shaders as strings directly in your JavaScript:

```js
let video;
let myShader;

let vertSrc = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

let fragSrc = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uTexture;

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec4 color = texture2D(uTexture, uv);

  // Convert to grayscale using luminance weights
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  // Posterize: reduce to 4 levels
  gray = floor(gray * 4.0) / 4.0;

  gl_FragColor = vec4(vec3(gray), 1.0);
}
`;

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  myShader = createShader(vertSrc, fragSrc);
}

function draw() {
  shader(myShader);
  myShader.setUniform('uTexture', video);
  rect(-width / 2, -height / 2, width, height);
}
```

This version creates a posterized grayscale effect -- reducing the continuous range of grays to just 4 discrete levels, giving the image a graphic novel look.

---

## Summary

| Technique | Approach | Performance |
|---|---|---|
| Basic display | `image(video, 0, 0)` | Very fast |
| CPU pixel manipulation | `loadPixels()` / `updatePixels()` | Moderate (slow at high resolution) |
| Frame differencing | Compare current and previous pixel arrays | Moderate |
| GLSL shader | Pass video as `sampler2D` uniform | Very fast (GPU parallel) |

**Key functions:**
- `createCapture(VIDEO)` -- Start webcam capture
- `video.hide()` -- Hide the default HTML element
- `video.loadPixels()` -- Load pixel data for CPU access
- `shader(myShader)` -- Activate a shader
- `myShader.setUniform('uTexture', video)` -- Pass video to shader

---

## Exercises

1. **Mirror effect**: Display the webcam so that the left half shows the normal video and the right half shows a horizontally flipped version, creating a symmetrical mirror image.

2. **Pixelation**: Sample the video in a grid (e.g., every 10th pixel) and draw a colored rectangle for each sample. This creates a pixelated mosaic effect. Add a slider to control the grid size.

3. **Motion particles**: Use frame differencing to detect where motion is happening, then spawn particles at those locations. Moving your hand should leave a trail of particles.

4. **Shader edge detection**: Write a GLSL fragment shader that performs edge detection (Sobel filter). Sample neighboring pixels, compute the gradient in x and y, and output the magnitude as brightness. Edges in the video should appear as bright lines on a dark background.

5. **Thermal camera**: Write a shader that converts the video to a false-color "thermal" palette. Map the brightness of each pixel to a color ramp going from black (dark) to blue to red to yellow to white (bright).
