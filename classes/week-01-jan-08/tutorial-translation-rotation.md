# Tutorial: Translation and Rotation in p5.js

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Introduction

When you draw shapes in p5.js, you specify positions using coordinates like `rect(100, 200, 50, 50)`. But what if you want to rotate that rectangle? Or build a complex figure out of many parts that all move together? Coordinate transformations -- `translate()`, `rotate()`, `push()`, and `pop()` -- are the tools that make this possible.

This tutorial covers:

1. The p5.js coordinate system
2. `translate()` -- moving the origin
3. `rotate()` -- spinning the coordinate system
4. `push()` and `pop()` -- saving and restoring state
5. Combining transformations
6. Nested transformations for complex drawings

---

## Part 1: The Default Coordinate System

In p5.js, the canvas coordinate system works like this:

- The **origin** (0, 0) is at the **top-left corner** of the canvas.
- The **x-axis** increases to the **right**.
- The **y-axis** increases **downward** (this is the opposite of math class!).
- Angles are measured in **radians** by default, with positive angles going **clockwise**.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240);

  // Draw a red dot at the origin (top-left corner)
  fill(255, 0, 0);
  noStroke();
  ellipse(0, 0, 10, 10);

  // Draw axes
  stroke(0);
  strokeWeight(2);
  // X-axis (horizontal)
  line(0, 0, width, 0);
  // Y-axis (vertical)
  line(0, 0, 0, height);

  // Label
  fill(0);
  noStroke();
  textSize(14);
  text("(0,0)", 10, 20);
  text("x increases -->", width / 2 - 50, 20);
  text("y increases", 10, height / 2);
  text("    |", 10, height / 2 + 16);
  text("    v", 10, height / 2 + 30);
}
```

---

## Part 2: `translate()` -- Moving the Origin

`translate(x, y)` moves the origin of the coordinate system. After calling `translate(200, 150)`, the point (0, 0) is now at what was previously (200, 150).

### Example: Drawing at the Center

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(240);

  // Without translate: draw a square at (200, 200)
  stroke(200, 0, 0);
  noFill();
  rect(200, 200, 50, 50); // Top-left corner at (200, 200)

  // With translate: move origin to center, then draw at (0, 0)
  translate(200, 200);
  stroke(0, 0, 200);
  rect(0, 0, 50, 50); // This square appears at the SAME position!

  // Draw a dot at the new origin
  fill(0, 0, 200);
  noStroke();
  ellipse(0, 0, 8, 8);
}
```

Both rectangles appear at the same position because `translate(200, 200)` moved the origin to (200, 200), so drawing at (0, 0) is the same as drawing at (200, 200) in the original system.

### Important: `translate()` is cumulative

```js
translate(100, 0);  // Origin is now at (100, 0)
translate(50, 0);   // Origin is now at (150, 0), NOT (50, 0)!
```

Each call to `translate()` adds to the previous translation. This is why `push()` and `pop()` are essential.

---

## Part 3: `rotate()` -- Spinning the Coordinate System

`rotate(angle)` rotates the entire coordinate system around the current origin. The angle is in **radians** by default.

### Quick Radian Reference

| Degrees | Radians | p5.js Constant |
|---------|---------|----------------|
| 0       | 0       | 0              |
| 45      | PI/4    | `QUARTER_PI`   |
| 90      | PI/2    | `HALF_PI`      |
| 180     | PI      | `PI`           |
| 360     | 2*PI    | `TWO_PI`       |

You can also use `angleMode(DEGREES)` to switch to degrees.

### Example: Rotating a Rectangle

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(240);
  rectMode(CENTER);

  // Original rectangle (no rotation)
  fill(200, 200, 255);
  stroke(0);
  rect(200, 100, 80, 40);
  fill(0);
  noStroke();
  text("No rotation", 160, 80);

  // Rotated rectangle -- but rotates around (0, 0)!
  push();
  rotate(PI / 6); // 30 degrees
  fill(255, 200, 200);
  stroke(0);
  rect(200, 200, 80, 40);
  pop();

  fill(0);
  noStroke();
  text("Rotated around (0,0) -- wrong!", 50, 380);
}
```

Notice the problem: `rotate()` rotates around the **current origin**, which is the top-left corner of the canvas. The rectangle swings around the corner like a clock hand.

### The Correct Pattern: Translate First, Then Rotate

To rotate a shape around its own center:

1. `translate()` to the shape's position
2. `rotate()` by the desired angle
3. Draw the shape at (0, 0)

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(240);
  rectMode(CENTER);

  // Draw multiple rectangles with different rotations
  let angles = [0, PI / 8, PI / 4, 3 * PI / 8, PI / 2];

  for (let i = 0; i < angles.length; i++) {
    let x = 80 + i * 60;
    let y = 200;

    push();
    translate(x, y);       // Move origin to where we want the shape
    rotate(angles[i]);     // Rotate around that point
    fill(100, 150, 255, 180);
    stroke(0);
    rect(0, 0, 50, 30);   // Draw at the (new) origin
    pop();

    // Label
    fill(0);
    noStroke();
    textAlign(CENTER);
    textSize(10);
    text(nf(degrees(angles[i]), 1, 0) + " deg", x, y + 40);
  }
}
```

