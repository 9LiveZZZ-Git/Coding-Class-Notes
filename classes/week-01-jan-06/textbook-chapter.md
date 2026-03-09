# Chapter 1: From Zero to Ballistics -- Your First Day of Computing Arts

## MAT 200C: Computing Arts -- Week 1, January 6

---

## 1.1 What Is Programming?

Programming is the act of writing instructions for a computer to follow. That is it. There is no magic, no special talent required. If you can write a recipe, you can write a program.

A recipe says: "Preheat oven to 350 degrees. Mix flour and sugar. Add eggs. Stir until smooth. Pour into pan. Bake for 30 minutes." A program says: "Create a canvas 600 pixels wide. Set the background to gray. Draw a circle at position (300, 200) with diameter 50."

The difference between a recipe and a program is precision. A human reading a recipe understands "stir until smooth" through experience and common sense. A computer has no common sense. It needs every step spelled out. This is sometimes frustrating, but it is also liberating -- once you learn to express your ideas with the required precision, the computer will execute them tirelessly, exactly, and at incredible speed.

In this course, we program in **JavaScript** using a library called **p5.js**. JavaScript is the programming language of the web. p5.js extends JavaScript with functions designed for drawing, animating, and creating interactive graphics. Everything you make will run directly in a web browser.

---

## 1.2 Setting Up: The p5.js Web Editor

You will write and run your code in the **p5.js Web Editor**:

**[https://editor.p5js.org](https://editor.p5js.org)**

Open this URL in your browser (Chrome or Firefox recommended). You will see a screen divided into panels:

- **Left panel**: your code
- **Right panel**: the preview (where your sketch appears)
- **Top**: a Play button (triangle) and Stop button (square)
- **Bottom**: the console (for error messages and debugging output)

You do not need to install anything. You do not need to create an account (though creating one lets you save your work). Just start typing code and click Play.

When the editor opens, you will see this default code:

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

Click the Play button. A gray square appears in the preview panel. That is your canvas -- a 400-by-400 pixel drawing surface. Everything you create will appear on this canvas.

---

## 1.3 Understanding the Default Sketch Line by Line

Let us go through the default code carefully.

```js
function setup() {
  createCanvas(400, 400);
}
```

**Line 1: `function setup() {`**

This creates a **function** named `setup`. A function is a named block of code that performs a specific task. The word `function` tells JavaScript you are defining one. The name `setup` is special to p5.js -- p5.js knows to look for a function with this exact name and call it automatically when the sketch starts.

The `{` (opening curly brace) marks the beginning of the function's body -- the code that will run when the function is called.

**Line 2: `createCanvas(400, 400);`**

This calls the function `createCanvas` with two **arguments**: `400` and `400`. An argument is a value you pass to a function to tell it what to do. Here, we are telling `createCanvas` to create a drawing surface that is 400 pixels wide and 400 pixels tall.

The semicolon `;` at the end marks the end of this instruction (called a **statement**). JavaScript is somewhat lenient about semicolons, but it is good practice to include them.

**Line 3: `}`**

The closing curly brace marks the end of the `setup` function.

**Line 5: `function draw() {`**

This creates another special function named `draw`. Like `setup`, p5.js looks for this function automatically.

The critical difference: `setup` runs **once**; `draw` runs **repeatedly**, about 60 times per second. This is what makes animation possible.

**Line 6: `background(220);`**

This calls the function `background` with the argument `220`. The `background` function fills the entire canvas with a single color. The number `220` is a shade of gray -- 0 is black, 255 is white, and 220 is a light gray.

**Line 7: `}`**

End of the `draw` function.

### What Happens When You Click Play

1. p5.js loads and looks for your `setup` function
2. p5.js calls `setup()` exactly once. The canvas is created.
3. p5.js starts calling `draw()` over and over, approximately 60 times per second
4. Each call to `draw()` produces one **frame** of your sketch

Since the only thing `draw()` does is paint the background gray, every frame looks the same, and you see a static gray square. But the machinery of animation is already running.

---

## 1.4 The Coordinate System

Before you can draw anything meaningful, you need to understand how p5.js locates points on the canvas.

The canvas is a grid of pixels. Each pixel has an (x, y) coordinate. The coordinate system works as follows:

- The **origin (0, 0)** is at the **top-left corner** of the canvas
- The **x-axis** increases to the **right**
- The **y-axis** increases **downward**

This is different from the mathematical convention where y increases upward. In computer graphics, y increases downward. This is a historical convention from the days of CRT monitors, which drew scanlines from top to bottom.

```
  (0,0) ---------> x
    |
    |
    |
    v
    y
```

On a 400 x 400 canvas:

- (0, 0) is the top-left corner
- (400, 0) is the top-right corner
- (0, 400) is the bottom-left corner
- (400, 400) is the bottom-right corner
- (200, 200) is the center

You will get used to this quickly. The most important thing to remember is that "down" is the positive y direction.

---

## 1.5 Drawing Shapes

Now let us draw things. p5.js provides functions for common geometric shapes.

### Circles

```js
circle(x, y, diameter);
```

Draws a circle centered at (x, y) with the given diameter.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(200, 200, 100);  // Circle at center, diameter 100
}
```

The third number is the **diameter** (the full width of the circle), not the radius. A diameter of 100 means a radius of 50.

### Rectangles

```js
rect(x, y, width, height);
```

Draws a rectangle with its **top-left corner** at (x, y).

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  rect(150, 100, 100, 200);  // Rectangle at (150,100), 100 wide, 200 tall
}
```

