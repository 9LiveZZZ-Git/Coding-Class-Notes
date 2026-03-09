# MAT 200C: Computing Arts — Master Index

**Course**: MAT 200C: Computing Arts (Programming and Computing for the Arts)
**Instructor**: Karl Yerkes, UCSB
**Technologies**: p5.js, GLSL, WebGPU, math.js, ml5.js

---

## How to Use This Repository

Each class date has its own folder under `classes/` containing three types of documents:

- **Tutorials** (`tutorial-*.md`) — Hands-on coding guides with complete, runnable p5.js examples
- **Lessons** (`lesson-*.md`) — Conceptual explanations of theory and ideas
- **Textbook Chapters** (`textbook-chapter.md`) — Comprehensive beginner-friendly chapters combining all topics from that day

There is also a **p5.js live preview** environment for coding in VS Code (see below).

---

## p5.js Live Preview (VS Code)

Edit code and see results in real-time inside VS Code.

| File | Description |
|------|-------------|
| [p5js-live/README.md](p5js-live/README.md) | Setup instructions |
| [p5js-live/index.html](p5js-live/index.html) | Main HTML file (loads p5.js from CDN) |
| [p5js-live/sketch.js](p5js-live/sketch.js) | **Your code goes here** — edit and save to see changes |
| [p5js-live/shader.vert](p5js-live/shader.vert) | Starter vertex shader |
| [p5js-live/shader.frag](p5js-live/shader.frag) | Starter fragment shader |

**Quick start**: Install "Live Server" extension in VS Code, right-click `index.html` → Open with Live Server.

---

## Week 1 — January 6: Introduction, Modeling & Simulation, p5.js Basics

**Original notes**: [2026-01-06.md](2026-01-06.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-p5js-getting-started.md](classes/week-01-jan-06/tutorial-p5js-getting-started.md) | p5.js web editor, setup/draw, shapes, colors, coordinate system |
| Tutorial | [tutorial-euler-integration.md](classes/week-01-jan-06/tutorial-euler-integration.md) | Cannon ballistics, semi-implicit Euler, position/velocity/acceleration |
| Lesson | [lesson-modeling-and-simulation.md](classes/week-01-jan-06/lesson-modeling-and-simulation.md) | Mental models, computational models, analytical vs numerical |
| Lesson | [lesson-generative-art-intro.md](classes/week-01-jan-06/lesson-generative-art-intro.md) | Generative art, computing arts philosophy |
| Chapter | [textbook-chapter.md](classes/week-01-jan-06/textbook-chapter.md) | Complete beginner chapter: from "what is programming" to ballistics |

---

## Week 1 — January 8: JavaScript, Schotter, Complexity, Anemic Cinema

**Original notes**: [2026-01-08.md](2026-01-08.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-schotter-replication.md](classes/week-01-jan-08/tutorial-schotter-replication.md) | Replicating Georg Nees' Schotter, grid layout, push/pop |
| Tutorial | [tutorial-translation-rotation.md](classes/week-01-jan-08/tutorial-translation-rotation.md) | translate(), rotate(), push()/pop(), coordinate transforms |
| Tutorial | [tutorial-recursion-and-enumeration.md](classes/week-01-jan-08/tutorial-recursion-and-enumeration.md) | Factorial, fibonacci, GCD, bitwise ops, Sol LeWitt cubes |
| Lesson | [lesson-compression-complexity.md](classes/week-01-jan-08/lesson-compression-complexity.md) | Kolmogorov complexity, RLE, Huffman, low-complexity art |
| Lesson | [lesson-determinism-randomness.md](classes/week-01-jan-08/lesson-determinism-randomness.md) | Deterministic systems, pseudorandomness, random seeds |
| Lesson | [lesson-anemic-cinema.md](classes/week-01-jan-08/lesson-anemic-cinema.md) | Duchamp's Anemic Cinema, rotoreliefs, adaptation |
| Chapter | [textbook-chapter.md](classes/week-01-jan-08/textbook-chapter.md) | Complete chapter: JS basics, Schotter, complexity, recursion |

