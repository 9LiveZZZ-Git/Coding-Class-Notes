# Lesson: Anemic Cinema by Marcel Duchamp

## MAT 200C: Computing Arts -- Week 1, January 8

---

## Introduction

Marcel Duchamp's *Anemic Cinema* (1926) is a seven-minute experimental film consisting of spinning discs with spiral patterns and French puns. At first glance, it may seem like a curious relic. But it contains ideas that are directly relevant to computing arts today: the reduction of art to rules and parameters, high-fidelity adaptation across media, and the question of what is essential in an artwork.

This lesson covers:

1. What *Anemic Cinema* is and its historical context
2. Rotoreliefs -- spinning disc art
3. The concept of adapting art across media
4. Reducing art to its essence (rules and parameters)
5. Using LLMs as creative coding partners

---

## Part 1: What Is Anemic Cinema?

### The Film

*Anemic Cinema* (1926) was created by Marcel Duchamp in collaboration with Man Ray and Marc Allegret. The title itself is an anagram -- "anemic" is an anagram of "cinema."

The film alternates between two types of spinning discs:

1. **Optical discs (Rotoreliefs):** Spirals and concentric circles that, when rotated, create the illusion of three-dimensional pulsating motion. The flat patterns appear to expand and contract, move forward and backward.

2. **Text discs:** French puns and wordplay arranged in spirals. The language is deliberately playful and suggestive -- Duchamp was known for his love of puns and double meanings.

The discs rotate continuously. There is no narrative, no characters, no plot. The film reduces cinema to its most basic optical elements: shapes in motion.

### Historical Context

Duchamp made this film during a period of intense experimentation with "precision optics." He had been creating motorized spinning discs since 1920 -- physical objects called **Rotary Glass Plates** and **Rotary Demisphere**.

The film was one of several experiments in translating the physical experience of these spinning objects into the medium of cinema. It is an early example of what we would now call **media art** or **intermedia** -- work that exists at the intersection of different art forms.

---

## Part 2: Rotoreliefs

### What Are Rotoreliefs?

**Rotoreliefs** are flat discs with printed patterns (usually spirals or eccentric circles) that, when spun on a turntable at 33 1/3 RPM, create vivid optical illusions of three-dimensional movement.

Duchamp produced a set of 12 Rotoreliefs in 1935 as a commercial edition. They were printed on cardboard and sold as art objects intended to be placed on a record player.

### The Science Behind the Illusion

The illusion works because of how our visual system interprets motion:

- **Eccentric spirals** appear to expand or contract depending on the direction of rotation.
- **Off-center circles** create a wobbling, organic motion.
- The brain interprets certain motion patterns as depth cues, making flat patterns appear three-dimensional.

This is directly related to the concept of **emergent complexity**: simple rules (a flat pattern rotating at constant speed) produce complex perceptual experiences (apparent 3D motion, pulsation, breathing).

### A p5.js Rotorelief

```js
function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(255);
  translate(width / 2, height / 2);

  let speed = frameCount * 0.02;

  // Draw eccentric spirals
  noFill();
  strokeWeight(2);

  for (let i = 0; i < 15; i++) {
    let offset = i * 8; // Each circle is offset from center
    let angle = speed + i * 0.3;

    // Calculate the offset position for this circle
    let cx = cos(angle) * offset;
    let cy = sin(angle) * offset;
    let radius = 200 - i * 12;

    stroke(0);
    ellipse(cx, cy, radius, radius);
  }
}
```

### A More Faithful Rotorelief Simulation

```js
function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(250, 245, 235); // Slightly warm background

  translate(width / 2, height / 2);
  rotate(frameCount * 0.015); // Steady rotation

  // Duchamp-style eccentric spiral
  noFill();
  stroke(0);
  strokeWeight(1.5);

  // Create the illusion using offset concentric circles
  for (let i = 0; i < 20; i++) {
    let t = i / 20;
    let offsetX = sin(t * PI) * 40; // Eccentric offset
    let offsetY = cos(t * PI) * 40;
    let radius = 30 + i * 18;

    ellipse(offsetX, offsetY, radius, radius);
  }
}
```

When you run this, the flat circles appear to form a three-dimensional cone or funnel that seems to pulse and breathe. This is the rotorelief effect.

---

## Part 3: High-Fidelity Adaptation Across Media

### The Chain of Adaptations

Duchamp's rotoreliefs went through several media:

1. **Physical spinning plates** (1920s) -- motors, glass, metal
2. **Printed cardboard discs** (1935) -- static objects placed on turntables
3. **Film** (1926) -- *Anemic Cinema* captures the spinning on celluloid
4. **Digital recreation** (today) -- p5.js code that simulates the effect

Each adaptation must answer: **what is essential about this work?**

