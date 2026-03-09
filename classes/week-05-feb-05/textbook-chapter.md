# Textbook Chapter: Forces, Calculus, and Simulation

## MAT 200C: Computing Arts -- Week 5, February 5

---

## 1. Introduction

In the previous chapter, we built particle systems and agent systems. We used forces like gravity and learned the basic simulation loop: accumulate forces, update velocity, update position. But we treated many things as black boxes.

In this chapter, we open every black box. We will:

- Understand exactly what derivatives and integrals are, and how they appear in simulation code
- Learn the physics laws that produce the most common forces: Newton's laws, Hooke's law, Coulomb's law, gravitational attraction, friction, and drag
- Understand why the order of operations matters in numerical integration
- Compare Forward Euler and Semi-Implicit Euler methods
- Implement complete ODE systems: the SIR epidemic model, the Lorenz attractor, and the Lotka-Volterra predator-prey model
- Use the webcam as input and apply effects with GLSL shaders

By the end of this chapter, you will have the theoretical foundation and practical skills to simulate almost any dynamical system.

---

## 2. Newton's Laws of Motion

### 2.1 The First Law: Inertia

An object at rest stays at rest. An object in motion stays in motion at constant velocity. Unless a force acts on it.

In simulation, this means: if you create an object with `velocity = createVector(3, 0)` and never apply any forces, it will move to the right at 3 pixels per frame forever. There is no built-in friction in a simulation. If you want objects to slow down, you must explicitly apply a drag or friction force.

### 2.2 The Second Law: F = ma

This is the most important equation in simulation. It says:

**Force = Mass x Acceleration**

Rearranged: **Acceleration = Force / Mass**

More force means more acceleration. More mass means less acceleration for the same force. This is why a tennis ball flies across the room when you throw it but a bowling ball barely moves with the same effort.

In code:

```js
applyForce(force) {
  // a = F / m
  // We divide force by mass to get the contribution to acceleration
  let f = p5.Vector.div(force, this.mass);
  this.acceleration.add(f);
}
```

**Line-by-line explanation:**
- `p5.Vector.div(force, this.mass)` -- Creates a new vector equal to `force / mass`. We use the static version `p5.Vector.div()` rather than `force.div()` so we do not modify the original force vector (it might be shared among multiple objects).
- `this.acceleration.add(f)` -- Adds this force's contribution to the total acceleration. Multiple forces can be applied per frame; they all add up (this is the principle of superposition).

### 2.3 The Third Law: Action and Reaction

Every force has an equal and opposite reaction. When the Earth pulls you down with gravity, you pull the Earth up with exactly the same force. When a spring pulls a ball to the right, the ball pulls the spring to the left.

In simulation, this means whenever you apply a force from object A to object B, you should apply the negative of that force from object B to object A:

```js
let force = computeInteraction(bodyA, bodyB);
bodyA.applyForce(force);
bodyB.applyForce(p5.Vector.mult(force, -1));
```

---

## 3. The Physics of Forces

### 3.1 Gravity Near Earth's Surface

Near Earth's surface, gravity is approximately constant:

**F_gravity = m * g** (downward)

where `g` is the gravitational acceleration (~9.8 m/s^2 in reality; much smaller in our pixel simulations).

```js
// Apply gravity to a body
let g = 0.2; // Gravitational acceleration in pixels/frame^2
let gravity = createVector(0, body.mass * g);
body.applyForce(gravity);
```

**Why multiply by mass?** Because `applyForce()` divides by mass. If we just used `createVector(0, g)`, then inside `applyForce`, we would compute `a = g / mass`, which means lighter objects would accelerate faster than heavier ones. In reality, all objects fall at the same rate (Galileo demonstrated this). By multiplying the force by mass, the mass cancels out in `applyForce`, and all objects experience the same acceleration `g` regardless of mass.

### 3.2 Hooke's Law: Springs

Robert Hooke discovered in 1660 that elastic materials obey a simple relationship:

**F = -k * x**

