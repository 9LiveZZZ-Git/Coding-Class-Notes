# Tutorial: Recursion and Enumeration

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Introduction

Recursion and enumeration are two powerful ideas that connect mathematics, computer science, and art. **Recursion** is when a function calls itself to solve a problem by breaking it into smaller versions of the same problem. **Enumeration** is the systematic listing of all possibilities -- a way to exhaustively explore a space of configurations.

In this tutorial, you will:

1. Implement classic recursive functions (factorial, Fibonacci, GCD)
2. Draw a recursive fractal tree in p5.js
3. Explore bitwise operations
4. Understand Sol LeWitt's *Incomplete Open Cubes* through enumeration
5. Use bitwise operations to generate and visualize combinatorial art

---

## Part 1: Recursion -- The Concept

A recursive function has two essential parts:

1. **Base case:** A condition where the function returns a result directly, without calling itself. This prevents infinite recursion.
2. **Recursive case:** The function calls itself with a "smaller" or "simpler" input, moving toward the base case.

Think of it like Russian nesting dolls (matryoshka). You open a doll, and inside is a smaller doll. You open that, and there is an even smaller one. Eventually you reach the smallest doll that does not open -- that is the base case.

---

## Part 2: Recursive Factorial

The **factorial** of a non-negative integer n (written n!) is the product of all positive integers up to n:

- 5! = 5 * 4 * 3 * 2 * 1 = 120
- 0! = 1 (by definition)

### Recursive Definition

- Base case: factorial(0) = 1
- Recursive case: factorial(n) = n * factorial(n - 1)

### Code

```js
function factorial(n) {
  // Base case
  if (n === 0) {
    return 1;
  }
  // Recursive case
  return n * factorial(n - 1);
}

function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(16);
  textFont('monospace');

  // Display factorials from 0! to 12!
  for (let i = 0; i <= 12; i++) {
    let result = factorial(i);
    text(i + "! = " + result, 30, 30 + i * 28);
  }
}
```

### How It Unfolds

When you call `factorial(4)`, here is what happens step by step:

```
factorial(4)
  = 4 * factorial(3)
  = 4 * (3 * factorial(2))
  = 4 * (3 * (2 * factorial(1)))
  = 4 * (3 * (2 * (1 * factorial(0))))
  = 4 * (3 * (2 * (1 * 1)))
  = 4 * (3 * (2 * 1))
  = 4 * (3 * 2)
  = 4 * 6
  = 24
```

The function keeps calling itself until it hits the base case (`n === 0`), then all the multiplications resolve as the calls return.

---

## Part 3: Recursive Fibonacci

The **Fibonacci sequence** starts with 0 and 1, and each subsequent number is the sum of the two preceding ones:

0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ...

### Recursive Definition

- Base cases: fib(0) = 0, fib(1) = 1
- Recursive case: fib(n) = fib(n - 1) + fib(n - 2)

### Code

```js
function fib(n) {
  // Base cases
  if (n === 0) return 0;
  if (n === 1) return 1;
  // Recursive case
  return fib(n - 1) + fib(n - 2);
}

function setup() {
  createCanvas(500, 400);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(16);
  textFont('monospace');

  text("Fibonacci Sequence:", 20, 30);

  for (let i = 0; i <= 15; i++) {
    let result = fib(i);
    text("fib(" + i + ") = " + result, 20, 60 + i * 22);
  }
}
```

### A Word of Warning

This naive recursive Fibonacci is elegant but **very slow** for large n. Each call to `fib(n)` makes two recursive calls, leading to an exponential explosion. `fib(40)` will take several seconds; `fib(50)` may freeze your browser.

For practical use, you would use **memoization** (caching results) or an iterative approach. But the recursive version beautifully illustrates the concept.

### Visualizing the Fibonacci Spiral

