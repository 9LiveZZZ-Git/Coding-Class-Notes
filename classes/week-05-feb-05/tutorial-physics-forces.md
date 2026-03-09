# Tutorial: Implementing Physics Forces in p5.js

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Introduction

In the previous class, we built particle systems and agent systems using simple forces like gravity. Now we will explore the full landscape of forces available to us: gravitational attraction, springs, electrostatic repulsion, friction, and drag. Each force has its own mathematical law, but they all plug into the same simulation framework: accumulate forces, compute acceleration, update velocity, update position.

By the end of this tutorial, you will have a simulation with multiple interacting forces, and you will understand the physics behind each one.

---

## Step 1: The Physics Body

First, let us create a reusable `Body` class that handles the physics update loop. Every object in our simulation will extend or use this pattern.

```js
class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
  }

  applyForce(force) {
    // Newton's second law: a = F / m
    // We divide by mass so that heavier objects are harder to accelerate
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    // Euler integration
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    // Reset acceleration for the next frame
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(200);
    // Size proportional to mass
    let radius = this.mass * 8;
    circle(this.position.x, this.position.y, radius);
  }
}
```

**Why divide force by mass?** Newton's second law says F = ma, which means a = F/m. A 10-Newton force applied to a 1-kg object produces an acceleration of 10 m/s^2, but the same force applied to a 10-kg object produces only 1 m/s^2. Heavier objects are harder to move. Our `applyForce()` method captures this.

---

## Step 2: Gravity (F = mg)

Gravity near Earth's surface is modeled as a constant downward force proportional to mass:

**F_gravity = m * g**

where `g` is the gravitational acceleration (approximately 9.8 m/s^2 in the real world; we use a much smaller value in pixel-space).

```js
let body;

function setup() {
  createCanvas(600, 400);
  body = new Body(width / 2, 50, 2);
}

function draw() {
  background(30);

  // Gravity: F = m * g
  // We multiply by mass here so that when applyForce divides by mass,
  // all objects fall at the same rate (as in real life)
  let g = 0.2;
  let gravityForce = createVector(0, body.mass * g);
  body.applyForce(gravityForce);

  body.update();
  body.display();

  // Bounce off the floor
  if (body.position.y > height - body.mass * 4) {
    body.position.y = height - body.mass * 4;
    body.velocity.y *= -0.8; // Lose some energy on bounce
  }
}

class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(100, 180, 255);
    let radius = this.mass * 8;
    circle(this.position.x, this.position.y, radius);
  }
}
```

The ball falls under gravity and bounces off the floor, losing energy with each bounce (the `*= -0.8` reverses the velocity and reduces it by 20%).

**Why multiply by mass in the gravity force?** Because `applyForce()` divides by mass. If we did not multiply, lighter objects would fall faster than heavier ones (the opposite of reality). By making the force proportional to mass, the mass cancels out, and all objects experience the same gravitational acceleration regardless of mass.

---

## Step 3: Multiple Bodies with Gravity

Let us create several bodies with different masses and see them all fall at the same rate.

```js
let bodies = [];

function setup() {
  createCanvas(600, 400);
  // Create bodies with different masses
  for (let i = 0; i < 5; i++) {
    let mass = random(1, 5);
    bodies.push(new Body(100 + i * 100, 50, mass));
  }
}

function draw() {
  background(30);

  let g = 0.2;

  for (let body of bodies) {
    // Gravity force proportional to mass
    let gravityForce = createVector(0, body.mass * g);
    body.applyForce(gravityForce);

    body.update();
    body.display();

    // Floor bounce
    let radius = body.mass * 4;
    if (body.position.y > height - radius) {
      body.position.y = height - radius;
      body.velocity.y *= -0.8;
    }
  }
}

class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(100, 180, 255);
    let radius = this.mass * 8;
    circle(this.position.x, this.position.y, radius);
  }
}
```

All bodies fall at the same rate despite different sizes. They bounce at different heights because larger bodies lose the same proportion of energy but started with the same velocity, and the bounce point depends on their radius.

---

## Step 4: Springs with Hooke's Law (F = -kx)

A **spring** is an elastic connection between two points. Robert Hooke discovered in 1660 that the force exerted by a spring is proportional to how far it is stretched from its natural (rest) length:

**F_spring = -k * x**

where:
- `k` is the **spring constant** (stiffness). Higher k = stiffer spring.
- `x` is the **displacement** -- how far the spring is stretched or compressed from its rest length.
- The negative sign means the force always pulls back toward the rest length (a restoring force).

