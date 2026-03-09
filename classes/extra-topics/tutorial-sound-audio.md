# Tutorial: Sound and Audio Programming in p5.js

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Overview

Sound is a core dimension of computing arts. This tutorial covers audio programming with p5.sound (the sound library bundled with p5.js) and the Web Audio API. We will build oscillators, envelopes, filters, play sound files, and create a working synthesizer.

**Important note from the lecture notes:** p5.sound is somewhat dated and has limitations. For serious audio work, students may want to explore the Web Audio API directly, or tools like Tone.js. But p5.sound is the most accessible starting point and integrates cleanly with p5.js sketches.

---

## Setup: Enabling p5.sound

In the p5.js web editor, p5.sound is included by default. You can verify by checking your `index.html` for a line like:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/addons/p5.sound.min.js"></script>
```

If you are working locally, make sure to include this script.

### The AudioContext and User Gesture Requirement

Modern browsers require a **user gesture** (click, tap, or key press) before audio can play. p5.js handles this with `userStartAudio()`. If your audio is not working, add this:

```js
function setup() {
  createCanvas(400, 400);
  userStartAudio(); // Enables audio after user interaction
}
```

Or handle it explicitly:

```js
function mousePressed() {
  userStartAudio();
}
```

---

## Oscillators

An **oscillator** generates a periodic waveform -- a repeating signal that produces a tone. p5.sound provides four basic waveform types:

| Waveform | Sound Character | Use |
|---|---|---|
| **sine** | Pure, smooth | Clean tones, bass |
| **square** | Hollow, buzzy | Retro game sounds, leads |
| **sawtooth** | Bright, rich | Synth leads, strings |
| **triangle** | Soft, mellow | Between sine and square |

### Basic Oscillator

```js
let osc;

function setup() {
  createCanvas(400, 200);
  osc = new p5.Oscillator("sine");
  osc.freq(440); // A4 = 440 Hz
  osc.amp(0);    // Start silent
  osc.start();
}

function draw() {
  background(30);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Click and hold to play", width / 2, height / 2);

  // Visual feedback
  if (mouseIsPressed) {
    fill(100, 255, 100);
    circle(width / 2, height / 2 + 50, 30);
  }
}

function mousePressed() {
  userStartAudio();
  osc.amp(0.3, 0.05); // Ramp to 0.3 over 0.05 seconds
}

function mouseReleased() {
  osc.amp(0, 0.2); // Ramp to 0 over 0.2 seconds
}
```

### Controlling Frequency with the Mouse

```js
let osc;

function setup() {
  createCanvas(600, 400);
  osc = new p5.Oscillator("sawtooth");
  osc.amp(0);
  osc.start();
}

function draw() {
  background(30);

  if (mouseIsPressed) {
    // Map mouse position to frequency and amplitude
    let freq = map(mouseX, 0, width, 100, 1000);
    let amp = map(mouseY, height, 0, 0, 0.5);

    osc.freq(freq);
    osc.amp(amp, 0.05);

    // Visual
    fill(100, 200, 255);
    noStroke();
    let size = map(amp, 0, 0.5, 5, 80);
    circle(mouseX, mouseY, size);

    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`Freq: ${freq.toFixed(0)} Hz`, 10, 10);
    text(`Amp: ${amp.toFixed(2)}`, 10, 30);
  } else {
    osc.amp(0, 0.1);
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Click and drag to play", width / 2, height / 2);
  }
}

function mousePressed() {
  userStartAudio();
}
```

---

## Envelopes (ADSR)

An **envelope** shapes how a sound's amplitude changes over time. The standard model is **ADSR**:

- **Attack** -- time to ramp from silence to peak volume
- **Decay** -- time to drop from peak to sustain level
- **Sustain** -- the level held while a note is active
- **Release** -- time to fade to silence after the note ends

```js
let osc, env;

function setup() {
  createCanvas(400, 300);
  osc = new p5.Oscillator("sine");
  osc.amp(0);
  osc.start();

  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.3, 0.5);
  // Attack: 0.01s, Decay: 0.2s, Sustain level: 0.3, Release: 0.5s
  env.setRange(0.5, 0); // Peak amplitude, release amplitude
}

