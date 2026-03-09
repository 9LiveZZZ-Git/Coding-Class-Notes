# Textbook Chapter: Supplementary Topics in Computing Arts

## MAT 200C: Computing Arts -- Comprehensive Reference

---

## Table of Contents

1. [Object-Oriented Programming](#1-object-oriented-programming)
2. [Functional Programming](#2-functional-programming)
3. [Data Structures](#3-data-structures)
4. [Interactivity](#4-interactivity)
5. [Pixel Manipulation](#5-pixel-manipulation)
6. [Types, Strings, and Binary Data](#6-types-strings-and-binary-data)
7. [Software Licenses and Copyright](#7-software-licenses-and-copyright)
8. [Games and Visual Art](#8-games-and-visual-art)
9. [Sound and Audio Programming](#9-sound-and-audio-programming)

Each section includes core concepts, complete working code, and exercises.

---

# 1. Object-Oriented Programming

## Core Concepts

Object-oriented programming (OOP) organizes code around **classes** (blueprints) and **objects** (instances created from those blueprints). Each object bundles related data (**properties**) and behavior (**methods**) together.

In p5.js creative coding, OOP is used to manage collections of similar entities: particles, agents, UI elements, and game objects.

## Key Syntax

```js
class Particle {
  // Constructor: runs once when you create a new instance
  constructor(x, y) {
    this.x = x;             // Property
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-3, 0);
    this.lifespan = 255;
  }

  // Method: a function that belongs to this class
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;       // Gravity
    this.lifespan -= 3;
  }

  display() {
    noStroke();
    fill(255, 100, 50, this.lifespan);
    circle(this.x, this.y, 8);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

**Creating instances:**

```js
let p = new Particle(200, 300);  // new calls the constructor
p.update();                       // Call a method
p.display();
```

**Managing many instances:**

```js
let particles = [];

// Spawn
particles.push(new Particle(mouseX, mouseY));

// Update all
for (let p of particles) {
  p.update();
  p.display();
}

// Remove dead (iterate backwards when splicing)
for (let i = particles.length - 1; i >= 0; i--) {
  if (particles[i].isDead()) particles.splice(i, 1);
}
```

## Inheritance

A child class extends a parent class, inheriting all properties and methods.

```js
class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

class CircleShape extends Shape {
  constructor(x, y, r) {
    super(x, y);   // Call parent constructor
    this.r = r;
  }
  display() {
    circle(this.x, this.y, this.r * 2);
  }
}
```

## Complete Working Example: Particle Fountain

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(0, 25);

  // Spawn particles at mouse
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(mouseX, mouseY));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) particles.splice(i, 1);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-4, -1);
    this.lifespan = 255;
    this.size = random(3, 10);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.lifespan -= 3;
  }

  display() {
    noStroke();
    fill(255, 150, 50, this.lifespan);
    circle(this.x, this.y, this.size);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

## Exercises

1. Add a `color` property to the Particle class. Make particles spawn with random colors.
2. Create a `Ball` class with elastic wall bouncing. Spawn 50 balls with different sizes and speeds.
3. Build a `Predator` and `Prey` class hierarchy with a shared `Creature` base class.

---

# 2. Functional Programming

## Core Concepts

Functional programming treats functions as values that can be passed around, and emphasizes transforming data rather than mutating it. The key tools are higher-order functions: `map`, `filter`, `reduce`, `forEach`.

## Arrow Functions

```js
// Traditional
function double(x) { return x * 2; }

// Arrow (concise)
let double = x => x * 2;

// With multiple params
let add = (a, b) => a + b;
```

## The Big Three

### `map` -- Transform Every Element

```js
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(n => n * 2);     // [2, 4, 6, 8, 10]
let squared = numbers.map(n => n * n);     // [1, 4, 9, 16, 25]
```

### `filter` -- Keep Matching Elements

```js
let numbers = [1, 2, 3, 4, 5, 6];
let evens = numbers.filter(n => n % 2 === 0); // [2, 4, 6]
let big = numbers.filter(n => n > 3);          // [4, 5, 6]
```

### `reduce` -- Combine into One Value

```js
let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce((acc, n) => acc + n, 0);    // 15
let max = numbers.reduce((a, b) => a > b ? a : b);   // 5
```

## Creative Coding Application

```js
// Remove dead particles functionally (instead of backwards splice loop)
particles = particles.filter(p => p.lifespan > 0);

// Map data to visual coordinates
let barHeights = data.map(d => map(d, 0, 100, 0, height));

// Chain operations
let result = data
  .filter(d => d > 10)
  .map(d => d * 2)
  .sort((a, b) => a - b);
```

## Complete Working Example: Functional Data Visualization

```js
let data = [15, 42, 8, 67, 23, 91, 35, 56, 12, 78];

function setup() {
  createCanvas(600, 300);
  noLoop();
}

function draw() {
  background(30);

  let barWidth = width / data.length;

  // Transform and draw using functional methods
  let bars = data.map((val, i) => ({
    x: i * barWidth,
    height: map(val, 0, 100, 0, height - 40),
    hue: map(val, 0, 100, 200, 0),
    value: val
  }));

  let avg = data.reduce((sum, v) => sum + v, 0) / data.length;

  colorMode(HSB, 360, 100, 100);
  bars.forEach(b => {
    fill(b.hue, 70, 80);
    noStroke();
    rect(b.x + 5, height - b.height, barWidth - 10, b.height);

    fill(0, 0, 100);
    textAlign(CENTER);
    textSize(11);
    text(b.value, b.x + barWidth / 2, height - b.height - 8);
  });

  // Average line
  colorMode(RGB);
  let avgY = height - map(avg, 0, 100, 0, height - 40);
  stroke(255, 255, 0, 150);
  strokeWeight(1);
  line(0, avgY, width, avgY);
  noStroke();
  fill(255, 255, 0);
  textAlign(LEFT);
  text(`avg: ${avg.toFixed(1)}`, 5, avgY - 5);
}
```

## Exercises

1. Use `filter` and `map` to extract and display only the particles within 100 pixels of the mouse.
2. Use `reduce` to find the bounding box of an array of `{x, y}` points.
3. Create a chained expression that filters, transforms, and sorts an array of particle objects.

---

# 3. Data Structures

## Core Concepts

Data structures organize information for efficient access and modification. Creative coding primarily uses: arrays, objects, 2D arrays (grids), stacks, and queues.

## Arrays and Key Methods

```js
let a = [1, 2, 3];
a.push(4);           // Add to end: [1, 2, 3, 4]
a.pop();              // Remove from end: [1, 2, 3]
a.unshift(0);         // Add to beginning: [0, 1, 2, 3]
a.shift();            // Remove from beginning: [1, 2, 3]
a.splice(1, 1);       // Remove 1 item at index 1: [1, 3]
a.includes(3);        // true
a.indexOf(3);         // 1
a.slice(0, 2);        // Copy portion: [1, 3] (non-destructive)
```

## Objects (Key-Value Pairs)

```js
let config = {
  gravity: 0.1,
  friction: 0.99,
  maxParticles: 500
};

config.gravity;            // 0.1
config["friction"];        // 0.99 (bracket notation for dynamic keys)
config.newProp = true;     // Add new property
```

## Stacks (LIFO) and Queues (FIFO)

```js
// Stack: use push/pop
let undoStack = [];
undoStack.push(state);        // Save state
let prev = undoStack.pop();   // Restore most recent

// Queue: use push/shift
let eventQueue = [];
eventQueue.push(event);       // Add to end
let next = eventQueue.shift(); // Process from front
```

## 2D Arrays (Grids)

```js
// Create
let grid = [];
for (let i = 0; i < rows; i++) {
  grid[i] = [];
  for (let j = 0; j < cols; j++) {
    grid[i][j] = 0;
  }
}

// Access
let val = grid[row][col];
grid[row][col] = 1;

// Pixel-to-grid conversion
let col = floor(mouseX / cellSize);
let row = floor(mouseY / cellSize);
```

## Complete Working Example: Grid Simulation (Heat Diffusion)

```js
let grid, nextGrid;
let cols = 80, rows = 60;
let cellSize;

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  cellSize = width / cols;
  grid = make2D(cols, rows, 0);
  nextGrid = make2D(cols, rows, 0);
}

function draw() {
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let ci = floor(mouseX / cellSize);
    let cj = floor(mouseY / cellSize);
    for (let di = -2; di <= 2; di++)
      for (let dj = -2; dj <= 2; dj++) {
        let ni = ci + di, nj = cj + dj;
        if (ni >= 0 && ni < cols && nj >= 0 && nj < rows)
          grid[ni][nj] = 1.0;
      }
  }

  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      let sum = 0, count = 0;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          let ni = i + di, nj = j + dj;
          if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
            sum += grid[ni][nj]; count++;
          }
        }
      nextGrid[i][j] = lerp(grid[i][j], sum / count, 0.2) * 0.998;
    }

  loadPixels();
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      let t = nextGrid[i][j];
      let r = constrain(t * 765, 0, 255);
      let g = constrain(t * 765 - 255, 0, 255);
      let b = constrain(t * 765 - 510, 0, 255);
      for (let px = 0; px < cellSize; px++)
        for (let py = 0; py < cellSize; py++) {
          let idx = ((j * cellSize + py) * width + i * cellSize + px) * 4;
          pixels[idx] = r; pixels[idx + 1] = g; pixels[idx + 2] = b; pixels[idx + 3] = 255;
        }
    }
  updatePixels();

  [grid, nextGrid] = [nextGrid, grid]; // Swap
}

function make2D(c, r, val) {
  return Array.from({length: c}, () => Array.from({length: r}, () => val));
}
```

## Exercises

1. Implement an undo system for a drawing app using a stack.
2. Build Conway's Game of Life using a 2D array.
3. Create a ring buffer (fixed-size queue) for a mouse trail effect.

---

# 4. Interactivity

## Core Concepts

p5.js provides built-in variables (`mouseX`, `mouseY`, `key`, `keyCode`) and callback functions (`mousePressed`, `keyPressed`, `touchStarted`) for handling user input. GUI elements (`createSlider`, `createButton`) add HTML controls.

## Mouse Events

```js
function mousePressed() { /* fires once on click */ }
function mouseReleased() { /* fires once on release */ }
function mouseDragged() { /* fires while dragging */ }
function mouseWheel(event) {
  let delta = event.delta; // positive = scroll down
  return false; // prevent page scroll
}
```

## Keyboard Events

```js
function keyPressed() {
  if (key === 'r') { /* reset */ }
  if (keyCode === UP_ARROW) { /* move up */ }
}

// Continuous key detection in draw():
if (keyIsDown(LEFT_ARROW)) player.x -= 3;
```

## GUI Controls

```js
let slider = createSlider(0, 100, 50, 1);
slider.position(10, height + 10);
let val = slider.value();

let btn = createButton("Reset");
btn.position(10, height + 40);
btn.mousePressed(() => { /* handle click */ });
```

## Responsive Canvas

```js
function setup() { createCanvas(windowWidth, windowHeight); }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
```

## Hit Detection

```js
function isMouseOverCircle(cx, cy, r) {
  return dist(mouseX, mouseY, cx, cy) < r;
}

function isMouseOverRect(rx, ry, rw, rh) {
  return mouseX > rx && mouseX < rx + rw && mouseY > ry && mouseY < ry + rh;
}
```

## Complete Working Example: Interactive Control Panel

```js
let particles = [];
let gravSlider, sizeSlider, clearBtn;

function setup() {
  createCanvas(600, 400);
  gravSlider = createSlider(0, 0.5, 0.1, 0.01);
  gravSlider.position(10, height + 10);

  sizeSlider = createSlider(2, 20, 6, 1);
  sizeSlider.position(10, height + 35);

  clearBtn = createButton("Clear");
  clearBtn.position(200, height + 10);
  clearBtn.mousePressed(() => { particles = []; });
}

function draw() {
  background(20, 20, 30, 30);
  let g = gravSlider.value();
  let s = sizeSlider.value();

  if (mouseIsPressed && mouseY < height) {
    particles.push({ x: mouseX, y: mouseY, vx: random(-3, 3), vy: random(-5, -1), life: 200, s: s });
  }

  for (let p of particles) {
    p.vy += g;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 2;
    if (p.y > height) { p.y = height; p.vy *= -0.6; }

    noStroke();
    fill(255, 150, 50, p.life);
    circle(p.x, p.y, p.s);
  }

  particles = particles.filter(p => p.life > 0);

  fill(200);
  noStroke();
  textSize(11);
  text(`Gravity: ${g.toFixed(2)} | Size: ${s} | Count: ${particles.length}`, 10, 15);
}
```

## Exercises

1. Implement drag-and-drop for circles on the canvas.
2. Create a full-screen responsive sketch with `windowResized`.
3. Build an interactive generative art piece controlled by 4+ sliders.

---

# 5. Pixel Manipulation

## Core Concepts

The `pixels[]` array stores RGBA color values for every pixel. Each pixel uses four consecutive array slots: R, G, B, A. Access with `loadPixels()` / `updatePixels()`. Always call `pixelDensity(1)` for correct indexing.

## Pixel Index Formula

```js
let index = (y * width + x) * 4;
let r = pixels[index + 0];
let g = pixels[index + 1];
let b = pixels[index + 2];
let a = pixels[index + 3];
```

## Common Operations

```js
// Grayscale conversion
let gray = 0.299 * r + 0.587 * g + 0.114 * b;

// Invert
pixels[i] = 255 - pixels[i];

// Brightness
pixels[i] = constrain(pixels[i] + amount, 0, 255);

// Contrast
pixels[i] = constrain((pixels[i] - 128) * factor + 128, 0, 255);

// Threshold
let val = gray > threshold ? 255 : 0;
```

## Complete Working Example: Sobel Edge Detection

```js
let img;

function preload() {
  img = loadImage("photo.jpg");
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
  noLoop();
}

function draw() {
  image(img, 0, 0);
  loadPixels();
  let src = pixels.slice(); // Copy original

  let gx = [[-1,0,1],[-2,0,2],[-1,0,1]];
  let gy = [[-1,-2,-1],[0,0,0],[1,2,1]];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sx = 0, sy = 0;
      for (let ky = -1; ky <= 1; ky++)
        for (let kx = -1; kx <= 1; kx++) {
          let idx = ((y+ky)*width + (x+kx)) * 4;
          let gray = 0.299*src[idx] + 0.587*src[idx+1] + 0.114*src[idx+2];
          sx += gray * gx[ky+1][kx+1];
          sy += gray * gy[ky+1][kx+1];
        }
      let mag = min(sqrt(sx*sx + sy*sy), 255);
      let i = (y*width + x) * 4;
      pixels[i] = pixels[i+1] = pixels[i+2] = mag;
      pixels[i+3] = 255;
    }
  }
  updatePixels();
}
```

## Pixel Sorting (Glitch Art)

Divide image rows into runs of bright pixels, sort each run by brightness, write back.

```js
// For each row, find runs of pixels above a brightness threshold
// Sort each run by pixel brightness
// Write sorted pixels back to the array
// See the full tutorial for complete implementation
```

## Exercises

1. Swap the red and blue channels of an image.
2. Implement a posterize effect (reduce each channel to 4 levels).
3. Create a mosaic effect by averaging 10x10 pixel blocks.

---

# 6. Types, Strings, and Binary Data

## JavaScript Primitive Types

| Type | Example | typeof |
|---|---|---|
| number | `42`, `3.14`, `NaN` | `"number"` |
| string | `"hello"`, `'world'` | `"string"` |
| boolean | `true`, `false` | `"boolean"` |
| undefined | `undefined` | `"undefined"` |
| null | `null` | `"object"` (bug!) |
| bigint | `42n` | `"bigint"` |
| symbol | `Symbol()` | `"symbol"` |

## Type Coercion Pitfalls

```js
"5" + 3     // "53" (concatenation, not addition!)
"5" - 3     // 2 (subtraction coerces to number)
5 == "5"    // true (loose equality coerces)
5 === "5"   // false (strict equality, no coercion -- ALWAYS USE THIS)
```

## Template Literals

```js
let info = `Canvas: ${width}x${height}, FPS: ${frameRate().toFixed(1)}`;
```

## String Methods

```js
let s = "hello world";
s.length;             // 11
s.toUpperCase();      // "HELLO WORLD"
s.split(" ");         // ["hello", "world"]
s.includes("world");  // true
s.slice(0, 5);        // "hello"
s.replace("world", "p5js"); // "hello p5js"
```

## Typed Arrays

Fixed-type numeric arrays for audio buffers, pixel data, and GPU communication.

```js
let buf = new Float32Array(256); // 256 floats, initialized to 0
buf[0] = sin(0.1);

let pixels = new Uint8ClampedArray(4); // Auto-clamps to 0-255
pixels[0] = 300; // Stored as 255
```

## Bit Operations

```js
let val = (x ^ y) & 0xFF;  // XOR pattern, masked to 0-255
let r = (packed >> 16) & 0xFF; // Extract red from packed RGBA
let floored = (3.7) | 0;      // Fast floor: 3
```

## Complete Working Example: Binary Visualizer

```js
let slider;

function setup() {
  createCanvas(500, 200);
  slider = createSlider(0, 255, 42, 1);
  slider.position(10, height + 10);
}

function draw() {
  background(30);
  let val = slider.value();
  let binary = val.toString(2).padStart(8, "0");

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
  text(`Decimal: ${val}   Binary: ${binary}   Hex: 0x${val.toString(16).toUpperCase().padStart(2, "0")}`, width / 2, 30);

  // Draw 8 bits as squares
  for (let bit = 7; bit >= 0; bit--) {
    let x = 80 + (7 - bit) * 50;
    let isSet = (val >> bit) & 1;
    fill(isSet ? color(100, 255, 100) : 60);
    stroke(200);
    rect(x, 80, 40, 40);
    fill(isSet ? 0 : 150);
    noStroke();
    textSize(20);
    text(isSet ? "1" : "0", x + 20, 100);
    fill(150);
    textSize(10);
    text(Math.pow(2, bit), x + 20, 135);
  }
}
```

## Exercises

1. Predict the output of `"" == false`, `[] + {}`, and `true + true`, then verify.
2. Build a waveform display using a `Float32Array` of 512 values.
3. Create a visualization that shows a number's binary representation, updating in real time.

---

# 7. Software Licenses and Copyright

## Core Concepts

**Copyright** is automatic -- the moment you create a work, you own the copyright. A **license** grants others permission to use your work under specified conditions. Without a license, the default is "all rights reserved."

## Key Licenses

| License | Type | Key Feature |
|---|---|---|
| **MIT** | Permissive | Do anything, include the license |
| **GPL** | Copyleft | Derivatives must also be GPL |
| **Apache 2.0** | Permissive | Includes patent grant |
| **CC BY** | Creative Commons | Attribute the creator |
| **CC BY-SA** | Creative Commons | Attribute + share alike |
| **CC BY-NC** | Creative Commons | Attribute + non-commercial |
| **CC0** | Public domain | No restrictions at all |

## For Your Final Project

Choose **two** licenses:
1. A **software license** for your code (MIT is a safe default)
2. A **Creative Commons license** for your creative work

## Attribution Requirements

From the syllabus: always credit collaborators, attribute borrowed code, mark LLM-generated code with the model name and prompts.

```js
// This function adapted from Daniel Shiffman, "The Nature of Code" (CC BY-NC 3.0)
// LLM-generated by Claude (Anthropic, 2026). Prompt: "collision detection function"
```

## The Free Culture Movement

Lawrence Lessig argues that overly restrictive copyright stifles creativity. Creative Commons licenses are a practical response, letting creators choose how freely their work can be shared.

## Exercises

1. Find the license of three libraries you use (p5.js, math.js, etc.). What are your obligations?
2. Write a LICENSE file for your final project.
3. Visit <https://choosealicense.com> and determine which license best fits your goals.

---

# 8. Games and Visual Art

## Core Concepts

The `setup()`/`draw()` loop is a game loop. Games add rules, goals, and player agency to this loop. Art games blur the boundary between interactive art and traditional game design.

## Collision Detection

```js
// Circle-circle
function circlesCollide(x1, y1, r1, x2, y2, r2) {
  return dist(x1, y1, x2, y2) < r1 + r2;
}

// Rectangle-rectangle (AABB)
function rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2+w2 && x1+w1 > x2 && y1 < y2+h2 && y1+h1 > y2;
}