Each rectangle rotates around its own center because we translate to its position before rotating.

---

## Part 4: `push()` and `pop()` -- Saving and Restoring State

`push()` saves the current state of:
- The coordinate system (all translations and rotations)
- Style settings (fill, stroke, strokeWeight, rectMode, etc.)

`pop()` restores the most recently saved state.

They work like a **stack**: you can nest multiple `push()`/`pop()` pairs.

### Example: Without push/pop (things go wrong)

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(240);
  rectMode(CENTER);

  // First square
  translate(100, 200);
  rotate(PI / 6);
  fill(255, 0, 0, 150);
  rect(0, 0, 50, 50);

  // Second square -- we want it at (250, 200), but translations accumulate!
  translate(150, 0); // This adds to the ALREADY translated and rotated system
  fill(0, 0, 255, 150);
  rect(0, 0, 50, 50); // NOT where we expected!
}
```

The second square ends up in an unexpected position because the translation and rotation from the first square are still in effect.

### Example: With push/pop (things work correctly)

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(240);
  rectMode(CENTER);

  // First square
  push();
  translate(100, 200);
  rotate(PI / 6);
  fill(255, 0, 0, 150);
  rect(0, 0, 50, 50);
  pop(); // Coordinate system is restored to the original

  // Second square -- clean slate
  push();
  translate(250, 200);
  rotate(-PI / 6);
  fill(0, 0, 255, 150);
  rect(0, 0, 50, 50);
  pop();
}
```

Now each square has its own independent coordinate system. This is the standard pattern you should always use.

---

## Part 5: Combining Transformations

### Order Matters!

Transformations are applied in the order you write them, but the effect is as if they happen in **reverse order** to the shapes you draw. In practice, the rule is simple:

- **`translate()` then `rotate()`**: The shape moves to a position, then rotates in place.
- **`rotate()` then `translate()`**: The coordinate system rotates first, so the translation goes in a rotated direction.

```js
function setup() {
  createCanvas(600, 400);
  noLoop();
}

function draw() {
  background(240);
  rectMode(CENTER);

  // LEFT: translate then rotate
  push();
  fill(0);
  noStroke();
  text("translate, then rotate", 40, 30);
  translate(150, 200);
  rotate(PI / 4);
  fill(255, 100, 100, 180);
  stroke(0);
  rect(0, 0, 60, 30);

  // Show the origin
  fill(255, 0, 0);
  noStroke();
  ellipse(0, 0, 8, 8);
  pop();

  // RIGHT: rotate then translate
  push();
  fill(0);
  noStroke();
  text("rotate, then translate", 340, 30);
  rotate(PI / 4);
  translate(150, 200);
  fill(100, 100, 255, 180);
  stroke(0);
  rect(0, 0, 60, 30);

  // Show the origin
  fill(0, 0, 255);
  noStroke();
  ellipse(0, 0, 8, 8);
  pop();
}
```

The results are very different! For most use cases in generative art, you want **translate first, then rotate**.

---

## Part 6: Building Complex Drawings with Nested Transformations

Nested `push()`/`pop()` blocks let you build hierarchical structures -- like a robot arm where the upper arm, forearm, and hand each rotate relative to the previous joint.

