# Tutorial: Implementing Gray-Scott Reaction-Diffusion in p5.js

## MAT 200C: Computing Arts -- Week 4, January 29

---

## Introduction

Reaction-diffusion systems are mathematical models that describe how two or more chemicals interact and spread through space. They were first proposed by Alan Turing in his 1952 paper "The Chemical Basis of Morphogenesis" to explain how patterns form in biological organisms -- spots on a leopard, stripes on a zebrafish, ridges on a fingerprint.

The **Gray-Scott model** is a specific reaction-diffusion system that is relatively simple to implement and produces a stunning variety of patterns depending on its parameters. In this tutorial, you will implement it from scratch in p5.js, running on the CPU.

---

## Part 1: The Gray-Scott Equations

### 1.1 The Two Chemicals

The Gray-Scott model involves two chemical substances:

- **Chemical A** (sometimes called "U"): Think of this as the "background" chemical. It starts everywhere at high concentration.
- **Chemical B** (sometimes called "V"): Think of this as the "pattern" chemical. It starts concentrated in a small region and tries to spread.

### 1.2 The Reactions

Two reactions occur simultaneously:

1. **Feed reaction:** Chemical A is continuously fed into the system at a constant rate. Think of it like a reservoir constantly supplying A.

2. **Kill reaction:** Chemical B is continuously removed from the system. Think of it like B slowly evaporating.

3. **Conversion reaction:** When A and B meet, they react: one unit of A is consumed and converted into B. Specifically, the reaction rate depends on A times B squared (A + 2B -> 3B).

### 1.3 The Equations

The change in each chemical over one time step is:

```
A_next = A + (dA * laplacian(A) - A * B * B + feed * (1 - A)) * dt
B_next = B + (dB * laplacian(B) + A * B * B - (kill + feed) * B) * dt
```

Where:
- `dA` = diffusion rate of A (how fast A spreads; typically around 1.0)
- `dB` = diffusion rate of B (how fast B spreads; typically around 0.5, slower than A)
- `feed` = how fast A is added to the system (typically 0.01 to 0.08)
- `kill` = how fast B is removed from the system (typically 0.04 to 0.07)
- `laplacian(A)` = the Laplacian of A (measures how different A is from its neighbors)
- `dt` = time step size (typically 1.0)

### 1.4 Understanding Each Term

Let us break down the equation for A:

- **`dA * laplacian(A)`**: Diffusion. A spreads out from high concentration to low concentration, like ink dropped in water. The Laplacian measures local concentration difference.
- **`-A * B * B`**: Reaction. When A meets B, A is consumed. The rate is proportional to A times B squared (a two-B-to-one-A reaction).
- **`feed * (1 - A)`**: Feed. A is replenished toward a concentration of 1.0. The further A is from 1.0, the faster it is replenished.

And for B:

- **`dB * laplacian(B)`**: Diffusion. B also spreads, but typically slower than A.
- **`+A * B * B`**: Reaction. B is produced when A and B react. The same term that removes A adds to B.
- **`-(kill + feed) * B`**: Kill and dilution. B is removed from the system at a rate of (kill + feed).

The key tension: B wants to grow (reaction produces B) but also decays (kill removes B). The patterns emerge from the balance between growth, decay, and diffusion.

---

## Part 2: The Laplacian

### 2.1 What the Laplacian Measures

The Laplacian of a value at a point measures **how different that value is from the average of its neighbors**. If a cell has a higher concentration than its neighbors, the Laplacian is negative (concentration wants to decrease -- diffuse outward). If it has lower concentration than its neighbors, the Laplacian is positive (concentration wants to increase -- diffuse inward).

### 2.2 The 5-Point Stencil

The simplest discrete approximation of the 2D Laplacian uses five points -- the cell itself and its four direct neighbors (up, down, left, right):

```
       [ 0  1  0 ]
       [ 1 -4  1 ]
       [ 0  1  0 ]
```

