# Tutorial: Semi-Implicit Euler Integration for Ballistics

## MAT 200C: Computing Arts -- Week 1, January 6

---

## What Are We Building?

In this tutorial, we will build a **cannon ballistics simulator** in p5.js. You will click the mouse to fire a cannonball, and the ball will arc through the air under the influence of gravity, tracing a trajectory across the screen.

Along the way, you will learn:

- What numerical integration is and why we need it
- The relationship between position, velocity, and acceleration
- How to implement semi-implicit Euler integration
- How to use the mouse to control cannon angle

By the end, you will have a working physics simulation in under 100 lines of code.

---

## Background: Position, Velocity, and Acceleration

To simulate a cannonball flying through the air, we need to understand three quantities:

### Position

Position is **where** something is. In 2D, position is an (x, y) coordinate. If our cannonball is at position (100, 300), it is 100 pixels from the left edge and 300 pixels from the top edge of the canvas.

### Velocity

Velocity is **how fast** something is moving and **in what direction**. Velocity has two components in 2D:

- `vx` -- horizontal velocity (pixels per frame, in the x direction)
- `vy` -- vertical velocity (pixels per frame, in the y direction)

If a ball has velocity (3, -5), it moves 3 pixels to the right and 5 pixels upward every frame. (Remember: negative y means upward in screen coordinates.)

### Acceleration

Acceleration is the **rate of change of velocity**. It tells you how velocity changes over time. The most important acceleration for our simulation is **gravity**, which pulls everything downward.

In the real world, gravity accelerates objects at approximately 9.8 meters per second squared, directed downward. In our p5.js sketch, we will use a smaller number (like 0.2 pixels per frame squared) that looks good on screen.

### The Chain of Causation

These three quantities are linked:

```
Acceleration changes Velocity.
Velocity changes Position.
```

Or, written with arrows:

```
Force --> Acceleration --> Velocity --> Position
```

Gravity (a force) causes a downward acceleration, which increases the downward velocity each frame, which changes the position each frame. The result: a parabolic arc.

---

## What Is Numerical Integration?

In a physics class, you might solve projectile motion with equations. For example, the analytical solution for position under constant gravity is:

```
x(t) = x0 + vx0 * t
y(t) = y0 + vy0 * t + 0.5 * g * t^2
```

This is an **analytical** (exact, closed-form) solution. It gives you the position at any time `t` directly.

But what if the forces are complicated? What if there is wind that changes direction, or the ball bounces off walls, or gravity varies? Analytical solutions become difficult or impossible.

**Numerical integration** takes a different approach. Instead of solving for the answer in one formula, we take many small **time steps**. At each step, we:

1. Look at the current acceleration
2. Update the velocity based on that acceleration
3. Update the position based on that velocity
4. Repeat

If the time steps are small enough, the result is a very good approximation of the true motion.

This is the core technique behind almost all physics simulations in games, movies, and scientific computing.

---

## Euler Integration: The Simplest Method

The simplest numerical integration method is **Euler integration** (named after the mathematician Leonhard Euler, pronounced "OY-ler").

### Explicit (Forward) Euler

The most naive version updates position first, then velocity:

```
position = position + velocity * dt
velocity = velocity + acceleration * dt
```

Here, `dt` is the time step (how much time passes each frame). In p5.js running at 60 fps, `dt` is roughly 1/60 of a second, but for simplicity we often treat each frame as one unit of time (`dt = 1`).

This is called "explicit" or "forward" Euler because it uses the **current** velocity to update position, before the velocity has been updated for this frame.

### Semi-Implicit (Symplectic) Euler

A small but important improvement is to **update velocity first, then use the new velocity to update position**:

```
velocity = velocity + acceleration * dt
position = position + velocity * dt
```

Notice the difference: velocity is updated *before* position. This means position uses the already-updated velocity rather than the old one.

This is called **semi-implicit Euler** (also known as **symplectic Euler**). It is nearly as simple as explicit Euler, but it has much better energy conservation properties. For our ballistics simulation, it produces more accurate trajectories.

This is the method we will use.

### Why Does the Order Matter?

Consider a ball thrown straight up. With explicit Euler, the position update uses the old (faster upward) velocity, overshooting the true trajectory slightly each frame. With semi-implicit Euler, the position update uses the already-decelerated velocity, which more closely follows the true parabolic path.

For simple simulations the difference is subtle, but for long-running simulations (like orbits or spring systems), semi-implicit Euler is dramatically more stable.

---

## Step 1: A Ball That Falls

Let us start with the simplest possible physics simulation -- a ball that falls under gravity.

