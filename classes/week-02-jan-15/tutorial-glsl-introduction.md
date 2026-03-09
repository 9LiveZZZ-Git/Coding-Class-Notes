# Tutorial: Introduction to GLSL Shaders in p5.js

**MAT 200C: Computing Arts -- Week 2, January 15**

---

## Overview

In this tutorial, we introduce **GLSL** (OpenGL Shading Language), a special-purpose programming language that runs on the GPU. We will learn how to use GLSL shaders inside p5.js to draw graphics at blazing speed.

We will cover:

1. What shaders are and why they exist
2. The difference between vertex shaders and fragment shaders
3. Setting up p5.js in WEBGL mode
4. Creating and loading shader objects
5. Sending data from JavaScript to GLSL with **uniforms**
6. Drawing with `quad()` in clip space
7. GLSL data types and syntax basics
8. A complete working gradient shader example

---

## What Are Shaders?

A **shader** is a small program that runs on the GPU (Graphics Processing Unit). The GPU is a massively parallel processor -- it has thousands of small cores that can all run the same program at the same time on different data.

When we write a p5.js sketch in the normal way (using `rect()`, `circle()`, `point()`, etc.), the CPU handles the drawing one operation at a time. This is fine for simple drawings, but it becomes very slow when we need to compute something for every single pixel -- like drawing a fractal.

A shader turns this around. Instead of the CPU deciding what each pixel should be, we write a tiny program that the GPU runs **once per pixel, simultaneously**. A canvas with 400x400 pixels means the GPU runs our shader program 160,000 times in parallel.

### The Tradeoff

| | p5.js (CPU) | GLSL (GPU) |
|---|---|---|
| Speed | Slow (serial) | Fast (parallel) |
| Ease of coding | Easy, familiar | Harder, unusual |
| Flexibility | Full JavaScript | Limited C-like language |
| Best for | Shapes, interaction | Per-pixel computation, effects |

As Karl notes in class: we face a tradeoff between *easy to understand but slow* (p5) and *hard to understand but fast* (GLSL).

---

## Vertex Shaders vs. Fragment Shaders

GLSL programs come in pairs. Every shader program consists of two parts:

### Vertex Shader

The **vertex shader** runs once per *vertex* (corner point) of the geometry being drawn. Its job is to determine **where** each vertex appears on screen. It transforms 3D coordinates into 2D screen positions.

For our purposes, we will draw a simple rectangle (quad) that fills the screen, so the vertex shader does very little work -- it just passes the corner positions through.

### Fragment Shader

The **fragment shader** (also called a "pixel shader") runs once per *pixel* (fragment) that the geometry covers. Its job is to determine the **color** of each pixel.

This is where the interesting work happens. The fragment shader receives the pixel's position and outputs a color. It is the fragment shader that will compute fractals, gradients, and visual effects.

### The Pipeline

```
Vertices (corners)
    |
    v
[Vertex Shader] -- positions vertices on screen
    |
    v
Rasterization   -- determines which pixels are inside the shape
    |
    v
[Fragment Shader] -- decides the color of each pixel
    |
    v
Screen pixels
```

---

## Setting Up WEBGL Mode in p5.js

To use shaders in p5.js, you must create the canvas in WEBGL mode:

```js
function setup() {
  createCanvas(400, 400, WEBGL);
}
```

The third argument `WEBGL` tells p5.js to use the GPU for rendering. Without it, shaders will not work.

---

## Creating a Shader Object

In p5.js, we create a shader from two strings: the vertex shader source code and the fragment shader source code.

```js
let s; // our shader variable

let vertexShaderSource = `
  precision highp float;
  attribute vec3 aPosition;
  varying vec2 vPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
    vPosition = gl_Position.xy;
  }
`;

let fragmentShaderSource = `
  precision highp float;
  varying vec2 vPosition;

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
  }
`;

function setup() {
  createCanvas(400, 400, WEBGL);
  s = createShader(vertexShaderSource, fragmentShaderSource);
}
```

The `createShader()` function compiles and links the two shader programs and returns a shader object you can use for drawing.

---

## Drawing with Shaders: `shader()` and `quad()`

To actually use a shader, you "bind" it with the `shader()` function, then draw geometry. The most common approach for fullscreen effects is to draw a **quad** (rectangle) that covers the entire canvas:

```js
function draw() {
  shader(s);

  // Draw a quad that fills clip space
  quad(
    -1, -1,  // bottom-left vertex
     1, -1,  // bottom-right vertex
     1,  1,  // top-right vertex
    -1,  1   // top-left vertex
  );
}
```

### What Is Clip Space?

