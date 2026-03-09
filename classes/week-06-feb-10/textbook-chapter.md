# Chapter: 3D Geometry, Flow Fields, Computer Vision, and Visual Effects

**MAT 200C: Computing Arts -- Week 6, February 10**

---

## Introduction

This chapter covers four major topics in creative coding: building custom 3D geometry, creating flow fields driven by Perlin noise, integrating computer vision through machine learning, and applying visual effects like camera shake and audio reactivity. Together, these techniques open up an enormous range of creative possibilities -- from sculptural 3D forms to particle systems that reveal invisible forces, from interactive installations that respond to human bodies to dynamic visuals synchronized with sound.

---

## Part 1: 3D Geometry in p5.js

### 1.1 Entering the Third Dimension

p5.js supports 3D rendering through WebGL, the browser's GPU-accelerated graphics API. To enter 3D mode, pass `WEBGL` as the third argument to `createCanvas()`:

```js
function setup() {
  createCanvas(600, 600, WEBGL);
}
```

In WEBGL mode, the coordinate origin moves to the center of the canvas. The x-axis points right, y-axis points down, and z-axis points toward the viewer.

### 1.2 Built-In Primitives

p5.js provides basic 3D shapes:

```js
function draw() {
  background(20);
  lights();

  push();
  translate(-150, 0, 0);
  fill(200, 100, 100);
  box(80);
  pop();

  push();
  translate(0, 0, 0);
  fill(100, 200, 100);
  sphere(50);
  pop();

  push();
  translate(150, 0, 0);
  fill(100, 100, 200);
  torus(40, 15);
  pop();
}
```

Each primitive accepts detail parameters that control tessellation. Higher detail values produce smoother curves at the cost of more triangles.

### 1.3 Lighting

Lighting transforms flat-colored 3D shapes into objects with depth and form.

**Ambient light** provides uniform illumination:

```js
ambientLight(60, 60, 60);
```

**Directional light** shines from a direction like the sun:

```js
directionalLight(255, 255, 255, -1, 1, -1);
```

**Point light** radiates from a position like a light bulb:

```js
pointLight(255, 200, 150, 200, -200, 200);
```

A typical lighting setup combines all three: ambient for fill, directional for key light, and point for accent.

### 1.4 Custom Geometry with p5.Geometry

The `p5.Geometry` class lets you build meshes from scratch by defining vertices and faces.

**Vertices** are points in 3D space. **Faces** are triangles defined by three vertex indices. **Normals** are perpendicular vectors used for lighting calculations.

```js
let customShape;

function setup() {
  createCanvas(600, 600, WEBGL);

  customShape = new p5.Geometry(1, 1, function() {
    // A simple pyramid
    let h = 80;   // height
    let s = 60;   // base half-width

    // Vertices
    this.vertices.push(new p5.Vector(0, -h, 0));     // 0: apex
    this.vertices.push(new p5.Vector(-s, 0, -s));     // 1: back-left
    this.vertices.push(new p5.Vector(s, 0, -s));      // 2: back-right
    this.vertices.push(new p5.Vector(s, 0, s));       // 3: front-right
    this.vertices.push(new p5.Vector(-s, 0, s));      // 4: front-left

    // Faces (4 triangular sides + 2 triangles for the base)
    this.faces.push([0, 1, 2]); // back face
    this.faces.push([0, 2, 3]); // right face
    this.faces.push([0, 3, 4]); // front face
    this.faces.push([0, 4, 1]); // left face
    this.faces.push([1, 3, 2]); // base triangle 1
    this.faces.push([1, 4, 3]); // base triangle 2

    this.computeNormals();
  });
}

function draw() {
  background(20);
  ambientLight(50);
  directionalLight(220, 220, 255, -1, 1, -1);

  orbitControl();

  fill(180, 120, 80);
  noStroke();
  model(customShape);
}
```

### 1.5 Parametric Surfaces

A parametric surface is defined by a function $f(u, v) \rightarrow (x, y, z)$ that maps two parameters to a 3D point. By evaluating this function on a grid and connecting adjacent points into triangles, we can create complex curved surfaces.

**Example -- A wavy sphere:**

