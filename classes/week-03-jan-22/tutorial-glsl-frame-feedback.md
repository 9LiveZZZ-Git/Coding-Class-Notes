# Tutorial: GLSL Frame Feedback in p5.js

## MAT 200C: Computing Arts -- Week 3, January 22

---

## What Is Frame Feedback?

Frame feedback is a technique where you take the output of the previous frame and feed it back as an input to the current frame. Think of pointing a camera at the monitor displaying its own feed -- you get a recursive, tunnel-like effect. In digital graphics, we do the same thing with framebuffers.

Frame feedback enables:

- Recursive visual patterns that evolve over time
- Trails, echoes, and ghosting effects
- Organic growth and decay animations
- Fractal-like infinite zooms

The core idea is simple: **read the previous frame, transform it slightly, draw it back, then add something new on top.**

---

## Framebuffers in p5.js

A **framebuffer** is an off-screen canvas that you can draw to and then use as a texture. In p5.js WEBGL mode, the `createFramebuffer()` function gives us exactly this capability.

### What `createFramebuffer()` Does

When you call `createFramebuffer()`, p5.js creates an off-screen rendering surface (backed by a WebGL framebuffer object). You can:

1. Draw things into the framebuffer (using `fbo.begin()` and `fbo.end()`)
2. Use the framebuffer as a texture on shapes (using `texture(fbo)`)
3. Read back the contents of the framebuffer each frame

This is the key ingredient for frame feedback: we draw the previous frame's content (from the framebuffer) back onto the canvas with some transformation, then capture the result for next frame.

---

## Step 1: Basic Framebuffer Setup

Let us start with the simplest possible framebuffer example -- just drawing into a framebuffer and displaying it.

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  // Draw into the framebuffer
  fbo.begin();
  clear();
  fill(255, 0, 0);
  noStroke();
  circle(0, 0, 100);
  fbo.end();

  // Display the framebuffer on a full-screen quad
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**What is happening here:**

- We create a framebuffer called `fbo` in `setup()`.
- Each frame, we draw a red circle into the framebuffer using `fbo.begin()` and `fbo.end()`.
- We then display the framebuffer's contents by applying it as a `texture()` on a `plane()` that fills the screen.

This is not yet feedback -- we are just learning to use the framebuffer. The red circle appears on screen, but there is no persistence from frame to frame because we call `clear()` inside the framebuffer each time.

---

## Step 2: Simple Frame Feedback (Trails)

Now let us create actual feedback. The trick: **do not clear the framebuffer each frame**. Instead, draw the framebuffer's own previous contents back into itself, then add new content on top.

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  fbo.begin();

  // Draw the previous frame back into the framebuffer (no clear!)
  // This creates persistence / trails
  push();
  tint(255, 250);          // Slight transparency causes fade-out over time
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Draw something new: a circle at the mouse position
  push();
  fill(255, 100, 50);
  noStroke();
  // Convert mouse coordinates to WEBGL coordinates (centered origin)
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 30);
  pop();

  fbo.end();

  // Display the framebuffer
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**How the feedback works:**

1. We draw the framebuffer's **previous contents** back into itself using `texture(fbo)` on a `plane()`.
2. The `tint(255, 250)` makes the previous frame slightly transparent (250 out of 255 alpha). Each frame, the old content loses a tiny bit of opacity, creating a gradual fade.
3. We then draw a new circle on top at the mouse position.
4. The combined result becomes the new framebuffer content for the next frame.

Move your mouse around. You will see the circle leave a fading trail behind it.

---

## Step 3: Feedback with Scale (Infinite Zoom)

Here is where things get really interesting. Instead of drawing the previous frame at the same size, we can **scale it slightly**. This creates an infinite zoom effect.

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  fbo.begin();

  // Draw previous frame, slightly scaled up
  push();
  tint(255, 252);
  scale(1.01);              // Scale up by 1% each frame
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Draw a small rotating shape at the center
  push();
  fill(0, 200, 255);
  noStroke();
  rotate(frameCount * 0.05);
  rectMode(CENTER);
  rect(100, 0, 15, 15);
  pop();

  fbo.end();

  // Display result
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**What happens:**

- Each frame, the previous image is drawn at 101% scale. So the image appears to zoom outward.
- A small square orbits the center, leaving behind copies of itself.
- Because each copy is also being scaled up, you see a spiral pattern that appears to grow outward from the center.
- The slight transparency (`tint(255, 252)`) causes older copies to gradually fade.

Try changing `scale(1.01)` to `scale(0.99)` to make the zoom go inward instead of outward.

---

## Step 4: Feedback with Rotation (Spiral Feedback)

We can also rotate the previous frame, creating beautiful spiral effects.

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  fbo.begin();

  // Draw previous frame with rotation and scale
  push();
  tint(255, 245);
  rotate(0.02);              // Rotate by ~1 degree each frame
  scale(0.98);               // Scale down slightly to prevent blowup
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Draw new content at mouse position
  push();
  fill(255, 200, 0);
  noStroke();
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 20);
  pop();

  fbo.end();

  // Display
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**What happens:**

- The previous frame is rotated by 0.02 radians (~1.15 degrees) and scaled down to 98%.
- Anything you draw spirals inward, rotating as it shrinks.
- Move your mouse to paint spiraling patterns.