- `k` = spring constant (stiffness). Larger k = stiffer spring.
- `x` = displacement from rest length (how far the spring is stretched or compressed beyond its natural length).
- The negative sign = restoring force. The force always pushes/pulls back toward the rest length.

```js
function springForce(anchorPos, bobPos, restLength, k) {
  // Vector from anchor to bob
  let spring = p5.Vector.sub(bobPos, anchorPos);

  // Current distance between anchor and bob
  let currentLength = spring.mag();

  // How far from rest length (positive = stretched, negative = compressed)
  let displacement = currentLength - restLength;

  // Force direction: toward the anchor (restoring)
  // Normalize to get direction, then scale by -k * displacement
  spring.normalize();
  spring.mult(-1 * k * displacement);

  return spring;
}
```

**Line-by-line explanation:**
- `p5.Vector.sub(bobPos, anchorPos)` -- Vector pointing from anchor to bob.
- `spring.mag()` -- The current length of this vector = current spring length.
- `currentLength - restLength` -- How far the spring is from its natural length. Positive means stretched, negative means compressed.
- `spring.normalize()` -- Makes the vector have length 1, keeping its direction (from anchor to bob).
- `spring.mult(-1 * k * displacement)` -- Scales by `-k * x`. The negative sign means the force points opposite to the displacement: if the spring is stretched (positive displacement), the force pulls back (negative direction).

**Spring behavior:** Springs naturally oscillate. If you stretch a spring and release it, it pulls back past the rest length (overshoots), gets compressed, pushes back, and so on. Without damping, this oscillation continues forever (in a perfect simulation). Adding a small damping force (opposite to velocity) causes the oscillation to gradually die down.

### 3.3 Coulomb's Law: Electric Charges

**F = k * q1 * q2 / r^2**

- `k` = Coulomb's constant (we choose an arbitrary value)
- `q1`, `q2` = charges of the two objects
- `r` = distance between them
- Same-sign charges repel; opposite-sign charges attract

```js
function coulombForce(bodyA, bodyB) {
  let force = p5.Vector.sub(bodyA.position, bodyB.position);
  let distance = force.mag();
  distance = constrain(distance, 15, 500); // Prevent extreme forces

  let k = 500;
  let strength = (k * bodyA.charge * bodyB.charge) / (distance * distance);
  force.setMag(strength);

  return force; // Apply to bodyA; apply -force to bodyB
}
```

**The inverse square law:** Force drops off as the square of distance. At twice the distance, force is 1/4 as strong. At three times the distance, force is 1/9. This creates a short-range effect: nearby charges strongly influence each other, while distant charges barely interact.

### 3.4 Universal Gravitation

**F = G * m1 * m2 / r^2**

Identical structure to Coulomb's law, but:
- Uses masses instead of charges
- Always attractive (gravity never repels)
- The constant G is different

```js
function gravitationalForce(bodyA, bodyB) {
  let force = p5.Vector.sub(bodyB.position, bodyA.position); // Toward B (attractive)
  let distance = force.mag();
  distance = constrain(distance, 20, 500);

  let G = 0.5;
  let strength = (G * bodyA.mass * bodyB.mass) / (distance * distance);
  force.setMag(strength);

  return force; // Pulls bodyA toward bodyB
}
```

This is the force that governs orbital mechanics. With the right initial velocity, an object will orbit another rather than falling into it or flying away.

### 3.5 Friction

**F_friction = -mu * N * v_hat**

Friction opposes motion with a constant magnitude (it does not depend on speed).

```js
function frictionForce(body) {
  if (body.velocity.mag() < 0.01) return createVector(0, 0); // No friction if stationary

  let friction = body.velocity.copy();
  friction.normalize();
  friction.mult(-1); // Opposite to motion

  let mu = 0.1;
  let normalForce = body.mass * 0.2; // Weight on a flat surface
  friction.mult(mu * normalForce);

  return friction;
}
```

### 3.6 Drag

**F_drag = -c * |v|^2 * v_hat**

Drag opposes motion with a force proportional to speed squared.

