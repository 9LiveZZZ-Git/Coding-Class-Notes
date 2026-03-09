# Chapter: Audio Programming and GPU-Based Pattern Formation

**MAT 200C: Computing Arts -- Week 7, February 17**

---

## Introduction

This chapter covers two major topics: audio programming for creative coding and GPU-accelerated pattern formation. These may seem unrelated at first, but they share a common theme: using mathematical processes to generate rich, complex output from simple rules. In audio, we decompose sound into frequencies and use those frequencies to drive visuals. In reaction-diffusion, we simulate chemical interactions that produce intricate organic patterns. Both rely on understanding how to bridge the gap between mathematical abstractions and sensory experience.

---

## Part 1: Audio Programming

### 1.1 Sound as Data

Sound is vibration. A microphone converts physical vibrations into electrical signals, which are then digitized into a stream of numbers. Each number represents the amplitude (displacement) of the sound wave at a single point in time. At a sample rate of 44,100 Hz, we get 44,100 of these numbers per second.

A single sample is just a number, typically between -1.0 and 1.0. By itself, it is meaningless. But a stream of thousands of samples per second, played back through a speaker, reconstructs the original vibration.

### 1.2 The p5.sound Library

p5.sound extends p5.js with audio capabilities. It wraps the browser's Web Audio API in a simpler interface.

**Loading and playing a sound file:**

```js
let song;

function preload() {
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(400, 200);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
```

**Capturing microphone input:**

```js
let mic;

function setup() {
  createCanvas(400, 400);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(20);
  let vol = mic.getLevel();
  let size = map(vol, 0, 0.3, 20, 400);
  fill(200, 100, 100);
  circle(width / 2, height / 2, size);
}
```

**Important**: Modern browsers require a user gesture (click, tap, or key press) before audio can start. You cannot auto-play sound on page load.

### 1.3 FFT: The Fourier Transform

The **Fast Fourier Transform** is the most important tool for audio-reactive visuals. It converts a time-domain signal (amplitude over time) into a frequency-domain representation (amplitude at each frequency).

**Setting up FFT:**

```js
let mic, fft;

function setup() {
  createCanvas(800, 400);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);
}
```

The constructor takes two arguments:
- **Smoothing** (0-1): How much to smooth between frames. 0.8 is a good default.
- **Bins** (power of 2): Number of frequency bins. 1024 gives 512 usable frequency bins.

**Analyzing the spectrum:**

```js
function draw() {
  background(20);
  let spectrum = fft.analyze(); // array of 1024 values (0-255)

  // Draw frequency bars
  let barWidth = width / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    let h = map(spectrum[i], 0, 255, 0, height);
    fill(i, 200, 255);
    rect(i * barWidth, height - h, barWidth, h);
  }
}
```

**Querying frequency bands:**

```js
let spectrum = fft.analyze();
let bass = fft.getEnergy("bass");       // 20-140 Hz
let lowMid = fft.getEnergy("lowMid");   // 140-400 Hz
let mid = fft.getEnergy("mid");         // 400-2600 Hz
let highMid = fft.getEnergy("highMid"); // 2600-5200 Hz
let treble = fft.getEnergy("treble");   // 5200-14000 Hz
```

Each returns a value from 0 to 255.

**Waveform (time domain):**

```js
let waveform = fft.waveform(); // array of -1.0 to 1.0 values

noFill();
stroke(255);
beginShape();
for (let i = 0; i < waveform.length; i++) {
  let x = map(i, 0, waveform.length, 0, width);
  let y = map(waveform[i], -1, 1, 0, height);
  vertex(x, y);
}
endShape();
```

### 1.4 Audio-Reactive Visual Techniques

**Circular frequency visualizer:**

