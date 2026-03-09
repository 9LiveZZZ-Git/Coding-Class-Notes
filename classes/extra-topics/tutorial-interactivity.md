# Tutorial: Interactivity in p5.js

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Overview

Interactivity is what transforms a generative sketch from something you watch into something you experience. p5.js provides a rich set of tools for responding to mouse actions, keyboard input, touch events, and GUI controls. This tutorial covers all of them with complete working examples.

---

## Mouse Variables

p5.js automatically tracks the mouse and gives you these built-in variables:

| Variable | Description |
|---|---|
| `mouseX` | Current x position of the mouse on the canvas |
| `mouseY` | Current y position of the mouse on the canvas |
| `pmouseX` | Previous frame's mouseX |
| `pmouseY` | Previous frame's mouseY |
| `mouseIsPressed` | `true` if any mouse button is currently held down |
| `mouseButton` | Which button: `LEFT`, `RIGHT`, or `CENTER` |
| `winMouseX` | Mouse x relative to the entire window |
| `winMouseY` | Mouse y relative to the entire window |

### Mouse Speed

You can compute the mouse speed using the difference between current and previous positions:

```js
function draw() {
  background(220);
  let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
  let size = map(speed, 0, 50, 5, 80);
  fill(0);
  circle(mouseX, mouseY, size);
}
```

---

## Mouse Event Functions

p5.js calls these functions automatically when mouse events occur. Define them in your sketch and they will be called at the right time.

### `mousePressed()`

Called once when a mouse button is pressed down.

```js
function mousePressed() {
  print("Mouse pressed at " + mouseX + ", " + mouseY);
  print("Button: " + mouseButton); // LEFT, RIGHT, or CENTER
}
```

### `mouseReleased()`

Called once when a mouse button is released.

```js
function mouseReleased() {
  print("Mouse released");
}
```

### `mouseDragged()`

Called repeatedly while the mouse is pressed and moving.

```js
function mouseDragged() {
  fill(0);
  noStroke();
  circle(mouseX, mouseY, 10);
}
```

### `mouseMoved()`

Called repeatedly while the mouse is moving and no button is pressed.

```js
function mouseMoved() {
  // React to mouse hover
}
```

### `mouseClicked()`

Called once after `mousePressed` and `mouseReleased` happen on the same element. Use `mousePressed` in most cases -- `mouseClicked` is mainly useful for distinguishing clicks from drags.

### `doubleClicked()`

Called when the mouse is double-clicked.

```js
function doubleClicked() {
  // Reset the sketch
  background(255);
}
```

### `mouseWheel(event)`

Called when the mouse wheel is scrolled. The `event` parameter contains `event.delta` which is positive for scrolling down and negative for scrolling up.

```js
let zoom = 1.0;

function mouseWheel(event) {
  zoom -= event.delta * 0.001;
  zoom = constrain(zoom, 0.1, 5.0);
  return false; // Prevent page scrolling
}
```

---

## Complete Example: Drawing App

```js
let strokes = [];
let currentStroke = null;
let brushSize = 5;
let brushColor;

function setup() {
  createCanvas(600, 400);
  background(255);
  brushColor = color(0);
}

function draw() {
  background(255);

  // Draw all saved strokes
  for (let stroke of strokes) {
    stroke.forEach((p, i) => {
      if (i > 0) {
        strokeWeight(p.size);
        stroke(p.col);  // Note: variable shadowing -- be careful
        line(stroke[i - 1].x, stroke[i - 1].y, p.x, p.y);
      }
    });
  }

  // Draw instructions
  noStroke();
  fill(100);
  textSize(12);
  text("Draw with mouse | Scroll to change size | Press 'c' to clear", 10, height - 10);
  text("Brush size: " + brushSize, 10, 20);
}

// Better version avoiding the variable shadowing issue above:
function drawAllStrokes() {
  for (let s of strokes) {
    for (let i = 1; i < s.length; i++) {
      strokeWeight(s[i].size);
      stroke(red(s[i].col), green(s[i].col), blue(s[i].col));
      line(s[i - 1].x, s[i - 1].y, s[i].x, s[i].y);
    }
  }
}

function mousePressed() {
  currentStroke = [];
  currentStroke.push({
    x: mouseX, y: mouseY,
    size: brushSize,
    col: brushColor
  });
}

function mouseDragged() {
  if (currentStroke) {
    currentStroke.push({
      x: mouseX, y: mouseY,
      size: brushSize,
      col: brushColor
    });
  }
}

function mouseReleased() {
  if (currentStroke && currentStroke.length > 1) {
    strokes.push(currentStroke);
  }
  currentStroke = null;
}

function mouseWheel(event) {
  brushSize -= event.delta * 0.05;
  brushSize = constrain(brushSize, 1, 50);
  return false;
}

function keyPressed() {
  if (key === 'c') {
    strokes = [];
  }
}
```

