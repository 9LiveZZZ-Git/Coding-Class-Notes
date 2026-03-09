# Textbook Chapter: Computation Fundamentals, Vectors, WebGPU, Color Theory, and Debugging

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Introduction

This chapter explores what lies beneath and around the code you write every day. We look downward at the hardware -- logic gates and CPUs -- to understand why some code is fast and some is slow. We look at the tools -- vectors, WebGPU, color spaces -- that let you build richer simulations and visuals. And we look at the practical skill of debugging: finding and fixing the inevitable problems that arise in every project.

---

## 1. Computation Fundamentals: From NAND to CPU

### 1.1 The Universal Gate

Every digital computer is built from logic gates. A **NAND gate** takes two binary inputs and outputs 0 only when both inputs are 1; otherwise it outputs 1.

| A | B | NAND |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

NAND is **universal**: every other logic gate (NOT, AND, OR, XOR) can be constructed from NAND gates alone.

```
NOT(A)    = NAND(A, A)
AND(A, B) = NAND(NAND(A, B), NAND(A, B))
OR(A, B)  = NAND(NAND(A, A), NAND(B, B))
```

### 1.2 Building Arithmetic

**Half adder**: adds two bits, producing a Sum and Carry. Built from XOR (for Sum) and AND (for Carry), both of which are built from NAND gates.

**Full adder**: adds two bits plus a carry-in. Built from two half adders and an OR gate.

**16-bit adder**: chain 16 full adders together. This is how your CPU adds numbers.

### 1.3 The ALU, Memory, and CPU

The **ALU** (Arithmetic Logic Unit) performs arithmetic and logic operations. It is built from adders, multiplexers, and logic gates.

**Memory** stores bits using cross-coupled NAND gates (latches). Group 8 latches for a byte, thousands of bytes for RAM.

The **CPU** repeats a cycle billions of times per second:

1. **Fetch** an instruction from memory
2. **Decode** what the instruction means
3. **Execute** the operation (using the ALU)

A 3 GHz CPU does this 3 billion times per second. This is why a 600x600 pixel loop (360,000 iterations) runs in milliseconds, but a complex per-pixel computation can still be too slow for 60 fps.

### 1.4 CPU vs. GPU

| Property | CPU | GPU |
|---|---|---|
| Cores | 4-16 (fast) | 2,048-16,384 (simpler) |
| Paradigm | Sequential | Massively parallel |
| Good for | Complex logic, branching | Same operation on many data points |

This is why we moved Reaction-Diffusion from the CPU to the GPU. The CPU processes pixels one at a time; the GPU processes them all simultaneously.

### 1.5 Hands-On Resources

- **nand2tetris** (<https://www.nand2tetris.org>): Build an entire computer from NAND gates, then write software for it.
- **nandgame** (<https://nandgame.com>): Browser-based puzzle game where you build gates, adders, ALU, and CPU from NAND gates.

---

## 2. The p5.Vector API

### 2.1 What Is a Vector?

A vector represents a quantity with magnitude and direction. In p5.js, `p5.Vector` stores `x`, `y`, and `z` components and provides methods for common operations.

```js
let pos = createVector(100, 200);  // position
let vel = createVector(3, -1);     // velocity
pos.add(vel);                      // update position
```

### 2.2 Core Operations

#### Creating Vectors

```js
let v = createVector(3, 4);        // (3, 4)
let r = p5.Vector.random2D();      // random unit vector
let a = p5.Vector.fromAngle(PI/4); // unit vector at 45 degrees
```

#### Arithmetic

```js
v.add(other);   // v = v + other (modifies v)
v.sub(other);   // v = v - other
v.mult(n);      // v = v * n (scalar)
v.div(n);       // v = v / n (scalar)
```

#### Magnitude and Direction

```js
v.mag();        // length: sqrt(x*x + y*y)
v.magSq();      // length squared (faster, no sqrt)
v.normalize();  // set length to 1, keep direction
v.setMag(n);    // set length to n, keep direction
v.limit(n);     // cap length at n
v.heading();    // angle in radians
```

#### Dot Product

```js
let d = a.dot(b);  // a.x*b.x + a.y*b.y
// Positive: same direction. Zero: perpendicular. Negative: opposite.
```

#### Distance

```js
let d = a.dist(b);           // instance method
let d = p5.Vector.dist(a, b); // static method
```

### 2.3 Static vs. Instance Methods

**Instance methods** modify the vector:

```js
a.add(b); // a is changed, b is unchanged
```

**Static methods** return a new vector:

```js
let c = p5.Vector.add(a, b); // a and b unchanged, c is new
```

Use static methods when you need to preserve the originals. Use `copy()` when you need a clone:

```js
let clone = original.copy();
```

### 2.4 The Position-Velocity-Acceleration Pattern

The fundamental pattern for physics simulations:

```js
let pos, vel, acc;

function setup() {
  createCanvas(600, 400);
  pos = createVector(width / 2, height / 2);
  vel = createVector(0, 0);
  acc = createVector(0, 0);
}

function draw() {
  background(20);

  // Compute forces -> acceleration
  let gravity = createVector(0, 0.1);
  acc = gravity.copy();

  // Seek mouse
  let mouse = createVector(mouseX, mouseY);
  let seek = p5.Vector.sub(mouse, pos);
  seek.setMag(0.3);
  acc.add(seek);

  // Update physics
  vel.add(acc);
  vel.limit(6);
  pos.add(vel);

  // Draw
  fill(255, 150, 50);
  noStroke();
  circle(pos.x, pos.y, 20);
}
```

### 2.5 Complete Example: Particle System

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(10, 10, 30);

  // Spawn particles
  if (frameCount % 2 === 0) {
    particles.push(new Particle(mouseX, mouseY));
  }

  // Update and draw
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.applyForce(createVector(0, 0.05)); // gravity
    p.update();
    p.display();
    if (p.isDead()) particles.splice(i, 1);
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.life = 255;
    this.size = random(4, 12);
  }

  applyForce(f) { this.acc.add(f); }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(10);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= 3;
  }

  display() {
    noStroke();
    fill(255, 150, 50, this.life);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() { return this.life <= 0; }
}
```

### 2.6 Flow Fields with Vectors

A flow field is a grid of vectors that guide particle movement. Using Perlin noise to set directions:

```js
let particles = [];
let flowField;
let cols, rows, scl = 20;

