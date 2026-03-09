# Tutorial: Audio in p5.js with p5.sound

**MAT 200C: Computing Arts -- Week 7, February 17**

---

## Overview

In this tutorial, we will learn how to work with audio in p5.js using the p5.sound library. We will load and play sound files, capture microphone input, analyze audio frequencies with FFT, and use audio data to drive visuals in real time.

We will cover:

1. The p5.sound library and what it provides
2. Loading and playing sound files
3. Capturing microphone input
4. FFT analysis: frequency spectrum and waveform
5. Using audio data to drive visuals
6. Basic oscillator synthesis
7. A complete audio-reactive sketch

---

## Prerequisites

- Familiarity with p5.js basics (setup/draw, shapes, color)
- Access to the p5.js web editor: <https://editor.p5js.org>
- Headphones recommended (to avoid microphone feedback)

---

## Step 1: The p5.sound Library

p5.sound is a companion library to p5.js that provides audio functionality. It is built on top of the **Web Audio API**, the browser's native system for generating, processing, and analyzing audio.

p5.sound is included by default in the p5.js web editor. If you are working locally, you need to include it separately:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/addons/p5.sound.min.js"></script>
```

Key classes in p5.sound:

| Class | Purpose |
|-------|---------|
| `p5.SoundFile` | Load and play audio files (mp3, wav, ogg) |
| `p5.AudioIn` | Capture microphone input |
| `p5.FFT` | Analyze frequency spectrum and waveform |
| `p5.Oscillator` | Generate tones (sine, triangle, square, sawtooth) |
| `p5.Amplitude` | Measure overall volume level |
| `p5.Filter` | Apply low-pass, high-pass, or band-pass filtering |
| `p5.Delay` | Add echo/delay effects |
| `p5.Reverb` | Add reverberation |

---

## Step 2: Loading and Playing Sound Files

### Loading a Sound File

Use `loadSound()` in `preload()` to load an audio file before your sketch starts:

```js
let song;

function preload() {
  song = loadSound('assets/music.mp3');
}

function setup() {
  createCanvas(400, 200);
  background(20);
  fill(255);
  textAlign(CENTER, CENTER);
  text('Click to play/pause', width / 2, height / 2);
}

function draw() {
  // Nothing to draw yet
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}
```

### Important: User Gesture Requirement

Modern browsers require a **user gesture** (click, tap, or key press) before they allow audio to play. This is a security measure to prevent websites from auto-playing sound. You cannot call `song.play()` directly in `setup()` -- it must be triggered by a user action.

If you need audio to start when the sketch loads, use the `userStartAudio()` function:

```js
function setup() {
  createCanvas(400, 200);
  userStartAudio(); // resumes audio context on first user gesture
}
```

### Uploading Sound Files to the p5.js Editor

1. In the p5.js web editor, click the **>** arrow to expand the file panel.
2. Click the **dropdown arrow** next to "Sketch Files."
3. Select **"Upload file"**.
4. Upload your `.mp3`, `.wav`, or `.ogg` file.
5. Reference it by its filename in `loadSound()`.

### SoundFile Methods

```js
song.play();          // start playback
song.pause();         // pause (resume with play())
song.stop();          // stop and reset to beginning
song.loop();          // play on repeat
song.setVolume(0.5);  // set volume (0.0 to 1.0)
song.rate(1.5);       // playback speed (1.0 = normal, 2.0 = double speed)
song.jump(10);        // jump to 10 seconds
song.duration();      // total duration in seconds
song.currentTime();   // current playback position in seconds
song.isPlaying();     // returns true if currently playing
```

---

## Step 3: Microphone Input

To use the microphone instead of a sound file:

```js
let mic;

function setup() {
  createCanvas(400, 400);
  mic = new p5.AudioIn();
  mic.start(); // request microphone access
}

