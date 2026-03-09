# Textbook Chapter: Simulation -- From Particles to Agents

## MAT 200C: Computing Arts -- Week 5, February 3

---

## 1. Introduction: What Is Simulation?

Imagine you are standing on a bridge, watching leaves fall from a tree into a river below. Each leaf follows a slightly different path. Some tumble end-over-end. Others glide smoothly before catching a gust of wind. A few land in the water and are carried downstream, spinning in eddies.

You could paint this scene -- freezing one moment in time. Or you could build a **simulation** -- a set of rules that, when run, produces an infinite number of such moments, each one unique, each one plausible.

A simulation is a computational model that evolves over time. You define the rules that govern behavior, set initial conditions, press play, and watch the system unfold. The result is not a single image but a living, breathing system that can surprise even its creator.

In this chapter, we will build two kinds of simulations:

1. **Particle systems** -- collections of simple objects subject to physical forces, used for effects like fire, smoke, and sparks.
2. **Agent systems** -- collections of autonomous objects that perceive their neighbors and make decisions, used for flocking, swarming, and artificial life.

Both systems share a common foundation in physics, so we will start there.

---

## 2. The Physics of Motion

### 2.1 Vectors

Everything in a 2D simulation starts with **vectors**. A vector is a quantity with both **magnitude** (size) and **direction**. In p5.js, we create vectors with `createVector(x, y)`.

- **Position** is a vector: "the object is at (200, 150)"
- **Velocity** is a vector: "the object is moving 3 pixels right and 2 pixels down per frame"
- **Acceleration** is a vector: "the object's velocity is increasing by 0.1 pixels per frame downward"

```js
let position = createVector(200, 150);
let velocity = createVector(3, -2);
let acceleration = createVector(0, 0.1);
```

Vectors support arithmetic:

```js
// Adding vectors
position.add(velocity);    // Move the object by its velocity

// Scaling vectors
let force = createVector(1, 0);
force.mult(0.5);           // Halve the force

// Getting magnitude (length)
let speed = velocity.mag(); // How fast are we going?

// Normalizing (making length 1, keeping direction)
let direction = velocity.copy().normalize(); // Unit vector in direction of motion
```

### 2.2 Newton's Second Law: F = ma

Isaac Newton's second law of motion says:

**Force = Mass x Acceleration**

Rearranged for our purposes:

**Acceleration = Force / Mass**

In a simulation, this means:

1. We know the forces acting on an object (gravity, wind, springs, etc.).
2. We divide the total force by the object's mass to get its acceleration.
3. We use the acceleration to update the velocity.
4. We use the velocity to update the position.

For simplicity, we often assume mass = 1, which means `acceleration = force`. Here is the basic pattern in code:

```js
class Mover {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 1;
  }

  applyForce(force) {
    // F = ma, so a = F/m
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    // Velocity changes by acceleration
    this.velocity.add(this.acceleration);
    // Position changes by velocity
    this.position.add(this.velocity);
    // Reset acceleration (forces must be re-applied each frame)
    this.acceleration.mult(0);
  }

  display() {
    circle(this.position.x, this.position.y, this.mass * 16);
  }
}
```

**Line-by-line explanation of `applyForce()`:**

- `let f = p5.Vector.div(force, this.mass);` -- We divide the force by mass to get the contribution to acceleration. We use `p5.Vector.div()` (the static version) to create a new vector rather than modifying the original force vector. This is important because the same force vector might be applied to multiple objects.
- `this.acceleration.add(f);` -- We add this contribution to the accumulated acceleration. Multiple forces can be applied per frame, and they all add up.

**Line-by-line explanation of `update()`:**

- `this.velocity.add(this.acceleration);` -- Acceleration changes velocity. If acceleration is (0, 0.1), then each frame the vertical velocity increases by 0.1, simulating constant downward acceleration (gravity).
- `this.position.add(this.velocity);` -- Velocity changes position. If velocity is (3, 2), then each frame the object moves 3 pixels right and 2 pixels down.
- `this.acceleration.mult(0);` -- We reset acceleration to zero. This is critical. Forces in our simulation model are re-applied every frame. If we did not reset, the acceleration from previous frames would persist and grow without bound.

### 2.3 Gravity

Gravity is the simplest force: a constant downward pull.

```js
let gravity = createVector(0, 0.1);
mover.applyForce(gravity);
```

