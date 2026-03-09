# Tutorial: Implementing ODE Systems in p5.js

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Introduction

An **Ordinary Differential Equation (ODE)** describes how something changes over time. Every physics simulation we have built so far is an ODE: "velocity changes by acceleration, position changes by velocity." But ODEs go far beyond bouncing balls. They model epidemics, weather, chemical reactions, population dynamics, and more.

In this tutorial, you will implement three famous ODE systems in p5.js:

1. **SIR Model** -- how epidemics spread through populations
2. **Lorenz Attractor** -- a chaotic system that produces beautiful butterfly-shaped trajectories
3. **Lotka-Volterra** -- predator-prey population dynamics

For each system, you will see the mathematical notation, translate it to code, and create a visual sketch.

---

## The General Pattern: From Math to Code

An ODE system has the form:

```
dx/dt = f(x, y, z, ...)
dy/dt = g(x, y, z, ...)
dz/dt = h(x, y, z, ...)
```

This means: the rate of change of `x` depends on the current values of `x`, `y`, `z`, etc. Same for `y` and `z`.

To simulate this in code, we use Euler integration:

```js
// Each frame:
let dxdt = f(x, y, z);  // Compute the rate of change
let dydt = g(x, y, z);
let dzdt = h(x, y, z);

x += dxdt * dt;          // Update using the rate of change
y += dydt * dt;
z += dzdt * dt;
```

That is it. Translate the right-hand side of each equation into a JavaScript expression, multiply by the time step `dt`, and add to the current value. This works for any ODE system.

---

## System 1: The SIR Epidemic Model

### The Math

The SIR model divides a population into three groups:

- **S** -- Susceptible (healthy people who can catch the disease)
- **I** -- Infected (people who are currently sick and contagious)
- **R** -- Recovered (people who have recovered and are now immune)

The equations are:

```
dS/dt = -beta * S * I
dI/dt =  beta * S * I - gamma * I
dR/dt =  gamma * I
```

where:
- `beta` is the **infection rate** (how easily the disease spreads)
- `gamma` is the **recovery rate** (how quickly people recover)
- S, I, and R are fractions of the total population (they sum to 1)

**Reading the equations:**
- Susceptible people decrease as they get infected (rate depends on contact between S and I).
- Infected people increase from new infections and decrease as they recover.
- Recovered people increase as infected people recover.

### The Code

```js
let S, I, R;
let beta = 0.3;   // Infection rate
let gamma = 0.05;  // Recovery rate
let dt = 0.5;

// Arrays to store history for plotting
let historyS = [];
let historyI = [];
let historyR = [];

function setup() {
  createCanvas(800, 500);

  // Initial conditions: almost everyone is susceptible, a tiny fraction is infected
  S = 0.99;
  I = 0.01;
  R = 0.0;
}

function draw() {
  background(30);

  // Run several simulation steps per frame for speed
  for (let step = 0; step < 5; step++) {
    // Compute rates of change (the right-hand side of the ODEs)
    let dSdt = -beta * S * I;
    let dIdt = beta * S * I - gamma * I;
    let dRdt = gamma * I;

    // Euler integration: update the state
    S += dSdt * dt;
    I += dIdt * dt;
    R += dRdt * dt;

    // Clamp values to valid range
    S = constrain(S, 0, 1);
    I = constrain(I, 0, 1);
    R = constrain(R, 0, 1);

    // Store history
    historyS.push(S);
    historyI.push(I);
    historyR.push(R);
  }

  // --- Draw the graph ---
  let graphTop = 60;
  let graphBottom = height - 40;
  let graphLeft = 60;
  let graphRight = width - 20;
  let graphHeight = graphBottom - graphTop;
  let graphWidth = graphRight - graphLeft;

  // Axes
  stroke(100);
  strokeWeight(1);
  line(graphLeft, graphTop, graphLeft, graphBottom);
  line(graphLeft, graphBottom, graphRight, graphBottom);

  // Labels
  fill(200);
  noStroke();
  textSize(14);
  textAlign(CENTER);
  text("Time", (graphLeft + graphRight) / 2, height - 10);
  textAlign(LEFT);
  text("Population Fraction", graphLeft, graphTop - 10);

  // Plot the curves
  let maxPoints = min(historyS.length, graphWidth);
  let startIndex = max(0, historyS.length - graphWidth);

  // Susceptible (blue)
  noFill();
  stroke(100, 150, 255);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    let x = graphLeft + i;
    let y = map(historyS[startIndex + i], 0, 1, graphBottom, graphTop);
    vertex(x, y);
  }
  endShape();

  // Infected (red)
  stroke(255, 80, 80);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    let x = graphLeft + i;
    let y = map(historyI[startIndex + i], 0, 1, graphBottom, graphTop);
    vertex(x, y);
  }
  endShape();

  // Recovered (green)
  stroke(80, 220, 120);
  beginShape();
  for (let i = 0; i < maxPoints; i++) {
    let x = graphLeft + i;
    let y = map(historyR[startIndex + i], 0, 1, graphBottom, graphTop);
    vertex(x, y);
  }
  endShape();

  // Legend
  noStroke();
  fill(100, 150, 255);
  text("Susceptible: " + (S * 100).toFixed(1) + "%", graphLeft + 10, graphTop + 20);
  fill(255, 80, 80);
  text("Infected: " + (I * 100).toFixed(1) + "%", graphLeft + 10, graphTop + 40);
  fill(80, 220, 120);
  text("Recovered: " + (R * 100).toFixed(1) + "%", graphLeft + 10, graphTop + 60);

  // Title
  fill(255);
  textSize(18);
  text("SIR Epidemic Model", graphLeft, 30);
  textSize(12);
  fill(150);
  text("beta=" + beta + "  gamma=" + gamma, graphLeft + 250, 30);
}
```

