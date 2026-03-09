# Tutorial: Numerical Integration for Simulation

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Introduction

Every physics simulation must answer a fundamental question: given the forces acting on an object right now, where will it be a moment from now? This is the problem of **numerical integration** -- approximating the continuous flow of time with discrete time steps.

In this tutorial, you will learn:

- What derivatives and integrals mean in the context of simulation code
- The Forward Euler method (the simplest integrator)
- The Semi-Implicit Euler method (a small change that makes a big difference)
- Why the choice of integrator matters for your simulations

---

## Step 1: Derivatives in Code

A **derivative** is a rate of change. In physics:

- **Velocity** is the derivative of position: how fast position is changing.
- **Acceleration** is the derivative of velocity: how fast velocity is changing.

In calculus notation:

```
velocity     = d(position) / dt     "the change in position over time"
acceleration = d(velocity) / dt     "the change in velocity over time"
```

In code, we do not have continuous time. We have discrete frames. Each frame represents one small step forward in time (we call this step `dt`). So the derivatives become:

```
velocity     ≈ (new position - old position) / dt
acceleration ≈ (new velocity - old velocity) / dt
```

Rearranging to solve for the new values:

```
new velocity = old velocity + acceleration * dt
new position = old position + velocity * dt
```

In p5.js at 60 fps, each frame is approximately 1/60th of a second. For simplicity, we often set `dt = 1` (one frame), which gives us the familiar:

```js
velocity.add(acceleration);  // new velocity = old velocity + acceleration * 1
position.add(velocity);      // new position = old position + velocity * 1
```

---

## Step 2: Integrals in Code

An **integral** is the opposite of a derivative. It is accumulation over time.

- **Position** is the integral of velocity: the sum of all the tiny velocity steps over time.
- **Velocity** is the integral of acceleration: the sum of all the tiny acceleration steps over time.

In code, integration is exactly what we do every frame:

```js
// These two lines ARE integration
velocity.add(acceleration);  // Integrate acceleration to get velocity
position.add(velocity);      // Integrate velocity to get position
```

Every time you write `position.add(velocity)`, you are performing numerical integration. You are accumulating velocity into position, one frame at a time.

---

## Step 3: Forward Euler Method

The method we have been using is called **Forward Euler** (pronounced "Oiler") method, named after the mathematician Leonhard Euler. It is the simplest possible integrator.

The algorithm:

```
1. Compute forces
2. acceleration = totalForce / mass
3. velocity = velocity + acceleration * dt
4. position = position + velocity * dt
```

Here is a visual demonstration -- a ball on a spring, using Forward Euler:

```js
let pos, vel;
let anchorY = 200;
let restLength = 0;
let k = 0.01;

function setup() {
  createCanvas(600, 400);
  pos = createVector(width / 2, 300);
  vel = createVector(0, 0);
}

function draw() {
  background(30);

  // Spring force: F = -k * displacement
  let displacement = pos.y - (anchorY + restLength);
  let springForce = -k * displacement;

  // Forward Euler integration
  let acc = springForce; // mass = 1
  vel.y = vel.y + acc;   // Update velocity first
  pos.y = pos.y + vel.y; // Then update position using the NEW velocity

  // Draw
  stroke(100);
  strokeWeight(2);
  line(width / 2, anchorY, pos.x, pos.y);

  fill(255, 100, 100);
  noStroke();
  circle(width / 2, anchorY, 12);

  fill(100, 200, 255);
  circle(pos.x, pos.y, 24);

  // Label
  fill(200);
  noStroke();
  textSize(16);
  text("Forward Euler - Spring", 10, 30);

  // Display energy to show if it's conserved
  let kineticEnergy = 0.5 * vel.y * vel.y;
  let potentialEnergy = 0.5 * k * displacement * displacement;
  let totalEnergy = kineticEnergy + potentialEnergy;
  text("Total Energy: " + totalEnergy.toFixed(4), 10, 60);
}
```

**The problem with Forward Euler:** Watch the "Total Energy" value. In a real spring system, total energy should be conserved -- it should stay constant. But with Forward Euler, the energy **increases** over time. The ball oscillates with growing amplitude. Given enough time, it will spiral out of control.

This is the fundamental weakness of Forward Euler: it adds energy to the system. For artistic simulations that run briefly, this may not matter. For long-running simulations, it is a serious problem.

---

## Step 4: Semi-Implicit Euler Method

The **Semi-Implicit Euler** method (also called Symplectic Euler or Euler-Cromer) makes one tiny change to the order of operations:

**Forward Euler:**
```
velocity = velocity + acceleration * dt    (using old velocity)
position = position + OLD velocity * dt    <-- uses the velocity from BEFORE the update
```

Wait -- actually, let us be more precise about what Forward Euler truly is:

**True Forward Euler:**
```
new_position = position + velocity * dt       (uses current velocity)
new_velocity = velocity + acceleration * dt   (uses current acceleration)
position = new_position
velocity = new_velocity
```

