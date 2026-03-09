# Tutorial: Video Feedback Effects in GLSL

## MAT 200C: Computing Arts -- Week 4, January 29

---

## Introduction

Video feedback is the visual equivalent of audio feedback (the squeal you hear when a microphone picks up its own speaker). In video, it happens when a camera films a monitor that displays the camera's own output. The result is a recursive, fractal-like visual tunnel that responds to the slightest movement of the camera.

In this tutorial, we implement video feedback digitally using GLSL shaders and framebuffer textures. Instead of a physical camera and monitor, we use a shader that reads the previous frame, applies a transformation (scale, rotation, color shift), and writes the result as the new frame. Anything new we add (mouse input, shapes, webcam feed) gets captured by the feedback loop and transformed endlessly.

---

## Part 1: The Feedback Architecture

### 1.1 How It Works

The feedback system uses a framebuffer (an off-screen texture) to store the result of each frame. The process each frame is:

1. **Read** the previous frame from the framebuffer texture
2. **Transform** the UV coordinates (scale, rotate, translate) before sampling
3. **Sample** the texture at the transformed coordinates
4. **Attenuate** the result slightly (multiply by a value less than 1.0) so old content fades
5. **Add** new content on top (shapes, mouse trails, etc.)
6. **Write** the result back to the framebuffer
7. **Display** the framebuffer on screen

### 1.2 p5.js Setup with Framebuffer

```js
let fbo;
let feedbackShader;

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
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = vTexCoord;

  // Center coordinates
  vec2 centered = uv - 0.5;

  // Apply scale and rotation
  float scale = 0.99;
  float angle = 0.01;
  float c = cos(angle);
  float s = sin(angle);
  mat2 transform = mat2(c, -s, s, c) * scale;
  centered = transform * centered;

  // Back to texture coordinates
  vec2 sampleUV = centered + 0.5;

  // Sample previous frame
  vec4 prev = texture2D(u_tex, sampleUV);

  // Fade
  prev *= 0.98;

  gl_FragColor = prev;
}
`;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
  feedbackShader = createShader(vertSrc, fragSrc);
}

function draw() {
  background(0);

  fbo.begin();

  // Apply feedback shader
  shader(feedbackShader);
  feedbackShader.setUniform('u_tex', fbo);
  feedbackShader.setUniform('u_resolution', [width, height]);
  feedbackShader.setUniform('u_time', millis() / 1000.0);
  feedbackShader.setUniform('u_mouse', [mouseX / width, mouseY / height]);
  noStroke();
  plane(width, height);

  // Reset shader for drawing shapes
  resetShader();

  // Draw something new
  push();
  fill(255, 100, 50);
  noStroke();
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 15);
  pop();

  fbo.end();

  // Display
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

---

## Part 2: The `scaleRotate` Function

The core of video feedback is the combined scale-and-rotate transformation. In GLSL, this is elegantly expressed as a 2x2 matrix multiplication.

### 2.1 Understanding the Math

A 2D rotation matrix rotates a point (x, y) around the origin by angle theta:

```
| cos(theta)  -sin(theta) |   | x |
| sin(theta)   cos(theta) | * | y |
```

A 2D scale matrix scales a point by factor s:

```
| s  0 |   | x |
| 0  s | * | y |
```

When we combine them (multiply the matrices), we get:

```
| s*cos(theta)  -s*sin(theta) |   | x |
| s*sin(theta)   s*cos(theta) | * | y |
```

In GLSL:

```glsl
vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p * scale;
}
```

Or equivalently, since uniform scaling commutes with rotation:

```glsl
vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  return mat2(c, -s, s, c) * p;
}
```

### 2.2 Using `scaleRotate` in the Feedback Shader

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_tex;
uniform float u_time;

vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  return mat2(c, -s, s, c) * p;
}