---

## Keyboard Events

### `keyPressed()`

Called once when any key is pressed. The key's value is available through two variables:

- **`key`** -- the character that was typed (e.g., `"a"`, `"B"`, `"3"`, `" "`)
- **`keyCode`** -- a numeric code, useful for special keys

```js
function keyPressed() {
  if (key === 'r') {
    // Reset
    background(255);
  }

  if (key === ' ') {
    // Spacebar
    paused = !paused;
  }

  // Special keys use keyCode
  if (keyCode === UP_ARROW) {
    player.y -= 10;
  }
  if (keyCode === DOWN_ARROW) {
    player.y += 10;
  }
  if (keyCode === LEFT_ARROW) {
    player.x -= 10;
  }
  if (keyCode === RIGHT_ARROW) {
    player.x += 10;
  }

  if (keyCode === ENTER || keyCode === RETURN) {
    // Submit
  }

  if (keyCode === ESCAPE) {
    // Cancel
  }
}
```

### `keyReleased()`

Called once when a key is released.

```js
function keyReleased() {
  print("Released: " + key);
}
```

### `keyTyped()`

Similar to `keyPressed` but only fires for keys that produce a character. Does not fire for arrow keys, Shift, Ctrl, etc.

### `keyIsDown(keyCode)` -- Continuous Key Detection

`keyPressed` fires once. If you want to check if a key is currently held down (for smooth movement), use `keyIsDown()` inside `draw()`.

```js
let px = 200, py = 200;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Smooth movement with held keys
  let speed = 3;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65))  px -= speed; // 65 = 'A'
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) px += speed; // 68 = 'D'
  if (keyIsDown(UP_ARROW) || keyIsDown(87))    py -= speed; // 87 = 'W'
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83))  py += speed; // 83 = 'S'

  fill(100, 150, 255);
  noStroke();
  circle(px, py, 30);
}
```

### `keyIsPressed`

A boolean variable that is `true` whenever any key is held down. Useful for modifier-style interactions.

---

## Complete Example: Keyboard-Controlled Character

```js
let player;

function setup() {
  createCanvas(600, 400);
  player = {
    x: width / 2,
    y: height / 2,
    speed: 4,
    size: 20,
    color: [100, 200, 100],
    trail: []
  };
}

function draw() {
  background(30);

  // Movement
  if (keyIsDown(LEFT_ARROW))  player.x -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if (keyIsDown(UP_ARROW))    player.y -= player.speed;
  if (keyIsDown(DOWN_ARROW))  player.y += player.speed;

  // Keep player on screen
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 0, height);

  // Record trail
  player.trail.push({ x: player.x, y: player.y });
  if (player.trail.length > 100) player.trail.shift();

  // Draw trail
  noFill();
  for (let i = 1; i < player.trail.length; i++) {
    let alpha = map(i, 0, player.trail.length, 0, 200);
    stroke(100, 200, 100, alpha);
    strokeWeight(map(i, 0, player.trail.length, 1, 3));
    let t = player.trail;
    line(t[i - 1].x, t[i - 1].y, t[i].x, t[i].y);
  }

  // Draw player
  fill(player.color);
  noStroke();
  circle(player.x, player.y, player.size);

  // Instructions
  fill(200);
  noStroke();
  textSize(12);
  text("Arrow keys to move", 10, 20);
}

function keyPressed() {
  // Change color with number keys
  if (key === '1') player.color = [255, 100, 100];
  if (key === '2') player.color = [100, 255, 100];
  if (key === '3') player.color = [100, 100, 255];
  if (key === '4') player.color = [255, 255, 100];
}
```