**Semi-Implicit Euler:**
```
velocity = velocity + acceleration * dt       (update velocity FIRST)
position = position + velocity * dt           (use the UPDATED velocity)
```

The difference is subtle: Semi-Implicit Euler updates velocity first, then uses the **new** velocity to update position. True Forward Euler uses the **old** velocity.

What we have been writing all along in our code:

```js
this.velocity.add(this.acceleration);  // Update velocity first
this.position.add(this.velocity);      // Use the UPDATED velocity
```

This is actually Semi-Implicit Euler, not true Forward Euler! And that is good, because Semi-Implicit Euler has a wonderful property: it approximately conserves energy. It does not add energy or remove energy from the system over time.

Let us see the difference explicitly:

```js
let posEuler, velEuler;
let posSemiImplicit, velSemiImplicit;
let anchorY = 200;
let k = 0.01;

function setup() {
  createCanvas(800, 400);
  // Both start at the same position and velocity
  posEuler = 300;
  velEuler = 0;
  posSemiImplicit = 300;
  velSemiImplicit = 0;
}

function draw() {
  background(30);

  // Compute spring force for both (same physics)
  let dispEuler = posEuler - anchorY;
  let accEuler = -k * dispEuler;

  let dispSemi = posSemiImplicit - anchorY;
  let accSemi = -k * dispSemi;

  // --- True Forward Euler ---
  // Position uses OLD velocity, then velocity updates
  let oldVelEuler = velEuler;
  velEuler = velEuler + accEuler;
  posEuler = posEuler + oldVelEuler; // <-- uses OLD velocity

  // --- Semi-Implicit Euler ---
  // Velocity updates first, then position uses NEW velocity
  velSemiImplicit = velSemiImplicit + accSemi;
  posSemiImplicit = posSemiImplicit + velSemiImplicit; // <-- uses NEW velocity

  // Draw Forward Euler (left side)
  stroke(100);
  strokeWeight(2);
  line(200, anchorY, 200, posEuler);
  fill(255, 100, 100);
  noStroke();
  circle(200, anchorY, 12);
  fill(255, 150, 150);
  circle(200, posEuler, 24);

  // Draw Semi-Implicit Euler (right side)
  stroke(100);
  strokeWeight(2);
  line(600, anchorY, 600, posSemiImplicit);
  fill(100, 100, 255);
  noStroke();
  circle(600, anchorY, 12);
  fill(150, 150, 255);
  circle(600, posSemiImplicit, 24);

  // Labels
  fill(255, 150, 150);
  textSize(16);
  text("Forward Euler", 140, 30);
  let energyEuler = 0.5 * velEuler * velEuler + 0.5 * k * dispEuler * dispEuler;
  text("Energy: " + energyEuler.toFixed(4), 110, 55);

  fill(150, 150, 255);
  text("Semi-Implicit Euler", 520, 30);
  let energySemi = 0.5 * velSemiImplicit * velSemiImplicit + 0.5 * k * dispSemi * dispSemi;
  text("Energy: " + energySemi.toFixed(4), 510, 55);
}
```

**What you will see:** Two springs side by side. The left (red) one uses true Forward Euler and gradually grows in amplitude -- it gains energy. The right (blue) one uses Semi-Implicit Euler and maintains a stable amplitude -- energy is approximately conserved.

After a few thousand frames, the Forward Euler spring will be oscillating wildly, while the Semi-Implicit Euler spring stays calm.

---

## Step 5: The Complete Update Pattern

Here is the pattern you should use for all your simulations:

```js
update() {
  // Step 1: Accumulate all forces (done before calling update)
  // Step 2: Compute acceleration from total force
  //         (Already done via applyForce, which divides by mass)

  // Step 3: Update velocity using acceleration (Semi-Implicit Euler)
  this.velocity.add(this.acceleration);

  // Optional: limit velocity to prevent instability
  this.velocity.limit(this.maxSpeed);

  // Step 4: Update position using the NEW velocity
  this.position.add(this.velocity);

  // Step 5: Reset acceleration for the next frame
  this.acceleration.mult(0);
}
```

The key insight: **forces are not permanent.** They must be recomputed and reapplied every single frame. Gravity does not stop pulling just because we applied it once. That is why we reset acceleration to zero and reapply all forces each frame.

The sequence each frame is:

```
1. Apply all forces (gravity, springs, drag, etc.)
2. Call update():
   a. velocity += acceleration
   b. position += velocity
   c. acceleration = 0
3. Display the object
```

---

## Step 6: Working with Variable Time Steps

In p5.js, `draw()` runs approximately 60 times per second, but the actual time between frames can vary (due to computation time, browser throttling, etc.). For more accurate simulations, you can use `deltaTime` (the actual time elapsed since the last frame, in milliseconds):

```js
update() {
  let dt = deltaTime / 1000; // Convert milliseconds to seconds

  // Semi-Implicit Euler with variable time step
  this.velocity.add(p5.Vector.mult(this.acceleration, dt));
  this.position.add(p5.Vector.mult(this.velocity, dt));
  this.acceleration.mult(0);
}
```