---

## Week 2 — January 15: Chaos, Fractals, Mandelbrot, GLSL

**Original notes**: [2026-01-15.md](2026-01-15.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-mandelbrot-cpu.md](classes/week-02-jan-15/tutorial-mandelbrot-cpu.md) | Mandelbrot set on CPU with math.js, complex arithmetic |
| Tutorial | [tutorial-glsl-introduction.md](classes/week-02-jan-15/tutorial-glsl-introduction.md) | GLSL shaders in p5.js, vertex/fragment shaders, uniforms |
| Tutorial | [tutorial-mandelbrot-glsl.md](classes/week-02-jan-15/tutorial-mandelbrot-glsl.md) | Mandelbrot on GPU, complex multiply in GLSL, vec2 |
| Lesson | [lesson-chaos-and-fractals.md](classes/week-02-jan-15/lesson-chaos-and-fractals.md) | Chaos theory, butterfly effect, iteration, feedback |
| Lesson | [lesson-complex-numbers.md](classes/week-02-jan-15/lesson-complex-numbers.md) | Complex numbers for artists, the complex plane |
| Chapter | [textbook-chapter.md](classes/week-02-jan-15/textbook-chapter.md) | Complete chapter: series, fractals, Mandelbrot, CPU→GPU |

---

## Week 2 — January 20: Creative Fractals, Newton Fractals, Coloring

**Original notes**: [2026-01-20.md](2026-01-20.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-creative-fractals.md](classes/week-02-jan-20/tutorial-creative-fractals.md) | Alternative formulas (z³+c, sin(z)+c), GLSL variations |
| Tutorial | [tutorial-fractal-coloring.md](classes/week-02-jan-20/tutorial-fractal-coloring.md) | Iteration statistics, HSV/CIELAB color mapping, smooth coloring |
| Tutorial | [tutorial-newton-fractal.md](classes/week-02-jan-20/tutorial-newton-fractal.md) | Newton's method, complex division, root coloring |
| Lesson | [lesson-fractal-exploration.md](classes/week-02-jan-20/lesson-fractal-exploration.md) | Parameter space exploration, nonlinear dynamics |
| Lesson | [lesson-early-animation.md](classes/week-02-jan-20/lesson-early-animation.md) | Fischinger, McLaren, Bute, Heider & Simmel |
| Chapter | [textbook-chapter.md](classes/week-02-jan-20/textbook-chapter.md) | Complete chapter: creative fractals, coloring, Newton |

---

## Week 3 — January 22: GLSL Frame Feedback, Code Review

**Original notes**: [2026-01-22.md](2026-01-22.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-glsl-frame-feedback.md](classes/week-03-jan-22/tutorial-glsl-frame-feedback.md) | Framebuffers, reading previous frame, recursive feedback |
| Lesson | [lesson-code-review-practices.md](classes/week-03-jan-22/lesson-code-review-practices.md) | Reviewing creative code, visual quality iteration |
| Chapter | [textbook-chapter.md](classes/week-03-jan-22/textbook-chapter.md) | Complete chapter: frame feedback, SDF 2D, proposals |

---

## Week 3 — January 27: GLSL Patterns, Cellular Automata

**Original notes**: [2026-01-27.md](2026-01-27.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-glsl-patterns.md](classes/week-03-jan-27/tutorial-glsl-patterns.md) | Circles, stripes, checkerboard, rings in GLSL |
| Tutorial | [tutorial-cellular-automata.md](classes/week-03-jan-27/tutorial-cellular-automata.md) | Wolfram 1D rules, Conway's Game of Life, SmoothLife |
| Lesson | [lesson-cellular-automata-theory.md](classes/week-03-jan-27/lesson-cellular-automata-theory.md) | CA theory, Wolfram classification, emergence |
| Chapter | [textbook-chapter.md](classes/week-03-jan-27/textbook-chapter.md) | Complete chapter: GLSL patterns and cellular automata |