void main() {
  vec2 uv = vTexCoord;
  vec2 centered = uv - 0.5;

  // Apply scale-rotate transformation
  centered = scaleRotate(centered, 0.99, 0.015);

  vec2 sampleUV = centered + 0.5;
  vec4 prev = texture2D(u_tex, sampleUV);

  // Gentle fade
  prev *= 0.985;

  gl_FragColor = prev;
}
```

---

## Part 3: Feedback Variations

### 3.1 Inward Spiral (Vortex)

Scale < 1 makes content shrink toward the center. Combined with rotation, this creates a vortex:

```glsl
centered = scaleRotate(centered, 0.985, 0.03);
```

Content spirals inward and disappears at the center. New content at the edges gets pulled in.

### 3.2 Outward Spiral (Bloom)

Scale > 1 makes content expand outward:

```glsl
centered = scaleRotate(centered, 1.01, -0.02);
```

Content spirals outward and disappears at the edges. New content at the center blooms outward.

### 3.3 Time-Varying Parameters

Make the feedback parameters change over time for evolving effects:

```glsl
float scale = 0.99 + 0.005 * sin(u_time * 0.5);
float angle = 0.02 * sin(u_time * 0.3);
centered = scaleRotate(centered, scale, angle);
```

### 3.4 Mouse-Controlled Feedback

Map mouse position to the scale and rotation parameters:

```glsl
// u_mouse is vec2 with values in [0, 1]
float scale = mix(0.95, 1.05, u_mouse.x);       // X controls zoom
float angle = mix(-0.05, 0.05, u_mouse.y);       // Y controls rotation
centered = scaleRotate(centered, scale, angle);
```

### 3.5 Color Channel Separation

Apply slightly different transformations to each color channel for a chromatic aberration effect:

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_tex;
uniform float u_time;

vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  return mat2(c, -s, s, c) * p;
}

void main() {
  vec2 uv = vTexCoord;
  vec2 centered = uv - 0.5;

  // Slightly different transform for each channel
  vec2 uvR = scaleRotate(centered, 0.990, 0.012) + 0.5;
  vec2 uvG = scaleRotate(centered, 0.992, 0.015) + 0.5;
  vec2 uvB = scaleRotate(centered, 0.994, 0.018) + 0.5;

  float r = texture2D(u_tex, uvR).r;
  float g = texture2D(u_tex, uvG).g;
  float b = texture2D(u_tex, uvB).b;

  vec4 prev = vec4(r, g, b, 1.0);
  prev *= 0.985;

  gl_FragColor = prev;
}
```

This creates rainbow-edged trails as each color channel spirals at a slightly different rate.

### 3.6 Nonlinear Distortion

Instead of uniform scale-rotate, apply a distortion that varies with position:

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_tex;
uniform float u_time;

void main() {
  vec2 uv = vTexCoord;
  vec2 centered = uv - 0.5;

  // Distance from center
  float d = length(centered);

  // Rotation increases with distance (whirlpool effect)
  float angle = 0.01 + d * 0.05;
  float scale = 0.995;

  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  centered = mat2(c, -s, s, c) * centered;

  vec2 sampleUV = centered + 0.5;
  vec4 prev = texture2D(u_tex, sampleUV);
  prev *= 0.985;

  gl_FragColor = prev;
}
```

The rotation angle increases with distance from center, creating a whirlpool effect where content near the edges rotates faster than content near the center.

---

## Part 4: Using graphtoy.com for Function Exploration

When designing feedback effects, you often need to craft mathematical functions for the scale, rotation, and fade parameters. **graphtoy.com** is an excellent tool for this.

Graphtoy lets you type mathematical expressions and see their graphs in real time. This is invaluable for understanding how functions like `sin`, `cos`, `smoothstep`, `exp`, and their combinations behave.

### 4.1 Useful Functions to Explore

Try these in graphtoy.com (use `t` as the time variable):

**Smooth oscillation:**
```
sin(t) * 0.5 + 0.5
```
Oscillates between 0 and 1. Good for parameters that should pulse.

**Exponential decay:**
```
exp(-t * 0.5)
```
Starts at 1 and decays toward 0. Good for fade-outs.

**Smooth step:**
```
smoothstep(0.3, 0.7, sin(t) * 0.5 + 0.5)
```
A smooth on/off transition. Good for switching between two feedback modes.

**Ease in-out:**
```
t * t * (3 - 2 * t)
```
Where t goes from 0 to 1. Smoothly accelerates then decelerates.

**Bouncing:**
```
abs(sin(t * 3.0))
```
Oscillates but always stays positive. Creates a bouncing effect.

### 4.2 Applying Functions to Feedback

Once you find a function you like in graphtoy, translate it to GLSL. For example, if you discover that `sin(t * 0.3) * 0.01 + 0.99` creates a nice pulsing scale value:

```glsl
float scale = sin(u_time * 0.3) * 0.01 + 0.99;
```

---

## Part 5: Complete Video Feedback Example

Here is a complete, polished video feedback sketch combining several techniques:

```js
let fbo;
let feedbackShader;

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
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  return mat2(c, -s, s, c) * p;
}