```js
function dragForce(body, coefficient) {
  let speed = body.velocity.mag();
  if (speed < 0.01) return createVector(0, 0);

  let drag = body.velocity.copy();
  drag.normalize();
  drag.mult(-1);
  drag.mult(coefficient * speed * speed);

  return drag;
}
```

**Friction vs. drag:** Friction is constant regardless of speed. Drag grows with the square of speed. A slow object barely feels drag but fully feels friction. A fast object strongly feels drag but the constant friction is negligible by comparison.

---

## 4. Calculus for Simulation

### 4.1 Derivatives: Rates of Change

A **derivative** measures how fast something is changing. In physics:

- **Velocity = derivative of position** (how fast position is changing)
- **Acceleration = derivative of velocity** (how fast velocity is changing)

In code, the derivative at a given frame is approximately the difference between consecutive values:

```js
// Approximate derivative (we don't usually need to compute this explicitly)
let approximateVelocity = p5.Vector.sub(currentPosition, previousPosition);
```

But we rarely compute derivatives this way in simulation. Instead, we know the derivatives (forces tell us acceleration, which is the derivative of velocity) and use them to update the system.

### 4.2 Integrals: Accumulation

An **integral** accumulates a quantity over time. In code, integration happens every frame:

```js
// These two lines ARE numerical integration:
this.velocity.add(this.acceleration);   // Integrate acceleration -> velocity
this.position.add(this.velocity);       // Integrate velocity -> position
```

