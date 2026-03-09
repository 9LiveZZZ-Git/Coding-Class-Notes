# Tutorial: Fading Techniques -- GPU and CPU Approaches

## MAT 200C: Computing Arts -- Week 9, March 3

---

## Overview

A common question in creative coding is: *How do I make old drawings gradually disappear?* You want brush strokes, particles, or shapes to fade away gracefully over time, so the canvas acts as a temporary memory rather than an ever-accumulating mess.

There are two fundamental approaches:

1. **GPU Approach**: Use framebuffer feedback with GLSL shaders to pull pixel colors toward a background color each frame.
2. **CPU Approach**: Store shapes in a data structure that "ages" -- elements lose opacity and eventually get removed.

Both are valid. Which one you choose depends on your project.

We will cover:

1. The GPU approach using framebuffers and GLSL
2. The CPU approach using arrays of aging objects
3. When to choose each approach
4. Complete working code for both

---

## Prerequisites

- Familiarity with p5.js (setup/draw, basic drawing)
- For the GPU approach: basic understanding of WEBGL mode and shaders
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Part 1: GPU Approach -- Framebuffer Feedback

### The Concept

The GPU approach works like a camera pointed at its own monitor:

1. Each frame, take the previous frame's image.
2. Slightly darken or fade every pixel (pull colors toward the background color).
3. Draw new content on top.
4. Display the result.
5. Next frame, repeat with this frame's result as input.

The key tool is a **framebuffer** -- an off-screen canvas that persists between frames. We draw the previous frame back into the framebuffer with a slight fade, then draw fresh content on top.

### Why This Works

When you draw the previous frame back with `tint(255, 250)` (alpha = 250 out of 255), each pixel loses a tiny bit of brightness. After many frames, old content gradually approaches black (or whatever your background color is). New content is fully bright, so it stands out against the faded old content.

### Complete GPU Fading Example

This sketch lets you draw with the mouse, and strokes fade away over time:

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  // --- Draw into the framebuffer ---
  fbo.begin();

  // Step 1: Draw the previous frame back with slight transparency
  // This causes all existing content to fade toward black
  push();
  tint(255, 245);  // alpha < 255 causes gradual fade
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Step 2: Draw new content on top (in WEBGL coordinates)
  if (mouseIsPressed) {
    push();
    fill(255, 100, 50);
    noStroke();
    // Convert mouse coordinates to WEBGL coordinates
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    circle(mx, my, 30);
    pop();
  }

  fbo.end();

  // --- Display the framebuffer on screen ---
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

**How it works frame by frame:**

- Frame 1: You draw a circle. The framebuffer contains that circle at full brightness.
- Frame 2: The framebuffer redraws its own content at 245/255 = 96% brightness. That circle is now slightly dimmer. Any new circles are drawn at full brightness.
- Frame 10: The original circle has been multiplied by 0.96 ten times: $0.96^{10} \approx 0.66$. It is noticeably faded.
- Frame 50: $0.96^{50} \approx 0.13$. The circle is barely visible.
- Frame 100: $0.96^{100} \approx 0.017$. The circle is essentially gone.

### Controlling Fade Speed

The alpha value in `tint(255, alpha)` controls the fade speed:

- `tint(255, 254)` -- very slow fade (content lingers for many seconds)
- `tint(255, 245)` -- moderate fade (content fades in 1-2 seconds)
- `tint(255, 230)` -- fast fade (content fades in under a second)
- `tint(255, 200)` -- very fast fade (content disappears quickly)

### GPU Approach with a Custom Shader (Fading Toward a Color)

For more control, use a GLSL shader to fade toward a specific background color (not just black):

```js
let fbo;
let fadeShader;

let vertSrc = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}
`;

let fragSrc = `
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_prev;    // previous frame
uniform vec3 u_bgColor;      // background color to fade toward
uniform float u_fadeAmount;  // how much to fade each frame (0.0 to 1.0)

void main() {
    vec4 prev = texture2D(u_prev, vTexCoord);

    // Linearly interpolate (mix) toward background color
    vec3 faded = mix(prev.rgb, u_bgColor, u_fadeAmount);

    gl_FragColor = vec4(faded, 1.0);
}
`;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
  fadeShader = createShader(vertSrc, fragSrc);
}

