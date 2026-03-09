# Lesson: Introduction to Generative Art and Computing Arts

## MAT 200C: Computing Arts -- Week 1, January 6

---

## What Is Computing Arts?

Computing arts is the practice of using computation -- programming, algorithms, simulation -- as a medium for creative expression. It sits at the intersection of computer science, mathematics, visual art, music, and design. But it is not simply "art made with computers" in the way that a Photoshop illustration is made with a computer. The distinction is deeper than that.

In computing arts, the **code itself** is part of the creative act. The artist does not use the computer as a passive tool (the way a painter uses a brush) but as an active collaborator. You write rules, and the computer executes those rules to produce outcomes that are often surprising, emergent, and beyond what you could have drawn by hand. The artwork is not just the final image or animation; it is the process, the algorithm, the system of rules that generates the output.

This course, MAT 200C, explores computing arts through two primary technologies:

- **p5.js** -- a JavaScript library for creative coding, which you will use to learn fundamentals of programming, simulation, and interactive art
- **GLSL** (OpenGL Shading Language) -- a language for programming the GPU (graphics processing unit), which you will use to create high-performance visual effects that run in parallel on thousands of shader cores

Together, these tools let you work at multiple levels of abstraction: from the high-level logic of a simulation down to the per-pixel calculations of a shader.

---

## What Is Generative Art?

**Generative art** refers to art that is produced, in whole or in part, by an autonomous system -- a system that operates with some degree of independence from the artist. In our context, the autonomous system is a computer program.

The artist's role shifts from directly creating the final artifact to **designing the system** that creates it. You do not draw each line or choose each color. Instead, you write the rules: "lines grow from random points, turning at angles determined by Perlin noise, colored based on their distance from the center." Then you run the program and see what emerges.

### A Brief History

The roots of generative art stretch back to the 1960s, when early computer artists began exploring what happens when you let algorithms make aesthetic decisions:

- **Georg Nees** (1965) -- One of the first artists to exhibit computer-generated graphics. His piece *Schotter* ("Gravel") shows a grid of squares that become increasingly disordered from top to bottom. The rule is simple: each square is rotated and displaced by a random amount that increases with its row number. The result is a visual representation of order dissolving into chaos.

- **Vera Molnar** (1968) -- A Hungarian-French artist who began using computers to systematically explore variations of geometric forms. She would write programs that generated hundreds of variations of a composition, then select the ones she found most compelling. The computer was her collaborator in exploring a possibility space too large to traverse by hand.

- **Harold Cohen and AARON** (1973 onward) -- Cohen built AARON, a program that could autonomously create original drawings. Over decades, he refined the system's rules for composition, form, and color. AARON is one of the longest-running projects in the history of AI art.

- **Casey Reas and Ben Fry** (2001) -- Created Processing, the programming environment that democratized creative coding and inspired p5.js. Reas's own artistic practice explores emergent behavior in systems of simple rules -- agents following instructions that produce complex, organic-looking forms.

- **The contemporary scene** -- Today, generative art encompasses a vast range of practices, from live-coded audiovisual performances to AI-generated imagery, from data-driven installations to on-chain generative art (Art Blocks, fx(hash)).

### The Key Idea

The defining feature of generative art is the **separation between the artist's intention and the final output**. The artist designs a space of possibilities, and the computer traverses that space. The result is a collaboration between human creativity and computational execution.

This does not mean the artist has no control. Quite the opposite -- the artist controls the *system*, which is a more powerful form of control than controlling individual marks. Designing a system that reliably produces beautiful, interesting, or meaningful output is extremely difficult and deeply creative work.

---

## Why Code as a Creative Medium?

What makes code unique as an artistic medium? Several things:

### 1. Iteration and Variation

Code can run a million times. Each run can be slightly different -- a different random seed, a different parameter value. This lets you explore a vast space of possibilities. A painter produces one painting. A generative artist produces a potentially infinite family of related works.

### 2. Responsiveness

Code can respond to input in real time. A sketch can react to the mouse, the keyboard, the microphone, a camera feed, data from the internet, the time of day, the viewer's heartbeat. This opens up **interactive** art -- art that changes based on who is experiencing it.

### 3. Complexity from Simplicity

Simple rules, repeated many times, can produce staggering complexity. This is perhaps the most profound lesson of computing arts. Consider:

- A flock of birds (or boids in a simulation) follows three simple rules: separation, alignment, cohesion. The result looks like a living, breathing swarm.
- A fractal is generated by repeating a single operation at different scales. The result is infinitely detailed.
- Conway's Game of Life uses four rules about cells turning on and off. The result is a universe of self-replicating patterns, moving gliders, and Turing-complete computation.

You do not need to be a great drawer to make visually stunning generative art. You need to be a clear thinker about rules and systems.

### 4. Process Over Product

In traditional art, the final artifact is paramount. In generative art, the **process** often matters as much as (or more than) the output. The code is a form of artistic statement. It says: "I believe this system, these rules, this logic produces something worth looking at." The code can be read, shared, modified, and extended. It is transparent in a way that a painting is not.

### 5. Emergence