```js
let surface;

function setup() {
  createCanvas(600, 600, WEBGL);

  let detU = 40, detV = 30, R = 100;

  surface = new p5.Geometry(1, 1, function() {
    for (let i = 0; i <= detU; i++) {
      let u = (i / detU) * TWO_PI;
      for (let j = 0; j <= detV; j++) {
        let v = (j / detV) * PI;
        let r = R + sin(u * 5) * sin(v * 4) * 15;
        this.vertices.push(new p5.Vector(
          r * sin(v) * cos(u),
          r * cos(v),
          r * sin(v) * sin(u)
        ));
      }
    }

    for (let i = 0; i < detU; i++) {
      for (let j = 0; j < detV; j++) {
        let a = i * (detV + 1) + j;
        let b = a + detV + 1;
        this.faces.push([a, b, a + 1]);
        this.faces.push([b, b + 1, a + 1]);
      }
    }

    this.computeNormals();
  });
}

function draw() {
  background(15);
  ambientLight(40, 40, 50);
  directionalLight(200, 200, 255, -1, 0.8, -0.5);
  orbitControl();

  specularMaterial(140, 200, 220);
  shininess(30);
  noStroke();
  model(surface);
}
```

---

## Part 2: Flow Fields

### 2.1 The Concept

A flow field is a vector field -- a function that assigns a direction vector to every point in space. When particles move through the field by following the vector at their current position, they trace out paths that reveal the underlying structure of the field.

The beauty of flow fields is that simple local rules produce complex global patterns. Each particle only knows about its immediate surroundings, but the collective behavior of thousands of particles creates sweeping, organic forms.

### 2.2 Generating Flow with Perlin Noise

Perlin noise is ideal for flow fields because it is smooth and continuous. Nearby points receive similar values, which creates coherent flow rather than random chaos.

```js
// At any position (x, y), compute a flow angle:
let angle = noise(x * scale, y * scale) * TWO_PI * 2;

// Convert to a direction vector:
let force = p5.Vector.fromAngle(angle);
```

The `scale` parameter controls the "zoom level" of the noise. Small scale values (0.001) produce large, sweeping curves. Large values (0.01) produce tighter, more turbulent patterns.

### 2.3 Particle System

Each particle stores its position, velocity, and acceleration. Each frame, the particle:

1. Looks up the flow vector at its current position.
2. Applies that vector as a force (acceleration).
3. Updates velocity by adding acceleration.
4. Updates position by adding velocity.
5. Draws a line from the previous position to the current position.

```js
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
  }

  follow(angle) {
    let force = p5.Vector.fromAngle(angle);
    force.setMag(0.5);
    this.acc.add(force);
  }

  update() {
    this.prevPos.set(this.pos);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos.set(this.pos); }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos.set(this.pos); }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos.set(this.pos); }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos.set(this.pos); }
  }

  display() {
    stroke(0, 5);
    strokeWeight(1);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }
}
```

### 2.4 Complete Flow Field

```js
let particles = [];
let noiseScale = 0.003;
let zOff = 0;

function setup() {
  createCanvas(800, 600);
  background(255);
  for (let i = 0; i < 2000; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  zOff += 0.001;

  for (let p of particles) {
    let angle = noise(
      p.pos.x * noiseScale,
      p.pos.y * noiseScale,
      zOff
    ) * TWO_PI * 2;

    p.follow(angle);
    p.update();
    p.edges();
    p.display();
  }
}
```

### 2.5 The GPGPU Approach

For handling hundreds of thousands of particles, we can move computation to the GPU. The GPGPU (General-Purpose GPU) technique uses image textures to store particle data:

- Each pixel represents one particle.
- The R channel stores the x position (normalized to 0-255 or as a float).
- The G channel stores the y position.
- The B channel stores the x velocity.
- The A channel stores the y velocity.

A fragment shader reads each pixel, computes the new position and velocity based on the flow field, and writes the result to a second texture. Two textures alternate roles (ping-pong) because a shader cannot read and write the same texture simultaneously.

This approach can handle over 100,000 particles at 60fps because the GPU processes all pixels in parallel.

**CPU simulation of the concept:**

