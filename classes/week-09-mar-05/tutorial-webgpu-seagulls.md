# Tutorial: WebGPU for Creative Coding with the Seagulls Library

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Overview

WebGPU is the next-generation graphics and compute API for the web. It replaces WebGL with a more modern, lower-level interface that provides access to GPU **compute shaders** -- programs that run on the GPU for general-purpose computation, not just rendering triangles.

For creative coding, this means we can run simulations (like Reaction-Diffusion) on the GPU hundreds of times faster than on the CPU, and with a cleaner programming model than the old WebGL "GPGPU texture hack."

In this tutorial, we will use the **seagulls** library (<https://github.com/charlieroberts/seagulls>) -- a creative-coding-friendly wrapper around WebGPU -- to write compute shaders that run simulations on the GPU.

We will cover:

1. What WebGPU is and why it matters
2. How WebGPU differs from WebGL
3. The WGSL shader language
4. Setting up seagulls
5. A simple compute shader example
6. Implementing Reaction-Diffusion on WebGPU

---

## Prerequisites

- Familiarity with p5.js and basic shader concepts
- A browser that supports WebGPU (Chrome 113+, Edge 113+, or Firefox Nightly with flags)
- Understanding of Reaction-Diffusion (from previous weeks)

**To check WebGPU support:** visit <https://webgpureport.org> in your browser.

---

## Part 1: What Is WebGPU?

### The GPU Computing Landscape

Your computer has two processors:

- **CPU** (Central Processing Unit): few cores (4-16), very fast per core, great for sequential logic.
- **GPU** (Graphics Processing Unit): thousands of cores, each slower than a CPU core, but massively parallel.

For tasks like "do the same computation on every pixel" or "update every cell in a grid," the GPU is orders of magnitude faster because it processes thousands of pixels simultaneously.

### WebGL vs. WebGPU

We have been using **WebGL** (via p5.js WEBGL mode) for GPU rendering. WebGL works but has limitations:

| Feature | WebGL | WebGPU |
|---|---|---|
| **Age** | 2011 (based on OpenGL ES) | 2023 (modern design) |
| **Compute shaders** | No (must hack with textures) | Yes (first-class support) |
| **Shader language** | GLSL (C-like) | WGSL (Rust-like) |
| **GPGPU** | Render to texture, read back | Write directly to buffers |
| **Error handling** | Silent failures | Validation layer |
| **Performance** | Good | Better (lower driver overhead) |
| **Browser support** | Everywhere | Chrome, Edge, Firefox (growing) |

### What Are Compute Shaders?

In WebGL, the only way to use the GPU is through the rendering pipeline: vertex shader -> rasterizer -> fragment shader. To do general computation (like simulating Reaction-Diffusion), you had to "abuse" the system by encoding data in pixel colors and rendering to textures.

WebGPU adds **compute shaders**: programs that run on the GPU without the rendering pipeline. You give the GPU data, tell it to run a function on every element, and read the results back. No textures, no rendering tricks.

```
WebGL GPGPU:                         WebGPU Compute:
  encode data as pixels                write data to buffer
  render quad with shader              dispatch compute shader
  shader reads/writes textures         shader reads/writes buffers
  read pixels back                     read buffer back
```

---

## Part 2: The WGSL Shader Language

WGSL (WebGPU Shading Language) is the shader language for WebGPU. It has a Rust-like syntax instead of GLSL's C-like syntax.

### WGSL vs. GLSL Quick Comparison

| Concept | GLSL | WGSL |
|---|---|---|
| Variable declaration | `float x = 1.0;` | `var x: f32 = 1.0;` |
| Constants | `const float PI = 3.14;` | `const PI: f32 = 3.14;` |
| Vector types | `vec2`, `vec3`, `vec4` | `vec2f`, `vec3f`, `vec4f` |
| Integer vector | `ivec2` | `vec2i` |
| Function definition | `float foo(float x) { return x * 2.0; }` | `fn foo(x: f32) -> f32 { return x * 2.0; }` |
| Entry point | `void main() { }` | `@compute @workgroup_size(8,8) fn main(...) { }` |
| Uniforms | `uniform float u_time;` | `@group(0) @binding(0) var<uniform> u_time: f32;` |
| Texture sampling | `texture2D(tex, uv)` | `textureSample(tex, samp, uv)` |
| Swizzling | `v.xy`, `v.rgb` | `v.xy`, `v.xy` (same) |

### Key WGSL Types

```wgsl
// Scalar types
var x: f32 = 1.0;     // 32-bit float
var i: i32 = 42;      // 32-bit signed integer
var u: u32 = 42u;     // 32-bit unsigned integer
var b: bool = true;   // boolean

// Vector types
var v2: vec2f = vec2f(1.0, 2.0);
var v3: vec3f = vec3f(1.0, 2.0, 3.0);
var v4: vec4f = vec4f(1.0, 2.0, 3.0, 4.0);

// Array type
var arr: array<f32, 10>;  // fixed-size array of 10 floats
```

### A Simple WGSL Compute Shader

```wgsl
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let index = id.x;
    data[index] = data[index] * 2.0;
}
```

This shader:

1. Declares a storage buffer `data` containing an array of floats.
2. Runs with workgroup size 64 (each workgroup processes 64 elements).
3. Each thread gets its unique `global_invocation_id` (which element to process).
4. Each thread doubles its element in the array.

---

## Part 3: The Seagulls Library

Seagulls (<https://github.com/charlieroberts/seagulls>) is a library that simplifies WebGPU for creative coding. It handles the boilerplate of creating devices, buffers, bind groups, and pipelines.

### Setting Up Seagulls

Include seagulls in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style> body { margin: 0; overflow: hidden; } </style>
</head>
<body>
    <canvas id="canvas" width="512" height="512"></canvas>
    <script type="module">
        import Seagulls from 'https://cdn.jsdelivr.net/gh/charlieroberts/seagulls@main/dist/seagulls.es.js';

        // Your code here...
    </script>
</body>
</html>
```

### Seagulls Basics

Seagulls provides a chain-based API:

```js
import Seagulls from 'seagulls';

const sg = await Seagulls.init();

sg.render(fragmentShaderCode)
  .run();
```

This creates a WebGPU context, compiles the shader, and renders a full-screen quad -- similar to ShaderToy but using WGSL instead of GLSL.

---

## Part 4: A Simple Rendering Example

Let us start with a basic fragment shader that draws a gradient:

```js
import Seagulls from 'https://cdn.jsdelivr.net/gh/charlieroberts/seagulls@main/dist/seagulls.es.js';

const frag = `
@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let uv = pos.xy / vec2f(512.0, 512.0);
    return vec4f(uv.x, uv.y, 0.5, 1.0);
}
`;

async function main() {
    const sg = await Seagulls.init();
    sg.render(frag).run();
}

main();
```

This is the WebGPU equivalent of a ShaderToy gradient. The `@builtin(position)` gives us the pixel coordinate, and we normalize it to get UV coordinates.

### Adding Time

Seagulls provides a built-in `frame` uniform:

```js
const frag = `
@group(0) @binding(0) var<uniform> frame: f32;

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let uv = pos.xy / vec2f(512.0, 512.0);
    let t = frame / 60.0;
    let r = sin(uv.x * 10.0 + t) * 0.5 + 0.5;
    let g = sin(uv.y * 10.0 + t) * 0.5 + 0.5;
    return vec4f(r, g, 0.5, 1.0);
}
`;
```

---

## Part 5: Compute Shaders with Seagulls

This is where WebGPU truly shines. We can run a compute shader that updates a data buffer, then render that buffer to the screen.

### Example: Game of Life

```js
import Seagulls from 'https://cdn.jsdelivr.net/gh/charlieroberts/seagulls@main/dist/seagulls.es.js';

const W = 512;
const H = 512;

const compute = `
@group(0) @binding(0) var<storage, read>       stateIn:  array<f32>;
@group(0) @binding(1) var<storage, read_write> stateOut: array<f32>;

fn getCell(x: i32, y: i32) -> f32 {
    let wx = (x + ${W}) % ${W};
    let wy = (y + ${H}) % ${H};
    return stateIn[wy * ${W} + wx];
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = i32(id.x);
    let y = i32(id.y);

    if (x >= ${W} || y >= ${H}) { return; }

    var neighbors: f32 = 0.0;
    neighbors += getCell(x-1, y-1);
    neighbors += getCell(x,   y-1);
    neighbors += getCell(x+1, y-1);
    neighbors += getCell(x-1, y);
    neighbors += getCell(x+1, y);
    neighbors += getCell(x-1, y+1);
    neighbors += getCell(x,   y+1);
    neighbors += getCell(x+1, y+1);

    let idx = y * ${W} + x;
    let alive = stateIn[idx];

    // Conway's rules
    if (alive > 0.5) {
        if (neighbors < 2.0 || neighbors > 3.0) {
            stateOut[idx] = 0.0; // dies
        } else {
            stateOut[idx] = 1.0; // survives
        }
    } else {
        if (neighbors > 2.5 && neighbors < 3.5) {
            stateOut[idx] = 1.0; // born
        } else {
            stateOut[idx] = 0.0; // stays dead
        }
    }
}
`;

const render = `
@group(0) @binding(0) var<storage, read> state: array<f32>;

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let idx = i32(pos.y) * ${W} + i32(pos.x);
    let v = state[idx];
    return vec4f(v, v, v, 1.0);
}
`;

async function main() {
    const sg = await Seagulls.init();

    // Initialize random state
    const initialState = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
        initialState[i] = Math.random() > 0.7 ? 1.0 : 0.0;
    }

    sg.buffer(initialState)
      .compute(compute, [W / 8, H / 8])
      .render(render)
      .run();
}

main();
```

**Key concepts in this example:**

1. **`@compute @workgroup_size(8, 8)`**: Each workgroup is an 8x8 block of threads. We dispatch `W/8` by `H/8` workgroups to cover the entire grid.
2. **Double buffering**: `stateIn` is read-only (previous frame), `stateOut` is write-only (next frame). Seagulls handles the ping-pong swap automatically.
3. **Modular wrapping**: `(x + W) % W` wraps coordinates around the edges.
4. **The render pass** reads the state buffer and displays it as grayscale pixels.

---

## Part 6: Reaction-Diffusion in WebGPU

Now let us implement the classic Reaction-Diffusion (Gray-Scott model) using seagulls. This is the GPU compute version of the simulation we previously implemented on the CPU.

### The Gray-Scott Model

Two chemicals, $A$ and $B$:

$$\frac{\partial A}{\partial t} = D_A \nabla^2 A - AB^2 + f(1 - A)$$

$$\frac{\partial B}{\partial t} = D_B \nabla^2 B + AB^2 - (k + f)B$$

where:
- $D_A, D_B$ are diffusion rates
- $f$ is the feed rate
- $k$ is the kill rate
- $\nabla^2$ is the Laplacian (how different a cell is from its neighbors)

### Seagulls Reaction-Diffusion Implementation

```js
import Seagulls from 'https://cdn.jsdelivr.net/gh/charlieroberts/seagulls@main/dist/seagulls.es.js';

const W = 512;
const H = 512;
const SIZE = W * H;

// Each cell stores two values: A and B
// We interleave them: [A0, B0, A1, B1, A2, B2, ...]

const compute = `
@group(0) @binding(0) var<storage, read>       stateIn:  array<f32>;
@group(0) @binding(1) var<storage, read_write> stateOut: array<f32>;

const W: i32 = ${W};
const H: i32 = ${H};
const dA: f32 = 1.0;
const dB: f32 = 0.5;
const feed: f32 = 0.055;
const kill: f32 = 0.062;
const dt: f32 = 1.0;

fn idx(x: i32, y: i32) -> i32 {
    let wx = (x + W) % W;
    let wy = (y + H) % H;
    return (wy * W + wx) * 2;  // *2 because we store A and B per cell
}

fn getA(x: i32, y: i32) -> f32 {
    return stateIn[idx(x, y)];
}

fn getB(x: i32, y: i32) -> f32 {
    return stateIn[idx(x, y) + 1];
}

fn laplacianA(x: i32, y: i32) -> f32 {
    var sum: f32 = 0.0;
    sum += getA(x-1, y) * 0.2;
    sum += getA(x+1, y) * 0.2;
    sum += getA(x, y-1) * 0.2;
    sum += getA(x, y+1) * 0.2;
    sum += getA(x-1, y-1) * 0.05;
    sum += getA(x+1, y-1) * 0.05;
    sum += getA(x-1, y+1) * 0.05;
    sum += getA(x+1, y+1) * 0.05;
    sum -= getA(x, y) * 1.0;
    return sum;
}

fn laplacianB(x: i32, y: i32) -> f32 {
    var sum: f32 = 0.0;
    sum += getB(x-1, y) * 0.2;
    sum += getB(x+1, y) * 0.2;
    sum += getB(x, y-1) * 0.2;
    sum += getB(x, y+1) * 0.2;
    sum += getB(x-1, y-1) * 0.05;
    sum += getB(x+1, y-1) * 0.05;
    sum += getB(x-1, y+1) * 0.05;
    sum += getB(x+1, y+1) * 0.05;
    sum -= getB(x, y) * 1.0;
    return sum;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = i32(id.x);
    let y = i32(id.y);
    if (x >= W || y >= H) { return; }

    let a = getA(x, y);
    let b = getB(x, y);
    let reaction = a * b * b;

    let newA = a + (dA * laplacianA(x, y) - reaction + feed * (1.0 - a)) * dt;
    let newB = b + (dB * laplacianB(x, y) + reaction - (kill + feed) * b) * dt;

    let i = idx(x, y);
    stateOut[i]     = clamp(newA, 0.0, 1.0);
    stateOut[i + 1] = clamp(newB, 0.0, 1.0);
}
`;

const render = `
@group(0) @binding(0) var<storage, read> state: array<f32>;

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let x = i32(pos.x);
    let y = i32(pos.y);
    let i = (y * ${W} + x) * 2;
    let a = state[i];
    let b = state[i + 1];

    // Colorize: map A and B to visual colors
    let r = a - b;
    let g = a * 0.5;
    let bl = b * 2.0;
    return vec4f(r, g, bl, 1.0);
}
`;

async function main() {
    const sg = await Seagulls.init();

    // Initialize: A=1 everywhere, B=0 everywhere, seed B in center
    const initialState = new Float32Array(SIZE * 2);
    for (let i = 0; i < SIZE; i++) {
        initialState[i * 2] = 1.0;     // A
        initialState[i * 2 + 1] = 0.0; // B
    }

    // Seed B in a small square in the center
    for (let y = H / 2 - 10; y < H / 2 + 10; y++) {
        for (let x = W / 2 - 10; x < W / 2 + 10; x++) {
            let i = (y * W + x) * 2;
            initialState[i + 1] = 1.0;
        }
    }

    sg.buffer(initialState)
      .compute(compute, [W / 8, H / 8])
      .render(render)
      .run();
}

main();
```

### Understanding the Performance Difference

| Approach | Typical FPS (512x512) | Why |
|---|---|---|
| CPU (JavaScript) | 2-5 fps | Single-threaded, millions of operations per frame |
| WebGL GPGPU (texture hack) | 60 fps | GPU parallel, but texture read/write overhead |
| WebGPU Compute | 60 fps | GPU parallel, clean buffer access, lower overhead |

The CPU version of Reaction-Diffusion struggles because it must iterate over every pixel sequentially. The GPU runs all pixels simultaneously.

---

## Part 7: WGSL Quick Reference

### Built-in Functions

```wgsl
// Math
sin(x)  cos(x)  tan(x)
asin(x) acos(x) atan(x) atan2(y, x)
pow(x, y)  exp(x)  log(x)  sqrt(x)
abs(x)  sign(x)  floor(x)  ceil(x)  round(x)
min(a, b)  max(a, b)  clamp(x, lo, hi)
mix(a, b, t)  // linear interpolation
step(edge, x)  smoothstep(lo, hi, x)
length(v)  distance(a, b)  dot(a, b)  cross(a, b)
normalize(v)
fract(x)  // fractional part

// Vector construction
vec2f(1.0, 2.0)
vec3f(1.0)       // same as vec3f(1.0, 1.0, 1.0)
vec4f(v3, 1.0)   // construct from vec3f + float
```

### Control Flow

```wgsl
// If/else
if (condition) {
    // ...
} else {
    // ...
}

// For loop
for (var i: i32 = 0; i < 10; i++) {
    // ...
}

// While loop
while (condition) {
    // ...
}
```

### Storage Qualifiers

```wgsl
var<uniform> x: f32;                    // read-only, set by CPU
var<storage, read> data: array<f32>;    // read-only buffer
var<storage, read_write> out: array<f32>; // read-write buffer
```

---

## Part 8: Why This Matters for Creative Coders

### The "GPGPU" Technique We Used Before

In previous weeks, we "abused" the color channels of textures to store non-visual data:

- R = x position
- G = y position
- B = x velocity
- A = y velocity

This works, but it is a hack. The data is limited to 8-bit values (0-255), the texture is a 2D grid of fixed size, and debugging is difficult.

### What Compute Shaders Give Us

With WebGPU compute shaders:

- Data can be **any type**: floats, integers, structs, arbitrary arrays.
- Buffers can be **any size**: not limited to texture dimensions.
- We can write to **multiple outputs**: no more cramming everything into RGBA.
- **No rendering pipeline needed**: compute shaders just process data.
- **Explicit parallelism**: we control workgroup sizes and dispatch dimensions.

This is the direction that creative coding tools are heading. p5.js is exploring WebGPU support via **p5.strands** (<https://github.com/processing/p5.js/blob/dev-2.0/contributor_docs/p5.strands.md>), and Dave Pagurek has been documenting the journey (<https://www.davepagurek.com/blog/p5-webgpu>).

---

## Exercises

1. **Gradient shader**: Write a seagulls fragment shader that creates a radial gradient (dark at edges, bright in center) that pulses over time using the frame uniform.

2. **Compute doubler**: Write a compute shader that takes an array of 1024 floats and squares each one. Display the results as a 32x32 grid of colored squares.

3. **Reaction-Diffusion parameters**: Modify the Reaction-Diffusion example to use different `feed` and `kill` values. Try: `feed=0.04, kill=0.06` (spots), `feed=0.025, kill=0.05` (stripes), `feed=0.078, kill=0.061` (worms).

4. **GLSL to WGSL translation**: Take a simple GLSL fragment shader you have written previously and translate it to WGSL syntax. Document the differences.

---

## Further Resources

- Seagulls library: <https://github.com/charlieroberts/seagulls>
- Seagulls Reaction-Diffusion demo: <https://github.com/charlieroberts/seagulls/blob/main/demos/2_reaction_diffusion/main.verbose.js>
- WebGPU specification: <https://www.w3.org/TR/webgpu/>
- WGSL specification: <https://www.w3.org/TR/WGSL/>
- Tour of WGSL: <https://google.github.io/tour-of-wgsl/>
- p5.js WebGPU exploration: <https://www.davepagurek.com/blog/p5-webgpu>
- p5.strands: <https://github.com/processing/p5.js/blob/dev-2.0/contributor_docs/p5.strands.md>
- WebGPU Report (check your browser): <https://webgpureport.org>
- Reaction-Diffusion (GPGPU solution, p5.js): <https://editor.p5js.org/kybr/sketches/hUr0l3-o0>
- Reaction-Diffusion (WebGPU/seagulls, p5.js): <https://editor.p5js.org/kybr/sketches/p0lKbTuhU>
