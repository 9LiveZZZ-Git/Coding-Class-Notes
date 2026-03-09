# Tutorial: Creating Geometric Patterns in GLSL

## MAT 200C: Computing Arts -- Week 3, January 27

---

## Introduction

In this tutorial, you will learn to create geometric patterns entirely within a GLSL fragment shader. Fragment shaders run once for every pixel on screen, which means you describe patterns using **math** rather than drawing commands. This is a fundamentally different way of thinking about image creation compared to p5.js, where you call functions like `circle()` and `rect()`.

The patterns we will build:

1. A filled circle
2. Horizontal and vertical stripes
3. A checkerboard
4. Concentric rings
5. A fan / pie pattern
6. Rotating animated patterns

All examples use the p5.js WEBGL shader system. Each example includes the complete vertex and fragment shader code, plus the p5.js sketch code needed to run it.

---

## Setup: The p5.js Shader Scaffold

Every example in this tutorial uses the same p5.js scaffold. The only thing that changes is the fragment shader source code.

```js
let myShader;

// Vertex shader -- same for all examples
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

// Fragment shader -- this is what we will change for each example
let fragSrc = `
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // solid red
}
`;

function setup() {
  createCanvas(600, 600, WEBGL);
  myShader = createShader(vertSrc, fragSrc);
}

function draw() {
  shader(myShader);
  myShader.setUniform('u_resolution', [width, height]);
  myShader.setUniform('u_time', millis() / 1000.0);
  noStroke();
  plane(width, height);
}
```

**How this works:**

- The **vertex shader** positions a full-screen quad. The line `positionVec4.xy = positionVec4.xy * 2.0 - 1.0` maps the quad's coordinates from the 0-to-1 range to the -1-to-1 range that WebGL expects.
- The **fragment shader** runs for every pixel. It receives `vTexCoord` (the texture coordinate, ranging from 0 to 1 across the quad), `u_resolution` (the canvas size in pixels), and `u_time` (elapsed time in seconds).
- The p5.js code creates the shader, sets the uniforms, and draws a plane that fills the screen.

For the rest of this tutorial, I will show only the fragment shader code. Use the scaffold above to run each example.

---

## Understanding Coordinates

### `gl_FragCoord` vs `vTexCoord`

There are two ways to know "where" the current pixel is:

- **`gl_FragCoord.xy`**: The pixel's position in window coordinates. For a 600x600 canvas, `gl_FragCoord.x` ranges from 0.5 to 599.5. This is in pixel units.
- **`vTexCoord`**: The texture coordinate passed from the vertex shader. Ranges from 0.0 to 1.0 across the quad. This is normalized and resolution-independent.

### Normalizing Coordinates

For pattern work, we usually want coordinates that are centered at the middle of the screen and have consistent proportions regardless of resolution. Here is the standard normalization:

```glsl
vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
```

**What this does:**

1. `gl_FragCoord.xy - 0.5 * u_resolution.xy` shifts the origin to the center of the screen.
2. Dividing by `u_resolution.y` (just Y, not both) ensures that circles look like circles even on non-square canvases. The Y axis ranges from -0.5 to 0.5. The X axis ranges proportionally based on aspect ratio.

Alternatively, using `vTexCoord`:

```glsl
vec2 uv = vTexCoord - 0.5;  // Center at origin, ranges from -0.5 to 0.5
```

Both approaches work. The `gl_FragCoord` method handles non-square canvases better. For a square canvas, both are equivalent.

---

## Pattern 1: Filled Circle