```js
// Position
let x = 200;
let y = 50;

// Velocity
let vx = 2;
let vy = 0;

// Acceleration (gravity)
let gravity = 0.2;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);

  // --- Semi-Implicit Euler Integration ---
  // Step 1: Update velocity (acceleration changes velocity)
  vy = vy + gravity;

  // Step 2: Update position (velocity changes position)
  x = x + vx;
  y = y + vy;

  // --- Draw the ball ---
  fill(255, 100, 50);
  noStroke();
  circle(x, y, 20);
}
```

Run this sketch. You will see an orange ball that arcs across the screen and falls downward -- a parabolic trajectory, just like a real projectile.

Notice how the code directly implements the semi-implicit Euler equations:

```
vy = vy + gravity     (velocity = velocity + acceleration * dt, where dt = 1)
y  = y  + vy          (position = position + velocity * dt)
```

The gravity value (0.2) is positive because in screen coordinates, positive y is downward. Gravity pulls things down, so it adds to `vy`.

---

## Step 2: Drawing the Trajectory

It would be nice to see the path the ball traces. We can store the ball's positions in an array and draw them as connected lines.

```js
// Position
let x = 200;
let y = 50;

// Velocity
let vx = 2;
let vy = 0;

// Acceleration
let gravity = 0.2;

// Trail storage
let trail = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);

  // --- Semi-Implicit Euler Integration ---
  vy = vy + gravity;
  x = x + vx;
  y = y + vy;

  // Store current position in the trail
  trail.push({ x: x, y: y });

  // --- Draw the trajectory ---
  stroke(255, 200, 50, 150);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < trail.length; i++) {
    vertex(trail[i].x, trail[i].y);
  }
  endShape();

  // --- Draw the ball ---
  fill(255, 100, 50);
  noStroke();
  circle(x, y, 20);
}
```

Now you can see the parabolic arc traced by the ball as it flies through the air.

---

## Step 3: A Cannon That Aims at the Mouse

Now let us add a cannon. The cannon will be positioned at the bottom-left of the screen and will aim toward the mouse cursor. When you click, it fires a ball in that direction.

The key idea: we need to calculate the **angle** from the cannon to the mouse, then use that angle to set the initial velocity of the ball.

### Calculating the Angle

p5.js provides `atan2(y, x)`, which returns the angle (in radians) from the origin to the point (x, y). To get the angle from the cannon to the mouse:

```js
let angle = atan2(mouseY - cannonY, mouseX - cannonX);
```

### Converting Angle to Velocity

If we want the ball to launch at a given speed and angle:

```js
let speed = 8;
let vx = speed * cos(angle);
let vy = speed * sin(angle);
```

This uses basic trigonometry: `cos(angle)` gives the horizontal component, `sin(angle)` gives the vertical component.

### Full Cannon Example

```js
// Cannon position (bottom-left of canvas)
let cannonX = 30;
let cannonY = 370;
let cannonLength = 50;

// Projectile state
let ballX, ballY;
let ballVX, ballVY;
let isFired = false;

// Physics
let gravity = 0.2;
let launchSpeed = 8;

// Trail
let trail = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30, 30, 50);

  // Calculate angle from cannon to mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  // --- Draw the cannon ---
  stroke(200);
  strokeWeight(6);
  let endX = cannonX + cannonLength * cos(angle);
  let endY = cannonY + cannonLength * sin(angle);
  line(cannonX, cannonY, endX, endY);

  // Draw cannon base
  fill(150);
  noStroke();
  circle(cannonX, cannonY, 24);

  // --- Update and draw the projectile ---
  if (isFired) {
    // Semi-Implicit Euler Integration
    ballVY = ballVY + gravity;   // Update velocity first
    ballX = ballX + ballVX;      // Then update position
    ballY = ballY + ballVY;

    // Store trail position
    trail.push({ x: ballX, y: ballY });

    // Draw trajectory
    stroke(255, 200, 50, 120);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let i = 0; i < trail.length; i++) {
      vertex(trail[i].x, trail[i].y);
    }
    endShape();

    // Draw the ball
    fill(255, 100, 50);
    noStroke();
    circle(ballX, ballY, 14);

    // Reset if the ball goes off-screen
    if (ballX > width + 50 || ballY > height + 50 || ballX < -50) {
      isFired = false;
    }
  }

  // --- Instructions ---
  fill(200);
  noStroke();
  textSize(14);
  text("Click to fire!", 20, 20);
}

function mousePressed() {
  // Calculate angle from cannon to mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  // Set ball starting position and velocity
  ballX = cannonX;
  ballY = cannonY;
  ballVX = launchSpeed * cos(angle);
  ballVY = launchSpeed * sin(angle);

  // Clear old trail and fire
  trail = [];
  isFired = true;
}
```

