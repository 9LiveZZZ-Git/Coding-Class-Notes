# Lesson: Determinism and Pseudorandomness

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Introduction

When you call `random()` in p5.js, you get what appears to be a random number. But is it truly random? The answer is no -- and that is a feature, not a bug. Computers are deterministic machines. Every output they produce is the result of a precise, repeatable process. Understanding this distinction between "true" randomness and "pseudo" randomness is essential for generative art.

This lesson covers:

1. What determinism means for computing
2. How pseudorandom number generators (PRNGs) work
3. The xorshift algorithm as an example
4. Why `randomSeed()` is powerful for generative art
5. Reproducibility and sharing generative works

---

## Part 1: Deterministic Systems

### What Is Determinism?

A **deterministic** system is one where the same inputs always produce the same outputs. There is no ambiguity, no chance -- just pure cause and effect.

A computer is a deterministic machine:
- The CPU executes instructions in a fixed order.
- Given the same program and the same initial data, it will always produce the same result.
- Every bit of memory has a definite value at every moment.

This is why computers are reliable -- but it creates a problem: **how do you generate randomness on a machine that has no randomness?**

### Determinism in Daily Life

- A **calculator** is deterministic: 2 + 2 is always 4.
- A **recipe** is deterministic: the same ingredients and steps produce the same dish (ideally).
- A **coin flip** is non-deterministic (from our perspective): we cannot predict the outcome.

Programs are like recipes. If you follow the same steps with the same starting conditions, you get the same result. Always.

---

## Part 2: Pseudorandom Number Generators (PRNGs)

### The Core Idea

A **pseudorandom number generator (PRNG)** is a deterministic algorithm that produces a sequence of numbers that *appear* random but are completely determined by an initial value called the **seed**.

Key properties:
- **Deterministic:** Given the same seed, a PRNG always produces the same sequence.
- **Statistically random-looking:** The output passes many statistical tests for randomness.
- **Periodic:** Eventually, the sequence repeats (but good PRNGs have extremely long periods).
- **Fast:** PRNGs are much faster than gathering "true" randomness from hardware.

### A Simple (Bad) PRNG

The simplest example is the **linear congruential generator (LCG)**:

```
next = (a * current + c) % m
```

Where `a`, `c`, and `m` are constants, and `current` starts as the seed.

```js
function setup() {
  createCanvas(600, 400);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(14);
  textFont('monospace');

  // A simple LCG (Linear Congruential Generator)
  let a = 1664525;
  let c = 1013904223;
  let m = Math.pow(2, 32);
  let state = 42; // The seed

  text("Simple LCG (seed = 42):", 20, 30);
  text("Formula: next = (1664525 * current + 1013904223) % 2^32", 20, 55);

  for (let i = 0; i < 15; i++) {
    state = (a * state + c) % m;
    let normalized = state / m; // Scale to [0, 1)
    text("Step " + (i + 1).toString().padStart(2, ' ') + ": " +
         state.toString().padStart(12, ' ') +
         "  ->  " + normalized.toFixed(6), 20, 85 + i * 20);
  }
}
```

The numbers *look* random, but if you run this program again with the same seed (42), you get the **exact same sequence**. That is the definition of pseudorandom.

---

## Part 3: The C++ PRNG Example Explained

In lecture, a C++ PRNG was shown. Let us break it down in detail:

```
// C++ Pseudocode for a simple PRNG
unsigned int state = seed;

unsigned int next() {
    state = state * 1103515245 + 12345;
    return (state / 65536) % 32768;
}
```

Here is what each part does:

1. **`state`**: This is the internal memory of the PRNG. It starts as the seed value.
2. **`state * 1103515245 + 12345`**: This scrambles the state using multiplication and addition. The constants are carefully chosen so the sequence has good statistical properties.
3. **`/ 65536`**: This is a right shift by 16 bits (`>> 16`). It discards the low bits, which tend to have poor randomness in LCGs.
4. **`% 32768`**: This keeps only the lower 15 bits of the result, giving a number between 0 and 32767.

The key insight: **the entire process is pure arithmetic**. No dice, no quantum effects, no atmospheric noise. Just multiply, add, shift, and mask. Yet the output *appears* random.

### JavaScript Equivalent

```js
let state;

function prngInit(seed) {
  state = seed;
}

function prngNext() {
  state = (state * 1103515245 + 12345) & 0x7FFFFFFF; // Keep 31 bits
  return state;
}

function prngFloat() {
  // Return a float between 0 and 1
  return prngNext() / 0x7FFFFFFF;
}

function setup() {
  createCanvas(500, 500);
  noLoop();
}

function draw() {
  background(255);

  // Generate a "random" pattern using our custom PRNG
  prngInit(12345); // Seed

  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = floor(prngFloat() * 256);
      let idx = (y * width + x) * 4;
      pixels[idx] = val;       // R
      pixels[idx + 1] = val;   // G
      pixels[idx + 2] = val;   // B
      pixels[idx + 3] = 255;   // A
    }
  }
  updatePixels();
}
```

