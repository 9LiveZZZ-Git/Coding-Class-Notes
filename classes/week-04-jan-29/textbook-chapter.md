# Chapter: Pattern Formation, Reaction-Diffusion, and Video Feedback

## MAT 200C: Computing Arts -- Week 4, January 29

---

## 1. Pattern Formation: How Nature Creates Order

### 1.1 The Mystery of Biological Pattern

One of the most striking features of the living world is its patterns. Zebras have stripes. Leopards have spots. Sunflowers have spirals. Your fingers have ridges. These patterns are not painted on by an external hand -- they emerge from within the developing organism, through chemical and physical processes acting locally.

The question that drives this chapter is: **How do simple, local interactions produce complex, global patterns?**

### 1.2 Alan Turing and Morphogenesis

In 1952, Alan Turing -- best known for his work on computation and codebreaking -- published a paper titled "The Chemical Basis of Morphogenesis." In it, he proposed that biological patterns could be explained by the interaction and diffusion of chemicals, which he called **morphogens** (shape creators).

Turing's model involves two chemicals:

- An **activator** that promotes its own production (positive feedback)
- An **inhibitor** that suppresses the activator (negative feedback)

The critical requirement: the inhibitor must **diffuse faster** than the activator. This creates a system of **local activation and long-range inhibition** -- the activator builds up locally, but the inhibitor spreads out quickly and prevents the activator from taking over everywhere.

The result is a spatial pattern: peaks of activator concentration separated by zones of inhibitor dominance. Depending on the parameters, these peaks can form spots, stripes, or more complex arrangements.

### 1.3 Why This Matters for Artists

Turing patterns are not just a scientific curiosity. They represent a fundamental creative principle: **complex form can emerge from simple, local rules without any central plan or blueprint.** This is the same principle that drives cellular automata, flocking simulations, and many generative art systems.

Understanding reaction-diffusion gives you a powerful tool for creating organic, natural-looking patterns in your computational artwork.

---

## 2. The Mathematics of Diffusion

### 2.1 What Diffusion Does

Diffusion is the process by which a substance spreads from regions of high concentration to regions of low concentration. Drop food coloring in water and watch it spread -- that is diffusion.

Mathematically, diffusion at a point depends on how the concentration at that point compares to its neighbors. If a point has higher concentration than its neighbors, concentration flows outward (the concentration decreases). If it has lower concentration, concentration flows inward (the concentration increases).

### 2.2 The Laplacian Operator

The mathematical tool that measures "how different a point is from its neighbors" is called the **Laplacian**, often written as the nabla-squared symbol. For our purposes, you do not need to know calculus. You only need to know what the Laplacian computes:

**Laplacian(point) = (sum of neighbor values) - (number of neighbors) * (value at point)**

Or equivalently, it is proportional to: **(average of neighbors) - (value at point)**

Properties:
- Laplacian > 0: the point is lower than its neighbors (concentration will increase)
- Laplacian < 0: the point is higher than its neighbors (concentration will decrease)
- Laplacian = 0: the point equals its neighbors' average (no change)

### 2.3 Discrete Laplacian on a Pixel Grid

On a 2D grid of pixels, we approximate the Laplacian using a **stencil** -- a pattern of weights applied to a cell and its neighbors.

**The 5-point stencil** uses the four direct neighbors:

```
     0    1    0
     1   -4    1
     0    1    0
```

To compute: add the four cardinal neighbors, subtract 4 times the center.

```js
function laplacian5(grid, x, y) {
  return grid[x-1][y] + grid[x+1][y] + grid[x][y-1] + grid[x][y+1]
         - 4.0 * grid[x][y];
}
```

**The 3x3 weighted stencil** includes diagonal neighbors for smoother results:

```
     0.05   0.2   0.05
     0.2   -1.0   0.2
     0.05   0.2   0.05
```

The direct neighbors get weight 0.2 and the diagonal neighbors get weight 0.05. The center gets weight -1.0. All weights sum to zero, which is required for a valid Laplacian stencil.