```js
function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw() {
  background(255);
  translate(300, 350);

  let a = 0;
  let b = 1;
  let scale = 4; // Scale factor for visibility

  stroke(0);
  noFill();
  strokeWeight(1.5);

  let angle = 0;
  for (let i = 0; i < 12; i++) {
    let size = b * scale;

    push();
    // Each quarter-turn of the spiral
    rotate(angle);

    // Draw the square
    rect(0, -size, size, size);

    // Draw the arc (quarter circle) inside the square
    arc(0, 0, size * 2, size * 2, -HALF_PI, 0);

    pop();

    // Move to next Fibonacci number
    let temp = a + b;
    a = b;
    b = temp;
    angle -= HALF_PI;
  }
}
```

---

## Part 4: Recursive GCD (Greatest Common Divisor)

The **Euclidean algorithm** finds the greatest common divisor of two numbers. It is one of the oldest known algorithms (circa 300 BCE).

### Recursive Definition

- Base case: gcd(a, 0) = a
- Recursive case: gcd(a, b) = gcd(b, a % b)

The `%` operator gives the remainder after division.

### Code

```js
function gcd(a, b) {
  // Base case
  if (b === 0) {
    return a;
  }
  // Recursive case
  return gcd(b, a % b);
}

function setup() {
  createCanvas(500, 400);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(16);
  textFont('monospace');

  text("Greatest Common Divisors:", 20, 30);

  let pairs = [
    [48, 18], [100, 75], [17, 13], [144, 89],
    [1071, 462], [270, 192], [60, 24], [7, 0]
  ];

  for (let i = 0; i < pairs.length; i++) {
    let a = pairs[i][0];
    let b = pairs[i][1];
    let result = gcd(a, b);
    text("gcd(" + a + ", " + b + ") = " + result, 20, 60 + i * 25);
  }
}
```

### How GCD(48, 18) Unfolds

```
gcd(48, 18)
  = gcd(18, 48 % 18)  = gcd(18, 12)
  = gcd(12, 18 % 12)  = gcd(12, 6)
  = gcd(6,  12 % 6)   = gcd(6,  0)
  = 6   (base case: b is 0)
```

---

## Part 5: Drawing a Recursive Fractal Tree

Recursion shines in generative art. A fractal tree is drawn by a function that draws a branch, then calls itself twice to draw two smaller branches at the end.

### Simple Fractal Tree

```js
function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw() {
  background(255);

  // Start the tree from the bottom center
  stroke(60, 30, 10);
  translate(width / 2, height);

  // Draw the tree
  drawBranch(150, 10);
}

function drawBranch(length, thickness) {
  // Base case: stop if the branch is too short
  if (length < 4) {
    // Draw a leaf
    fill(50, 180, 50, 150);
    noStroke();
    ellipse(0, 0, 8, 8);
    return;
  }

  // Draw this branch
  strokeWeight(thickness);
  stroke(60 + (150 - length), 30, 10);
  line(0, 0, 0, -length);

  // Move to the end of this branch
  translate(0, -length);

  // Draw two sub-branches
  let newLength = length * 0.7;
  let newThickness = thickness * 0.7;
  let spreadAngle = PI / 6; // 30 degrees

  // Right branch
  push();
  rotate(spreadAngle);
  drawBranch(newLength, newThickness);
  pop();

  // Left branch
  push();
  rotate(-spreadAngle);
  drawBranch(newLength, newThickness);
  pop();
}
```

### How It Works

1. `drawBranch(150, 10)` draws the trunk (150 pixels long).
2. It translates to the end of the trunk.
3. It calls itself twice: once rotated right, once rotated left, each with a shorter branch (150 * 0.7 = 105).
4. Each of those calls draws a shorter branch and calls itself twice more.
5. This continues until the branch length is less than 4 pixels (the base case), where a leaf is drawn.

### Interactive Fractal Tree

