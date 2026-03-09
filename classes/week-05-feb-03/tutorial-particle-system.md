# Tutorial: Building a Particle System in p5.js

## MAT 200C: Computing Arts -- Week 5, February 3

---

## Introduction

A particle system is one of the most fundamental techniques in computer graphics and simulation. It was pioneered by William Reeves at Lucasfilm in 1983 for the "Genesis effect" in *Star Trek II: The Wrath of Khan* -- a wall of fire sweeping across a planet's surface. The key insight was that some visual phenomena (fire, smoke, sparks, water spray, explosions) are best represented not as solid surfaces but as collections of many tiny, short-lived elements called **particles**.

In this tutorial, you will build a particle system from scratch in p5.js. By the end, you will have:

- A `Particle` class with position, velocity, acceleration, and lifespan
- Gravity and other forces acting on particles
- Particles that fade out and shrink as they age
- A particle emitter that continuously spawns new particles
- Multiple emitters creating different effects

---

## Step 1: Understanding What a Particle Is

A particle is a simple object with just a few properties:

- **Position** -- where the particle is (x, y)
- **Velocity** -- how fast and in what direction it is moving
- **Acceleration** -- how the velocity is changing (forces acting on it)
- **Lifespan** -- how long the particle has left to live, typically starting at 255 and counting down to 0

Each frame, the particle updates its physics (acceleration changes velocity, velocity changes position), decreases its lifespan, and draws itself. When the lifespan reaches zero, the particle is "dead" and should be removed.

---

## Step 2: A Single Particle

Let us begin by creating one particle that falls under gravity and fades out.

```js
let particle;

function setup() {
  createCanvas(600, 400);
  // Create a particle at the center-top of the canvas
  particle = new Particle(width / 2, 50);
}

function draw() {
  background(20);
  particle.update();
  particle.display();
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    // Random initial velocity: slight horizontal spread, moving upward slightly
    this.velocity = createVector(random(-1, 1), random(-2, 0));
    // Acceleration starts at zero -- we will add forces each frame
    this.acceleration = createVector(0, 0);
    // Lifespan starts at 255 (fully visible) and counts down
    this.lifespan = 255;
  }

  update() {
    // Apply gravity: a constant downward force
    let gravity = createVector(0, 0.05);
    this.applyForce(gravity);

    // Physics integration: acceleration changes velocity, velocity changes position
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    // Reset acceleration each frame (forces are re-applied every frame)
    this.acceleration.mult(0);

    // Decrease lifespan
    this.lifespan -= 2;
  }

  applyForce(force) {
    // Accumulate forces into acceleration
    this.acceleration.add(force);
  }

  display() {
    // Use lifespan as the alpha (transparency) value
    noStroke();
    fill(255, this.lifespan);
    circle(this.position.x, this.position.y, 12);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

**What is happening here:**

- The particle starts near the top of the canvas with a small random velocity.
- Each frame, gravity (a tiny downward force) is applied. The `applyForce()` method accumulates forces into `this.acceleration`.
- In `update()`, acceleration is added to velocity, and velocity is added to position. This is called **Euler integration** -- the simplest way to simulate physics.
- After updating, acceleration is reset to zero. This is important because forces must be re-applied every frame. If we did not reset, the acceleration would grow without bound.
- The lifespan decreases by 2 each frame, so the particle lives for about 127 frames (roughly 2 seconds at 60 fps).
- In `display()`, the lifespan is used as the alpha channel of the fill color, so the particle fades from fully opaque to fully transparent as it dies.

Run this code. You will see a single white dot that drifts downward and fades away. After it fades completely, nothing else happens because we are only creating one particle.

---

## Step 3: Many Particles

One particle is not very exciting. A particle system needs to continuously emit new particles and remove dead ones. We will use an array to manage a collection of particles.

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(20);

  // Emit a new particle each frame from the center-top
  particles.push(new Particle(width / 2, 50));

  // Update and display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();

    // Remove dead particles
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-2, 0));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;
  }

  update() {
    let gravity = createVector(0, 0.05);
    this.applyForce(gravity);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 2;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();
    fill(255, this.lifespan);
    circle(this.position.x, this.position.y, 12);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

**Key detail: iterating backward.** Notice that we loop through the array from the end to the beginning (`for (let i = particles.length - 1; i >= 0; i--)`). This is because we are removing elements from the array with `splice()` while iterating. If we iterated forward, removing an element would shift all subsequent elements down by one index, causing us to skip the next element. Iterating backward avoids this problem.

Run this code. You should see a continuous fountain of white dots falling downward from the top center, each fading to transparent before disappearing.

---

## Step 4: Adding Visual Richness

Plain white circles are functional but not visually interesting. Let us make our particles more expressive by varying their color, size, and adding size changes over time.

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(20);

  // Emit several particles each frame for a denser effect
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(width / 2, 50));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();

    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-3, -0.5));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;

    // Each particle gets a random warm color (reds, oranges, yellows)
    this.color = color(
      random(200, 255),   // Red channel: high
      random(50, 180),    // Green channel: medium
      random(0, 50),      // Blue channel: low
    );

    // Each particle gets a random starting size
    this.size = random(6, 16);
  }

  update() {
    let gravity = createVector(0, 0.08);
    this.applyForce(gravity);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 3;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();

    // Map lifespan to alpha for fading
    let alpha = this.lifespan;

    // Map lifespan to size: particles shrink as they age
    let currentSize = map(this.lifespan, 255, 0, this.size, 0);

    // Apply the color with the fading alpha
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    fill(r, g, b, alpha);

    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

Now you should see a warm, fire-like fountain of particles. Each particle has a random warm color, starts at a random size, and shrinks as it fades out. We also emit 3 particles per frame instead of 1, creating a denser stream.

---

## Step 5: Creating a Particle Emitter Class

As particle systems grow more complex, it is helpful to encapsulate the emission logic into its own class. An **Emitter** (sometimes called a **ParticleSystem**) is responsible for:

- Storing its position (where particles are born)
- Creating new particles each frame
- Updating and removing particles

```js
let emitter;