---

## Touch Events

For mobile devices and touchscreens, p5.js provides touch-specific events and variables.

### Touch Variables

| Variable | Description |
|---|---|
| `touches` | Array of touch objects, each with `.x` and `.y` |

### Touch Functions

```js
function touchStarted() {
  // Called when a finger touches the screen
  // touches[] array is available
  for (let t of touches) {
    print("Touch at " + t.x + ", " + t.y);
  }
  return false; // Prevent default browser behavior
}

function touchMoved() {
  // Called when a finger moves on the screen
  return false;
}

function touchEnded() {
  // Called when a finger is lifted
  return false;
}
```

### Multi-Touch Example

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30);

  // Draw a circle for each active touch
  for (let i = 0; i < touches.length; i++) {
    let hue = map(i, 0, 5, 0, 360);
    colorMode(HSB, 360, 100, 100);
    fill(hue, 80, 90);
    noStroke();
    circle(touches[i].x, touches[i].y, 80);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(i, touches[i].x, touches[i].y);
  }

  colorMode(RGB, 255);
  fill(200);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  text("Active touches: " + touches.length, 10, 10);
}

function touchStarted() {
  return false;
}
```

**Important**: Return `false` from touch event functions to prevent the browser from scrolling or performing other default actions.

---

## GUI Elements: Sliders, Buttons, and Input Fields

p5.js can create HTML elements that interact with your sketch.

### Sliders: `createSlider(min, max, default, step)`

```js
let sizeSlider, speedSlider;

function setup() {
  createCanvas(400, 400);
  sizeSlider = createSlider(5, 100, 30, 1);
  sizeSlider.position(10, height + 10);

  speedSlider = createSlider(0.1, 5, 1, 0.1);
  speedSlider.position(10, height + 40);
}

function draw() {
  background(220);

  let size = sizeSlider.value();
  let speed = speedSlider.value();

  let x = width / 2 + cos(frameCount * speed * 0.05) * 150;
  let y = height / 2 + sin(frameCount * speed * 0.05) * 100;

  fill(100, 150, 255);
  noStroke();
  circle(x, y, size);

  fill(0);
  noStroke();
  textSize(12);
  text("Size: " + size, 160, height + 25);
  text("Speed: " + speed.toFixed(1), 160, height + 55);
}
```

### Buttons: `createButton(label)`

```js
let resetButton, colorButton;
let bgColor;

function setup() {
  createCanvas(400, 300);
  bgColor = color(220);

  resetButton = createButton("Clear Canvas");
  resetButton.position(10, height + 10);
  resetButton.mousePressed(() => {
    background(bgColor);
  });

  colorButton = createButton("Random Color");
  colorButton.position(120, height + 10);
  colorButton.mousePressed(() => {
    bgColor = color(random(255), random(255), random(255));
  });
}

function draw() {
  // Semi-transparent background for trails
  if (mouseIsPressed) {
    fill(0);
    noStroke();
    circle(mouseX, mouseY, 10);
  }
}
```

### Text Input: `createInput(default)`

```js
let nameInput, greetButton;
let message = "";

function setup() {
  createCanvas(400, 200);

  nameInput = createInput("your name");
  nameInput.position(10, height + 10);

  greetButton = createButton("Greet");
  greetButton.position(200, height + 10);
  greetButton.mousePressed(() => {
    message = "Hello, " + nameInput.value() + "!";
  });
}

function draw() {
  background(30);
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2);
}
```

### Select (Dropdown): `createSelect()`

```js
let shapeSelect;

function setup() {
  createCanvas(400, 400);

  shapeSelect = createSelect();
  shapeSelect.position(10, height + 10);
  shapeSelect.option("Circle");
  shapeSelect.option("Square");
  shapeSelect.option("Triangle");
  shapeSelect.selected("Circle");
}

