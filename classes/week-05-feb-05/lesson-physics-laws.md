# Lesson: Physics Laws for Simulation

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Introduction

This lesson explains the physics laws you will use in simulation. For each law, you will see:

1. **What it describes** in plain language
2. **The mathematical formula**
3. **A visual intuition**
4. **JavaScript pseudocode** showing how to implement it

No physics background is assumed. If you have taken physics courses, this will be a quick refresher with a coding focus.

---

## Newton's Three Laws of Motion

Isaac Newton published his three laws of motion in 1687. They are the foundation of almost all simulation in computing arts.

### First Law: Inertia

**Plain language:** An object keeps doing what it is doing unless a force acts on it. If it is sitting still, it stays still. If it is moving, it keeps moving at the same speed in the same direction.

**Why this matters for simulation:** Objects in your simulation will not slow down on their own. If you set a velocity and never apply any forces, the object will glide forever. If you want objects to slow down, you must explicitly apply a friction or drag force.

**In code:**

```js
// Without any forces, this just moves in a straight line forever:
position.add(velocity);
// Velocity never changes because acceleration is zero
```

### Second Law: F = ma

**Plain language:** The acceleration of an object is proportional to the force applied to it and inversely proportional to its mass. More force means more acceleration. More mass means less acceleration.

**The formula:**

```
F = m * a

Rearranged for simulation:
a = F / m
```

**Visual intuition:** Imagine pushing a shopping cart vs. pushing a truck with the same force. The shopping cart (low mass) accelerates quickly. The truck (high mass) barely moves. Same force, different masses, different accelerations.

**In code:**

```js
applyForce(force) {
  // a = F / m
  let acceleration = p5.Vector.div(force, this.mass);
  this.acceleration.add(acceleration);
}
```

**Why we accumulate forces:** Multiple forces can act on an object simultaneously -- gravity pulling down, a spring pulling sideways, drag pushing backward. We add all their contributions to acceleration, then update velocity and position once per frame.

### Third Law: Action and Reaction

**Plain language:** For every force, there is an equal and opposite force. If you push a wall, the wall pushes back on you with the same force. If Earth pulls you down with gravity, you pull Earth up with the same force (but Earth is so massive it barely accelerates).

**Why this matters for simulation:** When simulating interactions between objects (collisions, springs connecting two objects, gravitational attraction between planets), the force on object A from object B is equal and opposite to the force on object B from object A.

**In code:**

```js
// If object A pushes object B with force F:
let force = computeForce(a, b);
b.applyForce(force);

// Then object B pushes object A with -F:
let reaction = p5.Vector.mult(force, -1);
a.applyForce(reaction);
```

---

## Hooke's Law: Springs (F = -kx)

### Plain Language

A spring resists being stretched or compressed. The more you stretch it, the harder it pulls back. The more you compress it, the harder it pushes back. The force is always directed toward the spring's natural (rest) length.

### The Formula

```
F = -k * x
```

- `k` is the **spring constant** (stiffness). A rubber band has a small k; a car spring has a large k.
- `x` is the **displacement** -- how far the spring is from its rest length. Positive x means stretched; negative means compressed.
- The negative sign means the force opposes the displacement: stretched springs pull, compressed springs push.

### Visual Intuition

```
Rest state:      [anchor]---spring---[ball]     (no force)

Stretched:       [anchor]------spring------[ball]
                            <--- force (pulling back)

Compressed:      [anchor]-sp-[ball]
                           force --->  (pushing out)
```

The farther from rest, the stronger the force. Double the stretch, double the force. This is why springs oscillate: they overshoot the rest position, get pulled back, overshoot the other way, and so on.

### In Code

```js
function springForce(anchorPos, bobPos, restLength, k) {
  // Vector from anchor to bob
  let direction = p5.Vector.sub(bobPos, anchorPos);

  // Current length
  let currentLength = direction.mag();

  // Displacement from rest length
  let x = currentLength - restLength;

  // Normalize direction and scale by -k * x
  direction.normalize();
  direction.mult(-k * x);

  return direction;
  // This force should be applied to the bob.
  // The opposite force (-direction) should be applied to the anchor
  // (if the anchor is free to move).
}
```

---

## Coulomb's Law: Electric Charge (F = kq1q2/r^2)

### Plain Language

Electrically charged objects push or pull on each other. Like charges (both positive or both negative) repel. Opposite charges (one positive, one negative) attract. The force gets weaker with distance -- specifically, it follows an **inverse square law**, meaning if you double the distance, the force drops to one quarter.

