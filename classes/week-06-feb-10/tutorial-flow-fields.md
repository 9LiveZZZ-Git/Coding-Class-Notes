# Tutorial: Implementing Flow Fields in p5.js

**MAT 200C: Computing Arts -- Week 6, February 10**

---

## Overview

In this tutorial, we will build a flow field system -- one of the most visually rewarding techniques in creative coding. A flow field assigns a direction (a vector) to every point in space, and particles moving through the field follow those directions, creating organic, fluid-like trails.

We will cover:

1. What a flow field is and why it produces beautiful results
2. Using Perlin noise to generate a smooth vector field
3. Creating particles that follow the field
4. Rendering particle trails
5. The GPGPU technique: encoding position and velocity in RGBA pixel data
6. A complete, polished flow field sketch

---

## Prerequisites

- Familiarity with p5.js basics (setup/draw, vectors, color)
- Understanding of 2D vectors (direction, magnitude)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: What Is a Flow Field?

Imagine an invisible grid overlaid on your canvas. At each cell of the grid, there is an arrow pointing in some direction. Now imagine dropping thousands of tiny particles onto the canvas. Each particle looks at the arrow in the cell it currently occupies and moves in that direction. Over time, the particles trace out paths that reveal the underlying pattern of the field.

Flow fields appear throughout nature:

- Wind patterns on weather maps
- Ocean currents
- Magnetic field lines
- Wood grain patterns
- The swirling of cream in coffee

The key insight is that **simple local rules** (follow the arrow in your cell) produce **complex global patterns** (sweeping curves, spirals, eddies).

---

## Step 2: Generating a Flow Field with Perlin Noise

We need a function that, given any `(x, y)` position, returns an angle. Perlin noise is perfect for this because it produces smooth, continuous values -- nearby points get similar angles, which creates coherent flow patterns rather than random chaos.

### The Basic Idea

```js
// noise(x, y) returns a value between 0 and 1
// We map that to an angle between 0 and TWO_PI
let angle = noise(x * scale, y * scale) * TWO_PI;
```

The `scale` parameter controls how "zoomed in" we are on the noise. Smaller values produce larger, sweeping curves. Larger values produce tighter, more turbulent patterns.

### Visualizing the Field

Let us start by drawing the field as arrows so we can see what we are working with:

```js
let scale = 0.005;
let cellSize = 20;

function setup() {
  createCanvas(800, 600);
  background(240);

  stroke(0, 80);
  strokeWeight(1);

  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      let angle = noise(x * scale, y * scale) * TWO_PI * 2;

      push();
      translate(x + cellSize / 2, y + cellSize / 2);
      rotate(angle);
      line(0, 0, cellSize * 0.6, 0);
      // small arrowhead
      line(cellSize * 0.6, 0, cellSize * 0.4, -3);
      line(cellSize * 0.6, 0, cellSize * 0.4, 3);
      pop();
    }
  }
}
```

You should see a grid of small arrows, all flowing smoothly from one direction to the next.

---

## Step 3: Particles Following the Field

Now let us create particles that move through this field.

### The Particle Class

```js
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
  }

  follow(flowField, cols, scale) {
    // Determine which cell the particle is in
    let col = floor(this.pos.x / scale);
    let row = floor(this.pos.y / scale);
    col = constrain(col, 0, cols - 1);
    row = constrain(row, 0, cols - 1);

    // Look up the force vector for this cell
    let index = col + row * cols;
    let force = flowField[index].copy();
    force.setMag(0.5);
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); // reset acceleration
  }

  // Wrap around edges
  edges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos.x = 0; }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos.x = width; }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos.y = 0; }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos.y = height; }
  }

  draw() {
    stroke(0, 5);
    strokeWeight(1);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }
}
```

The key technique for trails: instead of drawing a dot at the current position, we draw a **line from the previous position to the current position**. By using a very low alpha value (like 5 out of 255), each individual line segment is nearly invisible, but thousands of overlapping segments build up into visible, luminous trails.