Each frame, we add a small amount (one frame's worth of acceleration or velocity) to the running total. Over many frames, these small additions accumulate into the total change.

### 4.3 The Position-Velocity-Acceleration Chain

```
Forces  --(F=ma)-->  Acceleration  --(integrate)-->  Velocity  --(integrate)-->  Position
```

This is the complete chain. Forces determine acceleration. Integrating acceleration gives velocity. Integrating velocity gives position. This chain is the heart of every physics simulation.

### 4.4 Discrete Time

In real physics, time flows continuously. In a simulation, time advances in discrete steps (frames). Each frame is a snapshot. We approximate the continuous flow by taking small steps:

```
Frame 0:  position = (100, 200), velocity = (3, -1), acceleration = (0, 0.1)
Frame 1:  velocity = (3, -0.9),  position = (103, 199.1)
Frame 2:  velocity = (3, -0.8),  position = (106, 198.3)
...
```

The accuracy of the simulation depends on how small the time step is relative to how fast things change. For most artistic simulations at 60 fps, the default time step (1 frame) is adequate.

---

## 5. Euler Integration Methods

### 5.1 Forward Euler

The simplest integration method. It uses the current state to predict the next state:

```
new_position = position + velocity * dt
new_velocity = velocity + acceleration * dt
```

In practice (computing new values independently from old values):

```js
// True Forward Euler (not what we usually write)
let newPos = p5.Vector.add(this.position, p5.Vector.mult(this.velocity, dt));
let newVel = p5.Vector.add(this.velocity, p5.Vector.mult(this.acceleration, dt));
this.position = newPos;
this.velocity = newVel;
```

**The problem:** Forward Euler adds energy to the system over time. A spring that should oscillate with constant amplitude will instead oscillate with growing amplitude until it goes haywire.

### 5.2 Semi-Implicit Euler (Symplectic Euler)

One tiny change makes a big difference: update velocity first, then use the **updated velocity** to update position:

```
new_velocity = velocity + acceleration * dt    (velocity updates first)
new_position = position + new_velocity * dt    (uses the UPDATED velocity)
```

In code:

```js
// Semi-Implicit Euler (what we actually use)
this.velocity.add(this.acceleration);   // Update velocity first
this.position.add(this.velocity);       // Use updated velocity for position
```

**Why it is better:** Semi-Implicit Euler approximately conserves energy. A spring oscillation will maintain a stable amplitude indefinitely (or very nearly so). This is a remarkable improvement for a single line-order change.

**This is what you should always use** for physics simulations. It is what we have been writing in all our previous code, and now you know why.

### 5.3 Side-by-Side Comparison

```js
let posForward = 300, velForward = 0;
let posSemi = 300, velSemi = 0;
let anchorY = 200;
let k = 0.02;
let energiesForward = [];
let energiesSemi = [];

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(30);

  for (let step = 0; step < 3; step++) {
    // --- Forward Euler ---
    let dispF = posForward - anchorY;
    let accF = -k * dispF;
    let oldVelF = velForward;
    velForward += accF;
    posForward += oldVelF; // Uses OLD velocity

    let eF = 0.5 * velForward * velForward + 0.5 * k * dispF * dispF;
    energiesForward.push(eF);

    // --- Semi-Implicit Euler ---
    let dispS = posSemi - anchorY;
    let accS = -k * dispS;
    velSemi += accS;
    posSemi += velSemi; // Uses NEW velocity

    let eS = 0.5 * velSemi * velSemi + 0.5 * k * dispS * dispS;
    energiesSemi.push(eS);
  }

  // Draw springs
  stroke(100);
  strokeWeight(2);
  line(200, anchorY, 200, posForward);
  line(600, anchorY, 600, posSemi);

  noStroke();
  fill(255, 100, 100);
  circle(200, anchorY, 12);
  circle(200, posForward, 24);

  fill(100, 150, 255);
  circle(600, anchorY, 12);
  circle(600, posSemi, 24);

  // Draw energy graphs
  let graphTop = 380;
  let graphBot = 480;

  // Forward Euler energy
  stroke(255, 100, 100);
  strokeWeight(1);
  noFill();
  beginShape();
  let startF = max(0, energiesForward.length - 600);
  for (let i = startF; i < energiesForward.length; i++) {
    let x = map(i - startF, 0, 600, 10, width - 10);
    let y = map(energiesForward[i], 0, 2, graphBot, graphTop);
    y = constrain(y, graphTop, graphBot);
    vertex(x, y);
  }
  endShape();

  // Semi-Implicit Euler energy
  stroke(100, 150, 255);
  beginShape();
  let startS = max(0, energiesSemi.length - 600);
  for (let i = startS; i < energiesSemi.length; i++) {
    let x = map(i - startS, 0, 600, 10, width - 10);
    let y = map(energiesSemi[i], 0, 2, graphBot, graphTop);
    y = constrain(y, graphTop, graphBot);
    vertex(x, y);
  }
  endShape();

  // Labels
  noStroke();
  fill(255, 100, 100);
  textSize(14);
  text("Forward Euler (energy grows!)", 100, 50);
  fill(100, 150, 255);
  text("Semi-Implicit Euler (energy stable)", 480, 50);
  fill(200);
  text("Energy over time", 10, graphTop - 5);
}
```

**What you will see:** Two springs side by side. The left (red, Forward Euler) gradually oscillates with larger and larger amplitude -- it gains energy. The right (blue, Semi-Implicit Euler) maintains stable oscillation. The energy graph at the bottom confirms: the red line climbs upward while the blue line stays flat.

### 5.4 The Complete Update Pattern

Here is the pattern you should use for every simulation:

```js
// In your draw() or update loop:

// 1. Apply all forces
let gravity = createVector(0, body.mass * 0.2);
body.applyForce(gravity);

let spring = springForce(anchor, body.position, 100, 0.01);
body.applyForce(spring);

// 2. Update (Semi-Implicit Euler)
body.velocity.add(body.acceleration);        // Velocity first
body.position.add(body.velocity);            // Position uses new velocity
body.acceleration.mult(0);                    // Reset for next frame

// 3. Display
body.display();
```

---

## 6. Ordinary Differential Equations (ODE Systems)

### 6.1 What Is an ODE?

An **Ordinary Differential Equation** describes how a quantity changes over time as a function of its current state:

```
dx/dt = f(x, t)
```

Every simulation we have built is an ODE system:

```
d(position)/dt = velocity           (how position changes)
d(velocity)/dt = acceleration       (how velocity changes)
```

But ODEs model far more than bouncing balls. They model epidemics, weather, chemical reactions, population dynamics, and countless other phenomena.

### 6.2 The General Recipe

For any ODE system:

1. Identify the state variables (x, y, z, etc.)
2. Write the equations: `dx/dt = ..., dy/dt = ...`
3. Choose parameter values and initial conditions
4. Each frame: compute the right-hand sides, multiply by dt, add to the state

```js
// General ODE integration:
let dx = f(x, y, z) * dt;
let dy = g(x, y, z) * dt;
let dz = h(x, y, z) * dt;

x += dx;
y += dy;
z += dz;
```

### 6.3 The SIR Epidemic Model

The SIR model divides a population into Susceptible, Infected, and Recovered:

```
dS/dt = -beta * S * I           (susceptible people get infected)
dI/dt = beta * S * I - gamma * I (new infections minus recoveries)
dR/dt = gamma * I                (infected people recover)
```

Parameters:
- `beta` = infection rate
- `gamma` = recovery rate
- `R0 = beta / gamma` = basic reproduction number

```js
let S = 0.99, I = 0.01, R = 0.0;
let beta = 0.3, gamma = 0.05;
let dt = 0.5;
let history = [];

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(30);

  // Simulate multiple steps per frame
  for (let step = 0; step < 5; step++) {
    let dS = -beta * S * I;
    let dI = beta * S * I - gamma * I;
    let dR = gamma * I;

    S += dS * dt;
    I += dI * dt;
    R += dR * dt;

    S = constrain(S, 0, 1);
    I = constrain(I, 0, 1);
    R = constrain(R, 0, 1);

    history.push({ s: S, i: I, r: R });
  }

  // Draw graph
  let gLeft = 50, gRight = width - 20;
  let gTop = 40, gBottom = height - 30;
  let maxPoints = min(history.length, gRight - gLeft);
  let start = max(0, history.length - maxPoints);

  // Susceptible (blue)
  noFill();
  stroke(80, 150, 255);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    vertex(gLeft + i, map(history[start + i].s, 0, 1, gBottom, gTop));
  }
  endShape();

  // Infected (red)
  stroke(255, 80, 80);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    vertex(gLeft + i, map(history[start + i].i, 0, 1, gBottom, gTop));
  }
  endShape();

  // Recovered (green)
  stroke(80, 220, 120);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    vertex(gLeft + i, map(history[start + i].r, 0, 1, gBottom, gTop));
  }
  endShape();

  // Labels
  noStroke();
  fill(80, 150, 255);
  textSize(14);
  text("S: " + (S * 100).toFixed(1) + "%", gLeft, gTop - 5);
  fill(255, 80, 80);
  text("I: " + (I * 100).toFixed(1) + "%", gLeft + 120, gTop - 5);
  fill(80, 220, 120);
  text("R: " + (R * 100).toFixed(1) + "%", gLeft + 240, gTop - 5);
  fill(255);
  textSize(16);
  text("SIR Model  (R0 = " + (beta / gamma).toFixed(1) + ")", gLeft, 25);
}
```

**Line-by-line explanation of the ODE step:**
- `let dS = -beta * S * I;` -- The rate of decrease of susceptible people. It depends on both S and I: more susceptible people and more infected people means more new infections.
- `let dI = beta * S * I - gamma * I;` -- Infected increases by new infections and decreases by recoveries.
- `let dR = gamma * I;` -- Recovered increases as infected people recover.
- `S += dS * dt;` -- Euler integration. The change in S is the rate times the time step.

### 6.4 The Lorenz Attractor

Edward Lorenz discovered this chaotic system in 1963:

```
dx/dt = sigma * (y - x)
dy/dt = x * (rho - z) - y
dz/dt = x * y - beta * z
```

Classic parameters: `sigma = 10, rho = 28, beta = 8/3`

```js
let x = 1, y = 1, z = 1;
let sigma = 10, rho = 28, beta = 8 / 3;
let dt = 0.005;
let trail = [];

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  background(10);
  orbitControl();

  for (let i = 0; i < 20; i++) {
    let dx = sigma * (y - x);
    let dy = x * (rho - z) - y;
    let dz = x * y - beta * z;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    trail.push(createVector(x, y, z));
    if (trail.length > 5000) trail.shift();
  }

  scale(5);

  noFill();
  strokeWeight(0.3);
  beginShape();
  for (let i = 0; i < trail.length; i++) {
    let t = i / trail.length;
    let r = map(trail[i].z, 0, 50, 50, 255);
    let b = map(trail[i].z, 0, 50, 255, 50);
    stroke(r, 80, b, t * 255);
    vertex(trail[i].x, trail[i].y, trail[i].z - 25);
  }
  endShape();

  push();
  translate(x, y, z - 25);
  noStroke();
  fill(255);
  sphere(0.6);
  pop();
}
```

**What you will see:** The famous Lorenz butterfly -- a trajectory that loops around two "wings" in 3D space, never exactly repeating. This is a hallmark of chaos: the system is deterministic (same initial conditions always produce the same result) but extremely sensitive to initial conditions (the tiniest change leads to a completely different trajectory after some time).

**Line-by-line explanation of the Lorenz equations:**
- `dx = sigma * (y - x)` -- x is pulled toward y. If y is larger than x, x increases. The parameter sigma controls how quickly.
- `dy = x * (rho - z) - y` -- y increases when x is large and z is small. The parameter rho is the key: when rho > ~24.74, the system becomes chaotic.
- `dz = x * y - beta * z` -- z increases when both x and y are large (they are positively correlated). The term `-beta * z` provides damping to prevent z from growing without bound.

### 6.5 Lotka-Volterra Predator-Prey

The Lotka-Volterra equations model two interacting populations:

```
d(prey)/dt     =  alpha * prey  -  beta * prey * predators
d(predators)/dt = -gamma * predators  +  delta * prey * predators
```

```js
let prey = 80, predators = 20;
let alpha = 1.0, beta = 0.02, gamma = 0.5, delta = 0.01;
let dt = 0.02;
let histPrey = [], histPred = [];

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(30);

  for (let step = 0; step < 10; step++) {
    let dPrey = alpha * prey - beta * prey * predators;
    let dPred = -gamma * predators + delta * prey * predators;

    prey += dPrey * dt;
    predators += dPred * dt;

    prey = max(prey, 0);
    predators = max(predators, 0);

    histPrey.push(prey);
    histPred.push(predators);
  }

  // Time series plot (top half)
  let maxVal = 1;
  let startIdx = max(0, histPrey.length - 700);
  for (let i = startIdx; i < histPrey.length; i++) {
    maxVal = max(maxVal, histPrey[i], histPred[i]);
  }

  let gTop = 40, gBot = height / 2 - 20;
  let gLeft = 60, gRight = width - 20;

  noFill();
  strokeWeight(2);

  stroke(80, 220, 120);
  beginShape();
  let count = min(histPrey.length - startIdx, gRight - gLeft);
  for (let i = 0; i < count; i++) {
    vertex(gLeft + i, map(histPrey[startIdx + i], 0, maxVal, gBot, gTop));
  }
  endShape();

  stroke(255, 100, 80);
  beginShape();
  for (let i = 0; i < count; i++) {
    vertex(gLeft + i, map(histPred[startIdx + i], 0, maxVal, gBot, gTop));
  }
  endShape();

  // Phase space plot (bottom half)
  let pTop = height / 2 + 20, pBot = height - 30;
  let pLeft = 60, pRight = width - 20;

  noFill();
  strokeWeight(1);
  let phaseLen = min(histPrey.length, 2000);
  let phaseStart = max(0, histPrey.length - phaseLen);
  for (let i = phaseStart + 1; i < histPrey.length; i++) {
    let t = (i - phaseStart) / phaseLen;
    stroke(80 + t * 175, 220 - t * 120, 120 - t * 40, 50 + t * 200);
    let x1 = map(histPrey[i - 1], 0, maxVal, pLeft, pRight);
    let y1 = map(histPred[i - 1], 0, maxVal, pBot, pTop);
    let x2 = map(histPrey[i], 0, maxVal, pLeft, pRight);
    let y2 = map(histPred[i], 0, maxVal, pBot, pTop);
    line(x1, y1, x2, y2);
  }

  // Labels
  noStroke();
  fill(80, 220, 120);
  textSize(14);
  text("Prey: " + prey.toFixed(0), gLeft, gTop - 5);
  fill(255, 100, 80);
  text("Predators: " + predators.toFixed(0), gLeft + 120, gTop - 5);
  fill(255);
  textSize(16);
  text("Lotka-Volterra Predator-Prey", gLeft, 25);
  fill(150);
  textSize(12);
  text("Phase Space (prey vs predators)", pLeft, pTop - 5);
}
```

**Reading the Lotka-Volterra equations:**
- `alpha * prey` -- Prey reproduce at a constant rate (exponential growth without predators).
- `-beta * prey * predators` -- Prey are eaten. The rate depends on encounters between prey and predators (proportional to both populations).
- `-gamma * predators` -- Predators die at a constant rate (starvation without prey).
- `delta * prey * predators` -- Predators reproduce. The rate depends on how much prey they eat.

The result is cyclical: prey increase -> predators feast and increase -> prey decline from overpredation -> predators starve and decline -> prey recover -> cycle repeats.

---

## 7. Webcam Input and Shader Effects

### 7.1 Webcam Basics

p5.js can capture webcam video with a single function call:

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
}