### Lines

```js
line(x1, y1, x2, y2);
```

Draws a straight line from point (x1, y1) to point (x2, y2).

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  line(0, 0, 400, 400);     // Diagonal from top-left to bottom-right
  line(400, 0, 0, 400);     // Diagonal from top-right to bottom-left
}
```

### Points

```js
point(x, y);
```

Draws a single point. Points are very small by default (1 pixel). Use `strokeWeight()` to make them visible.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  strokeWeight(10);
  point(200, 200);   // A dot at the center
}
```

### Ellipses and Triangles

```js
ellipse(x, y, width, height);  // Centered at (x, y)
triangle(x1, y1, x2, y2, x3, y3);  // Three corner points
```

---

## 1.6 Color: Fill and Stroke

Every shape in p5.js has two visual components:

1. **Fill** -- the interior color
2. **Stroke** -- the outline color

By default, shapes have a white fill and a black stroke (outline). You change these with the `fill()` and `stroke()` functions.

### Specifying Colors

Colors can be specified in several ways:

**Grayscale** (one number, 0-255):
```js
fill(0);      // Black
fill(128);    // Medium gray
fill(255);    // White
```

**RGB** (three numbers, each 0-255):
```js
fill(255, 0, 0);    // Red
fill(0, 255, 0);    // Green
fill(0, 0, 255);    // Blue
fill(255, 255, 0);  // Yellow (red + green)
fill(255, 0, 255);  // Magenta (red + blue)
fill(0, 255, 255);  // Cyan (green + blue)
```

**RGBA** (four numbers -- the fourth is opacity, 0-255):
```js
fill(255, 0, 0, 128);  // Semi-transparent red
```

### State-Based Drawing

This is an important concept. `fill()` and `stroke()` do not apply to a specific shape. They set the **current state**. Once you call `fill(255, 0, 0)`, every shape drawn after that will be red -- until you change the fill again.

Think of it like picking up a colored marker. Once you pick up the red marker, everything you draw is red until you put it down and pick up a different one.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  fill(255, 0, 0);        // Pick up the "red" marker
  circle(100, 200, 80);   // This circle is red
  rect(60, 280, 80, 40);  // This rectangle is also red

  fill(0, 0, 255);        // Switch to the "blue" marker
  circle(300, 200, 80);   // This circle is blue
  rect(260, 280, 80, 40); // This rectangle is also blue
}
```

### Removing Fill or Stroke

```js
noFill();     // Shapes will have no interior color (transparent)
noStroke();   // Shapes will have no outline
```

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Outline only (no fill)
  noFill();
  stroke(0, 0, 255);
  strokeWeight(3);
  circle(150, 200, 100);

  // Fill only (no outline)
  fill(255, 0, 0);
  noStroke();
  circle(280, 200, 100);
}
```

### `strokeWeight(weight)`

Controls the thickness of outlines and lines. The default is 1 pixel.

```js
strokeWeight(1);   // Thin (default)
strokeWeight(5);   // Medium
strokeWeight(15);  // Thick
```