function setup() {
  createCanvas(600, 400);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowField = new Array(cols * rows);
  for (let i = 0; i < 300; i++) {
    particles.push(new FlowParticle());
  }
  background(10);
}

function draw() {
  // Generate flow field from noise
  let yoff = frameCount * 0.005;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let angle = noise(xoff, yoff) * TWO_PI * 2;
      flowField[x + y * cols] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  // Update particles
  for (let p of particles) {
    let col = constrain(floor(p.pos.x / scl), 0, cols - 1);
    let row = constrain(floor(p.pos.y / scl), 0, rows - 1);
    let force = flowField[col + row * cols].copy().mult(0.2);
    p.applyForce(force);
    p.update();
    p.display();
    p.wrapEdges();
  }
}

class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.prevPos = this.pos.copy();
  }

  applyForce(f) { this.acc.add(f); }

  update() {
    this.prevPos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(2);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  display() {
    stroke(255, 255, 255, 15);
    strokeWeight(1);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }

  wrapEdges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos = this.pos.copy(); }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos = this.pos.copy(); }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos = this.pos.copy(); }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos = this.pos.copy(); }
  }
}
```

---

## 3. WebGPU and the Seagulls Library

### 3.1 Why WebGPU?

WebGPU replaces WebGL with a modern API that supports **compute shaders** -- GPU programs that run general-purpose computation without the rendering pipeline. No more "abusing" textures to store data.

| WebGL (old) | WebGPU (new) |
|---|---|
| GLSL shaders | WGSL shaders |
| Fragment shaders only for GPGPU | Compute shaders |
| Data encoded as pixel colors | Data stored in typed buffers |
| 8-bit precision (textures) | 32-bit float buffers |

### 3.2 WGSL Basics

WGSL uses Rust-like syntax:

```wgsl
// Variable declaration
var x: f32 = 1.0;
var v: vec2f = vec2f(1.0, 2.0);

// Function
fn square(x: f32) -> f32 {
    return x * x;
}

// Compute shader entry point
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let index = id.x + id.y * 512u;
    // ... process element at index ...
}
```

### 3.3 Seagulls Library

Seagulls (<https://github.com/charlieroberts/seagulls>) wraps WebGPU for creative coding:

```js
import Seagulls from 'seagulls';

const compute = `
@group(0) @binding(0) var<storage, read>       input:  array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    output[i] = input[i] * 2.0;
}
`;

const render = `
@group(0) @binding(0) var<storage, read> data: array<f32>;

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let i = u32(pos.y) * 512u + u32(pos.x);
    let v = data[i];
    return vec4f(v, v, v, 1.0);
}
`;

const sg = await Seagulls.init();
sg.buffer(initialData)
  .compute(compute, [512 / 64])
  .render(render)
  .run();