**What you will see:** Three curves over time. The blue (Susceptible) curve starts high and drops. The red (Infected) curve rises to a peak and then falls. The green (Recovered) curve rises as people recover. This is the classic epidemic curve.

**Try changing parameters:**
- Increase `beta` (infection rate): the epidemic peaks faster and higher.
- Increase `gamma` (recovery rate): the epidemic is shorter and milder.
- The ratio `beta/gamma` is the **basic reproduction number** (R0). When R0 > 1, the disease spreads. When R0 < 1, it dies out.

---

## System 2: The Lorenz Attractor

### The Math

The Lorenz system was discovered by Edward Lorenz in 1963 while studying weather models. It is one of the first systems found to exhibit **chaos** -- extreme sensitivity to initial conditions (the "butterfly effect").

The equations are:

```
dx/dt = sigma * (y - x)
dy/dt = x * (rho - z) - y
dz/dt = x * y - beta * z
```

where the classic parameter values are:
- `sigma = 10`
- `rho = 28`
- `beta = 8/3`

The system produces a trajectory that loops around two "wings" in 3D space, never exactly repeating, tracing out the famous butterfly shape.

### The Code

```js
let x, y, z;
let sigma = 10;
let rho = 28;
let beta = 8 / 3;
let dt = 0.005;

let trail = [];
let maxTrailLength = 5000;

// Rotation angle for 3D view
let angleY = 0;
let angleX = 0.5;

function setup() {
  createCanvas(800, 600, WEBGL);

  // Initial conditions (slightly off the origin)
  x = 1;
  y = 1;
  z = 1;
}

function draw() {
  background(10);
  orbitControl(); // Allow mouse rotation of the 3D view

  // Run many steps per frame for a smooth trail
  for (let i = 0; i < 20; i++) {
    // Compute rates of change
    let dxdt = sigma * (y - x);
    let dydt = x * (rho - z) - y;
    let dzdt = x * y - beta * z;

    // Euler integration
    x += dxdt * dt;
    y += dydt * dt;
    z += dzdt * dt;

    // Store the point (scaled for display)
    trail.push(createVector(x, y, z));
    if (trail.length > maxTrailLength) {
      trail.shift(); // Remove oldest point
    }
  }

  // Scale the scene
  scale(5);

  // Draw the trail
  noFill();
  strokeWeight(0.3);

  beginShape();
  for (let i = 0; i < trail.length; i++) {
    let t = i / trail.length; // 0 to 1

    // Color based on z-value
    let r = map(trail[i].z, 0, 50, 50, 255);
    let g = map(trail[i].z, 0, 50, 100, 50);
    let b = map(trail[i].z, 0, 50, 255, 100);
    stroke(r, g, b, map(i, 0, trail.length, 50, 255));

    vertex(trail[i].x, trail[i].y, trail[i].z - 25);
  }
  endShape();

  // Draw current point
  push();
  translate(x, y, z - 25);
  noStroke();
  fill(255);
  sphere(0.8);
  pop();
}
```