---

## 1.7 Variables: Storing and Changing Values

A **variable** is a named container for a value. Instead of using a number directly, you give it a name and refer to it by that name.

### Declaring Variables

In JavaScript, you declare a variable with `let`:

```js
let x = 100;       // A variable named "x" with the value 100
let speed = 3;     // A variable named "speed" with the value 3
let color_r = 255; // A variable named "color_r" with the value 255
```

You can name a variable almost anything you want, as long as:
- It starts with a letter, underscore, or dollar sign
- It does not contain spaces
- It is not a reserved word (like `function`, `let`, `if`, etc.)

Good variable names describe what the variable represents: `ballX` is better than `a`.

### Using Variables

Once declared, you use a variable by writing its name:

```js
let diameter = 80;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(200, 200, diameter);  // Uses the value stored in "diameter"
}
```

### Changing Variables

Variables can change over time. This is what makes animation possible.

```js
let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(x, 200, 50);

  x = x + 2;  // Add 2 to x every frame
}
```

Each time `draw()` runs (60 times per second), `x` increases by 2. The circle moves to the right. This is animation.

The statement `x = x + 2` might look strange mathematically (no number equals itself plus 2). But in programming, `=` does not mean "is equal to." It means "assign the value on the right to the variable on the left." So `x = x + 2` means "take the current value of x, add 2, and store the result back in x."

### Where to Declare Variables

Notice that `x` is declared **outside** both `setup()` and `draw()`:

```js
let x = 0;  // Declared here -- outside both functions

function setup() { ... }
function draw() { ... }
```

This makes `x` a **global variable** -- it exists for the entire lifetime of the sketch and can be accessed from any function. If you declared `x` inside `draw()`, it would be recreated (and reset to 0) every frame, and the circle would never move.

---

## 1.8 Built-in Variables: `mouseX` and `mouseY`

p5.js automatically tracks the mouse position and stores it in two built-in variables:

- `mouseX` -- the current x-coordinate of the mouse on the canvas
- `mouseY` -- the current y-coordinate of the mouse on the canvas