### The Formula

```
F = k * q1 * q2 / r^2
```

- `k` is Coulomb's constant (we use an arbitrary value in simulations)
- `q1` and `q2` are the charges of the two objects
- `r` is the distance between them
- If `q1 * q2` is positive (same sign), the force is repulsive
- If `q1 * q2` is negative (opposite signs), the force is attractive

### Visual Intuition

```
Same charges (repel):
  (+)  <------>  (+)     Push apart

Opposite charges (attract):
  (+)  ------->  (-)     Pull together
       <-------

Far apart:   weak force
Close:       strong force (quadratically stronger)
```

### In Code

```js
function coulombForce(bodyA, bodyB) {
  // Direction from B to A
  let force = p5.Vector.sub(bodyA.position, bodyB.position);
  let distance = force.mag();

  // Clamp distance to prevent infinite forces
  distance = max(distance, 10);

  // F = k * q1 * q2 / r^2
  let k = 500; // Arbitrary constant for our simulation
  let strength = k * bodyA.charge * bodyB.charge / (distance * distance);

  // Set the force magnitude (direction is already from B to A)
  force.setMag(strength);

  return force;
  // Apply this force to bodyA.
  // Apply the opposite force to bodyB (Newton's third law).
}
```

**Important:** Always clamp the minimum distance to prevent division by zero or extremely large forces when objects are very close. In the real world, objects cannot overlap. In simulations, they can, and the math breaks down if you let distance approach zero.

---

## Newton's Law of Universal Gravitation (F = Gm1m2/r^2)

### Plain Language

Every object with mass attracts every other object with mass. The force is proportional to both masses and inversely proportional to the square of the distance. This is why planets orbit stars, why moons orbit planets, and why things fall when you drop them.

### The Formula

```
F = G * m1 * m2 / r^2
```

- `G` is the gravitational constant
- `m1` and `m2` are the masses of the two objects
- `r` is the distance between their centers
- The force is always **attractive** (always pulls, never pushes)

### Visual Intuition

```
  (m1)  <------>  (m2)     Always pull toward each other

  Heavier objects:  stronger pull
  Farther apart:    weaker pull (inverse square)
```

This formula is structurally identical to Coulomb's law, except:
- It uses masses instead of charges
- It is always attractive (gravity never repels)
- The constant G is incredibly small in real life (gravity is actually very weak -- you need planet-sized masses to feel it significantly)

### In Code

```js
function gravitationalForce(bodyA, bodyB) {
  // Direction from A to B (attractive: A is pulled toward B)
  let force = p5.Vector.sub(bodyB.position, bodyA.position);
  let distance = force.mag();

  distance = constrain(distance, 20, 1000);

  // F = G * m1 * m2 / r^2
  let G = 1.0; // Arbitrary for simulation
  let strength = G * bodyA.mass * bodyB.mass / (distance * distance);

  force.setMag(strength);

  return force;
  // Apply to bodyA (pulls A toward B).
  // Apply opposite to bodyB (pulls B toward A).
}
```

---

## Friction

### Plain Language

Friction is the force that resists sliding motion. When you push a box across a floor, friction pushes back. Friction always acts **opposite to the direction of motion** and has a roughly constant magnitude that depends on the surfaces and how hard they are pressed together.

### The Formula (Kinetic Friction)

```
F_friction = -mu * N * v_hat
```

- `mu` (Greek letter mu) is the **coefficient of friction**. Smooth ice has a low mu (~0.03). Rubber on concrete has a high mu (~0.7).
- `N` is the **normal force** -- how hard the surfaces are pressed together. On a flat surface, N equals the weight (m * g).
- `v_hat` is the **unit vector** in the direction of motion. The negative sign means friction opposes motion.

### Visual Intuition

```
Object moving right:   ---->
Friction force:        <----  (opposes motion)

Object moving left:    <----
Friction force:        ---->  (opposes motion)

Object stationary:     (no kinetic friction)
```

Friction does not depend on speed. Whether the box is sliding fast or slow, the friction force has the same magnitude (in the simple model). It only depends on the surfaces and the weight.

### In Code

```js
function frictionForce(body) {
  // Direction opposite to velocity
  let friction = body.velocity.copy();
  friction.normalize();
  friction.mult(-1);

  // Magnitude: mu * N (simplified: mu * mass * g)
  let mu = 0.1;
  let g = 0.2;
  let magnitude = mu * body.mass * g;
  friction.mult(magnitude);

  return friction;
}
```

---

## Drag (Air/Fluid Resistance)

### Plain Language