---

## Week 4 — January 29: Reaction-Diffusion, Video Feedback, Pattern Formation

**Original notes**: [2026-01-29.md](2026-01-29.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-reaction-diffusion.md](classes/week-04-jan-29/tutorial-reaction-diffusion.md) | Gray-Scott RD system, Laplacian stencils, CPU implementation |
| Tutorial | [tutorial-video-feedback.md](classes/week-04-jan-29/tutorial-video-feedback.md) | Video feedback in GLSL, scale/rotate transforms, mat2 |
| Lesson | [lesson-pattern-formation.md](classes/week-04-jan-29/lesson-pattern-formation.md) | Turing patterns, biological pattern formation |
| Lesson | [lesson-laplacian-explained.md](classes/week-04-jan-29/lesson-laplacian-explained.md) | Laplacian operator, 5-point and 3x3 stencils |
| Chapter | [textbook-chapter.md](classes/week-04-jan-29/textbook-chapter.md) | Complete chapter: RD, video feedback, pattern formation |

---

## Week 5 — February 3: Simulation, Particle Systems, Agent Systems

**Original notes**: [2026-02-03.md](2026-02-03.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-particle-system.md](classes/week-05-feb-03/tutorial-particle-system.md) | Particle class, forces, emitters, lifespan |
| Tutorial | [tutorial-agent-system-boids.md](classes/week-05-feb-03/tutorial-agent-system-boids.md) | Boids flocking: separation, alignment, cohesion |
| Lesson | [lesson-modeling-simulation.md](classes/week-05-feb-03/lesson-modeling-simulation.md) | Models, simulation, particles vs agents, artificial life |
| Chapter | [textbook-chapter.md](classes/week-05-feb-03/textbook-chapter.md) | Complete chapter: simulation concepts and implementations |

---

## Week 5 — February 5: Physics Laws, Calculus, ODEs, Webcam

**Original notes**: [2026-02-05.md](2026-02-05.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-physics-forces.md](classes/week-05-feb-05/tutorial-physics-forces.md) | Gravity, springs (Hooke), Coulomb, drag forces |
| Tutorial | [tutorial-euler-integration.md](classes/week-05-feb-05/tutorial-euler-integration.md) | Forward vs semi-implicit Euler, the update loop |
| Tutorial | [tutorial-ode-systems.md](classes/week-05-feb-05/tutorial-ode-systems.md) | SIR model, Lorenz attractor, predator-prey |
| Tutorial | [tutorial-webcam-effects.md](classes/week-05-feb-05/tutorial-webcam-effects.md) | createCapture(), GLSL effects, frame differencing |
| Lesson | [lesson-calculus-for-simulation.md](classes/week-05-feb-05/lesson-calculus-for-simulation.md) | Derivatives, integrals, position/velocity/acceleration |
| Lesson | [lesson-physics-laws.md](classes/week-05-feb-05/lesson-physics-laws.md) | Newton's laws, Hooke, Coulomb, gravitation explained |
| Chapter | [textbook-chapter.md](classes/week-05-feb-05/textbook-chapter.md) | Complete chapter: physics, calculus, Euler, ODEs, webcam |

---

## Week 6 — February 10: 3D Geometry, Flow Fields, Computer Vision

**Original notes**: [2026-02-10.md](2026-02-10.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-p5-geometry-3d.md](classes/week-06-feb-10/tutorial-p5-geometry-3d.md) | p5.Geometry, vertices, faces, lighting, custom 3D shapes |
| Tutorial | [tutorial-flow-fields.md](classes/week-06-feb-10/tutorial-flow-fields.md) | Perlin noise fields, particle trails, GPGPU RGBA encoding |
| Tutorial | [tutorial-computer-vision-ml5.md](classes/week-06-feb-10/tutorial-computer-vision-ml5.md) | ml5.js hand/face/body tracking, driving visuals |
| Lesson | [lesson-visual-effects.md](classes/week-06-feb-10/lesson-visual-effects.md) | Camera shake, audio-reactive, brushstrokes, blend modes |
| Chapter | [textbook-chapter.md](classes/week-06-feb-10/textbook-chapter.md) | Complete chapter: 3D, flow fields, CV, visual effects |