function draw() {
  background(30);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Press any key to trigger a note", width / 2, height / 2);
}

function keyPressed() {
  userStartAudio();
  osc.freq(random([262, 330, 392, 523])); // Random note from C major
  env.play(osc);
}
```

---

## Filters

A **filter** removes or emphasizes certain frequencies from a sound.

| Filter Type | What It Does |
|---|---|
| `lowpass` | Removes frequencies above the cutoff (makes sound darker/muffled) |
| `highpass` | Removes frequencies below the cutoff (makes sound thinner/brighter) |
| `bandpass` | Keeps only frequencies near the cutoff (makes sound nasal/resonant) |

```js
let osc, filter;

function setup() {
  createCanvas(600, 400);
  filter = new p5.LowPass(); // or p5.HighPass, p5.BandPass

  osc = new p5.Oscillator("sawtooth");
  osc.disconnect(); // Disconnect from default output
  osc.connect(filter); // Route through filter
  osc.freq(220);
  osc.amp(0.3);
  osc.start();

  filter.res(5); // Resonance -- higher = more emphasis at cutoff
}

function draw() {
  background(30);

  // Map mouse X to filter cutoff frequency
  let cutoff = map(mouseX, 0, width, 100, 5000);
  filter.freq(cutoff);

  // Map mouse Y to resonance
  let res = map(mouseY, height, 0, 0.1, 15);
  filter.res(res);

  // Visual
  fill(255);
  textSize(14);
  text(`Cutoff: ${cutoff.toFixed(0)} Hz`, 10, 20);
  text(`Resonance: ${res.toFixed(1)}`, 10, 40);
  text("Move mouse: X = cutoff, Y = resonance", 10, height - 20);
}

function mousePressed() {
  userStartAudio();
}
```

---

## Playing Sound Files

You can load and play audio files (MP3, WAV, OGG).

```js
let sound;

function preload() {
  sound = loadSound("mysound.mp3");
}

function setup() {
  createCanvas(400, 200);
}

function draw() {
  background(30);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);

  if (sound.isPlaying()) {
    text("Playing... Click to stop", width / 2, height / 2);
  } else {
    text("Click to play", width / 2, height / 2);
  }
}

function mousePressed() {
  userStartAudio();
  if (sound.isPlaying()) {
    sound.stop();
  } else {
    sound.play();
  }
}
```

### Sound File Methods

```js
sound.play();          // Play from beginning
sound.stop();          // Stop playback
sound.pause();         // Pause (resume with play)
sound.loop();          // Loop continuously
sound.setVolume(0.5);  // Set volume (0 to 1)
sound.rate(1.5);       // Playback speed (1 = normal, 2 = double, 0.5 = half)
sound.pan(-1);         // Pan left (-1) to right (1)
sound.isPlaying();     // Returns true if currently playing
sound.duration();      // Length in seconds
sound.currentTime();   // Current playback position in seconds
sound.jump(2.0);       // Jump to 2 seconds into the file
```

---

## Audio Analysis: FFT

The **FFT** (Fast Fourier Transform) decomposes a sound into its frequency components, enabling visualization.

```js
let sound, fft;

function preload() {
  sound = loadSound("music.mp3");
}

function setup() {
  createCanvas(600, 400);
  fft = new p5.FFT(0.8, 256);
  // smoothing (0-1), bins (power of 2: 16, 32, 64, 128, 256, 512, 1024)
}

function draw() {
  background(20);

  let spectrum = fft.analyze(); // Array of 256 amplitude values (0-255)
  let waveform = fft.waveform(); // Array of time-domain values (-1 to 1)

  // Draw frequency spectrum as bars
  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = map(spectrum[i], 0, 255, 0, height);
    let hue = map(i, 0, spectrum.length, 0, 360);
    colorMode(HSB, 360, 100, 100);
    fill(hue, 80, 80);
    rect(x, height - h, width / spectrum.length, h);
  }

  // Draw waveform
  colorMode(RGB, 255);
  stroke(255, 200);
  strokeWeight(1);
  noFill();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height * 0.1, height * 0.4);
    vertex(x, y);
  }
  endShape();

  fill(255);
  textSize(14);
  text("Click to play/pause", 10, 20);
}