// Point in circle
function pointInCircle(px, py, cx, cy, r) {
  return dist(px, py, cx, cy) < r;
}
```

## State Machines

```js
let state = "title";

function draw() {
  if (state === "title") drawTitle();
  else if (state === "playing") drawGame();
  else if (state === "gameover") drawGameOver();
}

function keyPressed() {
  if (state === "title" && keyCode === ENTER) state = "playing";
  if (state === "gameover" && keyCode === ENTER) state = "title";
}
```

## Game Feel (Juice)

- **Screen shake**: `translate(random(-n, n), random(-n, n))` on impact
- **Easing**: `displayScore = lerp(displayScore, targetScore, 0.1)`
- **Particle bursts**: spawn particles on events
- **Color flashes**: briefly change an object's color on collision

## Complete Working Example: Simple Collection Game

```js
let player, targets, score;

function setup() {
  createCanvas(500, 400);
  resetGame();
}

function resetGame() {
  player = { x: width/2, y: height/2, size: 15 };
  targets = [];
  for (let i = 0; i < 8; i++) spawnTarget();
  score = 0;
}

function spawnTarget() {
  targets.push({
    x: random(30, width-30), y: random(30, height-30),
    size: random(8, 18), hue: random(360), pulse: random(TWO_PI)
  });
}