---

## Week 6 — February 12: Project Workflow

**Original notes**: [2026-02-12.md](2026-02-12.md)

| Type | File | Topics |
|------|------|--------|
| Lesson | [lesson-project-workflow.md](classes/week-06-feb-12/lesson-project-workflow.md) | Work logs, progress reports, project iteration |
| Chapter | [textbook-chapter.md](classes/week-06-feb-12/textbook-chapter.md) | Project management for creative coding |

---

## Week 7 — February 17: Audio, Reaction-Diffusion on GPU

**Original notes**: [2026-02-17.md](2026-02-17.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-p5-sound.md](classes/week-07-feb-17/tutorial-p5-sound.md) | p5.sound, FFT, microphone, audio-reactive sketches |
| Tutorial | [tutorial-reaction-diffusion-gpu.md](classes/week-07-feb-17/tutorial-reaction-diffusion-gpu.md) | RD in GLSL, framebuffer ping-pong, Laplacian shader |
| Lesson | [lesson-audio-creative-coding.md](classes/week-07-feb-17/lesson-audio-creative-coding.md) | WebAudio, p5.sound vs Max/MSP, Fourier transform |
| Chapter | [textbook-chapter.md](classes/week-07-feb-17/textbook-chapter.md) | Complete chapter: audio and GPU-based pattern formation |

---

## Week 9 — March 3: ShaderToy, Fading, Algorithmic Thinking

**Original notes**: [2026-03-03.md](2026-03-03.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-shadertoy-to-p5js.md](classes/week-09-mar-03/tutorial-shadertoy-to-p5js.md) | Translating ShaderToy shaders to p5.js |
| Tutorial | [tutorial-fading-techniques.md](classes/week-09-mar-03/tutorial-fading-techniques.md) | GPU and CPU fading/decay effects |
| Tutorial | [tutorial-algorithmic-thinking.md](classes/week-09-mar-03/tutorial-algorithmic-thinking.md) | Pi digit puzzles, Egg Drop optimization |
| Lesson | [lesson-code-attribution.md](classes/week-09-mar-03/lesson-code-attribution.md) | Attribution, licenses, LLM usage policy |
| Chapter | [textbook-chapter.md](classes/week-09-mar-03/textbook-chapter.md) | Complete chapter: ShaderToy, fading, algorithms, ethics |

---

## Week 9 — March 5: Computation, p5.Vector, WebGPU, Color

**Original notes**: [2026-03-05.md](2026-03-05.md)

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-p5-vector.md](classes/week-09-mar-05/tutorial-p5-vector.md) | p5.Vector API, add/sub/mult, normalization, dot product |
| Tutorial | [tutorial-webgpu-seagulls.md](classes/week-09-mar-05/tutorial-webgpu-seagulls.md) | WebGPU intro, WGSL shaders, seagulls library |
| Tutorial | [tutorial-color-permutations.md](classes/week-09-mar-05/tutorial-color-permutations.md) | RGB permutations, color theory through code |
| Lesson | [lesson-computation-fundamentals.md](classes/week-09-mar-05/lesson-computation-fundamentals.md) | Logic gates, NAND, nand2tetris, how computers work |
| Lesson | [lesson-debugging.md](classes/week-09-mar-05/lesson-debugging.md) | Debugging p5.js/GLSL, common pitfalls, error messages |
| Chapter | [textbook-chapter.md](classes/week-09-mar-05/textbook-chapter.md) | Complete chapter: computation, vectors, WebGPU, color, debugging |

---

## Extra Topics (Supplementary Material)

Topics from the syllabus not deeply covered in lecture notes.