In code:
```js
function laplacian5(grid, x, y) {
  let center = grid[x][y];
  let sum = 0;
  sum += grid[(x + 1) % cols][y];   // right
  sum += grid[(x - 1 + cols) % cols][y]; // left
  sum += grid[x][(y + 1) % rows];   // down
  sum += grid[x][(y - 1 + rows) % rows]; // up
  return sum - 4 * center;
}
```

This says: "The Laplacian is the sum of all four neighbors minus 4 times the center value."

### 2.3 The 3x3 Stencil (More Accurate)

A more accurate approximation also includes the diagonal neighbors, with different weights:

```
       [ 0.05  0.2  0.05 ]
       [ 0.2  -1.0  0.2  ]
       [ 0.05  0.2  0.05 ]
```

The weights sum to zero (0.05*4 + 0.2*4 - 1.0 = 0), which is a requirement for a valid Laplacian stencil.

```js
function laplacian9(grid, x, y) {
  let sum = 0;
  sum += grid[(x-1+cols)%cols][(y-1+rows)%rows] * 0.05;  // top-left
  sum += grid[x][(y-1+rows)%rows] * 0.2;                  // top
  sum += grid[(x+1)%cols][(y-1+rows)%rows] * 0.05;        // top-right
  sum += grid[(x-1+cols)%cols][y] * 0.2;                    // left
  sum += grid[x][y] * -1.0;                                // center
  sum += grid[(x+1)%cols][y] * 0.2;                         // right
  sum += grid[(x-1+cols)%cols][(y+1)%rows] * 0.05;          // bottom-left
  sum += grid[x][(y+1)%rows] * 0.2;                        // bottom
  sum += grid[(x+1)%cols][(y+1)%rows] * 0.05;              // bottom-right
  return sum;
}
```

The 3x3 stencil produces smoother, more isotropic (direction-independent) results. We will use this version in our implementation.

---

## Part 3: Double Buffering

### 3.1 Why Double Buffer?

Just like in Conway's Game of Life, we need two copies of the grid: one for reading the current state and one for writing the next state. If we updated cells in place, cells computed later in the loop would be reading partially-updated values, creating directional artifacts.

### 3.2 The Double Buffer Pattern

```js
// Two grids for chemical A, two grids for chemical B
let gridA, gridB;
let nextA, nextB;

// After computing the next state:
let tempA = gridA;
gridA = nextA;
nextA = tempA;

let tempB = gridB;
gridB = nextB;
nextB = tempB;
```

Swapping the references (rather than copying all the data) is much more efficient.

---

## Part 4: Complete Implementation

Here is the full Gray-Scott reaction-diffusion system in p5.js:

```js
let gridA, gridB;
let nextA, nextB;
let cols, rows;
let cellSize = 2;

// Gray-Scott parameters
let dA = 1.0;    // Diffusion rate of A
let dB = 0.5;    // Diffusion rate of B
let feed = 0.055; // Feed rate
let kill = 0.062;  // Kill rate

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);

  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // Initialize grids
  gridA = make2D(cols, rows, 1.0);  // A starts at 1.0 everywhere
  gridB = make2D(cols, rows, 0.0);  // B starts at 0.0 everywhere
  nextA = make2D(cols, rows, 0.0);
  nextB = make2D(cols, rows, 0.0);

  // Seed B in a small square in the center
  let cx = floor(cols / 2);
  let cy = floor(rows / 2);
  let seedSize = 10;
  for (let x = cx - seedSize; x < cx + seedSize; x++) {
    for (let y = cy - seedSize; y < cy + seedSize; y++) {
      gridB[x][y] = 1.0;
    }
  }
}

function draw() {
  // Run multiple simulation steps per frame for speed
  for (let step = 0; step < 10; step++) {
    simulate();
  }

  // Display
  loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = gridA[x][y];
      let b = gridB[x][y];

      // Color based on the difference between A and B
      let c = floor(constrain((a - b) * 255, 0, 255));

      // Map to pixel coordinates
      for (let dx = 0; dx < cellSize; dx++) {
        for (let dy = 0; dy < cellSize; dy++) {
          let px = x * cellSize + dx;
          let py = y * cellSize + dy;
          let idx = (py * width + px) * 4;
          pixels[idx + 0] = c;       // R
          pixels[idx + 1] = c;       // G
          pixels[idx + 2] = c;       // B
          pixels[idx + 3] = 255;     // A (alpha)
        }
      }
    }
  }
  updatePixels();
}

function simulate() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = gridA[x][y];
      let b = gridB[x][y];

      let lapA = laplacian(gridA, x, y);
      let lapB = laplacian(gridB, x, y);

      // Gray-Scott equations
      let reaction = a * b * b;
      nextA[x][y] = a + (dA * lapA - reaction + feed * (1.0 - a));
      nextB[x][y] = b + (dB * lapB + reaction - (kill + feed) * b);

      // Clamp values to [0, 1]
      nextA[x][y] = constrain(nextA[x][y], 0, 1);
      nextB[x][y] = constrain(nextB[x][y], 0, 1);
    }
  }

  // Swap grids
  let tempA = gridA; gridA = nextA; nextA = tempA;
  let tempB = gridB; gridB = nextB; nextB = tempB;
}

function laplacian(grid, x, y) {
  // 3x3 weighted Laplacian stencil
  let sum = 0;
  sum += grid[(x-1+cols)%cols][(y-1+rows)%rows] * 0.05;
  sum += grid[x][(y-1+rows)%rows] * 0.2;
  sum += grid[(x+1)%cols][(y-1+rows)%rows] * 0.05;
  sum += grid[(x-1+cols)%cols][y] * 0.2;
  sum += grid[x][y] * -1.0;
  sum += grid[(x+1)%cols][y] * 0.2;
  sum += grid[(x-1+cols)%cols][(y+1)%rows] * 0.05;
  sum += grid[x][(y+1)%rows] * 0.2;
  sum += grid[(x+1)%cols][(y+1)%rows] * 0.05;
  return sum;
}

function make2D(w, h, initialValue) {
  let arr = new Array(w);
  for (let i = 0; i < w; i++) {
    arr[i] = new Array(h).fill(initialValue);
  }
  return arr;
}

// Click to add more B chemical
function mouseDragged() {
  let mx = floor(mouseX / cellSize);
  let my = floor(mouseY / cellSize);
  let r = 5;
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      let x = (mx + dx + cols) % cols;
      let y = (my + dy + rows) % rows;
      if (dx * dx + dy * dy < r * r) {
        gridB[x][y] = 1.0;
      }
    }
  }
}
```

---

## Part 5: Exploring Parameters

The Gray-Scott model produces vastly different patterns depending on the `feed` and `kill` parameters. Here is a guide to some parameter regions:

### 5.1 Parameter Map

The parameter space can be thought of as a 2D map with `feed` on the X axis and `kill` on the Y axis. Different regions produce different pattern types:

| Feed | Kill | Pattern Type |
|------|------|-------------|
| 0.010 | 0.045 | Spots that slowly multiply |
| 0.022 | 0.051 | Stripes and worms |
| 0.030 | 0.057 | Maze-like labyrinthine patterns |
| 0.040 | 0.060 | Holes in a solid field |
| 0.055 | 0.062 | Mitosis (cell-division-like spots) |
| 0.025 | 0.060 | Soliton-like isolated spots |
| 0.039 | 0.058 | Moving worms |
| 0.026 | 0.052 | Coral-like branching |

### 5.2 Adding Interactive Controls

Add sliders to explore the parameter space interactively:

```js
let feedSlider, killSlider;

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);

  feedSlider = createSlider(0.01, 0.08, 0.055, 0.001);
  feedSlider.position(10, height + 10);

  killSlider = createSlider(0.04, 0.07, 0.062, 0.001);
  killSlider.position(10, height + 30);

  // ... rest of setup
}

function draw() {
  feed = feedSlider.value();
  kill = killSlider.value();

  // ... rest of draw
}
```

