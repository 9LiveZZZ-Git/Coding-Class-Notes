# Tutorial: Implementing Boids Flocking in p5.js

## MAT 200C: Computing Arts -- Week 5, February 3

---

## Introduction

In 1986, Craig Reynolds created a computer simulation of flocking behavior that he called **Boids** (a playful abbreviation of "bird-oids," meaning bird-like objects). The remarkable insight behind Boids is that complex, lifelike flocking behavior emerges from just three simple rules applied to each individual agent:

1. **Separation** -- steer to avoid crowding nearby boids
2. **Alignment** -- steer toward the average heading of nearby boids
3. **Cohesion** -- steer toward the average position of nearby boids

No single boid knows about the flock as a whole. Each boid only looks at its nearby neighbors and follows these three rules. Yet the collective behavior looks strikingly like a real flock of birds, a school of fish, or a swarm of insects. This is a classic example of **emergence** -- complex global behavior arising from simple local rules.

In this tutorial, you will implement the Boids algorithm from scratch in p5.js.

---

## Step 1: A Single Boid That Moves

Before implementing the flocking rules, let us create a single boid that moves across the screen and wraps around the edges.

```js
let boid;

function setup() {
  createCanvas(800, 600);
  boid = new Boid(width / 2, height / 2);
}

function draw() {
  background(30);
  boid.update();
  boid.edges();
  boid.display();
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    // Start with a random velocity
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;  // Maximum steering force
    this.maxSpeed = 4;    // Maximum speed
  }

  update() {
    // Add acceleration to velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxSpeed);
    // Add velocity to position
    this.position.add(this.velocity);
    // Reset acceleration each frame
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  edges() {
    // Wrap around edges
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  display() {
    // Draw a triangle pointing in the direction of velocity
    let angle = this.velocity.heading();

    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    fill(200, 220, 255);
    noStroke();
    triangle(10, 0, -5, 5, -5, -5);
    pop();
  }
}
```

**How `display()` works:** Instead of drawing a simple circle, we draw a triangle that points in the direction of movement. `this.velocity.heading()` returns the angle of the velocity vector in radians. We use `translate()` to move the coordinate system to the boid's position, then `rotate()` to orient it. The triangle is defined relative to the origin: the tip at (10, 0) and two rear points at (-5, 5) and (-5, -5).

**Why `maxForce` and `maxSpeed`?** In Reynolds' model, each boid has a maximum speed it can travel and a maximum steering force it can apply. Without these limits, the boids would accelerate without bound and the simulation would become chaotic.

Run this code. You should see a small triangle moving in a straight line across the canvas, wrapping around when it reaches an edge.

---

## Step 2: A Flock of Boids

Let us create many boids. No flocking rules yet -- they will just fly in straight lines.

```js
let flock = [];

function setup() {
  createCanvas(800, 600);
  // Create 150 boids at random positions
  for (let i = 0; i < 150; i++) {
    flock.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(30);

  for (let boid of flock) {
    boid.update();
    boid.edges();
    boid.display();
  }
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  display() {
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    fill(200, 220, 255);
    noStroke();
    triangle(10, 0, -5, 5, -5, -5);
    pop();
  }
}
```

You should see 150 little triangles flying independently in straight lines. There is no coordination at all. Now let us add the three flocking rules.

---

## Step 3: Rule 1 -- Separation

**Separation** means "steer to avoid crowding nearby boids." Each boid looks at all other boids within a certain perception radius. If any are too close, the boid steers away from them.

The algorithm:

1. Look at all other boids within a perception radius.
2. For each nearby boid, calculate a vector pointing **away** from that boid (the difference between positions).
3. Weight that vector by the inverse of the distance -- closer boids should push harder.
4. Average all these "away" vectors.
5. The result is the desired velocity for avoiding collisions. Subtract the current velocity to get a **steering force**.

```js
// Add this method to the Boid class
separation(boids) {
  let perceptionRadius = 50;
  let steering = createVector(0, 0);
  let total = 0;

  for (let other of boids) {
    let d = dist(
      this.position.x, this.position.y,
      other.position.x, other.position.y
    );

    // Only consider boids within the perception radius (and not itself)
    if (other !== this && d < perceptionRadius) {
      // Vector pointing away from the other boid
      let diff = p5.Vector.sub(this.position, other.position);
      // Weight by inverse of distance: closer boids push harder
      diff.div(d * d);
      steering.add(diff);
      total++;
    }
  }

  if (total > 0) {
    // Average the steering
    steering.div(total);
    // Set magnitude to max speed (this is our desired velocity)
    steering.setMag(this.maxSpeed);
    // Steering = desired velocity - current velocity
    steering.sub(this.velocity);
    // Limit the steering force
    steering.limit(this.maxForce);
  }

  return steering;
}
```