```js
function laplacian9(grid, x, y) {
  return grid[x-1][y-1] * 0.05 + grid[x][y-1] * 0.2 + grid[x+1][y-1] * 0.05
       + grid[x-1][y]   * 0.2  + grid[x][y]   * -1.0 + grid[x+1][y]   * 0.2
       + grid[x-1][y+1] * 0.05 + grid[x][y+1] * 0.2 + grid[x+1][y+1] * 0.05;
}
```

The 3x3 stencil is more **isotropic** -- it treats all directions more equally, producing rounder spots and curves in reaction-diffusion simulations.

### 2.4 The Diffusion Equation

With the Laplacian, the diffusion equation becomes:

```
next_value = current_value + D * laplacian(current_value) * dt
```

Where:
- `D` is the diffusion coefficient (how fast the substance spreads)
- `dt` is the time step (usually 1.0 in simple simulations)

This says: at each step, each point moves toward the average of its neighbors, at a rate proportional to D.

---

## 3. Reaction-Diffusion: The Gray-Scott Model

### 3.1 The Model

The Gray-Scott model describes two chemicals, A and B, interacting on a 2D grid:

```
A_next = A + (dA * laplacian(A) - A * B * B + feed * (1 - A)) * dt
B_next = B + (dB * laplacian(B) + A * B * B - (kill + feed) * B) * dt
```

**Breaking down each term:**

For chemical A:
- `dA * laplacian(A)`: A diffuses (spreads out)
- `-A * B * B`: A is consumed in the reaction with B
- `feed * (1 - A)`: A is replenished toward concentration 1.0

For chemical B:
- `dB * laplacian(B)`: B diffuses (but slower than A, since dB < dA)
- `+A * B * B`: B is produced by the reaction
- `-(kill + feed) * B`: B decays and is washed out

### 3.2 The Key Parameters

| Parameter | Typical Value | What It Controls |
|-----------|--------------|-----------------|
| dA | 1.0 | How fast A diffuses |
| dB | 0.5 | How fast B diffuses |
| feed (f) | 0.01 - 0.08 | How fast A is replenished |
| kill (k) | 0.04 - 0.07 | How fast B decays |

The ratio dA/dB must be greater than 1 (A must diffuse faster than B) for patterns to form. The specific pattern type depends critically on the feed and kill rates.

### 3.3 Pattern Types by Parameter Region

| Feed (f) | Kill (k) | Pattern |
|----------|----------|---------|
| 0.010 | 0.045 | Slowly dividing spots |
| 0.022 | 0.051 | Worms and stripes |
| 0.030 | 0.057 | Labyrinthine mazes |
| 0.040 | 0.060 | Holes in solid field |
| 0.055 | 0.062 | Mitosis (splitting) |
| 0.025 | 0.060 | Isolated soliton spots |
| 0.039 | 0.058 | Crawling worms |
| 0.026 | 0.052 | Coral branching |

### 3.4 Complete Implementation in p5.js