### Example: A Simple Clock

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240);

  // Move origin to center of canvas
  translate(width / 2, height / 2);

  // Draw clock face
  fill(255);
  stroke(0);
  strokeWeight(2);
  ellipse(0, 0, 300, 300);

  // Draw hour markers
  for (let i = 0; i < 12; i++) {
    push();
    rotate((TWO_PI / 12) * i); // Rotate to each hour position
    strokeWeight(3);
    line(0, -130, 0, -145);    // Draw a tick mark
    pop();
  }

  // Hour hand
  let hourAngle = map(hour() % 12 + minute() / 60, 0, 12, 0, TWO_PI) - HALF_PI;
  push();
  rotate(hourAngle);
  strokeWeight(4);
  stroke(0);
  line(0, 0, 80, 0);
  pop();

  // Minute hand
  let minuteAngle = map(minute() + second() / 60, 0, 60, 0, TWO_PI) - HALF_PI;
  push();
  rotate(minuteAngle);
  strokeWeight(2);
  stroke(0);
  line(0, 0, 120, 0);
  pop();

  // Second hand
  let secondAngle = map(second(), 0, 60, 0, TWO_PI) - HALF_PI;
  push();
  rotate(secondAngle);
  strokeWeight(1);
  stroke(255, 0, 0);
  line(0, 0, 130, 0);
  pop();

  // Center dot
  fill(0);
  noStroke();
  ellipse(0, 0, 8, 8);
}
```

Notice how each hand uses its own `push()`/`pop()` block. The `translate(width/2, height/2)` at the top moves everything to the center, and each hand only needs to worry about its own rotation.

### Example: A Rotating Flower

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(240);
  translate(width / 2, height / 2);

  let numPetals = 8;
  let time = frameCount * 0.01;

  for (let i = 0; i < numPetals; i++) {
    push();
    // Rotate to this petal's position, plus a slow spin
    rotate((TWO_PI / numPetals) * i + time);

    // Move out from center
    translate(80, 0);

    // Draw petal (ellipse)
    fill(255, 150, 150, 180);
    stroke(200, 50, 50);
    strokeWeight(1);
    ellipse(0, 0, 60, 25);

    // Draw a smaller detail on each petal
    push();
    translate(20, 0);
    rotate(time * 3); // Spin the detail faster
    fill(255, 255, 100);
    noStroke();
    rect(0, 0, 8, 8);
    pop();

    pop();
  }

  // Center
  fill(255, 255, 100);
  stroke(200, 200, 0);
  ellipse(0, 0, 30, 30);
}
```

This example shows **nested transformations**: each petal has its own coordinate system, and details within each petal have their own sub-coordinate system.

---

## Part 7: A Practical Pattern -- Drawing a Grid of Rotated Objects

This pattern appears in Schotter and many generative art pieces:

```js
function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(255);
  rectMode(CENTER);

  let cellSize = 50;
  let cols = 10;
  let rows = 10;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * cellSize + cellSize / 2;
      let y = row * cellSize + cellSize / 2;

      // Calculate a rotation based on mouse distance
      let d = dist(mouseX, mouseY, x, y);
      let angle = map(d, 0, 300, PI / 2, 0);

      push();
      translate(x, y);
      rotate(angle);
      noFill();
      stroke(0);
      rect(0, 0, cellSize - 5, cellSize - 5);
      pop();
    }
  }
}
```

Every square rotates based on how far the mouse is from it. This is a powerful technique: compute some property (angle, size, color) based on position or other data, then use `push()`/`translate()`/`rotate()`/`pop()` to apply it independently to each shape.

---

## Part 8: Common Mistakes and How to Avoid Them

### Mistake 1: Forgetting push/pop

```js
// BAD -- transformations accumulate
for (let i = 0; i < 5; i++) {
  translate(50, 0);
  rect(0, 0, 20, 20);
}

// GOOD -- each iteration starts fresh
for (let i = 0; i < 5; i++) {
  push();
  translate(50 * (i + 1), 0);
  rect(0, 0, 20, 20);
  pop();
}
```

### Mistake 2: Rotating around the wrong point

```js
// BAD -- rotates around top-left corner of canvas
rotate(PI / 4);
rect(200, 200, 50, 50);

// GOOD -- rotates around the rectangle's center
push();
translate(200, 200);
rotate(PI / 4);
rectMode(CENTER);
rect(0, 0, 50, 50);
pop();
```

### Mistake 3: Using degrees instead of radians

```js
// BAD -- 45 radians is a LOT of rotation (about 7 full turns)
rotate(45);

// GOOD -- use radians or convert
rotate(PI / 4);           // 45 degrees in radians
rotate(radians(45));       // Convert degrees to radians
// OR set angle mode globally:
angleMode(DEGREES);
rotate(45);
```

---

## Exercises

1. **Spinning Square:** Draw a single square in the center of the canvas that rotates continuously. Use `frameCount` to increment the angle.

2. **Orbital System:** Create a "sun" in the center with a "planet" orbiting it, and a "moon" orbiting the planet. Use nested push/pop blocks.

3. **Spiral of Squares:** Draw 50 squares along a spiral path, each slightly rotated from the last. Use `translate()` and `rotate()` inside a loop.

4. **Interactive Rotation Grid:** Create a grid of shapes where each shape's rotation is controlled by its distance from the mouse cursor.

---

## Key Takeaways

- `translate(x, y)` moves the origin; it does not move shapes.
- `rotate(angle)` rotates the coordinate system around the current origin.
- Always use `push()` before and `pop()` after transformations to isolate their effects.
- The standard pattern is: `push()` -> `translate()` -> `rotate()` -> draw at (0, 0) -> `pop()`.
- Transformations are cumulative unless you use `push()`/`pop()` to save and restore state.
- Nested `push()`/`pop()` blocks create hierarchical coordinate systems for complex drawings.