In WEBGL mode, the coordinate system is different from the normal p5.js canvas:

- **Normal p5.js**: $(0, 0)$ is the top-left corner. $x$ goes right, $y$ goes down. Coordinates match pixel positions.
- **Clip space**: $(0, 0)$ is the *center* of the canvas. $x$ goes from $-1$ (left) to $+1$ (right). $y$ goes from $-1$ (bottom) to $+1$ (top).

When we draw `quad(-1, -1, 1, -1, 1, 1, -1, 1)`, we are drawing a rectangle that spans the entire clip space, covering every pixel of the canvas.

```
        (-1,+1) -------- (+1,+1)
           |                |
           |    (0,0)       |
           |    center      |
           |                |
        (-1,-1) -------- (+1,-1)
```

---

## Uniforms: Sending Data from JavaScript to GLSL

Shaders run on the GPU, completely separate from your JavaScript code. To send information from JavaScript to the shader, we use **uniforms**. A uniform is a variable whose value is set from JavaScript and remains constant for all pixels during a single frame.

### Setting a Uniform in JavaScript

```js
s.setUniform("time", millis() / 1000.0);
s.setUniform("mouse", [mouseX / width, mouseY / height]);
s.setUniform("resolution", [width, height]);
s.setUniform("maxIterations", 100);
```

### Receiving a Uniform in GLSL

In your fragment shader, declare the uniform with the matching name and type:

```glsl
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform int maxIterations;
```

The name must match exactly (case-sensitive). The type must match what you sent:

| JavaScript | GLSL Type | Example |
|---|---|---|
| A single number | `float` | `s.setUniform("t", 3.14)` |
| An integer | `int` | `s.setUniform("n", 100)` |
| An array of 2 | `vec2` | `s.setUniform("pos", [0.5, 0.3])` |
| An array of 3 | `vec3` | `s.setUniform("col", [1.0, 0.0, 0.5])` |
| An array of 4 | `vec4` | `s.setUniform("v", [1,2,3,4])` |

---

## GLSL Data Types

GLSL is a strongly typed language. Here are the types you will use most often:

### Scalar Types

```glsl
float x = 3.14;   // floating point number (MUST include decimal)
int n = 42;        // integer
bool flag = true;  // boolean
```

### Vector Types

```glsl
vec2 position = vec2(0.5, 0.3);         // 2D vector (x, y)
vec3 color = vec3(1.0, 0.0, 0.5);       // 3D vector (r, g, b) or (x, y, z)
vec4 pixel = vec4(1.0, 0.0, 0.5, 1.0);  // 4D vector (r, g, b, a)
```

You access components with `.x`, `.y`, `.z`, `.w` or equivalently `.r`, `.g`, `.b`, `.a`:

```glsl
vec3 c = vec3(1.0, 0.5, 0.0);
float red = c.r;     // 1.0
float green = c.g;   // 0.5

vec2 pos = vec2(3.0, 4.0);
float px = pos.x;    // 3.0
float py = pos.y;    // 4.0
```

### Swizzling

GLSL lets you rearrange vector components in a shorthand called "swizzling":

```glsl
vec4 v = vec4(1.0, 2.0, 3.0, 4.0);
vec2 a = v.xy;    // vec2(1.0, 2.0)
vec3 b = v.zyx;   // vec3(3.0, 2.0, 1.0)
vec2 c = v.ww;    // vec2(4.0, 4.0)
```

### Matrix Types

```glsl
mat2 m = mat2(1.0, 0.0,   // 2x2 matrix
              0.0, 1.0);   // (identity)

mat3 m3 = mat3(1.0);      // 3x3 identity matrix
mat4 m4 = mat4(1.0);      // 4x4 identity matrix
```

Matrices are used for transformations (rotation, scaling, etc.), but we will not need them for the Mandelbrot set.

---

## GLSL Syntax Basics

GLSL looks a lot like C. Here are the essentials:

### Variables and Assignments

```glsl
float x = 1.0;
vec2 pos = vec2(0.5, -0.3);
vec3 color = vec3(0.0);   // shorthand for vec3(0.0, 0.0, 0.0)
```

### Arithmetic

```glsl
float a = 2.0 + 3.0;      // 5.0
vec2 v = vec2(1.0, 2.0) * 3.0;  // vec2(3.0, 6.0)
vec2 w = v + vec2(1.0, 1.0);    // vec2(4.0, 7.0)
```

### Built-in Functions