function draw() {
  // Mirror the video for natural feel
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  pop();
}
```

### 7.2 Pixel-Level Effects

You can access individual pixels for CPU-based effects:

```js
function draw() {
  video.loadPixels();
  loadPixels();

  for (let i = 0; i < video.pixels.length; i += 4) {
    // Invert colors (negative effect)
    pixels[i]     = 255 - video.pixels[i];       // R
    pixels[i + 1] = 255 - video.pixels[i + 1];   // G
    pixels[i + 2] = 255 - video.pixels[i + 2];   // B
    pixels[i + 3] = 255;                           // A
  }

  updatePixels();
}
```

### 7.3 GLSL Shaders for Performance

For high-performance effects, pass the video to a GLSL shader. The GPU processes all pixels in parallel.

**Vertex shader (shader.vert):**

```glsl
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
```

**Fragment shader with vignette and color shift (shader.frag):**

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform float uTime;

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

  // Chromatic aberration: shift RGB channels
  vec2 center = vec2(0.5, 0.5);
  vec2 dir = uv - center;
  float offset = 0.003 + 0.002 * sin(uTime);

  float r = texture2D(uTexture, uv + dir * offset).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - dir * offset).b;

  // Vignette
  float d = distance(uv, center);
  float vignette = 1.0 - smoothstep(0.3, 0.75, d);

  gl_FragColor = vec4(r, g, b, 1.0) * vignette;
}
```