In reality, gravitational force depends on mass (F = mg, where g is the gravitational acceleration constant). If we want heavier objects to fall at the same rate as lighter ones (as they do in real life, ignoring air resistance), we should apply gravity as:

```js
let gravity = createVector(0, 0.1 * mover.mass);
mover.applyForce(gravity);
// Inside applyForce, we divide by mass, so the mass cancels out
```

This ensures that `applyForce` divides by mass, canceling the multiplication, and all objects accelerate at the same rate regardless of mass.

---

## 3. Building a Particle System

### 3.1 What Is a Particle?

A particle is a simple physics object with a limited lifespan. Unlike a permanent object in a simulation, a particle is born, lives briefly, and dies. This cycle of birth and death is what gives particle systems their dynamic quality.

A particle needs:

- **Position, velocity, acceleration** -- for physics
- **Lifespan** -- a timer that counts down from some maximum to zero
- **Visual properties** -- color, size, transparency (often tied to lifespan)

### 3.2 The Particle Class

```js
class Particle {
  constructor(x, y) {
    // Physics state
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-3, 0));
    this.acceleration = createVector(0, 0);

    // Lifespan: starts at 255, counts down to 0
    this.lifespan = 255.0;

    // Visual properties
    this.size = random(4, 12);
    this.col = color(random(200, 255), random(80, 180), random(0, 60));
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 2.0;
  }

  display() {
    noStroke();
    let alpha = this.lifespan;
    let currentSize = map(this.lifespan, 255, 0, this.size, 0);
    fill(red(this.col), green(this.col), blue(this.col), alpha);
    circle(this.position.x, this.position.y, currentSize);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

**Line-by-line explanation of the constructor:**

- `this.position = createVector(x, y);` -- The particle starts at the given position (typically the emitter location).
- `this.velocity = createVector(random(-1, 1), random(-3, 0));` -- Random initial velocity with slight horizontal spread and upward motion. The randomness ensures particles don't all go in exactly the same direction.
- `this.acceleration = createVector(0, 0);` -- Starts with no acceleration. Forces will be applied each frame.
- `this.lifespan = 255.0;` -- We use 255 because it conveniently maps to the alpha channel (0-255 in p5.js). When lifespan is 255, the particle is fully opaque. When it reaches 0, the particle is fully transparent.
- `this.size = random(4, 12);` -- Random size for visual variety.
- `this.col = color(random(200, 255), random(80, 180), random(0, 60));` -- Random warm color. High red, medium green, low blue gives oranges and yellows.

**Line-by-line explanation of `display()`:**

- `let alpha = this.lifespan;` -- Use the lifespan directly as the alpha (transparency) value. As the particle ages, it fades.
- `let currentSize = map(this.lifespan, 255, 0, this.size, 0);` -- Map lifespan to size. When lifespan is 255 (new), size is at maximum. When lifespan is 0 (dead), size is 0. The particle shrinks as it ages.
- `fill(red(this.col), green(this.col), blue(this.col), alpha);` -- Apply the particle's color with the computed alpha.

### 3.3 The Emitter Class

An emitter manages a collection of particles: creating them, updating them, and removing dead ones.

```js
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

  applyForce(force) {
    for (let p of this.particles) {
      p.applyForce(force);
    }
  }

  update() {
    // Iterate backward so we can safely remove elements
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let p of this.particles) {
      p.display();
    }
  }
}
```

**Why iterate backward?** When we call `this.particles.splice(i, 1)` to remove a dead particle, all elements after index `i` shift down by one. If we were iterating forward, the next element would be skipped because it moved into the slot we just processed. Iterating backward avoids this: removing element `i` only affects indices greater than `i`, which we have already processed.

### 3.4 Putting It Together

```js
let emitter;

function setup() {
  createCanvas(600, 400);
  emitter = new Emitter(width / 2, height - 40);
}

function draw() {
  background(20);

  // Apply gravity to all particles
  let gravity = createVector(0, 0.05);
  emitter.applyForce(gravity);

  // Emit 3 new particles per frame
  emitter.emit(3);

  // Update physics and remove dead particles
  emitter.update();

  // Draw all particles
  emitter.display();
}
```

This creates a fountain of warm-colored particles rising from the bottom center of the canvas, subject to gravity, fading and shrinking as they age.

### 3.5 Multiple Emitters

Because we encapsulated the logic in classes, creating multiple emitters is straightforward:

```js
let emitters = [];

function setup() {
  createCanvas(600, 400);
  emitters.push(new Emitter(150, height - 40));
  emitters.push(new Emitter(300, height - 40));
  emitters.push(new Emitter(450, height - 40));
}