```js
let particleImg;
let numParticles = 10000;
let imgSize;

function setup() {
  createCanvas(800, 600);
  background(0);
  imgSize = ceil(sqrt(numParticles));
  particleImg = createImage(imgSize, imgSize);
  particleImg.loadPixels();

  for (let i = 0; i < numParticles; i++) {
    let idx = i * 4;
    particleImg.pixels[idx + 0] = random(255); // x
    particleImg.pixels[idx + 1] = random(255); // y
    particleImg.pixels[idx + 2] = 128;          // vx (biased)
    particleImg.pixels[idx + 3] = 128;          // vy (biased)
  }
  particleImg.updatePixels();
}

function draw() {
  // Fade trail
  fill(0, 8);
  noStroke();
  rect(0, 0, width, height);

  particleImg.loadPixels();
  for (let i = 0; i < numParticles; i++) {
    let idx = i * 4;
    let px = (particleImg.pixels[idx] / 255) * width;
    let py = (particleImg.pixels[idx + 1] / 255) * height;
    let vx = (particleImg.pixels[idx + 2] - 128) / 32;
    let vy = (particleImg.pixels[idx + 3] - 128) / 32;

    let angle = noise(px * 0.003, py * 0.003) * TWO_PI * 2;
    vx = (vx + cos(angle) * 0.5) * 0.98;
    vy = (vy + sin(angle) * 0.5) * 0.98;

    let prevX = px, prevY = py;
    px += vx; py += vy;
    if (px < 0) px += width; if (px > width) px -= width;
    if (py < 0) py += height; if (py > height) py -= height;

    stroke(255, 10);
    strokeWeight(0.5);
    if (dist(prevX, prevY, px, py) < 20) {
      line(prevX, prevY, px, py);
    }

    particleImg.pixels[idx] = (px / width) * 255;
    particleImg.pixels[idx + 1] = (py / height) * 255;
    particleImg.pixels[idx + 2] = constrain(vx * 32 + 128, 0, 255);
    particleImg.pixels[idx + 3] = constrain(vy * 32 + 128, 0, 255);
  }
  particleImg.updatePixels();
}
```

---

## Part 3: Computer Vision with ml5.js

### 3.1 What Is ml5.js?

ml5.js is a machine learning library for the browser that provides pre-trained models for common computer vision tasks. It is designed to be approachable for creative coders and works seamlessly with p5.js.

Key models:
- **Hand Pose**: 21 keypoints per hand
- **Face Mesh**: 468 facial landmarks
- **Body Pose**: 17 skeletal keypoints

### 3.2 Setup

Add ml5.js to your project by including it in `index.html`:

```html
<script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>
```

### 3.3 Hand Pose Detection

```js
let video, handPose, hands = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, results => { hands = results; });
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  pop();

  for (let hand of hands) {
    for (let kp of hand.keypoints) {
      fill(0, 255, 0);
      noStroke();
      circle(width - kp.x, kp.y, 8);
    }
  }
}
```

### 3.4 Face Mesh Detection

```js
let video, faceMesh, faces = [];

function preload() {
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, results => { faces = results; });
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  pop();

  for (let face of faces) {
    for (let kp of face.keypoints) {
      fill(0, 255, 255);
      noStroke();
      circle(width - kp.x, kp.y, 2);
    }
  }
}
```

### 3.5 Body Pose Detection

```js
let video, bodyPose, poses = [];

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, results => { poses = results; });
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  pop();

  for (let pose of poses) {
    for (let kp of pose.keypoints) {
      if (kp.confidence > 0.3) {
        fill(255, 0, 100);
        noStroke();
        circle(width - kp.x, kp.y, 10);
      }
    }

    let connections = bodyPose.getSkeleton(pose);
    for (let [a, b] of connections) {
      if (a.confidence > 0.3 && b.confidence > 0.3) {
        stroke(255, 0, 100);
        strokeWeight(2);
        line(width - a.x, a.y, width - b.x, b.y);
      }
    }
  }
}
```

### 3.6 Using Tracking Data Creatively

The tracking data becomes a creative tool when you map it to visual parameters:

- **Fingertip positions** drive particle emitters
- **Mouth openness** controls shape size or audio volume
- **Arm angles** rotate geometric patterns
- **Head tilt** shifts color palettes
- **Hand distance (z-depth)** controls zoom or brush size

```js
// Example: particles emit from index fingertip
for (let hand of hands) {
  let indexTip = hand.keypoints[8];
  let x = width - indexTip.x;
  let y = indexTip.y;

  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x, y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      life: 120
    });
  }
}
```

---

## Part 4: Visual Effects

### 4.1 Camera Shake

Camera shake offsets the entire drawing coordinate system by random amounts each frame:

```js
let shakeAmount = 0;

function draw() {
  background(20);
  translate(random(-shakeAmount, shakeAmount),
            random(-shakeAmount, shakeAmount));
  shakeAmount *= 0.95; // decay

  // ... draw scene ...
}

function mousePressed() {
  shakeAmount = 15;
}
```

Use `random()` for jittery shake, `noise()` for smooth organic tremor.

### 4.2 Audio-Reactive Visuals

