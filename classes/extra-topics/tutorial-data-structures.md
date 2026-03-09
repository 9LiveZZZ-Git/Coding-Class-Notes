# Tutorial: Data Structures for Creative Coding

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Why Data Structures Matter

Every creative coding project needs to organize data. A particle system stores hundreds of particles. A grid-based simulation stores thousands of cell states. An undo system remembers past states. The way you organize this data -- the **data structure** you choose -- determines what operations are easy or hard, fast or slow.

This tutorial covers the data structures most useful for creative coding in p5.js: arrays, objects, maps, stacks, queues, and 2D grids.

---

## Arrays

Arrays are ordered lists. You already use them constantly. Here we cover the most important array methods.

### Creating Arrays

```js
// Empty array
let particles = [];

// Array with initial values
let colors = [255, 0, 128];

// Array of objects
let points = [
  { x: 10, y: 20 },
  { x: 30, y: 40 }
];

// Fill an array using a loop
let grid = [];
for (let i = 0; i < 100; i++) {
  grid.push(0);
}

// Fill an array using Array.from
let sines = Array.from({ length: 100 }, (_, i) => sin(i * 0.1));
```

### Essential Array Methods

| Method | What It Does | Returns |
|---|---|---|
| `push(item)` | Add to the end | New length |
| `pop()` | Remove from the end | Removed item |
| `unshift(item)` | Add to the beginning | New length |
| `shift()` | Remove from the beginning | Removed item |
| `splice(i, n)` | Remove `n` items starting at index `i` | Removed items |
| `splice(i, 0, item)` | Insert `item` at index `i` | `[]` |
| `slice(start, end)` | Copy a portion (non-destructive) | New array |
| `indexOf(item)` | Find first index of item | Index or -1 |
| `includes(item)` | Check if item exists | true/false |
| `length` | Number of items (property, not method) | Number |

### Iterating Over Arrays

```js
let balls = [/* ... */];

// for...of -- simplest, use when you do not need the index
for (let ball of balls) {
  ball.update();
  ball.display();
}

// Traditional for loop -- use when you need the index
for (let i = 0; i < balls.length; i++) {
  balls[i].display();
}

// forEach -- functional style
balls.forEach(ball => ball.display());

// forEach with index
balls.forEach((ball, index) => {
  ball.label = `Ball ${index}`;
});
```

### Removing Items During Iteration

This is a common source of bugs. When you remove an item from an array during forward iteration, all subsequent indices shift.

```js
// WRONG -- skips elements after removal
for (let i = 0; i < particles.length; i++) {
  if (particles[i].isDead()) {
    particles.splice(i, 1); // Next particle shifts into index i, gets skipped
  }
}

// CORRECT -- iterate backwards
for (let i = particles.length - 1; i >= 0; i--) {
  if (particles[i].isDead()) {
    particles.splice(i, 1); // Removal does not affect earlier indices
  }
}

// ALSO CORRECT -- use filter to create a new array
particles = particles.filter(p => !p.isDead());
```

### Complete Example: Dynamic Particle Array

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(0, 25);

  // Add particles at mouse
  if (mouseIsPressed) {
    particles.push({
      x: mouseX,
      y: mouseY,
      vx: random(-3, 3),
      vy: random(-5, -1),
      life: 200,
      size: random(3, 10)
    });
  }

  // Update and draw
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05; // gravity
    p.life -= 2;

    noStroke();
    fill(255, 200, 50, p.life);
    circle(p.x, p.y, p.size);
  }

  // Remove dead particles
  particles = particles.filter(p => p.life > 0);

  // Display count
  fill(255);
  noStroke();
  text("Particles: " + particles.length, 10, 20);
}
```

---

## Objects (Dictionaries / Key-Value Pairs)

JavaScript objects store data as **key-value pairs**. Unlike arrays which are ordered by index (0, 1, 2...), objects are accessed by name.

```js
// An object representing a character
let player = {
  name: "Hero",
  x: 200,
  y: 300,
  health: 100,
  speed: 3,
  inventory: ["sword", "potion"]
};

// Access properties
print(player.name);       // "Hero"
print(player.health);     // 100

// Modify properties
player.health -= 10;

// Add new properties
player.score = 0;