function draw() {
  background(20);

  let gravity = createVector(0, 0.05);

  for (let emitter of emitters) {
    emitter.applyForce(gravity);
    emitter.emit(2);
    emitter.update();
    emitter.display();
  }
}
```

---

## 4. From Particles to Agents

### 4.1 The Key Difference

A particle is **passive**: it has no awareness of its surroundings. It simply responds to external forces. It is a leaf in the wind.

An agent is **active**: it perceives its local environment and makes decisions about how to move. It is a bird in a flock.

Both use the same underlying physics (position, velocity, acceleration, forces), but agents add a layer of **behavior** on top.

### 4.2 Autonomous Agents

Craig Reynolds (who created Boids) described the defining characteristics of an autonomous agent:

1. **It exists in an environment** -- it has a position and can move.
2. **It has limited perception** -- it can detect nearby neighbors and environmental features, but it does not have a god's-eye view of the entire world.
3. **It has no leader** -- there is no central controller telling each agent what to do. Each agent acts independently based on its local perception.
4. **It has desires (goals)** -- encoded as behavioral rules like "stay near the group" or "avoid predators."

The combination of autonomy and local perception is what makes agent systems produce emergent behavior. No one designs the flocking pattern. It emerges.

---

## 5. Implementing Boids

### 5.1 The Boid Class

A boid is an agent with position, velocity, acceleration, and three behavioral rules.

```js
class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }
```

**Line-by-line explanation:**

- `this.velocity = p5.Vector.random2D();` -- Creates a unit vector pointing in a random direction. This means each boid starts flying in a random direction.
- `this.velocity.setMag(random(2, 4));` -- Sets the magnitude (speed) to a random value between 2 and 4 pixels per frame.
- `this.maxForce = 0.2;` -- The maximum steering force. This limits how quickly a boid can turn. Lower values make smoother, more gradual turns. Higher values make sharper, more responsive turns.
- `this.maxSpeed = 4;` -- The maximum speed. Boids cannot go faster than this.

### 5.2 Steering: Desired Minus Velocity

Reynolds' steering model is elegantly simple:

**steering force = desired velocity - current velocity**

Think of it like driving a car. Your "desired velocity" is the direction you want to go. Your "current velocity" is the direction you are going. The "steering force" is how much you need to turn the wheel to get from where you're heading to where you want to head.

In code:

```js
// The general pattern for computing a steering force:
let desired = /* some target direction at maxSpeed */;
let steering = p5.Vector.sub(desired, this.velocity);
steering.limit(this.maxForce);
```

### 5.3 Rule 1: Separation

Separation prevents boids from crowding each other. Each boid looks at all neighbors within a perception radius and computes a force pointing away from them.

```js
  separation(boids) {
    let perceptionRadius = 50;  // How far can this boid see?
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x, this.position.y,
        other.position.x, other.position.y
      );

      if (other !== this && d < perceptionRadius) {
        // Create a vector pointing AWAY from the neighbor
        let diff = p5.Vector.sub(this.position, other.position);
        // Weight by inverse square of distance: closer = stronger push
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);          // Average
      steering.setMag(this.maxSpeed); // Scale to max speed (desired velocity)
      steering.sub(this.velocity);   // Steering = desired - current
      steering.limit(this.maxForce); // Limit the force
    }

    return steering;
  }
```

**Line-by-line explanation:**

- `if (other !== this && d < perceptionRadius)` -- We skip ourselves and only consider boids within the perception radius.
- `let diff = p5.Vector.sub(this.position, other.position);` -- A vector pointing from `other` toward `this`. This is the "away" direction.
- `diff.div(d * d);` -- Divide by the distance squared. This makes the repulsion much stronger for very close boids. A boid 5 pixels away pushes 100 times harder than a boid 50 pixels away (because 50^2 / 5^2 = 100).
- `steering.div(total);` -- Average all the "away" vectors.
- `steering.setMag(this.maxSpeed);` -- The desired velocity: move away from neighbors at maximum speed.
- `steering.sub(this.velocity);` -- Steering = desired - current.
- `steering.limit(this.maxForce);` -- Cap the force so the boid turns gradually.

### 5.4 Rule 2: Alignment

Alignment makes boids fly in the same direction as their neighbors.

```js
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
      steering.div(total);          // Average velocity of neighbors
      steering.setMag(this.maxSpeed); // Desired velocity in that direction
      steering.sub(this.velocity);   // Steering = desired - current
      steering.limit(this.maxForce);
    }

    return steering;
  }
