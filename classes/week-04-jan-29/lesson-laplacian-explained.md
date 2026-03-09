# Lesson: The Laplacian Operator Explained

## MAT 200C: Computing Arts -- Week 4, January 29

---

## What This Lesson Covers

The Laplacian is a mathematical operator that appears in many creative computing techniques: reaction-diffusion, fluid simulation, image processing, and more. It sounds intimidating, but the core idea is simple. This lesson explains the Laplacian without any calculus. If you can compute an average, you can understand the Laplacian.

---

## The Core Idea

The Laplacian of a value at a point answers one question:

**"How different is this point's value from the average of the points around it?"**

That is it. That is the whole concept.

- If a point's value is **higher** than its neighbors' average, the Laplacian is **negative**.
- If a point's value is **lower** than its neighbors' average, the Laplacian is **positive**.
- If a point's value **equals** its neighbors' average, the Laplacian is **zero**.

The Laplacian measures **local difference** -- how much a point stands out from its surroundings.

---

## A One-Dimensional Example

Imagine a row of numbers representing the height of a hill:

```
Position:   1    2    3    4    5    6    7
Height:     0    2    5    9    5    2    0
```

Let us compute the Laplacian at position 4 (height = 9).

The neighbors of position 4 are positions 3 (height 5) and 5 (height 5).

The average of the neighbors is: (5 + 5) / 2 = 5.

The difference (value minus neighbor average) is: 9 - 5 = 4.

The Laplacian is the **negative** of this (by convention): Laplacian = -4. Wait -- let me be more precise about the discrete formula.

### The Discrete Laplacian in 1D

The standard discrete Laplacian at position `i` is:

```
Laplacian(i) = value(i-1) + value(i+1) - 2 * value(i)
```

For position 4: Laplacian = 5 + 5 - 2 * 9 = 10 - 18 = -8.

The Laplacian is negative because position 4 is a **peak** -- higher than its neighbors. If we apply diffusion (add the Laplacian to the value), the peak will decrease, spreading outward. This is exactly how diffusion works: high points go down, low points go up, and everything smooths out.

Let us check position 2 (height = 2, neighbors are 0 and 5):

```
Laplacian(2) = 0 + 5 - 2 * 2 = 5 - 4 = 1
```

The Laplacian is positive because position 2 is in a **valley** (lower than the average of its neighbors). Diffusion would increase its value.

---

## A Two-Dimensional Example

In a 2D grid (like a grid of pixels), each cell has more neighbors. The Laplacian at a cell measures how different that cell is from the cells around it.

### The 5-Point Stencil

The simplest 2D Laplacian uses the four direct neighbors (up, down, left, right):

```
        [ 0    1    0 ]
        [ 1   -4    1 ]
        [ 0    1    0 ]
```

This diagram shows the weights. To compute the Laplacian at the center cell:

1. Take the value of the cell above and multiply by 1
2. Take the value of the cell below and multiply by 1
3. Take the value of the cell to the left and multiply by 1
4. Take the value of the cell to the right and multiply by 1
5. Take the value of the center cell and multiply by -4
6. Add all five results together

In code:

```js
function laplacian5(grid, x, y, cols, rows) {
  let center = grid[x][y];
  let up    = grid[x][(y - 1 + rows) % rows];
  let down  = grid[x][(y + 1) % rows];
  let left  = grid[(x - 1 + cols) % cols][y];
  let right = grid[(x + 1) % cols][y];

  return up + down + left + right - 4 * center;
}
```

**Why -4?** Because we have 4 neighbors, and we want to measure the difference between the center and the average of those 4 neighbors. Mathematically: (sum of neighbors) - 4 * center = 4 * (average of neighbors - center). If the center equals the average, the result is zero.

### Visual Interpretation of the 5-Point Stencil

Let us visualize this on a small grid. Imagine these are the values at and around our center cell (marked with brackets):

```
         3    3    3
         3   [9]   3
         3    3    3
```

The center is 9, all four direct neighbors are 3.