function draw() {
  background(220);
  fill(100, 150, 255);
  noStroke();

  let shape = shapeSelect.value();
  if (shape === "Circle") {
    circle(width / 2, height / 2, 100);
  } else if (shape === "Square") {
    rectMode(CENTER);
    rect(width / 2, height / 2, 80, 80);
  } else if (shape === "Triangle") {
    triangle(
      width / 2, height / 2 - 50,
      width / 2 - 50, height / 2 + 40,
      width / 2 + 50, height / 2 + 40
    );
  }
}
```

### Color Picker: `createColorPicker(default)`

```js
let colorPicker;

function setup() {
  createCanvas(400, 400);
  colorPicker = createColorPicker("#ff0000");
  colorPicker.position(10, height + 10);
}

function draw() {
  background(220);
  fill(colorPicker.color());
  noStroke();
  circle(width / 2, height / 2, 150);
}
```

### Styling GUI Elements

```js
let slider = createSlider(0, 100, 50);
slider.position(10, 10);
slider.style("width", "200px");
slider.style("accent-color", "#ff6600");
```

---

## Responsive Canvas: `windowResized()`

When the browser window is resized, p5.js calls `windowResized()` if you define it. Use this to resize your canvas.

```js
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text(width + " x " + height, width / 2, height / 2);

  // Draw a circle that scales with the canvas
  let size = min(width, height) * 0.3;
  noFill();
  stroke(100, 200, 255);
  strokeWeight(2);
  circle(width / 2, height / 2, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
```

---

## Complete Example: Interactive Parameter Explorer

This sketch combines sliders, buttons, keyboard input, and mouse interaction to create an interactive particle system.

```js
let particles = [];
let gravitySlider, frictionSlider, sizeSlider;
let pauseButton, clearButton;
let paused = false;

function setup() {
  createCanvas(700, 500);

  // Create labeled sliders
  createP("Gravity:").position(10, height + 5).style("color", "white").style("margin", "0");
  gravitySlider = createSlider(0, 0.5, 0.1, 0.01);
  gravitySlider.position(80, height + 10);
  gravitySlider.style("width", "120px");

  createP("Friction:").position(220, height + 5).style("color", "white").style("margin", "0");
  frictionSlider = createSlider(0.9, 1.0, 0.99, 0.001);
  frictionSlider.position(290, height + 10);
  frictionSlider.style("width", "120px");

  createP("Size:").position(430, height + 5).style("color", "white").style("margin", "0");
  sizeSlider = createSlider(2, 30, 8, 1);
  sizeSlider.position(475, height + 10);
  sizeSlider.style("width", "120px");

  pauseButton = createButton("Pause");
  pauseButton.position(10, height + 45);
  pauseButton.mousePressed(() => {
    paused = !paused;
    pauseButton.html(paused ? "Resume" : "Pause");
  });

  clearButton = createButton("Clear");
  clearButton.position(80, height + 45);
  clearButton.mousePressed(() => {
    particles = [];
  });
}

function draw() {
  background(20, 20, 30, 40);

  let gravity = gravitySlider.value();
  let friction = frictionSlider.value();
  let size = sizeSlider.value();

  // Spawn particles on mouse press
  if (mouseIsPressed && mouseY < height) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: mouseX,
        y: mouseY,
        vx: random(-4, 4),
        vy: random(-6, -1),
        size: size + random(-2, 2),
        hue: frameCount % 360,
        life: 300
      });
    }
  }

  colorMode(HSB, 360, 100, 100, 100);

  if (!paused) {
    for (let p of particles) {
      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      // Bounce off floor
      if (p.y > height - p.size / 2) {
        p.y = height - p.size / 2;
        p.vy *= -0.7;
      }
      // Bounce off walls
      if (p.x < p.size / 2 || p.x > width - p.size / 2) {
        p.vx *= -1;
      }
    }

    particles = particles.filter(p => p.life > 0);
  }

  // Draw
  for (let p of particles) {
    let alpha = map(p.life, 0, 300, 0, 90);
    noStroke();
    fill(p.hue, 80, 90, alpha);
    circle(p.x, p.y, p.size);
  }

  // Info
  colorMode(RGB);
  fill(200);
  noStroke();
  textSize(12);
  text("Click to spawn particles | " + particles.length + " active", 10, 20);
  text("Gravity: " + gravity.toFixed(2) + "  Friction: " + friction.toFixed(3) + "  Size: " + size, 10, 40);
}

