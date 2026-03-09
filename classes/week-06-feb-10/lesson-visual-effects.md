# Lesson: Visual Effects in Creative Coding

**MAT 200C: Computing Arts -- Week 6, February 10**

---

## Overview

This lesson covers several visual effects techniques commonly used in creative coding and interactive art. We will explore camera shake, audio-reactive visuals, physics-based brush simulation, and blend modes. These are foundational tools for making sketches feel dynamic, responsive, and alive.

---

## 1. Camera Shake

Camera shake simulates the effect of a vibrating or jolting camera. It is used in games and interactive art to convey impact, energy, or instability. The technique is surprisingly simple: randomly offset the entire coordinate system by a small amount each frame.

### How It Works

In p5.js, `translate()` shifts everything you draw. By calling `translate()` with small random offsets at the beginning of each frame, every shape on the canvas appears to shake.

```js
let shakeAmount = 0;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(20);

  // Apply camera shake
  let shakeX = random(-shakeAmount, shakeAmount);
  let shakeY = random(-shakeAmount, shakeAmount);
  translate(shakeX, shakeY);

  // Decay the shake over time
  shakeAmount *= 0.95;

  // Draw your scene
  fill(200, 80, 80);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2, 100, 100);

  fill(255);
  textAlign(CENTER, CENTER);
  text("Click to shake!", width / 2, height / 2 + 80);
}

function mousePressed() {
  shakeAmount = 20; // trigger a shake
}
```

### Key Principles

- **Randomness**: Use `random()` for a jittery, violent shake. Use Perlin noise (`noise()`) for a smoother, more organic tremor.
- **Decay**: Multiply the shake amount by a value less than 1 each frame (like 0.95) so it naturally fades out.
- **Direction**: For a more controlled shake, you can limit it to one axis (horizontal only, for instance) or add rotational shake with `rotate(random(-angle, angle))`.

### Perlin Noise Shake (Smoother)

```js
function draw() {
  background(20);

  let t = millis() * 0.01;
  let shakeX = (noise(t) - 0.5) * shakeAmount * 2;
  let shakeY = (noise(t + 100) - 0.5) * shakeAmount * 2;
  translate(shakeX, shakeY);

  shakeAmount *= 0.95;

  // ... draw your scene
}
```

---

## 2. Audio-Reactive Visuals

Audio-reactive visuals respond to sound in real time. This is one of the most compelling applications of creative coding -- turning music or ambient sound into a visual experience.

### FFT Analysis

**FFT** (Fast Fourier Transform) breaks a sound signal into its individual frequency components. Instead of seeing a single waveform (amplitude over time), FFT shows you how much energy is present at each frequency (bass, mids, treble).

In p5.js, the `p5.FFT` object provides:

- **`getEnergy(frequency)`** -- returns the amplitude at a specific frequency or range (e.g., `"bass"`, `"mid"`, `"treble"`).
- **`analyze()`** -- returns an array of 1024 amplitude values spanning the full frequency spectrum.
- **`waveform()`** -- returns the raw waveform (amplitude over time) of the current audio frame.

### Basic Audio-Reactive Circle

```js
let mic, fft;

function setup() {
  createCanvas(600, 600);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  background(20);

  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");        // 20-140 Hz
  let mid = fft.getEnergy("mid");          // 400-2600 Hz
  let treble = fft.getEnergy("treble");    // 2600-5200 Hz

  // Map frequency bands to visual properties
  let size = map(bass, 0, 255, 50, 300);
  let r = map(bass, 0, 255, 80, 255);
  let g = map(mid, 0, 255, 80, 255);
  let b = map(treble, 0, 255, 80, 255);

  noStroke();
  fill(r, g, b);
  circle(width / 2, height / 2, size);
}
```

### Combining Shake with Audio

```js
function draw() {
  background(20);

  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");

  // Audio-driven camera shake
  if (bass > 200) { // strong bass hit
    shakeAmount = map(bass, 200, 255, 5, 15);
  }

  let shakeX = random(-shakeAmount, shakeAmount);
  let shakeY = random(-shakeAmount, shakeAmount);
  translate(shakeX, shakeY);
  shakeAmount *= 0.9;

  // ... draw visuals
}
```

---

## 3. Brushstroke Simulation with Hooke's Law

A digital brush that perfectly follows the mouse feels stiff and mechanical. Real brushes have bristles that bend, lag behind, and spring back. We can simulate this behavior using **Hooke's Law** -- the physics of springs.

