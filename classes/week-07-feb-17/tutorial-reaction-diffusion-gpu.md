# Tutorial: Reaction-Diffusion on the GPU with GLSL Shaders in p5.js

**MAT 200C: Computing Arts -- Week 7, February 17**

---

## Overview

In this tutorial, we will implement the Gray-Scott Reaction-Diffusion system on the GPU using fragment shaders in p5.js. This technique produces mesmerizing organic patterns -- spots, stripes, spirals, and coral-like structures -- at interactive frame rates by leveraging the massive parallelism of the GPU.

We will cover:

1. What Reaction-Diffusion is and how it works
2. Why we move from CPU to GPU
3. Framebuffer ping-pong technique
4. Encoding chemical concentrations in texture channels
5. Writing the Laplacian in a fragment shader
6. Feed/kill rate uniforms for pattern control
7. Mouse interaction to seed chemicals
8. Complete working shader code

---

## Prerequisites

- Familiarity with p5.js and WEBGL mode
- Basic understanding of what shaders are (vertex + fragment programs that run on the GPU)
- Access to the p5.js web editor: <https://editor.p5js.org>

If you have not worked with shaders before, the key concept is: a fragment shader is a small program that runs once for every pixel on the screen, in parallel. It receives the pixel's coordinates and outputs a color. Because the GPU runs thousands of these in parallel, it is enormously faster than a CPU loop over pixels.

---

## Step 1: The Gray-Scott Model

The Gray-Scott model simulates two virtual chemicals, $A$ and $B$, that diffuse across a 2D surface and react with each other. The system is governed by two equations:

$$\frac{\partial A}{\partial t} = D_A \nabla^2 A - A B^2 + f(1 - A)$$

$$\frac{\partial B}{\partial t} = D_B \nabla^2 B + A B^2 - (k + f) B$$

Where:
- $A$ and $B$ are the concentrations of the two chemicals (values between 0 and 1)
- $D_A$ and $D_B$ are diffusion rates ($D_A > D_B$ so $A$ diffuses faster than $B$)
- $\nabla^2$ is the Laplacian operator (measures how different a cell is from its neighbors)
- $f$ is the "feed rate" -- how fast chemical $A$ is added to the system
- $k$ is the "kill rate" -- how fast chemical $B$ is removed from the system
- $A B^2$ is the reaction term -- $A$ is consumed and $B$ is produced when they meet

The interplay of these terms produces wildly different patterns depending on the $f$ and $k$ values.

### Intuition

Think of it this way:

- Chemical $A$ is "food." It is continuously supplied (the feed term).
- Chemical $B$ is an "organism." It feeds on $A$ and produces more of itself ($A B^2$ converts $A$ into $B$).
- $B$ also naturally dies (the kill term).
- Both chemicals spread out (diffuse), but $A$ spreads faster than $B$.

The balance between feeding, killing, reacting, and diffusing produces self-organizing patterns.

### Interesting Parameter Ranges

| Pattern Type | Feed Rate ($f$) | Kill Rate ($k$) |
|-------------|-----------------|-----------------|
| Spots | 0.035 | 0.065 |
| Stripes | 0.025 | 0.060 |
| Spirals | 0.014 | 0.054 |
| Coral/maze | 0.029 | 0.057 |
| Mitosis (dividing cells) | 0.037 | 0.064 |
| Worms | 0.078 | 0.061 |

---

## Step 2: Why GPU?

On the CPU, we would loop over every pixel, compute the Laplacian by reading neighbors, and update the concentrations. For a 512x512 grid, that is 262,144 pixels per frame, each requiring 9 texture reads (for the 3x3 Laplacian kernel). At 60fps, that is about 140 million operations per second -- too much for JavaScript on the CPU.

The GPU solves this by running the computation for every pixel simultaneously. A fragment shader processes each pixel independently in parallel. A modern GPU has thousands of shader cores, so a 512x512 grid is trivial.

---

## Step 3: The Ping-Pong Technique

A shader cannot read from and write to the same texture simultaneously. So we use two textures (framebuffers) that alternate roles:

1. **Frame N**: Read from Texture A, compute new values, write to Texture B.
2. **Frame N+1**: Read from Texture B, compute new values, write to Texture A.
3. **Frame N+2**: Read from Texture A again...

This alternation is called "ping-pong."

In p5.js, we create framebuffers using `createFramebuffer()`:

```js
let bufA, bufB;

function setup() {
  createCanvas(512, 512, WEBGL);
  bufA = createFramebuffer({ format: FLOAT, width: 512, height: 512 });
  bufB = createFramebuffer({ format: FLOAT, width: 512, height: 512 });
}
```