Perhaps the most exciting aspect of generative art is **emergence** -- the phenomenon where complex, unpredictable behavior arises from simple rules. You write a sketch with a few lines of code, you run it, and something happens that you did not anticipate. Something beautiful, or strange, or compelling.

This moment of surprise is central to the generative art experience. It is the reason artists keep running their sketches, tweaking parameters, watching what unfolds. The computer is not just executing your vision; it is showing you things you could not have imagined.

---

## The Course Philosophy

This course takes the position that programming is a creative act. Writing code is not merely a technical skill (though technical skill is required and will be developed). It is a way of thinking, a way of expressing ideas, a way of exploring possibilities.

### You Do Not Need to Be a "Programmer"

If you have never written a line of code, that is perfectly fine. This course starts from the beginning. The p5.js library was specifically designed to make coding approachable for artists and designers who have no prior experience.

What you do need is curiosity and willingness to experiment. Programming is learned by doing -- by writing code, running it, seeing what happens, changing something, running it again. It is a fundamentally iterative, experimental process. In that way, it is very much like making art.

### Making Things Is Understanding Things

This course emphasizes **making** over **studying**. You will learn about physics by building simulations. You will learn about perception by creating visual illusions. You will learn about complexity by watching simple rules produce unexpected patterns.

Building something forces you to confront every detail. You cannot hand-wave when you are writing code. The computer demands precision. But this precision is clarifying -- it forces you to truly understand the system you are modeling.

### Aesthetics Are Valid Criteria

In a science class, a simulation is judged by its accuracy -- how closely it matches empirical data. In this class, a simulation is (also) judged by its aesthetic qualities. Does it produce something interesting to look at? Does it evoke a feeling? Does it surprise you?

This does not mean accuracy is irrelevant. Understanding the real physics makes your simulations richer and more convincing. But you are always free to bend the rules in service of expression. Gravity does not have to be 9.8 m/s^2 if 20 m/s^2 looks cooler. You can add forces that do not exist in nature. You can break symmetry, violate conservation laws, invent new physics. The simulation is your canvas.

---

## What You Will Make in This Course

Over the quarter, you will build increasingly sophisticated sketches that explore different domains of computing arts:

- **Physics simulations** -- projectiles, particles, springs, cloth, fluids
- **Biological models** -- flocking, growth, branching, reaction-diffusion
- **Geometric patterns** -- tessellations, fractals, recursive structures
- **Interactive experiences** -- mouse/keyboard-driven sketches, responsive environments
- **Shader art (GLSL)** -- raymarching, signed distance functions, procedural textures, post-processing effects

Each week builds on the previous one. By the end of the course, you will have a portfolio of generative artworks and the technical foundation to keep creating.

---

## The Tools

### p5.js

p5.js is what we will use for the first part of the course. It provides:

- A canvas to draw on
- Simple functions for shapes, colors, text, and images
- A draw loop (the `draw()` function) that runs 60 times per second
- Built-in support for mouse and keyboard interaction
- An online editor (editor.p5js.org) that requires no installation

p5.js is written in JavaScript, the language of the web. Every sketch you make can be shared as a URL. Anyone with a web browser can see your work.

### GLSL (OpenGL Shading Language)

Later in the course, we will move to GLSL, a language that runs directly on the GPU. While p5.js runs code on the CPU (processing one pixel at a time, more or less), GLSL runs code on thousands of GPU cores simultaneously, processing every pixel in parallel.

This makes GLSL extremely fast -- fast enough for real-time visual effects at high resolution. But it also requires a different way of thinking. In GLSL, you write a function that takes a pixel coordinate as input and returns a color as output. There are no shapes, no draw loop, no state. Everything is calculated from scratch for every pixel, every frame.

GLSL is where computing arts meets the mathematics of space, light, and form at the most fundamental level. We will get there.

---

## Recommended Viewing and Reading

- **Casey Reas, "Chance Operations"** (Eyeo Festival talk, available on Vimeo) -- A beautiful overview of generative art as a practice.
- **"The Nature of Code" by Daniel Shiffman** (available free online at natureofcode.com) -- An excellent introduction to simulating natural phenomena with code.
- **Georg Nees, "Schotter"** -- Look up this early generative artwork and study how a single parameter (randomness) creates the visual effect.
- **Jared Tarbell, "Substrate"** (2003) -- A classic generative art piece built with Processing. Study how simple growth rules produce complex crystalline structures.
- **"Generative Design" by Hartmut Bohnacker et al.** -- A reference book of generative design techniques with code examples.

---

## Key Takeaways

1. **Computing arts uses code as a creative medium.** The program is not just a tool; it is part of the artwork.

2. **Generative art is created by designing systems, not drawing pictures.** The artist writes rules; the computer follows them.

3. **Simple rules can produce complex, emergent behavior.** This is the central miracle of generative art.

4. **You do not need prior programming experience.** Curiosity and willingness to experiment are what matter.

5. **Process matters as much as product.** The code, the iteration, the surprise -- these are all part of the creative experience.

6. **Aesthetics are valid engineering criteria.** In this course, "it looks cool" is a legitimate reason to do something.