void main() {
  vec2 uv = vTexCoord;
  vec2 centered = uv - 0.5;

  // Dynamic scale and rotation based on mouse and time
  float scale = 0.99 + 0.005 * sin(u_time * 0.7);
  float angle = (u_mouse.x - 0.5) * 0.06;

  // Apply per-channel transforms for chromatic effect
  vec2 uvR = scaleRotate(centered, scale * 0.998, angle * 0.95) + 0.5;
  vec2 uvG = scaleRotate(centered, scale, angle) + 0.5;
  vec2 uvB = scaleRotate(centered, scale * 1.002, angle * 1.05) + 0.5;

  float r = texture2D(u_tex, uvR).r;
  float g = texture2D(u_tex, uvG).g;
  float b = texture2D(u_tex, uvB).b;

  // Fade with slight color shift
  r *= 0.98;
  g *= 0.985;
  b *= 0.99;

  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
  feedbackShader = createShader(vertSrc, fragSrc);
}

function draw() {
  background(0);

  fbo.begin();

  // Feedback pass
  shader(feedbackShader);
  feedbackShader.setUniform('u_tex', fbo);
  feedbackShader.setUniform('u_resolution', [width, height]);
  feedbackShader.setUniform('u_time', millis() / 1000.0);
  feedbackShader.setUniform('u_mouse', [mouseX / width, mouseY / height]);
  noStroke();
  plane(width, height);

  // New content pass
  resetShader();

  // Draw a ring of dots that rotates
  push();
  let numDots = 8;
  for (let i = 0; i < numDots; i++) {
    let a = (TWO_PI / numDots) * i + frameCount * 0.02;
    let r = 60 + sin(frameCount * 0.03 + i) * 20;
    let x = cos(a) * r;
    let y = sin(a) * r;
    colorMode(HSB, 360, 100, 100);
    fill((frameCount * 3 + i * 45) % 360, 90, 100);
    noStroke();
    circle(x, y, 8);
  }
  pop();

  // Draw at mouse position
  push();
  fill(255);
  noStroke();
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 10);
  pop();

  fbo.end();

  // Display
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

This sketch creates a colorful feedback effect where:

- A ring of colored dots orbits the center, leaving spiraling trails
- Mouse position controls the rotation direction of the feedback
- Each color channel has a slightly different transformation, creating rainbow separation
- The scale pulses gently over time
- Moving the mouse to the left of center rotates the feedback clockwise; to the right, counterclockwise

---

## Part 6: Design Principles for Video Feedback

### Balance Between Growth and Decay

The most important parameter is the balance between how much new content is added and how fast old content fades. If the fade is too slow, the screen saturates to white. If too fast, the trails are too short to be interesting. Values around 0.97-0.99 for the fade multiplier are usually a good starting point.

### Scale Determines Directionality

- Scale slightly less than 1.0: content shrinks toward center (inward zoom)
- Scale slightly greater than 1.0: content grows toward edges (outward zoom)
- The difference from 1.0 should be small (0.001 to 0.02). Large differences make the feedback too fast.

### Rotation Determines Spiral Character

- Small rotation (0.005 to 0.02 radians): gentle, graceful spirals
- Large rotation (0.05+): tight, rapid spirals that can look chaotic
- Zero rotation with non-zero scale: radial zoom (tunnel effect)

### Less Is More for Input

Simple input shapes (dots, circles, short lines) work better than complex drawings. The feedback itself adds complexity. If the input is too complex, the result becomes muddy.

---

## Exercises

1. **Webcam feedback.** If your browser supports it, use `createCapture(VIDEO)` to get the webcam feed, draw it into the framebuffer, and apply feedback. This creates the classic "camera pointed at monitor" effect digitally.

2. **Audio-reactive feedback.** Use `p5.AudioIn` to get microphone input. Map the audio amplitude to the rotation angle or scale factor so the feedback responds to sound.

3. **Feedback with distortion.** Add a sine-based distortion to the UV coordinates before sampling. For example: `centered.x += sin(centered.y * 10.0 + u_time) * 0.005`. How does this change the feedback character?

4. **Explore graphtoy.com.** Find three different mathematical functions that produce interesting oscillation patterns. Implement each one as the rotation angle in the feedback shader and compare the results.

5. **Kaleidoscope feedback.** Before applying the feedback transformation, reflect the UV coordinates to create symmetry. For example, use `abs(centered)` for 4-fold symmetry, or fold the angle `atan(centered.y, centered.x)` into a smaller range for higher-order symmetry.