Laplacian = 3 + 3 + 3 + 3 - 4 * 9 = 12 - 36 = -24.

Strongly negative: the center is much higher than its surroundings. Diffusion would strongly pull this value down.

Now consider a uniform grid:

```
         5    5    5
         5   [5]   5
         5    5    5
```

Laplacian = 5 + 5 + 5 + 5 - 4 * 5 = 20 - 20 = 0.

Zero: the center is the same as its neighbors. No diffusion occurs. This is equilibrium.

Now consider a low valley:

```
         7    7    7
         7   [1]   7
         7    7    7
```

Laplacian = 7 + 7 + 7 + 7 - 4 * 1 = 28 - 4 = 24.

Strongly positive: the center is much lower than its surroundings. Diffusion would strongly pull this value up, filling in the valley.

---

## The 3x3 Stencil (Weighted)

The 5-point stencil only considers the four direct neighbors (up, down, left, right). But a cell also has four diagonal neighbors (top-left, top-right, bottom-left, bottom-right). The 3x3 stencil includes all eight neighbors with appropriate weights:

```
        [ 0.05   0.2   0.05 ]
        [ 0.2   -1.0   0.2  ]
        [ 0.05   0.2   0.05 ]
```

**Why different weights?** The diagonal neighbors are farther away (distance sqrt(2) rather than 1), so they get less weight. The specific weights (0.05 for diagonals, 0.2 for direct neighbors) are chosen so that:

1. All weights sum to zero: 4 * 0.05 + 4 * 0.2 + (-1.0) = 0.2 + 0.8 - 1.0 = 0.0
2. The approximation is more isotropic (direction-independent) than the 5-point stencil

**Isotropy matters:** With the 5-point stencil, diffusion spreads slightly faster along the horizontal and vertical axes than along the diagonals. With the 3x3 stencil, diffusion spreads more evenly in all directions. This produces rounder spots and smoother curves in reaction-diffusion simulations.

In code:

```js
function laplacian9(grid, x, y, cols, rows) {
  let sum = 0;

  // Diagonal neighbors (weight 0.05 each)
  sum += grid[(x-1+cols)%cols][(y-1+rows)%rows] * 0.05;   // top-left
  sum += grid[(x+1)%cols][(y-1+rows)%rows] * 0.05;         // top-right
  sum += grid[(x-1+cols)%cols][(y+1)%rows] * 0.05;          // bottom-left
  sum += grid[(x+1)%cols][(y+1)%rows] * 0.05;               // bottom-right

  // Direct neighbors (weight 0.2 each)
  sum += grid[x][(y-1+rows)%rows] * 0.2;                    // top
  sum += grid[x][(y+1)%rows] * 0.2;                          // bottom
  sum += grid[(x-1+cols)%cols][y] * 0.2;                      // left
  sum += grid[(x+1)%cols][y] * 0.2;                            // right

  // Center (weight -1.0)
  sum += grid[x][y] * (-1.0);

  return sum;
}
```

### Comparing the Two Stencils Visually

Imagine looking down at the stencil weights as a "filter" that slides over the grid.

**5-point stencil:**

```
        .   #   .         . = not used (weight 0)
        #   X   #         # = neighbor (weight 1)
        .   #   .         X = center (weight -4)
```

This is a "plus" or "cross" shape. It samples only in the cardinal directions.

**3x3 stencil (weighted):**

```
        o   #   o         o = diagonal neighbor (weight 0.05)
        #   X   #         # = direct neighbor (weight 0.2)
        o   #   o         X = center (weight -1.0)
```

This is a full square, sampling all 8 neighbors. The direct neighbors get 4 times the weight of diagonal neighbors (0.2 vs 0.05).

---

## Why the Laplacian Matters in Creative Computing

### 1. Diffusion

The Laplacian is the engine of diffusion. When you compute:

```
next_value = current_value + diffusion_rate * laplacian(current_value)
```

You are simulating diffusion: substance flows from high concentration to low concentration. The Laplacian tells you how much and in which direction.

### 2. Reaction-Diffusion