| Type | File | Topics |
|------|------|--------|
| Tutorial | [tutorial-object-oriented-programming.md](classes/extra-topics/tutorial-object-oriented-programming.md) | JS classes, constructors, inheritance for p5.js |
| Tutorial | [tutorial-functional-programming.md](classes/extra-topics/tutorial-functional-programming.md) | map, filter, reduce, arrow functions, higher-order functions |
| Tutorial | [tutorial-data-structures.md](classes/extra-topics/tutorial-data-structures.md) | Arrays, objects, grids, stacks for creative coding |
| Tutorial | [tutorial-interactivity.md](classes/extra-topics/tutorial-interactivity.md) | Mouse/keyboard events, GUI elements, responsive canvas |
| Tutorial | [tutorial-pixel-manipulation.md](classes/extra-topics/tutorial-pixel-manipulation.md) | loadPixels/updatePixels, image processing, pixel sorting |
| Tutorial | [tutorial-strings-types-binary.md](classes/extra-topics/tutorial-strings-types-binary.md) | JS types, strings, typed arrays, binary data |
| Tutorial | [tutorial-sound-audio.md](classes/extra-topics/tutorial-sound-audio.md) | Oscillators, envelopes, filters, AudioContext |
| Lesson | [lesson-software-licenses.md](classes/extra-topics/lesson-software-licenses.md) | MIT, GPL, Creative Commons, attribution |
| Lesson | [lesson-games-visual-art.md](classes/extra-topics/lesson-games-visual-art.md) | Game loops, collision, state machines, art games |
| Chapter | [textbook-chapter.md](classes/extra-topics/textbook-chapter.md) | Comprehensive reference for all supplementary topics |

---

## Original Course Materials

| File | Description |
|------|-------------|
| [Syllabus.md](Syllabus.md) | Course syllabus, grading, final project milestones |
| [2026-01-06.md](2026-01-06.md) | Lecture notes: Jan 6 |
| [2026-01-08.md](2026-01-08.md) | Lecture notes: Jan 8 |
| [2026-01-15.md](2026-01-15.md) | Lecture notes: Jan 15 |
| [2026-01-20.md](2026-01-20.md) | Lecture notes: Jan 20 |
| [2026-01-22.md](2026-01-22.md) | Lecture notes: Jan 22 |
| [2026-01-27.md](2026-01-27.md) | Lecture notes: Jan 27 |
| [2026-01-29.md](2026-01-29.md) | Lecture notes: Jan 29 |
| [2026-02-03.md](2026-02-03.md) | Lecture notes: Feb 3 |
| [2026-02-05.md](2026-02-05.md) | Lecture notes: Feb 5 |
| [2026-02-10.md](2026-02-10.md) | Lecture notes: Feb 10 |
| [2026-02-12.md](2026-02-12.md) | Lecture notes: Feb 12 |
| [2026-02-17.md](2026-02-17.md) | Lecture notes: Feb 17 |
| [2026-03-03.md](2026-03-03.md) | Lecture notes: Mar 3 |
| [2026-03-05.md](2026-03-05.md) | Lecture notes: Mar 5 |

---

## Topic Quick-Reference

Find content by topic:

| Topic | Where to Find It |
|-------|------------------|
| **p5.js basics** | [Week 1 Jan 6 tutorial](classes/week-01-jan-06/tutorial-p5js-getting-started.md), [Interactivity](classes/extra-topics/tutorial-interactivity.md) |
| **Coordinate transforms** | [Week 1 Jan 8 tutorial](classes/week-01-jan-08/tutorial-translation-rotation.md) |
| **Generative art (Schotter)** | [Week 1 Jan 8 tutorial](classes/week-01-jan-08/tutorial-schotter-replication.md) |
| **Recursion** | [Week 1 Jan 8 tutorial](classes/week-01-jan-08/tutorial-recursion-and-enumeration.md) |
| **Compression/Complexity** | [Week 1 Jan 8 lesson](classes/week-01-jan-08/lesson-compression-complexity.md) |
| **Complex numbers** | [Week 2 Jan 15 lesson](classes/week-02-jan-15/lesson-complex-numbers.md) |
| **Mandelbrot set** | [CPU tutorial](classes/week-02-jan-15/tutorial-mandelbrot-cpu.md), [GLSL tutorial](classes/week-02-jan-15/tutorial-mandelbrot-glsl.md) |
| **GLSL shaders** | [Intro](classes/week-02-jan-15/tutorial-glsl-introduction.md), [Patterns](classes/week-03-jan-27/tutorial-glsl-patterns.md), [Feedback](classes/week-03-jan-22/tutorial-glsl-frame-feedback.md) |
| **Fractals** | [Creative](classes/week-02-jan-20/tutorial-creative-fractals.md), [Newton](classes/week-02-jan-20/tutorial-newton-fractal.md), [Coloring](classes/week-02-jan-20/tutorial-fractal-coloring.md) |
| **Cellular automata** | [Tutorial](classes/week-03-jan-27/tutorial-cellular-automata.md), [Theory](classes/week-03-jan-27/lesson-cellular-automata-theory.md) |
| **Reaction-Diffusion** | [CPU](classes/week-04-jan-29/tutorial-reaction-diffusion.md), [GPU](classes/week-07-feb-17/tutorial-reaction-diffusion-gpu.md) |
| **Video feedback** | [Tutorial](classes/week-04-jan-29/tutorial-video-feedback.md) |
| **Pattern formation** | [Lesson](classes/week-04-jan-29/lesson-pattern-formation.md), [Laplacian](classes/week-04-jan-29/lesson-laplacian-explained.md) |
| **Particle systems** | [Tutorial](classes/week-05-feb-03/tutorial-particle-system.md) |
| **Boids/Flocking** | [Tutorial](classes/week-05-feb-03/tutorial-agent-system-boids.md) |
| **Physics simulation** | [Forces](classes/week-05-feb-05/tutorial-physics-forces.md), [Euler](classes/week-05-feb-05/tutorial-euler-integration.md) |
| **ODEs (Lorenz, SIR)** | [Tutorial](classes/week-05-feb-05/tutorial-ode-systems.md) |
| **Calculus for coders** | [Lesson](classes/week-05-feb-05/lesson-calculus-for-simulation.md) |
| **Webcam/video** | [Tutorial](classes/week-05-feb-05/tutorial-webcam-effects.md) |
| **3D geometry** | [Tutorial](classes/week-06-feb-10/tutorial-p5-geometry-3d.md) |
| **Flow fields** | [Tutorial](classes/week-06-feb-10/tutorial-flow-fields.md) |
| **Computer vision (ml5)** | [Tutorial](classes/week-06-feb-10/tutorial-computer-vision-ml5.md) |
| **Audio/Sound** | [p5.sound tutorial](classes/week-07-feb-17/tutorial-p5-sound.md), [Extra](classes/extra-topics/tutorial-sound-audio.md) |
| **ShaderToy porting** | [Tutorial](classes/week-09-mar-03/tutorial-shadertoy-to-p5js.md) |
| **p5.Vector** | [Tutorial](classes/week-09-mar-05/tutorial-p5-vector.md) |
| **WebGPU** | [Tutorial](classes/week-09-mar-05/tutorial-webgpu-seagulls.md) |
| **Color theory** | [Tutorial](classes/week-09-mar-05/tutorial-color-permutations.md) |
| **OOP** | [Tutorial](classes/extra-topics/tutorial-object-oriented-programming.md) |
| **Functional programming** | [Tutorial](classes/extra-topics/tutorial-functional-programming.md) |
| **Data structures** | [Tutorial](classes/extra-topics/tutorial-data-structures.md) |
| **Pixel manipulation** | [Tutorial](classes/extra-topics/tutorial-pixel-manipulation.md) |
| **Software licenses** | [Lesson](classes/extra-topics/lesson-software-licenses.md) |
| **Code attribution** | [Lesson](classes/week-09-mar-03/lesson-code-attribution.md) |