```js
let angle;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);

  // Map mouse position to branch angle
  angle = map(mouseX, 0, width, 0, PI / 3);

  stroke(60, 30, 10);
  translate(width / 2, height);
  drawBranch(120, 8);
}

function drawBranch(length, thickness) {
  if (length < 4) {
    fill(50, 180, 50, 120);
    noStroke();
    ellipse(0, 0, 6, 6);
    return;
  }

  strokeWeight(thickness);
  stroke(80, 50, 20);
  line(0, 0, 0, -length);
  translate(0, -length);

  let newLength = length * 0.67;
  let newThickness = thickness * 0.67;

  push();
  rotate(angle);
  drawBranch(newLength, newThickness);
  pop();

  push();
  rotate(-angle);
  drawBranch(newLength, newThickness);
  pop();
}
```

Move your mouse left and right to change the branching angle. This creates a huge variety of tree shapes, all from the same recursive structure.

---

## Part 6: Bitwise Operations

Before we get to enumeration, we need to understand **bitwise operations**. These operate on the individual bits (0s and 1s) of integers.

### Binary Representation

Every integer can be represented in binary (base 2):

| Decimal | Binary |
|---------|--------|
| 0       | 0000   |
| 1       | 0001   |
| 2       | 0010   |
| 3       | 0011   |
| 5       | 0101   |
| 10      | 1010   |
| 15      | 1111   |

### The Bitwise Operators

| Operator | Symbol | Description |
|----------|--------|-------------|
| AND      | `&`    | 1 only if both bits are 1 |
| OR       | `\|`   | 1 if either bit is 1 |
| XOR      | `^`    | 1 if bits are different |
| NOT      | `~`    | Flips all bits |
| Left shift  | `<<` | Shifts bits left (multiply by 2) |
| Right shift | `>>` | Shifts bits right (divide by 2) |

### Truth Tables

```
AND (&)       OR (|)        XOR (^)       NOT (~)
0 & 0 = 0    0 | 0 = 0     0 ^ 0 = 0     ~0 = 1
0 & 1 = 0    0 | 1 = 1     0 ^ 1 = 1     ~1 = 0
1 & 0 = 0    1 | 0 = 1     1 ^ 0 = 1
1 & 1 = 1    1 | 1 = 1     1 ^ 1 = 0
```

### Bitwise Examples in Code

```js
function setup() {
  createCanvas(600, 500);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(14);
  textFont('monospace');

  let a = 0b1100;  // 12 in decimal
  let b = 0b1010;  // 10 in decimal

  let y = 30;
  text("a       = " + toBinary(a) + "  (" + a + ")", 20, y); y += 25;
  text("b       = " + toBinary(b) + "  (" + b + ")", 20, y); y += 35;

  text("a & b   = " + toBinary(a & b) + "  (" + (a & b) + ")  AND", 20, y); y += 25;
  text("a | b   = " + toBinary(a | b) + "  (" + (a | b) + ")  OR", 20, y); y += 25;
  text("a ^ b   = " + toBinary(a ^ b) + "  (" + (a ^ b) + ")  XOR", 20, y); y += 35;

  text("a << 1  = " + toBinary(a << 1) + " (" + (a << 1) + ")  Left shift", 20, y); y += 25;
  text("a >> 1  = " + toBinary(a >> 1) + "  (" + (a >> 1) + ")   Right shift", 20, y); y += 35;

  // Checking individual bits
  text("--- Checking individual bits of a (" + toBinary(a) + ") ---", 20, y); y += 30;

  for (let bit = 3; bit >= 0; bit--) {
    let isSet = (a & (1 << bit)) !== 0;
    text("Bit " + bit + ": " + (isSet ? "1 (set)" : "0 (not set)"), 20, y);
    y += 22;
  }
}

// Helper: convert to 4-digit binary string
function toBinary(n) {
  return (n >>> 0).toString(2).padStart(4, '0');
}
```

### Checking If a Specific Bit Is Set

This is the key technique for enumeration:

```js
// Is bit k set in number n?
let isSet = (n & (1 << k)) !== 0;
```

- `1 << k` creates a number with only bit k set (a "mask").
- `n & mask` is non-zero only if bit k is also set in n.

For example, to check bit 2 of n = 0b1010:
- `1 << 2` = 0b0100
- `0b1010 & 0b0100` = 0b0000 = 0, so bit 2 is not set.