function draw() {
  background(20);

  // Get the current volume level (0.0 to 1.0)
  let vol = mic.getLevel();

  // Map volume to circle size
  let diameter = map(vol, 0, 0.3, 20, 400);

  fill(200, 100, 100);
  noStroke();
  circle(width / 2, height / 2, diameter);
}
```

When you run this sketch, the browser will ask for microphone permission. After granting it, the circle will pulse with the volume of your voice or ambient sound.

### Sensitivity Adjustment

Microphone levels are typically very small (0.0 to ~0.1 for normal speech). You may need to adjust your mapping range. The `mic.amp()` method does not exist in p5.sound v1, so instead adjust in your mapping:

```js
let vol = mic.getLevel();
// Map with a smaller input range for higher sensitivity
let diameter = map(vol, 0, 0.1, 20, 400);
diameter = constrain(diameter, 20, 400);
```

---

## Step 4: FFT Analysis

**FFT** (Fast Fourier Transform) is the core tool for audio-reactive visuals. It decomposes a sound signal into its individual frequency components, telling you how much energy is present at each frequency.

### Setting Up FFT

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

The `p5.FFT` constructor takes two optional arguments:

- **smoothing** (0.0 to 1.0): How much to smooth between frames. Higher values make the visualization less jumpy. Default is 0.8.
- **bins** (power of 2): The number of frequency bins. More bins give finer frequency resolution. Common values: 64, 128, 256, 512, 1024. Default is 1024.

### The Frequency Spectrum

`fft.analyze()` returns an array of amplitude values (0-255) for each frequency bin:

```js
function draw() {
  background(20);

  let spectrum = fft.analyze();

  // Draw the spectrum as vertical bars
  noStroke();
  fill(100, 200, 255);

  let barWidth = width / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    let x = i * barWidth;
    let h = map(spectrum[i], 0, 255, 0, height);
    rect(x, height - h, barWidth, h);
  }
}
```

The spectrum array goes from low frequencies (bass, index 0) to high frequencies (treble, last index). The frequency range covered is 0 Hz to half the sample rate (typically 0 to 22,050 Hz for 44,100 Hz audio).

### Frequency Bands

Instead of looking at individual bins, you can query predefined frequency bands:

```js
let spectrum = fft.analyze();

let bass = fft.getEnergy("bass");           // 20 - 140 Hz
let lowMid = fft.getEnergy("lowMid");       // 140 - 400 Hz
let mid = fft.getEnergy("mid");             // 400 - 2600 Hz
let highMid = fft.getEnergy("highMid");     // 2600 - 5200 Hz
let treble = fft.getEnergy("treble");       // 5200 - 14000 Hz

// Or query a specific frequency range:
let subBass = fft.getEnergy(20, 60);        // 20-60 Hz (sub-bass)
```

Each returns a value from 0 to 255. This is extremely useful for mapping different frequency ranges to different visual properties.

### The Waveform

`fft.waveform()` returns the raw audio waveform -- the actual shape of the sound wave:

```js
function draw() {
  background(20);

  let waveform = fft.waveform();

  noFill();
  stroke(100, 255, 100);
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, 0, height);
    vertex(x, y);
  }
  endShape();
}
```

Waveform values range from -1.0 to 1.0 (the raw audio sample values).

---

## Step 5: Using Audio Data to Drive Visuals

Now we combine FFT analysis with visual techniques to create audio-reactive art.

### Example 1: Frequency Bar Visualizer

```js
let mic, fft;

function setup() {
  createCanvas(800, 400);
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);
}

function draw() {
  background(0, 0, 10);

  let spectrum = fft.analyze();
  let numBars = 64; // show the first 64 bins (low to mid frequencies)
  let barWidth = width / numBars;

  for (let i = 0; i < numBars; i++) {
    let amp = spectrum[i];
    let h = map(amp, 0, 255, 2, height);
    let hue = map(i, 0, numBars, 200, 360);

    fill(hue, 80, map(amp, 0, 255, 30, 100));
    noStroke();
    rect(i * barWidth, height - h, barWidth - 1, h);
  }
}
```

### Example 2: Circular Waveform

```js
let mic, fft;

function setup() {
  createCanvas(600, 600);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 512);
  fft.setInput(mic);
}

function draw() {
  background(15, 15, 25);

  let waveform = fft.waveform();

  translate(width / 2, height / 2);
  noFill();
  stroke(100, 200, 255);
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI);
    let r = 150 + waveform[i] * 100;
    let x = r * cos(angle);
    let y = r * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);

  // Inner circle for reference
  stroke(100, 200, 255, 40);
  strokeWeight(1);
  circle(0, 0, 300);
}
```

### Example 3: Frequency-Driven Concentric Rings

```js
let mic, fft;

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 100);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.85, 128);
  fft.setInput(mic);
}