Try this sketch. Move your mouse to aim the cannon, then click to fire. The ball will arc through the air under gravity.

---

## Step 4: Multiple Projectiles

What if we want to fire many balls and see all their trajectories at once? We can use an **array of objects** to track multiple projectiles.

```js
let cannonX = 30;
let cannonY = 370;
let cannonLength = 50;

let gravity = 0.2;
let launchSpeed = 8;

// Array to hold all active projectiles
let projectiles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30, 30, 50);

  // Calculate angle from cannon to mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  // --- Draw the cannon ---
  stroke(200);
  strokeWeight(6);
  let endX = cannonX + cannonLength * cos(angle);
  let endY = cannonY + cannonLength * sin(angle);
  line(cannonX, cannonY, endX, endY);

  fill(150);
  noStroke();
  circle(cannonX, cannonY, 24);

  // --- Draw aiming line (dotted) ---
  stroke(255, 255, 255, 60);
  strokeWeight(1);
  let farX = cannonX + 500 * cos(angle);
  let farY = cannonY + 500 * sin(angle);
  drawingContext.setLineDash([5, 5]);
  line(cannonX, cannonY, farX, farY);
  drawingContext.setLineDash([]);

  // --- Update and draw all projectiles ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];

    // Semi-Implicit Euler Integration
    p.vy += gravity;
    p.x += p.vx;
    p.y += p.vy;

    // Store trail
    p.trail.push({ x: p.x, y: p.y });

    // Draw trajectory
    stroke(p.color[0], p.color[1], p.color[2], 100);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let j = 0; j < p.trail.length; j++) {
      vertex(p.trail[j].x, p.trail[j].y);
    }
    endShape();

    // Draw the ball
    fill(p.color[0], p.color[1], p.color[2]);
    noStroke();
    circle(p.x, p.y, 12);

    // Remove if off-screen
    if (p.x > width + 50 || p.y > height + 50 || p.x < -50) {
      projectiles.splice(i, 1);
    }
  }

  // --- Instructions ---
  fill(200);
  noStroke();
  textSize(14);
  text("Click to fire!  Projectiles: " + projectiles.length, 20, 20);
}

function mousePressed() {
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  let projectile = {
    x: cannonX,
    y: cannonY,
    vx: launchSpeed * cos(angle),
    vy: launchSpeed * sin(angle),
    trail: [],
    color: [
      random(150, 255),
      random(80, 200),
      random(50, 150)
    ]
  };

  projectiles.push(projectile);
}
```

Now each click adds a new projectile. The old ones remain on screen (with their trajectories) until they fly off the edge. Each ball gets a random warm color so you can distinguish them.

---

## Understanding the Physics in Detail

Let us trace through what happens frame by frame when a ball is fired upward and to the right with initial velocity (6, -7):

| Frame | vx | vy (before) | vy (after gravity) | x | y |
|---|---|---|---|---|---|
| 0 | 6 | -7.0 | -6.8 | 36 | 363.2 |
| 1 | 6 | -6.8 | -6.6 | 42 | 356.6 |
| 2 | 6 | -6.6 | -6.4 | 48 | 350.2 |
| ... | ... | ... | ... | ... | ... |
| 34 | 6 | -0.2 | 0.0 | 234 | ~peak |
| 35 | 6 | 0.0 | 0.2 | 240 | starts falling |

Notice:

- `vx` never changes (no horizontal forces)
- `vy` starts negative (moving up), gets closer to zero as gravity pulls it down, then becomes positive (moving down)
- The ball reaches its peak when `vy` passes through zero
- The trajectory is a parabola

This is exactly the same physics as a real projectile (ignoring air resistance).

---

## Enhancements to Try

### 1. Add a Ground

Stop the ball when it hits the bottom of the canvas:

```js
// After updating position, check for ground collision
if (p.y >= height) {
  p.y = height;
  p.vy = -p.vy * 0.7;  // Bounce with energy loss
  p.vx = p.vx * 0.9;    // Friction
}
```

### 2. Add Air Resistance

Air resistance (drag) is a force that opposes motion and is proportional to velocity:

```js
let drag = 0.01;
p.vx -= p.vx * drag;
p.vy -= p.vy * drag;
```

Add these lines before the Euler integration step.

### 3. Add Wind

Wind is simply a constant horizontal acceleration:

```js
let wind = 0.05;  // Blowing to the right
p.vx += wind;
```

### 4. Variable Launch Speed

Use the distance between the cannon and the mouse to control launch speed:

```js
let d = dist(cannonX, cannonY, mouseX, mouseY);
let speed = map(d, 0, 400, 2, 15);  // Farther mouse = faster launch
```

