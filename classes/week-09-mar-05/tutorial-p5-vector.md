# Tutorial: The p5.Vector API

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Overview

Vectors are one of the most important concepts in creative coding. A vector is a quantity with both **magnitude** (how much) and **direction** (which way). In p5.js, the `p5.Vector` class provides a powerful and convenient API for working with 2D and 3D vectors.

Vectors are used everywhere in simulations and generative art:

- **Position**: where something is
- **Velocity**: how fast and in what direction it moves
- **Acceleration**: how its velocity changes over time
- **Force**: what pushes or pulls on it

In this tutorial, we will learn the `p5.Vector` API from the ground up and build complete working examples.

We will cover:

1. Creating vectors
2. Arithmetic operations (add, sub, mult, div)
3. Magnitude and normalization
4. Dot product
5. Distance
6. Static vs. instance methods
7. Using vectors for position, velocity, and acceleration
8. A complete particle system using vectors

---

## Prerequisites

- Basic p5.js knowledge (setup/draw, shapes, mouse interaction)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: What Is a Vector?

Think of a vector as an arrow. It has a length (magnitude) and it points in a direction. In 2D, a vector has two components: `x` and `y`.

Without vectors, you might track a ball's position and velocity with separate variables:

```js
let posX = 100;
let posY = 200;
let velX = 2;
let velY = -1;

// Update:
posX += velX;
posY += velY;
```

With vectors, this becomes:

```js
let pos = createVector(100, 200);
let vel = createVector(2, -1);

// Update:
pos.add(vel);
```

The vector version is cleaner, scales to 3D effortlessly, and gives you access to powerful operations like normalization, dot products, and angle calculations.

---

## Step 2: Creating Vectors

### Using `createVector()`

The `createVector()` function creates a new `p5.Vector` object:

```js
let v1 = createVector(3, 4);       // 2D vector (x=3, y=4)
let v2 = createVector(1, 2, 3);    // 3D vector (x=1, y=2, z=3)
let v3 = createVector();           // zero vector (x=0, y=0, z=0)
```

### Accessing Components

```js
let v = createVector(3, 4);
console.log(v.x);  // 3
console.log(v.y);  // 4
console.log(v.z);  // 0 (default for 2D vectors)
```

You can also set components directly:

```js
v.x = 10;
v.y = 20;
```

### Using `p5.Vector.random2D()`

Create a vector pointing in a random direction with magnitude 1:

```js
let r = p5.Vector.random2D();  // random unit vector
// r.x and r.y will be random, but r.mag() === 1
```

This is incredibly useful for scattering, explosions, and random motion.

---

## Step 3: Arithmetic Operations

### `add()` -- Vector Addition

Adding two vectors combines their components:

```js
let a = createVector(1, 2);
let b = createVector(3, 4);
a.add(b);
// a is now (4, 6)
// b is unchanged
```

**Important:** `a.add(b)` modifies `a` in place. If you want to add without modifying either vector, use the static method (covered in Step 7).

You can also add scalar values to individual components:

```js
let v = createVector(1, 2);
v.add(10, 20);
// v is now (11, 22)
```

### `sub()` -- Vector Subtraction

```js
let a = createVector(5, 8);
let b = createVector(2, 3);
a.sub(b);
// a is now (3, 5)
```

Subtraction is often used to find the vector **from** one point **to** another:

```js
let mouse = createVector(mouseX, mouseY);
let center = createVector(width / 2, height / 2);
let direction = p5.Vector.sub(mouse, center);
// direction points from center toward mouse
```

### `mult()` -- Scalar Multiplication

Multiply each component by a number:

```js
let v = createVector(3, 4);
v.mult(2);
// v is now (6, 8)
```

This scales the vector (makes it longer or shorter without changing direction).

### `div()` -- Scalar Division

```js
let v = createVector(6, 8);
v.div(2);
// v is now (3, 4)
```

---

## Step 4: Magnitude and Normalization

### `mag()` -- Magnitude (Length)

The magnitude of a vector is its length, computed using the Pythagorean theorem:

$$|v| = \sqrt{x^2 + y^2}$$

```js
let v = createVector(3, 4);
console.log(v.mag());  // 5  (because sqrt(9 + 16) = 5)
```

### `magSq()` -- Magnitude Squared

If you only need to compare magnitudes (not compute exact lengths), use `magSq()` to avoid the expensive square root:

```js
let v = createVector(3, 4);
console.log(v.magSq());  // 25
```

This is useful for performance-critical code. Instead of `if (v.mag() < 10)`, use `if (v.magSq() < 100)`.

### `normalize()` -- Make It a Unit Vector

Normalizing a vector keeps its direction but sets its magnitude to 1:

```js
let v = createVector(3, 4);
v.normalize();
// v is now (0.6, 0.8), magnitude = 1
```

This is essential when you want to use a vector purely for direction and control the speed separately:

```js
let direction = p5.Vector.sub(target, pos);
direction.normalize();      // unit vector pointing toward target
direction.mult(speed);      // scale to desired speed
pos.add(direction);         // move toward target at that speed
```

### `setMag()` -- Set the Magnitude

A shortcut for normalize-then-multiply:

```js
let v = createVector(3, 4);
v.setMag(10);
// v now points in the same direction but has magnitude 10
// v is (6, 8)
```

### `limit()` -- Cap the Magnitude

Ensures a vector does not exceed a maximum magnitude:

```js
let v = createVector(30, 40);  // magnitude = 50
v.limit(10);
// v now has magnitude 10, same direction
// v is (6, 8)
```

If the vector's magnitude is already below the limit, `limit()` does nothing. This is perfect for capping velocity:

```js
vel.add(acc);
vel.limit(maxSpeed);
```

---

## Step 5: Dot Product

The dot product of two vectors is a single number:

$$a \cdot b = a_x b_x + a_y b_y$$

```js
let a = createVector(1, 0);
let b = createVector(0, 1);
console.log(a.dot(b));  // 0 (perpendicular vectors)

let c = createVector(1, 0);
let d = createVector(1, 0);
console.log(c.dot(d));  // 1 (parallel vectors, same direction)
```

The dot product tells you how much two vectors "agree" in direction:

- **Positive**: they point in roughly the same direction
- **Zero**: they are perpendicular
- **Negative**: they point in roughly opposite directions

If both vectors are normalized, the dot product equals the cosine of the angle between them:

$$\hat{a} \cdot \hat{b} = \cos(\theta)$$

---

## Step 6: Distance

### `dist()` -- Distance Between Two Vectors

```js
let a = createVector(0, 0);
let b = createVector(3, 4);
console.log(a.dist(b));  // 5
```

Or using the static method:

```js
let d = p5.Vector.dist(a, b);  // 5
```

---

## Step 7: Static Methods vs. Instance Methods

This is a crucial distinction. Most `p5.Vector` methods come in two forms:

### Instance Methods (modify the vector)

```js
let a = createVector(1, 2);
let b = createVector(3, 4);
a.add(b);  // a is now (4, 6) -- a has been MODIFIED
```

### Static Methods (return a new vector)

```js
let a = createVector(1, 2);
let b = createVector(3, 4);
let c = p5.Vector.add(a, b);  // c is (4, 6) -- a and b are UNCHANGED
```

**Rule of thumb:** Use static methods when you need to preserve the original vectors. Use instance methods when you want to update a vector in place.

Here are the most important static methods:

```js
p5.Vector.add(a, b)       // returns a + b (new vector)
p5.Vector.sub(a, b)       // returns a - b (new vector)
p5.Vector.mult(a, n)      // returns a * n (new vector)
p5.Vector.div(a, n)       // returns a / n (new vector)
p5.Vector.dist(a, b)      // returns distance between a and b
p5.Vector.dot(a, b)       // returns dot product
p5.Vector.cross(a, b)     // returns cross product (3D)
p5.Vector.random2D()      // returns random unit vector
p5.Vector.random3D()      // returns random 3D unit vector
p5.Vector.fromAngle(a)    // returns unit vector at angle a (radians)
```

### `copy()` -- Clone a Vector

If you need to work with a vector without modifying the original:

```js
let original = createVector(3, 4);
let clone = original.copy();
clone.mult(2);
// clone is (6, 8), original is still (3, 4)
```

---

## Step 8: Useful Methods Summary

| Method | Description | Modifies vector? |
|---|---|---|
| `v.add(other)` | Add another vector | Yes |
| `v.sub(other)` | Subtract another vector | Yes |
| `v.mult(n)` | Multiply by scalar | Yes |
| `v.div(n)` | Divide by scalar | Yes |
| `v.mag()` | Get magnitude | No |
| `v.magSq()` | Get magnitude squared | No |
| `v.normalize()` | Set magnitude to 1 | Yes |
| `v.setMag(n)` | Set magnitude to n | Yes |
| `v.limit(n)` | Cap magnitude at n | Yes |
| `v.heading()` | Get angle (radians) | No |
| `v.rotate(angle)` | Rotate by angle | Yes |
| `v.dot(other)` | Dot product | No |
| `v.dist(other)` | Distance to other | No |
| `v.copy()` | Clone the vector | No (returns new) |
| `v.set(x, y)` | Set components | Yes |

---

## Step 9: Example -- Bouncing Ball

A classic simulation: a ball that bounces off the edges of the canvas.

```js
let pos, vel;

function setup() {
  createCanvas(600, 400);
  pos = createVector(width / 2, height / 2);
  vel = createVector(3, 2);
}

function draw() {
  background(20);

  // Update position
  pos.add(vel);

  // Bounce off edges
  if (pos.x < 0 || pos.x > width) {
    vel.x *= -1;
  }
  if (pos.y < 0 || pos.y > height) {
    vel.y *= -1;
  }

  // Draw ball
  fill(0, 200, 255);
  noStroke();
  circle(pos.x, pos.y, 30);
}
```

