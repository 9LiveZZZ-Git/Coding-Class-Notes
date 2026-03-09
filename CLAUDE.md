# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains lecture notes and the syllabus for **MAT 200C: Computing Arts** (UCSB). It is not a software project — there are no build steps, tests, or linting.

### Structure

- `INDEX.md` — **Master index** linking to every tutorial, lesson, and textbook chapter
- `Syllabus.md` — Course syllabus, grading policy, final project milestones, and rules for sharing code
- `2026-MM-DD.md` — Original lecture notes organized by date (January through March 2026)
- `classes/` — Expanded educational content organized by class date:
  - `classes/week-XX-mon-DD/` — One folder per class session
  - `tutorial-*.md` — Hands-on coding tutorials with complete runnable examples
  - `lesson-*.md` — Conceptual explanations and theory
  - `textbook-chapter.md` — Comprehensive beginner-friendly chapter for each class
  - `classes/extra-topics/` — Supplementary material for syllabus topics not deeply covered in lectures
- `p5js-live/` — Local p5.js development environment for VS Code with live preview

### Content

The course covers programming and computing for the arts using **p5.js** and **GLSL**. Lecture notes contain:

- Conceptual material (modeling/simulation, chaos theory, fractals, agent systems, cellular automata)
- Code examples — mostly inline JavaScript/GLSL snippets and links to the p5.js web editor (`editor.p5js.org`)
- Assignments with due dates and submission instructions
- Links to external resources (YouTube, ShaderToy, Wikipedia, academic papers)

### Key Technologies Referenced

- **p5.js** — primary creative coding framework (sketches hosted on editor.p5js.org)
- **GLSL** — fragment/vertex shaders for GPU-accelerated visuals (Mandelbrot, ray marching, video effects)
- **math.js** — complex number operations for fractal computation
- **WebGPU / seagulls** — newer GPU compute framework introduced later in the course
- **p5-sound / WebAudio** — audio-reactive sketches and synthesis

### Conventions

- Lecture notes use triple parentheses `(((text)))` for in-class presentation cues/notes not meant as written content
- Mathematical notation uses LaTeX (`$...$` and `$$...$$`)
- Code attribution and LLM usage must be explicitly marked per the syllabus plagiarism policy
