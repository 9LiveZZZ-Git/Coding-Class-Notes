# Chapter: GLSL Pattern Creation and Cellular Automata

## MAT 200C: Computing Arts -- Week 3, January 27

---

## 1. Introduction

This chapter brings together two powerful creative computing techniques: **GLSL pattern generation** and **cellular automata**. At first glance, these may seem unrelated -- one is about drawing with math on the GPU, the other is about simulating grids of cells on the CPU. But they share a deep connection: both generate complex visual output from simple, local rules applied uniformly across space.

In GLSL, each pixel computes its color independently using a mathematical function of its position. In a cellular automaton, each cell computes its next state independently using a rule based on its neighbors. Both are massively parallel, and both demonstrate that richness can emerge from simplicity.

---

## 2. GLSL Pattern Fundamentals

### 2.1 The Fragment Shader Mindset

In a fragment shader, you do not "draw" shapes in the imperative sense ("draw a circle here, draw a line there"). Instead, you write a function that answers one question for every pixel: **"What color should I be?"**

The shader runs simultaneously for all pixels. Each pixel knows only its own coordinates. It cannot ask what color its neighbor is (in most cases). The entire pattern must be described as a mathematical function of position.

This constraint is also a superpower: because every pixel is independent, the GPU can compute them all in parallel, achieving real-time performance even for complex patterns at high resolutions.

### 2.2 Coordinate Systems

The first step in any shader pattern is establishing a coordinate system. Raw pixel coordinates (`gl_FragCoord.xy`) range from 0 to the canvas width/height, which is awkward for mathematical patterns. We normalize:

```glsl
// Center at origin, aspect-ratio corrected
vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
```

After this transformation:
- The center of the screen is (0, 0)
- The top and bottom edges are at y = +0.5 and y = -0.5
- The left and right edges depend on the aspect ratio

For a square canvas, this gives a coordinate range of [-0.5, 0.5] in both axes.

### 2.3 Distance and Angle: The Polar Toolkit

Two operations form the foundation of most patterns:

**Distance from a point:**
```glsl
float d = length(uv);              // distance from origin
float d = distance(uv, somePoint); // distance from any point
```

**Angle from a point:**
```glsl
float angle = atan(uv.y, uv.x);   // returns -PI to PI
```

Together, these convert Cartesian coordinates (x, y) to polar coordinates (distance, angle), which are natural for circular and radial patterns.

---

## 3. Building Patterns

### 3.1 Circles

A filled circle is defined by a distance threshold:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float d = length(uv);
  float circle = 1.0 - smoothstep(0.25, 0.26, d);
  gl_FragColor = vec4(vec3(circle), 1.0);
}
```

The `smoothstep(0.25, 0.26, d)` creates an anti-aliased edge over a 0.01-unit transition zone.

### 3.2 Stripes

Stripes use periodic functions to create repetition:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Sharp stripes using floor and mod
  float freq = 12.0;
  float stripe = mod(floor(uv.y * freq), 2.0);

  gl_FragColor = vec4(vec3(stripe), 1.0);
}
```

**Key insight:** `floor(uv.y * freq)` converts the smooth Y coordinate into an integer "band index." Taking `mod 2` alternates between 0 and 1. This is the fundamental mechanism behind all discrete repeating patterns.

**Variations:**
- `uv.x` for vertical stripes
- `uv.x + uv.y` for diagonal stripes
- `sin(uv.y * freq * 6.28) * 0.5 + 0.5` for smooth gradient stripes

### 3.3 Checkerboard

The checkerboard combines stripes in both dimensions using a parity check:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float freq = 8.0;

  // Integer grid cell coordinates
  float cellX = floor(uv.x * freq);
  float cellY = floor(uv.y * freq);

  // Parity: even+even or odd+odd = same color, even+odd = opposite
  float checker = mod(cellX + cellY, 2.0);

  gl_FragColor = vec4(vec3(checker), 1.0);
}
```

This works because adding two even numbers or two odd numbers always gives an even number, while adding an even and an odd number gives an odd number. The `mod 2` extracts this parity.

### 3.4 Concentric Rings

Rings combine distance with periodic functions:

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);

  // Smooth rings
  float rings = sin(d * 40.0 - u_time * 2.0) * 0.5 + 0.5;

  gl_FragColor = vec4(vec3(rings), 1.0);
}
```

Subtracting `u_time` inside the `sin()` makes the rings appear to expand outward continuously.

### 3.5 Fan (Angular) Patterns