// Access with bracket notation (useful for dynamic keys)
let key = "health";
print(player[key]);       // 90
```

### Objects as Configuration

Objects are great for storing settings:

```js
let config = {
  particleCount: 200,
  gravity: 0.1,
  friction: 0.99,
  colorMode: "rainbow",
  showDebug: false
};

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < config.particleCount; i++) {
    // create particles...
  }
}
```

### Nested Objects

```js
let scene = {
  background: { r: 30, g: 30, b: 50 },
  player: {
    pos: { x: 100, y: 200 },
    vel: { x: 0, y: 0 }
  },
  enemies: [
    { pos: { x: 300, y: 150 }, type: "fast" },
    { pos: { x: 500, y: 250 }, type: "heavy" }
  ]
};

// Access nested values
let px = scene.player.pos.x;
let firstEnemyType = scene.enemies[0].type;
```

---

## Map (the Data Structure, Not the Function)

JavaScript's `Map` is like an object but with some advantages: any value can be a key (not just strings), it maintains insertion order, and it has a `size` property.

```js
let colorMap = new Map();
colorMap.set("fire", color(255, 100, 0));
colorMap.set("water", color(0, 100, 255));
colorMap.set("earth", color(100, 200, 50));

// Retrieve a value
let fireColor = colorMap.get("fire");

// Check if a key exists
if (colorMap.has("fire")) {
  // ...
}

// Iterate
colorMap.forEach((value, key) => {
  print(key + " -> " + value);
});

// Size
print(colorMap.size); // 3
```

### When to Use Map vs. Object

Use **objects** for simple configuration and data with known keys. Use **Map** when:

- Keys might not be strings (e.g., objects as keys)
- You need to frequently add and remove entries
- You need to know the size
- You need guaranteed insertion order

### Creative Coding Use: Counting Grid Cell States

```js
let cellCounts = new Map();
cellCounts.set("alive", 0);
cellCounts.set("dead", 0);

for (let row of grid) {
  for (let cell of row) {
    let state = cell === 1 ? "alive" : "dead";
    cellCounts.set(state, cellCounts.get(state) + 1);
  }
}
```

---

## Stacks (Last In, First Out)

A **stack** is a list where you always add to and remove from the same end. Think of a stack of plates: you put plates on top and take them off the top. The last plate you put on is the first one you take off. This is called **LIFO** (Last In, First Out).

JavaScript arrays can be used as stacks using `push()` and `pop()`.

```js
let stack = [];
stack.push("a");  // stack: ["a"]
stack.push("b");  // stack: ["a", "b"]
stack.push("c");  // stack: ["a", "b", "c"]

let top = stack.pop();  // top: "c", stack: ["a", "b"]
let next = stack.pop(); // next: "b", stack: ["a"]
```

### Complete Example: Undo System for a Drawing App

```js
let undoStack = [];
let currentStrokes = [];
let currentStroke = null;

function setup() {
  createCanvas(600, 400);
  background(255);
  textSize(12);
}

function draw() {
  background(255);

  // Redraw all saved strokes
  for (let stroke of currentStrokes) {
    drawStroke(stroke);
  }

  // Draw the current stroke in progress
  if (currentStroke) {
    drawStroke(currentStroke);
  }

  // UI
  fill(0);
  noStroke();
  text("Draw with mouse. Press 'z' to undo. Press 'r' to redo.", 10, 20);
  text("Strokes: " + currentStrokes.length + " | Undo stack: " + undoStack.length, 10, 40);
}

function drawStroke(points) {
  stroke(0);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape();
}

function mousePressed() {
  currentStroke = [{ x: mouseX, y: mouseY }];
}

function mouseDragged() {
  if (currentStroke) {
    currentStroke.push({ x: mouseX, y: mouseY });
  }
}

function mouseReleased() {
  if (currentStroke && currentStroke.length > 1) {
    currentStrokes.push(currentStroke);
    undoStack = []; // Clear redo stack when a new stroke is drawn
  }
  currentStroke = null;
}