function draw() {
  background(0, 0, 5, 40);

  let spectrum = fft.analyze();

  translate(width / 2, height / 2);

  let numRings = 20;
  for (let i = 0; i < numRings; i++) {
    let binIndex = floor(map(i, 0, numRings, 0, 64));
    let amp = spectrum[binIndex];

    let radius = map(i, 0, numRings, 30, 280);
    let thickness = map(amp, 0, 255, 0.5, 8);
    let hue = map(i, 0, numRings, 180, 320);

    noFill();
    stroke(hue, 70, map(amp, 0, 255, 20, 100), 80);
    strokeWeight(thickness);
    circle(0, 0, radius * 2);
  }
}
```

---

## Step 6: Oscillator Synthesis

p5.sound can also generate sound, not just analyze it. The `p5.Oscillator` class creates simple tones.

### Basic Oscillator

```js
let osc;

function setup() {
  createCanvas(400, 400);
  osc = new p5.Oscillator('sine'); // 'sine', 'triangle', 'square', 'sawtooth'
  osc.freq(440); // A4 = 440 Hz
  osc.amp(0);    // start silent
  osc.start();
}

function draw() {
  background(20);

  if (mouseIsPressed) {
    // Map mouse position to frequency and volume
    let freq = map(mouseX, 0, width, 100, 1000);
    let amp = map(mouseY, 0, height, 0.5, 0);

    osc.freq(freq);
    osc.amp(amp, 0.05); // 0.05 second ramp to avoid clicks

    // Visual feedback
    fill(map(freq, 100, 1000, 0, 255), 100, 200);
    noStroke();
    circle(mouseX, mouseY, amp * 200);
  } else {
    osc.amp(0, 0.1); // fade out when mouse released
  }

  fill(255);
  textAlign(CENTER);
  text('Click and drag to play', width / 2, 30);
  text('X = frequency, Y = volume', width / 2, 50);
}
```

### Waveform Types

| Type | Sound Character | Visual Shape |
|------|----------------|-------------|
| `'sine'` | Pure, smooth, flute-like | Smooth wave |
| `'triangle'` | Soft, warm, slightly buzzy | Triangle wave |
| `'square'` | Hollow, buzzy, retro game-like | Square wave |
| `'sawtooth'` | Bright, harsh, buzzy | Sawtooth wave |

### Multiple Oscillators (Simple Chord)

```js
let oscs = [];
let freqs = [261.63, 329.63, 392.00]; // C4, E4, G4 (C major chord)

function setup() {
  createCanvas(400, 400);

  for (let f of freqs) {
    let o = new p5.Oscillator('sine');
    o.freq(f);
    o.amp(0);
    o.start();
    oscs.push(o);
  }
}

function mousePressed() {
  for (let o of oscs) {
    o.amp(0.15, 0.1); // fade in
  }
}

function mouseReleased() {
  for (let o of oscs) {
    o.amp(0, 0.3); // fade out
  }
}
```

---

## Step 7: Complete Audio-Reactive Sketch

Here is a complete, polished sketch that combines FFT analysis with generative visuals. It responds to microphone input and creates an evolving visual landscape driven by sound.

```js
let mic, fft;
let particles = [];

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);

  // Initialize particles
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      baseSize: random(2, 8),
      angle: random(TWO_PI),
      speed: random(0.3, 1.5),
      hueOffset: random(360)
    });
  }
}

