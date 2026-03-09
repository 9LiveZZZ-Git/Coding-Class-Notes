# Tutorial: Translating ShaderToy Shaders to p5.js

## MAT 200C: Computing Arts -- Week 9, March 3

---

## Overview

ShaderToy (<https://www.shadertoy.com>) is an online platform for writing and sharing GLSL fragment shaders. It has an enormous library of beautiful shader effects. However, ShaderToy uses its own conventions -- different uniform names, coordinate systems, and texture access patterns -- that do not directly work in p5.js.

In this tutorial, we will learn how to take a ShaderToy shader and translate it so it runs inside a p5.js sketch. By the end, you will be able to browse ShaderToy, find an effect you like, and port it to your own creative coding project.

We will cover:

1. How ShaderToy's coordinate system works compared to p5.js WEBGL
2. How to translate uniform names (iResolution, iTime, iMouse, etc.)
3. How fragCoord differs from gl_FragCoord
4. How to handle texture sampling differences
5. How to approach multipass shaders
6. A complete worked example from start to finish

---

## Prerequisites

- Familiarity with p5.js WEBGL mode and `createShader()`
- Basic understanding of GLSL (variables, types, functions)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: Understanding ShaderToy's Environment

When you write a shader on ShaderToy, you are writing the body of a function called `mainImage`. ShaderToy wraps your code inside a larger GLSL program. Here is what a minimal ShaderToy shader looks like:

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    fragColor = vec4(uv.x, uv.y, 0.0, 1.0);
}
```

Key things to notice:

- **`mainImage`** is the entry point, not `main`. ShaderToy defines `main` for you and calls `mainImage`.
- **`fragColor`** is an output parameter (like `gl_FragColor` but passed as an argument).
- **`fragCoord`** is the pixel coordinate of the current fragment, equivalent to `gl_FragCoord.xy`.
- **`iResolution`** is a built-in uniform containing the canvas size as a `vec3` (width, height, pixel aspect ratio).

### ShaderToy Built-In Uniforms

ShaderToy provides several built-in uniforms automatically. Here are the most important ones:

| ShaderToy Uniform | Type | Description |
|---|---|---|
| `iResolution` | `vec3` | Canvas resolution (width, height, pixel aspect ratio) |
| `iTime` | `float` | Time in seconds since the shader started |
| `iTimeDelta` | `float` | Time between the current and previous frame |
| `iFrame` | `int` | Frame counter (starts at 0) |
| `iMouse` | `vec4` | Mouse position: xy = current pos, zw = click pos |
| `iChannel0..3` | `sampler2D` | Input textures (images, videos, buffers, etc.) |
| `iChannelResolution[0..3]` | `vec3` | Resolution of each input channel |
| `iDate` | `vec4` | Year, month, day, time in seconds |

---

## Step 2: The p5.js Shader Setup

In p5.js, you write your own vertex and fragment shaders and pass uniforms manually. Here is the boilerplate structure we will use:

### Vertex Shader

This vertex shader passes texture coordinates through to the fragment shader. It works for a full-screen quad.

```glsl
// vertex shader
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

### Fragment Shader Template

```glsl
// fragment shader
precision mediump float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    // Convert vTexCoord to pixel coordinates like ShaderToy's fragCoord
    vec2 fragCoord = vTexCoord * u_resolution;

    // --- Paste translated ShaderToy code here ---

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

### p5.js Sketch

```js
let myShader;

function setup() {
    createCanvas(800, 600, WEBGL);
    noStroke();

    myShader = createShader(vertexShader, fragmentShader);
}