These update automatically every frame. You can use them like any other variable:

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 50);  // Circle follows the mouse
}
```

Other useful built-in variables:

| Variable | What it contains |
|---|---|
| `width` | The width of the canvas |
| `height` | The height of the canvas |
| `frameCount` | How many frames have been drawn since the sketch started |
| `mouseIsPressed` | `true` if the mouse button is held down, `false` otherwise |

---

## 1.9 Conditional Logic: `if` Statements

An `if` statement lets your program make decisions.

```js
if (condition) {
  // This code runs only if the condition is true
}
```

The condition is a **boolean expression** -- something that evaluates to `true` or `false`.

```js
let x = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(x, 200, 50);
  x = x + 2;

  // If the ball goes past the right edge, reset to the left
  if (x > width + 25) {
    x = -25;
  }
}
```

Common comparison operators:

| Operator | Meaning |
|---|---|
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |
| `===` | Equal to (use triple equals in JavaScript) |
| `!==` | Not equal to |

---

## 1.10 Functions: Naming Blocks of Code

You have already used many functions -- `circle()`, `fill()`, `background()`. These are all functions that p5.js provides. But you can also write your own.

A function lets you give a name to a block of code so you can reuse it:

```js
function drawFlower(x, y, size) {
  // Draw petals
  fill(255, 150, 200);
  noStroke();
  circle(x - size/3, y, size/2);
  circle(x + size/3, y, size/2);
  circle(x, y - size/3, size/2);
  circle(x, y + size/3, size/2);

  // Draw center
  fill(255, 255, 100);
  circle(x, y, size/3);
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(100, 180, 100);
  drawFlower(100, 200, 60);
  drawFlower(250, 150, 80);
  drawFlower(320, 300, 50);
}
```

The values in parentheses (`x`, `y`, `size`) are **parameters** -- placeholders that get filled in with specific values each time you call the function. When you write `drawFlower(100, 200, 60)`, the function runs with `x = 100`, `y = 200`, `size = 60`.

Functions are essential for organizing your code. Without them, a complex sketch would be one enormous block of code, impossible to understand or modify.

---

## 1.11 Modeling and Simulation: The Big Idea

Now we step back from the technical details to discuss the larger idea that motivates this course.

### Humans Are Modelers

You build models of the world constantly. When you catch a ball, your brain predicts where the ball will be. When you plan a trip, you model travel time. When you read someone's face, you model their emotional state. These are all **mental models** -- simplified representations of reality that let you predict the future and make decisions.

A computational model takes this same idea and makes it precise. Instead of an intuitive feeling for how a ball moves, you write equations. Instead of a rough sense of traffic patterns, you simulate thousands of cars on a road network. Instead of guessing how a building will respond to an earthquake, you model every beam and joint.

### Why Simplification Matters

A model is useful precisely because it is **simpler** than reality. A map that contained every detail of the real world -- every blade of grass, every ant, every grain of sand -- would be as large as the world itself and therefore useless. A good model captures the essential features and ignores the rest.

In our ballistics simulation, we model gravity but ignore air resistance. We model the ball as a point but ignore its rotation. These simplifications are deliberate. They make the model tractable (we can actually compute it) and comprehensible (we can understand what is happening).

### Analytical vs. Numerical

There are two approaches to working with models:

**Analytical**: Find a mathematical formula that gives the exact answer. For our ballistics problem, this formula exists:

```
y(t) = y0 + vy0 * t + 0.5 * g * t^2
```

Plug in time, get position. Exact. Elegant. But only possible for simple systems.

**Numerical**: Step through time, updating the state at each step. This is what we do with Euler integration. It is approximate, but it works for virtually any system, no matter how complex.

Almost all modern simulation -- weather prediction, movie special effects, engineering analysis -- uses numerical methods. The ballistics simulation you will build in this chapter uses numerical methods.

---

## 1.12 Physics Simulation: Position, Velocity, and Acceleration

To simulate a cannonball, we need to understand three quantities and how they relate.

### Position

Position is **where** something is. It is an (x, y) coordinate on the canvas. If the ball is at position (200, 150), it is 200 pixels from the left and 150 pixels from the top.

We will store position in two variables:

```js
let x = 100;
let y = 300;
```

### Velocity

Velocity is **how fast** something is moving, and **in what direction**. In 2D, velocity has two components:

```js
let vx = 4;   // Moving 4 pixels to the right per frame
let vy = -6;  // Moving 6 pixels upward per frame (negative = up)
```

Velocity tells you how position changes over time. If `vx` is 4, then every frame, `x` increases by 4 pixels. The ball moves to the right.

Since positive y is downward in screen coordinates, a **negative** `vy` means the ball is moving **upward**, and a **positive** `vy` means it is moving **downward**.

### Acceleration

Acceleration is the **rate of change of velocity**. It tells you how velocity changes over time.

For our ballistics simulation, the only acceleration is **gravity**:

```js
let gravity = 0.2;  // Accelerates downward at 0.2 pixels per frame per frame
```

Gravity is positive because it accelerates things in the positive y direction (downward in screen coordinates).

### The Update Chain

Every frame, we update the simulation in two steps:

```
1. Velocity changes due to acceleration:   vy = vy + gravity
2. Position changes due to velocity:        x  = x + vx
                                            y  = y + vy