Fan patterns use the angle in polar coordinates:

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float angle = atan(uv.y, uv.x); // -PI to PI

  // Create fan segments
  float segments = 10.0;
  float fan = sin(angle * segments + u_time) * 0.5 + 0.5;

  gl_FragColor = vec4(vec3(fan), 1.0);
}
```

### 3.6 Combining Patterns

Patterns can be combined through arithmetic operations:

- **Multiplication** creates intersection-like effects (both patterns must be bright)
- **Addition** creates union-like effects (either pattern contributes brightness)
- **`mix()`** blends between two patterns based on a third value
- **`mod(a + b, 2.0)`** creates XOR-like alternating effects

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float d = length(uv);
  float angle = atan(uv.y, uv.x);

  // Rings
  float rings = step(0.0, sin(d * 30.0 - u_time * 2.0));

  // Fan
  float fan = step(0.0, sin(angle * 8.0 + u_time));

  // XOR creates a complex interference pattern
  float pattern = mod(rings + fan, 2.0);

  // Color
  vec3 col = vec3(pattern * 0.3, pattern * 0.6, pattern);

  gl_FragColor = vec4(col, 1.0);
}
```

### 3.7 Rotation

Rotation transforms the coordinate space before computing the pattern:

```glsl
vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p;
}
```

The 2x2 matrix `mat2(c, -s, s, c)` is the standard rotation matrix. It rotates a point around the origin by the given angle.

```glsl
// Rotating checkerboard
vec2 ruv = rotate2D(uv, u_time * 0.5);
float checker = mod(floor(ruv.x * 8.0) + floor(ruv.y * 8.0), 2.0);
```

---

## 4. Cellular Automata

### 4.1 Definition and Components

A cellular automaton is a discrete computational system with four components:

1. **Lattice:** A regular grid of cells (1D, 2D, or higher)
2. **States:** A finite set of possible values for each cell
3. **Neighborhood:** A fixed pattern defining which cells influence each cell
4. **Transition rule:** A function that computes a cell's next state from its neighborhood's current states

All cells update simultaneously (synchronously).

### 4.2 One-Dimensional Elementary CAs

The simplest CAs are one-dimensional with two states and a 3-cell neighborhood. Stephen Wolfram numbered all 256 such rules and exhaustively cataloged their behavior.

**Rule encoding:** A rule number (0-255) is an 8-bit number where each bit specifies the output for one of the 8 possible 3-cell neighborhoods.

```js
// Convert rule number to lookup table
function ruleToTable(ruleNum) {
  let table = new Array(8);
  for (let i = 0; i < 8; i++) {
    table[i] = (ruleNum >> i) & 1;
  }
  return table;
}
```

**Implementation:**

```js
let cells, nextCells;
let ruleNum = 90;  // Sierpinski triangle
let ruleTable;
let cellSize = 3;
let cols;
let gen = 0;

function setup() {
  createCanvas(900, 600);
  background(255);
  cols = floor(width / cellSize);
  cells = new Array(cols).fill(0);
  nextCells = new Array(cols).fill(0);
  cells[floor(cols / 2)] = 1;
  ruleTable = ruleToTable(ruleNum);
  drawRow(0);
}

function draw() {
  if (gen * cellSize >= height) { noLoop(); return; }

  for (let i = 0; i < cols; i++) {
    let L = cells[(i - 1 + cols) % cols];
    let C = cells[i];
    let R = cells[(i + 1) % cols];
    let idx = L * 4 + C * 2 + R;
    nextCells[i] = ruleTable[idx];
  }

  let temp = cells;
  cells = nextCells;
  nextCells = temp;
  gen++;
  drawRow(gen);
}

function drawRow(row) {
  let y = row * cellSize;
  for (let i = 0; i < cols; i++) {
    fill(cells[i] === 1 ? 0 : 255);
    noStroke();
    rect(i * cellSize, y, cellSize, cellSize);
  }
}

function ruleToTable(num) {
  let t = new Array(8);
  for (let i = 0; i < 8; i++) t[i] = (num >> i) & 1;
  return t;
}
```

### 4.3 Notable Rules

| Rule | Class | Behavior |
|------|-------|----------|
| 0 | 1 | All cells die |
| 30 | 3 | Chaotic, used as PRNG |
| 54 | 4 | Complex structures |
| 90 | 2 | Sierpinski triangle |
| 110 | 4 | Turing complete |
| 184 | 2 | Traffic flow model |
| 255 | 1 | All cells live |

### 4.4 Conway's Game of Life

The Game of Life operates on a 2D grid with the Moore neighborhood (8 surrounding cells). Its rules:

- **Birth:** Dead cell with exactly 3 live neighbors becomes alive
- **Survival:** Live cell with 2 or 3 live neighbors stays alive
- **Death:** All other live cells die

```js
let grid, next;
let cols, rows;
let res = 6;

function setup() {
  createCanvas(600, 600);
  cols = floor(width / res);
  rows = floor(height / res);
  grid = make2D(cols, rows);
  next = make2D(cols, rows);

  for (let x = 0; x < cols; x++)
    for (let y = 0; y < rows; y++)
      grid[x][y] = floor(random(2));

  frameRate(12);
}

function draw() {
  background(30);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(220);
        noStroke();
        rect(x * res, y * res, res, res);
      }
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let n = neighbors(grid, x, y);
      if (grid[x][y] === 1) {
        next[x][y] = (n === 2 || n === 3) ? 1 : 0;
      } else {
        next[x][y] = (n === 3) ? 1 : 0;
      }
    }
  }

  let tmp = grid; grid = next; next = tmp;
}

function make2D(w, h) {
  let a = new Array(w);
  for (let i = 0; i < w; i++) a[i] = new Array(h).fill(0);
  return a;
}

function neighbors(g, x, y) {
  let sum = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      sum += g[(x + dx + cols) % cols][(y + dy + rows) % rows];
    }
  return sum;
}
```

### 4.5 Emergent Structures in Life

The Game of Life produces a rich taxonomy of structures:

**Still lifes** are patterns that remain unchanged:
```
Block:    Beehive:    Loaf:
XX        .XX.        .XX.
XX        X..X        X..X
          .XX.        .X.X
                      ..X.
```

**Oscillators** cycle through a sequence of states:
```
Blinker (period 2):
Phase 1:  Phase 2:
.X.       ...
.X.       XXX
.X.       ...
```

**Spaceships** move across the grid:
```
Glider (moves diagonally):
.X.
..X
XXX
```

These structures are not programmed -- they are discovered. The rules say nothing about gliders or blinkers. These patterns emerge from the interaction of the four simple rules.

### 4.6 Wolfram's Four Classes (Revisited)

Wolfram's classification applies to CAs in general, not just 1D rules:

| Class | Behavior | Analog | Example |
|-------|----------|--------|---------|
| 1 | Uniform | Solid crystal | Rule 0 |
| 2 | Periodic | Repeating wallpaper | Rule 90 |
| 3 | Chaotic | Static on a TV | Rule 30 |
| 4 | Complex | Living system | Rule 110, Life |

Class 4 is often described as being at the "edge of chaos" -- balanced between the rigidity of Class 2 and the disorder of Class 3. This balance enables computation and the emergence of complex structures.

### 4.7 SmoothLife and Continuous CAs

SmoothLife (Rafler, 2011) extends the Game of Life to continuous space and continuous states:

- Cells can have any value between 0.0 and 1.0
- Neighborhoods are defined by circular regions with inner and outer radii
- Birth and survival thresholds use smooth sigmoid functions instead of hard cutoffs

The result is organic, blob-like patterns that resemble biological processes: cell division, growth, and movement. SmoothLife demonstrates that the principles of cellular automata extend beyond discrete grids.

---

## 5. Connections Between GLSL Patterns and Cellular Automata

### 5.1 Parallel Computation

Both GLSL shaders and CAs are fundamentally parallel: every pixel/cell computes independently based on local information. In GLSL, each pixel uses its coordinates. In a CA, each cell uses its neighbors' states.

### 5.2 Implementing CAs in GLSL

Cellular automata can be implemented directly in GLSL using framebuffer feedback:

1. Store the CA state as a texture (each pixel represents a cell)
2. In the fragment shader, sample the neighbors from the previous frame's texture
3. Apply the CA rule to compute the new state
4. Write the result to the framebuffer

This moves the computation to the GPU, enabling enormous grid sizes at real-time speeds. The Game of Life, in particular, maps naturally to fragment shaders.

```glsl
precision mediump float;
uniform sampler2D u_state;    // Previous frame
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 pixel = 1.0 / u_resolution;

  // Count live neighbors
  float n = 0.0;
  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      if (dx == 0 && dy == 0) continue;
      vec2 neighborUV = uv + vec2(float(dx), float(dy)) * pixel;
      n += texture2D(u_state, neighborUV).r;
    }
  }

  float current = texture2D(u_state, uv).r;

  // Game of Life rules
  float alive = 0.0;
  if (current > 0.5 && (n > 1.5 && n < 3.5)) alive = 1.0; // Survive
  if (current < 0.5 && (n > 2.5 && n < 3.5)) alive = 1.0; // Birth

  gl_FragColor = vec4(vec3(alive), 1.0);
}
```