```glsl
float d = length(vec2(3.0, 4.0));      // 5.0 (Pythagorean)
float d2 = distance(vec2(0.0), pos);   // distance between two points
float s = sin(3.14159);                // ~0.0
float c = cos(0.0);                    // 1.0
float m = mix(0.0, 1.0, 0.5);         // 0.5 (linear interpolation)
float cl = clamp(x, 0.0, 1.0);        // clamps x to [0, 1]
float st = step(0.5, x);              // 0.0 if x < 0.5, else 1.0
float sm = smoothstep(0.0, 1.0, x);   // smooth transition
```

### Control Flow

```glsl
if (x > 0.5) {
    color = vec3(1.0, 0.0, 0.0);
} else {
    color = vec3(0.0, 0.0, 1.0);
}

for (int i = 0; i < 100; i++) {
    // loop body
}
```

### The Fragment Shader Output

Every fragment shader must set `gl_FragColor`, a built-in `vec4` that determines the pixel's color:

```glsl
gl_FragColor = vec4(red, green, blue, alpha);
```

All values are in the range $[0.0, 1.0]$. Alpha is transparency (1.0 = fully opaque).

---

## Special GLSL Qualifiers

### `attribute`

Data that comes from the geometry (per vertex). In our vertex shader:

```glsl
attribute vec3 aPosition; // the 3D position of this vertex
```

This is provided by p5.js automatically when you call `quad()`.

### `varying`

Data passed from the vertex shader to the fragment shader. It gets interpolated smoothly across the surface of the shape:

```glsl
// In vertex shader:
varying vec2 vPosition;

// In fragment shader:
varying vec2 vPosition; // same declaration, receives interpolated value
```

### `uniform`

Data sent from JavaScript. Constant for all vertices and fragments in a single draw call:

```glsl
uniform float time;
uniform vec2 mouse;
```

### `precision`

Tells the GPU how precise floating point numbers should be:

```glsl
precision highp float; // use 32-bit floats (recommended)
```

Always put this at the top of both shaders.

---

## Complete Working Example: Color Gradient Shader

Here is a complete, working p5.js sketch with a GLSL shader that creates a color gradient based on position and animates with time. You can also interact with it using the mouse.

### sketch.js

```js
// MAT 200C - Introduction to GLSL Shaders
// A color gradient that responds to mouse position and time

let s; // shader variable

// Vertex shader: positions the quad and passes coordinates
// to the fragment shader
let vert = `
  precision highp float;

  attribute vec3 aPosition;

  varying vec2 vPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
    vPosition = gl_Position.xy;
    // vPosition will be interpolated across the quad
    // x goes from -1 to 1, y goes from -1 to 1
  }