**What you will see:** A glowing butterfly-shaped trajectory spinning in 3D. The trail is colored based on its z-coordinate -- blue when low, red when high. The white sphere shows the current position. You can click and drag to rotate the view.

**How to read the code:**
- The three `dxdt`, `dydt`, `dzdt` lines are direct translations of the Lorenz equations.
- We use `WEBGL` mode for 3D rendering.
- `orbitControl()` lets you rotate the view with the mouse.
- The trail stores the last 5000 points and draws them as a continuous line.

### Alternative: 2D Projection

If you want a simpler version without WEBGL:

```js
let x, y, z;
let sigma = 10;
let rho = 28;
let beta = 8 / 3;
let dt = 0.005;

let trail = [];

function setup() {
  createCanvas(800, 600);
  x = 1;
  y = 1;
  z = 1;
}

function draw() {
  background(10, 10, 20, 25); // Semi-transparent for trail effect

  // Simulate many steps per frame
  for (let i = 0; i < 30; i++) {
    let dxdt = sigma * (y - x);
    let dydt = x * (rho - z) - y;
    let dzdt = x * y - beta * z;

    x += dxdt * dt;
    y += dydt * dt;
    z += dzdt * dt;
  }

  // Project 3D to 2D (just use x and z)
  let screenX = map(x, -25, 25, 100, width - 100);
  let screenY = map(z, 0, 50, height - 50, 50);

  // Draw point
  noStroke();
  let r = map(z, 0, 50, 50, 255);
  fill(r, 100, 255 - r, 200);
  circle(screenX, screenY, 4);

  // Title
  fill(200);
  textSize(16);
  text("Lorenz Attractor (x-z projection)", 10, 25);
}
```

This version uses a semi-transparent background to create a trail effect without storing points. It projects the 3D system down to 2D by using x for the horizontal axis and z for the vertical axis.

---

## System 3: Lotka-Volterra (Predator-Prey)

### The Math

The Lotka-Volterra equations model the population dynamics of two species: prey (like rabbits) and predators (like foxes). They were independently developed by Alfred Lotka (1925) and Vito Volterra (1926).

```
dx/dt =  alpha * x  -  beta * x * y
dy/dt = -gamma * y  +  delta * x * y
```

where:
- `x` is the prey population
- `y` is the predator population
- `alpha` is the prey birth rate (prey grow exponentially without predators)
- `beta` is the predation rate (how effectively predators eat prey)
- `gamma` is the predator death rate (predators die without food)
- `delta` is the predator reproduction rate from eating prey

**Reading the equations:**
- Prey grow at rate `alpha` but are eaten at rate `beta * x * y` (proportional to encounters between prey and predators).
- Predators die at rate `gamma` but reproduce at rate `delta * x * y` (proportional to how much prey they eat).

### The Code

