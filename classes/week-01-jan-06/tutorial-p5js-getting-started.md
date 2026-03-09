# Tutorial: Getting Started with p5.js

## MAT 200C: Computing Arts -- Week 1, January 6

---

## What Is p5.js?

p5.js is a JavaScript library designed to make coding accessible for artists, designers, educators, and beginners. It is a modern reimagining of Processing, a programming environment created in 2001 at the MIT Media Lab by Casey Reas and Ben Fry. Where Processing uses Java, p5.js runs in any web browser using JavaScript.

With p5.js you can:

- Draw shapes, lines, and colors on a canvas
- Animate things by redrawing frames many times per second
- Respond to mouse clicks, keyboard input, and other interactions
- Create generative art, simulations, data visualizations, and interactive experiences

The key philosophy of p5.js is that programming should be approachable. You do not need a computer science degree to start making things.

---

## The p5.js Web Editor

The fastest way to start writing p5.js code is the **p5.js Web Editor**, available at:

**[https://editor.p5js.org](https://editor.p5js.org)**

When you open the editor, you will see:

1. **Code Panel** (left side) -- where you type your JavaScript code
2. **Preview Panel** (right side) -- where your sketch appears when you run it
3. **Play/Stop Button** (top left, the triangle icon) -- click this to run your sketch
4. **Console** (bottom) -- where error messages and `console.log()` output appear

You do not need to install anything. You do not need to configure anything. Just open the URL, type code, and click Play.

### Your First Sketch

When you open the editor, you will see default code that looks like this:

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

Click the Play button (the triangle). You will see a gray square appear in the preview panel. That gray square is your **canvas** -- the area where everything you draw will appear.

Congratulations. You have just run a p5.js sketch.

---

## The Two Core Functions: `setup()` and `draw()`

Every p5.js sketch revolves around two special functions that p5.js calls for you automatically.

### `setup()`

This function runs **exactly once**, right when your sketch starts. Use it to do things that only need to happen one time, like creating the canvas or setting initial values.

```js
function setup() {
  createCanvas(400, 400);  // Create a 400x400 pixel canvas
}
```

### `draw()`

This function runs **over and over again**, approximately 60 times per second (60 frames per second, or 60 fps). Each time `draw()` runs, it draws one "frame" of your sketch. This is what makes animation possible.

```js
function draw() {
  background(220);  // Paint the entire canvas light gray
}
```

Think of it like a flipbook: `draw()` creates one page of the flipbook every ~16 milliseconds, and p5.js flips through those pages rapidly to create the illusion of motion.

### Why `background()` Matters

If you do not call `background()` at the start of `draw()`, each new frame will be drawn **on top of** the previous frame. Sometimes that is exactly what you want (like drawing a trail). Often, though, you want to start each frame fresh, so you call `background()` to "erase" the canvas.

---

## The Coordinate System

Before you draw anything, you need to understand how p5.js locates points on the canvas.

p5.js uses a coordinate system where:

- **x** increases as you move **right**
- **y** increases as you move **down**
- The **origin (0, 0)** is at the **top-left corner** of the canvas

This is different from the math coordinate system you may be used to, where y increases going up. In p5.js (and most computer graphics), y increases going **down**.

```
(0,0) -----> x increases
  |
  |
  v
  y increases
```

So on a 400x400 canvas:

| Position | Coordinates |
|---|---|
| Top-left corner | (0, 0) |
| Top-right corner | (400, 0) |
| Bottom-left corner | (0, 400) |
| Bottom-right corner | (400, 400) |
| Center | (200, 200) |

---

## Drawing Basic Shapes

### `point(x, y)`

Draws a single pixel at position (x, y).

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  strokeWeight(8);     // Make the point visible (8 pixels wide)
  point(200, 200);     // Draw a point at the center
}
```

### `line(x1, y1, x2, y2)`

Draws a straight line from point (x1, y1) to point (x2, y2).

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  line(50, 50, 350, 350);   // Diagonal line from top-left area to bottom-right area
  line(50, 350, 350, 50);   // Diagonal line the other way (makes an X)
}
```

### `rect(x, y, w, h)`