Note the use of floating-point comparisons (e.g., `n > 1.5` instead of `n >= 2`) to handle potential precision issues.

---

## 6. Live GLSL Editors

Several online tools let you write and run GLSL shaders in your browser without any setup:

- **Shadertoy** ([shadertoy.com](https://www.shadertoy.com)): The most popular shader playground. Thousands of shared shaders. Uses `mainImage(out vec4 fragColor, in vec2 fragCoord)` as the entry point. Supports multi-pass rendering (Buffer A, B, etc.) which is perfect for CAs.

- **The Book of Shaders Editor** ([editor.thebookofshaders.com](https://editor.thebookofshaders.com)): A simpler editor designed for learning. Uses standard `void main()` with `gl_FragColor`.

- **GLSL Sandbox** ([glslsandbox.com](https://glslsandbox.com)): Another live editor with a gallery of community creations.

- **KodeLife**: A desktop application for live shader coding with features like MIDI input and multi-pass rendering.

These tools are invaluable for experimentation. You can see changes instantly as you type, which makes learning GLSL much faster than a traditional compile-run cycle.

---

## 7. Exercises

### GLSL Exercises

**Exercise 1: Dot Grid**
Create a shader that draws a grid of dots (circles). Each dot should be at the center of a grid cell. Hint: use `fract()` to repeat the coordinate space, then draw a circle in each cell.

```glsl
// Starting hint:
vec2 cell = fract(uv * 8.0) - 0.5;  // Repeating cells, centered
float dot = length(cell);            // Distance from cell center
```

**Exercise 2: Wave Pattern**
Create a pattern where stripes undulate like waves. Use `sin(uv.x * someFrequency)` to offset `uv.y` before computing the stripe pattern.

**Exercise 3: Moire Pattern**
Create two sets of concentric rings centered at slightly different points. When they overlap, you will see a moire interference pattern.

### Cellular Automata Exercises

**Exercise 4: Rule Explorer**
Modify the 1D CA implementation to accept a rule number from user input (use `createInput()` in p5.js). Systematically explore rules and classify them according to Wolfram's four classes. Record your findings.

**Exercise 5: Interactive Game of Life**
Add these interactive features to the Game of Life implementation:
- Press SPACE to pause/resume
- Click and drag to toggle cells while paused
- Press R to randomize the grid
- Press C to clear the grid

**Exercise 6: CA on the GPU**
Implement the Game of Life as a GLSL shader using framebuffer feedback. Initialize with random values and observe the evolution. Compare the performance to the CPU version.

**Exercise 7: Life-like Automata**
The Game of Life is just one member of a family of "Life-like" automata. These use the same neighborhood but different birth/survival rules, noted as B.../S...:
- B3/S23: Standard Game of Life
- B36/S23: "HighLife" (produces replicators)
- B2/S: "Seeds" (chaotic growth)
- B3678/S34678: "Day & Night" (symmetric)

Implement a system where the birth and survival rules can be changed via parameters. Explore different rule combinations.

---

## 8. Summary

This chapter covered two approaches to generating complex visual patterns:

**GLSL shaders** use mathematical functions to determine the color of each pixel based on its position. Key techniques include distance functions for circles and rings, periodic functions (floor, fract, mod, sin) for stripes and grids, polar coordinates (atan) for angular patterns, and rotation matrices for transforming the coordinate space. Shaders run in parallel on the GPU and produce results instantaneously.

**Cellular automata** use discrete grids where each cell updates based on its neighbors' states. Despite extremely simple rules, CAs can produce chaotic behavior (Rule 30), universal computation (Rule 110), and rich emergent structures (Game of Life). The four-class classification -- uniform, periodic, chaotic, complex -- provides a framework for understanding the space of possible behaviors.

Both approaches demonstrate the same profound principle: **complex, beautiful, and surprising behavior can emerge from simple rules applied uniformly across space.**

---

## References

- Wolfram, S. (2002). *A New Kind of Science*. Wolfram Media.
- Gardner, M. (1970). "The fantastic combinations of John Conway's new solitaire game 'life'." *Scientific American*, 223(4), 120-123.
- Rafler, S. (2011). "Generalization of Conway's 'Game of Life' to a continuous domain - SmoothLife." arXiv:1111.1567.
- The Book of Shaders, [thebookofshaders.com](https://thebookofshaders.com/)
- Shadertoy, [shadertoy.com](https://www.shadertoy.com/)