```js
let gridA, gridB, nextA, nextB;
let cols, rows;
let cellSize = 2;

let dA = 1.0;
let dB = 0.5;
let feed = 0.055;
let kill = 0.062;

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
  cols = width / cellSize;
  rows = height / cellSize;

  gridA = make2D(cols, rows, 1.0);
  gridB = make2D(cols, rows, 0.0);
  nextA = make2D(cols, rows, 0.0);
  nextB = make2D(cols, rows, 0.0);

  // Seed B in center
  let cx = floor(cols / 2);
  let cy = floor(rows / 2);
  for (let dx = -10; dx < 10; dx++)
    for (let dy = -10; dy < 10; dy++)
      if (dx*dx + dy*dy < 100)
        gridB[(cx+dx+cols)%cols][(cy+dy+rows)%rows] = 1.0;
}

function draw() {
  // Run 10 simulation steps per frame
  for (let s = 0; s < 10; s++) {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let a = gridA[x][y];
        let b = gridB[x][y];
        let lapA = lap(gridA, x, y);
        let lapB = lap(gridB, x, y);
        let abb = a * b * b;

        nextA[x][y] = constrain(a + dA * lapA - abb + feed * (1 - a), 0, 1);
        nextB[x][y] = constrain(b + dB * lapB + abb - (kill + feed) * b, 0, 1);
      }
    }
    // Swap
    [gridA, nextA] = [nextA, gridA];
    [gridB, nextB] = [nextB, gridB];
  }

  // Render
  loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let val = floor(constrain((gridA[x][y] - gridB[x][y]) * 255, 0, 255));
      for (let px = 0; px < cellSize; px++) {
        for (let py = 0; py < cellSize; py++) {
          let idx = ((y * cellSize + py) * width + x * cellSize + px) * 4;
          pixels[idx] = val;
          pixels[idx+1] = val;
          pixels[idx+2] = val;
          pixels[idx+3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function lap(grid, x, y) {
  return grid[(x-1+cols)%cols][(y-1+rows)%rows] * 0.05
       + grid[x][(y-1+rows)%rows] * 0.2
       + grid[(x+1)%cols][(y-1+rows)%rows] * 0.05
       + grid[(x-1+cols)%cols][y] * 0.2
       + grid[x][y] * -1.0
       + grid[(x+1)%cols][y] * 0.2
       + grid[(x-1+cols)%cols][(y+1)%rows] * 0.05
       + grid[x][(y+1)%rows] * 0.2
       + grid[(x+1)%cols][(y+1)%rows] * 0.05;
}

function make2D(w, h, val) {
  let a = new Array(w);
  for (let i = 0; i < w; i++) a[i] = new Array(h).fill(val);
  return a;
}

function mouseDragged() {
  let mx = floor(mouseX / cellSize);
  let my = floor(mouseY / cellSize);
  for (let dx = -3; dx <= 3; dx++)
    for (let dy = -3; dy <= 3; dy++)
      if (dx*dx+dy*dy < 9)
        gridB[(mx+dx+cols)%cols][(my+dy+rows)%rows] = 1.0;
}
```

### 3.5 Double Buffering

The simulation uses two arrays for each chemical: `gridA`/`gridB` for reading the current state and `nextA`/`nextB` for writing the next state. After computing all cells, the arrays are swapped. This ensures that every cell reads from the same "snapshot" of the current state, preventing directional artifacts that would occur if cells were updated in place.

---

## 4. Video Feedback

### 4.1 History

Video feedback was discovered almost as soon as closed-circuit television was invented. Artists and engineers noticed that pointing a camera at the monitor displaying the camera's output created swirling, fractal-like patterns. The Vasulkas, Nam June Paik, and other video artists made this effect central to their work in the 1960s and 70s.

### 4.2 Digital Video Feedback

Digital video feedback replaces the physical camera and monitor with a framebuffer and a shader:

1. The framebuffer stores the current frame
2. The shader reads the previous frame and applies a transformation
3. New content is drawn on top
4. The result becomes the next frame

### 4.3 The Scale-Rotate Transform

The core transformation in video feedback is a combined scale and rotation, implemented as a 2x2 matrix:

```glsl
vec2 scaleRotate(vec2 p, float scale, float angle) {
  float c = cos(angle) * scale;
  float s = sin(angle) * scale;
  return mat2(c, -s, s, c) * p;
}
```

This is a **rotation matrix** (preserves shape, changes orientation) combined with **uniform scaling** (changes size, preserves shape). Together, they create the spiral zoom effect characteristic of video feedback.

### 4.4 Understanding the Rotation Matrix

The 2D rotation matrix rotates a point around the origin:

```
| cos(a)  -sin(a) |   | x |     | x*cos(a) - y*sin(a) |
| sin(a)   cos(a) | * | y |  =  | x*sin(a) + y*cos(a) |
```

When you also multiply by a scale factor `s`:

```
| s*cos(a)  -s*sin(a) |   | x |
| s*sin(a)   s*cos(a) | * | y |
```