Draws a rectangle. By default, (x, y) is the **top-left corner** of the rectangle, `w` is the width, and `h` is the height.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  rect(100, 100, 200, 150);  // Rectangle at (100,100), 200 wide, 150 tall
}
```

If you want (x, y) to be the **center** of the rectangle instead, call `rectMode(CENTER)` in your `setup()`.

### `circle(x, y, d)`

Draws a circle centered at (x, y) with diameter `d`.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(200, 200, 100);  // Circle centered at (200,200) with diameter 100
}
```

Note: the third argument is the **diameter**, not the radius. A circle with diameter 100 has a radius of 50.

### `ellipse(x, y, w, h)`

Draws an ellipse (oval) centered at (x, y) with width `w` and height `h`. If `w` equals `h`, you get a circle.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  ellipse(200, 200, 160, 80);  // Wide oval
}
```

### `triangle(x1, y1, x2, y2, x3, y3)`

Draws a triangle between three points.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  triangle(200, 50, 50, 350, 350, 350);  // An upward-pointing triangle
}
```

---

## Color: `fill()`, `stroke()`, `noFill()`, `noStroke()`

Every shape in p5.js has two parts that can be colored independently:

- **Fill** -- the interior color of the shape
- **Stroke** -- the outline (border) color of the shape

### Setting Colors

Colors can be specified in several ways:

```js
// Grayscale: one number from 0 (black) to 255 (white)
fill(0);        // Black fill
fill(255);      // White fill
fill(128);      // Medium gray fill

// RGB: three numbers (Red, Green, Blue), each from 0 to 255
fill(255, 0, 0);    // Pure red
fill(0, 255, 0);    // Pure green
fill(0, 0, 255);    // Pure blue
fill(255, 255, 0);  // Yellow (red + green)

// RGBA: four numbers -- the fourth is alpha (transparency), 0-255
fill(255, 0, 0, 128);  // Semi-transparent red
```

### `fill(r, g, b)` and `stroke(r, g, b)`

`fill()` sets the color for the inside of shapes. `stroke()` sets the color for outlines.

These functions are **stateful** -- once you set a fill or stroke, it applies to every shape drawn after that point until you change it.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Red circle with blue outline
  fill(255, 0, 0);       // Red fill
  stroke(0, 0, 255);     // Blue stroke
  strokeWeight(3);        // 3-pixel-wide outline
  circle(150, 200, 100);

  // Green rectangle with no outline
  fill(0, 255, 0);       // Green fill
  noStroke();             // No outline
  rect(220, 150, 100, 100);
}
```

### `noFill()` and `noStroke()`

`noFill()` makes shapes transparent (no interior color -- only the outline is visible).
`noStroke()` removes the outline.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Circle with no fill, only outline
  noFill();
  stroke(0);
  strokeWeight(2);
  circle(200, 200, 150);

  // Rectangle with fill but no outline
  fill(100, 150, 255);
  noStroke();
  rect(50, 50, 80, 80);
}
```

### `strokeWeight(weight)`

Controls how thick the outline is. The default is 1 pixel.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  strokeWeight(1);
  line(50, 50, 350, 50);     // Thin line

  strokeWeight(4);
  line(50, 120, 350, 120);   // Medium line

  strokeWeight(10);
  line(50, 200, 350, 200);   // Thick line

  strokeWeight(20);
  line(50, 300, 350, 300);   // Very thick line
}
```

---

## A Complete Example: Face

Let us put all of these concepts together to draw a simple face.

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);           // White background

  // Head (yellow circle)
  fill(255, 220, 100);       // Light yellow
  stroke(0);                 // Black outline
  strokeWeight(2);
  circle(200, 200, 250);     // Centered, diameter 250

  // Left eye
  fill(255);                 // White
  circle(155, 170, 50);      // White of eye
  fill(0);                   // Black
  circle(155, 170, 20);      // Pupil

  // Right eye
  fill(255);
  circle(245, 170, 50);
  fill(0);
  circle(245, 170, 20);

  // Mouth (arc)
  noFill();
  strokeWeight(3);
  arc(200, 230, 120, 80, 0, PI);  // A half-circle arc for a smile
}
```

Copy this into the p5.js web editor and click Play. You should see a simple smiley face.