```

This is the heart of the simulation. Two lines of code. That is all it takes to simulate a projectile.

---

## 1.13 Semi-Implicit Euler Integration

The update process described above has a name: **semi-implicit Euler integration** (also called symplectic Euler).

The "semi-implicit" part refers to the order of operations: we update velocity **first**, then use the **updated** velocity to update position. This is important for accuracy.

Compare:

**Explicit (Forward) Euler** (less accurate):
```js
// Update position with OLD velocity, then update velocity
x = x + vx;
y = y + vy;
vy = vy + gravity;
```

**Semi-Implicit Euler** (more accurate):
```js
// Update velocity first, then update position with NEW velocity
vy = vy + gravity;
x = x + vx;
y = y + vy;
```

The difference is subtle but real. Semi-implicit Euler conserves energy better over long simulations. For our purposes, the practical difference is: semi-implicit Euler produces more accurate parabolic arcs.

Named after Leonhard Euler (1707-1783), one of history's most prolific mathematicians. Pronounced "OY-ler," not "YOO-ler."

---

## 1.14 Building the Simulation Step by Step

### Step 1: A Falling Ball

Let us start with the simplest possible simulation -- a ball that starts at the top of the screen and falls under gravity.

```js
let x = 200;    // Starting x position (center of canvas)
let y = 50;     // Starting y position (near top)
let vx = 0;     // No horizontal velocity
let vy = 0;     // No vertical velocity initially
let gravity = 0.2;  // Gravitational acceleration

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(30);

  // --- Physics update (Semi-Implicit Euler) ---
  vy = vy + gravity;   // Gravity increases downward velocity
  x = x + vx;          // Update horizontal position
  y = y + vy;          // Update vertical position

  // --- Drawing ---
  fill(255, 100, 50);
  noStroke();
  circle(x, y, 20);
}
```

**What happens**: The ball starts near the top. Each frame, `vy` increases by 0.2 (gravity pulls it faster and faster downward), and `y` increases by the new `vy`. The ball accelerates downward -- slow at first, then faster and faster. It falls off the bottom of the screen.

This is freefall. The ball has no horizontal velocity, so it falls straight down.

### Step 2: Adding Horizontal Velocity

Change `vx` to give the ball some horizontal motion:

```js
let x = 50;
let y = 50;
let vx = 3;      // Moving to the right at 3 pixels per frame
let vy = 0;
let gravity = 0.2;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(30);

  vy = vy + gravity;
  x = x + vx;
  y = y + vy;

  fill(255, 100, 50);
  noStroke();
  circle(x, y, 20);
}
```

**What happens**: The ball moves to the right (constant horizontal velocity) while simultaneously accelerating downward (gravity). The combined motion traces a **parabolic arc** -- the classic projectile trajectory.

Notice that `vx` never changes. There is no horizontal force, so horizontal velocity remains constant. Only `vy` changes (because gravity acts vertically).

### Step 3: Drawing the Trail

To see the parabolic arc clearly, let us draw the ball's trajectory by remembering all previous positions.

An **array** is a list of values. We will use an array to store every position the ball has visited:

```js
let x = 50;
let y = 50;
let vx = 3;
let vy = 0;
let gravity = 0.2;

let trail = [];  // An empty array to store positions

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(30);

  // Physics
  vy = vy + gravity;
  x = x + vx;
  y = y + vy;

  // Store position in the trail array
  trail.push({ x: x, y: y });  // Add an object with x and y properties

  // Draw the trail
  stroke(255, 200, 50, 150);   // Golden, semi-transparent
  strokeWeight(2);
  noFill();
  beginShape();                  // Start drawing a connected shape
  for (let i = 0; i < trail.length; i++) {
    vertex(trail[i].x, trail[i].y);  // Add each trail point as a vertex
  }
  endShape();                    // Finish the shape

  // Draw the ball
  fill(255, 100, 50);
  noStroke();
  circle(x, y, 20);
}
```

**New concepts**:

- `trail.push(...)` adds a new element to the end of the array
- `{ x: x, y: y }` creates an **object** with two properties (x and y). This lets us store both coordinates as a single item in the array.
- `beginShape()` / `vertex()` / `endShape()` draws a connected series of line segments through all the given points
- The `for` loop iterates through every element in the trail array

**What happens**: The ball arcs across the screen, leaving a golden trail that clearly shows the parabolic trajectory.

### Step 4: The Cannon

Now let us add a cannon that fires balls in the direction of the mouse.

We need to calculate the **angle** from the cannon to the mouse. p5.js provides `atan2(y, x)`, which returns the angle (in radians) from the origin to the point (x, y). To get the angle from the cannon to the mouse:

```js
let angle = atan2(mouseY - cannonY, mouseX - cannonX);
```

We then use trigonometry to convert an angle and speed into horizontal and vertical velocity components:

```js
let vx = speed * cos(angle);  // Horizontal component
let vy = speed * sin(angle);  // Vertical component
```

This is a fundamental technique. `cos(angle)` gives the x-component and `sin(angle)` gives the y-component of a unit vector pointing in the direction of the angle. Multiplying by `speed` scales the vector to the desired magnitude.

### Step 5: Mouse Events

p5.js provides a special function called `mousePressed()` that is called automatically whenever the mouse button is clicked:

```js
function mousePressed() {
  // This code runs once each time the mouse is clicked
}
```

We will use `mousePressed()` to fire the cannon.

### Step 6: The Complete Cannon Simulation

Here is the full, working ballistics simulator with a cannon, mouse aiming, and trajectory drawing:

```js
// =============================================
// Ballistics Simulator
// MAT 200C - Week 1
// =============================================