function mousePressed() {
  userStartAudio();
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.play();
  }
}
```

### Using FFT with Microphone Input

```js
let mic, fft;

function setup() {
  createCanvas(600, 300);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);
}

function draw() {
  background(20);

  let spectrum = fft.analyze();

  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = map(spectrum[i], 0, 255, 0, height);
    fill(100, 200, 255, 200);
    rect(x, height - h, width / spectrum.length + 1, h);
  }

  fill(255);
  text("Microphone input - speak or play music!", 10, 20);
}

function mousePressed() {
  userStartAudio();
}
```

---

## Recording Audio

p5.sound can record audio from any source.

```js
let mic, recorder, soundFile;
let isRecording = false;

function setup() {
  createCanvas(400, 200);
  mic = new p5.AudioIn();
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  soundFile = new p5.SoundFile();
}

function draw() {
  background(isRecording ? color(100, 20, 20) : color(30));
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);

  if (isRecording) {
    text("RECORDING... Click to stop", width / 2, height / 2);
  } else {
    text("Click to record / Press P to play", width / 2, height / 2);
  }
}

function mousePressed() {
  userStartAudio();
  if (isRecording) {
    recorder.stop();
    isRecording = false;
  } else {
    recorder.record(soundFile);
    isRecording = true;
  }
}

function keyPressed() {
  if (key === 'p' && !isRecording && soundFile.duration() > 0) {
    soundFile.play();
  }
}
```

---

## Complete Example: Simple Synthesizer

This example creates a playable keyboard synthesizer with multiple waveforms and a filter.

```js
let osc, env, filter;
let waveform = "sine";
let notes = {};

// Musical notes: keyboard keys mapped to frequencies
let keyMap = {
  'a': 261.63,  // C4
  'w': 277.18,  // C#4
  's': 293.66,  // D4
  'e': 311.13,  // D#4
  'd': 329.63,  // E4
  'f': 349.23,  // F4
  't': 369.99,  // F#4
  'g': 392.00,  // G4
  'y': 415.30,  // G#4
  'h': 440.00,  // A4
  'u': 466.16,  // A#4
  'j': 493.88,  // B4
  'k': 523.25   // C5
};

// White and black key layout
let whiteKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
let blackKeys = ['w', 'e', '', 't', 'y', 'u', ''];
let whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

function setup() {
  createCanvas(600, 300);

  filter = new p5.LowPass();
  filter.freq(3000);
  filter.res(2);

  osc = new p5.Oscillator(waveform);
  osc.disconnect();
  osc.connect(filter);
  osc.amp(0);
  osc.start();

  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.4, 0.3);
  env.setRange(0.4, 0);
}

function draw() {
  background(30);

  drawKeyboard();
  drawControls();
}

function drawKeyboard() {
  let keyWidth = 60;
  let keyHeight = 180;
  let startX = 50;
  let startY = 100;

  // Draw white keys
  for (let i = 0; i < whiteKeys.length; i++) {
    let x = startX + i * keyWidth;
    let pressed = keyIsDown(whiteKeys[i].charCodeAt(0));

    fill(pressed ? color(200, 230, 255) : 240);
    stroke(0);
    strokeWeight(1);
    rect(x, startY, keyWidth - 2, keyHeight);

    fill(100);
    noStroke();
    textAlign(CENTER);
    textSize(12);
    text(whiteNotes[i], x + keyWidth / 2 - 1, startY + keyHeight - 15);
    textSize(10);
    text(whiteKeys[i].toUpperCase(), x + keyWidth / 2 - 1, startY + keyHeight - 30);
  }

  // Draw black keys
  let blackOffsets = [0, 1, -1, 3, 4, 5, -1]; // Positions relative to white keys
  for (let i = 0; i < blackKeys.length; i++) {
    if (blackKeys[i] === '') continue;
    let x = startX + (i + 0.65) * keyWidth;
    let bw = keyWidth * 0.6;
    let bh = keyHeight * 0.6;
    let pressed = keyIsDown(blackKeys[i].charCodeAt(0));

    fill(pressed ? color(80, 80, 120) : 30);
    stroke(0);
    strokeWeight(1);
    rect(x, startY, bw, bh);
  }
}