function draw() {
    shader(myShader);

    myShader.setUniform("u_resolution", [width, height]);
    myShader.setUniform("u_time", millis() / 1000.0);
    myShader.setUniform("u_mouse", [mouseX, mouseY]);

    rect(0, 0, width, height);
}
```

---

## Step 3: Translating Uniforms

Here is the mapping from ShaderToy uniforms to p5.js uniforms:

| ShaderToy | p5.js Uniform | Notes |
|---|---|---|
| `iResolution.xy` | `u_resolution` | Pass as `vec2` via `setUniform("u_resolution", [width, height])` |
| `iTime` | `u_time` | Pass as `float` via `setUniform("u_time", millis() / 1000.0)` |
| `iMouse.xy` | `u_mouse` | Pass as `vec2` via `setUniform("u_mouse", [mouseX, mouseY])` |
| `iFrame` | `u_frame` | Maintain a counter: `setUniform("u_frame", frameCount)` |
| `iChannel0` | `u_texture0` | Pass as `sampler2D` via `setUniform("u_texture0", myImage)` |

In your fragment shader, declare these uniforms:

```glsl
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform int u_frame;
uniform sampler2D u_texture0;
```

### Mouse Coordinate Differences

ShaderToy's `iMouse` has a special convention:

- `iMouse.xy` holds the current mouse position **in pixels**, with the origin at the **bottom-left** (y increases upward).
- `iMouse.zw` holds the position where the mouse was last clicked.

In p5.js, `mouseX` and `mouseY` have the origin at the **top-left** (y increases downward). To match ShaderToy's convention, flip the y-axis:

```js
myShader.setUniform("u_mouse", [mouseX, height - mouseY]);
```

---

## Step 4: Coordinate System Differences

This is the most common source of bugs when translating shaders.

### ShaderToy Coordinates

In ShaderToy:

- `fragCoord.xy` gives pixel coordinates.
- The origin `(0, 0)` is at the **bottom-left** corner of the canvas.
- `fragCoord.x` goes from `0` to `iResolution.x`.
- `fragCoord.y` goes from `0` to `iResolution.y`.

### p5.js Coordinates

In p5.js WEBGL mode with our vertex shader:

- `vTexCoord` gives normalized coordinates from `(0, 0)` to `(1, 1)`.
- The origin `(0, 0)` is at the **top-left** corner.
- To get pixel-space coordinates like ShaderToy, compute: `vec2 fragCoord = vTexCoord * u_resolution;`
- **But** the y-axis is flipped compared to ShaderToy.

### Fixing the Y-Axis

To match ShaderToy's bottom-left origin, flip the y-coordinate:

```glsl
vec2 fragCoord = vTexCoord * u_resolution;
fragCoord.y = u_resolution.y - fragCoord.y;  // flip Y to match ShaderToy
```

Or equivalently:

```glsl
vec2 uv = vTexCoord;
uv.y = 1.0 - uv.y;  // flip Y in normalized coordinates
vec2 fragCoord = uv * u_resolution;
```

---

## Step 5: Translating `mainImage` to `main`

ShaderToy shaders use `mainImage(out vec4 fragColor, in vec2 fragCoord)`. In p5.js, the entry point is `void main()` and you write to `gl_FragColor`. Here is the mechanical translation:

**ShaderToy:**

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
    fragColor = vec4(col, 1.0);
}
```

**p5.js Fragment Shader:**

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 fragCoord = vTexCoord * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;

    vec2 uv = fragCoord / u_resolution;
    vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(col, 1.0);
}
```

The translation recipe:

1. Replace `iResolution` with `u_resolution` (and note it is `vec2`, not `vec3`).
2. Replace `iTime` with `u_time`.
3. Replace `iMouse` with `u_mouse`.
4. Replace `fragColor = ...` with `gl_FragColor = ...`.
5. Compute `fragCoord` from `vTexCoord * u_resolution` at the top of `main()`.
6. Flip the y-axis.
7. Add `precision mediump float;` at the top.
8. Declare all uniforms.

---

## Step 6: Texture Sampling Differences

### ShaderToy Textures

In ShaderToy, textures are accessed via `iChannel0`, `iChannel1`, etc.:

```glsl
vec4 color = texture(iChannel0, uv);
```

ShaderToy uses `texture()` (GLSL 300 es style). In p5.js (WebGL 1.0 / GLSL ES 1.0), you must use `texture2D()`:

```glsl
vec4 color = texture2D(u_texture0, uv);
```

### Passing Textures from p5.js

```js
let img;

function preload() {
    img = loadImage("myimage.jpg");
}