`;

// Fragment shader: decides the color of each pixel
let frag = `
  precision highp float;

  varying vec2 vPosition;

  uniform float time;
  uniform vec2 mouse;

  void main() {
    // Normalize position to (0, 1) range
    vec2 uv = vPosition * 0.5 + 0.5;

    // Create a color based on position
    float r = uv.x;                          // red increases left to right
    float g = uv.y;                          // green increases bottom to top
    float b = sin(time) * 0.5 + 0.5;         // blue oscillates with time

    // Add a bright spot near the mouse
    float d = distance(vPosition, mouse);
    float glow = 0.05 / (d + 0.05);          // inverse distance glow

    vec3 color = vec3(r, g, b) + vec3(glow * 0.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function setup() {
  createCanvas(400, 400, WEBGL);
  s = createShader(vert, frag);
  noStroke();
}

function draw() {
  shader(s);

  // Send data from JavaScript to the shader
  s.setUniform("time", millis() / 1000.0);

  // Map mouse to clip space (-1 to 1)
  let mx = map(mouseX, 0, width, -1, 1);
  let my = map(mouseY, 0, height, 1, -1); // flip y
  s.setUniform("mouse", [mx, my]);

  // Draw a full-screen quad
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

### What This Sketch Does

1. **Vertex shader** (`vert`): Takes the quad's corner positions and passes them through. The `varying vec2 vPosition` is set to the vertex's clip-space coordinates, which the GPU interpolates smoothly across the quad's surface.

2. **Fragment shader** (`frag`): For each pixel, it:
   - Converts the position from $(-1, 1)$ to $(0, 1)$ range
   - Creates a color where red depends on horizontal position, green depends on vertical position, and blue oscillates with time
   - Adds a glowing spot near the mouse position using an inverse-distance formula

3. **JavaScript** (`setup`/`draw`): Creates the shader, sends the current time and mouse position as uniforms, and draws the quad each frame.

---

## A Second Example: Drawing Shapes with Math

The fragment shader is like a mathematical function that maps position to color. Here is a shader that draws circles and lines purely with math:

```js
let frag2 = `
  precision highp float;

  varying vec2 vPosition;
  uniform vec2 mouse;

  void main() {
    // Start with a blue background
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);

    // Draw red crosshairs (axes)
    const float thickness = 0.005;
    if (abs(vPosition.x) < thickness || abs(vPosition.y) < thickness) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }

    // Draw a yellow circle at (0.2, 0.5)
    if (distance(vec2(0.2, 0.5), vPosition) < 0.06) {
      gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    }

    // Draw a magenta circle at the mouse position
    if (distance(mouse, vPosition) < 0.06) {
      gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
  }
`;
```

This is the pattern from Karl's in-class demonstration. Each pixel asks: "Am I near an axis? Am I inside a circle?" The answers determine the pixel's color.

This approach to drawing is fundamentally different from p5.js. Instead of issuing drawing commands ("draw a circle here"), we define a **rule** that tells every pixel what color it should be based on its position.

---

## Important Differences from JavaScript

| Feature | JavaScript | GLSL |
|---|---|---|
| Types | Dynamic (`let x = 5`) | Static (`float x = 5.0`) |
| Numbers | `5` and `5.0` are the same | `5` is `int`, `5.0` is `float` -- different! |
| Strings | Yes | No |
| Arrays | Dynamic | Fixed-size only |
| Objects | Yes | No (only structs) |
| Print/debug | `console.log()` | Nothing! No output except color |
| Loops | `for`, `while`, flexible | `for` with constant bounds preferred |

---

## GLSL Gotchas

These will trip you up. Bookmark this section.

### 1. Integer vs. Float Strictness

GLSL does **not** automatically convert between `int` and `float`. This is the single most common source of errors:

```glsl
vec2 v = vec2(1, 1);       // ERROR! 1 is an int, vec2 wants floats
vec2 v = vec2(1.0, 1.0);   // correct

float x = 1;     // ERROR! 1 is an int
float x = 1.0;   // correct

int n = 4.5;     // ERROR! 4.5 is a float, n is int
int n = 4;       // correct
```

### 2. No Implicit Casting in Operations

```glsl
float x = 3.0 / 2;    // ERROR! mixing float and int
float x = 3.0 / 2.0;  // correct: 1.5
```

### 3. Error Messages

GLSL error messages appear in the browser console. They look cryptic but usually tell you the line number. A typical error:

```
ERROR: 0:12: 'vec2' : wrong operand types - no operation 'vec2' exists
that takes a left-hand operand of type 'int' and a right operand of type 'int'
```

This means on line 12, you used integers where floats were expected.

### 4. No Dynamic Loop Bounds (in some GPUs)

Some GPUs require loop bounds to be constants or uniforms:

```glsl
// May cause issues on some hardware:
for (int i = 0; i < n; i++) { ... }

// Safer if n is a uniform:
uniform int maxIter;
for (int i = 0; i < maxIter; i++) { ... }
```

---

## Summary

Here is the minimal template for using shaders in p5.js:

```js
let s;

let vert = `
  precision highp float;
  attribute vec3 aPosition;
  varying vec2 vPosition;
  void main() {
    gl_Position = vec4(aPosition, 1.0);
    vPosition = gl_Position.xy;
  }
`;

let frag = `
  precision highp float;
  varying vec2 vPosition;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // solid red
  }
`;

function setup() {
  createCanvas(400, 400, WEBGL);
  s = createShader(vert, frag);
}

function draw() {
  shader(s);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

From this template, you can build anything by modifying the fragment shader.

---

## Exercises

1. **Color by distance.** Modify the gradient shader to color each pixel based on its distance from the center. Use the `length()` function on `vPosition`.

2. **Animated rings.** Create concentric rings that pulse outward using `sin(length(vPosition) * 20.0 - time * 2.0)`.

3. **Mouse trail.** Send the mouse position as a uniform and draw a circle that follows it. Try different falloff functions (linear, quadratic, exponential).

4. **Grid pattern.** Use `fract(vPosition * 5.0)` to create a repeating tile pattern. The `fract()` function returns the fractional part of a number.

---

## References

- In-class GLSL sketches:
  - <https://editor.p5js.org/kybr/sketches/hccjXzmfA> (p5.js version)
  - <https://editor.p5js.org/kybr/sketches/XIrePE6pC> (GLSL version)
  - <https://editor.p5js.org/kybr/sketches/OZcmknk0N> (GLSL as files)
- The Book of Shaders: <https://thebookofshaders.com/>
- WebGL Reference Guide: <https://www.khronos.org/files/webgl20-reference-guide.pdf>
- ShaderToy (community gallery): <https://www.shadertoy.com/>
- Inigo Quilez (GLSL master): <https://iquilezles.org/articles/distfunctions2d>