Drag is the resistance an object feels moving through air or water. Unlike friction, drag **increases with speed** -- specifically with the square of speed. This is why it is hard to run fast through water, and why a car uses much more fuel at highway speeds than city speeds.

### The Formula (Simplified)

```
F_drag = -c * |v|^2 * v_hat
```

- `c` is the **drag coefficient** (depends on the object's shape, size, and the fluid)
- `|v|^2` is the speed squared
- `v_hat` is the direction of motion (the negative sign means drag opposes motion)

### Visual Intuition

```
Moving slowly:    -->        Drag:  <     (small)
Moving fast:      ------>    Drag:  <<<<  (much larger)
Moving very fast: --------> Drag:  <<<<<<<<  (quadratically larger)
```

If you double your speed, drag quadruples. If you triple your speed, drag increases by 9 times.

### In Code

```js
function dragForce(body) {
  let speed = body.velocity.mag();

  // Direction opposite to velocity
  let drag = body.velocity.copy();
  drag.normalize();
  drag.mult(-1);

  // Magnitude: c * v^2
  let c = 0.01;
  let magnitude = c * speed * speed;
  drag.mult(magnitude);

  return drag;
}
```

---

## Comparing Friction and Drag

| Property | Friction | Drag |
|---|---|---|
| Depends on speed? | No (constant) | Yes (proportional to v^2) |
| Where it occurs | Surfaces in contact | Moving through fluid (air, water) |
| Direction | Opposite to motion | Opposite to motion |
| Effect at low speed | Same as high speed | Very small |
| Effect at high speed | Same as low speed | Very large |

In simulations, you can use either or both. Friction is simpler. Drag produces more realistic-looking motion because fast objects slow down dramatically while slow objects coast.

---

## The Simulation Pattern

Every force follows the same pattern:

1. **Compute the direction** the force should point.
2. **Compute the magnitude** from the relevant formula.
3. **Create a vector** with that direction and magnitude.
4. **Apply it** using `body.applyForce(force)`.

Multiple forces are simply added together (this is called **superposition**). Gravity pulls down, the spring pulls sideways, drag pushes opposite to motion -- they all add up, and the combined acceleration determines the object's trajectory.

```js
function draw() {
  // Apply all forces
  let gravity = createVector(0, body.mass * 0.2);
  body.applyForce(gravity);

  let spring = springForce(anchor, body.position, 100, 0.01);
  body.applyForce(spring);

  let drag = dragForce(body);
  body.applyForce(drag);

  // Update physics (velocity += acceleration, position += velocity)
  body.update();

  // Draw
  body.display();
}
```

---

## Laws of Thermodynamics (Brief Overview)

The laws of thermodynamics are less commonly simulated directly but are important conceptual background:

### First Law: Energy Is Conserved

Energy cannot be created or destroyed, only converted from one form to another. In simulation, this means:
- A bouncing ball converts kinetic energy (motion) to potential energy (height) and back.
- A perfectly elastic collision conserves total kinetic energy.
- In practice, our simulations often add or lose energy due to numerical integration errors, which is why Semi-Implicit Euler is better than Forward Euler (it approximately conserves energy).

### Second Law: Entropy Increases

In any natural process, the total entropy (disorder) of a closed system increases over time. Hot things cool down. Organized structures tend toward disorder. In simulation terms:
- Systems tend toward equilibrium (everything at the same temperature, same speed, evenly distributed).
- Friction and drag convert kinetic energy into heat (we simulate this as energy loss).
- It is easy to scatter particles; it is astronomically unlikely for scattered particles to spontaneously organize.

### Third Law: Absolute Zero

You cannot reach absolute zero temperature (the point where all motion stops). This is less relevant for artistic simulations but is worth knowing: heat and temperature are fundamentally about the motion of particles.

---

## Summary

| Law | Formula | What It Tells You |
|---|---|---|
| Newton's 2nd Law | F = ma | Force determines acceleration (divided by mass) |
| Hooke's Law | F = -kx | Springs pull back toward rest length |
| Coulomb's Law | F = kq1q2/r^2 | Charges attract or repel, weakening with distance |
| Gravitation | F = Gm1m2/r^2 | Masses attract, weakening with distance |
| Friction | F = -mu*N*v_hat | Constant force opposing motion |
| Drag | F = -c*v^2*v_hat | Speed-dependent force opposing motion |

All forces follow the same coding pattern: compute direction, compute magnitude, create a vector, apply it. Multiple forces are simply added together. Physics simulations are just force accumulators feeding into the integration loop.