A circle is all the points within a certain distance from a center point.

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  // Normalize coordinates: center at (0,0), corrected for aspect ratio
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Distance from the center
  float d = length(uv);

  // If distance < radius, color white; otherwise black
  float radius = 0.3;
  float circle = step(d, radius);  // step(edge, x) returns 1.0 if x < edge... wait.

  // Actually: step(edge, x) returns 0.0 if x < edge, 1.0 if x >= edge.
  // So we use step(radius, d) to get 1.0 outside, then subtract from 1.0:
  // Or equivalently, step(d, radius) -- but step compares second arg to first.
  // Let's be clear:

  // step(a, b) = 0.0 if b < a, 1.0 if b >= a
  // We want 1.0 inside (d < radius), 0.0 outside
  float col = 1.0 - step(radius, d);

  gl_FragColor = vec4(vec3(col), 1.0);
}
```

**Key concepts:**

- `length(uv)` computes the Euclidean distance from the origin: sqrt(x*x + y*y).
- `step(edge, value)` is a built-in GLSL function that returns 0.0 if `value < edge`, and 1.0 if `value >= edge`. It creates a hard boundary.
- We use `1.0 - step(radius, d)` to get white inside and black outside.

### Soft-Edged Circle with `smoothstep`

For a smoother edge, use `smoothstep()`:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);
  float radius = 0.3;

  // smoothstep(edge0, edge1, x) returns a smooth 0-to-1 transition
  // between edge0 and edge1
  float circle = 1.0 - smoothstep(radius - 0.01, radius + 0.01, d);

  gl_FragColor = vec4(vec3(circle), 1.0);
}
```

`smoothstep(a, b, x)` returns 0.0 when `x <= a`, 1.0 when `x >= b`, and smoothly interpolates in between. The transition zone from `radius - 0.01` to `radius + 0.01` creates an anti-aliased edge.

---

## Pattern 2: Stripes

Stripes are one of the simplest repeating patterns. They use `floor()` or `fract()` to create repetition.

### Horizontal Stripes

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Multiply Y coordinate to control frequency
  float frequency = 10.0;
  float stripes = floor(mod(uv.y * frequency, 2.0));

  gl_FragColor = vec4(vec3(stripes), 1.0);
}
```

**How it works:**

1. `uv.y * frequency` stretches the Y coordinate so it cycles through values faster.
2. `mod(value, 2.0)` wraps the value to the range [0, 2).
3. `floor()` snaps that to either 0.0 or 1.0.
4. The result alternates between black (0) and white (1) in horizontal bands.

### Vertical Stripes

Simply use `uv.x` instead of `uv.y`:

```glsl
float stripes = floor(mod(uv.x * frequency, 2.0));
```

### Diagonal Stripes

Use the sum of X and Y:

```glsl
float stripes = floor(mod((uv.x + uv.y) * frequency, 2.0));
```

### Using `fract()` for Smooth Stripes

`fract(x)` returns the fractional part of `x` (the part after the decimal point). It creates a sawtooth wave that repeats from 0 to 1:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float frequency = 10.0;

  // fract gives a smooth 0-to-1 ramp that repeats
  float stripes = fract(uv.y * frequency);

  gl_FragColor = vec4(vec3(stripes), 1.0);
}
```

This creates a gradient stripe pattern -- each stripe goes smoothly from black to white.

To make sharp stripes from `fract()`, combine with `step()`:

```glsl
float stripes = step(0.5, fract(uv.y * frequency));
```

This creates stripes where the bottom half of each cell is black and the top half is white.

---

## Pattern 3: Checkerboard

A checkerboard is stripes in both directions combined.

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float frequency = 8.0;
  vec2 grid = uv * frequency;

  // For each cell, compute whether it is even or odd in each axis
  float checkX = mod(floor(grid.x), 2.0);
  float checkY = mod(floor(grid.y), 2.0);

  // XOR: if both are the same, the cell is one color; if different, the other
  // In math terms: add them and take mod 2
  float checker = mod(checkX + checkY, 2.0);

  gl_FragColor = vec4(vec3(checker), 1.0);
}
```

**How it works:**

1. `floor(grid.x)` gives the integer column index for each pixel.
2. `mod(floor(grid.x), 2.0)` determines whether that column is even (0) or odd (1).
3. Same for rows with `grid.y`.
4. Adding the two and taking `mod 2` gives us the classic checkerboard: if both are even or both are odd, the result is 0 (black). If one is even and the other odd, the result is 1 (white).

### Colored Checkerboard

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float frequency = 8.0;
  vec2 grid = uv * frequency;

  float checker = mod(floor(grid.x) + floor(grid.y), 2.0);

  vec3 color1 = vec3(0.9, 0.1, 0.2);  // Red
  vec3 color2 = vec3(0.1, 0.2, 0.9);  // Blue

  vec3 col = mix(color1, color2, checker);

  gl_FragColor = vec4(col, 1.0);
}
```