---

## Step 4: Putting It Together -- A Basic Flow Field

```js
let particles = [];
let flowField = [];
let cols, rows;
let cellSize = 10;
let noiseScale = 0.003;
let numParticles = 2000;
let zOff = 0;

function setup() {
  createCanvas(800, 600);
  background(255);

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);

  // Create particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // Update the flow field (using a z-offset for animation)
  flowField = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let angle = noise(x * noiseScale * cellSize, y * noiseScale * cellSize, zOff) * TWO_PI * 2;
      flowField.push(p5.Vector.fromAngle(angle));
    }
  }
  zOff += 0.001; // slowly evolve the field over time

  // Update and draw particles
  for (let p of particles) {
    p.follow(flowField, cols, cellSize);
    p.update();
    p.edges();
    p.draw();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
  }

  follow(field, cols, scale) {
    let col = floor(this.pos.x / scale);
    let row = floor(this.pos.y / scale);
    col = constrain(col, 0, cols - 1);
    row = constrain(row, 0, floor(height / scale) - 1);
    let index = col + row * cols;
    if (index >= 0 && index < field.length) {
      let force = field[index].copy();
      force.setMag(0.5);
      this.applyForce(force);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos.x = 0; }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos.x = width; }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos.y = 0; }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos.y = height; }
  }

  draw() {
    stroke(0, 5);
    strokeWeight(1);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }
}
```

Run this and wait. Over 10-20 seconds, beautiful organic trails will emerge.

---

## Step 5: Adding Color

Instead of black lines, let us map the particle's angle of travel to a hue:

```js
// Replace the draw() method in the Particle class:
draw() {
  let angle = this.vel.heading();
  let hue = map(angle, -PI, PI, 0, 360);
  stroke(hue, 80, 90, 0.02); // HSB mode with very low alpha
  strokeWeight(1);
  line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
}
```

And in `setup()`, switch to HSB color mode:

```js
function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 1);
  background(0, 0, 100); // white background in HSB
  // ... rest of setup
}
```

---

## Step 6: The GPGPU Technique -- Encoding Data in RGBA

**GPGPU** stands for General-Purpose computing on Graphics Processing Units. The idea is to use the GPU's massive parallelism for computation, not just rendering. In the context of flow fields, we can store particle data (position, velocity) inside the pixels of an off-screen image, then use shaders to update all particles simultaneously on the GPU.

### Why GPGPU?

The CPU-based approach above handles a few thousand particles. GPGPU can handle **hundreds of thousands or millions** of particles because the GPU processes all pixels (particles) in parallel.

### How It Works

The core insight: a pixel has four channels (R, G, B, A), each storing a value from 0 to 255. We can repurpose these channels to store arbitrary data:

| Channel | Data |
|---------|------|
| R | x position (encoded) |
| G | y position (encoded) |
| B | x velocity (encoded) |
| A | y velocity (encoded) |

Each pixel in the texture represents one particle. A 512 x 512 texture can store 262,144 particles.

### Encoding and Decoding

Since each channel is only 8 bits (0-255), we need to map our position values (which might range from 0 to 800) into the 0-255 range. With floating-point textures (available in WebGL 2), we can skip this step, but the principle remains the same.

### Ping-Pong Buffers

We use two framebuffers (off-screen textures). In each frame:

1. Read particle data from Texture A.
2. Compute new positions/velocities in a shader.
3. Write the results to Texture B.
4. Next frame, swap: read from B, write to A.

This "ping-pong" pattern is necessary because a shader cannot read from and write to the same texture simultaneously.

### GPGPU Flow Field in p5.js (Conceptual Outline)

Here is a simplified conceptual version. A full implementation uses GLSL shaders (covered in detail in the Reaction-Diffusion GPU tutorial for Week 7).