The `FLOAT` format is important -- it gives us floating-point precision in the texture channels, which is necessary for the gradual changes in chemical concentration.

---

## Step 4: Encoding Data in Textures

We store the two chemical concentrations in the texture's color channels:

| Channel | Data |
|---------|------|
| R (red) | Concentration of chemical $A$ |
| G (green) | Concentration of chemical $B$ |
| B (blue) | Unused (or available for a third chemical) |
| A (alpha) | Unused (set to 1.0) |

The initial state has $A = 1.0$ everywhere (the field is full of "food") and $B = 0.0$ everywhere (no "organism" yet). We seed a small region with $B = 1.0$ to start the reaction.

---

## Step 5: The Shader Code

We need two shaders:

1. **Simulation shader**: Reads the current state, computes the reaction-diffusion step, outputs the new state.
2. **Display shader**: Reads the current state and maps it to a visible color.

### The Simulation Fragment Shader

```glsl
// reaction-diffusion.frag
precision highp float;

uniform sampler2D uState;    // current state texture
uniform vec2 uResolution;    // canvas dimensions
uniform float uFeed;         // feed rate f
uniform float uKill;         // kill rate k
uniform float uDt;           // time step
uniform vec2 uMouse;         // mouse position (normalized 0-1)
uniform float uMouseActive;  // 1.0 if mouse is pressed, 0.0 otherwise

// Diffusion rates
const float DA = 1.0;
const float DB = 0.5;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 texel = 1.0 / uResolution;

  // Read current state
  vec4 state = texture2D(uState, uv);
  float A = state.r;
  float B = state.g;

  // Compute Laplacian using a 3x3 convolution kernel
  // Kernel weights:
  //   0.05  0.2  0.05
  //   0.2  -1.0  0.2
  //   0.05  0.2  0.05
  float lapA = 0.0;
  float lapB = 0.0;

  // Center (weight = -1.0)
  lapA += A * (-1.0);
  lapB += B * (-1.0);

  // Cardinal neighbors (weight = 0.2 each)
  vec4 n;
  n = texture2D(uState, uv + vec2( texel.x, 0.0));
  lapA += n.r * 0.2; lapB += n.g * 0.2;

  n = texture2D(uState, uv + vec2(-texel.x, 0.0));
  lapA += n.r * 0.2; lapB += n.g * 0.2;

  n = texture2D(uState, uv + vec2(0.0,  texel.y));
  lapA += n.r * 0.2; lapB += n.g * 0.2;

  n = texture2D(uState, uv + vec2(0.0, -texel.y));
  lapA += n.r * 0.2; lapB += n.g * 0.2;

  // Diagonal neighbors (weight = 0.05 each)
  n = texture2D(uState, uv + vec2( texel.x,  texel.y));
  lapA += n.r * 0.05; lapB += n.g * 0.05;

  n = texture2D(uState, uv + vec2(-texel.x,  texel.y));
  lapA += n.r * 0.05; lapB += n.g * 0.05;

  n = texture2D(uState, uv + vec2( texel.x, -texel.y));
  lapA += n.r * 0.05; lapB += n.g * 0.05;

  n = texture2D(uState, uv + vec2(-texel.x, -texel.y));
  lapA += n.r * 0.05; lapB += n.g * 0.05;

  // Reaction-diffusion equations
  float reaction = A * B * B;
  float newA = A + (DA * lapA - reaction + uFeed * (1.0 - A)) * uDt;
  float newB = B + (DB * lapB + reaction - (uKill + uFeed) * B) * uDt;

  // Mouse interaction: seed chemical B where the mouse is
  if (uMouseActive > 0.5) {
    float d = distance(uv, uMouse);
    if (d < 0.02) {
      newB = 1.0;
    }
  }

  // Clamp to valid range
  newA = clamp(newA, 0.0, 1.0);
  newB = clamp(newB, 0.0, 1.0);

  gl_FragColor = vec4(newA, newB, 0.0, 1.0);
}
```

### The Display Fragment Shader

```glsl
// display.frag
precision highp float;

uniform sampler2D uState;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec4 state = texture2D(uState, uv);

  float A = state.r;
  float B = state.g;

  // Color mapping: visualize the difference between A and B
  float value = A - B;

  // Create a colorful mapping
  vec3 color;
  if (value > 0.5) {
    // High A, low B -- background color
    color = mix(vec3(0.1, 0.2, 0.4), vec3(0.9, 0.9, 1.0), (value - 0.5) * 2.0);
  } else {
    // High B -- pattern color
    color = mix(vec3(0.0, 0.0, 0.0), vec3(0.1, 0.2, 0.4), value * 2.0);
  }

  gl_FragColor = vec4(color, 1.0);
}
```

