# Lesson: Audio in Creative Coding

**MAT 200C: Computing Arts -- Week 7, February 17**

---

## Overview

This lesson provides a broad survey of audio in creative coding. We will explore the Web Audio API that powers browser-based audio, the capabilities and limitations of p5.sound, the mathematics behind frequency analysis, techniques for onset and pitch detection, and how browser-based audio compares with desktop tools like Max/MSP.

---

## 1. The Web Audio API

All browser-based audio -- including p5.sound -- is built on the **Web Audio API**, a powerful standard supported by all modern browsers.

### The Audio Graph

The Web Audio API uses a node-based architecture. Audio flows through a graph of connected nodes:

```
Source Node → Processing Nodes → Destination Node (speakers)
```

Sources can be:
- **Oscillators**: Generate tones (sine, square, triangle, sawtooth)
- **Audio buffers**: Pre-loaded sound files
- **Media streams**: Microphone input, other live sources

Processing nodes include:
- **GainNode**: Volume control
- **BiquadFilterNode**: Low-pass, high-pass, band-pass filters
- **AnalyserNode**: FFT analysis (this is what `p5.FFT` wraps)
- **DelayNode**: Echo/delay
- **ConvolverNode**: Reverb via convolution with an impulse response
- **WaveShaperNode**: Distortion
- **DynamicsCompressorNode**: Automatic volume leveling
- **PannerNode**: 3D spatial positioning of sound

### AudioContext

Everything starts with an **AudioContext**, which manages the audio graph and timing:

```js
// Raw Web Audio API (not p5.sound):
let audioCtx = new AudioContext();
let oscillator = audioCtx.createOscillator();
let gainNode = audioCtx.createGain();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.frequency.value = 440; // A4
gainNode.gain.value = 0.3;

oscillator.start();
```

p5.sound wraps all of this so you do not need to manage the audio graph manually. But understanding the underlying architecture helps when you encounter limitations or need to do something p5.sound does not support directly.

### Sample Rate and Buffer Size

Digital audio is represented as a stream of numerical samples. The **sample rate** determines how many samples per second are used:

- **44,100 Hz** -- CD quality (most common)
- **48,000 Hz** -- Video/broadcast standard
- **96,000 Hz** -- High-resolution audio

The **buffer size** determines how many samples are processed at once. Smaller buffers mean lower latency (delay between input and output) but higher CPU load. Typical values: 256, 512, 1024, 2048 samples.

The Web Audio API typically runs at 44,100 or 48,000 Hz with a buffer size chosen by the browser.

---

## 2. p5.sound Capabilities and Limitations

### What p5.sound Does Well

- **Simplicity**: Loading, playing, and controlling sound files is straightforward.
- **FFT analysis**: Easy access to frequency spectrum and waveform data.
- **Microphone input**: Simple API for live audio capture.
- **Basic synthesis**: Oscillators with common waveforms.
- **Effects**: Built-in delay, reverb, and filter.
- **Integration with p5.js**: Works seamlessly with the draw loop and p5.js conventions.

### Limitations

- **Latency**: Browser audio has inherent latency (typically 10-50ms). For real-time musical performance, this can be noticeable.
- **Precision timing**: JavaScript's `setTimeout` and `requestAnimationFrame` are not precise enough for tight musical timing. The Web Audio API has its own scheduling system (`audioCtx.currentTime`), but p5.sound does not fully expose it.
- **Limited synthesis**: p5.sound provides basic oscillators but lacks advanced synthesis techniques (FM synthesis, granular synthesis, additive synthesis) without significant manual work.
- **No MIDI support**: p5.sound does not handle MIDI input/output. You need the Web MIDI API directly.
- **Sound file formats**: Browser support varies. MP3 works everywhere, OGG works in Firefox/Chrome but not Safari, WAV works everywhere but files are large.
- **Mobile limitations**: Mobile browsers are particularly restrictive about audio autoplay and may have higher latency.

---

## 3. The Fourier Transform and Frequency Domain

### Time Domain vs. Frequency Domain

Sound exists in two complementary representations:

- **Time domain**: Amplitude (loudness) over time. This is what a microphone captures -- a waveform that goes up and down.
- **Frequency domain**: Amplitude at each frequency. This tells you which pitches are present and how loud each one is.

The **Fourier Transform** converts between these two representations. The **Fast Fourier Transform (FFT)** is an efficient algorithm for computing this conversion.

### Intuition

Imagine you are listening to a chord on a guitar -- three notes played simultaneously. In the time domain, the waveform is a complex, messy shape (the sum of three sine waves at different frequencies). In the frequency domain, you see three clear peaks at the frequencies of the three notes.

### What FFT Gives You

When you call `fft.analyze()` in p5.js, you get an array of amplitude values. Each element corresponds to a frequency bin:

- **Bin 0**: 0 Hz (DC offset, usually ignored)
- **Bin 1**: Sample rate / FFT size Hz (e.g., 44100/1024 = ~43 Hz)
- **Bin N**: N * (sample rate / FFT size) Hz

With 1024 bins and a 44,100 Hz sample rate, each bin spans about 43 Hz. This means you cannot distinguish between two frequencies that are closer than 43 Hz apart. Using more bins (e.g., 4096) gives finer resolution but responds more slowly to changes.

### The Frequency Spectrum of Common Sounds

| Sound | Frequency Range |
|-------|----------------|
| Bass drum kick | 60-100 Hz |
| Bass guitar | 40-400 Hz |
| Human voice (male) | 85-180 Hz fundamental |
| Human voice (female) | 165-255 Hz fundamental |
| Clapping | Broadband, 1000-5000 Hz peak |
| Cymbal | 3000-15000 Hz |
| Whistling | 500-5000 Hz |

### Frequency Bands in p5.sound

p5.sound divides the spectrum into named bands:

| Band | Frequency Range |
|------|----------------|
| `"bass"` | 20-140 Hz |
| `"lowMid"` | 140-400 Hz |
| `"mid"` | 400-2600 Hz |
| `"highMid"` | 2600-5200 Hz |
| `"treble"` | 5200-14000 Hz |

---

## 4. Onset Detection

**Onset detection** identifies the moments when a new sound event begins -- a drum hit, a note attack, a clap. This is useful for triggering visual events in sync with music.

### Simple Energy Threshold

The simplest approach: compare the current volume to a threshold.

```js
let prevLevel = 0;
let threshold = 0.15;

function draw() {
  let level = mic.getLevel();

  // Detect onset: volume crosses threshold going upward
  if (level > threshold && prevLevel <= threshold) {
    // ONSET DETECTED -- trigger visual event
    triggerFlash();
  }

  prevLevel = level;
}
```

### Spectral Flux

A more robust approach: compute the "spectral flux" -- how much the spectrum changed between frames. Large changes indicate onsets.

```js
let prevSpectrum = [];

function draw() {
  let spectrum = fft.analyze();

  let flux = 0;
  for (let i = 0; i < spectrum.length; i++) {
    let diff = spectrum[i] - (prevSpectrum[i] || 0);
    if (diff > 0) flux += diff; // only count increases
  }

  if (flux > 500) { // threshold depends on your input
    // ONSET DETECTED
    triggerFlash();
  }

  prevSpectrum = spectrum.slice();
}
```

Spectral flux is better than simple volume because it detects the *change* in sound, not just loudness. A sustained loud note will not trigger repeatedly, but a new drum hit on top of it will.

### Band-Specific Onset

You can detect onsets in specific frequency bands:

```js
let prevBass = 0;

function draw() {
  fft.analyze();
  let bass = fft.getEnergy("bass");

  if (bass - prevBass > 50) {
    // BASS ONSET -- kick drum detected
    triggerBassVisual();
  }

  prevBass = bass;
}
```

---

## 5. Pitch Detection

**Pitch detection** identifies the fundamental frequency of a sound -- what musical note is being played or sung. This is harder than onset detection because real-world sounds contain many frequencies (harmonics), and the fundamental is not always the loudest.

### Simple Peak Detection

The simplest approach: find the frequency bin with the highest amplitude.

```js
function getDominantFrequency() {
  let spectrum = fft.analyze();

  let maxAmp = 0;
  let maxIndex = 0;

  // Skip bin 0 (DC) and very low bins
  for (let i = 5; i < spectrum.length; i++) {
    if (spectrum[i] > maxAmp) {
      maxAmp = spectrum[i];
      maxIndex = i;
    }
  }

  // Convert bin index to frequency
  let nyquist = sampleRate() / 2;
  let frequency = maxIndex * (nyquist / spectrum.length);

  return frequency;
}
```

This works for simple, clean tones but fails for complex sounds where harmonics are louder than the fundamental.

### Frequency to Musical Note

```js
function frequencyToNote(freq) {
  // A4 = 440 Hz, each semitone is a factor of 2^(1/12)
  let noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let semitones = 12 * Math.log2(freq / 440);
  let noteIndex = Math.round(semitones) + 9; // A is index 9
  let octave = Math.floor((noteIndex + 3) / 12) + 4;
  let name = noteNames[((noteIndex % 12) + 12) % 12];
  return name + octave;
}
```

---

## 6. Comparison: p5.sound vs. Max/MSP

### Max/MSP