```js
// Conceptual pseudocode for GPGPU flow field:

// 1. Create two framebuffers for ping-pong
let bufA, bufB;

function setup() {
  createCanvas(800, 600, WEBGL);
  bufA = createFramebuffer({ format: FLOAT });
  bufB = createFramebuffer({ format: FLOAT });

  // Initialize bufA with random positions encoded as colors
  bufA.begin();
  // ... draw random colored pixels, each representing a particle
  bufA.end();
}

function draw() {
  // Update step: read from bufA, compute, write to bufB
  bufB.begin();
  shader(updateShader);
  updateShader.setUniform('particleData', bufA);
  updateShader.setUniform('noiseTexture', noiseField);
  rect(0, 0, width, height);
  bufB.end();

  // Render step: read particle positions from bufB, draw them
  shader(renderShader);
  renderShader.setUniform('particleData', bufB);
  // draw points...

  // Swap
  [bufA, bufB] = [bufB, bufA];
}
```

### A CPU-Based Simulation of the GPGPU Concept

To understand the data-in-pixels concept without needing shaders, here is a CPU version that stores particle state in an image:

```js
let particleImage;
let trailCanvas;
let numParticles = 10000;
let imgSize;
let noiseScale = 0.003;

function setup() {
  createCanvas(800, 600);
  trailCanvas = createGraphics(800, 600);
  trailCanvas.background(0);

  // Calculate image dimensions to hold all particles
  imgSize = ceil(sqrt(numParticles));
  particleImage = createImage(imgSize, imgSize);
  particleImage.loadPixels();

  // Initialize: encode random positions in pixel RGBA values
  for (let i = 0; i < numParticles; i++) {
    let idx = i * 4;
    // Store position as normalized values (0-255 maps to 0-canvas dimension)
    particleImage.pixels[idx + 0] = random(255);     // x position (R)
    particleImage.pixels[idx + 1] = random(255);     // y position (G)
    particleImage.pixels[idx + 2] = 128;             // x velocity + 128 bias (B)
    particleImage.pixels[idx + 3] = 128;             // y velocity + 128 bias (A)
  }
  particleImage.updatePixels();
}

function draw() {
  particleImage.loadPixels();

  for (let i = 0; i < numParticles; i++) {
    let idx = i * 4;

    // Decode position from pixel data
    let px = (particleImage.pixels[idx + 0] / 255) * width;
    let py = (particleImage.pixels[idx + 1] / 255) * height;

    // Decode velocity from pixel data (bias of 128 allows negative values)
    let vx = (particleImage.pixels[idx + 2] - 128) / 32;
    let vy = (particleImage.pixels[idx + 3] - 128) / 32;

    // Look up flow field angle from Perlin noise
    let angle = noise(px * noiseScale, py * noiseScale) * TWO_PI * 2;
    let ax = cos(angle) * 0.5;
    let ay = sin(angle) * 0.5;

    // Update velocity (add acceleration, apply drag)
    vx = (vx + ax) * 0.98;
    vy = (vy + ay) * 0.98;

    // Clamp velocity
    let speed = sqrt(vx * vx + vy * vy);
    if (speed > 2) {
      vx = (vx / speed) * 2;
      vy = (vy / speed) * 2;
    }

    // Store previous position for line drawing
    let prevX = px;
    let prevY = py;

    // Update position
    px += vx;
    py += vy;

    // Wrap around edges
    if (px < 0) px += width;
    if (px > width) px -= width;
    if (py < 0) py += height;
    if (py > height) py -= height;

    // Draw trail line
    trailCanvas.stroke(255, 8);
    trailCanvas.strokeWeight(0.5);
    if (dist(prevX, prevY, px, py) < 20) { // avoid wrapping artifacts
      trailCanvas.line(prevX, prevY, px, py);
    }

    // Encode updated state back into pixel data
    particleImage.pixels[idx + 0] = (px / width) * 255;
    particleImage.pixels[idx + 1] = (py / height) * 255;
    particleImage.pixels[idx + 2] = constrain(vx * 32 + 128, 0, 255);
    particleImage.pixels[idx + 3] = constrain(vy * 32 + 128, 0, 255);
  }

  particleImage.updatePixels();

  // Slow fade for trail persistence
  trailCanvas.noStroke();
  trailCanvas.fill(0, 3);
  trailCanvas.rect(0, 0, width, height);

  image(trailCanvas, 0, 0);
}
```