The `mix(a, b, t)` function interpolates between `a` and `b` based on `t`. When `t` is 0, you get `a`. When `t` is 1, you get `b`.

---

## Pattern 4: Concentric Rings

Concentric rings use the distance from the center, combined with a periodic function.

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);

  // Create rings using sin
  float frequency = 30.0;
  float rings = sin(d * frequency);

  // Map from [-1, 1] to [0, 1]
  rings = rings * 0.5 + 0.5;

  gl_FragColor = vec4(vec3(rings), 1.0);
}
```

**How it works:**

- `length(uv)` gives the distance from center.
- `sin(d * frequency)` creates a wave that oscillates between -1 and 1 as distance increases.
- Multiplying by 0.5 and adding 0.5 maps the range to [0, 1].
- The result is smooth concentric rings radiating from the center.

### Sharp Rings

For sharp black/white rings, apply `step()` to the sine wave:

```glsl
float rings = step(0.0, sin(d * frequency));
```

### Rings with Color

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);

  // Animated rings expanding outward
  float rings = sin(d * 30.0 - u_time * 3.0) * 0.5 + 0.5;

  // Color based on distance and time
  vec3 col = vec3(rings * 0.2, rings * 0.5, rings * 0.9);

  gl_FragColor = vec4(col, 1.0);
}
```

Subtracting `u_time * 3.0` inside the `sin()` makes the rings expand outward over time.

---

## Pattern 5: Fan / Pie Pattern

Fan patterns use the **angle** (in polar coordinates) rather than the distance.

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Convert to polar coordinates
  float angle = atan(uv.y, uv.x);  // Returns -PI to PI

  // Create fan segments
  float numSegments = 8.0;
  float fan = mod(floor(angle / (2.0 * 3.14159) * numSegments + numSegments), 2.0);

  gl_FragColor = vec4(vec3(fan), 1.0);
}
```

**How it works:**

- `atan(y, x)` returns the angle in radians from the positive X axis, ranging from -PI to PI.
- Dividing by `2*PI` normalizes to [-0.5, 0.5], then multiplying by `numSegments` and using `floor` gives us integer sector indices.
- Taking `mod 2` alternates black and white sectors.

### Combining Rings and Fans

Combine radial distance and angle patterns for more complex designs:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);
  float angle = atan(uv.y, uv.x);

  // Rings
  float rings = step(0.0, sin(d * 40.0));

  // Fan sectors
  float fan = step(0.0, sin(angle * 6.0));

  // XOR combination
  float pattern = mod(rings + fan, 2.0);

  gl_FragColor = vec4(vec3(pattern), 1.0);
}
```

This creates a striking optical pattern where rings and fan sectors interfere with each other.

---

## Pattern 6: Rotating Patterns

To rotate a pattern, rotate the UV coordinates before computing the pattern. Rotation uses a 2x2 matrix:

```glsl
vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p;
}
```

### Rotating Stripes

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Rotate the coordinate space
  uv = rotate2D(uv, u_time * 0.5);

  // Draw stripes on the rotated coordinates
  float frequency = 10.0;
  float stripes = step(0.5, fract(uv.x * frequency));

  gl_FragColor = vec4(vec3(stripes), 1.0);
}
```

The stripes rotate because we rotate the coordinate system before computing the stripe pattern. This is a general technique: **transforming the coordinate space transforms the pattern.**

---

## Pattern 7: Animated Patterns with `u_time`

Time-based animation opens up enormous creative possibilities. Here are several techniques:

### Scrolling Pattern

```glsl
// Add a time-based offset to shift the pattern
float stripes = step(0.5, fract(uv.y * 10.0 + u_time));
```

### Pulsing Scale

```glsl
// Scale the coordinate space with a sine wave
float scale = 1.0 + 0.3 * sin(u_time * 2.0);
vec2 scaledUV = uv * scale;
```

### Morphing Between Patterns

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);
  float angle = atan(uv.y, uv.x);

  // Pattern A: rings
  float patternA = sin(d * 30.0) * 0.5 + 0.5;

  // Pattern B: fan
  float patternB = sin(angle * 8.0) * 0.5 + 0.5;

  // Morph between them using time
  float t = sin(u_time * 0.5) * 0.5 + 0.5;  // oscillates 0 to 1
  float pattern = mix(patternA, patternB, t);

  gl_FragColor = vec4(vec3(pattern), 1.0);
}
```