In the Gray-Scott model (and other reaction-diffusion systems), the Laplacian appears in both equations:

```
A_next = A + dA * laplacian(A) - A*B*B + feed*(1-A)
B_next = B + dB * laplacian(B) + A*B*B - (kill+feed)*B
```

The `dA * laplacian(A)` term spreads chemical A. The `dB * laplacian(B)` term spreads chemical B. Because `dA > dB`, A spreads faster than B, creating the conditions for pattern formation.

### 3. Image Processing

In image processing, the Laplacian is used for **edge detection**. An edge is a place where pixel values change abruptly -- exactly where the Laplacian has large absolute values. Applying the Laplacian to an image highlights edges and removes smooth regions.

### 4. Sharpening

The "unsharp mask" sharpening technique subtracts the Laplacian from the image:

```
sharpened = original - amount * laplacian(original)
```

This amplifies the difference between each pixel and its neighbors, making edges and details more pronounced.

### 5. Fluid Simulation

Fluid simulation uses the Laplacian to model viscosity (the tendency of fluid to smooth out velocity differences) and heat diffusion.

---

## Building Intuition: What the Laplacian "Sees"

Here are several example configurations and what the Laplacian returns for the center cell. These help build intuition for how the Laplacian responds to different local patterns.

**Uniform field (no features):**

```
  5  5  5
  5 [5] 5     Laplacian = 0
  5  5  5
```

Nothing to diffuse. Equilibrium.

**Isolated peak (bright spot):**

```
  0  0  0
  0 [8] 0     Laplacian = strongly negative
  0  0  0
```

The center is much higher than its surroundings. The Laplacian wants to pull it down.

**Isolated valley (dark spot):**

```
  8  8  8
  8 [0] 8     Laplacian = strongly positive
  8  8  8
```

The center is much lower than its surroundings. The Laplacian wants to push it up.

**Horizontal edge:**

```
  9  9  9
  5 [5] 5     Laplacian = slightly positive (pulled up by top neighbors)
  1  1  1
```

The Laplacian is nonzero at edges because the center differs from the average of its neighbors.

**Saddle point:**

```
  0  5  0
  5 [5] 5     Laplacian = approximately 0
  0  5  0
```

Direct neighbors are high, diagonal neighbors are low (or vice versa). These effects can cancel out depending on the stencil weights.

---

## In GLSL

In a fragment shader, the Laplacian is computed by sampling neighboring pixels from a texture:

```glsl
float laplacian(sampler2D tex, vec2 uv, vec2 pixel) {
  float center = texture2D(tex, uv).r;

  float up    = texture2D(tex, uv + vec2(0.0,  pixel.y)).r;
  float down  = texture2D(tex, uv + vec2(0.0, -pixel.y)).r;
  float left  = texture2D(tex, uv + vec2(-pixel.x, 0.0)).r;
  float right = texture2D(tex, uv + vec2( pixel.x, 0.0)).r;

  return up + down + left + right - 4.0 * center;
}
```

Where `pixel = vec2(1.0 / width, 1.0 / height)` is the size of one pixel in texture coordinate space.

---

## Summary

| Question | Answer |
|----------|--------|
| What does the Laplacian measure? | How different a value is from its neighbors' average |
| Positive Laplacian means? | The center is lower than its neighbors (value should increase) |
| Negative Laplacian means? | The center is higher than its neighbors (value should decrease) |
| Zero Laplacian means? | The center equals its neighbors' average (equilibrium) |
| What is the 5-point stencil? | Uses 4 direct neighbors (up/down/left/right) |
| What is the 3x3 stencil? | Uses all 8 neighbors with weighted contributions |
| Why use the 3x3 stencil? | More isotropic (uniform in all directions) |
| Why does it matter? | It drives diffusion, edge detection, and pattern formation |

The Laplacian is not a mysterious mathematical abstraction. It is a simple measurement: **"Am I different from my neighbors?"** That simple measurement, applied everywhere simultaneously, drives some of the most beautiful and complex patterns in both nature and computation.