To check bit 3 of n = 0b1010:
- `1 << 3` = 0b1000
- `0b1010 & 0b1000` = 0b1000 = 8, which is not 0, so bit 3 is set.

---

## Part 7: Enumeration and Sol LeWitt's Incomplete Open Cubes

### What Is Enumeration?

Enumeration means systematically listing all possible configurations. If you have n binary choices, there are 2^n total combinations. You can represent each combination as a number from 0 to 2^n - 1, where each bit represents one choice.

### Sol LeWitt's Incomplete Open Cubes

In 1974, conceptual artist Sol LeWitt created *Incomplete Open Cubes*: a systematic enumeration of all the ways you can remove edges from a cube while keeping the remaining edges connected and the structure three-dimensional.

A cube has 12 edges. Each edge is either present or absent, giving 2^12 = 4096 possible subsets of edges. But most of these do not form a connected, 3D structure. LeWitt found 122 valid configurations.

### Simplified Version: Enumerating Edge Subsets of a Square

Let us start with something simpler -- a square has 4 edges. We can enumerate all 2^4 = 16 subsets:

```js
function setup() {
  createCanvas(600, 400);
  noLoop();
}

function draw() {
  background(255);

  let size = 60;
  let margin = 20;
  let cols = 8;

  // A square has 4 edges. We enumerate all 2^4 = 16 subsets.
  // Bit 0: top edge
  // Bit 1: right edge
  // Bit 2: bottom edge
  // Bit 3: left edge

  for (let n = 0; n < 16; n++) {
    let col = n % cols;
    let row = floor(n / cols);
    let x = margin + col * (size + margin) + size / 2;
    let y = margin + row * (size + margin + 20) + size / 2;

    push();
    translate(x, y);

    // Draw each edge if its corresponding bit is set
    stroke(0);
    strokeWeight(2);

    let halfSize = size / 2;

    // Bit 0: top edge
    if (n & (1 << 0)) {
      line(-halfSize, -halfSize, halfSize, -halfSize);
    }
    // Bit 1: right edge
    if (n & (1 << 1)) {
      line(halfSize, -halfSize, halfSize, halfSize);
    }
    // Bit 2: bottom edge
    if (n & (1 << 2)) {
      line(-halfSize, halfSize, halfSize, halfSize);
    }
    // Bit 3: left edge
    if (n & (1 << 3)) {
      line(-halfSize, -halfSize, -halfSize, halfSize);
    }

    // Label with binary and decimal
    fill(100);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text(n + " (" + n.toString(2).padStart(4, '0') + ")", 0, halfSize + 16);

    pop();
  }

  // Title
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text("All 16 subsets of a square's 4 edges", margin, height - 15);
}
```

### A 3D Cube Edge Enumeration Viewer

Now let us build a more ambitious version -- enumerating edges of a cube in a simple isometric projection:

```js
let currentSubset = 0;

function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(245);

  // Cycle through subsets slowly
  if (frameCount % 10 === 0) {
    currentSubset = (currentSubset + 1) % 4096; // 2^12 = 4096
  }

  translate(width / 2, height / 2);

  let s = 100; // Edge length

  // Isometric-style cube vertices
  // Front face: bottom-left, bottom-right, top-right, top-left
  // Back face: same but offset
  let dx = s * 0.4;
  let dy = s * 0.3;

  let vertices = [
    // Front face (indices 0-3)
    { x: -s/2,      y: s/2       },  // 0: front bottom-left
    { x: s/2,       y: s/2       },  // 1: front bottom-right
    { x: s/2,       y: -s/2      },  // 2: front top-right
    { x: -s/2,      y: -s/2      },  // 3: front top-left
    // Back face (indices 4-7)
    { x: -s/2 + dx, y: s/2 - dy  },  // 4: back bottom-left
    { x: s/2 + dx,  y: s/2 - dy  },  // 5: back bottom-right
    { x: s/2 + dx,  y: -s/2 - dy },  // 6: back top-right
    { x: -s/2 + dx, y: -s/2 - dy },  // 7: back top-left
  ];

  // 12 edges of a cube, as pairs of vertex indices
  let edges = [
    // Front face
    [0, 1], [1, 2], [2, 3], [3, 0],
    // Back face
    [4, 5], [5, 6], [6, 7], [7, 4],
    // Connecting edges
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  // Draw edges that are "on" in the current subset
  for (let i = 0; i < 12; i++) {
    let v1 = vertices[edges[i][0]];
    let v2 = vertices[edges[i][1]];

    if (currentSubset & (1 << i)) {
      // Edge is present
      stroke(0);
      strokeWeight(3);
    } else {
      // Edge is absent -- draw faintly
      stroke(220);
      strokeWeight(1);
    }
    line(v1.x, v1.y, v2.x, v2.y);
  }

  // Count set bits
  let edgeCount = 0;
  for (let i = 0; i < 12; i++) {
    if (currentSubset & (1 << i)) edgeCount++;
  }

  // Label
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  text("Subset #" + currentSubset + " / 4095", 0, s + 60);
  text(edgeCount + " edges present", 0, s + 80);
  text("Binary: " + currentSubset.toString(2).padStart(12, '0'), 0, s + 100);
}
```

### How This Relates to Sol LeWitt

Sol LeWitt did not use a computer. He manually determined which of the 4096 subsets formed valid "incomplete open cubes" -- structures that were connected and recognizably three-dimensional. He found 122. The artistic act was in defining the **rules** and then exhaustively executing them. The idea is the machine; the artist writes the specification.

This is deeply connected to computing: an algorithm is a set of rules, and a computer exhaustively executes them.

---

## Part 8: Recursive Fractal -- Sierpinski Triangle

As a bonus example combining recursion and drawing:

```js
function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  noStroke();

  // Start with a large triangle
  sierpinski(width / 2, 50, 500, 7);
}

function sierpinski(x, y, size, depth) {
  if (depth === 0) {
    // Base case: draw a filled triangle
    triangle(
      x, y,
      x - size / 2, y + size * (sqrt(3) / 2),
      x + size / 2, y + size * (sqrt(3) / 2)
    );
    return;
  }

  let half = size / 2;
  let h = size * (sqrt(3) / 2);

  // Three recursive calls for three sub-triangles
  sierpinski(x, y, half, depth - 1);                    // Top
  sierpinski(x - half / 2, y + h / 2, half, depth - 1); // Bottom-left
  sierpinski(x + half / 2, y + h / 2, half, depth - 1); // Bottom-right
}
```

---

## Exercises

1. **Recursive countdown:** Write a recursive function `countdown(n)` that prints numbers from n down to 1, then prints "Go!". No loops allowed.

2. **Recursive sum:** Write `sumTo(n)` that returns the sum of all integers from 1 to n using recursion.

3. **Modify the fractal tree:** Add a third branch in the middle. What does the tree look like with 3 branches per node?

4. **Enumerate triangles:** A triangle has 3 edges. Enumerate all 2^3 = 8 subsets and draw them in a row.

5. **Interactive Sierpinski:** Make the depth of the Sierpinski triangle follow `mouseX`. Map mouseX from 0 to width into depth 0 to 8.

6. **Bit counter:** Write a function `countBits(n)` that returns how many bits are set to 1 in the binary representation of n. Use the `&` operator in a loop.

---

## Key Takeaways

- **Recursion** solves problems by having a function call itself with simpler inputs, until a base case is reached.
- Classic examples: factorial, Fibonacci, GCD.
- Recursive drawing creates fractal patterns -- complex shapes from simple rules.
- **Bitwise operations** manipulate individual bits and are essential for enumeration.
- `n & (1 << k)` checks if bit k is set -- this lets you iterate over all subsets.
- **Enumeration** systematically explores all possibilities, connecting computation to conceptual art like Sol LeWitt's work.