### Hooke's Law

Hooke's Law states that the force exerted by a spring is proportional to how far it is stretched from its rest position:

$$F = -k \cdot x$$

Where:
- $F$ is the restoring force
- $k$ is the spring constant (stiffness)
- $x$ is the displacement from the rest position

In our brush simulation, the brush tip is connected to the mouse cursor by an invisible spring. When the mouse moves, the brush tip is pulled along, but it lags behind and oscillates slightly, creating organic, flowing strokes.

### Implementation

```js
let brushX, brushY;
let velX = 0, velY = 0;
let springK = 0.1;   // spring stiffness (0.01 = loose, 0.5 = tight)
let damping = 0.85;  // friction (0 = no friction, 1 = no damping)

function setup() {
  createCanvas(800, 600);
  background(245);
  brushX = width / 2;
  brushY = height / 2;
}

function draw() {
  // Hooke's law: force = -k * displacement
  let dx = mouseX - brushX;
  let dy = mouseY - brushY;

  // Acceleration = force (assuming mass = 1)
  let ax = springK * dx;
  let ay = springK * dy;

  // Update velocity with acceleration and damping
  velX += ax;
  velY += ay;
  velX *= damping;
  velY *= damping;

  // Store previous position
  let prevX = brushX;
  let prevY = brushY;

  // Update position
  brushX += velX;
  brushY += velY;

  // Calculate speed for dynamic brush properties
  let speed = dist(prevX, prevY, brushX, brushY);

  if (mouseIsPressed) {
    // Brush size inversely proportional to speed
    let brushSize = map(speed, 0, 30, 12, 2, true);

    // Opacity based on speed
    let alpha = map(speed, 0, 30, 200, 50, true);

    stroke(30, 30, 40, alpha);
    strokeWeight(brushSize);
    line(prevX, prevY, brushX, brushY);
  }
}

function keyPressed() {
  if (key === ' ') {
    background(245); // clear canvas
  }
}
```

### Multiple Bristles

For a more realistic brush, simulate multiple spring-connected points (bristles) with slightly different spring constants:

```js
let bristles = [];
let numBristles = 8;

function setup() {
  createCanvas(800, 600);
  background(245);

  for (let i = 0; i < numBristles; i++) {
    bristles.push({
      x: width / 2 + random(-5, 5),
      y: height / 2 + random(-5, 5),
      vx: 0,
      vy: 0,
      k: 0.05 + random(0.02, 0.12), // varying stiffness
      damping: 0.8 + random(0, 0.15),
      offset: random(-8, 8) // spatial offset from cursor
    });
  }
}

function draw() {
  for (let b of bristles) {
    let targetX = mouseX + b.offset;
    let targetY = mouseY + b.offset * 0.5;

    let ax = b.k * (targetX - b.x);
    let ay = b.k * (targetY - b.y);

    b.vx += ax;
    b.vy += ay;
    b.vx *= b.damping;
    b.vy *= b.damping;

    let prevX = b.x;
    let prevY = b.y;

    b.x += b.vx;
    b.y += b.vy;

    if (mouseIsPressed) {
      let speed = dist(prevX, prevY, b.x, b.y);
      let sw = map(speed, 0, 20, 3, 0.5, true);
      stroke(30, 30, 40, 80);
      strokeWeight(sw);
      line(prevX, prevY, b.x, b.y);
    }
  }
}
```

---

## 4. Blend Modes

Blend modes control how newly drawn pixels combine with existing pixels on the canvas. They can produce dramatic visual effects with minimal code.

### Available Blend Modes in p5.js

| Mode | Effect |
|------|--------|
| `BLEND` | Default. Normal alpha compositing. |
| `ADD` | Additive blending. Colors brighten where they overlap. Great for light and glow effects. |
| `MULTIPLY` | Colors darken where they overlap. Simulates layering ink or paint. |
| `SCREEN` | Opposite of multiply. Brightens. Simulates projecting light. |
| `DIFFERENCE` | Takes the absolute difference between colors. Creates psychedelic, inverted effects. |
| `EXCLUSION` | Similar to difference but lower contrast. |
| `DARKEST` | Keeps the darker of the two pixels. |
| `LIGHTEST` | Keeps the lighter of the two pixels. |

### Using Blend Modes