function drawControls() {
  fill(200);
  noStroke();
  textSize(14);
  textAlign(LEFT);
  text("Waveform: " + waveform + "  (1=sine 2=square 3=saw 4=tri)", 10, 20);
  text("Play with keys: A S D F G H J K (white) | W E T Y U (black)", 10, 45);
  text("Filter cutoff: mouse X | Resonance: mouse Y", 10, 65);

  // Update filter with mouse
  let cutoff = map(mouseX, 0, width, 200, 8000);
  let res = map(mouseY, height, 0, 0.5, 10);
  filter.freq(cutoff);
  filter.res(res);
}

function keyPressed() {
  userStartAudio();

  // Change waveform
  if (key === '1') { waveform = "sine"; osc.setType(waveform); }
  if (key === '2') { waveform = "square"; osc.setType(waveform); }
  if (key === '3') { waveform = "sawtooth"; osc.setType(waveform); }
  if (key === '4') { waveform = "triangle"; osc.setType(waveform); }

  // Play note
  let noteKey = key.toLowerCase();
  if (keyMap[noteKey] && !notes[noteKey]) {
    osc.freq(keyMap[noteKey]);
    env.play(osc);
    notes[noteKey] = true;
  }
}

function keyReleased() {
  let noteKey = key.toLowerCase();
  notes[noteKey] = false;
}
```

---

## Complete Example: Sound Effects Generator

Generate retro-style sound effects procedurally.

```js
function setup() {
  createCanvas(400, 300);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(30);
  fill(255);
  textSize(14);
  text("Press keys for sound effects:", width / 2, 30);
  text("1 = Jump  2 = Coin  3 = Explosion  4 = Laser", width / 2, 60);

  // Draw buttons
  let labels = ["Jump", "Coin", "Boom", "Laser"];
  for (let i = 0; i < 4; i++) {
    let x = 50 + i * 85;
    fill(60, 80, 120);
    rect(x, 100, 75, 50, 5);
    fill(255);
    textSize(14);
    text(labels[i], x + 37, 125);
    textSize(10);
    text(i + 1, x + 37, 140);
  }
}

function keyPressed() {
  userStartAudio();
  if (key === '1') playJump();
  if (key === '2') playCoin();
  if (key === '3') playExplosion();
  if (key === '4') playLaser();
}

function mousePressed() {
  userStartAudio();
  // Check button clicks
  for (let i = 0; i < 4; i++) {
    let x = 50 + i * 85;
    if (mouseX > x && mouseX < x + 75 && mouseY > 100 && mouseY < 150) {
      if (i === 0) playJump();
      if (i === 1) playCoin();
      if (i === 2) playExplosion();
      if (i === 3) playLaser();
    }
  }
}

function playJump() {
  let osc = new p5.Oscillator("sine");
  osc.freq(300);
  osc.amp(0.3);
  osc.start();

  // Sweep frequency up
  osc.freq(600, 0.15);
  setTimeout(() => {
    osc.amp(0, 0.1);
    setTimeout(() => osc.stop(), 150);
  }, 150);
}

function playCoin() {
  let osc = new p5.Oscillator("square");
  osc.amp(0.2);
  osc.freq(988); // B5
  osc.start();

  setTimeout(() => {
    osc.freq(1319); // E6
    setTimeout(() => {
      osc.amp(0, 0.1);
      setTimeout(() => osc.stop(), 150);
    }, 100);
  }, 80);
}