**Max/MSP** (by Cycling '74) is a desktop application for visual programming of music, audio, and multimedia. It uses a node-and-cable (patch cord) paradigm where you connect objects together to build audio and visual processing systems.

### Comparison Table

| Feature | p5.sound (Browser) | Max/MSP (Desktop) |
|---------|--------------------|--------------------|
| **Platform** | Any web browser | Mac/Windows application |
| **Programming model** | Text-based (JavaScript) | Visual (node graph) |
| **Latency** | 10-50ms (browser overhead) | 1-5ms (direct hardware access) |
| **Audio quality** | 44.1/48kHz, limited by browser | Up to 192kHz, ASIO/CoreAudio |
| **Synthesis** | Basic oscillators | Comprehensive (FM, granular, physical modeling, etc.) |
| **MIDI** | Requires Web MIDI API | Built-in, comprehensive |
| **Hardware I/O** | Limited (webcam, mic) | Extensive (MIDI controllers, sensors, DMX, serial) |
| **Visual output** | Canvas/WebGL (strong) | Jitter (OpenGL), also strong |
| **Cost** | Free | Subscription or perpetual license |
| **Distribution** | Share via URL | Export as standalone app |
| **Community** | p5.js community, web dev community | Electronic music, sound art, academic |
| **Real-time performance** | Good for visuals, limited for precise audio | Excellent for both |
| **Learning curve** | Moderate (need to learn JavaScript) | Moderate (need to learn Max paradigm) |

### When to Use Each

**Use p5.sound when:**
- Your primary output is visual with audio as input/supplement
- You want to distribute work via the web
- You are prototyping quickly
- You want to combine audio with computer vision, data, or web APIs
- The audience interaction is through a browser

**Use Max/MSP when:**
- Audio is the primary medium
- You need precise timing for musical performance
- You are working with MIDI controllers, sensors, or hardware
- You need advanced synthesis or audio processing
- You are building an installation with specific hardware requirements
- Low latency is critical

### Bridging the Two

Max/MSP and p5.js can communicate:

- **OSC (Open Sound Control)**: Max can send/receive OSC messages over the network. p5.js can use the `osc` library or WebSocket bridges.
- **WebSocket**: Max has a `jweb` object and networking objects. p5.js can use WebSocket to send/receive data.
- **MIDI via WebMIDI**: p5.js can access MIDI devices through the Web MIDI API, which could include virtual MIDI ports shared with Max.

---

## 7. Practical Tips for Audio-Reactive Visuals

### Smoothing

Raw FFT data is noisy. Use smoothing to prevent jittery visuals:

```js
// Built-in FFT smoothing
let fft = new p5.FFT(0.85); // 0.85 = heavy smoothing

// Manual smoothing (exponential moving average)
let smoothBass = 0;
function draw() {
  fft.analyze();
  let rawBass = fft.getEnergy("bass");
  smoothBass = lerp(smoothBass, rawBass, 0.1); // 0.1 = responsiveness
  // Use smoothBass instead of rawBass for visuals
}
```

### Normalization

Audio levels vary enormously between sources. What works with your microphone may be too quiet or too loud with a different input. Implement automatic gain:

```js
let maxSeen = 1;

function draw() {
  fft.analyze();
  let bass = fft.getEnergy("bass");

  // Track the maximum value seen
  if (bass > maxSeen) maxSeen = bass;
  maxSeen *= 0.999; // slowly decay to adapt to changes

  // Normalize to 0-1 range based on observed maximum
  let normalizedBass = bass / maxSeen;

  // Use normalizedBass for visual mapping
}
```

### Mapping Strategies

Some effective mappings between audio and visuals:

| Audio Parameter | Visual Parameter | Effect |
|----------------|-----------------|--------|
| Bass energy | Size / scale | Pulsing to the beat |
| Bass onset | Camera shake / flash | Impact on beat drops |
| Mid energy | Color saturation | Warmth during melodies |
| Treble energy | Particle count / sparkle | Shimmer on hi-hats |
| Overall volume | Brightness | General energy |
| Dominant frequency | Hue | Pitch-to-color synesthesia |
| Waveform shape | Contour / outline | Direct sound visualization |
| Spectral centroid | Blur / sharpness | Brightness of timbre |

---

## Summary

| Topic | Key Takeaway |
|-------|-------------|
| Web Audio API | Node-based audio graph in the browser; p5.sound wraps it |
| p5.sound | Good for analysis and basic synthesis; limited for precise musical timing |
| FFT | Converts time-domain audio to frequency-domain; `fft.analyze()` and `fft.getEnergy()` |
| Onset detection | Detect volume or spectral flux crossing a threshold |
| Pitch detection | Find the dominant frequency bin in the spectrum |
| Max/MSP | Desktop tool for serious audio work; lower latency, more synthesis options |
| Smoothing | Essential for non-jittery audio-reactive visuals; use `lerp()` or FFT smoothing |

---

## Further Reading

- MDN Web Audio API documentation: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
- p5.sound reference: <https://p5js.org/reference/#/libraries/p5.sound>
- Max/MSP: <https://cycling74.com/products/max>
- "Visualizing Music with p5.js" by Jason Sigal (creator of p5.sound)
- The Coding Train: Sound tutorials by Daniel Shiffman