**Why divide by distance squared?** This makes the repulsion force much stronger for very close boids and weaker for boids farther away. It creates a smooth avoidance behavior instead of a sudden jerk.

**What is "steering"?** Reynolds defined steering as: `steering force = desired velocity - current velocity`. The desired velocity points in the direction we want to go (away from neighbors, in the case of separation), at maximum speed. The steering force is how much we need to adjust our current velocity to achieve that desired velocity.

---

## Step 4: Rule 2 -- Alignment

**Alignment** means "steer toward the average heading of nearby boids." Each boid looks at its neighbors' velocities and tries to match them.

```js
// Add this method to the Boid class
alignment(boids) {
  let perceptionRadius = 50;
  let steering = createVector(0, 0);
  let total = 0;

  for (let other of boids) {
    let d = dist(
      this.position.x, this.position.y,
      other.position.x, other.position.y
    );

    if (other !== this && d < perceptionRadius) {
      // Add the neighbor's velocity
      steering.add(other.velocity);
      total++;
    }
  }

  if (total > 0) {
    // Average velocity of neighbors
    steering.div(total);
    // Set to max speed (desired velocity in the average direction)
    steering.setMag(this.maxSpeed);
    // Steering = desired - current
    steering.sub(this.velocity);
    steering.limit(this.maxForce);
  }

  return steering;
}
```

This is simpler than separation: we just average the velocities of all nearby boids, set that average to the maximum speed (the **desired velocity**), and compute the steering force as the difference between desired and current velocity.

---

## Step 5: Rule 3 -- Cohesion

**Cohesion** means "steer toward the average position of nearby boids." This keeps the flock together.

```js
// Add this method to the Boid class
cohesion(boids) {
  let perceptionRadius = 50;
  let steering = createVector(0, 0);
  let total = 0;

  for (let other of boids) {
    let d = dist(
      this.position.x, this.position.y,
      other.position.x, other.position.y
    );

    if (other !== this && d < perceptionRadius) {
      // Add the neighbor's position
      steering.add(other.position);
      total++;
    }
  }

  if (total > 0) {
    // Average position of neighbors
    steering.div(total);
    // Vector pointing from current position toward the average position
    steering.sub(this.position);
    // Set to max speed
    steering.setMag(this.maxSpeed);
    // Steering = desired - current
    steering.sub(this.velocity);
    steering.limit(this.maxForce);
  }

  return steering;
}
```

The difference from alignment: instead of averaging velocities, we average positions. The desired velocity then points from our position toward that average position.

---

## Step 6: Combining the Three Rules

Now we combine all three rules. Each rule returns a steering force, and we add them all together. We can weight each rule differently to change the behavior.

Add a `flock()` method to the Boid class:

```js
flock(boids) {
  let sep = this.separation(boids);
  let ali = this.alignment(boids);
  let coh = this.cohesion(boids);

  // Weight the forces (adjust these to change behavior)
  sep.mult(1.5);   // Separation is slightly stronger
  ali.mult(1.0);   // Alignment at normal strength
  coh.mult(1.0);   // Cohesion at normal strength

  // Apply all forces
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}
```

Update the `draw()` function to call `flock()`:

```js
function draw() {
  background(30);

  for (let boid of flock) {
    boid.flock(flock);  // Apply flocking rules
    boid.update();
    boid.edges();
    boid.display();
  }
}
```

---

## Step 7: Complete Working Code

Here is the complete program with all three rules combined:

```js
let flock = [];

function setup() {
  createCanvas(800, 600);
  for (let i = 0; i < 150; i++) {
    flock.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(30);

  for (let boid of flock) {
    boid.flock(flock);
    boid.update();
    boid.edges();
    boid.display();
  }
}

// Click to add a new boid at the mouse position
function mousePressed() {
  flock.push(new Boid(mouseX, mouseY));
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  // --- Flocking Rules ---

  flock(boids) {
    let sep = this.separation(boids);
    let ali = this.alignment(boids);
    let coh = this.cohesion(boids);

    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);

    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  separation(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  alignment(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // --- Physics ---

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  // --- Boundary Wrapping ---

  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  // --- Rendering ---

  display() {
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    fill(200, 220, 255);
    noStroke();
    triangle(10, 0, -5, 5, -5, -5);
    pop();
  }
}
```

