# Lesson: Project Workflow and Documentation

**MAT 200C: Computing Arts -- Week 6, February 12**

---

## Overview

This lesson focuses on the practical side of creative coding: how to manage your final project, maintain a work log, document your process, and structure progress reports. Creative coding projects are iterative and nonlinear -- you try things, some work, some fail, and you build on what works. Good documentation captures this process and makes it legible to others (and to your future self).

---

## 1. The Creative Coding Work Log

A work log is a chronological record of what you did, what you tried, what worked, and what did not. It is not a polished essay -- it is a raw, honest account of your process.

### Why Keep a Work Log?

- **Memory**: You will forget what you tried three weeks ago. The log remembers.
- **Debugging**: When something breaks, you can trace back to when it last worked.
- **Reflection**: Patterns emerge when you review your log. You notice what excites you, what frustrates you, where you get stuck.
- **Communication**: Your instructor and peers can understand your process, not just your final output.
- **Portfolio**: A well-maintained log becomes part of your project documentation and portfolio.

### What to Include

Each entry should include:

1. **Date and time spent** -- Even a rough estimate helps. "Feb 10, ~2 hours."
2. **Goal for the session** -- What were you trying to accomplish? "Get particles to follow a flow field."
3. **What you did** -- Specific actions. "Implemented Particle class. Tried noise scale of 0.01, too jittery. Changed to 0.003, much better."
4. **What worked** -- Capture the wins. Include screenshots or screen recordings.
5. **What did not work** -- Equally important. "Tried using a 2D array for the flow field but indexing was buggy. Switched to a flat array."
6. **Questions and next steps** -- "How do I add color based on velocity? Need to look into HSB mode."
7. **Resources used** -- Links to tutorials, reference pages, or examples you consulted.
8. **LLM usage** -- If you used ChatGPT, Claude, or another AI tool, document what you asked, what it suggested, and whether you used the suggestion.

### Example Work Log Entry

```
## Feb 10, 2025 -- ~2.5 hours

### Goal
Get the flow field particles rendering with color trails.

### What I did
- Started with the basic flow field from the tutorial (Perlin noise angles,
  2000 particles).
- Switched to HSB color mode. Mapped particle heading angle to hue.
- Tried alpha of 5 -- too transparent, trails barely visible.
- Tried alpha of 15 -- visible but builds up too fast into solid color.
- Settled on alpha of 8 with a semi-transparent background overlay
  (fill(0, 0, 5, 10) rect each frame).
- Added a third dimension to the noise (z-offset incrementing by 0.001)
  so the field slowly evolves.

### What worked
- The color mapping looks beautiful. Screenshot: [flow-field-v3.png]
- The z-offset animation creates a mesmerizing slow drift.

### What didn't work
- Tried to add mouse interaction (repel particles near cursor) but the
  force was too strong and particles flew off screen. Need to clamp it.

### LLM usage
- Asked Claude: "How do I make a semi-transparent background fade in p5.js
  without clearing the canvas?" It suggested drawing a rectangle with low
  alpha each frame instead of calling background(). This worked perfectly.
- Asked Claude for help with the mouse repulsion force, but the code it
  gave used a different vector API. Adapted it manually.

### Next steps
- Fix mouse interaction (clamp the repulsion force).
- Try different color palettes (warm/cool).
- Consider adding particle lifetime so they respawn.
```

### Format

Your work log can be:

- A **Markdown file** in your project repository (recommended)
- A **Google Doc** with dated entries
- A **blog** (Notion, Are.na, Tumblr, personal site)
- A **physical notebook** (take photos to include in your digital submission)

Whatever format you choose, the key is **consistency**. Write an entry every time you work on the project, even if it is just 15 minutes.

---

## 2. Documenting Your Process

Beyond the work log, your project documentation should include visual evidence of your process.

### Screenshots

Take screenshots at key moments:

- When you get something working for the first time
- When you find an interesting visual accident
- Before and after a major change
- Error states (sometimes bugs create the best visuals)

In p5.js, you can save a screenshot programmatically:

```js
function keyPressed() {
  if (key === 's') {
    saveCanvas('screenshot-' + frameCount, 'png');
  }
}
```

### Screen Recordings

Short videos (10-30 seconds) are often more effective than screenshots for documenting:

- Animations and real-time behavior
- Interactive features
- Audio-reactive elements
- Performance and frame rate

On Windows, use Win+G to open the Game Bar for screen recording. On Mac, use Cmd+Shift+5.

### Version Snapshots

When you reach a milestone, save a copy of your code:

- Use Git commits with meaningful messages
- Or simply duplicate your sketch in the p5.js editor (File > Duplicate)
- Name versions clearly: `flow-field-v1-basic`, `flow-field-v2-color`, `flow-field-v3-interaction`

This lets you go back to earlier versions if you break something, and it provides a clear history of evolution for your documentation.

---

## 3. Iterating on Your Final Project

### The Iteration Cycle

Creative coding projects rarely follow a straight path from idea to finished piece. Instead, they follow an iterative cycle:

1. **Conceive** -- Form an initial idea or question. "What if particles followed music?"
2. **Prototype** -- Build the simplest possible version. Get something on screen.
3. **Evaluate** -- Look at what you have. What is interesting? What is boring? What surprises you?
4. **Refine** -- Adjust parameters, add features, fix bugs. Follow what excites you.
5. **Repeat** -- Go back to step 3.