### The Vertex Shader (Shared)

Both shaders use the same simple vertex shader that draws a full-screen quad:

```glsl
// shader.vert
precision highp float;

attribute vec3 aPosition;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
```

---

## Step 6: The p5.js Sketch

Now we wire everything together in the p5.js sketch.

### File Structure

In the p5.js web editor, create these files:

```
sketch.js
shader.vert
reaction-diffusion.frag
display.frag
```

### sketch.js

```js
let simShader, displayShader;
let bufA, bufB;
let simWidth = 512;
let simHeight = 512;

// Reaction-diffusion parameters
let feed = 0.037;
let kill = 0.064;
let dt = 1.0;
let stepsPerFrame = 8; // run multiple simulation steps per frame

function preload() {
  simShader = loadShader('shader.vert', 'reaction-diffusion.frag');
  displayShader = loadShader('shader.vert', 'display.frag');
}

function setup() {
  createCanvas(simWidth, simHeight, WEBGL);
  pixelDensity(1);

  // Create ping-pong framebuffers
  bufA = createFramebuffer({
    width: simWidth,
    height: simHeight,
    format: FLOAT,
    depthFormat: UNSIGNED_INT,
    textureFiltering: NEAREST
  });
  bufB = createFramebuffer({
    width: simWidth,
    height: simHeight,
    format: FLOAT,
    depthFormat: UNSIGNED_INT,
    textureFiltering: NEAREST
  });

  // Initialize state: A=1, B=0 everywhere
  bufA.begin();
  background(255, 0, 0, 255); // R=1.0 (A), G=0.0 (B)
  bufA.end();

  // Seed some B in the center
  bufA.begin();
  noStroke();
  fill(255, 255, 0, 255); // R=1 (A), G=1 (B=seeded)
  // Draw seed spots
  for (let i = 0; i < 10; i++) {
    let sx = random(-50, 50);
    let sy = random(-50, 50);
    rect(sx - 3, sy - 3, 6, 6);
  }
  bufA.end();

  noStroke();
}

function draw() {
  // Run multiple simulation steps per frame for faster evolution
  for (let step = 0; step < stepsPerFrame; step++) {
    // Simulation step: read from bufA, write to bufB
    bufB.begin();
    shader(simShader);
    simShader.setUniform('uState', bufA.color);
    simShader.setUniform('uResolution', [simWidth, simHeight]);
    simShader.setUniform('uFeed', feed);
    simShader.setUniform('uKill', kill);
    simShader.setUniform('uDt', dt);

    // Mouse interaction (convert to 0-1 normalized coordinates)
    if (mouseIsPressed) {
      let mx = (mouseX) / width;
      let my = 1.0 - (mouseY) / height; // flip y for shader coordinates
      simShader.setUniform('uMouse', [mx, my]);
      simShader.setUniform('uMouseActive', 1.0);
    } else {
      simShader.setUniform('uMouse', [0.0, 0.0]);
      simShader.setUniform('uMouseActive', 0.0);
    }

    rect(-width / 2, -height / 2, width, height);
    bufB.end();

    // Swap buffers
    let temp = bufA;
    bufA = bufB;
    bufB = temp;
  }

  // Display step: render the current state with color mapping
  shader(displayShader);
  displayShader.setUniform('uState', bufA.color);
  displayShader.setUniform('uResolution', [simWidth, simHeight]);
  rect(-width / 2, -height / 2, width, height);

  // Reset shader for text drawing
  resetShader();
}

function keyPressed() {
  // Preset patterns
  if (key === '1') { feed = 0.035; kill = 0.065; } // spots
  if (key === '2') { feed = 0.025; kill = 0.060; } // stripes
  if (key === '3') { feed = 0.014; kill = 0.054; } // spirals
  if (key === '4') { feed = 0.029; kill = 0.057; } // coral
  if (key === '5') { feed = 0.037; kill = 0.064; } // mitosis
  if (key === '6') { feed = 0.078; kill = 0.061; } // worms

  // Reset
  if (key === 'r' || key === 'R') {
    bufA.begin();
    background(255, 0, 0, 255);
    noStroke();
    fill(255, 255, 0, 255);
    for (let i = 0; i < 10; i++) {
      let sx = random(-50, 50);
      let sy = random(-50, 50);
      rect(sx - 3, sy - 3, 6, 6);
    }
    bufA.end();
  }
}
```