function draw() {
    shader(myShader);
    myShader.setUniform("u_texture0", img);
    // ...
}
```

You can also pass a framebuffer, a video capture, or another canvas as a texture:

```js
myShader.setUniform("u_texture0", fbo);      // a createFramebuffer()
myShader.setUniform("u_texture0", video);     // a createCapture()
myShader.setUniform("u_texture0", pg);        // a createGraphics()
```

### Texture Coordinate Convention

ShaderToy samples textures with normalized coordinates `(0, 0)` to `(1, 1)`, where `(0, 0)` is the bottom-left. In p5.js, `(0, 0)` is the top-left. If the ported shader looks upside down, flip the y-coordinate before sampling:

```glsl
vec2 sampleUV = vec2(uv.x, 1.0 - uv.y);
vec4 color = texture2D(u_texture0, sampleUV);
```

---

## Step 7: Adapting Multipass Shaders

Some ShaderToy shaders use multiple passes. On ShaderToy, these are called **Buffer A**, **Buffer B**, **Buffer C**, **Buffer D**, and the final **Image** pass. Each buffer renders to a texture that other passes can read.

In p5.js, you implement multipass shaders using **framebuffers**.

### The Pattern

```js
let bufferA, bufferB;
let shaderA, shaderB, shaderImage;

function setup() {
    createCanvas(800, 600, WEBGL);
    noStroke();

    bufferA = createFramebuffer({ format: FLOAT });
    bufferB = createFramebuffer({ format: FLOAT });

    shaderA = createShader(vertSrc, fragSrcA);
    shaderB = createShader(vertSrc, fragSrcB);
    shaderImage = createShader(vertSrc, fragSrcImage);
}

function draw() {
    // Pass A: render into bufferA, reading from bufferB
    bufferA.begin();
    shader(shaderA);
    shaderA.setUniform("u_resolution", [width, height]);
    shaderA.setUniform("u_time", millis() / 1000.0);
    shaderA.setUniform("iChannel0", bufferA);  // self-feedback
    shaderA.setUniform("iChannel1", bufferB);
    rect(0, 0, width, height);
    bufferA.end();

    // Pass B: render into bufferB, reading from bufferA
    bufferB.begin();
    shader(shaderB);
    shaderB.setUniform("u_resolution", [width, height]);
    shaderB.setUniform("u_time", millis() / 1000.0);
    shaderB.setUniform("iChannel0", bufferA);
    rect(0, 0, width, height);
    bufferB.end();

    // Final Image pass: render to screen
    shader(shaderImage);
    shaderImage.setUniform("u_resolution", [width, height]);
    shaderImage.setUniform("u_time", millis() / 1000.0);
    shaderImage.setUniform("iChannel0", bufferA);
    rect(0, 0, width, height);
}
```

### Key Points for Multipass Translation

1. **Each ShaderToy buffer becomes a `createFramebuffer()`** in p5.js.
2. **Self-referencing buffers** (where Buffer A reads from iChannel0 = Buffer A) work because framebuffers ping-pong internally.
3. **The Image tab** on ShaderToy becomes the final shader pass that renders to the screen.
4. **Order matters**: render buffers in the same order as ShaderToy processes them.
5. Use `{ format: FLOAT }` for framebuffers if the shader stores non-color data (positions, velocities, etc.) in the RGBA channels.

---

## Step 8: Common GLSL Compatibility Issues

### `texture` vs `texture2D`

ShaderToy uses GLSL 300 es, which uses `texture()`. p5.js uses WebGL 1.0 (GLSL ES 1.0), which uses `texture2D()`.

```glsl
// ShaderToy
vec4 c = texture(iChannel0, uv);

// p5.js
vec4 c = texture2D(u_texture0, uv);
```

### Integer vs Float Strictness

GLSL is strict about types. A common issue when translating:

```glsl
// This will ERROR in GLSL ES:
float x = 1;       // WRONG: 1 is an int
float x = 1.0;     // CORRECT