- Is it the physical object? (Then only the original counts.)
- Is it the visual effect? (Then film or video is sufficient.)
- Is it the pattern? (Then a printed image captures it.)
- Is it the motion? (Then animation is necessary.)
- Is it the optical illusion? (Then the viewer's perception is the artwork.)
- Is it the rules? (Then code captures the essence.)

### What Makes an Adaptation "High Fidelity"?

A high-fidelity adaptation preserves the **essential qualities** of the original while necessarily changing the medium. For Duchamp's rotoreliefs:

- **Essential:** The spiral/circle pattern, the rotation speed, the optical illusion of depth
- **Non-essential:** The physical turntable, the cardboard, the specific room it is displayed in

When we write p5.js code to recreate a rotorelief, we are making a judgment about what matters. The code captures the **rules** -- the pattern geometry and the rotation speed -- rather than the physical object.

---

## Part 4: Reducing Art to Rules

### The Algorithmic View of Art

Duchamp's rotoreliefs can be described algorithmically:

1. Draw N concentric circles with specific radii
2. Offset each circle's center by a calculated amount
3. Rotate the entire composition at a constant angular velocity
4. Display on a surface visible to a human observer

This is a program. The artwork is, in a sense, the algorithm itself. The specific execution (on a turntable, on film, in a browser) is an implementation detail.

### Rules-Based Art Before Computers

This perspective -- art as rules -- predates digital computers:

- **Sol LeWitt** (1960s): "The idea becomes a machine that makes the art." His wall drawings are written instructions executed by assistants.
- **John Cage** (1950s): Composed music using chance operations and precise rules.
- **Fluxus** (1960s): Created "event scores" -- written instructions for performances.
- **Duchamp** (1910s-1960s): Explored the boundary between the idea and the object throughout his career.

### The Essential Question for Computing Arts

When you create generative art, you are necessarily working with rules. The computer requires explicit instructions. This forces you to answer:

**What are the minimum rules needed to produce this aesthetic experience?**

This is directly related to Kolmogorov complexity -- the shortest program that produces the desired output.

---

## Part 5: A Complete Anemic Cinema Adaptation

Here is a more complete p5.js sketch that creates an experience inspired by Anemic Cinema, with multiple disc designs that cycle automatically:

```js
let discType = 0;
let numDiscs = 4;

function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(250, 245, 235);
  translate(width / 2, height / 2);

  // Switch disc every 5 seconds
  discType = floor(frameCount / 300) % numDiscs;

  let rotationAngle = frameCount * 0.02;

  push();
  rotate(rotationAngle);

  switch (discType) {
    case 0:
      drawSpiralDisc();
      break;
    case 1:
      drawEccentricCircles();
      break;
    case 2:
      drawArchimedesSpiral();
      break;
    case 3:
      drawConcentricWobble();
      break;
  }

  pop();

  // Outer frame
  noFill();
  stroke(80);
  strokeWeight(3);
  ellipse(0, 0, 450, 450);
}

function drawSpiralDisc() {
  // Eccentric circles creating depth illusion
  noFill();
  stroke(30);
  strokeWeight(1.5);

  for (let i = 0; i < 25; i++) {
    let t = i / 25;
    let eccentric = sin(t * PI) * 50;
    let r = 20 + i * 16;
    ellipse(eccentric, 0, r, r);
  }
}

function drawEccentricCircles() {
  // Offset circles -- classic rotorelief
  noFill();
  stroke(30);
  strokeWeight(1.2);

  for (let i = 0; i < 30; i++) {
    let angle = (i / 30) * TWO_PI;
    let offsetX = cos(angle) * 30;
    let offsetY = sin(angle) * 30;
    let r = 400 - i * 13;
    ellipse(offsetX, offsetY, r, r);
  }
}

function drawArchimedesSpiral() {
  // Archimedean spiral
  noFill();
  stroke(30);
  strokeWeight(2);

  beginShape();
  for (let a = 0; a < TWO_PI * 6; a += 0.05) {
    let r = a * 6;
    let x = cos(a) * r;
    let y = sin(a) * r;
    vertex(x, y);
  }
  endShape();
}

function drawConcentricWobble() {
  // Wobbling concentric circles
  noFill();
  stroke(30);
  strokeWeight(1);

  for (let i = 1; i < 20; i++) {
    let r = i * 20;
    let wobbleX = sin(i * 0.5) * 15;
    let wobbleY = cos(i * 0.7) * 15;
    ellipse(wobbleX, wobbleY, r, r);
  }
}
```

---

## Part 6: Using LLMs for Creative Coding

### The New Creative Partner

Large Language Models (LLMs) like GPT-4, Claude, and others have emerged as powerful tools for creative coding. They can:

- Generate p5.js sketches from text descriptions
- Explain code and suggest modifications
- Help translate artistic concepts into algorithmic form
- Prototype ideas rapidly

### How This Relates to Duchamp

There is a parallel between using an LLM for creative coding and Duchamp's approach to art-making:

1. **Duchamp separated idea from execution.** He chose readymades (urinals, bottle racks) and declared them art. The artistic act was the concept, not the craftsmanship.

2. **LLMs separate concept from implementation.** You describe what you want ("make a spinning disc with eccentric circles that creates a 3D illusion"), and the LLM generates the code. The artistic act is the prompt, the curation, the iteration.

3. **Both raise questions about authorship.** Who is the artist -- the person with the idea, the person (or machine) that executes it, or both?

### Practical Tips for Using LLMs in Creative Coding

**Be specific about the aesthetic:**
- Bad: "Make something cool with circles"
- Better: "Create a p5.js sketch with 20 concentric circles, each slightly offset from center, rotating slowly. Use thin black strokes on a warm off-white background. The visual effect should suggest depth, like Duchamp's rotoreliefs."

**Iterate on the output:**
- Run the generated code
- Identify what works and what does not
- Ask for specific modifications: "Make the rotation slower," "Add a second set of spirals rotating in the opposite direction"

**Understand the code:**
- Do not treat the LLM as a black box
- Read the generated code, understand how it works
- Modify it yourself
- Use the LLM-generated code as a starting point, not a finished product

**Use constraints creatively:**
- "Write this sketch in under 10 lines of code"
- "Only use line() -- no other shape functions"
- "The entire sketch must fit in a tweet (280 characters)"

### Example Prompt and Result

**Prompt:** "Create a p5.js sketch inspired by Duchamp's Anemic Cinema. Use only black and white. Create the illusion of depth through rotating eccentric circles. Include at least 3 different disc patterns that cycle every few seconds."

The result would be something like the sketch in Part 5 above. You would then iterate: adjust speeds, add or remove circles, tweak the offset amounts, and experiment until you achieve something that feels right.

---

## Part 7: From Physical to Digital -- What Is Preserved?

### A Comparison Table

| Aspect | Physical Rotorelief | Film (Anemic Cinema) | p5.js Code |
|--------|-------------------|---------------------|------------|
| Medium | Cardboard on turntable | Celluloid film | Web browser |
| Motion | Physical rotation | Recorded rotation | Computed rotation |
| Interactivity | Change RPM manually | None (fixed) | Unlimited (mouse, keys, etc.) |
| Resolution | Infinite (analog) | Film grain limited | Pixel limited |
| Reproducibility | Each disc is unique | Copies are identical | Copies are identical |
| Distribution | Physical object | Film prints | URL / file |
| Essence preserved? | Original | Visual effect | Rules / algorithm |

### What Code Adds

A digital adaptation can go beyond the original:

- **Interactivity:** Let the viewer control rotation speed with the mouse
- **Variation:** Generate infinite disc patterns algorithmically
- **Combination:** Layer multiple spinning patterns simultaneously
- **Parameters:** Expose the "knobs" (number of circles, offset amount, rotation speed) and let the viewer explore the space

```js
function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(250, 245, 235);
  translate(width / 2, height / 2);

  // Mouse controls the rotation speed
  let speed = map(mouseX, 0, width, -0.05, 0.05);
  let angle = frameCount * speed;

  // Mouse Y controls the eccentricity
  let eccentricity = map(mouseY, 0, height, 0, 80);

  push();
  rotate(angle);

  noFill();
  stroke(30);
  strokeWeight(1.5);

  for (let i = 0; i < 25; i++) {
    let t = i / 25;
    let offset = sin(t * PI) * eccentricity;
    let r = 20 + i * 16;
    ellipse(offset, 0, r, r);
  }

  pop();

  // Display parameters
  fill(0);
  noStroke();
  textSize(12);
  textAlign(LEFT);
  text("Speed: " + speed.toFixed(3), -width/2 + 10, -height/2 + 20);
  text("Eccentricity: " + eccentricity.toFixed(1), -width/2 + 10, -height/2 + 35);
  text("Move mouse to control", -width/2 + 10, -height/2 + 50);
}
```

Now the viewer becomes a participant, exploring the parameter space that Duchamp fixed at specific values. This is a fundamentally different relationship with the artwork -- one that is only possible in the digital medium.

---

## Exercises

1. **Create your own rotorelief.** Design a disc pattern that creates an optical illusion when rotated. Experiment with spirals, eccentric circles, and other geometric forms.

2. **Anemic Cinema tribute.** Create a p5.js sketch that alternates between optical discs and text discs (use text arranged in a circle). Include at least three different patterns.

3. **Parameter exploration.** Take the interactive rotorelief sketch and add controls for additional parameters: number of circles, stroke weight, background color. Use `keyPressed()` or sliders.

4. **Media translation essay.** In 200 words, describe what is lost and what is gained when translating a physical rotorelief into p5.js code. Is the code version "the same artwork"?

5. **LLM collaboration.** Use an LLM to generate three different rotorelief sketches. Evaluate each one: which is most effective? Why? Modify the best one by hand to improve it.

---

## Key Takeaways

- **Anemic Cinema** (1926) is Marcel Duchamp's experimental film of spinning optical discs and text.
- **Rotoreliefs** are flat patterns that create 3D illusions when rotated -- an example of emergent complexity from simple rules.
- **High-fidelity adaptation** requires identifying the essential qualities of an artwork and preserving them across media.
- **Reducing art to rules** is the fundamental act of creative coding: you must decide what is essential and express it as an algorithm.
- **LLMs** can serve as creative coding partners, generating code from descriptions, but the artistic decisions (concept, curation, iteration) remain with the human.
- The digital medium adds **interactivity and parameterization** -- capabilities that transform the viewer from observer to participant.