---

## Making Things Move: Using Variables in `draw()`

Since `draw()` is called over and over, you can use variables that change each frame to create animation.

```js
let x = 0;  // Declare a variable outside both functions

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  circle(x, 200, 50);  // Draw circle at position x

  x = x + 2;           // Move the circle 2 pixels to the right each frame

  // Wrap around: if the circle goes off the right edge, reset to left
  if (x > 420) {
    x = -20;
  }
}
```

This sketch draws a circle that moves from left to right across the canvas, then loops back around.

---

## Responding to the Mouse

p5.js gives you built-in variables for the mouse position:

- `mouseX` -- the current x-coordinate of the mouse
- `mouseY` -- the current y-coordinate of the mouse

```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Draw a circle that follows the mouse
  fill(100, 150, 255);
  noStroke();
  circle(mouseX, mouseY, 60);
}
```

### Drawing a Trail

If you remove the `background()` call, previous frames are not erased, creating a painting/trail effect:

```js
function setup() {
  createCanvas(400, 400);
  background(220);  // Draw background once in setup
}

function draw() {
  // No background() call here -- previous frames persist

  fill(100, 150, 255, 50);  // Semi-transparent blue
  noStroke();
  circle(mouseX, mouseY, 40);
}
```

Move your mouse around the canvas to paint with semi-transparent blue circles.

---

## Useful Built-in Variables

| Variable | Description |
|---|---|
| `mouseX` | Current x position of the mouse |
| `mouseY` | Current y position of the mouse |
| `pmouseX` | Previous frame's x position of the mouse |
| `pmouseY` | Previous frame's y position of the mouse |
| `width` | Width of the canvas |
| `height` | Height of the canvas |
| `frameCount` | Number of frames that have been displayed since the sketch started |
| `mouseIsPressed` | `true` if the mouse button is currently held down |

---

## Useful Built-in Functions

| Function | Description |
|---|---|
| `createCanvas(w, h)` | Creates a canvas of width `w` and height `h` |
| `background(r, g, b)` | Fills the entire canvas with a color |
| `fill(r, g, b)` | Sets the fill color for shapes |
| `stroke(r, g, b)` | Sets the outline color for shapes |
| `noFill()` | Disables fill |
| `noStroke()` | Disables stroke |
| `strokeWeight(w)` | Sets the outline thickness |
| `circle(x, y, d)` | Draws a circle |
| `rect(x, y, w, h)` | Draws a rectangle |
| `ellipse(x, y, w, h)` | Draws an ellipse |
| `line(x1, y1, x2, y2)` | Draws a line |
| `point(x, y)` | Draws a point |
| `triangle(x1, y1, x2, y2, x3, y3)` | Draws a triangle |
| `arc(x, y, w, h, start, stop)` | Draws an arc |
| `text(str, x, y)` | Draws text at a position |
| `textSize(size)` | Sets the text size |
| `random(min, max)` | Returns a random number between min and max |
| `map(value, start1, stop1, start2, stop2)` | Re-maps a number from one range to another |
| `dist(x1, y1, x2, y2)` | Calculates distance between two points |
| `sin(angle)` | Sine function (angle in radians) |
| `cos(angle)` | Cosine function (angle in radians) |

---

## Exercises

1. **Bullseye**: Draw a bullseye target using concentric circles with alternating red and white fills.

2. **Mouse Tracker**: Create a sketch that draws a line from the center of the canvas to the mouse position at all times.

3. **Random Circles**: Each frame, draw a circle at a random position with a random color. Do not clear the background between frames. Let it accumulate into a colorful splatter painting.

4. **Bouncing Ball**: Create a circle that moves across the canvas and bounces off the edges (reverses direction when it hits a wall).

---

## Further Resources

- **p5.js Reference**: [https://p5js.org/reference/](https://p5js.org/reference/) -- Complete documentation for every function
- **p5.js Examples**: [https://p5js.org/examples/](https://p5js.org/examples/) -- Official example sketches
- **The Coding Train** (Daniel Shiffman): [https://thecodingtrain.com/](https://thecodingtrain.com/) -- Video tutorials that are excellent for beginners