This draws a "random" grayscale noise pattern using our own PRNG. Run it multiple times -- the pattern is always identical because we always start with seed 12345.

---

## Part 4: The Xorshift Algorithm

**Xorshift** is a family of PRNGs invented by George Marsaglia in 2003. They are extremely fast and produce good-quality pseudorandom numbers using only XOR and bit shift operations.

### How It Works

The xorshift32 algorithm:

```
state ^= (state << 13);   // XOR state with itself shifted left 13
state ^= (state >> 17);   // XOR state with itself shifted right 17
state ^= (state << 5);    // XOR state with itself shifted left 5
```

That is it. Three lines. No multiplication, no addition -- just XOR and shifts.

### Why XOR?

- XOR mixes bits effectively: each output bit depends on multiple input bits.
- XOR is its own inverse: `a ^ b ^ b = a`. This ensures no information is lost.
- Shifts spread the influence of each bit to neighboring positions.
- Together, these operations create an avalanche effect: a tiny change in the state causes massive changes in the output.

### Xorshift in JavaScript

```js
let xorState;

function xorshiftInit(seed) {
  xorState = seed;
}

function xorshift32() {
  xorState ^= xorState << 13;
  xorState ^= xorState >> 17;
  xorState ^= xorState << 5;
  // In JS, force to 32-bit unsigned integer
  xorState = xorState >>> 0;
  return xorState;
}

function xorshiftFloat() {
  return xorshift32() / 0xFFFFFFFF;
}

function setup() {
  createCanvas(600, 400);
  noLoop();
}

function draw() {
  background(255);
  fill(0);
  textSize(12);
  textFont('monospace');

  text("Xorshift32 PRNG (seed = 1):", 20, 25);

  xorshiftInit(1);

  // Show the first 20 values
  for (let i = 0; i < 20; i++) {
    let val = xorshift32();
    let binary = (val >>> 0).toString(2).padStart(32, '0');
    let col = i < 10 ? 0 : 300;
    let row = i < 10 ? i : i - 10;
    text((i + 1).toString().padStart(2, ' ') + ": " +
         val.toString().padStart(10, ' '), 20 + col, 50 + row * 20);
  }

  // Visualize randomness as a dot plot
  xorshiftInit(42);
  let dotY = 270;
  text("Dot plot (2000 random points):", 20, dotY);
  dotY += 15;

  stroke(0, 100);
  strokeWeight(2);
  for (let i = 0; i < 2000; i++) {
    let x = xorshiftFloat() * (width - 40) + 20;
    let y = dotY + xorshiftFloat() * 100;
    point(x, y);
  }
}
```

---

## Part 5: `randomSeed()` in p5.js

p5.js provides `randomSeed()` to control the PRNG that `random()` uses internally. When you set a seed, every subsequent call to `random()` produces the same sequence.

### Without a Seed (Different Every Time)

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(255);
  noStroke();

  for (let i = 0; i < 100; i++) {
    fill(random(255), random(255), random(255), 150);
    ellipse(random(width), random(height), random(10, 50));
  }
}
```

Click "Play" multiple times -- you get a different image every time.

### With a Seed (Same Every Time)

```js
function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(255);
  randomSeed(42); // <-- This is the only change
  noStroke();

  for (let i = 0; i < 100; i++) {
    fill(random(255), random(255), random(255), 150);
    ellipse(random(width), random(height), random(10, 50));
  }
}
```

Now every time you run it, you get the **exact same** arrangement of circles. Change the seed from 42 to 43, and you get a completely different (but equally reproducible) image.

---

## Part 6: Why Pseudorandomness Matters for Generative Art

### 1. Reproducibility

You create a generative piece. Among thousands of possible outputs, you find one that is stunning. Without a seed, that exact image is lost forever the moment you reload the page.

With `randomSeed()`, you can record the seed (just a single number) and recreate that exact image anytime.

```js
// Found a beautiful composition with seed 7829
function draw() {
  randomSeed(7829);
  // ... the rest of your code
}
```

### 2. Exploration

You can systematically explore the "space" of possible outputs:

```js
let currentSeed = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  randomSeed(currentSeed);
  noStroke();

  // Your generative algorithm
  for (let i = 0; i < 50; i++) {
    fill(random(255), random(100, 200), random(255), 100);
    let x = random(width);
    let y = random(height);
    let s = random(20, 80);
    ellipse(x, y, s, s);
  }

  // Display seed number
  fill(0);
  textSize(16);
  text("Seed: " + currentSeed, 10, 30);
  text("Press any key for next", 10, 50);

  noLoop();
}