function keyPressed() {
  if (key === ' ') {
    paused = !paused;
    pauseButton.html(paused ? "Resume" : "Pause");
  }
  if (key === 'c') {
    particles = [];
  }
}
```

---

## Preventing Default Browser Behavior

By default, the browser handles certain events itself (right-click context menu, spacebar scrolling, etc.). To prevent this in your sketch:

```js
// Prevent context menu on right-click
function mousePressed() {
  // Your code here
  return false; // Prevents default browser behavior
}

// Prevent arrow keys from scrolling the page
function keyPressed() {
  if ([32, 37, 38, 39, 40].includes(keyCode)) {
    return false; // Space and arrow keys
  }
}
```

For the canvas element specifically:

```js
function setup() {
  let canvas = createCanvas(400, 400);
  canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault());
}
```

---

## Hit Detection: Is the Mouse Over a Shape?

p5.js does not have built-in hit detection. You must compute it yourself.

### Circle Hit Detection

```js
function isMouseOverCircle(cx, cy, radius) {
  return dist(mouseX, mouseY, cx, cy) < radius;
}
```

### Rectangle Hit Detection

```js
function isMouseOverRect(rx, ry, rw, rh) {
  return mouseX > rx && mouseX < rx + rw &&
         mouseY > ry && mouseY < ry + rh;
}
```

### Complete Example: Clickable Buttons Drawn on Canvas

```js
let buttons = [];

function setup() {
  createCanvas(400, 300);
  buttons = [
    { x: 50, y: 100, w: 100, h: 40, label: "Red", color: [255, 50, 50] },
    { x: 170, y: 100, w: 100, h: 40, label: "Green", color: [50, 255, 50] },
    { x: 290, y: 100, w: 100, h: 40, label: "Blue", color: [50, 50, 255] }
  ];
}

let currentColor = [200, 200, 200];

function draw() {
  background(currentColor);

  for (let btn of buttons) {
    let hover = isMouseOverRect(btn.x, btn.y, btn.w, btn.h);
    fill(hover ? 200 : 240);
    stroke(0);
    strokeWeight(hover ? 2 : 1);
    rect(btn.x, btn.y, btn.w, btn.h, 5);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
}

function mousePressed() {
  for (let btn of buttons) {
    if (isMouseOverRect(btn.x, btn.y, btn.w, btn.h)) {
      currentColor = btn.color;
    }
  }
}

function isMouseOverRect(rx, ry, rw, rh) {
  return mouseX > rx && mouseX < rx + rw &&
         mouseY > ry && mouseY < ry + rh;
}
```

---

## Exercises

1. **Drag and Drop**: Create several circles on screen. Implement drag and drop so you can click a circle and move it to a new position.

2. **Keyboard Piano**: Draw a row of piano keys. When the user presses keys on the keyboard (a, s, d, f, g, h, j), highlight the corresponding piano key and play a tone (see the sound tutorial).

3. **Zoom and Pan**: Implement a canvas that can be panned by dragging and zoomed with the mouse wheel. Use `translate()` and `scale()` in `draw()`. Draw something interesting (a large grid of dots, a fractal) that rewards exploration.

4. **Control Panel**: Create a sketch with at least 5 sliders, 2 buttons, and a dropdown that together control a generative art piece. Each control should have a visible label and immediately affect the visual output.

---

## Further Reading

- p5.js Events reference: <https://p5js.org/reference/#group-Events>
- p5.js DOM reference: <https://p5js.org/reference/#group-DOM>
- The Coding Train, User Interaction: <https://thecodingtrain.com>