```js
let prey, predators;
let alpha = 1.0;    // Prey birth rate
let beta = 0.02;    // Predation rate
let gamma = 0.5;    // Predator death rate
let delta = 0.01;   // Predator reproduction rate
let dt = 0.02;

let historyPrey = [];
let historyPred = [];

function setup() {
  createCanvas(800, 600);

  // Initial populations
  prey = 80;
  predators = 20;
}

function draw() {
  background(30);

  // Run simulation steps
  for (let step = 0; step < 10; step++) {
    // Lotka-Volterra equations
    let dPreyDt = alpha * prey - beta * prey * predators;
    let dPredDt = -gamma * predators + delta * prey * predators;

    // Euler integration
    prey += dPreyDt * dt;
    predators += dPredDt * dt;

    // Prevent negative populations
    prey = max(prey, 0);
    predators = max(predators, 0);

    // Store history
    historyPrey.push(prey);
    historyPred.push(predators);
  }

  // --- Top: Time series plot ---
  let plotTop = 30;
  let plotBottom = height / 2 - 30;
  let plotLeft = 60;
  let plotRight = width - 20;
  let plotHeight = plotBottom - plotTop;

  // Find max value for scaling
  let maxVal = 1;
  let startIdx = max(0, historyPrey.length - (plotRight - plotLeft));
  for (let i = startIdx; i < historyPrey.length; i++) {
    maxVal = max(maxVal, historyPrey[i], historyPred[i]);
  }

  // Axes
  stroke(80);
  strokeWeight(1);
  line(plotLeft, plotTop, plotLeft, plotBottom);
  line(plotLeft, plotBottom, plotRight, plotBottom);

  // Plot prey (green)
  noFill();
  stroke(80, 220, 120);
  strokeWeight(2);
  beginShape();
  let count = min(historyPrey.length - startIdx, plotRight - plotLeft);
  for (let i = 0; i < count; i++) {
    let x = plotLeft + i;
    let y = map(historyPrey[startIdx + i], 0, maxVal, plotBottom, plotTop);
    vertex(x, y);
  }
  endShape();

  // Plot predators (red)
  stroke(255, 100, 80);
  beginShape();
  for (let i = 0; i < count; i++) {
    let x = plotLeft + i;
    let y = map(historyPred[startIdx + i], 0, maxVal, plotBottom, plotTop);
    vertex(x, y);
  }
  endShape();

  // Legend
  noStroke();
  fill(80, 220, 120);
  textSize(14);
  text("Prey: " + prey.toFixed(1), plotLeft + 10, plotTop + 20);
  fill(255, 100, 80);
  text("Predators: " + predators.toFixed(1), plotLeft + 10, plotTop + 40);

  // --- Bottom: Phase space plot (prey vs predators) ---
  let phaseTop = height / 2 + 20;
  let phaseBottom = height - 30;
  let phaseLeft = 60;
  let phaseRight = width - 20;

  // Axes
  stroke(80);
  strokeWeight(1);
  line(phaseLeft, phaseTop, phaseLeft, phaseBottom);
  line(phaseLeft, phaseBottom, phaseRight, phaseBottom);

  // Labels
  fill(150);
  textSize(12);
  textAlign(CENTER);
  text("Prey Population", (phaseLeft + phaseRight) / 2, height - 8);
  textAlign(LEFT);

  push();
  translate(15, (phaseTop + phaseBottom) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER);
  text("Predator Population", 0, 0);
  pop();

  // Plot phase trajectory
  noFill();
  strokeWeight(1);
  let phaseCount = min(historyPrey.length, 3000);
  let phaseStart = max(0, historyPrey.length - phaseCount);

  for (let i = phaseStart + 1; i < historyPrey.length; i++) {
    let t = (i - phaseStart) / phaseCount;
    stroke(100 + t * 155, 100, 255 - t * 155, 50 + t * 200);
    let x1 = map(historyPrey[i - 1], 0, maxVal, phaseLeft, phaseRight);
    let y1 = map(historyPred[i - 1], 0, maxVal, phaseBottom, phaseTop);
    let x2 = map(historyPrey[i], 0, maxVal, phaseLeft, phaseRight);
    let y2 = map(historyPred[i], 0, maxVal, phaseBottom, phaseTop);
    line(x1, y1, x2, y2);
  }

  // Current point
  noStroke();
  fill(255);
  let cx = map(prey, 0, maxVal, phaseLeft, phaseRight);
  let cy = map(predators, 0, maxVal, phaseBottom, phaseTop);
  circle(cx, cy, 8);

  // Title
  fill(255);
  textSize(18);
  textAlign(LEFT);
  text("Lotka-Volterra Predator-Prey Model", plotLeft, plotTop - 5);
}
```

**What you will see:**

**Top half -- Time Series:** Two oscillating curves, green (prey) and red (predators). The prey population rises, then predators feast and rise too, eating so many prey that prey decline, then predators decline from lack of food, and the cycle repeats. The predator curve lags behind the prey curve.

**Bottom half -- Phase Space:** A trajectory plotting prey population (horizontal) against predator population (vertical). It traces closed loops, showing the cyclic nature of the system. The white dot shows the current state.