```

### 3.4 Reaction-Diffusion on WebGPU

The Gray-Scott Reaction-Diffusion model translates naturally to a compute shader. Each cell stores concentrations of chemicals A and B. The compute shader:

1. Reads neighboring cells from the input buffer.
2. Computes the Laplacian (how different each cell is from its neighbors).
3. Applies the reaction-diffusion equations.
4. Writes new values to the output buffer.

The key equations:

$$A' = A + (D_A \nabla^2 A - AB^2 + f(1-A)) \cdot dt$$

$$B' = B + (D_B \nabla^2 B + AB^2 - (k+f)B) \cdot dt$$

```wgsl
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = i32(id.x);
    let y = i32(id.y);

    let a = getA(x, y);
    let b = getB(x, y);
    let lapA = laplacian_A(x, y);
    let lapB = laplacian_B(x, y);
    let reaction = a * b * b;

    let newA = clamp(a + dA * lapA - reaction + feed * (1.0 - a), 0.0, 1.0);
    let newB = clamp(b + dB * lapB + reaction - (kill + feed) * b, 0.0, 1.0);

    let i = idx(x, y);
    stateOut[i] = newA;
    stateOut[i + 1] = newB;
}
```

Different `feed` and `kill` values produce different patterns:
- `feed=0.055, kill=0.062` -- mitosis (dividing spots)
- `feed=0.04, kill=0.06` -- spots
- `feed=0.025, kill=0.05` -- stripes
- `feed=0.078, kill=0.061` -- worms/coral

The instructor has created reference implementations:
- CPU original: <https://editor.p5js.org/kybr/sketches/zP-AUsFMQ>
- Using class Grid3D: <https://editor.p5js.org/kybr/sketches/ye8HkzO0s>
- GPGPU solution (2013): <https://editor.p5js.org/kybr/sketches/hUr0l3-o0>
- WebGPU/seagulls: <https://editor.p5js.org/kybr/sketches/p0lKbTuhU>

---

## 4. Color Theory Through Code

### 4.1 RGB Permutations

If each of R, G, B can be 0, 0.5, or 1, we get $3^3 = 27$ unique colors. These are evenly spaced points in the RGB color cube.

```js
let colors = [];
let values = [0, 0.5, 1.0];

for (let r of values)
  for (let g of values)
    for (let b of values)
      colors.push({ r, g, b });

console.log(colors.length); // 27
```

### 4.2 Displaying Swatches

```js
function setup() {
  createCanvas(600, 400);
  colorMode(RGB, 1.0);
  noLoop();

  let colors = [];
  let vals = [0, 0.5, 1.0];
  for (let r of vals)
    for (let g of vals)
      for (let b of vals)
        colors.push({ r, g, b });

  let cols = 9;
  let sw = width / cols - 8;
  let sh = 100;

  for (let i = 0; i < colors.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let c = colors[i];
    noStroke();
    fill(c.r, c.g, c.b);
    rect(5 + col * (sw + 5), 5 + row * (sh + 5), sw, sh, 4);
  }
}
```

### 4.3 Perceived Brightness

The standard luminance formula weights green most heavily because human vision is most sensitive to green:

$$L = 0.299R + 0.587G + 0.114B$$

Use this to choose readable text colors: light text on dark backgrounds, dark text on light backgrounds.

### 4.4 HSB Color Space

HSB (Hue, Saturation, Brightness) is often more intuitive:

```js
colorMode(HSB, 360, 100, 100);
fill(0, 100, 100);    // red
fill(120, 100, 100);  // green
fill(240, 100, 100);  // blue
fill(60, 50, 80);     // muted yellow
```

HSB makes it easy to create color harmonies: complementary colors are 180 degrees apart on the hue wheel, analogous colors are 30 degrees apart.

---

## 5. Debugging

### 5.1 JavaScript Debugging

**`console.log()`** is your most important tool. Always label your output:

```js
console.log("pos:", pos.x, pos.y, "vel:", vel.mag());
```

Limit logging frequency in `draw()`:

```js
if (frameCount % 60 === 0) console.log("fps:", frameRate().toFixed(1));
```

**Common errors and fixes:**

| Error | Cause | Fix |
|---|---|---|
| `X is not defined` | Typo or wrong scope | Check spelling; declare at top level |
| `Cannot read property of undefined` | Object is `undefined` | Check array bounds; verify initialization |
| `NaN` | Division by zero; normalizing zero vector | Add `if (dist > 0.001)` guards |
| Screen is blank | `background()` called after drawing | Move `background()` to top of `draw()` |

**Visual debugging**: Draw vectors as lines, draw bounding boxes, color-code states.

### 5.2 GLSL Debugging

GLSL has no `console.log()`. Instead, **output values as colors**:

```glsl
// Debug: show UV coordinates as color
gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);

// Debug: show a value as grayscale
gl_FragColor = vec4(vec3(value), 1.0);