function keyPressed() {
  if (key === 'z' && currentStrokes.length > 0) {
    // Undo: pop from strokes, push to undo stack
    let removed = currentStrokes.pop();
    undoStack.push(removed);
  }
  if (key === 'r' && undoStack.length > 0) {
    // Redo: pop from undo stack, push back to strokes
    let restored = undoStack.pop();
    currentStrokes.push(restored);
  }
}
```

---

## Queues (First In, First Out)

A **queue** is like a line at a store: the first person in line is the first person served. This is **FIFO** (First In, First Out).

JavaScript arrays can be used as queues using `push()` (add to end) and `shift()` (remove from beginning).

```js
let queue = [];
queue.push("a");  // queue: ["a"]
queue.push("b");  // queue: ["a", "b"]
queue.push("c");  // queue: ["a", "b", "c"]

let first = queue.shift();  // first: "a", queue: ["b", "c"]
let next = queue.shift();   // next: "b", queue: ["c"]
```

Note: `shift()` is slow for large arrays because every element must be re-indexed. For performance-critical queues, consider using a linked list or circular buffer. For most creative coding, arrays are fine.

### Complete Example: Trail Effect with a Queue

```js
let trail = [];
let maxLength = 50;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(20);

  // Add current mouse position to the end of the queue
  trail.push({ x: mouseX, y: mouseY });

  // If the queue is too long, remove the oldest point from the front
  while (trail.length > maxLength) {
    trail.shift();
  }

  // Draw the trail with fading opacity
  noFill();
  for (let i = 1; i < trail.length; i++) {
    let alpha = map(i, 0, trail.length, 0, 255);
    let weight = map(i, 0, trail.length, 1, 8);
    stroke(100, 200, 255, alpha);
    strokeWeight(weight);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }
}
```

---

## 2D Arrays (Grids)

A **2D array** is an array of arrays, forming a grid. This is essential for cellular automata (Game of Life), tile maps, image processing, and grid-based simulations.

### Creating a 2D Grid

```js
let cols = 10;
let rows = 8;
let grid = [];

// Method 1: Nested loops
for (let i = 0; i < rows; i++) {
  grid[i] = [];
  for (let j = 0; j < cols; j++) {
    grid[i][j] = 0;
  }
}

// Method 2: Array.from (more concise)
let grid2 = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => 0)
);
```

### Accessing and Modifying Grid Cells

```js
// Read a cell value
let value = grid[row][col];

// Set a cell value
grid[3][5] = 1;

// Iterate over the entire grid
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    let cellValue = grid[i][j];
    // do something with cellValue
  }
}
```

### Complete Example: Conway's Game of Life

```js
let grid, next;
let cols, rows;
let cellSize = 8;

function setup() {
  createCanvas(640, 480);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // Initialize grid with random alive/dead cells
  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = random() > 0.7 ? 1 : 0;
    }
  }
}

function draw() {
  background(0);

  // Display current grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        fill(200, 255, 200);
        noStroke();
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  // Compute next generation
  next = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let neighbors = countNeighbors(grid, i, j);

      if (grid[i][j] === 1) {
        // Alive cell
        if (neighbors < 2 || neighbors > 3) {
          next[i][j] = 0; // Dies
        } else {
          next[i][j] = 1; // Survives
        }
      } else {
        // Dead cell
        if (neighbors === 3) {
          next[i][j] = 1; // Birth
        } else {
          next[i][j] = 0; // Stays dead
        }
      }
    }
  }

  grid = next;
}