function draw() {
  background(0);

  fbo.begin();

  // Step 1: Apply fade shader to pull colors toward background
  shader(fadeShader);
  fadeShader.setUniform("u_prev", fbo);
  fadeShader.setUniform("u_bgColor", [0.05, 0.0, 0.1]); // dark purple
  fadeShader.setUniform("u_fadeAmount", 0.02);
  noStroke();
  rect(0, 0, width, height);

  // Step 2: Switch back to default shader for drawing
  resetShader();

  if (mouseIsPressed) {
    push();
    fill(0, 255, 200);
    noStroke();
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    circle(mx, my, 20);
    pop();
  }

  fbo.end();

  // Display framebuffer
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

The `mix()` function in GLSL performs linear interpolation: `mix(a, b, t) = a * (1.0 - t) + b * t`. When `u_fadeAmount` is 0.02, each pixel moves 2% closer to the background color every frame.

---

## Part 2: CPU Approach -- Aging Data Structures

### The Concept

Instead of manipulating pixels, store every brush stroke (or particle, or shape) as an object in an array. Each object has an "age" or "lifetime" property. Each frame:

1. Increase the age of every object.
2. Reduce the opacity of each object based on its age.
3. Remove objects that have fully faded out.
4. Draw all surviving objects.

### Why This Approach

- Works in p5.js 2D mode (no WEBGL required).
- You have per-object control: each stroke can have a different fade rate, color, or behavior.
- Easier to implement interactions with individual strokes.
- Good when you have relatively few objects (hundreds to low thousands).

### Complete CPU Fading Example

```js
let strokes = [];

function setup() {
  createCanvas(600, 600);
  background(20, 0, 40); // dark purple background
}

function draw() {
  background(20, 0, 40);

  // Add new strokes when mouse is pressed
  if (mouseIsPressed) {
    strokes.push({
      x: mouseX,
      y: mouseY,
      size: random(10, 40),
      r: random(100, 255),
      g: random(50, 200),
      b: random(150, 255),
      age: 0,
      maxAge: 120 // fade out over 120 frames (2 seconds at 60fps)
    });
  }

  // Update and draw all strokes
  for (let i = strokes.length - 1; i >= 0; i--) {
    let s = strokes[i];
    s.age++;

    // Calculate opacity based on age
    let lifeRatio = 1.0 - s.age / s.maxAge;
    let alpha = lifeRatio * 255;

    // Draw the stroke
    noStroke();
    fill(s.r, s.g, s.b, alpha);
    circle(s.x, s.y, s.size * lifeRatio); // also shrink as it fades

    // Remove dead strokes
    if (s.age >= s.maxAge) {
      strokes.splice(i, 1);
    }
  }
}
```

**Key details:**

- We iterate backward (`i--`) so that `splice` does not skip elements.
- `lifeRatio` goes from 1.0 (just born) to 0.0 (about to die).
- We multiply both the alpha and the size by `lifeRatio`, so strokes shrink as they fade.
- Dead strokes are removed from the array to save memory.

### A More Sophisticated Version: Fading Trails

This version creates a trail of points behind the mouse, forming a snake-like path:

```js
let trail = [];
let maxTrailLength = 200;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(10);

  // Add the current mouse position to the trail
  trail.push({
    x: mouseX,
    y: mouseY
  });

  // Keep the trail at a maximum length
  if (trail.length > maxTrailLength) {
    trail.shift(); // remove the oldest point
  }

  // Draw the trail with fading
  noFill();
  for (let i = 1; i < trail.length; i++) {
    let alpha = map(i, 0, trail.length, 0, 255);
    let weight = map(i, 0, trail.length, 1, 8);

    stroke(0, 200, 255, alpha);
    strokeWeight(weight);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }
}
```

This approach uses a fixed-size queue (shift old, push new) rather than an aging mechanism. The oldest points are at the beginning of the array and get the lowest alpha. The newest points are at the end and get full alpha.

### Object-Oriented Version with a Particle Class

For more complex scenarios, wrap the aging logic in a class:

```js
let particles = [];

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(0, 0, 0, 25); // slight clear each frame for extra smoothness

  // Spawn particles at mouse position
  if (mouseIsPressed) {
    for (let i = 0; i < 3; i++) {
      particles.push(new FadingParticle(mouseX, mouseY));
    }
  }

  // Update and draw particles (iterate backward for safe removal)
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class FadingParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.size = random(5, 20);
    this.color = [random(150, 255), random(50, 150), random(200, 255)];
    this.life = 1.0;      // starts at 1.0, decreases to 0.0
    this.decay = random(0.005, 0.02); // how fast it fades
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;      // gravity
    this.life -= this.decay;
  }

  display() {
    noStroke();
    let alpha = this.life * 255;
    fill(this.color[0], this.color[1], this.color[2], alpha);
    circle(this.x, this.y, this.size * this.life);
  }

  isDead() {
    return this.life <= 0;
  }
}
```

---

## Part 3: Choosing Between GPU and CPU

| Factor | GPU Approach | CPU Approach |
|---|---|---|
| **Performance** | Excellent for millions of pixels | Good for hundreds to low thousands of objects |
| **Mode** | Requires WEBGL | Works in 2D mode |
| **Fade quality** | Smooth, uniform pixel-level fading | Per-object fading, can be chunkier |
| **Control** | Hard to fade individual elements differently | Easy per-object control |
| **Memory** | Fixed (framebuffer size) | Grows with number of objects |
| **Complexity** | Requires shader knowledge | Simple JavaScript |
| **Best for** | Full-screen effects, painting tools, generative textures | Particle systems, discrete shapes, interactive objects |

### Hybrid Approach

You can combine both: use the GPU framebuffer for the background fade, and the CPU for managing individual objects. For example, draw CPU-managed particles into a framebuffer that fades:

```js
let fbo;
let particles = [];

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  // Spawn particles
  if (mouseIsPressed) {
    particles.push(new FadingParticle(mouseX - width / 2, mouseY - height / 2));
  }

  fbo.begin();

  // Fade the framebuffer
  push();
  tint(255, 248);
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Draw particles into the framebuffer
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  fbo.end();

  texture(fbo);
  noStroke();
  plane(width, height);
}
```

This gives you the best of both worlds: the smooth pixel-level fading of the GPU approach, plus the per-object control of the CPU approach.

---

## Exercises

1. **Adjust the fade rate**: Modify the GPU example so the fade rate responds to the mouse's X position (left = slow fade, right = fast fade).

2. **Color fading**: In the CPU example, instead of fading to transparent, make each particle change color as it ages (e.g., from white to orange to red to black).

3. **Multiple brush types**: Create a drawing tool with 3 brush types (press 1, 2, 3 to switch). Each brush should have a different fade rate and particle behavior.

4. **Audio-reactive fading**: Load a sound file and use its amplitude to control the fade rate. Loud moments should leave longer-lasting marks.

---

## Further Resources

- p5.js Framebuffer Reference: <https://p5js.org/reference/p5/createFramebuffer/>
- GLSL `mix()` function: <https://thebookofshaders.com/glossary/?search=mix>
- Week 3 Tutorial on Frame Feedback: see `week-03-jan-22/tutorial-glsl-frame-feedback.md`