FFT analysis decomposes sound into frequency bands:

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
  fft.analyze();

  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");

  // Map frequency bands to visual properties
  let size = map(bass, 0, 255, 50, 300);
  fill(map(bass, 0, 255, 80, 255),
       map(mid, 0, 255, 80, 255),
       map(treble, 0, 255, 80, 255));
  circle(width / 2, height / 2, size);
}
```

### 4.3 Brushstroke Physics (Hooke's Law)

A spring connects the brush tip to the cursor, creating natural lag and oscillation:

```js
let bx, by, vx = 0, vy = 0;
let k = 0.1;       // spring stiffness
let damp = 0.85;   // damping

function draw() {
  vx += k * (mouseX - bx);
  vy += k * (mouseY - by);
  vx *= damp;
  vy *= damp;

  let prevX = bx, prevY = by;
  bx += vx;
  by += vy;

  if (mouseIsPressed) {
    let speed = dist(prevX, prevY, bx, by);
    strokeWeight(map(speed, 0, 30, 10, 1, true));
    stroke(30, 150);
    line(prevX, prevY, bx, by);
  }
}
```

### 4.4 Blend Modes

Blend modes control how drawn pixels combine with existing pixels:

- **`ADD`** -- colors brighten at overlaps. Simulates light mixing. Great for glow effects.
- **`MULTIPLY`** -- colors darken at overlaps. Simulates ink layering.
- **`SCREEN`** -- opposite of multiply. Colors brighten.
- **`DIFFERENCE`** -- absolute difference between colors. Psychedelic inversions.

```js
function draw() {
  background(0);
  blendMode(ADD);

  fill(255, 0, 0, 150);
  circle(width / 2 - 50, height / 2, 200);

  fill(0, 0, 255, 150);
  circle(width / 2 + 50, height / 2, 200);

  blendMode(BLEND); // reset
}
```

---

## Exercises

### Exercise 1: Crystalline Form

Create a custom `p5.Geometry` that generates a crystal-like shape. Start with an icosahedron, then randomly displace some vertices outward to create irregular facets. Apply `specularMaterial()` and multiple colored lights to give it a gem-like appearance. Add slow rotation.

### Exercise 2: Interactive Flow Field

Build a flow field where the mouse creates a radial disturbance. When the mouse moves, particles near the cursor should be pushed away or attracted toward it. Combine Perlin noise for the base field with the mouse-driven force. Use color to indicate particle speed.

### Exercise 3: Body Puppet

Use ml5.js body pose detection to create a puppet. Track the user's shoulder, elbow, and wrist positions. At each joint, draw a geometric shape (circle, triangle). Connect joints with lines. Add decorative elements (patterns, particles) that respond to the speed of movement.

### Exercise 4: Audio-Visual Instrument

Create a sketch that combines:
- Microphone input with FFT analysis
- Camera shake triggered by bass hits
- A flow field whose noise scale is modulated by the mid-range frequencies
- Particle color controlled by treble energy
- Additive blend mode for a luminous feel

### Exercise 5: Parametric Explorer

Build a parametric surface viewer where the user can adjust the parametric equation parameters using sliders. Start with a sphere defined by:

$$x = r \sin(v) \cos(u), \quad y = r \cos(v), \quad z = r \sin(v) \sin(u)$$

Add sliders that let the user modify the equation to:

$$r = R + A \sin(n_1 u) \sin(n_2 v)$$

where $R$ is the base radius, $A$ is the amplitude, and $n_1$, $n_2$ control the number of bumps.

---

## Key Vocabulary

| Term | Definition |
|------|-----------|
| **WEBGL** | Browser API for GPU-accelerated 3D rendering |
| **Vertex** | A point in 3D space defining part of a mesh |
| **Face** | A triangle connecting three vertices |
| **Normal** | A vector perpendicular to a surface, used for lighting |
| **Parametric surface** | A 3D surface defined by $f(u,v) \rightarrow (x,y,z)$ |
| **Flow field** | A vector field assigning a direction to each point in space |
| **Perlin noise** | A smooth, coherent random function |
| **GPGPU** | Using GPU textures to store and process arbitrary data in parallel |
| **Ping-pong buffers** | Two framebuffers alternating as read/write targets |
| **FFT** | Fast Fourier Transform; decomposes sound into frequency components |
| **Hooke's Law** | $F = -kx$; spring force proportional to displacement |
| **Blend mode** | Rule for combining new pixel colors with existing ones |
| **ml5.js** | Beginner-friendly machine learning library for the browser |
| **Keypoint** | A tracked landmark point on a hand, face, or body |