function setup() {
  createCanvas(600, 400);
  emitter = new Emitter(width / 2, 50);
}

function draw() {
  background(20);

  emitter.emit(3); // Create 3 particles per frame
  emitter.update();
  emitter.display();
}

class Emitter {
  constructor(x, y) {
    this.origin = createVector(x, y);
    this.particles = [];
  }

  emit(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.origin.x, this.origin.y));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let particle of this.particles) {
      particle.display();
    }
  }

  // Apply a force to all particles in this emitter
  applyForce(force) {
    for (let particle of this.particles) {
      particle.applyForce(force);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-3, -0.5));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;
    this.color = color(
      random(200, 255),
      random(50, 180),
      random(0, 50)
    );
    this.size = random(6, 16);
  }

  update() {
    let gravity = createVector(0, 0.08);
    this.applyForce(gravity);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 3;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();
    let alpha = this.lifespan;
    let currentSize = map(this.lifespan, 255, 0, this.size, 0);
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    fill(r, g, b, alpha);
    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

The behavior is the same as before, but the code is now better organized. The `Emitter` class handles the particle lifecycle, and the `Particle` class handles individual particle behavior.

---

## Step 6: Multiple Emitters

The real power of encapsulating emitters into a class is that you can create multiple emitters easily. Let us create emitters wherever the user clicks.

```js
let emitters = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(20);

  for (let emitter of emitters) {
    emitter.emit(2);
    emitter.update();
    emitter.display();
  }
}

function mousePressed() {
  // Create a new emitter at the mouse position
  emitters.push(new Emitter(mouseX, mouseY));
}

class Emitter {
  constructor(x, y) {
    this.origin = createVector(x, y);
    this.particles = [];
  }

  emit(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.origin.x, this.origin.y));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let particle of this.particles) {
      particle.display();
    }
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-3, -0.5));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;
    this.color = color(
      random(150, 255),
      random(50, 255),
      random(50, 255)
    );
    this.size = random(4, 14);
  }

  update() {
    let gravity = createVector(0, 0.06);
    this.applyForce(gravity);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 2;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();
    let alpha = this.lifespan;
    let currentSize = map(this.lifespan, 255, 0, this.size, 0);
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    fill(r, g, b, alpha);
    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

Click on different spots on the canvas. Each click creates a new emitter at that location, producing a fountain of colorful particles. The particles have random colors now (not just warm tones), so each emitter produces its own colorful spray.

---

## Step 7: Adding Wind as an External Force

One of the advantages of the `applyForce()` pattern is that you can add new forces without changing the particle code. Let us add wind that blows particles to the right when the mouse is pressed.

```js
let emitter;

function setup() {
  createCanvas(600, 400);
  emitter = new Emitter(width / 2, height - 50);
}

function draw() {
  background(20);

  // Apply wind when mouse is pressed
  if (mouseIsPressed) {
    let wind = createVector(0.1, 0);
    emitter.applyForce(wind);
  }

  emitter.emit(3);
  emitter.update();
  emitter.display();

  // Display instructions
  fill(255);
  noStroke();
  textSize(14);
  text("Hold mouse button for wind", 10, 20);
}

class Emitter {
  constructor(x, y) {
    this.origin = createVector(x, y);
    this.particles = [];
  }

  emit(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.origin.x, this.origin.y));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let particle of this.particles) {
      particle.display();
    }
  }

  applyForce(force) {
    for (let particle of this.particles) {
      particle.applyForce(force);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    // Emit upward with some horizontal spread
    this.velocity = createVector(random(-1.5, 1.5), random(-4, -1));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;
    this.color = color(
      random(200, 255),
      random(100, 200),
      random(0, 80)
    );
    this.size = random(6, 14);
  }

  update() {
    // Gravity always pulls down
    let gravity = createVector(0, 0.05);
    this.applyForce(gravity);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 2;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();
    let alpha = this.lifespan;
    let currentSize = map(this.lifespan, 255, 0, this.size, 0);
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    fill(r, g, b, alpha);
    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

The emitter is now at the bottom of the canvas, shooting particles upward like a flame. When you hold the mouse button, wind pushes all particles to the right, bending the flame.

---

## Step 8: Complete Particle System with Blending

For a final polished version, let us use additive blending to create a glowing effect. When bright particles overlap, their colors add together, creating brighter spots -- this is how real light behaves.

```js
let emitters = [];

function setup() {
  createCanvas(800, 500);
  // Create three emitters at different positions
  emitters.push(new Emitter(200, height - 30, [255, 100, 30]));   // Orange fire
  emitters.push(new Emitter(400, height - 30, [30, 150, 255]));   // Blue fire
  emitters.push(new Emitter(600, height - 30, [100, 255, 80]));   // Green fire
}

function draw() {
  background(10);
  blendMode(ADD); // Additive blending for glow effect

  for (let emitter of emitters) {
    emitter.emit(4);
    emitter.update();
    emitter.display();
  }

  blendMode(BLEND); // Reset to normal blending for text
  fill(255);
  noStroke();
  textSize(14);
  text("Three emitters with additive blending", 10, 20);
}

class Emitter {
  constructor(x, y, baseColor) {
    this.origin = createVector(x, y);
    this.particles = [];
    this.baseColor = baseColor; // [r, g, b] array
  }

  emit(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(
        new Particle(this.origin.x, this.origin.y, this.baseColor)
      );
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let particle of this.particles) {
      particle.display();
    }
  }
}

class Particle {
  constructor(x, y, baseColor) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1.5, 1.5), random(-5, -1));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255;
    this.size = random(8, 20);

    // Vary the base color slightly for each particle
    this.r = baseColor[0] + random(-30, 30);
    this.g = baseColor[1] + random(-30, 30);
    this.b = baseColor[2] + random(-20, 20);
  }

  update() {
    let gravity = createVector(0, 0.03);
    this.applyForce(gravity);

    // Add a tiny random force for organic movement
    let jitter = createVector(random(-0.05, 0.05), random(-0.02, 0.02));
    this.applyForce(jitter);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 2.5;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  display() {
    noStroke();
    let alpha = map(this.lifespan, 255, 0, 100, 0);
    let currentSize = map(this.lifespan, 255, 0, this.size, this.size * 0.3);

    fill(this.r, this.g, this.b, alpha);
    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

This version creates three fire-like emitters with different colors. Additive blending means that where particles overlap, the colors combine and become brighter, creating a convincing glow effect. The particles also have a small random "jitter" force applied each frame, giving them a more organic, flame-like movement.

---

## Summary

In this tutorial you learned:

1. **A particle is a simple physics object** with position, velocity, acceleration, and lifespan.
2. **Forces are accumulated** into acceleration each frame, then applied through Euler integration: acceleration changes velocity, velocity changes position.
3. **Acceleration must be reset** each frame so that forces do not accumulate across frames.
4. **Lifespan** controls both the visual appearance (alpha fading, size changes) and when to remove the particle.
5. **Iterate backward** when removing elements from an array during iteration.
6. **An Emitter class** encapsulates spawning, updating, and removing particles.
7. **Multiple emitters** can be created and managed independently.
8. **External forces** (wind, gravity) can be applied to all particles through the emitter.

---

## Exercises

1. **Explosion**: Instead of a continuous stream, create a one-time burst of 200 particles at a click location, all with high initial velocities pointing outward in all directions. Hint: use `p5.Vector.random2D()` to get a random direction, then multiply by a random speed.

2. **Confetti**: Make rectangular particles instead of circles. Give each particle a random rotation that changes over time. Use `push()`, `translate()`, `rotate()`, and `pop()` to draw rotated rectangles.

3. **Repulsion**: Add a force that pushes particles away from the mouse cursor. Calculate the direction from the mouse to each particle, and apply a force in that direction whose strength decreases with distance.

4. **Particle trails**: Instead of drawing a single circle per particle, store the last 10 positions and draw a fading line connecting them. This creates a trail effect.

5. **Size-dependent mass**: Modify the `applyForce()` method so that larger particles are affected less by forces (simulating heavier mass). Divide the force by the particle's size before adding it to acceleration.
