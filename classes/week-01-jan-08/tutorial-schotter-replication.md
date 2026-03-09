# Tutorial: Replicating Georg Nees' "Schotter" in p5.js

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Introduction

Georg Nees (1926--2016) was one of the earliest pioneers of computer-generated art. His 1968 piece **"Schotter"** (German for "gravel" or "rubble") is one of the most iconic works in the history of generative art. It consists of a grid of squares that begin perfectly aligned at the top and become increasingly disordered toward the bottom, as if order is slowly dissolving into chaos.

In this tutorial, you will recreate Schotter from scratch in p5.js. Along the way, you will learn:

- How to lay out a grid of shapes
- How `rectMode(CENTER)` changes rectangle drawing
- How `push()` and `pop()` isolate coordinate transformations
- How `translate()` and `rotate()` work together
- How to introduce controlled randomness that increases with each row

---

## Step 1: Setting Up the Canvas and Grid Parameters

Before drawing anything, we need to decide on our grid dimensions. Nees' original piece uses approximately 12 columns and 22 rows of squares.

```js
function setup() {
  createCanvas(600, 900);
  noLoop(); // We only need to draw once
}

function draw() {
  background(255);

  let cols = 12;
  let rows = 22;
  let squareSize = 30;

  // Calculate margins to center the grid on the canvas
  let gridWidth = cols * squareSize;
  let gridHeight = rows * squareSize;
  let marginX = (width - gridWidth) / 2;
  let marginY = (height - gridHeight) / 2;
}
```

**Why `noLoop()`?** Since Schotter is a static image, we only need to run `draw()` once. Calling `noLoop()` in `setup()` prevents p5.js from calling `draw()` repeatedly (the default is 60 times per second).

---

## Step 2: Drawing a Simple Grid of Squares

Let us first draw a perfectly ordered grid -- no randomness yet.

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

This draws a clean, orderly grid. Every square is placed at the correct position. But there is a problem: if we later want to rotate a square, `rect()` by default draws from the **top-left corner**. That means rotating will swing the square around its corner, not its center.

---

## Step 3: Using `rectMode(CENTER)`

By default, `rect(x, y, w, h)` draws a rectangle with `(x, y)` as the **top-left corner**. If we call `rectMode(CENTER)`, then `(x, y)` becomes the **center** of the rectangle. This is essential for rotation -- we want squares to spin around their own center.

```js
function draw() {
  background(255);

  let cols = 12;
  let rows = 22;
  let squareSize = 30;

  let gridWidth = cols * squareSize;
  let gridHeight = rows * squareSize;
  let marginX = (width - gridWidth) / 2;
  let marginY = (height - gridHeight) / 2;

  noFill();
  stroke(0);
  strokeWeight(1);
  rectMode(CENTER); // Draw rectangles from their center

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Offset by half a squareSize so centers align with grid
      let x = marginX + col * squareSize + squareSize / 2;
      let y = marginY + row * squareSize + squareSize / 2;
      rect(x, y, squareSize, squareSize);
    }
  }
}
```

Notice we added `squareSize / 2` to both `x` and `y`. This is because when using `rectMode(CENTER)`, we need to position the center of each square where the center of each grid cell should be.

---

## Step 4: Understanding `push()`, `pop()`, `translate()`, and `rotate()`

This is the heart of the technique. Here is the key idea:

1. **`translate(x, y)`** moves the origin (0, 0) of the coordinate system to position (x, y).
2. **`rotate(angle)`** rotates the entire coordinate system around the current origin.
3. **`push()`** saves the current state of the coordinate system (and styles).
4. **`pop()`** restores the saved state.

When we combine these, we can:
- Move to where a square should be (`translate`)
- Rotate the coordinate system (`rotate`)
- Draw the square at (0, 0) -- since we translated, this is the right spot
- Restore the old coordinate system (`pop`) so the next square is unaffected

```js
// Conceptual pattern for each square:
push();                    // Save the current state
translate(centerX, centerY); // Move origin to the square's center
rotate(someAngle);         // Rotate around that center
rect(0, 0, size, size);   // Draw at the (new) origin
pop();                     // Restore -- undo translate and rotate
```

**Why is `push()`/`pop()` necessary?** Without it, each `translate()` and `rotate()` would accumulate. The second square would be offset by both the first and second translations. The grid would be completely wrong.

---

## Step 5: Adding Increasing Randomness

The defining feature of Schotter is that randomness increases from top to bottom. The top rows are perfectly ordered; the bottom rows are chaotic.

We control this with a **displacement factor** that depends on the row number:

```js
let displaceFactor = row / rows; // 0 at top, approaches 1 at bottom
```

We then use this factor to scale both positional displacement and rotation:

```js
let maxDisplace = squareSize * 0.5;  // Maximum position offset
let maxRotation = PI / 4;            // Maximum rotation (45 degrees)

let offsetX = random(-maxDisplace, maxDisplace) * displaceFactor;
let offsetY = random(-maxDisplace, maxDisplace) * displaceFactor;
let angle = random(-maxRotation, maxRotation) * displaceFactor;
```