The combination of rotation and scaling creates hypnotic vortex effects.

---

## Step 5: Combining Scale, Rotation, and Color

Let us put it all together for a more complex piece.

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(0);

  fbo.begin();

  // Feedback: draw previous frame with transformations
  push();
  tint(0, 0, 100, 95);      // HSB tint: white with 95% opacity
  let angle = sin(frameCount * 0.01) * 0.03;  // Oscillating rotation
  let sc = 0.99 + sin(frameCount * 0.02) * 0.005; // Oscillating scale
  rotate(angle);
  scale(sc);
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Draw a ring of circles
  push();
  let numDots = 6;
  for (let i = 0; i < numDots; i++) {
    let a = (TWO_PI / numDots) * i + frameCount * 0.03;
    let r = 80;
    let x = cos(a) * r;
    let y = sin(a) * r;
    let hue = (frameCount * 2 + i * 60) % 360;
    fill(hue, 80, 100);
    noStroke();
    circle(x, y, 12);
  }
  pop();

  fbo.end();

  // Display
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**What happens:**

- The rotation and scale oscillate using `sin()`, creating a breathing, swirling effect.
- Six colored circles orbit the center, each with a different hue.
- The feedback creates spiraling trails of color that pulse and breathe.

---

## Step 6: Frame Feedback with a Shader

For even more control, you can use a custom fragment shader to process the feedback. This lets you add color shifts, distortions, and effects that are difficult to achieve with simple p5.js transforms.

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
uniform sampler2D u_feedback;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = vTexCoord;

  // Center the coordinates
  vec2 centered = uv - 0.5;

  // Apply rotation
  float angle = 0.01;
  float s = sin(angle);
  float c = cos(angle);
  centered = mat2(c, -s, s, c) * centered;

  // Apply scale (zoom in slightly)
  centered *= 0.995;

  // Move back to 0-1 range
  vec2 feedbackUV = centered + 0.5;

  // Sample the previous frame
  vec4 prev = texture2D(u_feedback, feedbackUV);

  // Slight color shift for psychedelic effect
  prev.r *= 0.99;
  prev.g *= 0.98;
  prev.b *= 1.01;

  // Fade slightly
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

  // Step 1: Apply feedback shader to the previous frame
  fbo.begin();

  shader(feedbackShader);
  feedbackShader.setUniform('u_feedback', fbo);
  feedbackShader.setUniform('u_resolution', [width, height]);
  feedbackShader.setUniform('u_time', millis() / 1000.0);
  noStroke();
  plane(width, height);
  resetShader();

  // Step 2: Draw new content on top
  push();
  fill(255, 100, 200);
  noStroke();
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 20);
  pop();

  fbo.end();

  // Display the result
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**What the shader does:**

- It reads the previous frame from `u_feedback`.
- It applies rotation using a 2x2 rotation matrix (`mat2`).
- It applies a slight zoom by scaling the UV coordinates.
- It shifts the color channels at different rates, creating a rainbow trail effect.
- It fades the brightness by multiplying by 0.98.

---

## Key Concepts to Remember

### The Feedback Loop

The fundamental pattern is:

1. **Read** the previous frame from the framebuffer
2. **Transform** it (scale, rotate, shift, color change)
3. **Draw** the transformed version back into the framebuffer
4. **Add** new content on top
5. **Display** the framebuffer
6. **Repeat** next frame

### Preventing Blowup

If you only scale up without any fade, the image will quickly become a solid white rectangle. You need some form of decay:

- **Alpha fade:** Use `tint(255, alpha)` with alpha slightly less than 255
- **Color multiply:** Multiply each channel by a value slightly less than 1.0
- **Scale down:** If you are scaling up the image, the edges get cropped, which naturally limits growth

### Scale and Rotation Together

- **Scale > 1 + Rotation:** Outward spiral
- **Scale < 1 + Rotation:** Inward spiral (vortex)
- **Scale = 1 + Rotation:** Rotation without zoom (content stays the same size)
- **Scale > 1, no rotation:** Zoom out (tunnel effect)
- **Scale < 1, no rotation:** Zoom in (things shrink to center)

### Performance Considerations

- Frame feedback runs every frame, so keep your shader and drawing code efficient.
- On slower machines, reduce the canvas size.
- Framebuffer operations are GPU-accelerated, so they are generally fast.

---

## Exercises

1. **Change the zoom direction.** Modify the scale feedback example to zoom inward instead of outward. What does it look like?

2. **Asymmetric scaling.** Try scaling X and Y by different amounts (e.g., `scale(1.01, 0.99)`). What happens to the feedback?

3. **Color cycling.** In the shader example, modify the color shifts so that trails cycle through the rainbow over time.

4. **Interactive rotation.** Make the feedback rotation angle respond to mouse position (e.g., map `mouseX` to the rotation angle). How does this change the feel of the interaction?

5. **Multiple sources.** Instead of one circle following the mouse, add several shapes at different positions. How does the feedback transform them?

---

## Further Reading

- [p5.js createFramebuffer() reference](https://p5js.org/reference/p5/createFramebuffer/)
- [The Book of Shaders](https://thebookofshaders.com/) -- foundational GLSL learning resource
- Search for "video feedback art" to see the long history of this technique in analog video art (Nam June Paik, Steina and Woody Vasulka)