Run this code. You should see 150 triangles that form into flocks, travel together, split apart, and rejoin. Click anywhere on the canvas to add more boids. The behavior is mesmerizing and lifelike, yet it emerges entirely from three simple rules.

---

## Step 8: Adding Interactive Sliders

To really understand how the three rules interact, let us add sliders so you can adjust the strength of each rule in real time.

```js
let flock = [];
let sliderSep, sliderAli, sliderCoh;

function setup() {
  createCanvas(800, 600);

  // Create sliders for each rule
  createP("Separation");
  sliderSep = createSlider(0, 5, 1.5, 0.1);

  createP("Alignment");
  sliderAli = createSlider(0, 5, 1.0, 0.1);

  createP("Cohesion");
  sliderCoh = createSlider(0, 5, 1.0, 0.1);

  for (let i = 0; i < 150; i++) {
    flock.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(30);

  for (let boid of flock) {
    boid.flock(flock);
    boid.update();
    boid.edges();
    boid.display();
  }
}

function mousePressed() {
  // Only add boid if click is on the canvas (not on sliders)
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    flock.push(new Boid(mouseX, mouseY));
  }
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  flock(boids) {
    let sep = this.separation(boids);
    let ali = this.alignment(boids);
    let coh = this.cohesion(boids);

    // Use slider values for weights
    sep.mult(sliderSep.value());
    ali.mult(sliderAli.value());
    coh.mult(sliderCoh.value());

    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  separation(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  alignment(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  display() {
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    fill(200, 220, 255);
    noStroke();
    triangle(10, 0, -5, 5, -5, -5);
    pop();
  }
}
```

Try these experiments with the sliders:

- **High separation, low alignment, low cohesion**: Boids scatter and avoid each other -- anti-social behavior.
- **Low separation, high alignment, low cohesion**: Boids all orient in the same direction but don't group together -- a uniform flow.
- **Low separation, low alignment, high cohesion**: Boids collapse into a single tight cluster -- a swarm.
- **All three balanced**: The classic flocking behavior -- groups that travel together, split, and reform.
- **Zero separation**: Boids pile on top of each other -- they have no personal space.

---

## Understanding Reynolds' Steering Model

Craig Reynolds' approach is based on a key idea: **steering = desired - velocity**. Each rule computes a "desired velocity" -- the direction and speed the boid would ideally like to go. The steering force is the difference between this desired velocity and the boid's current velocity. This is analogous to a driver turning the steering wheel: the steering force changes the direction of travel toward the desired direction.

Limiting the steering force (`steering.limit(this.maxForce)`) simulates inertia: the boid cannot instantly change direction. It must gradually turn. This is what makes the motion look smooth and natural rather than jerky.

---

## Summary

- **Boids** simulate flocking with three rules: separation, alignment, cohesion.
- Each rule computes a **steering force** using Reynolds' formula: `desired velocity - current velocity`.
- The three forces are weighted and combined to drive each boid's movement.
- **No boid knows about the flock as a whole.** Each looks only at its nearby neighbors. Complex global patterns emerge from simple local rules. This is emergence.
- The perception radius, max force, max speed, and rule weights are all parameters you can tune to create different behaviors.

---

## Exercises

1. **Predator avoidance**: Add a "predator" that follows the mouse. Boids within a large radius of the predator should flee (apply a strong separation force from the predator's position). How does the flock respond?

2. **Multiple species**: Create two groups of boids with different colors. Boids should only align with and be attracted to their own species, but should separate from all boids regardless of species. What patterns emerge?

3. **Obstacle avoidance**: Add circular obstacles to the canvas. Boids should steer away from obstacles before they collide. Hint: use the same separation logic but with the obstacle center as the "other" position.

4. **Speed variation**: Give each boid a slightly different `maxSpeed`. How does this affect flock formation?

5. **Trail rendering**: Instead of clearing the background completely each frame, use a semi-transparent background (`background(30, 25)`) to create trails showing where boids have been.

---

## Further Reading

- Craig Reynolds' original 1987 SIGGRAPH paper: "Flocks, Herds, and Schools: A Distributed Behavioral Model"
- Craig Reynolds' website on steering behaviors: [https://www.red3d.com/cwr/steer/](https://www.red3d.com/cwr/steer/)
- Daniel Shiffman, *The Nature of Code*, Chapter 6: Autonomous Agents