In 2D, we extend this to vectors. The spring connects two positions. We compute the current length, subtract the rest length to get the displacement, and apply the force along the spring direction.

```js
let anchor;
let bob;
let restLength = 150;
let k = 0.01; // Spring constant

function setup() {
  createCanvas(600, 400);
  anchor = createVector(width / 2, 50);
  bob = new Body(width / 2 + 100, 200, 2);
}

function draw() {
  background(30);

  // --- Compute spring force ---
  // Vector from anchor to bob
  let springVector = p5.Vector.sub(bob.position, anchor);
  // Current length of the spring
  let currentLength = springVector.mag();
  // Displacement from rest length
  let displacement = currentLength - restLength;
  // Normalize to get direction, then scale by -k * displacement
  springVector.normalize();
  springVector.mult(-k * displacement);
  // Apply the spring force to the bob
  bob.applyForce(springVector);

  // --- Apply gravity ---
  let gravity = createVector(0, bob.mass * 0.1);
  bob.applyForce(gravity);

  // --- Apply damping (friction-like force to prevent eternal oscillation) ---
  let damping = bob.velocity.copy();
  damping.mult(-0.02);
  bob.applyForce(damping);

  bob.update();

  // --- Draw the spring ---
  stroke(150);
  strokeWeight(2);
  line(anchor.x, anchor.y, bob.position.x, bob.position.y);

  // Draw the anchor point
  fill(255, 100, 100);
  noStroke();
  circle(anchor.x, anchor.y, 16);

  // Draw the bob
  bob.display();
}

class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(100, 200, 150);
    circle(this.position.x, this.position.y, this.mass * 12);
  }
}
```

**What you will see:** A green ball connected to a red anchor point by a line (the spring). The ball bounces and oscillates. Gravity pulls it down. The spring pulls it back toward the rest length. Damping gradually reduces the oscillation so it eventually settles.

**The damping force** (`bob.velocity.copy().mult(-0.02)`) is a simple approximation of friction. It applies a small force opposite to the direction of movement. Without it, the spring would oscillate forever.

---

## Step 5: Coulomb's Law -- Electrostatic Repulsion (F = kqq/r^2)

Coulomb's law describes the force between electrically charged objects:

**F = k * q1 * q2 / r^2**

where:
- `k` is Coulomb's constant (we will use an arbitrary value)
- `q1` and `q2` are the charges of the two objects
- `r` is the distance between them
- If both charges have the same sign, the force is repulsive. If opposite, attractive.

We will simulate charged particles that repel each other:

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 15; i++) {
    let p = new ChargedBody(random(100, 500), random(100, 300), 1, 1);
    particles.push(p);
  }
}

function draw() {
  background(30);

  // Apply Coulomb repulsion between all pairs
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let force = coulombForce(particles[i], particles[j]);
      particles[i].applyForce(force);
      // Newton's third law: equal and opposite force on the other particle
      let opposite = p5.Vector.mult(force, -1);
      particles[j].applyForce(opposite);
    }
  }

  // Apply damping and update
  for (let p of particles) {
    // Damping to settle over time
    let damping = p.velocity.copy().mult(-0.1);
    p.applyForce(damping);

    p.update();

    // Keep particles on screen
    p.position.x = constrain(p.position.x, 10, width - 10);
    p.position.y = constrain(p.position.y, 10, height - 10);

    p.display();
  }
}

function coulombForce(a, b) {
  // Vector from b to a
  let force = p5.Vector.sub(a.position, b.position);
  let distance = force.mag();
  // Clamp distance to prevent extreme forces when particles are very close
  distance = constrain(distance, 20, 500);
  // Coulomb's law: F = k * q1 * q2 / r^2
  let strength = (500 * a.charge * b.charge) / (distance * distance);
  force.setMag(strength);
  return force;
}

class ChargedBody {
  constructor(x, y, mass, charge) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.charge = charge;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(255, 200, 50);
    circle(this.position.x, this.position.y, 16);
  }
}
```

**What you will see:** 15 yellow particles that push each other apart and spread across the canvas, eventually settling into a roughly even distribution. The particles are all positively charged, so they all repel each other.

**Key detail: clamping distance.** We use `constrain(distance, 20, 500)` to prevent the force from becoming infinite when two particles are extremely close (since we divide by `distance * distance`, very small distances produce enormous forces). This is a common technique in simulations.

---

## Step 6: Universal Gravitation (F = Gm1m2/r^2)

Newton's Law of Universal Gravitation is structurally identical to Coulomb's law, but always attractive:

**F = G * m1 * m2 / r^2**

where:
- `G` is the gravitational constant
- `m1` and `m2` are the masses
- `r` is the distance between them

```js
let bodies = [];
let sun;