---

## Step 10: Example -- Following the Mouse

Make a circle accelerate toward the mouse:

```js
let pos, vel, acc;

function setup() {
  createCanvas(600, 400);
  pos = createVector(width / 2, height / 2);
  vel = createVector(0, 0);
}

function draw() {
  background(20, 20, 40);

  // Compute acceleration toward mouse
  let mouse = createVector(mouseX, mouseY);
  acc = p5.Vector.sub(mouse, pos);  // direction from pos to mouse
  acc.setMag(0.5);                   // constant acceleration magnitude

  // Update velocity and position
  vel.add(acc);
  vel.limit(8);    // cap speed
  pos.add(vel);

  // Draw
  fill(255, 100, 50);
  noStroke();
  circle(pos.x, pos.y, 24);

  // Draw velocity vector as a line
  stroke(100, 255, 100);
  strokeWeight(2);
  let tip = p5.Vector.add(pos, p5.Vector.mult(vel, 5));
  line(pos.x, pos.y, tip.x, tip.y);
}
```

---

## Step 11: Example -- Particle System

A particle system where each particle has its own position, velocity, and acceleration:

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(10, 10, 30);

  // Spawn particles at mouse position
  if (frameCount % 2 === 0) {
    particles.push(new Particle(mouseX, mouseY));
  }

  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.applyForce(createVector(0, 0.05)); // gravity
    p.update();
    p.display();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }

  // Show particle count
  fill(255);
  noStroke();
  textSize(14);
  text(`Particles: ${particles.length}`, 10, 20);
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.life = 255;
    this.size = random(4, 12);
    this.hue = random(0, 60); // warm colors
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(10);
    this.pos.add(this.vel);
    this.acc.mult(0); // reset acceleration each frame
    this.life -= 3;
  }

  display() {
    colorMode(HSB);
    noStroke();
    fill(this.hue, 80, 100, this.life / 255);
    circle(this.pos.x, this.pos.y, this.size);
    colorMode(RGB);
  }

  isDead() {
    return this.life <= 0;
  }
}
```

---

## Step 12: Example -- Flow Field with Vectors

Vectors are essential for flow fields. Each cell in a grid stores a direction vector, and particles follow those vectors:

```js
let particles = [];
let flowField;
let cols, rows;
let scl = 20;

function setup() {
  createCanvas(600, 400);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowField = new Array(cols * rows);

  for (let i = 0; i < 500; i++) {
    particles.push(new FlowParticle());
  }

  background(10);
}

function draw() {
  // Update flow field
  let yoff = frameCount * 0.005;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let angle = noise(xoff, yoff) * TWO_PI * 2;
      flowField[x + y * cols] = p5.Vector.fromAngle(angle);
      xoff += 0.1;
    }
    yoff += 0.1;
  }

  // Update and draw particles
  for (let p of particles) {
    // Find which cell the particle is in
    let col = floor(p.pos.x / scl);
    let row = floor(p.pos.y / scl);
    col = constrain(col, 0, cols - 1);
    row = constrain(row, 0, rows - 1);

    // Apply the flow field force
    let force = flowField[col + row * cols];
    p.applyForce(force.copy().mult(0.2));

    p.update();
    p.display();
    p.wrapEdges();
  }
}

class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  display() {
    stroke(255, 255, 255, 20);
    strokeWeight(1);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
  }

  wrapEdges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos = this.pos.copy(); }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos = this.pos.copy(); }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos = this.pos.copy(); }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos = this.pos.copy(); }
  }
}
```

This sketch produces the flowing, organic line patterns commonly seen in generative art.

---

## Exercises

1. **Orbit**: Create a sketch where a small circle orbits a larger one. Use vectors for position, and compute the perpendicular velocity direction using the `rotate()` method.

2. **Repulsion**: Make particles flee from the mouse instead of following it. Hint: compute the direction from mouse to particle (not particle to mouse) and use `setMag()` to control the repulsion strength.

3. **Attractor**: Create a gravitational attractor at the center of the canvas. Multiple particles should orbit around it. Use Newton's gravitational formula: $F = \frac{G \cdot m_1 \cdot m_2}{r^2}$.

4. **Speed visualization**: Modify the bouncing ball example to color the ball based on its speed (`vel.mag()`). Use `map()` and `lerpColor()` to blend between blue (slow) and red (fast).

---

## Further Resources

- p5.js Vector Reference: <https://p5js.org/reference/p5.Vector/>
- Daniel Shiffman, *The Nature of Code*: <https://natureofcode.com>
- Chapter 1 (Vectors): <https://natureofcode.com/vectors/>
- Chapter 2 (Forces): <https://natureofcode.com/force/>
- Chapter 4 (Particle Systems): <https://natureofcode.com/particles/>