vec3 c = vec3(0);   // WRONG in some implementations
vec3 c = vec3(0.0); // CORRECT
```

### Missing Functions

Some GLSL functions available in ShaderToy (GLSL 300 es) do not exist in GLSL ES 1.0:

| ShaderToy (300 es) | p5.js (ES 1.0) Replacement |
|---|---|
| `texelFetch(tex, ivec2(x,y), 0)` | `texture2D(tex, vec2(x,y) / u_resolution)` |
| `round(x)` | `floor(x + 0.5)` |
| `trunc(x)` | `sign(x) * floor(abs(x))` |
| `tanh(x)` | `(exp(x) - exp(-x)) / (exp(x) + exp(-x))` |

---

## Complete Worked Example

Let us translate a real ShaderToy effect step by step. We will use a plasma effect.

### Original ShaderToy Code

```glsl
// ShaderToy: Simple Plasma
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float t = iTime;

    float v1 = sin(uv.x * 10.0 + t);
    float v2 = sin(uv.y * 10.0 + t);
    float v3 = sin(uv.x * 10.0 + uv.y * 10.0 + t);
    float v4 = sin(length(uv - 0.5) * 20.0 - t * 2.0);

    float v = (v1 + v2 + v3 + v4) / 4.0;

    vec3 col;
    col.r = sin(v * 3.14159) * 0.5 + 0.5;
    col.g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(v * 3.14159 + 4.188) * 0.5 + 0.5;

    fragColor = vec4(col, 1.0);
}
```

### Translated p5.js Sketch

Save this as your `sketch.js`:

```js
let plasmaShader;

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
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Compute fragCoord from vTexCoord (flip Y to match ShaderToy)
    vec2 fragCoord = vTexCoord * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;

    // --- Translated ShaderToy code ---
    vec2 uv = fragCoord / u_resolution;

    float t = u_time;

    float v1 = sin(uv.x * 10.0 + t);
    float v2 = sin(uv.y * 10.0 + t);
    float v3 = sin(uv.x * 10.0 + uv.y * 10.0 + t);
    float v4 = sin(length(uv - 0.5) * 20.0 - t * 2.0);

    float v = (v1 + v2 + v3 + v4) / 4.0;

    vec3 col;
    col.r = sin(v * 3.14159) * 0.5 + 0.5;
    col.g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(v * 3.14159 + 4.188) * 0.5 + 0.5;

    gl_FragColor = vec4(col, 1.0);
}
`;

function setup() {
    createCanvas(800, 600, WEBGL);
    noStroke();
    plasmaShader = createShader(vertSrc, fragSrc);
}

function draw() {
    shader(plasmaShader);
    plasmaShader.setUniform("u_resolution", [width, height]);
    plasmaShader.setUniform("u_time", millis() / 1000.0);
    rect(0, 0, width, height);
}
```

### What Changed

1. **`mainImage(out vec4 fragColor, in vec2 fragCoord)`** became **`void main()`**.
2. **`fragColor = ...`** became **`gl_FragColor = ...`**.
3. **`iResolution`** became **`u_resolution`** (declared as `uniform vec2`).
4. **`iTime`** became **`u_time`** (declared as `uniform float`).
5. **`fragCoord`** is now computed from `vTexCoord * u_resolution` with a Y-flip.
6. We added `precision mediump float;` at the top of the fragment shader.
7. We added the standard vertex shader for a full-screen quad.
8. In the p5.js sketch, we pass uniforms with `setUniform()`.

---

## Quick Reference: Translation Checklist

When translating any ShaderToy shader to p5.js, follow this checklist:

- [ ] Create vertex shader boilerplate (full-screen quad)
- [ ] Add `precision mediump float;` to fragment shader
- [ ] Replace `mainImage(out vec4 fragColor, in vec2 fragCoord)` with `void main()`
- [ ] Compute `fragCoord` from `vTexCoord * u_resolution`
- [ ] Flip Y: `fragCoord.y = u_resolution.y - fragCoord.y`
- [ ] Replace `fragColor` with `gl_FragColor`
- [ ] Replace `iResolution` with `u_resolution` (as `vec2`)
- [ ] Replace `iTime` with `u_time`
- [ ] Replace `iMouse` with `u_mouse` (and flip mouseY in JS)
- [ ] Replace `texture(iChannelN, uv)` with `texture2D(u_textureN, uv)`
- [ ] Replace integer literals with float literals (`0` to `0.0`, `1` to `1.0`)
- [ ] Check for unsupported functions (`texelFetch`, `round`, `tanh`)
- [ ] For multipass: create one `createFramebuffer()` per ShaderToy buffer
- [ ] Set all uniforms in `draw()` with `setUniform()`

---

## Further Resources

- ShaderToy: <https://www.shadertoy.com>
- The Book of Shaders: <https://thebookofshaders.com>
- p5.js Shader Reference: <https://p5js.org/reference/p5/createShader/>
- Example translation (Retro Video Feedback): ShaderToy <https://www.shadertoy.com/view/ddf3zl> translated to p5.js <https://editor.p5js.org/erennie97/sketches/V1KPqUih1>