function keyPressed() {
  currentSeed++;
  loop();
}
```

Press any key to cycle through seeds. When you find one you like, write down the seed number.

### 3. Sharing and Verification

In the NFT/generative art world, reproducibility is essential. A collector can verify that a piece was generated by a specific algorithm with a specific seed. The seed becomes the "identity" of the artwork.

### 4. Animation Consistency

If your animated sketch uses randomness for initial conditions but you want it to restart identically:

```js
function setup() {
  createCanvas(400, 400);
  randomSeed(99);
  // Initialize positions, colors, etc. using random()
  // They will be the same every time the sketch starts
}
```

---

## Part 7: True Randomness vs. Pseudorandomness

| Property | True Random | Pseudorandom |
|----------|------------|--------------|
| Source | Physical processes (radioactive decay, thermal noise, quantum effects) | Mathematical algorithms |
| Reproducible? | No | Yes (with the same seed) |
| Speed | Slow (limited by physical process) | Very fast |
| Predictable? | No | Yes (if you know the algorithm and state) |
| Use in art | Unique, unrepeatable works | Reproducible, shareable works |
| Use in crypto | Essential (key generation) | Dangerous (keys could be predicted) |

For generative art, pseudorandomness is almost always what you want. True randomness is important for cryptography and gambling, but for art, reproducibility is a feature.

### How Computers Get True Randomness

When true randomness is needed, computers use **hardware random number generators** that measure physical phenomena:

- Thermal noise in resistors
- Timing of user input (keyboard, mouse movements)
- Atmospheric noise (random.org)
- Radioactive decay

These are used to seed PRNGs or for security-critical applications. JavaScript's `Math.random()` is typically seeded from the operating system's entropy pool, which gathers randomness from hardware. This is why `Math.random()` (and p5.js's `random()` without a seed) gives different results each time -- it starts from a different seed derived from system entropy.

---

## Part 8: Visualizing the Difference Between Seeds

```js
function setup() {
  createCanvas(800, 400);
  noLoop();
}

function draw() {
  background(255);

  // Draw 4 images side by side, each with a different seed
  let seeds = [1, 2, 42, 1000];
  let panelWidth = width / seeds.length;

  for (let s = 0; s < seeds.length; s++) {
    randomSeed(seeds[s]);

    let offsetX = s * panelWidth;

    // Draw a generative pattern
    for (let i = 0; i < 80; i++) {
      let x = offsetX + random(panelWidth);
      let y = random(50, height - 30);
      let size = random(5, 30);

      noStroke();
      fill(random(255), random(255), random(255), 100);
      ellipse(x, y, size, size);
    }

    // Label
    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER);
    text("Seed: " + seeds[s], offsetX + panelWidth / 2, 25);

    // Divider line
    if (s > 0) {
      stroke(200);
      line(offsetX, 0, offsetX, height);
    }
  }
}
```

Each panel shows a different "universe" determined by its seed. The algorithm is identical; only the seed differs. Each seed deterministically produces a unique but reproducible composition.

---

## Part 9: The Seed as Artistic Parameter

An interesting philosophical point: in generative art, the artist designs the **algorithm** (the rules, the parameters, the aesthetic choices), and the **seed** selects a specific instance from the space of all possible outputs.

This is similar to how a composer writes a score (the algorithm) and a performer interprets it (the seed). Or how DNA (the algorithm) combines with environmental factors (the seed) to produce a unique organism.

The seed is a single number that encodes an entire visual composition. This is a remarkable compression of information -- the seed "contains" the image, but only in conjunction with the algorithm that interprets it.

---

## Exercises

1. **Seed gallery.** Create a sketch that draws a grid of 16 small images, each generated with a different seed (0 through 15). Find your favorite.

2. **Interactive seed explorer.** Map `mouseX` to the seed value. As you move the mouse, the image changes. When you find a composition you like, press a key to print the seed to the console.

3. **Build your own PRNG.** Implement the xorshift32 algorithm in p5.js and use it instead of `random()` to generate a visual pattern. Verify that the same seed always produces the same pattern.

4. **PRNG quality test.** Generate 10,000 random points with your custom PRNG and plot them. Do they look uniformly distributed? Compare with p5.js's built-in `random()`.

5. **Seed as signature.** Create a generative portrait where the seed is your student ID number. The resulting image is uniquely "yours" but anyone can verify it by running the same code with your ID.

---

## Key Takeaways

- Computers are **deterministic machines**. They cannot produce true randomness through computation alone.
- A **PRNG** is a deterministic algorithm that produces numbers that appear random.
- The **seed** initializes the PRNG and completely determines the entire sequence.
- In p5.js, `randomSeed(n)` makes `random()` produce the same sequence every time.
- **Pseudorandomness is a feature** for generative art: it enables reproducibility, sharing, and systematic exploration.
- Algorithms like **xorshift** use only XOR and bit shifts to produce high-quality pseudorandom sequences.
- The seed can be thought of as a **compressed representation** of an entire generative artwork.
