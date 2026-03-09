# Chapter 1: Foundations of Computing Arts

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Table of Contents

1. [JavaScript and p5.js: Your Creative Toolkit](#1-javascript-and-p5js-your-creative-toolkit)
2. [CPU vs GPU Rendering](#2-cpu-vs-gpu-rendering)
3. [Recreating Georg Nees' Schotter](#3-recreating-georg-nees-schotter)
4. [Translation and Rotation](#4-translation-and-rotation)
5. [Compression and Complexity](#5-compression-and-complexity)
6. [Determinism and Pseudorandomness](#6-determinism-and-pseudorandomness)
7. [Recursion](#7-recursion)
8. [Enumeration and Bitwise Operations](#8-enumeration-and-bitwise-operations)
9. [Data Compression](#9-data-compression)
10. [Anemic Cinema: Adapting Art Across Media](#10-anemic-cinema-adapting-art-across-media)
11. [Exercises](#11-exercises)

---

## 1. JavaScript and p5.js: Your Creative Toolkit

### 1.1 What Is p5.js?

**p5.js** is a JavaScript library for creative coding. It provides simple functions for drawing shapes, handling animation, responding to user input, and working with color, sound, and video -- all inside a web browser.

p5.js is the spiritual successor to **Processing**, a Java-based creative coding environment created by Casey Reas and Ben Fry at MIT Media Lab in 2001. Processing has been enormously influential in art, design, and education. p5.js brings the same philosophy to the web:

- **Accessibility:** No installation required. Write code in a browser, see results immediately.
- **Expressiveness:** Designed for visual thinkers and artists, not just engineers.
- **Community:** Large, supportive community of artists, designers, and educators.

### 1.2 Processing vs p5.js

| Feature | Processing (Java) | p5.js (JavaScript) |
|---------|-------------------|---------------------|
| Language | Java | JavaScript |
| Platform | Desktop application | Web browser |
| Installation | Required | None (use the web editor) |
| Performance | Higher (compiled) | Lower (interpreted) |
| 3D support | Robust (OpenGL) | Available (WebGL) |
| Community | Established since 2001 | Growing since 2014 |
| Sharing | Export as application | Share a URL |

### 1.3 Browser Limitations

Running in a browser means:

- **Performance:** JavaScript is interpreted (not compiled), so it is generally slower than Processing/Java. Complex sketches with millions of pixels or particles may lag.
- **Security sandbox:** The browser restricts access to the file system, hardware, and other tabs. You cannot read arbitrary files from the user's computer.
- **Canvas size:** Limited by available memory and GPU capabilities. Very large canvases (10,000 x 10,000 pixels) may cause performance issues.
- **Frame rate:** The browser tries to run `draw()` at 60 frames per second, but complex sketches may drop below this.

Despite these limitations, p5.js is more than capable for the work in this course.

### 1.4 JavaScript Basics You Need

If you have never written JavaScript before, here are the essentials:

#### Variables

```js
let x = 100;        // A number
let name = "hello";  // A string
let flag = true;     // A boolean
```

Use `let` to declare variables. Variables declared with `let` can be reassigned.

#### Functions

```js
function greet(name) {
  return "Hello, " + name + "!";
}

let message = greet("World"); // "Hello, World!"
```

#### Conditionals

```js
if (x > 100) {
  // Do something
} else if (x > 50) {
  // Do something else
} else {
  // Default
}
```

#### Loops

```js
// For loop
for (let i = 0; i < 10; i++) {
  // Runs 10 times, i goes from 0 to 9
}

// While loop
let count = 0;
while (count < 5) {
  count++;
}
```

#### Arrays

```js
let colors = [255, 128, 0];
let first = colors[0];   // 255
colors.push(64);          // Add to end
let len = colors.length;  // 4
```

### 1.5 The p5.js Program Structure

Every p5.js sketch has two main functions:

```js
function setup() {
  // Runs ONCE when the program starts
  createCanvas(400, 400);
}

function draw() {
  // Runs REPEATEDLY (default: 60 times per second)
  background(220);
  ellipse(mouseX, mouseY, 50, 50);
}
```

- **`setup()`** is called once. Use it to create the canvas and set initial conditions.
- **`draw()`** is called repeatedly in a loop. Use it to create animation and respond to user input.
- **`createCanvas(w, h)`** creates the drawing area with width `w` and height `h`.
- **`background(gray)`** fills the canvas with a solid color, effectively clearing the previous frame.

### 1.6 Drawing Basics

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240);

  // Shapes
  fill(255, 0, 0);      // Red fill
  stroke(0);             // Black outline
  strokeWeight(2);       // 2-pixel outline

  rect(50, 50, 100, 80);        // Rectangle: x, y, width, height
  ellipse(250, 100, 80, 80);    // Circle: centerX, centerY, width, height
  line(50, 200, 350, 200);      // Line: x1, y1, x2, y2
  triangle(200, 250, 150, 350, 250, 350); // Triangle: x1,y1, x2,y2, x3,y3

  // Text
  fill(0);
  noStroke();
  textSize(16);
  text("Hello, p5.js!", 50, 390);
}
```

---

## 2. CPU vs GPU Rendering

### 2.1 What Is the Difference?

Your computer has two processors that can draw graphics:

- **CPU (Central Processing Unit):** A general-purpose processor. Very fast at sequential tasks. Has a few powerful cores (typically 4-16).
- **GPU (Graphics Processing Unit):** A specialized processor designed for parallel computation. Has thousands of small cores that can process many pixels simultaneously.

### 2.2 How p5.js Uses Them

By default, p5.js uses the **Canvas 2D API**, which is primarily CPU-based. The CPU calculates where each shape goes and what color each pixel should be.

When you use `createCanvas(400, 400, WEBGL)`, p5.js switches to **WebGL**, which uses the GPU. This is much faster for 3D rendering and large numbers of shapes, but the programming model is slightly different.

```js
// CPU rendering (default)
function setup() {
  createCanvas(400, 400);  // Uses Canvas 2D (CPU)
}

// GPU rendering
function setup() {
  createCanvas(400, 400, WEBGL);  // Uses WebGL (GPU)
}
```

### 2.3 When Does It Matter?

For most 2D sketches with a few hundred shapes, the CPU is fast enough. The GPU becomes important when:

- Drawing thousands or millions of shapes per frame
- Working with 3D geometry
- Applying pixel-level effects (shaders)
- Processing video or large images in real-time

For this course, we will primarily use the default 2D renderer (CPU). The concepts apply regardless of which processor does the work.

---

## 3. Recreating Georg Nees' Schotter

### 3.1 Who Was Georg Nees?

Georg Nees (1926--2016) was a German academic and one of the first artists to use a computer to create visual art. Along with Frieder Nake and A. Michael Noll, Nees was part of the pioneering generation of computer artists in the 1960s.

In 1965, Nees exhibited computer-generated graphics at the Studiengalerie of the University of Stuttgart -- one of the first exhibitions of computer art anywhere in the world.

### 3.2 What Is Schotter?

**Schotter** (1968) is Nees' most famous work. "Schotter" means "gravel" or "rubble" in German. The piece consists of a grid of approximately 12 columns and 22 rows of squares. At the top, the squares are perfectly aligned. As you move down the grid, the squares become increasingly displaced and rotated, as if the orderly grid is dissolving into chaos.

The piece is a visual metaphor for the transition from order to disorder -- a theme that resonates with information theory, thermodynamics, and the human experience of entropy.

### 3.3 Setting Up the Grid

We begin by establishing the grid parameters:

```js
function setup() {
  createCanvas(600, 900);
  noLoop();
}

function draw() {
  background(255);

  let cols = 12;
  let rows = 22;
  let squareSize = 30;

  // Center the grid on the canvas
  let gridWidth = cols * squareSize;
  let gridHeight = rows * squareSize;
  let marginX = (width - gridWidth) / 2;
  let marginY = (height - gridHeight) / 2;

  noFill();
  stroke(0);
  strokeWeight(1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = marginX + col * squareSize;
      let y = marginY + row * squareSize;
      rect(x, y, squareSize, squareSize);
    }
  }
}
```

This produces a perfectly aligned grid. Every square sits in its assigned position.

### 3.4 Understanding `rectMode(CENTER)`

By default, `rect(x, y, w, h)` draws a rectangle with its **top-left corner** at `(x, y)`. But when we want to rotate a square, we need it to spin around its **center**, not its corner.

`rectMode(CENTER)` changes the behavior so that `(x, y)` is the **center** of the rectangle:

```js
rectMode(CENTER);
rect(200, 200, 50, 50); // Center at (200, 200), not top-left
```

When using `rectMode(CENTER)`, we need to position each square at the center of its grid cell, so we add half the square size to both coordinates.

### 3.5 The Transform Pattern: push/translate/rotate/pop

To rotate each square independently around its own center, we use this pattern for every square:

```js
push();                      // Save the current coordinate system
translate(centerX, centerY); // Move the origin to this square's center
rotate(angle);               // Rotate around that center
rect(0, 0, size, size);     // Draw the square at the (new) origin
pop();                       // Restore the original coordinate system
```

This is essential. Without `push()` and `pop()`, each `translate()` and `rotate()` would accumulate, and subsequent squares would be drawn in completely wrong positions.

### 3.6 Adding Controlled Randomness

The key to Schotter is that the amount of randomness **increases with each row**:

```js
let displaceFactor = row / (rows - 1); // 0 at top, 1 at bottom
```

This factor multiplies the random displacement and rotation:

```js
let offsetX = random(-maxDisplace, maxDisplace) * displaceFactor;
let offsetY = random(-maxDisplace, maxDisplace) * displaceFactor;
let angle   = random(-maxRotation, maxRotation) * displaceFactor;
```

At the top (row 0), the factor is 0, so all offsets are zero -- perfect order. At the bottom, the factor approaches 1, allowing maximum disorder.

### 3.7 The Complete Schotter Program

```js
function setup() {
  createCanvas(600, 900);
  noLoop();
}

function draw() {
  background(255);

  let cols = 12;
  let rows = 22;
  let squareSize = 30;

  // Center the grid
  let gridWidth = cols * squareSize;
  let gridHeight = rows * squareSize;
  let marginX = (width - gridWidth) / 2;
  let marginY = (height - gridHeight) / 2;

  // Style
  noFill();
  stroke(0);
  strokeWeight(1);
  rectMode(CENTER);

  // Maximum amounts of displacement and rotation
  let maxDisplace = squareSize * 0.5;
  let maxRotation = PI / 4; // 45 degrees

  for (let row = 0; row < rows; row++) {
    let displaceFactor = row / (rows - 1);

    for (let col = 0; col < cols; col++) {
      // Center of this grid cell
      let centerX = marginX + col * squareSize + squareSize / 2;
      let centerY = marginY + row * squareSize + squareSize / 2;

      // Random offsets, scaled by row position
      let offsetX = random(-maxDisplace, maxDisplace) * displaceFactor;
      let offsetY = random(-maxDisplace, maxDisplace) * displaceFactor;
      let angle = random(-maxRotation, maxRotation) * displaceFactor;

      // Draw the square
      push();
      translate(centerX + offsetX, centerY + offsetY);
      rotate(angle);
      rect(0, 0, squareSize, squareSize);
      pop();
    }
  }
}
```

### 3.8 Making It Reproducible

Add `randomSeed(42)` at the beginning of `draw()` to get the same output every time:

```js
function draw() {
  background(255);
  randomSeed(42);
  // ... rest of code
}
```

---

## 4. Translation and Rotation

### 4.1 The Coordinate System

In p5.js:
- The origin (0, 0) is the **top-left corner** of the canvas.
- x increases to the **right**.
- y increases **downward** (opposite of standard math).
- Angles are in **radians** by default; positive angles go **clockwise**.

### 4.2 `translate(x, y)`

`translate(x, y)` moves the origin of the coordinate system to position (x, y). After this call, drawing at (0, 0) actually draws at what was (x, y).

Translations are **cumulative**: calling `translate(100, 0)` then `translate(50, 0)` moves the origin to (150, 0).

### 4.3 `rotate(angle)`

`rotate(angle)` rotates the entire coordinate system around the **current origin**. The angle is in radians.

Important: rotation happens around wherever the origin currently is. If the origin is at (0, 0) (the top-left corner), the entire drawing swings around that corner. This is why you almost always `translate()` first.

### 4.4 The Standard Pattern

```js
push();                    // Save state
translate(x, y);           // Move to desired position
rotate(angle);             // Rotate around that position
// Draw shapes at (0, 0)
pop();                     // Restore state
```

### 4.5 Nested Transformations

You can nest `push()`/`pop()` blocks to create hierarchical coordinate systems:

```js
push();
translate(200, 200);     // Move to the "parent" position
rotate(parentAngle);

  // Draw the parent shape
  rect(0, 0, 100, 20);

  push();
  translate(100, 0);     // Move relative to the parent
  rotate(childAngle);

    // Draw the child shape
    rect(0, 0, 50, 10);

  pop();

pop();
```

The child shape's position and rotation are relative to the parent. When the parent rotates, the child moves with it and adds its own rotation on top. This is how robotic arms, skeletons, and solar system models are typically structured.

### 4.6 An Animated Example

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240);
  rectMode(CENTER);

  // Arm segment 1 (upper arm)
  let angle1 = sin(frameCount * 0.02) * 0.5;
  // Arm segment 2 (forearm)
  let angle2 = sin(frameCount * 0.03) * 0.8;
  // Hand
  let angle3 = sin(frameCount * 0.05) * 1.0;

  push();
  translate(200, 200); // Shoulder joint

  // Upper arm
  rotate(angle1);
  fill(200, 100, 100);
  stroke(0);
  rect(50, 0, 100, 20);

  // Elbow joint
  translate(100, 0);
  rotate(angle2);
  fill(100, 200, 100);
  rect(40, 0, 80, 16);

  // Wrist joint
  translate(80, 0);
  rotate(angle3);
  fill(100, 100, 200);
  rect(20, 0, 40, 12);

  pop();

  // Joint markers
  fill(0);
  noStroke();
  ellipse(200, 200, 8, 8);
}
```

---

## 5. Compression and Complexity

### 5.1 Kolmogorov Complexity

The **Kolmogorov complexity** of an object is the length of the shortest program (in some fixed programming language) that produces that object as output.

Consider two 400x400 pixel images:

**Image A: A red circle on white**
```js
function draw() {
  background(255);
  fill(255, 0, 0);
  noStroke();
  ellipse(200, 200, 300, 300);
}
```
Program length: approximately 120 characters.

**Image B: Random colored pixels**
To reproduce one specific arrangement of random pixels, you would need to list every pixel's color. For a 400x400 image with 3 color channels, that is 480,000 values -- roughly 480,000 bytes of program.

Image A has low Kolmogorov complexity. Image B has high Kolmogorov complexity. The difference is that Image A has **structure** (a simple geometric shape) that can be described compactly, while Image B has no exploitable structure.

### 5.2 Compressibility

Kolmogorov complexity is theoretically uncomputable (you can never be certain you have found the absolute shortest program). But we can approximate it using practical **compression algorithms**.

A file that compresses well (small compressed size relative to original) has low complexity. A file that does not compress has high complexity.

| Image | Raw Size | PNG Size | Source Code Size |
|-------|----------|----------|-----------------|
| Red circle | 480 KB | ~5 KB | ~120 bytes |
| Random noise | 480 KB | ~470 KB | ~480 KB (per pixel) |
| Schotter | 480 KB | ~15 KB | ~500 bytes |

The source code is a form of compression. The p5.js Schotter program is about 500 bytes. The PNG of its output is about 15 KB. The raw bitmap is about 480 KB. Each is a valid representation of the same image, at different levels of compression.

### 5.3 Low-Complexity Art and Schmidhuber's Thesis

Jurgen Schmidhuber proposed that humans find beauty in things that are **compressible but not trivially simple**. We enjoy discovering patterns -- the "aha!" moment when apparent complexity resolves into an elegant rule.

- **Too simple** (blank canvas): No surprise, boring.
- **Too complex** (random noise): No pattern to discover, overwhelming.
- **Sweet spot** (Schotter, fractals, music): Complex enough to engage, structured enough to comprehend.

Generative art lives in this sweet spot: short programs (low Kolmogorov complexity) that produce rich visual output (high apparent complexity).

---

## 6. Determinism and Pseudorandomness

### 6.1 The Problem

Computers are deterministic. Given the same inputs, they produce the same outputs. But art often needs randomness -- variation, surprise, organic irregularity. How do we reconcile this?

### 6.2 Pseudorandom Number Generators

A **PRNG** is a deterministic algorithm that produces a sequence of numbers that *appear* random. It starts from a **seed** value and applies a mathematical transformation to produce each next number.

The same seed always produces the same sequence. Different seeds produce different sequences. The sequences pass statistical tests for randomness (uniform distribution, no obvious patterns).

### 6.3 How a PRNG Works: The Xorshift Example

One of the simplest modern PRNGs is the **xorshift** algorithm. It uses only three operations:

```js
function xorshift32(state) {
  state ^= state << 13;   // XOR with left-shifted self
  state ^= state >> 17;   // XOR with right-shifted self
  state ^= state << 5;    // XOR with left-shifted self
  return state >>> 0;      // Force unsigned 32-bit integer
}
```

Each operation mixes the bits of the state. After three operations, every output bit depends on many input bits, creating an "avalanche effect" that makes the output appear random.

The `^` operator is XOR (exclusive or): it outputs 1 when the two input bits are different, and 0 when they are the same. The `<<` and `>>` operators shift bits left and right.

### 6.4 The C++ PRNG from Lecture

The lecture showed a C++ style PRNG. Here is the logic explained:

```js
// This is the classic LCG (Linear Congruential Generator)
// used by many C standard libraries
let state = seed;

function nextRandom() {
  state = (state * 1103515245 + 12345) & 0x7FFFFFFF;
  return state;
}
```

The multiplication by a large constant scrambles the bits. Adding a constant ensures the sequence does not get stuck at zero. The `& 0x7FFFFFFF` keeps the number within 31-bit range.

### 6.5 `randomSeed()` in p5.js

p5.js wraps all of this behind a simple interface:

```js
randomSeed(42);           // Set the seed
let a = random(100);      // Always the same value for seed 42
let b = random(100);      // Always the same next value
```

Without `randomSeed()`, p5.js uses a seed derived from system entropy (current time, hardware state), so each run is different.

### 6.6 Why This Matters for Art

Pseudorandomness gives you the best of both worlds:

- **Variation:** Each seed produces a unique composition.
- **Reproducibility:** Record the seed, and you can recreate the exact composition at any time.
- **Exploration:** Systematically try different seeds to find the best output.
- **Sharing:** Share your code and seed; anyone can verify the output.

In the generative NFT world, the seed is often the token ID. Each token produces a unique artwork, but the same token always produces the same artwork.

---

## 7. Recursion

### 7.1 What Is Recursion?

**Recursion** is when a function calls itself. It is a powerful technique for solving problems that have a natural hierarchical or self-similar structure.

Every recursive function needs:
1. **A base case:** When to stop (prevents infinite recursion).
2. **A recursive case:** How to break the problem into smaller versions of itself.

### 7.2 Factorial

The factorial of n (written n!) is the product of all integers from 1 to n:

```js
function factorial(n) {
  if (n === 0) return 1;       // Base case
  return n * factorial(n - 1); // Recursive case
}

// factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
```

### 7.3 Fibonacci

Each Fibonacci number is the sum of the two before it:

```js
function fib(n) {
  if (n <= 1) return n;            // Base cases: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2); // Recursive case
}

// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
```

Warning: this naive implementation is exponentially slow. For n > 30, it becomes impractical.

### 7.4 Greatest Common Divisor (Euclidean Algorithm)

```js
function gcd(a, b) {
  if (b === 0) return a;       // Base case
  return gcd(b, a % b);       // Recursive case
}

// gcd(48, 18) -> gcd(18, 12) -> gcd(12, 6) -> gcd(6, 0) -> 6
```

This algorithm is over 2,300 years old and still used in modern computing.

### 7.5 Recursive Drawing: A Fractal Tree

Recursion produces striking visual results. A fractal tree draws a branch, then calls itself to draw two smaller branches at the tip:

```js
function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw() {
  background(255);
  stroke(60, 30, 10);
  translate(width / 2, height);
  drawBranch(130, 9);
}

function drawBranch(length, thickness) {
  if (length < 4) {
    // Base case: draw a leaf
    fill(50, 180, 50, 150);
    noStroke();
    ellipse(0, 0, 8, 8);
    return;
  }

  // Draw this branch
  strokeWeight(thickness);
  stroke(60 + (130 - length), 30, 10);
  line(0, 0, 0, -length);

  // Move to the tip
  translate(0, -length);

  // Right branch
  push();
  rotate(PI / 6);
  drawBranch(length * 0.7, thickness * 0.7);
  pop();

  // Left branch
  push();
  rotate(-PI / 6);
  drawBranch(length * 0.7, thickness * 0.7);
  pop();
}
```

The tree is self-similar: each branch is a smaller version of the whole tree. This is the essence of fractals, and recursion is the natural way to express them in code.

### 7.6 How Deep Does It Go?

The depth of recursion is determined by the base case. In the tree example, each recursive call reduces the branch length by 30% (multiply by 0.7). Starting from 130:

```
130 -> 91 -> 63.7 -> 44.6 -> 31.2 -> 21.8 -> 15.3 -> 10.7 -> 7.5 -> 5.2 -> 3.7 (stop!)
```

That is about 10 levels deep, producing 2^10 = 1024 leaf nodes. The tree appears complex, but it is generated by a very short program -- another example of low Kolmogorov complexity producing high visual complexity.

---

## 8. Enumeration and Bitwise Operations

### 8.1 Bitwise Operations

Computers represent everything as binary numbers (sequences of 0s and 1s). **Bitwise operations** manipulate individual bits:

| Operation | Symbol | What It Does |
|-----------|--------|-------------|
| AND       | `&`    | 1 only if both bits are 1 |
| OR        | `\|`   | 1 if either bit is 1 |
| XOR       | `^`    | 1 if bits differ |
| NOT       | `~`    | Flips all bits |
| Left shift  | `<<` | Moves bits left (multiplies by 2) |
| Right shift | `>>` | Moves bits right (divides by 2) |

### 8.2 Checking a Specific Bit

The most useful technique for enumeration is checking whether a specific bit is set:

```js
// Is bit k set in number n?
let isSet = (n & (1 << k)) !== 0;
```

How it works:
- `1 << k` creates a "mask" with only bit k set. For k=3, the mask is `0b1000` (decimal 8).
- `n & mask` keeps only the bit at position k. If that bit is 1 in n, the result is non-zero. If it is 0, the result is zero.

### 8.3 Enumeration: Listing All Subsets

If you have n elements, each can be either included or excluded. There are 2^n possible subsets. You can represent each subset as a number from 0 to 2^n - 1, where bit k indicates whether element k is included.

For a square with 4 edges:
- 0 = `0000` = no edges
- 1 = `0001` = top edge only
- 5 = `0101` = top and bottom edges
- 15 = `1111` = all four edges

```js
function setup() {
  createCanvas(700, 250);
  noLoop();
}

function draw() {
  background(255);

  let size = 50;
  let margin = 15;
  let cols = 8;

  for (let n = 0; n < 16; n++) {
    let col = n % cols;
    let row = floor(n / cols);
    let x = margin + col * (size + margin) + size / 2;
    let y = margin + row * (size + margin + 20) + size / 2;

    push();
    translate(x, y);
    stroke(0);
    strokeWeight(2);
    let half = size / 2;

    if (n & 1) line(-half, -half, half, -half);   // Top
    if (n & 2) line(half, -half, half, half);      // Right
    if (n & 4) line(-half, half, half, half);      // Bottom
    if (n & 8) line(-half, -half, -half, half);    // Left

    fill(100);
    noStroke();
    textSize(9);
    textAlign(CENTER);
    text(n.toString(2).padStart(4, '0'), 0, half + 14);
    pop();
  }
}
```

### 8.4 Sol LeWitt's Incomplete Open Cubes

In 1974, Sol LeWitt created *Incomplete Open Cubes* -- a work that systematically enumerates all ways to remove edges from a cube while keeping the structure connected and three-dimensional.

A cube has 12 edges, giving 2^12 = 4096 possible subsets. LeWitt identified 122 that meet his criteria. This is conceptual art as computation: define the rules, enumerate the possibilities, present them all.

The connection to computing is direct. LeWitt's work is an algorithm:

1. For each of the 4096 subsets of 12 edges:
   a. Check if the remaining edges form a connected graph.
   b. Check if the structure spans all three dimensions.
   c. If both conditions are met, include it.
2. Display all valid configurations.

A computer can perform this enumeration in milliseconds. LeWitt did it by hand, which is itself a kind of performance art.

### 8.5 Cube Edge Enumeration in p5.js

```js
let current = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(245);
  translate(width / 2, height / 2);

  if (frameCount % 5 === 0) {
    current = (current + 1) % 4096;
  }

  let s = 80;
  let d = s * 0.5; // Depth offset for isometric view

  // 8 vertices of a cube in isometric-ish projection
  let v = [
    {x: -s, y: s},   {x: s, y: s},     // Front bottom: 0, 1
    {x: s, y: -s},    {x: -s, y: -s},   // Front top: 2, 3
    {x: -s+d, y: s-d},{x: s+d, y: s-d}, // Back bottom: 4, 5
    {x: s+d, y: -s-d},{x: -s+d, y: -s-d}// Back top: 6, 7
  ];

  // 12 edges
  let edges = [
    [0,1],[1,2],[2,3],[3,0],  // Front face
    [4,5],[5,6],[6,7],[7,4],  // Back face
    [0,4],[1,5],[2,6],[3,7]   // Connecting
  ];

  for (let i = 0; i < 12; i++) {
    if (current & (1 << i)) {
      stroke(0);
      strokeWeight(2.5);
    } else {
      stroke(230);
      strokeWeight(0.5);
    }
    line(v[edges[i][0]].x, v[edges[i][0]].y,
         v[edges[i][1]].x, v[edges[i][1]].y);
  }

  // Count edges
  let count = 0;
  for (let i = 0; i < 12; i++) if (current & (1 << i)) count++;

  fill(0);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text("#" + current + " | " + count + " edges", 0, s + 40);
  text(current.toString(2).padStart(12, '0'), 0, s + 58);
}
```

---

## 9. Data Compression

### 9.1 Run-Length Encoding (RLE)

The simplest compression algorithm. Replace runs of identical values with a count:

```
AAAAABBBCC  ->  5A3B2C
```

Good for images with large uniform areas (like the red circle). Bad for random data.

```js
function rleEncode(str) {
  let result = "";
  let i = 0;
  while (i < str.length) {
    let ch = str[i];
    let count = 1;
    while (i + count < str.length && str[i + count] === ch) {
      count++;
    }
    result += count + ch;
    i += count;
  }
  return result;
}

function rleDecode(str) {
  let result = "";
  let i = 0;
  while (i < str.length) {
    let numStr = "";
    while (i < str.length && str[i] >= '0' && str[i] <= '9') {
      numStr += str[i];
      i++;
    }
    let count = parseInt(numStr);
    let ch = str[i];
    result += ch.repeat(count);
    i++;
  }
  return result;
}

function setup() {
  createCanvas(600, 300);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textFont('monospace');
  textSize(14);

  let tests = [
    "AAAAAABBBCCDDDDDDDD",
    "ABCDEFGH",
    "RRRRRRRRRRRRRRR",
    "AABBCCDD"
  ];

  let y = 30;
  for (let t of tests) {
    let enc = rleEncode(t);
    let dec = rleDecode(enc);
    let ratio = (enc.length / t.length * 100).toFixed(0);
    text("Original: " + t, 20, y);
    text("Encoded:  " + enc + "  (" + ratio + "%)", 20, y + 18);
    text("Decoded:  " + dec + "  [" + (dec === t ? "OK" : "ERROR") + "]", 20, y + 36);
    y += 65;
  }
}
```

### 9.2 Huffman Coding

A more sophisticated algorithm that assigns shorter binary codes to more frequent symbols:

1. Count the frequency of each symbol.
2. Build a binary tree where frequent symbols are near the root (short codes) and rare symbols are far from the root (long codes).
3. The code for each symbol is the path from root to leaf (left = 0, right = 1).

This guarantees that no code is a prefix of another (making decoding unambiguous) and that the total encoding is as short as possible for a symbol-by-symbol encoding.

### 9.3 How PNG Combines Techniques

PNG uses:
1. **Row filtering:** Each row of pixels is compared to the row above (delta encoding).
2. **LZ77:** Finds repeated sequences and replaces them with references to earlier occurrences.
3. **Huffman coding:** Encodes the LZ77 output using optimal variable-length codes.

This combination makes PNG excellent for images with patterns (geometric art, screenshots, diagrams) but poor for random data.

### 9.4 Compression as a Complexity Measure

Since Kolmogorov complexity is uncomputable, we use compression as a practical proxy:

- **High compression ratio** (output much smaller than input) means low complexity -- the data has patterns.
- **Low compression ratio** (output nearly the same size as input) means high complexity -- the data is unpredictable.

For generative art, this means: if you can describe your image with a short program, and the PNG of that image is also small, you have created something with low Kolmogorov complexity but potentially high aesthetic value.

---

## 10. Anemic Cinema: Adapting Art Across Media

### 10.1 Marcel Duchamp's Anemic Cinema

In 1926, Marcel Duchamp created *Anemic Cinema*, a seven-minute film of spinning discs. Some discs bear spiral patterns that create optical illusions of depth; others display French puns arranged in spirals.

The title is an anagram ("anemic" rearranges to "cinema"), reflecting Duchamp's love of wordplay and conceptual games.

### 10.2 Rotoreliefs

Duchamp's **Rotoreliefs** (1935) are flat cardboard discs printed with patterns -- eccentric circles, spirals, geometric forms -- designed to be placed on a turntable and spun at 33 1/3 RPM. When spinning, the flat patterns create vivid illusions of three-dimensional motion.

The key insight: a simple set of rules (geometry + constant rotation) produces an emergent experience (perceived depth and motion) that is far more complex than the input.

### 10.3 Adaptation as Translation

Moving art between media is an act of translation. You must decide what is essential:

| Aspect | Essential? | Why/Why Not |
|--------|-----------|-------------|
| The pattern | Yes | Without the pattern, there is no illusion |
| Rotation | Yes | Without motion, the illusion does not work |
| The physical disc | No | The disc is just a delivery mechanism |
| Turntable speed | Partly | The effect works at various speeds |
| The viewer's eyes | Yes | The illusion is a perceptual phenomenon |

When we write p5.js code for a rotorelief, we are preserving the pattern and rotation while discarding the physical medium. We add something new: interactivity (the viewer can change speed, eccentricity, colors).

### 10.4 A p5.js Rotorelief

```js
function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(250, 245, 235);
  translate(width / 2, height / 2);
  rotate(frameCount * 0.02);

  noFill();
  stroke(30);
  strokeWeight(1.5);

  for (let i = 0; i < 25; i++) {
    let t = i / 25;
    let eccentric = sin(t * PI) * 50;
    let r = 20 + i * 16;
    ellipse(eccentric, 0, r, r);
  }
}
```

When this runs, the flat eccentric circles create a compelling illusion of a three-dimensional cone or funnel pulsating toward and away from the viewer. The code is about 250 bytes. The visual experience is far richer than those 250 bytes suggest.

### 10.5 Using LLMs as Creative Partners

Large Language Models can help translate artistic concepts into code. This is a new form of the adaptation chain:

**Original artwork** -> **Description of rules** -> **LLM prompt** -> **Generated code** -> **Digital artwork**

The artistic decisions remain with you: what to create, how to evaluate results, when to iterate. The LLM handles the translation from natural language to code. This is analogous to Sol LeWitt writing instructions and assistants executing them, or Duchamp choosing a readymade and the gallery context doing the rest.

Tips for working with LLMs on creative code:
- Describe the **effect** you want, not just the shapes
- Provide **constraints** (canvas size, color palette, number of elements)
- **Iterate**: run the code, evaluate, describe changes
- **Understand** the generated code so you can modify it yourself

---

## 11. Exercises

### Fundamentals

**Exercise 1: First Sketch**
Create a p5.js sketch that draws your initials using only `line()`, `rect()`, and `ellipse()`. No text functions allowed.

**Exercise 2: Animated Circle**
Draw a circle that moves from left to right across the canvas. When it reaches the right edge, it should reappear on the left.

### Schotter and Transformations

**Exercise 3: Modified Schotter**
Modify the Schotter program so that randomness increases from left to right instead of top to bottom.

**Exercise 4: Color Schotter**
Add color to Schotter. Map the row number to a color gradient (for example, blue at the top transitioning to red at the bottom).

**Exercise 5: Interactive Schotter**
Remove `noLoop()` and make the displacement factor depend on `mouseY` instead of the row number. The entire grid should respond to the mouse.

**Exercise 6: Nested Rotations**
Create a "solar system" with a sun at the center, a planet orbiting the sun, and a moon orbiting the planet. Use nested `push()`/`pop()` blocks.

### Recursion

**Exercise 7: Recursive Countdown**
Write a recursive function `countdown(n)` that prints n, n-1, ..., 1, "Go!" without using any loops.

**Exercise 8: Recursive Sum**
Write a recursive function `sumTo(n)` that returns 1 + 2 + ... + n.

**Exercise 9: Three-Branch Tree**
Modify the fractal tree so each branch splits into three sub-branches instead of two. Experiment with angles.

**Exercise 10: Sierpinski Triangle**
Implement a recursive Sierpinski triangle. Start with a large triangle. At each level, subdivide into three smaller triangles (removing the center one).

### Compression and Complexity

**Exercise 11: RLE Visualizer**
Create a p5.js sketch that draws a row of colored squares, then shows the RLE-encoded version below it. Let the user click squares to toggle their color and watch the encoded version change.

**Exercise 12: Shortest Interesting Program**
What is the shortest p5.js `draw()` function you can write that produces a visually interesting static image? Try to get under 140 characters (tweet-length).

**Exercise 13: Complexity Comparison**
Create three 200x200 images: (a) a solid color, (b) a geometric pattern, (c) random noise. For each, calculate how many bytes your p5.js source code is. Which is shortest? Why?

### Enumeration and Bitwise

**Exercise 14: Triangle Edge Subsets**
A triangle has 3 edges. Write a sketch that displays all 2^3 = 8 subsets of a triangle's edges.

**Exercise 15: Bit Counting**
Write a function `countBits(n)` that returns the number of 1-bits in n. Use it to display all numbers from 0 to 255 as a grid, with each cell shaded by its bit count.

### Anemic Cinema

**Exercise 16: Your Own Rotorelief**
Design an original rotorelief pattern. It should create an optical illusion of depth or motion when the sketch rotates it. Experiment with spirals, concentric shapes, and eccentric offsets.

**Exercise 17: Interactive Rotorelief**
Create a rotorelief where `mouseX` controls rotation speed and `mouseY` controls the eccentricity (offset) of the circles. Add a key press to cycle through different patterns.

**Exercise 18: Adaptation Essay**
Choose a non-digital artwork (painting, sculpture, or performance). In 300 words, describe how you would adapt it to p5.js. What is essential? What would you change? What would you add?

### Challenge

**Exercise 19: Seed Gallery**
Create a sketch that displays a 4x4 grid of small generative compositions, each using a different random seed. Press a key to advance to the next 16 seeds. Include the seed number under each image.

**Exercise 20: Combining Everything**
Create a single sketch that incorporates at least four concepts from this chapter: transformations, recursion, randomness with seeds, and bitwise operations. Write a comment at the top explaining your concept.

---

## Summary

This chapter covered the foundations of computing arts:

1. **p5.js** is your creative coding environment. It runs in the browser and provides simple functions for drawing, animation, and interaction.

2. **Coordinate transformations** (`translate`, `rotate`, `push`, `pop`) let you position and orient shapes independently. The standard pattern is push-translate-rotate-draw-pop.

3. **Kolmogorov complexity** measures the shortest program that produces a given output. It connects program length to image complexity and explains why generative art works: short programs can produce visually rich output.

4. **Data compression** (RLE, Huffman, PNG) exploits patterns to reduce file sizes. Compression ratio is a practical approximation of Kolmogorov complexity.

5. **Pseudorandomness** lets computers simulate randomness deterministically. Seeds make generative art reproducible and shareable. The PRNG is a deterministic machine that expands a short seed into a long, random-looking sequence.

6. **Recursion** is a function calling itself with simpler inputs. It naturally expresses self-similar structures like fractal trees and is connected to mathematical concepts (factorial, Fibonacci, GCD).

7. **Enumeration** and **bitwise operations** let you systematically explore all possible configurations. Sol LeWitt's *Incomplete Open Cubes* is a conceptual art precedent for computational enumeration.

8. **Anemic Cinema** by Marcel Duchamp demonstrates how art can be reduced to rules (patterns + rotation) and adapted across media. The digital version adds interactivity and parameterization.

These ideas are not just technical tools. They are ways of thinking about art: as rules, as compression, as exploration of possibility spaces, as the translation of ideas across media. The computer does not replace the artist -- it extends the artist's reach into territories that would be impossible to explore by hand.