// --- Cannon configuration ---
let cannonX = 40;       // Cannon's x position
let cannonY;            // Cannon's y position (set in setup)
let cannonLength = 50;  // Length of the cannon barrel

// --- Physics ---
let gravity = 0.25;     // Gravitational acceleration
let launchSpeed = 9;    // Speed of launched projectiles

// --- State ---
let projectiles = [];   // Array of active projectiles

function setup() {
  createCanvas(600, 400);
  cannonY = height - 30;  // Place cannon near the bottom
}

function draw() {
  background(25, 25, 45);  // Dark blue-black sky

  // --- Draw the ground ---
  fill(45, 100, 45);       // Dark green
  noStroke();
  rect(0, height - 30, width, 30);

  // --- Calculate aim angle ---
  // atan2 gives us the angle from the cannon to the mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);

  // Clamp the angle so the cannon only aims upward
  // (angle of 0 is horizontal; negative angles point up)
  if (angle > 0) {
    angle = 0;  // Do not let the cannon aim below horizontal
  }

  // --- Draw the cannon barrel ---
  stroke(170);              // Light gray
  strokeWeight(7);          // Thick line for the barrel
  strokeCap(SQUARE);        // Square end instead of rounded
  let barrelEndX = cannonX + cannonLength * cos(angle);
  let barrelEndY = cannonY + cannonLength * sin(angle);
  line(cannonX, cannonY, barrelEndX, barrelEndY);

  // --- Draw the cannon base ---
  fill(130);                // Gray
  noStroke();
  arc(cannonX, cannonY, 28, 28, PI, TWO_PI);  // Half-circle base

  // --- Update and draw each projectile ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];

    // --- Semi-Implicit Euler Integration ---
    // Step 1: Update velocity (acceleration -> velocity)
    p.vy = p.vy + gravity;

    // Step 2: Update position (velocity -> position)
    p.x = p.x + p.vx;
    p.y = p.y + p.vy;

    // --- Record trail ---
    p.trail.push({ x: p.x, y: p.y });

    // --- Draw trajectory line ---
    stroke(p.r, p.g, p.b, 100);  // Trail color, semi-transparent
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let j = 0; j < p.trail.length; j++) {
      vertex(p.trail[j].x, p.trail[j].y);
    }
    endShape();

    // --- Draw the cannonball ---
    fill(p.r, p.g, p.b);
    noStroke();
    circle(p.x, p.y, 12);

    // --- Remove projectile if it goes off-screen ---
    if (p.x > width + 50 || p.y > height + 50 || p.x < -50) {
      projectiles.splice(i, 1);  // Remove from array
    }
  }

  // --- Draw instructions ---
  fill(180);
  noStroke();
  textSize(13);
  text("Click to fire the cannon!", 15, 18);
}