function setup() {
  createCanvas(600, 600);
  // A massive central body (the "sun")
  sun = new Body(width / 2, height / 2, 50);

  // Several smaller orbiting bodies
  for (let i = 0; i < 6; i++) {
    let distance = random(80, 250);
    let angle = random(TWO_PI);
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    let planet = new Body(x, y, random(1, 3));

    // Give each planet an initial velocity perpendicular to the radius
    // This creates orbital motion
    let speed = sqrt(0.5 * sun.mass / distance); // Approximate orbital speed
    planet.velocity = createVector(-sin(angle) * speed, cos(angle) * speed);

    bodies.push(planet);
  }
}

function draw() {
  background(10);

  // Apply gravitational attraction between each body and the sun
  for (let body of bodies) {
    let force = gravitationalForce(sun, body);
    body.applyForce(force);
    body.update();
    body.display();
  }

  // Draw the sun
  fill(255, 200, 50);
  noStroke();
  circle(sun.position.x, sun.position.y, sun.mass * 2);
}

function gravitationalForce(a, b) {
  // Vector from b to a (attractive: b is pulled toward a)
  let force = p5.Vector.sub(a.position, b.position);
  let distance = force.mag();
  distance = constrain(distance, 20, 500);
  // Newton's gravitation: F = G * m1 * m2 / r^2
  let G = 0.5;
  let strength = (G * a.mass * b.mass) / (distance * distance);
  force.setMag(strength);
  return force;
}

class Body {
  constructor(x, y, mass) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    fill(100, 180, 255);
    circle(this.position.x, this.position.y, this.mass * 6);
  }
}
```

**What you will see:** A yellow "sun" at the center with blue "planets" orbiting around it. The orbits are not perfectly circular (they are slightly elliptical) because our initial velocity approximation is not exact, and Euler integration introduces small energy errors. This is actually a nice demonstration of the limitations of forward Euler integration -- we will discuss better methods in the Euler integration tutorial.

---

## Step 7: Friction and Drag

### Friction

**Kinetic friction** opposes the direction of motion with a constant magnitude:

**F_friction = -mu * N * v_hat**

where:
- `mu` is the coefficient of friction
- `N` is the normal force (for objects sliding on a surface, this is typically the weight: m * g)
- `v_hat` is the unit vector in the direction of velocity

In a simple 2D simulation, we often simplify to:

```js
function applyFriction(body) {
  let friction = body.velocity.copy();
  friction.normalize();     // Get direction of motion
  friction.mult(-1);        // Reverse it (friction opposes motion)

  let mu = 0.05;            // Coefficient of friction
  let normalForce = body.mass; // Simplified normal force
  friction.mult(mu * normalForce);

  body.applyForce(friction);
}
```

### Drag

**Drag** (air resistance or fluid resistance) opposes motion with a force proportional to the **square** of the speed:

**F_drag = -0.5 * rho * v^2 * A * C_d * v_hat**

In simulations, we simplify this to:

**F_drag = -c * |v|^2 * v_hat**

where `c` is a drag coefficient that combines all the constants.

```js
function applyDrag(body) {
  let speed = body.velocity.mag();
  let dragMagnitude = 0.01 * speed * speed; // c * v^2

  let drag = body.velocity.copy();
  drag.normalize();
  drag.mult(-dragMagnitude); // Opposite to velocity

  body.applyForce(drag);
}
```

**The difference between friction and drag:**
- **Friction** has a constant magnitude (it does not depend on speed). An object sliding across a table experiences the same friction whether it is going fast or slow.
- **Drag** increases with the square of speed. The faster you go through air or water, the dramatically more resistance you feel.

---

## Step 8: Complete Multi-Force Simulation

Here is a complete simulation that combines gravity, springs, Coulomb repulsion, and drag:

```js
let bodies = [];
let anchorPos;
let springRestLength = 100;
let springK = 0.005;

function setup() {
  createCanvas(800, 600);
  anchorPos = createVector(width / 2, 100);

  // Create several bodies
  for (let i = 0; i < 8; i++) {
    let x = random(200, 600);
    let y = random(200, 500);
    let mass = random(1, 4);
    let charge = 1;
    bodies.push(new ChargedBody(x, y, mass, charge));
  }
}