function draw() {
  // Semi-transparent background for trails
  noStroke();
  fill(0, 0, 5, 20);
  rect(0, 0, width, height);

  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");
  let volume = fft.getEnergy(20, 20000);

  // --- Layer 1: Waveform ring in the center ---
  push();
  translate(width / 2, height / 2);

  // Outer glow ring driven by bass
  let glowSize = map(bass, 0, 255, 100, 300);
  noFill();
  stroke(map(bass, 0, 255, 200, 360) % 360, 60, map(bass, 0, 255, 20, 80), 30);
  strokeWeight(map(bass, 0, 255, 1, 6));
  circle(0, 0, glowSize * 2);

  // Waveform ring
  noFill();
  stroke(200, 70, 90, 60);
  strokeWeight(1.5);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI);
    let r = 80 + waveform[i] * map(mid, 0, 255, 20, 80);
    vertex(r * cos(angle), r * sin(angle));
  }
  endShape(CLOSE);
  pop();

  // --- Layer 2: Spectrum bars at the bottom ---
  let numBars = 64;
  let barW = width / numBars;
  for (let i = 0; i < numBars; i++) {
    let amp = spectrum[i];
    let h = map(amp, 0, 255, 0, 150);
    let hue = map(i, 0, numBars, 180, 330);

    noStroke();
    fill(hue, 70, map(amp, 0, 255, 20, 95), 70);
    rect(i * barW, height - h, barW - 1, h);

    // Mirror bars at the top
    fill(hue, 50, map(amp, 0, 255, 10, 60), 40);
    rect(i * barW, 0, barW - 1, h * 0.5);
  }

  // --- Layer 3: Audio-reactive particles ---
  let noiseScale = map(mid, 0, 255, 0.001, 0.005);

  for (let p of particles) {
    // Flow field movement modulated by audio
    let n = noise(p.x * noiseScale, p.y * noiseScale, frameCount * 0.005);
    let flowAngle = n * TWO_PI * 2;

    let speedMult = map(volume, 0, 150, 0.5, 3);
    p.x += cos(flowAngle) * p.speed * speedMult;
    p.y += sin(flowAngle) * p.speed * speedMult;

    // Wrap edges
    if (p.x < 0) p.x += width;
    if (p.x > width) p.x -= width;
    if (p.y < 0) p.y += height;
    if (p.y > height) p.y -= height;

    // Draw particle
    let size = p.baseSize * map(treble, 0, 255, 0.5, 3);
    let hue = (p.hueOffset + frameCount * 0.5 + bass) % 360;

    noStroke();
    fill(hue, 60, 90, 50);
    circle(p.x, p.y, size);
  }

  // --- Instructions ---
  fill(0, 0, 80, 60);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  text('Make sound to activate visuals (microphone input)', 10, 10);
}
```

**How to use:**

1. Open the p5.js web editor
2. Paste this code into `sketch.js`
3. Click Play and allow microphone access
4. Make sounds -- clap, speak, play music near your computer
5. The visuals will respond to the bass (ring pulses), mid (waveform shape), and treble (particle size)

---

## Troubleshooting

### "The AudioContext was not allowed to start"

This browser security message means audio was blocked because no user gesture occurred. Make sure audio playback or recording is triggered by a click or key press.

### No sound from microphone

- Check that you granted microphone permission in your browser
- Check that the correct microphone is selected in your browser/OS settings
- Some browsers require HTTPS for microphone access (the p5.js editor uses HTTPS)

### Feedback loop with microphone

If you are playing audio through speakers while recording with the microphone, you will get a feedback loop. Use headphones, or use a sound file instead of the microphone for testing.

### Low volume / no response

Microphone levels vary widely between devices. Adjust the mapping ranges in your code. Instead of `map(vol, 0, 0.3, ...)`, try `map(vol, 0, 0.05, ...)` for a more sensitive response.

---

## Summary

| Concept | Key Code |
|---------|----------|
| Load sound file | `loadSound('file.mp3')` in `preload()` |
| Play sound | `sound.play()` (requires user gesture) |
| Microphone input | `new p5.AudioIn()` then `mic.start()` |
| FFT setup | `new p5.FFT(smoothing, bins)` |
| Frequency spectrum | `fft.analyze()` returns array of 0-255 values |
| Frequency bands | `fft.getEnergy("bass")`, `"mid"`, `"treble"` |
| Waveform | `fft.waveform()` returns array of -1 to 1 values |
| Generate tone | `new p5.Oscillator('sine')` |
| Set frequency | `osc.freq(440)` |
| Set volume | `osc.amp(0.5, rampTime)` |

---

## Further Exploration

- Apply a `p5.Filter` (low-pass or high-pass) to the microphone input before FFT analysis to isolate specific frequency ranges.
- Use `p5.Amplitude` for simple volume-level tracking without the overhead of full FFT.
- Combine audio analysis with `p5.Delay` and `p5.Reverb` for processed audio output.
- Explore pitch detection by finding the frequency bin with the highest amplitude.
- Build a step sequencer using multiple oscillators triggered by a timer.