function draw() {
  background(15, 15, 25);

  // Move player toward mouse
  player.x = lerp(player.x, mouseX, 0.1);
  player.y = lerp(player.y, mouseY, 0.1);

  // Check collection
  colorMode(HSB, 360, 100, 100, 100);
  for (let i = targets.length - 1; i >= 0; i--) {
    let t = targets[i];
    t.pulse += 0.05;
    let s = t.size * (1 + sin(t.pulse) * 0.2);

    noStroke();
    fill(t.hue, 60, 80, 30);
    circle(t.x, t.y, s * 3);
    fill(t.hue, 70, 95);
    circle(t.x, t.y, s);

    if (dist(player.x, player.y, t.x, t.y) < player.size + t.size) {
      targets.splice(i, 1);
      spawnTarget();
      score++;
    }
  }

  // Draw player
  colorMode(RGB);
  fill(200, 230, 255);
  noStroke();
  circle(player.x, player.y, player.size * 2);

  fill(200);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Collected: " + score, 10, 10);
}
```

## Exercises

1. Add a state machine (title, play, pause, game over) to the collection game.
2. Implement Pong with paddle AI and scoring.
3. Design a non-competitive art game where the goal is aesthetic exploration.

---

# 9. Sound and Audio Programming

## Core Concepts

p5.sound wraps the Web Audio API, providing oscillators, envelopes, filters, FFT analysis, and sound file playback. Always call `userStartAudio()` because browsers require a user gesture before audio can play.

## Oscillators

Four waveform types: `sine` (pure), `square` (buzzy), `sawtooth` (bright), `triangle` (soft).

```js
let osc = new p5.Oscillator("sine");
osc.freq(440);       // Frequency in Hz
osc.amp(0.3);        // Amplitude (0 to 1)
osc.start();
osc.amp(0, 0.5);     // Fade out over 0.5 seconds
```

## Envelopes (ADSR)

Shape a sound's volume over time: Attack, Decay, Sustain, Release.

```js
let env = new p5.Envelope();
env.setADSR(0.01, 0.2, 0.3, 0.5);
env.setRange(0.5, 0);
env.play(osc); // Trigger the envelope on the oscillator
```

## Filters

Route audio through a filter to shape the spectrum.

```js
let filter = new p5.LowPass();
osc.disconnect();
osc.connect(filter);
filter.freq(1000);  // Cutoff frequency
filter.res(5);      // Resonance
```

## FFT Analysis

```js
let fft = new p5.FFT(0.8, 256);
let spectrum = fft.analyze();     // Frequency amplitudes (0-255)
let waveform = fft.waveform();    // Time-domain (-1 to 1)
let bass = fft.getEnergy("bass"); // Energy in frequency range
```

## Sound Files

```js
function preload() { sound = loadSound("music.mp3"); }
sound.play();
sound.loop();
sound.rate(1.5);   // Playback speed
sound.setVolume(0.5);
```

## Complete Working Example: Mini Synth Keyboard

```js
let osc, env;
let keyMap = {
  'a': 261.63, 's': 293.66, 'd': 329.63,
  'f': 349.23, 'g': 392.00, 'h': 440.00,
  'j': 493.88, 'k': 523.25
};