function make2DArray(cols, rows) {
  let arr = [];
  for (let i = 0; i < cols; i++) {
    arr[i] = [];
    for (let j = 0; j < rows; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue; // Skip self
      let col = (x + i + cols) % cols; // Wrap around
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}
```

### Grid Coordinate Conversion

When working with grids, you often need to convert between pixel coordinates and grid coordinates:

```js
// Pixel to grid cell
let col = floor(mouseX / cellSize);
let row = floor(mouseY / cellSize);

// Grid cell to pixel (top-left corner of the cell)
let px = col * cellSize;
let py = row * cellSize;

// Grid cell to pixel (center of the cell)
let cx = col * cellSize + cellSize / 2;
let cy = row * cellSize + cellSize / 2;
```

---

## Complete Example: Grid-Based Heat Diffusion

This simulation uses a 2D grid where each cell has a temperature value. Heat diffuses from hot cells to cooler neighbors. Click to add heat.

```js
let grid, nextGrid;
let cols, rows;
let cellSize = 5;
let diffusionRate = 0.2;

function setup() {
  createCanvas(600, 400);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  grid = make2DArray(cols, rows, 0);
  nextGrid = make2DArray(cols, rows, 0);
}

function draw() {
  // Add heat at mouse position when pressed
  if (mouseIsPressed) {
    let ci = floor(mouseX / cellSize);
    let cj = floor(mouseY / cellSize);
    let brushSize = 3;
    for (let di = -brushSize; di <= brushSize; di++) {
      for (let dj = -brushSize; dj <= brushSize; dj++) {
        let ni = ci + di;
        let nj = cj + dj;
        if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
          grid[ni][nj] = 1.0;
        }
      }
    }
  }

  // Diffuse heat
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let sum = 0;
      let count = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          let ni = i + di;
          let nj = j + dj;
          if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
            sum += grid[ni][nj];
            count++;
          }
        }
      }
      let avg = sum / count;
      nextGrid[i][j] = lerp(grid[i][j], avg, diffusionRate);
      nextGrid[i][j] *= 0.998; // Slow cooling
    }
  }

  // Display
  loadPixels();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let temp = nextGrid[i][j];
      let r = constrain(temp * 255 * 3, 0, 255);
      let g = constrain((temp - 0.33) * 255 * 3, 0, 255);
      let b = constrain((temp - 0.66) * 255 * 3, 0, 255);

      for (let px = 0; px < cellSize; px++) {
        for (let py = 0; py < cellSize; py++) {
          let x = i * cellSize + px;
          let y = j * cellSize + py;
          let idx = (y * width + x) * 4;
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = 255;
        }
      }
    }
  }
  updatePixels();

  // Swap grids
  let temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

function make2DArray(c, r, val) {
  let arr = [];
  for (let i = 0; i < c; i++) {
    arr[i] = [];
    for (let j = 0; j < r; j++) {
      arr[i][j] = val;
    }
  }
  return arr;
}
```

---

## Sets

A `Set` is an unordered collection of unique values. Adding the same value twice has no effect.

```js
let visited = new Set();

visited.add("room1");
visited.add("room2");
visited.add("room1"); // No effect -- already exists

print(visited.size);       // 2
print(visited.has("room1")); // true
print(visited.has("room3")); // false

visited.delete("room2");

// Iterate over a Set
visited.forEach(room => print(room));
```

### Creative Coding Use: Tracking Unique Positions

```js
// Track which grid cells have been visited
let visitedCells = new Set();

function cellKey(col, row) {
  return col + "," + row;
}

function mousePressed() {
  let col = floor(mouseX / cellSize);
  let row = floor(mouseY / cellSize);
  visitedCells.add(cellKey(col, row));
}

// Check if a cell was visited
if (visitedCells.has(cellKey(3, 5))) {
  // ...
}
```

---

## Choosing the Right Data Structure

| Situation | Data Structure | Why |
|---|---|---|
| Collection of particles/agents | Array | Ordered, easy to iterate, add/remove |
| Configuration settings | Object | Named keys, easy to read |
| Grid simulation (Game of Life) | 2D Array | Row/column access |
| Undo/Redo history | Stack (array with push/pop) | LIFO order |
| Event queue, trail buffer | Queue (array with push/shift) | FIFO order |
| Unique items, visited tracking | Set | Fast lookup, no duplicates |
| Key-value lookup with non-string keys | Map | Any key type, ordered |

---

## Exercises

1. **Ring Buffer**: Implement a fixed-size trail that overwrites the oldest point when full, instead of using `shift()`. Use an array and a write index that wraps around with modulo.

2. **Grid Painter**: Create a grid where clicking toggles cells between alive and dead. Press space to run one step of the Game of Life. Press 'c' to clear.

3. **Stack Calculator**: Build a simple reverse-polish notation (RPN) calculator using a stack. Display the stack on screen. Click buttons for numbers and operations (+, -, *, /).

4. **Spatial Hash**: Create 200 particles. Instead of checking all pairs for collisions (expensive), divide the canvas into grid cells and only check particles in the same cell. This is a spatial hash map -- use a Map where keys are cell coordinates and values are arrays of particles.

---

## Further Reading

- Eloquent JavaScript, Chapter 4: Data Structures: <https://eloquentjavascript.net/04_data.html>
- MDN: Indexed collections: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections>
- Daniel Shiffman, _The Nature of Code_: <https://natureofcode.com>