**p5.js sketch:**

```js
let video, myShader;

function preload() {
  myShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
}

function draw() {
  shader(myShader);
  myShader.setUniform('uTexture', video);
  myShader.setUniform('uTime', millis() / 1000.0);
  rect(-width / 2, -height / 2, width, height);
}
```

### 7.4 Tone Mapping

**Tone mapping** is the process of converting high-dynamic-range (HDR) values to the displayable range [0, 1]. This is relevant when shader computations produce values outside the normal range. Common tone mapping operators:

**Reinhard tone mapping:**

```glsl
// In a fragment shader:
vec3 hdrColor = /* some computation that might exceed 1.0 */;
vec3 mapped = hdrColor / (hdrColor + vec3(1.0)); // Reinhard
gl_FragColor = vec4(mapped, 1.0);
```

This compresses the range so that very bright values are brought down toward 1.0 without clipping. Values near 0 are barely changed, but very large values are smoothly compressed.

**ACES filmic tone mapping** (more cinematic):

```glsl
vec3 ACESFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
```

Tone mapping is especially useful when combining multiple light sources or using additive blending, where accumulated values can easily exceed 1.0.

---

## 8. Exercises

### Fundamentals

1. **Force diagram**: Create a sketch that shows a single body at the center of the canvas. Draw arrows representing all forces acting on it: gravity (down), spring to mouse cursor (toward mouse), and drag (opposite to velocity). Color-code each arrow. This visualizes the principle of superposition.