function playExplosion() {
  let noise = new p5.Noise("white");
  let filter = new p5.LowPass();
  noise.disconnect();
  noise.connect(filter);
  filter.freq(1000);
  noise.amp(0.5);
  noise.start();

  // Filter sweep down
  filter.freq(100, 0.5);
  noise.amp(0, 0.5);
  setTimeout(() => noise.stop(), 600);
}

function playLaser() {
  let osc = new p5.Oscillator("sawtooth");
  osc.freq(1500);
  osc.amp(0.2);
  osc.start();

  // Sweep down
  osc.freq(100, 0.3);
  osc.amp(0, 0.3);
  setTimeout(() => osc.stop(), 400);
}
```

---

## The Web Audio API (Beyond p5.sound)

p5.sound is built on the **Web Audio API**, which is a lower-level browser API for audio. You can use it directly for more control.

```js
let audioCtx;

function setup() {
  createCanvas(400, 200);
}

function mousePressed() {
  // Create AudioContext on user gesture
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Create an oscillator node
  let oscillator = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

function draw() {
  background(30);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Click for Web Audio API tone", width / 2, height / 2);
}
```

### Web Audio API Node Graph

The Web Audio API works by connecting **nodes** in a graph:

```
[OscillatorNode] --> [GainNode] --> [BiquadFilterNode] --> [destination (speakers)]
```

Each node processes audio and passes it to the next. This is conceptually similar to modular synthesis, where you patch cables between modules.

---

## Connecting Visuals to Audio

### Audio-Reactive Visuals

```js
let mic, fft;
let particles = [];

function setup() {
  createCanvas(600, 400);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 64);
  fft.setInput(mic);
}

function draw() {
  background(10, 10, 20, 40);

  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");         // 20-140 Hz
  let mid = fft.getEnergy("mid");           // 400-2600 Hz
  let treble = fft.getEnergy("treble");     // 2600-5200 Hz

  // Spawn particles based on bass energy
  if (bass > 150) {
    let count = map(bass, 150, 255, 1, 5);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: random(-5, 5),
        vy: random(-5, 5),
        life: 100,
        size: map(bass, 150, 255, 3, 15),
        hue: map(mid, 0, 255, 0, 360)
      });
    }
  }

  // Update and draw particles
  colorMode(HSB, 360, 100, 100, 100);
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1.5;

    noStroke();
    fill(p.hue, 70, 90, p.life);
    circle(p.x, p.y, p.size);

    if (p.life <= 0) particles.splice(i, 1);
  }

  // Draw center circle pulsing with treble
  let centerSize = map(treble, 0, 255, 20, 100);
  colorMode(RGB, 255);
  noFill();
  stroke(200, 230, 255, 150);
  strokeWeight(2);
  circle(width / 2, height / 2, centerSize);

  fill(200);
  noStroke();
  textSize(12);
  text("Speak or play music into your microphone", 10, 20);
  text(`Bass: ${bass} | Mid: ${mid} | Treble: ${treble}`, 10, 40);
}

function mousePressed() {
  userStartAudio();
}
```

---

## Exercises

1. **Theremin**: Create a sketch where mouse X controls pitch and mouse Y controls volume. Add a visual representation of the waveform using `fft.waveform()`.

2. **Drum Machine**: Create a simple 8-step sequencer. Use a grid of clickable cells (4 rows for kick, snare, hihat, and clap). The sequencer steps forward in time and triggers the appropriate sounds. Use noise bursts with filters for drum sounds.

3. **Audio Visualizer**: Load an MP3 file and create a circular visualization where the FFT spectrum is drawn as bars radiating outward from the center. Color the bars by frequency range.

4. **Sound Toy**: Create an interactive sound toy where dragging the mouse creates sounds and visuals simultaneously. Different areas of the canvas should produce different tones. Make it satisfying to play with.

---

## Further Reading

- p5.sound reference: <https://p5js.org/reference/p5.sound/>
- Web Audio API (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
- Tone.js (alternative audio library): <https://tonejs.github.io>
- The Coding Train, Sound tutorials: <https://thecodingtrain.com/tracks/sound>
- Audio-reactive tutorial from class: <https://editor.p5js.org/kybr/sketches/kgHiFCtu7>