---

## Step 7: Understanding the Laplacian

The Laplacian $\nabla^2$ is the heart of the diffusion process. It measures how different a cell's value is from the average of its neighbors. If a cell has a higher concentration than its neighbors, the Laplacian is negative, and diffusion will reduce it. If it has a lower concentration, the Laplacian is positive, and diffusion will increase it.

The 3x3 convolution kernel we use:

```
0.05  0.20  0.05
0.20 -1.00  0.20
0.05  0.20  0.05
```

This kernel weights the four cardinal neighbors (up, down, left, right) more heavily than the four diagonal neighbors. The weights sum to zero, which is a property of all Laplacian kernels. The center weight of -1.0 means "subtract the current value," and the neighbor weights mean "add the weighted average of neighbors."

### Why This Kernel?

A simpler 3x3 Laplacian kernel would be:

```
0.00  0.25  0.00
0.25 -1.00  0.25
0.00  0.25  0.00
```

This only considers cardinal neighbors. Including diagonals (with the 0.05/0.20 weights) produces smoother, more isotropic (direction-independent) diffusion, which gives better-looking results.

---

## Step 8: Alternative Approach Using Inline Shader Strings

If you prefer not to create separate shader files, you can define shaders as strings directly in your sketch. This is sometimes easier for quick experiments:

```js
let simShaderSource = `
  precision highp float;

  uniform sampler2D uState;
  uniform vec2 uResolution;
  uniform float uFeed;
  uniform float uKill;
  uniform float uDt;
  uniform vec2 uMouse;
  uniform float uMouseActive;

  const float DA = 1.0;
  const float DB = 0.5;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 texel = 1.0 / uResolution;

    vec4 state = texture2D(uState, uv);
    float A = state.r;
    float B = state.g;

    float lapA = -A;
    float lapB = -B;

    // Cardinal neighbors
    lapA += texture2D(uState, uv + vec2( texel.x, 0.0)).r * 0.2;
    lapA += texture2D(uState, uv + vec2(-texel.x, 0.0)).r * 0.2;
    lapA += texture2D(uState, uv + vec2(0.0,  texel.y)).r * 0.2;
    lapA += texture2D(uState, uv + vec2(0.0, -texel.y)).r * 0.2;

    lapB += texture2D(uState, uv + vec2( texel.x, 0.0)).g * 0.2;
    lapB += texture2D(uState, uv + vec2(-texel.x, 0.0)).g * 0.2;
    lapB += texture2D(uState, uv + vec2(0.0,  texel.y)).g * 0.2;
    lapB += texture2D(uState, uv + vec2(0.0, -texel.y)).g * 0.2;

    // Diagonals
    lapA += texture2D(uState, uv + vec2( texel.x,  texel.y)).r * 0.05;
    lapA += texture2D(uState, uv + vec2(-texel.x,  texel.y)).r * 0.05;
    lapA += texture2D(uState, uv + vec2( texel.x, -texel.y)).r * 0.05;
    lapA += texture2D(uState, uv + vec2(-texel.x, -texel.y)).r * 0.05;

    lapB += texture2D(uState, uv + vec2( texel.x,  texel.y)).g * 0.05;
    lapB += texture2D(uState, uv + vec2(-texel.x,  texel.y)).g * 0.05;
    lapB += texture2D(uState, uv + vec2( texel.x, -texel.y)).g * 0.05;
    lapB += texture2D(uState, uv + vec2(-texel.x, -texel.y)).g * 0.05;

    float reaction = A * B * B;
    float newA = A + (DA * lapA - reaction + uFeed * (1.0 - A)) * uDt;
    float newB = B + (DB * lapB + reaction - (uKill + uFeed) * B) * uDt;

    // Mouse seeding
    if (uMouseActive > 0.5) {
      float d = distance(uv, uMouse);
      if (d < 0.02) { newB = 1.0; }
    }

    gl_FragColor = vec4(clamp(newA, 0.0, 1.0), clamp(newB, 0.0, 1.0), 0.0, 1.0);
  }
`;
```

You can then create the shader with `createShader()`:

```js
let myShader;

function setup() {
  createCanvas(512, 512, WEBGL);
  myShader = createShader(vertSource, simShaderSource);
}
```

---

## Step 9: Exploring Parameters

The most fascinating aspect of Reaction-Diffusion is how dramatically different patterns emerge from small changes in the feed and kill rates. Here is a complete exploration sketch with keyboard controls:

```js
// Add to your existing sketch:

function draw() {
  // ... existing simulation and display code ...

  // Show current parameters
  resetShader();
  fill(255);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Feed: ${feed.toFixed(4)}  Kill: ${kill.toFixed(4)}`, -width/2 + 10, -height/2 + 10);
  text('Keys 1-6: presets | R: reset | Click: seed', -width/2 + 10, -height/2 + 25);
  text('Arrow Up/Down: feed | Arrow Left/Right: kill', -width/2 + 10, -height/2 + 40);
}

function keyPressed() {
  // Fine-tune parameters with arrow keys
  if (keyCode === UP_ARROW) feed += 0.001;
  if (keyCode === DOWN_ARROW) feed -= 0.001;
  if (keyCode === RIGHT_ARROW) kill += 0.001;
  if (keyCode === LEFT_ARROW) kill -= 0.001;

  feed = constrain(feed, 0.0, 0.1);
  kill = constrain(kill, 0.0, 0.1);

  // ... presets and reset code from Step 6 ...
}
```

---

## Step 10: Advanced Color Mapping

The display shader can create dramatically different aesthetics with different color mappings:

### Gradient Map

```glsl
// In display.frag, replace the color mapping section:

// Use a multi-stop gradient
float t = clamp(A - B, 0.0, 1.0);

vec3 c1 = vec3(0.05, 0.0, 0.1);    // dark purple (B dominant)
vec3 c2 = vec3(0.0, 0.3, 0.6);     // deep blue
vec3 c3 = vec3(0.0, 0.8, 0.6);     // teal
vec3 c4 = vec3(1.0, 0.95, 0.8);    // warm white (A dominant)

vec3 color;
if (t < 0.33) {
  color = mix(c1, c2, t / 0.33);
} else if (t < 0.66) {
  color = mix(c2, c3, (t - 0.33) / 0.33);
} else {
  color = mix(c3, c4, (t - 0.66) / 0.34);
}

gl_FragColor = vec4(color, 1.0);
```

### Height Map Style

```glsl
float val = A - B;
vec3 color = vec3(val * 0.8, val * val * 0.6, val * 0.3 + 0.1);
gl_FragColor = vec4(color, 1.0);
```

---

## Summary

| Concept | Implementation |
|---------|---------------|
| Two chemicals (A, B) | Stored in R and G channels of a texture |
| Diffusion | Laplacian convolution (3x3 kernel) in the fragment shader |
| Reaction ($AB^2$) | Computed per-pixel in the fragment shader |
| Feed rate ($f$) | Uniform controlling how fast $A$ is replenished |
| Kill rate ($k$) | Uniform controlling how fast $B$ decays |
| Ping-pong | Two framebuffers alternating as read/write targets |
| Mouse seeding | Set $B = 1$ near the mouse position in the shader |
| Color mapping | Separate display shader maps A-B difference to color |
| Multiple steps per frame | Run the simulation shader several times before displaying |

---

## Troubleshooting

### Black screen

- Check that the initial state has $A = 1.0$ (red channel = 255) and that seed spots have $B = 1.0$ (green channel = 255).
- Make sure framebuffers use `FLOAT` format.
- Verify the shader compiled without errors (check browser console).

### Nothing happens / static image

- Ensure you seeded chemical $B$ somewhere. Without $B$, there is no reaction.
- Try increasing `stepsPerFrame` to speed up the simulation.
- Check that the feed and kill rates are in a valid range (see the parameter table).

### Patterns dissolve / fill the screen uniformly

- The kill rate may be too low (everything becomes $B$) or too high (all $B$ dies).
- Try the preset values from the parameter table.

### Shader errors

- WebGL 1 (default in p5.js) uses `texture2D()`, not `texture()`.
- Make sure `precision highp float;` is at the top of your fragment shader.
- Check for missing semicolons -- GLSL is strict about syntax.

---

## Further Exploration

- **Multiple species**: Add a third chemical in the B channel and experiment with three-way reactions.
- **Anisotropic diffusion**: Make the diffusion rate depend on direction to create aligned patterns.
- **Parameter maps**: Instead of uniform feed/kill rates, load an image and use its brightness to vary the parameters spatially.
- **3D Reaction-Diffusion**: Extend to 3D using volume textures (advanced WebGL 2 feature).
- **Karl Sims' work**: Study Karl Sims' reaction-diffusion art for inspiration on parameter exploration and presentation.
- **Robert Munafo's parameter map**: Search for "Gray-Scott parameter map" to see a visualization of all possible patterns organized by feed and kill rate.