This makes your simulation frame-rate independent: it will behave the same whether running at 30 fps or 120 fps. However, for artistic simulations where precise physics is not critical, using `dt = 1` (the default when you just `add`) is simpler and usually fine.

---

## Step 7: A Complete Interactive Demo

Here is a complete demo that lets you create bodies with initial velocities, subject to gravity and bouncing, using Semi-Implicit Euler:

```js
let bodies = [];
let dragging = false;
let dragStart;

function setup() {
  createCanvas(800, 600);
  textSize(14);
}

function draw() {
  background(20);

  // Apply forces and update all bodies
  for (let body of bodies) {
    // Gravity
    let gravity = createVector(0, body.mass * 0.3);
    body.applyForce(gravity);

    // Air drag
    let speed = body.velocity.mag();
    if (speed > 0.01) {
      let drag = body.velocity.copy();
      drag.normalize();
      drag.mult(-0.005 * speed * speed);
      body.applyForce(drag);
    }

    // Semi-Implicit Euler update
    body.update();

    // Floor collision
    let r = body.mass * 5;
    if (body.position.y > height - r) {
      body.position.y = height - r;
      body.velocity.y *= -0.7;
      // Friction on the ground
      body.velocity.x *= 0.98;
    }

    // Wall collisions
    if (body.position.x < r) {
      body.position.x = r;
      body.velocity.x *= -0.7;
    }
    if (body.position.x > width - r) {
      body.position.x = width - r;
      body.velocity.x *= -0.7;
    }

    body.display();
  }

  // Draw launch arrow
  if (dragging) {
    stroke(255, 255, 0);
    strokeWeight(2);
    line(dragStart.x, dragStart.y, mouseX, mouseY);

    // Arrowhead
    let angle = atan2(mouseY - dragStart.y, mouseX - dragStart.x);
    let arrowSize = 10;
    line(mouseX, mouseY,
      mouseX - cos(angle - 0.4) * arrowSize,
      mouseY - sin(angle - 0.4) * arrowSize
    );
    line(mouseX, mouseY,
      mouseX - cos(angle + 0.4) * arrowSize,
      mouseY - sin(angle + 0.4) * arrowSize
    );
  }

  // Instructions
  fill(200);
  noStroke();
  text("Click and drag to launch a body. Arrow shows initial velocity.", 10, 25);
  text("Bodies: " + bodies.length, 10, 45);
}

function mousePressed() {
  dragging = true;
  dragStart = createVector(mouseX, mouseY);
}

function mouseReleased() {
  if (dragging) {
    let vel = createVector(mouseX - dragStart.x, mouseY - dragStart.y);
    vel.mult(0.1); // Scale down for reasonable speed
    let body = new Body(dragStart.x, dragStart.y, random(1, 4));
    body.velocity = vel;
    bodies.push(body);
    dragging = false;
  }
}

class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.hue = random(360);
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    // Semi-Implicit Euler
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    colorMode(HSB);
    fill(this.hue, 180, 255);
    colorMode(RGB);
    let r = this.mass * 5;
    circle(this.position.x, this.position.y, r * 2);
  }
}
```

Click and drag to set the launch position and velocity. The arrow shows the direction and speed. Release to launch. Each body has a random mass (shown by size) and color. All bodies are subject to gravity, air drag, and bounce off the floor and walls.

---

## Summary

| Concept | In Math | In Code |
|---|---|---|
| **Derivative** | Rate of change | Difference between frames |
| **Velocity** | d(position)/dt | `position += velocity` |
| **Acceleration** | d(velocity)/dt | `velocity += acceleration` |
| **Integral** | Accumulation over time | `sum += value * dt` each frame |
| **Forward Euler** | Uses old velocity for position | `pos += oldVel; vel += acc;` |
| **Semi-Implicit Euler** | Uses new velocity for position | `vel += acc; pos += vel;` |

**Key takeaways:**

1. Every time you write `position.add(velocity)`, you are performing numerical integration.
2. The order matters: update velocity FIRST, then use the updated velocity to update position. This is Semi-Implicit Euler and it approximately conserves energy.
3. Reset acceleration to zero each frame. Forces must be reapplied every frame.
4. The pattern is always: **accumulate forces -> update velocity -> update position -> reset acceleration**.

---

## Exercises

1. **Energy graph**: Modify the spring demo to draw a real-time graph of total energy over time. Use an array to store the last 300 energy values and draw them as a line graph at the bottom of the canvas. Compare Forward Euler and Semi-Implicit Euler.

2. **Projectile motion**: Create a cannon that launches a ball at a 45-degree angle. Track the ball's path by drawing small dots at each position. Compare the trajectory with and without air drag.

3. **dt experiment**: Create a spring simulation that uses `deltaTime` for the time step. Add a slider to artificially scale `dt`. What happens when dt is very large? At what point does the simulation become unstable?

4. **Double pendulum**: Implement a simple double pendulum (a pendulum hanging from another pendulum). This system is chaotic -- tiny changes in initial conditions produce wildly different trajectories. Launch two double pendulums with nearly identical starting angles and watch them diverge.