### 5.3 Multiple Seeds

Instead of one square seed, try multiple random seeds:

```js
// In setup(), replace the single seed with:
let numSeeds = 10;
for (let s = 0; s < numSeeds; s++) {
  let sx = floor(random(cols));
  let sy = floor(random(rows));
  let seedR = 5;
  for (let dx = -seedR; dx <= seedR; dx++) {
    for (let dy = -seedR; dy <= seedR; dy++) {
      if (dx * dx + dy * dy < seedR * seedR) {
        let x = (sx + dx + cols) % cols;
        let y = (sy + dy + rows) % rows;
        gridB[x][y] = 1.0;
      }
    }
  }
}
```

---

## Part 6: Adding Color

The grayscale display works, but color can make the patterns much more visually striking:

```js
// In draw(), replace the color computation with:
function draw() {
  for (let step = 0; step < 10; step++) {
    simulate();
  }

  loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = gridA[x][y];
      let b = gridB[x][y];

      // Map chemicals to colors
      let r = floor(constrain(a * 200 + b * 55, 0, 255));
      let g = floor(constrain(a * 100 + b * 200, 0, 255));
      let bl = floor(constrain(a * 50 + b * 255, 0, 255));

      for (let dx = 0; dx < cellSize; dx++) {
        for (let dy = 0; dy < cellSize; dy++) {
          let px = x * cellSize + dx;
          let py = y * cellSize + dy;
          let idx = (py * width + px) * 4;
          pixels[idx + 0] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = bl;
          pixels[idx + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}
```

You can also use p5.js `lerpColor()` or a custom color palette for more sophisticated color mapping.

---

## Part 7: Performance Notes

The CPU implementation is slow for large grids because it loops through every cell every frame. Here are some strategies to improve performance:

1. **Use a small grid with cellSize > 1.** A 200x200 grid with cellSize=2 on a 400x400 canvas is 4x faster than a 400x400 grid with cellSize=1.

2. **Run multiple simulation steps per frame.** This makes the evolution faster without increasing the rendering cost (you still only draw once per frame).

3. **Use `pixels[]` directly instead of `set()`.** The `set()` function is much slower than direct pixel array manipulation.

4. **Move to the GPU.** The simulation can be implemented in GLSL using framebuffer feedback, running millions of cells at 60fps. This is covered in more advanced material.

---

## Summary

The Gray-Scott reaction-diffusion system demonstrates how two interacting chemicals, each following simple rules of diffusion and reaction, can spontaneously form complex spatial patterns. The key ingredients are:

1. **Two diffusing substances** with different diffusion rates (A diffuses faster than B)
2. **A reaction** that converts A to B (autocatalytic: B helps produce more B)
3. **Feed and kill** that add A and remove B
4. **The Laplacian** that drives diffusion (spreading from high to low concentration)
5. **Double buffering** for correct simultaneous update

By adjusting just two parameters (feed and kill), you can produce spots, stripes, mazes, coral, and dozens of other pattern types -- all from the same simple equations.

---

## Exercises

1. **Parameter exploration.** Systematically explore the feed/kill parameter space. Create a document with screenshots of at least 6 different parameter combinations and descriptions of the patterns produced.

2. **Asymmetric seeding.** Instead of seeding B in the center, seed it along one edge of the grid. How do the patterns differ?

3. **Multiple chemical species.** Add a third chemical C that interacts with A and B. Design your own reaction rules and see what patterns emerge.

4. **Color mapping.** Design a custom color palette that maps the A and B concentrations to colors. Try mapping B concentration to hue and A concentration to brightness.

5. **Save frames.** Use `saveCanvas()` or `save()` to capture individual frames. Create a series of images showing the evolution of a reaction-diffusion pattern over time.