// --- Fire a projectile when the mouse is clicked ---
function mousePressed() {
  // Calculate angle from cannon to mouse
  let angle = atan2(mouseY - cannonY, mouseX - cannonX);
  if (angle > 0) angle = 0;  // Clamp to upward directions

  // Create a new projectile object
  let p = {
    x: cannonX + cannonLength * cos(angle),  // Start at end of barrel
    y: cannonY + cannonLength * sin(angle),
    vx: launchSpeed * cos(angle),            // Initial velocity components
    vy: launchSpeed * sin(angle),
    trail: [],                                // Empty trail array
    r: random(180, 255),                      // Random warm color
    g: random(80, 200),
    b: random(40, 120)
  };

  // Add the projectile to our array
  projectiles.push(p);
}
```

Let us trace through this code to make sure every part is clear.

**Lines 5-8: Cannon configuration.** We define where the cannon sits and how long the barrel is. These are constants (they do not change during the sketch).

**Lines 11-12: Physics parameters.** `gravity` determines how strongly the simulation pulls projectiles downward. `launchSpeed` determines how fast they launch. Try changing these values and see how the simulation behaves.

**Line 15: The projectiles array.** This is an empty array that will hold all active projectile objects. Each time you click, a new projectile object is added to this array.

**Lines 17-19: `setup()`.** Creates the canvas and places the cannon near the bottom. We use `height - 30` because `height` is a built-in variable equal to the canvas height (400), and we want the cannon 30 pixels above the bottom edge (where the "ground" is).

**Lines 22-24: Drawing the ground.** A simple green rectangle across the bottom of the canvas.

**Lines 27-33: Calculating the aim angle.** `atan2(mouseY - cannonY, mouseX - cannonX)` returns the angle (in radians) from the cannon to the mouse position. We clamp it to non-positive values so the cannon only aims upward or horizontally.

**Lines 36-40: Drawing the cannon barrel.** We use `cos(angle)` and `sin(angle)` to find the endpoint of the barrel. The barrel is a thick line from the cannon position to this endpoint.

**Lines 43-45: Drawing the cannon base.** A gray half-circle.

**Lines 48-72: The simulation loop.** This is the core of the sketch. We loop backward through the projectiles array (backward because we might remove elements during the loop). For each projectile:

1. **Lines 53-54**: Semi-implicit Euler -- update velocity, then position
2. **Line 57**: Store the new position in the trail
3. **Lines 60-66**: Draw the trajectory as a connected line through all trail points
4. **Lines 69-71**: Draw the cannonball itself
5. **Lines 74-76**: If the ball has gone off-screen, remove it from the array

**Lines 86-100: `mousePressed()`.** When the user clicks, we calculate the aim angle, create a new projectile object with initial position (end of barrel) and velocity (based on angle and speed), and add it to the array.

---

## 1.15 Experimenting: What to Change

The best way to learn is to modify working code and observe the results. Here are some experiments to try:

### Change Gravity

```js
let gravity = 0.1;   // Lower gravity -- floaty, moon-like
let gravity = 0.5;   // Higher gravity -- projectiles drop fast
let gravity = -0.1;  // Negative gravity -- things fall upward!
```

### Change Launch Speed

```js
let launchSpeed = 4;   // Slow launch -- short range
let launchSpeed = 15;  // Fast launch -- long range
```

### Add Air Resistance

Insert this before the Euler integration step, inside the simulation loop:

```js
let drag = 0.005;
p.vx = p.vx * (1 - drag);
p.vy = p.vy * (1 - drag);
```

Air resistance slows the projectile proportionally to its velocity. This causes the trajectory to deviate from a perfect parabola -- it drops more steeply.

### Add Bounce

After the position update, add:

```js
if (p.y > height - 36) {
  p.y = height - 36;
  p.vy = -p.vy * 0.65;  // Reverse vertical velocity, lose 35% energy
  p.vx = p.vx * 0.9;    // Friction on bounce
}
```

### Add a Target

Draw a red rectangle somewhere on the canvas and check if the ball hits it:

```js
// In draw(), after drawing the ground:
fill(200, 50, 50);
rect(450, height - 60, 30, 30);

