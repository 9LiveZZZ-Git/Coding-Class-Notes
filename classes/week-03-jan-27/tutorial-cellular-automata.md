# Tutorial: Implementing Cellular Automata

## MAT 200C: Computing Arts -- Week 3, January 27

---

## Introduction

A **cellular automaton** (CA) is a grid of cells, where each cell has a state (such as "alive" or "dead"), and all cells update simultaneously according to a simple set of rules based on their neighbors. Despite the simplicity of the rules, cellular automata can produce astonishingly complex, beautiful, and sometimes unpredictable behavior.

In this tutorial, you will implement two types of cellular automata:

1. **1D Cellular Automata** (Wolfram's elementary rules, like Rule 30 and Rule 110)
2. **2D Cellular Automata** (Conway's Game of Life)

Both implementations will use p5.js.

---

## Part 1: One-Dimensional Cellular Automata

### 1.1 What Is a 1D CA?

Imagine a single row of cells, each either black (1) or white (0). To compute the next generation, each cell looks at itself and its two neighbors (left and right) -- three cells total. These three cells form a "neighborhood" that can be in one of 8 possible states (since each of the 3 cells can be 0 or 1, and 2^3 = 8). A **rule** specifies, for each of those 8 possible neighborhoods, what the cell's next state should be.

### 1.2 Wolfram's Numbering System

Stephen Wolfram numbered these rules from 0 to 255. Why 255? Because the rule must specify an output (0 or 1) for each of 8 possible inputs, giving 2^8 = 256 possible rules.

The rule number is simply the 8-bit binary representation of all the outputs.

**Example: Rule 30**

30 in binary is `00011110`. We read this as:

| Neighborhood (left, center, right) | 111 | 110 | 101 | 100 | 011 | 010 | 001 | 000 |
|-------------------------------------|-----|-----|-----|-----|-----|-----|-----|-----|
| New state of center cell            |  0  |  0  |  0  |  1  |  1  |  1  |  1  |  0  |

So if a cell and its neighbors are `010` (left=0, center=1, right=0), the new state is 1 (alive). If they are `111` (all alive), the new state is 0 (dead).

### 1.3 Implementing 1D CA in p5.js

The display strategy: each row of pixels represents one generation. The first generation is at the top. Each subsequent generation is drawn one row below. The result is a 2D image that shows the entire history of the 1D automaton.

```js
let cells;
let nextCells;
let cellSize = 4;
let cols;
let ruleNumber = 30;
let ruleset;
let generation = 0;

function setup() {
  createCanvas(800, 600);
  background(255);

  cols = floor(width / cellSize);
  cells = new Array(cols).fill(0);
  nextCells = new Array(cols).fill(0);

  // Start with a single cell in the middle
  cells[floor(cols / 2)] = 1;

  // Convert rule number to binary ruleset
  ruleset = ruleNumberToRuleset(ruleNumber);

  // Draw the first generation
  drawGeneration(generation);
}

function draw() {
  if (generation * cellSize >= height) {
    noLoop();
    return;
  }

  // Compute next generation
  for (let i = 0; i < cols; i++) {
    let left  = cells[(i - 1 + cols) % cols];  // Wrap around
    let center = cells[i];
    let right = cells[(i + 1) % cols];          // Wrap around

    // Convert the 3-cell neighborhood to a rule index
    let index = left * 4 + center * 2 + right * 1;

    nextCells[i] = ruleset[index];
  }

  // Swap arrays
  let temp = cells;
  cells = nextCells;
  nextCells = temp;

  generation++;
  drawGeneration(generation);
}

function drawGeneration(gen) {
  let y = gen * cellSize;
  for (let i = 0; i < cols; i++) {
    if (cells[i] === 1) {
      fill(0);
    } else {
      fill(255);
    }
    noStroke();
    rect(i * cellSize, y, cellSize, cellSize);
  }
}

function ruleNumberToRuleset(num) {
  // Convert number to 8-bit binary array
  // Index 0 = neighborhood 000, index 7 = neighborhood 111
  let rules = new Array(8);
  for (let i = 0; i < 8; i++) {
    rules[i] = (num >> i) & 1;
  }
  return rules;
}
```

**How the code works:**

1. **Initialization:** We create an array of cells, all set to 0 (dead), except for the middle cell which is set to 1 (alive). This single cell is the "seed."

2. **Rule conversion:** `ruleNumberToRuleset()` converts the rule number (e.g., 30) into an array of 8 values. Each array index corresponds to a neighborhood pattern. For example, index 6 corresponds to the neighborhood `110` (since 6 in binary is 110).

3. **Computing the next generation:** For each cell, we look at its left neighbor, itself, and its right neighbor. We combine these three bits into a number from 0 to 7 (the "index"), and look up the new state in the ruleset. The `(i - 1 + cols) % cols` wrapping ensures the grid wraps around at the edges.

4. **Drawing:** Each generation is drawn as a horizontal row of rectangles.

### 1.4 Exploring Different Rules

Try changing `ruleNumber` to different values:

- **Rule 30:** Chaotic, aperiodic pattern. Used by Wolfram as a random number generator. Features a mix of triangular structures and apparent randomness.

- **Rule 110:** Complex behavior that is neither purely chaotic nor purely regular. Has been proven to be Turing complete (capable of universal computation).

- **Rule 90:** Produces a Sierpinski triangle pattern. Beautiful and perfectly self-similar.

- **Rule 184:** Models simple traffic flow. Shows how local rules can simulate macroscopic phenomena.

- **Rule 0:** All cells die. A boring but valid rule.

- **Rule 255:** All cells become alive. Also boring.

### 1.5 Variations to Try

**Random initial state:**

Replace the single-cell seed with a random initial state:

```js
// In setup(), replace the single-cell initialization with:
for (let i = 0; i < cols; i++) {
  cells[i] = floor(random(2));  // 0 or 1 randomly
}
```

**Color based on neighborhood:**

Instead of black and white, map the neighborhood index to a color:

```js
function drawGeneration(gen) {
  let y = gen * cellSize;
  for (let i = 0; i < cols; i++) {
    if (cells[i] === 1) {
      // Use the neighborhood to pick a color
      let left  = cells[(i - 1 + cols) % cols];
      let right = cells[(i + 1) % cols];
      let idx = left * 4 + cells[i] * 2 + right;
      colorMode(HSB, 360, 100, 100);
      fill(idx * 45, 80, 90);  // Map index to hue
    } else {
      fill(255);
    }
    noStroke();
    rect(i * cellSize, y, cellSize, cellSize);
  }
}
```

---

## Part 2: Conway's Game of Life

### 2.1 The Rules

Conway's Game of Life is a 2D cellular automaton invented by mathematician John Conway in 1970. It uses a 2D grid where each cell is either alive (1) or dead (0). Each cell has 8 neighbors (the cells directly adjacent, including diagonals).

The rules are:

1. **Underpopulation:** A living cell with fewer than 2 living neighbors dies.
2. **Survival:** A living cell with 2 or 3 living neighbors survives.
3. **Overpopulation:** A living cell with more than 3 living neighbors dies.
4. **Reproduction:** A dead cell with exactly 3 living neighbors becomes alive.

These four rules can be summarized even more concisely:
- A cell is alive in the next generation if and only if it has exactly 3 neighbors, OR it has exactly 2 neighbors and is currently alive.

### 2.2 The Grid Data Structure

We need two grids: one for the current state and one for the next state. We cannot update cells in-place because all cells must update simultaneously -- if you update a cell before its neighbor reads it, the neighbor gets the wrong value.

```js
let grid;
let nextGrid;
let cols, rows;
let cellSize = 8;

function setup() {
  createCanvas(640, 640);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // Create 2D arrays
  grid = create2DArray(cols, rows);
  nextGrid = create2DArray(cols, rows);

  // Initialize with random state
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = floor(random(2));
    }
  }
}

function create2DArray(w, h) {
  let arr = new Array(w);
  for (let i = 0; i < w; i++) {
    arr[i] = new Array(h).fill(0);
  }
  return arr;
}
```

### 2.3 Counting Neighbors

For each cell, we count how many of its 8 neighbors are alive:

```js
function countNeighbors(g, x, y) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;  // Skip the cell itself

      // Wrap around edges
      let nx = (x + dx + cols) % cols;
      let ny = (y + dy + rows) % rows;

      count += g[nx][ny];
    }
  }
  return count;
}
```

The `(x + dx + cols) % cols` pattern handles wrapping: if `x` is 0 and `dx` is -1, we get `cols - 1` (the last column). This makes the grid wrap around like a torus.

### 2.4 Complete Game of Life Implementation

```js
let grid;
let nextGrid;
let cols, rows;
let cellSize = 8;

function setup() {
  createCanvas(640, 640);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  grid = create2DArray(cols, rows);
  nextGrid = create2DArray(cols, rows);

  // Random initial state
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = floor(random(2));
    }
  }

  frameRate(15);
}

function draw() {
  background(255);

  // Draw current state
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(0);
        noStroke();
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Compute next generation
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = countNeighbors(grid, x, y);
      let current = grid[x][y];

      if (current === 1 && (neighbors === 2 || neighbors === 3)) {
        nextGrid[x][y] = 1;  // Survives
      } else if (current === 0 && neighbors === 3) {
        nextGrid[x][y] = 1;  // Born
      } else {
        nextGrid[x][y] = 0;  // Dies or stays dead
      }
    }
  }

  // Swap grids
  let temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

function create2DArray(w, h) {
  let arr = new Array(w);
  for (let i = 0; i < w; i++) {
    arr[i] = new Array(h).fill(0);
  }
  return arr;
}

function countNeighbors(g, x, y) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      let nx = (x + dx + cols) % cols;
      let ny = (y + dy + rows) % rows;
      count += g[nx][ny];
    }
  }
  return count;
}

// Click to toggle cells
function mousePressed() {
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    grid[x][y] = 1 - grid[x][y];
  }
}
```

### 2.5 Understanding the Behavior

When you run this code, you will see:

- **Chaotic start:** The random initial state is messy and turbulent.
- **Settling down:** After a few dozen generations, the chaos reduces. Many cells die off.
- **Stable structures appear:** You will see:
  - **Still lifes:** Patterns that do not change (e.g., the "block" -- a 2x2 square of living cells).
  - **Oscillators:** Patterns that cycle between two or more states (e.g., the "blinker" -- three cells in a row that flip between horizontal and vertical).
  - **Spaceships:** Patterns that move across the grid (e.g., the "glider" -- a small 5-cell pattern that walks diagonally).

### 2.6 Placing Known Patterns

Instead of a random start, you can manually place known patterns. Here is how to place a "glider":

```js
function placeGlider(g, startX, startY) {
  // Glider pattern:
  //  .X.
  //  ..X
  //  XXX
  let pattern = [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ];

  for (let dx = 0; dx < 3; dx++) {
    for (let dy = 0; dy < 3; dy++) {
      g[(startX + dx) % cols][(startY + dy) % rows] = pattern[dy][dx];
    }
  }
}

// In setup(), after creating the grid:
placeGlider(grid, 10, 10);
```

### 2.7 Adding Visual Polish

Here is an enhanced version with color based on cell age:

```js
let grid;
let nextGrid;
let age;        // Track how long each cell has been alive
let cols, rows;
let cellSize = 6;

function setup() {
  createCanvas(720, 720);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  grid = create2DArray(cols, rows);
  nextGrid = create2DArray(cols, rows);
  age = create2DArray(cols, rows);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = floor(random(2));
      age[x][y] = grid[x][y] === 1 ? 1 : 0;
    }
  }

  frameRate(15);
}

function draw() {
  background(20);

  // Draw with color based on age
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        // Map age to color: young cells are bright, old cells are dim
        let brightness = map(min(age[x][y], 50), 0, 50, 255, 60);
        let hue = map(min(age[x][y], 50), 0, 50, 120, 0); // green to red
        colorMode(HSB, 360, 100, 100);
        fill(hue, 80, map(brightness, 60, 255, 30, 100));
        noStroke();
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Compute next generation
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = countNeighbors(grid, x, y);
      let current = grid[x][y];

      if (current === 1 && (neighbors === 2 || neighbors === 3)) {
        nextGrid[x][y] = 1;
        age[x][y]++;
      } else if (current === 0 && neighbors === 3) {
        nextGrid[x][y] = 1;
        age[x][y] = 1;
      } else {
        nextGrid[x][y] = 0;
        age[x][y] = 0;
      }
    }
  }

  let temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

function create2DArray(w, h) {
  let arr = new Array(w);
  for (let i = 0; i < w; i++) {
    arr[i] = new Array(h).fill(0);
  }
  return arr;
}

function countNeighbors(g, x, y) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      let nx = (x + dx + cols) % cols;
      let ny = (y + dy + rows) % rows;
      count += g[nx][ny];
    }
  }
  return count;
}
```

---

## Part 3: SmoothLife (Brief Overview)

**SmoothLife** is a continuous generalization of the Game of Life created by Stephan Rafler (2011). Instead of a discrete grid with cells that are either 0 or 1, SmoothLife uses:

- **Continuous space:** The grid can have any resolution, and neighborhoods are defined by floating-point radii.
- **Continuous states:** Cells can have any value between 0.0 and 1.0, not just 0 or 1.
- **Smooth transition functions:** Instead of hard thresholds for birth and death, SmoothLife uses smooth sigmoid functions.

The result is that SmoothLife produces organic, blob-like patterns that look remarkably biological -- reminiscent of cell division, amoeba movement, and tissue growth.

SmoothLife is computationally more expensive than discrete Game of Life because it requires computing averages over circular neighborhoods (often done using the Fourier transform for efficiency). Implementing it is beyond the scope of this tutorial, but it is worth knowing about as the "continuous cousin" of the Game of Life.

If you want to explore SmoothLife, search for Stephan Rafler's original paper "Generalization of Conway's Game of Life to a continuous domain - SmoothLife" and look for GPU-based implementations using GLSL.

---

## Summary

| Feature | 1D Wolfram CA | 2D Game of Life |
|---------|---------------|-----------------|
| Grid | 1D row of cells | 2D grid of cells |
| States | 0 or 1 | 0 or 1 |
| Neighborhood | 3 cells (left, center, right) | 8 cells (surrounding) |
| Number of rules | 256 (Rule 0 to Rule 255) | 1 (Conway's rules) |
| Display | Time flows downward | Animation over time |
| Key insight | 256 simple rules produce vastly different behaviors | 4 simple rules produce emergent complexity |

---

## Exercises

1. **Rule explorer.** Modify the 1D CA code to accept a rule number from a text input or slider. Try at least 10 different rules and note which produce interesting patterns.

2. **Glider gun.** Research the "Gosper glider gun" pattern for Game of Life. Implement a function `placeGliderGun(g, x, y)` that places this pattern on the grid. Watch it produce a stream of gliders.

3. **Interactive Life.** Add the ability to pause the simulation (press space), draw cells with the mouse while paused, and then resume. This lets you experiment with custom initial conditions.

4. **Color Life.** Modify the Game of Life so that new cells inherit a blended color from their three parent cells (the three neighbors that caused them to be born). Track color as a per-cell property.

5. **Multiple rules.** Try changing the Game of Life rules. What happens if birth requires 3 or 6 neighbors? What if survival requires 2, 3, or 4? Explore the "Life-like" rule notation (e.g., B3/S23 for standard Life, B36/S23 for "HighLife").