### Complex Animated Composition

Here is a more elaborate example combining multiple techniques:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Layer 1: Rotating checkerboard
  vec2 ruv = rotate2D(uv, u_time * 0.3);
  float freq1 = 6.0;
  float check = mod(floor(ruv.x * freq1) + floor(ruv.y * freq1), 2.0);

  // Layer 2: Expanding rings
  float d = length(uv);
  float rings = sin(d * 20.0 - u_time * 4.0) * 0.5 + 0.5;

  // Layer 3: Rotating fan
  float angle = atan(uv.y, uv.x);
  float fan = sin(angle * 5.0 + u_time * 2.0) * 0.5 + 0.5;

  // Combine layers
  vec3 col = vec3(0.0);
  col.r = check * rings;
  col.g = rings * fan;
  col.b = fan * check;

  gl_FragColor = vec4(col, 1.0);
}
```

This creates a colorful, animated composition where three pattern layers (checkerboard, rings, fan) are combined into the red, green, and blue channels independently.

---

## Anemic Cinema Connection

Marcel Duchamp's 1926 film *Anemic Cinema* used rotating discs with spiral patterns to create hypnotic optical illusions. The GLSL patterns we have been building connect directly to this tradition:

- **Rotating fan patterns** are the digital equivalent of Duchamp's rotating discs.
- **Concentric rings with time offsets** create the same kind of pulsing, breathing illusions.
- **Combining angular and radial patterns** produces moire effects similar to those in the film.

Try creating your own "Anemic Cinema" disc:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);
  float angle = atan(uv.y, uv.x);

  // Spiral: combine angle and distance
  float spiral = sin(angle * 3.0 + d * 20.0 - u_time * 3.0);

  // Threshold to black and white
  float pattern = step(0.0, spiral);

  // Mask to a circle
  float mask = 1.0 - step(0.45, d);

  gl_FragColor = vec4(vec3(pattern * mask), 1.0);
}
```

This creates a rotating spiral disc reminiscent of Duchamp's work.

---

## Summary of Key GLSL Functions

| Function | What It Does | Example Use |
|----------|-------------|-------------|
| `length(v)` | Euclidean distance from origin | Circle: `length(uv) < r` |
| `distance(a, b)` | Distance between two points | Circle at a point: `distance(uv, center)` |
| `atan(y, x)` | Angle in radians (-PI to PI) | Fan/polar patterns |
| `step(edge, x)` | 0.0 if x < edge, 1.0 otherwise | Hard boundaries |
| `smoothstep(a, b, x)` | Smooth transition from 0 to 1 | Anti-aliased edges |
| `fract(x)` | Fractional part of x | Repeating sawtooth |
| `floor(x)` | Round down to integer | Grid cell index |
| `mod(x, y)` | Remainder of x/y | Wrapping, even/odd |
| `mix(a, b, t)` | Linear interpolation | Blending, morphing |
| `sin(x)`, `cos(x)` | Trigonometric functions | Waves, rotation |
| `mat2(a,b,c,d)` | 2x2 matrix | Rotation |

---

## Exercises

1. **Concentric squares.** Modify the ring pattern to use `max(abs(uv.x), abs(uv.y))` instead of `length(uv)`. This changes the distance metric from Euclidean to Chebyshev, producing square rings.

2. **Colored checkerboard.** Create a checkerboard where each square has a unique color based on its grid position. Hint: use the grid cell coordinates to generate colors.

3. **Animated spiral.** Create a spiral pattern that continuously rotates. Combine angle and distance with a time offset.

4. **Your own Anemic Cinema disc.** Design a rotating disc pattern that creates an optical illusion of depth or motion. Experiment with different numbers of spiral arms and speeds.

5. **Pattern combinations.** Layer three or more basic patterns using multiplication, addition, or `mix()`. Can you create a plaid pattern? A hexagonal grid?