---

## The Complete Final Sketch

Here is the polished version with a ground plane, bouncing, and variable launch speed:

```js
let cannonX = 40;
let cannonY;
let cannonLength = 50;

let gravity = 0.3;
let groundY;

let projectiles = [];

function setup() {
  createCanvas(700, 450);
  groundY = height - 30;
  cannonY = groundY;
}

function draw() {
  // Sky gradient
  background(20, 20, 40);

  // Ground
  fill(50, 120, 50);
  noStroke();
  rect(0, groundY, width, height - groundY);

  // Calculate angle from cannon to mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  // Clamp angle so cannon doesn't aim underground
  if (angle > 0) angle = 0;

  // Calculate launch speed from mouse distance
  let d = dist(cannonX, cannonY, mouseX, mouseY);
  let launchSpeed = map(d, 0, 500, 3, 14);
  launchSpeed = constrain(launchSpeed, 3, 14);

  // --- Draw the cannon ---
  push();
  stroke(180);
  strokeWeight(8);
  strokeCap(SQUARE);
  let endX = cannonX + cannonLength * cos(angle);
  let endY = cannonY + cannonLength * sin(angle);
  line(cannonX, cannonY, endX, endY);
  pop();

  // Cannon base
  fill(120);
  noStroke();
  arc(cannonX, cannonY, 30, 30, PI, TWO_PI);

  // --- Update and draw all projectiles ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];

    // Semi-Implicit Euler
    p.vy += gravity;
    p.x += p.vx;
    p.y += p.vy;

    // Ground collision
    if (p.y >= groundY - 6) {
      p.y = groundY - 6;
      p.vy = -p.vy * 0.6;
      p.vx = p.vx * 0.85;

      // Stop if barely moving
      if (abs(p.vy) < 0.5) {
        p.vy = 0;
        p.settled = true;
      }
    }

    // Store trail
    if (!p.settled) {
      p.trail.push({ x: p.x, y: p.y });
    }

    // Draw trajectory
    stroke(p.color[0], p.color[1], p.color[2], 80);
    strokeWeight(1);
    noFill();
    beginShape();
    for (let j = 0; j < p.trail.length; j++) {
      vertex(p.trail[j].x, p.trail[j].y);
    }
    endShape();

    // Draw the ball
    fill(p.color[0], p.color[1], p.color[2]);
    noStroke();
    circle(p.x, p.y, 12);

    // Remove if off-screen horizontally
    if (p.x > width + 100 || p.x < -100) {
      projectiles.splice(i, 1);
    }
  }

  // --- UI: Power indicator ---
  let powerPct = map(launchSpeed, 3, 14, 0, 100);
  fill(200);
  noStroke();
  textSize(13);
  text("Power: " + nf(powerPct, 1, 0) + "%", 20, 20);
  text("Aim and click to fire!", 20, 38);
  text("(Move mouse farther from cannon for more power)", 20, 54);

  // Power bar
  let barWidth = 100;
  let barHeight = 8;
  let barX = 200;
  let barY = 12;
  fill(60);
  rect(barX, barY, barWidth, barHeight, 4);
  fill(lerpColor(color(100, 200, 100), color(255, 80, 50), powerPct / 100));
  rect(barX, barY, barWidth * powerPct / 100, barHeight, 4);
}

function mousePressed() {
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);
  if (angle > 0) angle = 0;

  let d = dist(cannonX, cannonY, mouseX, mouseY);
  let launchSpeed = map(d, 0, 500, 3, 14);
  launchSpeed = constrain(launchSpeed, 3, 14);

  let projectile = {
    x: cannonX + cannonLength * cos(angle),
    y: cannonY + cannonLength * sin(angle),
    vx: launchSpeed * cos(angle),
    vy: launchSpeed * sin(angle),
    trail: [],
    settled: false,
    color: [
      random(200, 255),
      random(100, 200),
      random(30, 100)
    ]
  };

  projectiles.push(projectile);
}
```

---

## Summary

In this tutorial you learned:

1. **Position, velocity, and acceleration** are the three quantities needed to simulate motion
2. **Numerical integration** approximates motion by taking many small time steps, as opposed to solving equations analytically
3. **Semi-implicit Euler** updates velocity first, then position, which gives better results than the naive approach
4. **Gravity** is a constant downward acceleration that creates parabolic trajectories
5. **Trigonometry** (`cos` and `sin` with `atan2`) lets you convert between angles and directional velocities

The semi-implicit Euler method is the foundation of physics simulation. The same technique, with more forces and constraints, powers everything from video game physics engines to scientific simulations. You now have the core building block.