### Productive Iteration Strategies

**Start simple.** Get a single particle moving before trying 10,000. Get a single note playing before attempting FFT analysis. Starting simple lets you verify that each piece works before adding complexity.

**Change one thing at a time.** If you change the noise scale, the particle count, and the color palette all at once, you will not know which change caused the result (good or bad). Change one parameter, observe the effect, then move on.

**Keep your accidents.** Some of the most interesting visual results come from bugs. If you accidentally type `noise(x * 0.1)` instead of `noise(x * 0.001)` and the result looks wild, do not immediately "fix" it. Take a screenshot, save the code, and explore what happened.

**Set constraints.** Unlimited freedom can be paralyzing. Give yourself a constraint: "I will only use circles." "Everything must be black and white." "The entire piece must respond to a single input." Constraints breed creativity.

**Know when to stop.** There is always another parameter to tweak, another feature to add. At some point, the piece is done. Good enough is good enough. Save it, document it, move on to the next exploration.

### From Sketch to Project

Your final project grows from many small sketches. Here is a suggested workflow:

1. **Weeks 1-2**: Make 5-10 small sketches exploring different techniques. Each should take 1-2 hours max.
2. **Week 3**: Review your sketches. Which ones excite you most? Which ones could you see developing further?
3. **Weeks 4-5**: Choose 2-3 candidates and develop them into more complete pieces. Add interaction, refine aesthetics, push the concept.
4. **Weeks 6-7**: Commit to one direction. Polish. Document. Prepare for presentation.

---

## 4. Structuring a Progress Report

A progress report is a snapshot of where your project stands. It should be concise, visual, and honest.

### Recommended Structure

**1. Project Title and One-Sentence Description**

> "Resonance Fields: An audio-reactive particle system that visualizes ambient sound as a living flow field."

**2. Current State (with visuals)**

Include 2-3 screenshots or a short video link showing the current state of the project. Describe what is working.

**3. What Changed Since Last Report**

Bullet-point list of changes, additions, and fixes since the previous report.

**4. Challenges and Questions**

What are you stuck on? What decisions are you wrestling with? Be specific:
- "The particles look great but the frame rate drops below 30fps with more than 5000 particles. Should I switch to GPGPU or reduce the count?"
- "I cannot decide between a dark or light background. The dark version feels more dramatic but the light version shows the trails more clearly."

**5. Plan for Next Week**

Concrete, actionable items:
- "Implement FFT-driven color mapping."
- "Test on a projector in the lab."
- "Record a 30-second demo video."

**6. Resources and References**

Links to tutorials, artists, papers, or tools you referenced.

**7. LLM Usage Log**

If you used AI tools, summarize:
- What prompts you gave
- What suggestions you received
- Which suggestions you used, modified, or rejected
- Your reflection on the AI's contribution

---

## 5. Documenting LLM Usage

Using AI tools like ChatGPT, Claude, or GitHub Copilot is permitted in this course, but it must be documented transparently. This is not about policing -- it is about understanding your own learning process and being honest about your creative process.

### What to Document

For each significant LLM interaction:

1. **The prompt**: What did you ask? (Paraphrase is fine for long conversations.)
2. **The response**: What did the AI suggest? (Summary is fine.)
3. **Your action**: Did you use the suggestion verbatim? Modify it? Reject it?
4. **Your learning**: Did you understand the suggestion? Did it teach you something new?

### Example Documentation

```
### LLM Log -- Feb 10

**Prompt**: "How do I compute the curl of a 2D noise field in p5.js?"

**Response**: Claude explained that the curl in 2D is computed by taking
partial derivatives of the noise function: curl_x = dN/dy, curl_y = -dN/dx.
It provided code using finite differences to approximate the derivatives.

**Action**: Used the approach but rewrote the code in my own style. Changed
the epsilon value from 0.01 to 0.001 because the field was too coarse.

**Learning**: I now understand the relationship between curl and
divergence-free fields. The curl approach produces flow that never converges
to a point, which explains why it looks more fluid-like than raw noise angles.
```

### Why This Matters

The goal is not to avoid AI tools -- they are part of the modern creative coding toolkit. The goal is to maintain **authorship and understanding**. You should be able to explain every line of code in your project. If an AI wrote code that you do not understand, that is a signal to study it until you do.

---

## Summary

| Practice | Key Principle |
|----------|--------------|
| Work log | Record every session: what you did, what worked, what failed |
| Screenshots | Capture visual milestones, accidents, and progress |
| Version control | Save snapshots at milestones (Git commits or duplicated sketches) |
| Iteration | Start simple, change one thing at a time, keep your accidents |
| Progress reports | Current state + changes + challenges + plan + LLM usage |
| LLM documentation | Prompt, response, action, learning |

---

## Template: Work Log Entry

You can copy this template for each session:

```markdown
## [Date] -- ~[time spent]

### Goal
[What were you trying to accomplish?]

### What I did
- [Action 1]
- [Action 2]
- [Action 3]

### What worked
[Description + screenshot/video if applicable]

### What didn't work
[Description of failed attempts and why they failed]

### LLM usage
- [Prompt summary → Response summary → What you did with it]

### Questions
- [Things you're unsure about]

### Next steps
- [Concrete tasks for next session]
```