2. **Energy conservation**: Create a spring simulation that displays kinetic energy (0.5 * m * v^2), potential energy (0.5 * k * x^2), and total energy in real time as a bar chart. Verify that Semi-Implicit Euler keeps total energy approximately constant.

3. **Euler comparison**: Implement both Forward Euler and Semi-Implicit Euler for a simple orbital simulation (one body orbiting another under gravity). Run both for 1000 frames. The Forward Euler orbit should spiral outward. The Semi-Implicit Euler orbit should remain stable.

### Forces

4. **Spring chain**: Create a chain of 15 bodies connected by springs. Pin the first body to the top of the canvas. Apply gravity. Add drag to prevent chaos. Click and drag the last body. This creates a realistic rope/chain simulation.

5. **Charged particles**: Create 20 positively charged particles in a box. They should repel each other via Coulomb's law and settle into an approximately uniform distribution. Add walls that repel particles when they get too close.

6. **N-body gravity**: Create 5 bodies with different masses. Apply gravitational attraction between all pairs (N-body problem). Give each body an initial velocity perpendicular to the line toward the center of mass. Watch the orbital dynamics unfold. Try to create stable systems.

### ODE Systems

7. **SIR with sliders**: Add sliders for beta and gamma in the SIR model. Find the values that produce: (a) a rapid epidemic that infects nearly everyone, (b) a slow epidemic that infects about half the population, (c) a disease that fails to spread.