```js
let mic, fft;

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 100);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);
}

function draw() {
  background(0, 0, 5, 30);
  let spectrum = fft.analyze();

  translate(width / 2, height / 2);

  let numBands = 64;
  for (let i = 0; i < numBands; i++) {
    let amp = spectrum[i];
    let angle = map(i, 0, numBands, 0, TWO_PI);
    let r = map(amp, 0, 255, 50, 250);
    let x = cos(angle) * r;
    let y = sin(angle) * r;

    let hue = map(i, 0, numBands, 180, 360);
    noStroke();
    fill(hue, 80, map(amp, 0, 255, 30, 100), 70);
    circle(x, y, map(amp, 0, 255, 3, 15));

    stroke(hue, 60, map(amp, 0, 255, 20, 80), 40);
    strokeWeight(1);
    line(cos(angle) * 50, sin(angle) * 50, x, y);
  }
}
```

### 1.5 Onset Detection

Detecting the start of a new sound event (drum hit, note attack):

```js
let prevSpectrum = [];
let onsetThreshold = 500;

function detectOnset() {
  let spectrum = fft.analyze();
  let flux = 0;

  for (let i = 0; i < spectrum.length; i++) {
    let diff = spectrum[i] - (prevSpectrum[i] || 0);
    if (diff > 0) flux += diff;
  }

  prevSpectrum = spectrum.slice();
  return flux > onsetThreshold;
}
```

Spectral flux (summing positive differences in the spectrum between frames) is more reliable than simple volume thresholding because it responds to *changes* in the sound rather than sustained loudness.

### 1.6 Basic Synthesis

p5.sound can generate tones using oscillators:

```js
let osc;

function setup() {
  createCanvas(400, 400);
  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.start();
}

function draw() {
  background(20);
  if (mouseIsPressed) {
    let freq = map(mouseX, 0, width, 100, 1000);
    let amp = map(mouseY, 0, height, 0.5, 0.0);
    osc.freq(freq);
    osc.amp(amp, 0.05);

    fill(map(freq, 100, 1000, 0, 255), 100, 200);
    circle(mouseX, mouseY, amp * 200);
  } else {
    osc.amp(0, 0.1);
  }
}
```

Waveform types: `'sine'` (pure), `'triangle'` (soft), `'square'` (hollow/retro), `'sawtooth'` (bright/harsh).

### 1.7 p5.sound vs. Max/MSP

p5.sound and Max/MSP serve different needs:

- **p5.sound** runs in a browser, is free, and is excellent for visual-first projects that use audio as input. It has higher latency (10-50ms) and limited synthesis capabilities.
- **Max/MSP** is a desktop application with near-zero latency, comprehensive synthesis, MIDI support, and hardware integration. It excels at audio-first projects and live performance.

Both can be used together via OSC (Open Sound Control) or WebSocket communication.

---

## Part 2: GPU-Based Pattern Formation (Reaction-Diffusion)

### 2.1 The Gray-Scott Model

The Gray-Scott Reaction-Diffusion model simulates two chemicals, $A$ and $B$, that diffuse and react on a 2D surface:

$$\frac{\partial A}{\partial t} = D_A \nabla^2 A - AB^2 + f(1 - A)$$
$$\frac{\partial B}{\partial t} = D_B \nabla^2 B + AB^2 - (k + f)B$$

- $D_A = 1.0$, $D_B = 0.5$ (diffusion rates; $A$ diffuses faster)
- $f$ = feed rate (how fast $A$ is replenished)
- $k$ = kill rate (how fast $B$ decays)
- $\nabla^2$ = Laplacian (diffusion operator)
- $AB^2$ = reaction term (A is consumed, B is produced)

### 2.2 Why GPU?

A 512x512 simulation has 262,144 cells, each requiring 9 neighbor lookups per timestep, with multiple timesteps per frame. This is ideal for the GPU because:

1. Every cell's computation is independent of every other cell's computation *for the same timestep*.
2. The GPU has thousands of cores optimized for exactly this kind of parallel, uniform computation.
3. The data (chemical concentrations) fits naturally into texture channels.

### 2.3 The Ping-Pong Technique

A fragment shader cannot read from and write to the same texture. We solve this with two textures:

- **Frame 1**: Read state from Texture A, compute new state, write to Texture B.
- **Frame 2**: Read state from Texture B, compute new state, write to Texture A.
- Repeat.

In p5.js:

```js
let bufA, bufB;

function setup() {
  createCanvas(512, 512, WEBGL);
  bufA = createFramebuffer({ format: FLOAT, width: 512, height: 512 });
  bufB = createFramebuffer({ format: FLOAT, width: 512, height: 512 });
}
```

### 2.4 Encoding Chemical Concentrations

We store the two chemicals in the red and green channels of a texture:

| Channel | Chemical | Initial Value |
|---------|----------|---------------|
| R | $A$ | 1.0 (field filled with "food") |
| G | $B$ | 0.0 (no "organism" initially) |
| B | unused | 0.0 |
| A | unused | 1.0 |

We seed $B = 1.0$ in small regions to start the reaction.

### 2.5 The Laplacian in GLSL

The Laplacian approximation using a 3x3 convolution kernel:

```
0.05  0.20  0.05
0.20 -1.00  0.20
0.05  0.20  0.05
```

In GLSL:

```glsl
vec2 texel = 1.0 / uResolution;
vec4 state = texture2D(uState, uv);
float A = state.r;
float B = state.g;

// Compute Laplacian
float lapA = -A;
float lapB = -B;

// Cardinal neighbors (weight 0.2)
lapA += texture2D(uState, uv + vec2(texel.x, 0.0)).r * 0.2;
lapA += texture2D(uState, uv - vec2(texel.x, 0.0)).r * 0.2;
lapA += texture2D(uState, uv + vec2(0.0, texel.y)).r * 0.2;
lapA += texture2D(uState, uv - vec2(0.0, texel.y)).r * 0.2;

// Diagonal neighbors (weight 0.05)
lapA += texture2D(uState, uv + vec2(texel.x, texel.y)).r * 0.05;
lapA += texture2D(uState, uv + vec2(-texel.x, texel.y)).r * 0.05;
lapA += texture2D(uState, uv + vec2(texel.x, -texel.y)).r * 0.05;
lapA += texture2D(uState, uv + vec2(-texel.x, -texel.y)).r * 0.05;

// Same for lapB using .g channel...
```

The Laplacian measures how different a cell is from its neighbors. If a cell has more chemical than its neighbors, the Laplacian is negative, and the chemical diffuses outward. If less, the Laplacian is positive, and chemical flows inward.

### 2.6 The Complete Simulation Shader

```glsl
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

  // Laplacian computation (3x3 kernel)
  float lapA = -A;
  float lapB = -B;

  lapA += texture2D(uState, uv + vec2( texel.x, 0.0)).r * 0.2;
  lapA += texture2D(uState, uv + vec2(-texel.x, 0.0)).r * 0.2;
  lapA += texture2D(uState, uv + vec2(0.0,  texel.y)).r * 0.2;
  lapA += texture2D(uState, uv + vec2(0.0, -texel.y)).r * 0.2;
  lapA += texture2D(uState, uv + vec2( texel.x,  texel.y)).r * 0.05;
  lapA += texture2D(uState, uv + vec2(-texel.x,  texel.y)).r * 0.05;
  lapA += texture2D(uState, uv + vec2( texel.x, -texel.y)).r * 0.05;
  lapA += texture2D(uState, uv + vec2(-texel.x, -texel.y)).r * 0.05;

  lapB += texture2D(uState, uv + vec2( texel.x, 0.0)).g * 0.2;
  lapB += texture2D(uState, uv + vec2(-texel.x, 0.0)).g * 0.2;
  lapB += texture2D(uState, uv + vec2(0.0,  texel.y)).g * 0.2;
  lapB += texture2D(uState, uv + vec2(0.0, -texel.y)).g * 0.2;
  lapB += texture2D(uState, uv + vec2( texel.x,  texel.y)).g * 0.05;
  lapB += texture2D(uState, uv + vec2(-texel.x,  texel.y)).g * 0.05;
  lapB += texture2D(uState, uv + vec2( texel.x, -texel.y)).g * 0.05;
  lapB += texture2D(uState, uv + vec2(-texel.x, -texel.y)).g * 0.05;

  // Gray-Scott equations
  float reaction = A * B * B;
  float newA = A + (DA * lapA - reaction + uFeed * (1.0 - A)) * uDt;
  float newB = B + (DB * lapB + reaction - (uKill + uFeed) * B) * uDt;

  // Mouse interaction
  if (uMouseActive > 0.5) {
    float d = distance(uv, uMouse);
    if (d < 0.02) {
      newB = 1.0;
    }
  }

  gl_FragColor = vec4(clamp(newA, 0.0, 1.0), clamp(newB, 0.0, 1.0), 0.0, 1.0);
}
```