function draw() {
  background(20);

  // 1. Draw spring connections to anchor
  stroke(80);
  strokeWeight(1);
  for (let body of bodies) {
    line(anchorPos.x, anchorPos.y, body.position.x, body.position.y);
  }

  // 2. Draw anchor
  fill(255, 80, 80);
  noStroke();
  circle(anchorPos.x, anchorPos.y, 20);

  // 3. Apply forces to each body
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i];

    // Force 1: Gravity (F = m * g, downward)
    let gravity = createVector(0, body.mass * 0.1);
    body.applyForce(gravity);

    // Force 2: Spring toward anchor (Hooke's law)
    let springForce = computeSpring(body.position, anchorPos, springRestLength, springK);
    body.applyForce(springForce);

    // Force 3: Coulomb repulsion from all other bodies
    for (let j = 0; j < bodies.length; j++) {
      if (i !== j) {
        let repulsion = computeCoulomb(body, bodies[j]);
        body.applyForce(repulsion);
      }
    }

    // Force 4: Drag (slows things down, prevents chaos)
    let speed = body.velocity.mag();
    if (speed > 0) {
      let drag = body.velocity.copy();
      drag.normalize();
      drag.mult(-0.02 * speed * speed);
      body.applyForce(drag);
    }

    body.update();
    body.display();
  }

  // Instructions
  fill(200);
  noStroke();
  textSize(14);
  text("Click to add a body. Drag the mouse to move the anchor.", 10, height - 20);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    bodies.push(new ChargedBody(mouseX, mouseY, random(1, 4), 1));
  }
}

function mouseDragged() {
  anchorPos.x = mouseX;
  anchorPos.y = mouseY;
}

function computeSpring(posA, posB, restLength, k) {
  let spring = p5.Vector.sub(posB, posA);
  let currentLength = spring.mag();
  let displacement = currentLength - restLength;
  spring.normalize();
  spring.mult(k * displacement); // Positive displacement = pull toward anchor
  return spring;
}

function computeCoulomb(a, b) {
  let force = p5.Vector.sub(a.position, b.position);
  let distance = force.mag();
  distance = constrain(distance, 30, 500);
  let strength = (200 * a.charge * b.charge) / (distance * distance);
  force.setMag(strength);
  return force;
}

class ChargedBody {
  constructor(x, y, mass, charge) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.charge = charge;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    noStroke();
    // Color based on mass
    let r = map(this.mass, 1, 4, 100, 255);
    let g = map(this.mass, 1, 4, 220, 100);
    fill(r, g, 150);
    circle(this.position.x, this.position.y, this.mass * 10);
  }
}
```

**What you will see:** Several colored circles connected by lines to a red anchor point. The bodies:
- Fall downward due to gravity.
- Are pulled back by springs toward the anchor.
- Repel each other via Coulomb's law.
- Slow down due to drag.

The interplay of these four forces creates a dynamic, organic-looking system. You can drag the anchor point around to disturb the system, and click to add more bodies.

---

## Summary of Forces

| Force | Formula | Direction | Key Property |
|---|---|---|---|
| **Gravity (surface)** | F = mg | Downward | Constant, proportional to mass |
| **Hooke's Law (spring)** | F = -kx | Toward rest length | Proportional to displacement |
| **Coulomb's Law** | F = kq1q2/r^2 | Along line between charges | Inverse square of distance |
| **Universal Gravitation** | F = Gm1m2/r^2 | Attractive, along line between masses | Inverse square of distance |
| **Friction** | F = -mu*N*v_hat | Opposite to motion | Constant magnitude |
| **Drag** | F = -c*v^2*v_hat | Opposite to motion | Proportional to speed squared |

---

## Exercises

1. **Elastic string**: Create a chain of 10 bodies connected by springs. The first body is pinned to the top of the canvas. Gravity pulls the chain down. Click to grab and drag the last body.

2. **Charge interaction**: Create a simulation with both positive (red) and negative (blue) charges. Positive charges repel positive charges, negative repel negative, but positive and negative attract each other.

3. **Orbital playground**: Extend the gravitation example so that clicking creates a new planet with an initial velocity perpendicular to the line from the click point to the sun. Try to create stable orbits.

4. **Drag visualization**: Create a simulation where objects fall through two zones: an "air" zone (low drag) and a "water" zone (high drag, shown in blue). Watch how objects decelerate sharply when they enter the water.