8. **Lorenz bifurcation**: Run the Lorenz system with rho = 10 (stable), rho = 24 (transitional), and rho = 28 (chaotic). How does the trajectory change? At what value of rho does the butterfly shape appear?

9. **Custom ODE**: Design your own ODE system with 2-3 variables. Define equations that produce interesting behavior (oscillation, chaos, spiral). Implement it and visualize the trajectory in both time series and phase space.

### Webcam

10. **Motion-triggered particles**: Use frame differencing to detect motion. At each pixel where motion exceeds a threshold, spawn a particle. The particle system uses gravity and drag. Moving your hand should leave trails of falling particles.

11. **Shader gallery**: Write three different fragment shaders for the webcam: (a) edge detection (Sobel filter), (b) posterization (reduce color levels), (c) pixelation (sample from a grid). Add a key press to switch between them.

---

## 9. Key Takeaways

1. **Newton's Second Law (F = ma)** is the foundation. Every force produces acceleration inversely proportional to mass.

2. **Forces are vectors** that add together (superposition). Gravity, springs, charges, friction, drag -- they all contribute to acceleration.

3. **Calculus is just adding up small changes.** Velocity is how fast position changes. Acceleration is how fast velocity changes. Integration accumulates these changes frame by frame.

4. **Semi-Implicit Euler** (update velocity first, then position) is the right integration method for artistic simulations. It approximately conserves energy.

5. **Any ODE system** can be simulated with the same pattern: compute rates of change, multiply by dt, add to state. SIR, Lorenz, Lotka-Volterra -- the technique is identical.

6. **Inverse square laws** (gravity, Coulomb) create rich dynamics: strong at close range, weak at long range. Always clamp the minimum distance to prevent singularities.

7. **The webcam** is a powerful input. CPU pixel manipulation is simple but slow. GLSL shaders run on the GPU and are dramatically faster.

8. **Tone mapping** converts HDR values to displayable range. Reinhard and ACES are the most common operators.

---

## 10. Further Reading

- Daniel Shiffman, *The Nature of Code* -- Chapters 2 (Forces), 3 (Oscillation), 4 (Particle Systems)
- Golan Levin, "Computer Vision for Artists and Designers" (webcam techniques)
- Edward Lorenz, "Deterministic Nonperiodic Flow" (1963) -- the original Lorenz attractor paper
- Steven Strogatz, *Nonlinear Dynamics and Chaos* -- excellent introduction to dynamical systems
- 3Blue1Brown, "The Essence of Calculus" -- visual introduction to calculus concepts
- The Book of Shaders by Patricio Gonzalez Vivo -- interactive GLSL tutorial