### 2.7 The Display Shader

The simulation data (chemical concentrations) needs to be mapped to visible colors:

```glsl
precision highp float;

uniform sampler2D uState;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec4 state = texture2D(uState, uv);

  float val = state.r - state.g;

  // Multi-stop color gradient
  vec3 c1 = vec3(0.05, 0.0, 0.15);   // deep purple (B-dominant)
  vec3 c2 = vec3(0.0, 0.3, 0.6);     // blue
  vec3 c3 = vec3(0.1, 0.8, 0.5);     // teal
  vec3 c4 = vec3(1.0, 0.95, 0.85);   // warm white (A-dominant)

  vec3 color;
  float t = clamp(val, 0.0, 1.0);
  if (t < 0.33) {
    color = mix(c1, c2, t / 0.33);
  } else if (t < 0.66) {
    color = mix(c2, c3, (t - 0.33) / 0.33);
  } else {
    color = mix(c3, c4, (t - 0.66) / 0.34);
  }

  gl_FragColor = vec4(color, 1.0);
}
```

### 2.8 The p5.js Sketch

```js
let simShader, displayShader;
let bufA, bufB;
let W = 512, H = 512;
let feed = 0.037, kill = 0.064;

function preload() {
  simShader = loadShader('shader.vert', 'reaction-diffusion.frag');
  displayShader = loadShader('shader.vert', 'display.frag');
}

function setup() {
  createCanvas(W, H, WEBGL);
  pixelDensity(1);

  bufA = createFramebuffer({ width: W, height: H, format: FLOAT, textureFiltering: NEAREST });
  bufB = createFramebuffer({ width: W, height: H, format: FLOAT, textureFiltering: NEAREST });

  // Initial state: A=1, B=0
  bufA.begin();
  background(255, 0, 0);
  // Seed B
  fill(255, 255, 0);
  noStroke();
  for (let i = 0; i < 10; i++) {
    rect(random(-50, 50) - 3, random(-50, 50) - 3, 6, 6);
  }
  bufA.end();

  noStroke();
}

function draw() {
  for (let i = 0; i < 8; i++) {
    bufB.begin();
    shader(simShader);
    simShader.setUniform('uState', bufA.color);
    simShader.setUniform('uResolution', [W, H]);
    simShader.setUniform('uFeed', feed);
    simShader.setUniform('uKill', kill);
    simShader.setUniform('uDt', 1.0);
    simShader.setUniform('uMouse', mouseIsPressed ?
      [mouseX / width, 1.0 - mouseY / height] : [0, 0]);
    simShader.setUniform('uMouseActive', mouseIsPressed ? 1.0 : 0.0);
    rect(-W / 2, -H / 2, W, H);
    bufB.end();

    [bufA, bufB] = [bufB, bufA];
  }

  shader(displayShader);
  displayShader.setUniform('uState', bufA.color);
  displayShader.setUniform('uResolution', [W, H]);
  rect(-W / 2, -H / 2, W, H);
  resetShader();
}

function keyPressed() {
  if (key === '1') { feed = 0.035; kill = 0.065; } // spots
  if (key === '2') { feed = 0.025; kill = 0.060; } // stripes
  if (key === '3') { feed = 0.014; kill = 0.054; } // spirals
  if (key === '4') { feed = 0.029; kill = 0.057; } // coral
  if (key === '5') { feed = 0.037; kill = 0.064; } // mitosis
  if (key === 'r') {
    bufA.begin();
    background(255, 0, 0);
    fill(255, 255, 0);
    noStroke();
    for (let i = 0; i < 10; i++) {
      rect(random(-50, 50) - 3, random(-50, 50) - 3, 6, 6);
    }
    bufA.end();
  }
}
```