**Reading the phase plot:** Moving clockwise around the loop:
1. Lots of prey, few predators -> prey booming
2. Lots of prey, predators rising -> predators feast
3. Prey declining, lots of predators -> overpredation
4. Few prey, predators declining -> predator starvation
5. Back to the start

---

## The Translation Process: Math to Code

Here is the general recipe for translating any ODE system to code:

1. **Identify the state variables** (x, y, z, S, I, R, prey, predators, etc.)
2. **Write down the equations** in the form `dx/dt = ...`
3. **Choose parameter values** and initial conditions
4. **Choose a time step `dt`** (smaller is more accurate but slower)
5. **Each frame, compute the right-hand sides** of all equations
6. **Update each variable** by adding `rate * dt`

```js
// Generic ODE integration pattern:
for (let step = 0; step < stepsPerFrame; step++) {
  // Step 1: Compute rates of change
  let dx = f(x, y, z, ...params);
  let dy = g(x, y, z, ...params);
  let dz = h(x, y, z, ...params);

  // Step 2: Update state
  x += dx * dt;
  y += dy * dt;
  z += dz * dt;
}
```

The `stepsPerFrame` loop lets you run multiple simulation steps per frame. This is useful when `dt` needs to be very small for accuracy but you want the simulation to progress at a visible rate.

---

## Bonus: Rossler Attractor

Here is one more chaotic system for you to explore. The Rossler attractor is simpler than Lorenz but still produces beautiful chaotic trajectories:

```
dx/dt = -y - z
dy/dt = x + a * y
dz/dt = b + z * (x - c)
```

Classic parameters: `a = 0.2`, `b = 0.2`, `c = 5.7`

```js
let x = 1, y = 0, z = 0;
let a = 0.2, b = 0.2, c = 5.7;
let dt = 0.01;
let trail = [];

function setup() {
  createCanvas(800, 600);
  background(10);
}

function draw() {
  // Semi-transparent background for trail effect
  background(10, 10, 20, 15);

  for (let i = 0; i < 40; i++) {
    let dxdt = -y - z;
    let dydt = x + a * y;
    let dzdt = b + z * (x - c);

    x += dxdt * dt;
    y += dydt * dt;
    z += dzdt * dt;
  }

  // Map to screen coordinates (x-y projection)
  let sx = map(x, -15, 15, 100, width - 100);
  let sy = map(y, -15, 15, 100, height - 100);

  // Color based on z
  let r = map(z, 0, 15, 50, 255);
  noStroke();
  fill(r, 100, 255 - r * 0.5, 200);
  circle(sx, sy, 3);
}
```

---

## Summary

| System | Variables | Behavior | Visual |
|---|---|---|---|
| **SIR** | S, I, R (population fractions) | Epidemic curve: rise, peak, decline | Time-series graph |
| **Lorenz** | x, y, z (abstract state) | Chaotic butterfly trajectory | 3D trail |
| **Lotka-Volterra** | prey, predators | Cyclic oscillations | Time series + phase space |
| **Rossler** | x, y, z (abstract state) | Chaotic spiral | 2D projection trail |

**The key insight:** All of these systems use the exact same integration technique. The difference is only in the equations that define the rates of change. Once you know how to translate `dx/dt = some expression` into `x += expression * dt`, you can simulate any ODE system.

---

## Exercises

1. **SIR with vaccination**: Add a vaccination rate to the SIR model. Each time step, a small fraction of susceptible people move directly to recovered (immunized). How does this change the epidemic curve? What vaccination rate prevents the epidemic from peaking?

2. **Lorenz sensitivity**: Run two Lorenz systems with slightly different initial conditions (e.g., x=1.0 vs x=1.001). Plot both trajectories in different colors. How long until they diverge? This is the "butterfly effect."

3. **Three-species ecosystem**: Extend Lotka-Volterra to three species: grass, rabbits, and foxes. Grass grows on its own, rabbits eat grass, foxes eat rabbits. Design the equations and tune parameters until you get interesting oscillatory behavior.

4. **Interactive Lorenz**: Add sliders for the three Lorenz parameters (sigma, rho, beta). The classic values produce chaos, but other values produce stable spirals or periodic orbits. Explore the parameter space.