At row 0, `displaceFactor` is 0, so all offsets and rotations are zero. At the bottom row, `displaceFactor` is close to 1, so offsets and rotations can reach their maximum values.

---

## Step 6: Complete Working Code

Here is the full, working Schotter replication:

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

  // Style
  noFill();
  stroke(0);
  strokeWeight(1);
  rectMode(CENTER);

  // Maximum displacement and rotation
  let maxDisplace = squareSize * 0.5;
  let maxRotation = PI / 4;

  for (let row = 0; row < rows; row++) {
    // How much disorder this row gets (0 at top, 1 at bottom)
    let displaceFactor = row / (rows - 1);

    for (let col = 0; col < cols; col++) {
      // Calculate the center of this grid cell
      let centerX = marginX + col * squareSize + squareSize / 2;
      let centerY = marginY + row * squareSize + squareSize / 2;

      // Random offsets scaled by row position
      let offsetX = random(-maxDisplace, maxDisplace) * displaceFactor;
      let offsetY = random(-maxDisplace, maxDisplace) * displaceFactor;
      let angle = random(-maxRotation, maxRotation) * displaceFactor;

      // Draw the square with transformation
      push();
      translate(centerX + offsetX, centerY + offsetY);
      rotate(angle);
      rect(0, 0, squareSize, squareSize);
      pop();
    }
  }
}
```

---

## Step 7: Making It Reproducible with `randomSeed()`

Every time you run this sketch, you get a different version of Schotter. If you want the **same** output every time (useful for sharing, debugging, or comparing), use `randomSeed()`:

```js
function setup() {
  createCanvas(600, 900);
  noLoop();
}

function draw() {
  background(255);
  randomSeed(42); // Any integer -- the same seed always produces the same result

  let cols = 12;
  let rows = 22;
  let squareSize = 30;

  let gridWidth = cols * squareSize;
  let gridHeight = rows * squareSize;
  let marginX = (width - gridWidth) / 2;
  let marginY = (height - gridHeight) / 2;

  noFill();
  stroke(0);
  strokeWeight(1);
  rectMode(CENTER);

  let maxDisplace = squareSize * 0.5;
  let maxRotation = PI / 4;

  for (let row = 0; row < rows; row++) {
    let displaceFactor = row / (rows - 1);

    for (let col = 0; col < cols; col++) {
      let centerX = marginX + col * squareSize + squareSize / 2;
      let centerY = marginY + row * squareSize + squareSize / 2;

      let offsetX = random(-maxDisplace, maxDisplace) * displaceFactor;
      let offsetY = random(-maxDisplace, maxDisplace) * displaceFactor;
      let angle = random(-maxRotation, maxRotation) * displaceFactor;

      push();
      translate(centerX + offsetX, centerY + offsetY);
      rotate(angle);
      rect(0, 0, squareSize, squareSize);
      pop();
    }
  }
}
```

Now `randomSeed(42)` ensures that `random()` always produces the same sequence of numbers. Change `42` to any other integer to get a different (but still reproducible) version.

---

## Step 8: Variations to Explore

### Variation A: Non-linear Increase in Disorder

Instead of a linear ramp, try a quadratic or exponential increase:

```js
// Quadratic -- disorder increases slowly at first, then rapidly
let displaceFactor = pow(row / (rows - 1), 2);

// Square root -- disorder increases quickly at first, then levels off
let displaceFactor = sqrt(row / (rows - 1));
```

### Variation B: Color Fading

Add a gradual color transition:

```js
let grayValue = map(row, 0, rows - 1, 0, 180);
stroke(grayValue);
```

### Variation C: Circles Instead of Squares

Replace the square with a circle to see how the same algorithm feels different:

```js
ellipse(0, 0, squareSize, squareSize);
```

### Variation D: Both Position and Size Randomness

```js
let sizeVariation = squareSize + random(-5, 5) * displaceFactor;
rect(0, 0, sizeVariation, sizeVariation);
```

---

## How to Run This Code

1. Go to the [p5.js Web Editor](https://editor.p5js.org/).
2. Delete any existing code in the editor.
3. Paste in the complete code from Step 6 (or Step 7 for reproducible output).
4. Click the **Play** button (triangle icon).
5. You should see a Schotter-like image appear in the preview panel.

---

## Key Concepts Summary

| Concept | What It Does |
|---|---|
| `rectMode(CENTER)` | Draws rectangles from their center, not top-left corner |
| `push()` / `pop()` | Saves and restores the coordinate system state |
| `translate(x, y)` | Moves the origin to (x, y) |
| `rotate(angle)` | Rotates the coordinate system (radians by default) |
| `random(min, max)` | Returns a random float between min and max |
| `randomSeed(n)` | Makes `random()` produce the same sequence every time |
| `noLoop()` | Stops `draw()` from being called repeatedly |

---

## Exercises

1. **Change the grid size.** Try 6 columns and 30 rows. How does it change the feeling?
2. **Reverse the disorder.** Make the bottom row orderly and the top row chaotic.
3. **Add a mouse interaction.** Make the disorder level follow `mouseY` instead of the row number. Remove `noLoop()` for this.
4. **Create your own "Schotter."** Choose a different shape (triangle, hexagon, letter) and apply the same principle.