This sketch stores all particle data in pixel channels, mimicking what a GPU shader would do. On a real GPU, the loop over particles would execute in parallel across thousands of shader cores.

---

## Step 7: Complete Polished Flow Field

Here is a final, production-quality flow field sketch with color, trails, and interactive controls:

```js
let particles = [];
let numParticles = 3000;
let noiseScale = 0.003;
let zOff = 0;
let trailAlpha = 15;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 5);

  for (let i = 0; i < numParticles; i++) {
    particles.push(new FlowParticle());
  }
}

function draw() {
  // Semi-transparent background for trail fade
  noStroke();
  fill(0, 0, 5, trailAlpha);
  rect(0, 0, width, height);

  zOff += 0.0008;

  for (let p of particles) {
    p.follow();
    p.update();
    p.edges();
    p.display();
  }
}

function mousePressed() {
  // Reset on click
  background(0, 0, 5);
  noiseSeed(millis());
}

class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxSpeed = 3;
    this.prevPos = this.pos.copy();
    this.hueOffset = random(360);
    this.life = 0;
  }

  follow() {
    let angle = noise(
      this.pos.x * noiseScale,
      this.pos.y * noiseScale,
      zOff
    ) * TWO_PI * 4;

    let force = p5.Vector.fromAngle(angle);
    force.setMag(0.4);
    this.acc.add(force);
  }

  update() {
    this.prevPos.set(this.pos);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life++;
  }

  edges() {
    let wrapped = false;
    if (this.pos.x > width) { this.pos.x = 0; wrapped = true; }
    if (this.pos.x < 0) { this.pos.x = width; wrapped = true; }
    if (this.pos.y > height) { this.pos.y = 0; wrapped = true; }
    if (this.pos.y < 0) { this.pos.y = height; wrapped = true; }
    if (wrapped) this.prevPos.set(this.pos);
  }

  display() {
    let speed = this.vel.mag();
    let hue = (this.hueOffset + speed * 40 + this.life * 0.3) % 360;
    let saturation = map(speed, 0, this.maxSpeed, 30, 90);
    let brightness = map(speed, 0, this.maxSpeed, 50, 100);

    stroke(hue, saturation, brightness, 30);
    strokeWeight(map(speed, 0, this.maxSpeed, 0.3, 1.5));
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }
}
```

**How to use:** Paste this into the p5.js web editor and run it. Watch as colorful particle trails emerge over time. Click anywhere to reset the field with a new noise seed.

---

## Summary

| Concept | Purpose |
|---|---|
| Flow field | A grid of vectors that guide particle motion |
| Perlin noise | Generates smooth, coherent angles for the field |
| Particle trails | Drawing lines from previous to current position with low alpha |
| `noise(x, y, z)` | The z-axis allows the field to evolve over time |
| GPGPU | Using pixel RGBA channels to store particle state for GPU parallelism |
| Ping-pong buffers | Two framebuffers that alternate as read/write targets |
| `noiseScale` | Controls the spatial frequency of the flow patterns |

---

## Exercises

1. **Curl noise**: Instead of using raw Perlin noise as an angle, compute the curl of a 2D noise field. This produces divergence-free flow that looks more like fluid motion. Hint: the curl in 2D is `(dN/dy, -dN/dx)` where N is the noise value.

2. **Interactive field**: Make the flow field respond to the mouse. Add a radial force emanating from the mouse position that pushes or attracts particles.

3. **Multiple noise octaves**: Layer several noise calls at different scales and blend them together to create more complex, turbulent flow patterns.

4. **Image-guided flow**: Instead of Perlin noise, load an image and derive the flow angle from the brightness gradient of the image.