function setup() {
  createCanvas(500, 200);
  osc = new p5.Oscillator("sine");
  osc.amp(0);
  osc.start();
  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.3, 0.3);
  env.setRange(0.4, 0);
}

function draw() {
  background(30);
  let keys = Object.keys(keyMap);
  let w = width / keys.length;

  for (let i = 0; i < keys.length; i++) {
    let pressed = keyIsDown(keys[i].charCodeAt(0));
    fill(pressed ? color(100, 200, 255) : 220);
    stroke(0);
    rect(i * w, 40, w - 2, 140);
    fill(80);
    noStroke();
    textAlign(CENTER);
    textSize(16);
    text(keys[i].toUpperCase(), i * w + w/2, 170);
  }

  fill(200);
  textSize(12);
  textAlign(CENTER);
  text("Press A-K to play notes", width/2, 25);
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (keyMap[k]) {
    osc.freq(keyMap[k]);
    env.play(osc);
  }
}
```

## Exercises

1. Build a theremin: mouse X = pitch, mouse Y = volume, with waveform visualization.
2. Create a 4-track drum machine with step sequencing.
3. Make an audio-reactive visual that responds differently to bass, mid, and treble frequencies.

---

# Appendix: Quick Reference

## p5.js Lifecycle

```
preload() -> setup() -> draw() [loops at ~60fps]
                         ^
                    mousePressed(), keyPressed(), etc. (interrupts)
```

## Common Patterns

```js
// Particle management
particles.push(new Particle(x, y));              // Spawn
particles = particles.filter(p => p.alive);      // Remove dead
particles.forEach(p => { p.update(); p.display(); }); // Update all

// Pixel access
pixelDensity(1);
loadPixels();
let i = (y * width + x) * 4;
// pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]
updatePixels();

// State machine
let state = "title";
function draw() {
  if (state === "title") { ... }
  else if (state === "playing") { ... }
}

// Responsive canvas
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
```

---

## Further Reading

- Daniel Shiffman, _The Nature of Code_: <https://natureofcode.com>
- MDN JavaScript reference: <https://developer.mozilla.org/en-US/docs/Web/JavaScript>
- p5.js reference: <https://p5js.org/reference/>
- Choose a license: <https://choosealicense.com>
- Creative Commons: <https://creativecommons.org/choose/>
- Eloquent JavaScript: <https://eloquentjavascript.net>
- The Coding Train: <https://thecodingtrain.com>