In GLSL, `mat2(c, -s, s, c)` constructs this matrix. Note that GLSL fills matrices column-by-column, so `mat2(a, b, c, d)` creates:

```
| a  c |
| b  d |
```

Which means `mat2(c, s, -s, c)` gives us `[[c, -s], [s, c]]` -- the rotation matrix. (This is a common source of confusion; double-check your matrix layout.)

### 4.5 Complete Video Feedback Shader

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_feedback;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec2 scaleRotate(vec2 p, float s, float a) {
  float cs = cos(a) * s;
  float sn = sin(a) * s;
  return mat2(cs, sn, -sn, cs) * p;
}

void main() {
  vec2 uv = vTexCoord;
  vec2 centered = uv - 0.5;

  // Scale oscillates gently
  float scale = 0.99 + 0.003 * sin(u_time * 0.5);

  // Rotation controlled by mouse X position
  float angle = (u_mouse.x - 0.5) * 0.04;

  // Transform
  centered = scaleRotate(centered, scale, angle);
  vec2 sampleUV = centered + 0.5;

  // Sample with chromatic aberration
  vec2 centered2 = uv - 0.5;
  vec2 uvR = scaleRotate(centered2, scale * 0.998, angle * 0.9) + 0.5;
  vec2 uvG = scaleRotate(centered2, scale, angle) + 0.5;
  vec2 uvB = scaleRotate(centered2, scale * 1.002, angle * 1.1) + 0.5;

  float r = texture2D(u_feedback, uvR).r * 0.98;
  float g = texture2D(u_feedback, uvG).g * 0.985;
  float b = texture2D(u_feedback, uvB).b * 0.99;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### 4.6 Feedback Design Parameters

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| Scale | Zoom direction (>1 out, <1 in) | 0.97 - 1.03 |
| Angle | Spiral rotation per frame | -0.05 to 0.05 |
| Fade | How quickly old content disappears | 0.96 - 0.995 |
| Channel separation | Chromatic aberration amount | 0.001 - 0.01 difference |

### 4.7 Exploring Functions with graphtoy.com

When designing the time-varying parameters for video feedback, graphtoy.com is an invaluable tool. It lets you type mathematical expressions and see their graphs instantly.

Useful functions to try (using `t` for time):

```
sin(t * 0.3) * 0.01 + 0.99       -- Gently pulsing scale
sin(t * 0.5) * sin(t * 0.31)     -- Complex beating pattern
exp(-mod(t, 3.0)) * 0.05         -- Periodic exponential bursts
smoothstep(0.0, 1.0, fract(t/4)) -- Smooth sawtooth ramp
```

---

## 5. Connections and Synthesis

### 5.1 Video Feedback as a Reaction-Diffusion Analog

Video feedback and reaction-diffusion produce strikingly similar visual results despite different mechanisms:

| Feature | Reaction-Diffusion | Video Feedback |
|---------|-------------------|----------------|
| Amplification | Autocatalytic reaction | Pixel brightness persists |
| Inhibition | Chemical decay/kill | Fade/attenuation |
| Spatial spread | Laplacian diffusion | Scale transformation |
| Pattern type | Determined by feed/kill | Determined by scale/rotation |

Both systems exhibit the principle of **local activation with spatial spreading**, which is why they produce similar-looking patterns (spirals, spots, stripes).

### 5.2 The 2D Rotation Matrix Revisited

The rotation matrix appears in both video feedback (transforming the UV coordinates) and in GLSL pattern creation (rotating coordinate spaces for patterns). It is one of the most fundamental operations in computer graphics:

```glsl
// Rotate point p by angle a around the origin
vec2 rotate(vec2 p, float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a)) * p;
}
```

Key properties:
- Rotation preserves distances (it is an **isometry**)
- Rotation preserves angles between lines
- Rotation is its own inverse when you negate the angle
- Combining two rotations is simply adding the angles

### 5.3 The Laplacian as a Universal Tool

The Laplacian appears in:
- **Diffusion:** Driving substance spread in reaction-diffusion
- **Edge detection:** Highlighting boundaries in images
- **Smoothing:** Blurring images (iterating the diffusion equation)
- **Sharpening:** Subtracting the Laplacian enhances edges
- **Fluid simulation:** Computing viscosity and pressure
- **Heat flow:** Modeling temperature distribution

In all cases, it measures the same thing: **how different a point is from its local average.**

---

## 6. Exercises

### Exercise 1: Parameter Exploration
Using the Gray-Scott implementation, systematically explore the feed/kill parameter space. Create at least 8 screenshots at different parameter combinations. For each, record the feed rate, kill rate, and a description of the pattern. Arrange them in a 2D grid with feed on one axis and kill on the other.

### Exercise 2: Colored Reaction-Diffusion
Modify the rendering code of the Gray-Scott implementation to map chemical concentrations to a color palette. Try mapping:
- Chemical B concentration to hue (0 = blue, 1 = red)
- Chemical A concentration to brightness
- The ratio A/B to saturation

### Exercise 3: Video Feedback Instrument
Create a video feedback sketch where mouse position controls scale (mouseX) and rotation (mouseY). Add keyboard controls: press 1-5 to change the number of "emitter" shapes drawn each frame. Spend time performing with the instrument, discovering interesting parameter combinations.

### Exercise 4: Hybrid System
Combine reaction-diffusion with video feedback: run a Gray-Scott simulation, render the result to a framebuffer, then apply a video feedback transformation before displaying. What happens when the patterns from reaction-diffusion are fed through a scale-rotate feedback loop?

### Exercise 5: The Laplacian in Image Processing
Load an image using `loadImage()` in p5.js. Apply the 5-point Laplacian stencil to each pixel. Display the result. This should produce an edge-detected version of the image. Then try subtracting the Laplacian from the original image to create a sharpened version.

### Exercise 6: Creative Seeding
In the reaction-diffusion simulation, experiment with different initial conditions:
- Seed B along a sine wave
- Seed B in a grid pattern
- Seed B using text rendered to a graphics buffer
- Seed B using the webcam feed
How do the initial conditions affect the final pattern?

### Exercise 7: Animation Documentation
Run a reaction-diffusion simulation and save a frame every N steps. Compile the frames into an animation (you can use external tools or `saveCanvas()` in p5.js). Present the animation as a short piece showing the emergence of pattern from an initial seed.

---

## 7. Further Reading and Resources

### Reaction-Diffusion
- Turing, A.M. (1952). "The Chemical Basis of Morphogenesis." *Philosophical Transactions of the Royal Society B*, 237(641), 37-72. [The original paper that started it all.]
- Karl Sims, "Reaction-Diffusion Tutorial," [karlsims.com/rd.html](http://karlsims.com/rd.html) [An excellent visual introduction to the Gray-Scott model.]
- Pearson, J.E. (1993). "Complex Patterns in a Simple System." *Science*, 261(5118), 189-192. [The paper that mapped the parameter space of the Gray-Scott model.]

### Video Feedback
- Crutchfield, J.P. (1984). "Space-Time Dynamics in Video Feedback." *Physica D*, 10(1-2), 229-245.
- The Vasulka Archive, [vasulka.org](http://www.vasulka.org/) [Historical video feedback art.]

### Mathematical Background
- graphtoy.com -- Interactive function graphing tool
- [3Blue1Brown, "But what is the Laplacian?"](https://www.youtube.com/watch?v=EW08rD-GFR0) -- Intuitive video explanation
- The Book of Shaders, [thebookofshaders.com](https://thebookofshaders.com/) -- GLSL fundamentals

### Pattern Formation in Nature
- Ball, P. (2009). *Shapes: Nature's Patterns: A Tapestry in Three Parts*. Oxford University Press.
- Murray, J.D. (2003). *Mathematical Biology*. Springer. [The definitive textbook on mathematical biology, including extensive coverage of pattern formation.]