### 2.9 Exploring the Parameter Space

The Gray-Scott model's behavior is entirely determined by two parameters: the feed rate $f$ and the kill rate $k$. Tiny changes in these values produce dramatically different patterns.

| Pattern | $f$ | $k$ | Description |
|---------|-----|-----|-------------|
| Spots | 0.035 | 0.065 | Isolated circular spots that replicate |
| Stripes | 0.025 | 0.060 | Long, connected stripes |
| Spirals | 0.014 | 0.054 | Rotating spiral waves |
| Coral | 0.029 | 0.057 | Branching, maze-like structures |
| Mitosis | 0.037 | 0.064 | Spots that divide like cells |
| Worms | 0.078 | 0.061 | Moving, worm-like structures |

A comprehensive parameter map was created by Robert Munafo, showing the full space of possible patterns organized by $f$ and $k$. It reveals that the interesting patterns exist in a narrow band -- most of the parameter space produces either uniform states or extinction.

---

## Exercises

### Exercise 1: Audio Spectrum Visualizer

Build a frequency spectrum visualizer that uses bars, circles, or another geometric representation to display the frequency content of microphone input. Requirements:

- Display at least the first 64 frequency bins
- Use color to encode frequency (low = warm, high = cool)
- Use bar height or circle radius to encode amplitude
- Add smoothing so the visualization does not jitter

### Exercise 2: Beat-Reactive Sketch

Create a sketch that detects bass onsets (drum hits) and triggers a visual event each time. The event could be:

- A flash of light
- A camera shake
- Spawning a burst of particles
- A sudden color change

Use spectral flux or band-specific threshold detection.

### Exercise 3: Reaction-Diffusion Explorer

Using the reaction-diffusion GPU sketch as a starting point:

1. Add arrow key controls to adjust the feed and kill rates in real time.
2. Display the current parameter values on screen.
3. Create a custom color mapping in the display shader (not just the one provided).
4. Find three parameter combinations that produce visually interesting and distinct patterns. Document them with screenshots.

### Exercise 4: Audio-Driven Reaction-Diffusion

Combine audio input with reaction-diffusion. Use the bass energy to modulate the feed rate and the treble energy to modulate the kill rate. The patterns should visibly change character in response to music.

Hint: Pass the audio values as additional uniforms to the simulation shader, and use them to perturb $f$ and $k$ slightly.

### Exercise 5: Circular Waveform with FFT Background

Create a layered audio visualization:

- **Background layer**: Slowly fading particle trails driven by a flow field
- **Middle layer**: Frequency spectrum displayed as a circular bar graph
- **Foreground layer**: Real-time waveform drawn as a closed curve

All three layers should respond to the same audio input but in different ways.

---

## Key Vocabulary

| Term | Definition |
|------|-----------|
| **Sample rate** | Number of audio samples per second (typically 44,100 Hz) |
| **FFT** | Fast Fourier Transform; converts time-domain audio to frequency-domain |
| **Spectrum** | Array of amplitude values at each frequency bin |
| **Waveform** | Array of amplitude values over time (raw audio shape) |
| **Onset** | The start of a new sound event (note, drum hit, etc.) |
| **Spectral flux** | Sum of positive differences in the spectrum between frames |
| **Oscillator** | A tone generator producing a repeating waveform |
| **Reaction-Diffusion** | A system of PDEs modeling chemical concentration changes |
| **Gray-Scott model** | A specific two-chemical reaction-diffusion system |
| **Laplacian** | A differential operator measuring local deviation from the average |
| **Ping-pong** | Alternating two framebuffers as read/write targets |
| **Fragment shader** | A GPU program that runs once per pixel in parallel |
| **Feed rate ($f$)** | Rate at which chemical $A$ is replenished |
| **Kill rate ($k$)** | Rate at which chemical $B$ decays |
| **Framebuffer** | An off-screen rendering target (texture) |
| **GPGPU** | General-Purpose computing on GPU; using textures for non-graphics data |