```

This is simpler than separation. We average the velocities of all neighbors, then apply Reynolds' steering formula.

### 5.5 Rule 3: Cohesion

Cohesion steers boids toward the center of their local group.

```js
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
      steering.div(total);          // Average position of neighbors
      steering.sub(this.position);   // Vector from me to that average position
      steering.setMag(this.maxSpeed); // Desired velocity toward group center
      steering.sub(this.velocity);   // Steering = desired - current
      steering.limit(this.maxForce);
    }

    return steering;
  }
```

The extra step here is `steering.sub(this.position)` -- after computing the average position, we need a vector pointing from our position toward that average. This becomes the desired direction of travel.

### 5.6 Combining the Rules

```js
  flock(boids) {
    let sep = this.separation(boids);
    let ali = this.alignment(boids);
    let coh = this.cohesion(boids);

    // Weight the forces
    sep.mult(1.5);  // Separation slightly stronger
    ali.mult(1.0);
    coh.mult(1.0);

    // Apply all forces
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }
```

The weights control the relative importance of each rule. Changing these weights dramatically changes the flock's behavior:

- **High separation, low cohesion**: Boids spread out and avoid each other.
- **Low separation, high cohesion**: Boids collapse into a tight cluster.
- **High alignment**: Boids move in long parallel streams.
- **Balanced**: The classic flocking behavior.

### 5.7 Complete Boids Program

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
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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

---

## 6. Comparing Particle Systems and Agent Systems

| Aspect | Particle System | Agent System (Boids) |
|---|---|---|
| **Update loop** | Apply forces, integrate, die | Perceive neighbors, compute steering, integrate |
| **Awareness** | None | Local (perception radius) |
| **Lifespan** | Finite (particles die) | Infinite (agents persist) |
| **Interaction** | Independent | Mutual influence |
| **Emergence** | Visual (fire, smoke from many dots) | Behavioral (flocking from three rules) |
| **Typical count** | Hundreds to thousands | Tens to hundreds |
| **Interesting because** | Collective visual impression | Collective behavioral patterns |

Both systems share the same core physics loop: accumulate forces, update velocity, update position, reset acceleration. The difference lies in *where the forces come from*: externally applied (particle system) vs. self-generated from perception (agent system).

---

## 7. Beyond Boids: Other Agent Behaviors

### 7.1 Braitenberg Vehicles

Braitenberg vehicles are perhaps the simplest possible agents. They have sensors and motors. The wiring between sensors and motors determines behavior.

You can simulate a simple Braitenberg vehicle in p5.js by:

1. Giving the vehicle two "sensor" positions (left front and right front).
2. Computing the distance from each sensor to a light source.
3. Setting each motor's speed based on sensor readings.

```js
class BraitenbergVehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.angle = random(TWO_PI);
    this.speed = 2;
    this.sensorOffset = 15; // How far apart the sensors are
  }

  update(lightX, lightY) {
    // Compute sensor positions
    let leftSensorX = this.position.x + cos(this.angle - 0.3) * this.sensorOffset;
    let leftSensorY = this.position.y + sin(this.angle - 0.3) * this.sensorOffset;
    let rightSensorX = this.position.x + cos(this.angle + 0.3) * this.sensorOffset;
    let rightSensorY = this.position.y + sin(this.angle + 0.3) * this.sensorOffset;

    // Distance from each sensor to the light
    let leftDist = dist(leftSensorX, leftSensorY, lightX, lightY);
    let rightDist = dist(rightSensorX, rightSensorY, lightX, lightY);

    // Convert distance to activation (closer = stronger)
    let leftActivation = 100 / (leftDist + 1);
    let rightActivation = 100 / (rightDist + 1);

    // CROSSED wiring (Vehicle 2b - "Aggressive"):
    // Left sensor drives RIGHT motor, right sensor drives LEFT motor
    // This makes the vehicle turn TOWARD the light
    let leftMotor = rightActivation;
    let rightMotor = leftActivation;

    // Differential steering: difference in motor speeds causes turning
    let turnRate = (rightMotor - leftMotor) * 0.1;
    this.angle += turnRate;

    // Average speed
    let avgSpeed = (leftMotor + rightMotor) * 0.5;
    avgSpeed = constrain(avgSpeed, 0.5, 4);

    // Move forward
    this.position.x += cos(this.angle) * avgSpeed;
    this.position.y += sin(this.angle) * avgSpeed;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.angle);
    fill(150, 200, 150);
    noStroke();
    // Body
    ellipse(0, 0, 30, 20);
    // "Eyes" (sensors)
    fill(255, 50, 50);
    circle(-5, -8, 6);
    circle(-5, 8, 6);
    pop();
  }
}
```

To make a "fearful" vehicle (Vehicle 2a) instead, use direct wiring: left sensor drives left motor, right sensor drives right motor. This makes the vehicle turn **away** from the light.

### 7.2 Artificial Life: Conceptual Overview

Agent systems are the foundation of **artificial life** research. By giving agents rules for eating, reproducing, and dying, you can create simulated ecosystems:

- **Predator-prey dynamics**: Agents that eat other agents, with reproduction and death.
- **Evolutionary systems**: Agents whose behaviors are encoded in genomes that mutate and cross over during reproduction (as in Karl Sims' virtual creatures).
- **Cellular automata**: Grid-based systems where each cell's state depends on its neighbors (Conway's Game of Life, Lenia).

These systems demonstrate that life-like properties -- adaptation, self-organization, reproduction, evolution -- can emerge from surprisingly simple rules.

---

## 8. Exercises

### Beginner

1. **Particle color shift**: Modify the particle system so that particles shift from yellow (when born) to red (when dying). Hint: use `lerpColor()` or manually interpolate the RGB values based on lifespan.

2. **Boid perception radius**: Change the perception radius in the Boids program from 50 to 150. How does this change the behavior? Try very small values (10) and very large values (300). Write a sentence or two describing what you observe for each.

3. **Particle gravity slider**: Add a slider to the particle system that controls the strength of gravity. What happens at zero gravity? What about negative gravity (upward force)?

### Intermediate

4. **Attraction to mouse**: Add a fourth rule to the Boids system: boids are attracted toward the mouse cursor. Compute a steering force that points from each boid toward `(mouseX, mouseY)`. Weight it with a slider. How does this change the flock's behavior?

5. **Fountain shapes**: Create a particle emitter that spawns particles in a ring pattern (initial velocity pointing outward in all directions) instead of a fountain pattern. Use `p5.Vector.random2D()` for the initial velocity direction.

6. **Braitenberg vehicles**: Implement both Vehicle 2a (direct wiring / fear) and Vehicle 2b (crossed wiring / aggression) with multiple light sources. Place 5 vehicles and 3 light sources on the canvas. Color the fearful vehicles blue and the aggressive vehicles red.

### Advanced

7. **Ecosystem**: Combine particles and agents. Create "food" particles that drift slowly around the canvas. Create agent boids that flock but also steer toward the nearest food particle. When an agent reaches food, the food is consumed (removed) and a new food particle spawns at a random location. Track how long it takes for all food to be consumed.

8. **Boids with trails**: Render each boid with a trail showing its last 20 positions. Use decreasing alpha along the trail so it fades. How does this change your perception of the flocking behavior?

---

## 9. Key Takeaways

1. **Simulation = rules + time.** You define how objects behave, set initial conditions, and let the system run.

2. **The core physics loop** is: accumulate forces, compute acceleration, update velocity, update position, reset acceleration.

3. **Particle systems** are collections of many short-lived, independent objects. They create visual richness through quantity and randomness.

4. **Agent systems** are collections of autonomous objects that perceive their neighbors. They create behavioral richness through simple rules and emergence.

5. **Boids' three rules** (separation, alignment, cohesion) produce realistic flocking from local information alone.

6. **Reynolds' steering model**: `steering = desired velocity - current velocity`. This simple formula is the engine behind all agent behaviors.

7. **Emergence** is the central idea: complex global behavior from simple local rules. No designer necessary.

---

## 10. Further Reading

- William Reeves, "Particle Systems -- A Technique for Modeling a Class of Fuzzy Objects" (1983)
- Craig Reynolds, "Flocks, Herds, and Schools: A Distributed Behavioral Model" (1987)
- Daniel Shiffman, *The Nature of Code* (free online at [https://natureofcode.com](https://natureofcode.com))
- Valentino Braitenberg, *Vehicles: Experiments in Synthetic Psychology* (1984)
- Bert Wang-Chak Chan, "Lenia: Biology of Artificial Life" (2019)
- Karl Sims, "Evolving Virtual Creatures" (1994 SIGGRAPH paper and video)