```js
function draw() {
  background(0);

  // Draw overlapping circles with additive blending
  blendMode(ADD);

  noStroke();

  fill(255, 0, 0, 150);
  circle(width / 2 - 60, height / 2, 200);

  fill(0, 255, 0, 150);
  circle(width / 2 + 60, height / 2, 200);

  fill(0, 0, 255, 150);
  circle(width / 2, height / 2 - 60, 200);

  blendMode(BLEND); // reset to default
}
```

With `ADD` mode, where the circles overlap, the colors combine to produce brighter hues -- red + green = yellow, red + blue = magenta, all three = white. This mimics how actual light mixes.

### Blend Modes for Trails

Blend modes are powerful for creating particle trail effects:

```js
function draw() {
  // Instead of background(), use a semi-transparent rect
  // with DIFFERENCE mode for psychedelic trails
  blendMode(DIFFERENCE);
  fill(5);
  rect(0, 0, width, height);

  blendMode(ADD);
  // Draw your particles here with bright colors...

  blendMode(BLEND); // reset
}
```

---

## 5. Combining Effects

The real magic happens when you combine these techniques. Here is a sketch that uses audio-reactive visuals with camera shake, additive blending, and spring physics:

```js
let mic, fft;
let brushX, brushY, velX = 0, velY = 0;
let shakeAmount = 0;

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  brushX = width / 2;
  brushY = height / 2;
}

function draw() {
  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");
  let volume = fft.getEnergy(20, 20000);

  // Audio-driven shake
  if (bass > 180) {
    shakeAmount = map(bass, 180, 255, 2, 12);
  }
  shakeAmount *= 0.92;

  // Fade background
  blendMode(BLEND);
  noStroke();
  fill(0, 0, 5, 15);
  rect(0, 0, width, height);

  // Apply shake
  push();
  translate(
    random(-shakeAmount, shakeAmount),
    random(-shakeAmount, shakeAmount)
  );

  // Spring physics for brush position
  let dx = mouseX - brushX;
  let dy = mouseY - brushY;
  velX += dx * 0.08;
  velY += dy * 0.08;
  velX *= 0.88;
  velY *= 0.88;
  brushX += velX;
  brushY += velY;

  // Draw audio-reactive elements with additive blending
  blendMode(ADD);

  let hue = frameCount % 360;
  let ringSize = map(bass, 0, 255, 20, 300);

  noFill();
  stroke(hue, 80, map(bass, 0, 255, 20, 100), 50);
  strokeWeight(map(mid, 0, 255, 1, 6));
  circle(brushX, brushY, ringSize);

  // Treble sparkles
  for (let i = 0; i < map(treble, 0, 255, 0, 10); i++) {
    let angle = random(TWO_PI);
    let r = ringSize / 2 + random(-20, 20);
    let sx = brushX + cos(angle) * r;
    let sy = brushY + sin(angle) * r;
    fill((hue + 180) % 360, 60, 100, 60);
    noStroke();
    circle(sx, sy, random(2, 5));
  }

  pop();
  blendMode(BLEND);
}
```

---

## 6. TouchDesigner Connection

Many of the effects we discussed in p5.js have counterparts in **TouchDesigner**, a node-based visual programming environment popular for real-time installations and live performance visuals. While p5.js is code-based and runs in a browser, TouchDesigner offers:

- GPU-accelerated rendering with real-time feedback
- A visual node graph for connecting operations
- Native support for multi-screen output, projection mapping, and hardware integration
- Built-in audio analysis, MIDI input, and OSC communication

If you find yourself drawn to real-time visual performance or large-scale installations, TouchDesigner is worth exploring as a complement to your p5.js skills. The concepts you learn here -- flow fields, FFT analysis, physics-based motion, blend modes -- translate directly to TouchDesigner's paradigm.

---

## Summary

| Technique | Core Idea |
|-----------|-----------|
| Camera shake | `translate(random offset)` each frame, decaying over time |
| Audio-reactive | FFT analysis extracts bass/mid/treble energy to drive visual parameters |
| Brushstroke physics | Hooke's Law spring connects brush tip to cursor with lag and oscillation |
| Blend modes | `blendMode(ADD)` for light/glow, `MULTIPLY` for ink, `DIFFERENCE` for psychedelic |
| Combining effects | Layer multiple techniques for rich, dynamic visual experiences |

---

## Further Reading

- Daniel Shiffman, *The Nature of Code*, Chapter 3: Oscillation (spring physics)
- p5.js reference: `blendMode()`, `p5.FFT`, `p5.AudioIn`
- Zach Lieberman's work on audio-reactive art
- TouchDesigner documentation: <https://derivative.ca/UserGuide>