// Debug: show positive (red) vs negative (blue)
gl_FragColor = vec4(max(value, 0.0), 0.0, max(-value, 0.0), 1.0);
```

**The #1 GLSL error**: integer vs. float strictness.

```glsl
float x = 1;     // ERROR on many implementations
float x = 1.0;   // correct
```

**Always add `precision mediump float;`** at the top of fragment shaders.

### 5.3 The Debugging Methodology

1. **Read the error message** (they are usually helpful).
2. **Check the console** (F12 in the browser).
3. **Isolate** (comment out code until the error disappears).
4. **Verify assumptions** (log values; output as colors in GLSL).
5. **Simplify** (reproduce the bug in the smallest possible sketch).
6. **Search** (paste the error into a search engine).
7. **Take a break** (fresh eyes find bugs faster).

---

## Exercises

### Computation Fundamentals

1. **nandgame**: Complete levels 1-6 at <https://nandgame.com>. Write which level was hardest and why.

2. **Performance math**: A sketch processes a 500x500 grid, 60 fps, 50 operations per cell. How many operations per second? Is a 3 GHz CPU fast enough?

### Vectors

3. **Gravitational attractor**: Create a central attractor using Newton's formula $F = G \cdot m_1 \cdot m_2 / r^2$. Launch 50 particles from random positions with random velocities. Use `p5.Vector` for all calculations.

4. **Repulsion field**: Make 100 particles that repel each other. Each particle pushes every other particle away with a force inversely proportional to distance squared. Observe the emergent behavior.

### WebGPU

5. **Parameter explorer**: Modify the Reaction-Diffusion example to accept `feed` and `kill` as uniforms controlled by `mouseX` and `mouseY`. Map mouseX to feed (0.01-0.1) and mouseY to kill (0.04-0.07).

6. **GLSL to WGSL**: Translate a simple GLSL fragment shader to WGSL. Document every syntax change.

### Color

7. **64-color palette**: Generate all $4^3 = 64$ colors with 4 steps per channel. Sort by luminance. Display as an 8x8 grid.

8. **Complementary colors**: For each of the 27 colors from the 3-step palette, display it next to its complement $(1-R, 1-G, 1-B)$.

### Debugging

9. **Bug hunt**: The following sketch has 5 bugs. Find and fix all of them:

```js
let particles = []

function setup()
  createCanvas(400 400);
  for (let i = 0, i < 10, i++) {
    particles.push({
      x: random(width)
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2)
    });
  }
}

function draw() {
  backround(0);
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i]
    p.x += p.vx;
    p.y += p.vy;
    fill(255);
    cirlce(p.x, p.y, 10);
  }
}
```

10. **Shader debug challenge**: The following shader should show a circle in the center, but it shows nothing. Use the color-output debugging technique to find and fix the problem:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
    vec2 uv = vTexCoord * u_resolution;
    float d = distance(uv, u_resolution / 2);
    float circle = step(d, 50);
    gl_FragColor = vec4(vec3(circle), 1.0);
}
```

---

## Summary

- **Computation fundamentals**: NAND gates are universal; from them we build adders, ALUs, memory, and CPUs. Understanding hardware explains why GPU parallelism makes shaders fast.
- **p5.Vector**: A powerful API for 2D/3D vector math. The position-velocity-acceleration pattern is the foundation of physics simulations.
- **WebGPU**: The successor to WebGL, offering compute shaders for general-purpose GPU computation. The seagulls library makes it accessible for creative coding.
- **Color theory**: Systematic generation of color palettes reveals the structure of color spaces. RGB is a cube; HSB is a cylinder.
- **Debugging**: `console.log()` for JavaScript, color-as-output for GLSL. Follow a systematic methodology: read errors, isolate, verify, simplify.

---

## Further Reading

- nand2tetris: <https://www.nand2tetris.org>
- nandgame: <https://nandgame.com>
- p5.Vector Reference: <https://p5js.org/reference/p5.Vector/>
- *The Nature of Code*: <https://natureofcode.com>
- Seagulls: <https://github.com/charlieroberts/seagulls>
- p5.js WebGPU: <https://www.davepagurek.com/blog/p5-webgpu>
- p5.strands: <https://github.com/processing/p5.js/blob/dev-2.0/contributor_docs/p5.strands.md>
- Field Guide to Debugging: <https://beta.p5js.org/tutorials/field-guide-to-debugging>
- Color permutations (instructor): <https://editor.p5js.org/kybr/sketches/egBA_dDU3>
- Flow field (instructor): <https://editor.p5js.org/kybr/sketches/reGRzww4_>
- Reaction-Diffusion (all versions): <https://editor.p5js.org/kybr/sketches/zP-AUsFMQ> | <https://editor.p5js.org/kybr/sketches/ye8HkzO0s> | <https://editor.p5js.org/kybr/sketches/hUr0l3-o0> | <https://editor.p5js.org/kybr/sketches/p0lKbTuhU>