// Inside the simulation loop, after updating position:
if (p.x > 450 && p.x < 480 && p.y > height - 60 && p.y < height - 30) {
  // Hit! Do something -- change color, increment score, etc.
  fill(0, 255, 0);
  rect(450, height - 60, 30, 30);
}
```

---

## 1.16 What Is Generative Art?

Before we close this chapter, let us place our work in a broader context.

The ballistics simulation we just built is a computational model -- a simplified representation of projectile motion, expressed as code. It is also, in a sense, a tiny piece of generative art. You designed a system of rules (gravity, velocity, Euler integration), and the system generates visual output (arcing trajectories) that you did not draw by hand.

**Generative art** takes this idea much further. A generative artist designs a system -- a set of rules, algorithms, and parameters -- and lets the computer execute that system to produce art. The artist controls the system, not the individual marks.

This course will teach you to build increasingly sophisticated systems: particle simulations, flocking behaviors, fractal growth, fluid dynamics, shader effects. Each system will be both a computational model (a simplified representation of some phenomenon) and a potential generative artwork (a visually compelling output of that model).

The tools of this course -- p5.js for high-level creative coding and GLSL for GPU-accelerated visual effects -- give you the vocabulary to express your creative ideas as code.

---

## 1.17 Summary

In this chapter, you learned:

1. **What programming is**: writing precise instructions for a computer
2. **The p5.js web editor**: your coding environment, requiring no installation
3. **`setup()` and `draw()`**: the two core functions; setup runs once, draw loops forever
4. **The coordinate system**: (0,0) is the top-left; y increases downward
5. **Basic shapes**: `circle()`, `rect()`, `line()`, `point()`, `ellipse()`, `triangle()`
6. **Color**: `fill()`, `stroke()`, `noFill()`, `noStroke()`, `strokeWeight()`
7. **Variables**: named containers for values that can change over time
8. **Built-in variables**: `mouseX`, `mouseY`, `width`, `height`, `frameCount`
9. **Conditional logic**: `if` statements for decision-making
10. **Functions**: named blocks of reusable code
11. **Modeling and simulation**: representing the world as simplified computational rules
12. **Position, velocity, and acceleration**: the three quantities of motion
13. **Semi-implicit Euler integration**: updating velocity first, then position
14. **Arrays and objects**: storing collections of data (trail points, multiple projectiles)
15. **Generative art**: designing systems that produce visual output

---

## 1.18 Exercises

### Exercise 1: Concentric Circles
Draw five concentric circles (circles with the same center but different diameters) at the center of the canvas. Give each a different color. Do not use any animation -- just draw them in `draw()` with a static `background()`.

### Exercise 2: Moving Square
Create a square that moves from left to right across the canvas. When it reaches the right edge, it should reappear on the left side. Use a variable for the x position and increment it each frame.

### Exercise 3: Mouse Follower with Trail
Create a circle that follows the mouse. Do not call `background()` in `draw()`, so previous frames are not erased. Use a semi-transparent fill so the overlapping circles create a visual trail.

### Exercise 4: Bouncing Ball
Create a ball that bounces off all four edges of the canvas. You will need:
- Variables for position (`x`, `y`) and velocity (`vx`, `vy`)
- `if` statements to check when the ball hits an edge
- Reversing the appropriate velocity component when a collision occurs

### Exercise 5: Modify the Cannon
Starting from the complete cannon simulation in section 1.14, make the following changes:
1. Add ground-bounce behavior so balls bounce when they hit the ground (with energy loss)
2. Add air resistance (a drag force proportional to velocity)
3. Change `launchSpeed` so that it varies with the distance between the mouse and the cannon (farther mouse = faster launch)

### Exercise 6: Gravity Painter
Create a sketch where clicking the mouse launches a ball upward from the click position. The ball should arc under gravity and leave a colorful trail. Each click should create a new ball with a random color. Let all the balls accumulate on screen, creating a generative painting of parabolic arcs.

Hint: use the projectiles array approach from the cannon simulation, but launch from `mouseX, mouseY` with an upward initial velocity.

### Exercise 7 (Challenge): Two-Body Problem
Create two balls that are attracted to each other. Instead of constant gravity pulling downward, each ball accelerates toward the other. The force of attraction should be proportional to 1 / (distance^2), like real gravity. Start the balls with some sideways velocity so they orbit each other instead of colliding immediately.

Hint: Calculate the distance and angle between the balls each frame, then use `cos(angle)` and `sin(angle)` to decompose the attraction force into x and y components.

---

## 1.19 Glossary

| Term | Definition |
|---|---|
| **Canvas** | The rectangular drawing surface in p5.js, created with `createCanvas()` |
| **Frame** | A single execution of the `draw()` function; one "picture" in the animation |
| **FPS** | Frames per second; how many times `draw()` runs per second (default: 60) |
| **Variable** | A named container for a value |
| **Function** | A named block of code that performs a task |
| **Argument** | A value passed to a function |
| **Parameter** | A placeholder in a function definition that receives an argument |
| **Array** | An ordered list of values |
| **Object** | A collection of named values (properties) |
| **Model** | A simplified representation of something |
| **Simulation** | Running a model over time to observe its behavior |
| **Numerical integration** | Approximating continuous change with discrete time steps |
| **Euler integration** | The simplest numerical integration method |
| **Semi-implicit Euler** | A variant that updates velocity before position, improving accuracy |
| **Position** | Where something is (x, y coordinates) |
| **Velocity** | How fast something is moving and in what direction (pixels per frame) |
| **Acceleration** | The rate of change of velocity (pixels per frame per frame) |
| **Deterministic** | Producing the same output for the same input, every time |
| **Generative art** | Art produced by an autonomous system designed by the artist |
