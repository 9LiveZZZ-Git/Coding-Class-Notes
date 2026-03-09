# Chapter: Project Management for Creative Coding

**MAT 200C: Computing Arts -- Week 6, February 12**

---

## Introduction

Creative coding exists at the intersection of art and engineering. Unlike traditional software development, where requirements are specified in advance, creative coding projects evolve through experimentation. Unlike traditional art-making, where the medium is familiar, creative coding requires learning new tools and debugging technical problems alongside aesthetic exploration.

This chapter addresses the practical challenge of managing a creative coding project: keeping track of your work, documenting your process, iterating effectively, and communicating your progress.

---

## 1. The Work Log

A work log is the single most important documentation practice for a creative coding project. It is a chronological journal of your development process.

### Purpose

The work log serves multiple functions:

- **Memory aid**: You will work on your project across many sessions over several weeks. Without a log, you will forget what you tried, what parameters you used, and why you made certain decisions.
- **Debugging tool**: When something stops working, the log helps you trace back to the last known good state. "It worked on Feb 8 when I used a noise scale of 0.003. I changed it to 0.01 on Feb 10 and things got weird."
- **Reflection surface**: Reading back through your log reveals patterns in your process. You might notice that your best results come from accidental discoveries, or that you spend too long on details before the overall structure is solid.
- **Assessment evidence**: Your log demonstrates the depth and authenticity of your engagement with the project.

### Structure

Each entry should include:

1. **Date and approximate time spent**
2. **Session goal**: What were you setting out to accomplish?
3. **Actions taken**: What did you actually do? Be specific about code changes, parameter values, and approaches tried.
4. **Results**: What happened? Include screenshots for visual results.
5. **Failures and dead ends**: What did you try that did not work? Why do you think it failed?
6. **Tools and resources**: What documentation, tutorials, or references did you consult?
7. **AI tool usage**: If you used an LLM, what did you ask and how did you use the response?
8. **Next steps**: What will you do in the next session?

### Quality Indicators

A strong work log:

- Has entries for every work session (even short ones)
- Includes specific technical details (not just "worked on the project")
- Contains screenshots and screen recordings
- Documents failures as thoroughly as successes
- Shows evidence of reflection and decision-making
- Honestly records AI tool usage

A weak work log:

- Has large gaps between entries
- Is vague ("made some changes," "played around with it")
- Contains no visual documentation
- Only records successes
- Does not mention AI usage even when AI was clearly used

---

## 2. Documenting LLM Usage

Large Language Models (ChatGPT, Claude, Copilot, etc.) are powerful tools for creative coding. They can explain concepts, debug errors, suggest approaches, and generate code. Using them is permitted and even encouraged in this course -- but their use must be documented.

### Why Document AI Usage?

**Intellectual honesty.** Creative coding is about developing your own artistic and technical voice. When an AI writes code for you, it is important to distinguish between your ideas and the AI's contributions.

**Learning assessment.** If you cannot explain code in your project, you have not learned from the interaction. Documentation forces you to reflect on whether you understood what the AI provided.

**Reproducibility.** AI-generated code sometimes contains subtle errors or uses outdated APIs. Documenting what the AI suggested (versus what you actually used) helps when debugging later.

### What to Record

For each significant AI interaction:

| Field | Example |
|-------|---------|
| **Date** | Feb 10, 2025 |
| **Tool** | Claude (claude-3.5-sonnet) |
| **Prompt** (summarized) | "How do I make particles wrap around the canvas edges in p5.js?" |
| **Response** (summarized) | Suggested checking if position exceeds width/height and resetting to 0, with a note about also resetting prevPos to avoid trail artifacts. |
| **Your action** | Used the approach. Added the prevPos reset which I had not thought of. |
| **Understanding** | I understand the logic. The prevPos reset prevents a line being drawn across the entire canvas when the particle wraps. |

### Levels of AI Involvement

It helps to categorize how you used AI:

1. **Conceptual**: Asked the AI to explain a concept. "What is Hooke's Law?" You wrote all the code yourself.
2. **Debugging**: Showed the AI an error message and asked for help. You had already written the code.
3. **Code suggestion**: Asked the AI to write a specific function. You integrated it into your project.
4. **Substantial generation**: Asked the AI to write a large portion of your sketch. You modified the output.

None of these levels is inherently wrong, but they represent increasing reliance on the AI. Your documentation should accurately reflect which level applies.

---

## 3. Iterating on a Project

### The Iteration Mindset

Creative coding projects do not emerge fully formed. They develop through cycles of making, observing, and adjusting. This is fundamentally different from the "plan-then-execute" model of traditional engineering.

The iteration cycle:

```
Conceive → Prototype → Observe → Evaluate → Adjust → (repeat)
```

At each cycle, you make the project a little better, a little more interesting, a little closer to the vision forming in your mind -- a vision that itself evolves as you work.

### Practical Iteration Strategies

**Start with the simplest possible version.** Before building a 3D particle system with audio reactivity and computer vision, start with one circle on the screen. Then make it move. Then make ten circles. Then make them respond to noise. Build up one layer at a time.

**Isolate variables.** When experimenting, change one parameter at a time. If you change the particle count, the noise scale, and the color palette simultaneously, you will not know which change produced the result.

**Save checkpoints.** Before making a significant change, save a copy of your working code. In the p5.js editor, use File > Duplicate. With Git, commit with a descriptive message: "Working flow field with color trails before adding audio."

**Explore the parameter space.** Many creative coding sketches have parameters (noise scale, particle count, speed, damping, color range). Spend time systematically exploring these. What happens at extreme values? Where are the interesting zones?

**Follow surprises.** When something unexpected happens -- a bug produces an interesting visual, a parameter value creates an unforeseen pattern -- follow it. Some of the most compelling creative coding work emerges from productive accidents.

### From Exploration to Commitment

At some point, you need to stop exploring and commit to a direction. Here is a suggested timeline for a multi-week project:

| Phase | Duration | Activity |
|-------|----------|----------|
| Exploration | 1-2 weeks | Make many small sketches. Try different techniques. |
| Selection | 1 session | Review sketches. Identify 2-3 candidates. |
| Development | 2-3 weeks | Develop chosen direction. Add interaction, polish aesthetics. |
| Finalization | 1 week | Bug fixes, documentation, presentation preparation. |

---

## 4. Research Methods for Creative Technology

Creative coding draws on multiple fields. Here are research strategies for each:

### Technical Research

When you need to learn a technique (e.g., flow fields, FFT analysis, GPGPU):

1. **Official documentation**: p5.js reference, MDN Web Docs, WebGL specification
2. **Tutorials**: The Coding Train (YouTube), p5.js examples, creative coding blog posts
3. **Source code**: Read the p5.js source code for built-in functions to understand how they work
4. **AI assistance**: Ask an LLM to explain a concept or help debug code (document this)

### Artistic Research

When you need inspiration or want to understand the creative context of your work:

1. **Artists and practitioners**: Study work by Casey Reas, Zach Lieberman, Memo Akten, Refik Anadol, Lauren Lee McCarthy, Golan Levin
2. **Platforms**: OpenProcessing, Are.na, creative coding communities on Reddit and Discord
3. **Exhibitions and festivals**: Ars Electronica, SIGGRAPH Art Gallery, Mutek, Sonica
4. **History**: Read about the origins of computer art (Vera Molnar, Manfred Mohr, Harold Cohen)

### Academic Research

When your project touches on deeper topics (perception, complexity, emergence):

1. **Google Scholar**: Search for academic papers on topics like "reaction-diffusion art" or "generative aesthetics"
2. **Books**: *The Nature of Code* (Daniel Shiffman), *Generative Design* (Bohnacker et al.), *Form+Code* (Reas and McWilliams)
3. **Proceedings**: NIME (New Interfaces for Musical Expression), ISEA (International Symposium on Electronic Art), CHI

---

## 5. Progress Report Structure

A progress report communicates the current state of your project to your instructor and peers. It should be concise, visual, and honest.

### Template

```markdown
# Progress Report: [Project Title]
**[Your Name] -- [Date]**

## One-Sentence Description
[What is your project?]

## Current State
[2-3 sentences describing what exists right now. Include 2-3 screenshots
or a link to a video.]

## Changes Since Last Report
- [Change 1]
- [Change 2]
- [Change 3]

## Technical Challenges
- [Challenge 1: description and what you have tried]
- [Challenge 2: description and what you have tried]

## Aesthetic/Conceptual Questions
- [Question 1]
- [Question 2]

## Plan for Next Week
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

## Resources Used
- [Link 1: description]
- [Link 2: description]

## AI Tool Usage Summary
- [Summary of AI interactions this week]
```

### Tips for Good Progress Reports

- **Lead with visuals.** A screenshot is worth a thousand words.
- **Be specific about challenges.** "It is hard" is not helpful. "The FFT bass energy peaks at 220 even when there is no bass playing, which causes the background to pulse constantly" is helpful.
- **Separate technical from aesthetic questions.** "How do I make this faster?" is a technical question. "Should this be interactive or generative?" is an aesthetic question. Both are valid.
- **Make your plan actionable.** "Work on the project" is not a plan. "Implement FFT-driven color mapping using HSB mode" is a plan.

---

## Exercises

### Exercise 1: Start Your Work Log

Create a work log document (Markdown file, Google Doc, or notebook). Write your first entry documenting your most recent coding session, even retroactively. Include a screenshot of your current project state.

### Exercise 2: Progress Report

Write a progress report for your current project state using the template above. If you do not have a project yet, write a progress report for one of the tutorial sketches you have built in class, treating it as if it were the beginning of a larger project.

### Exercise 3: LLM Reflection

Think of a recent time you used an AI tool for coding. Write a documentation entry following the format in Section 2. Honestly assess: did you understand the code the AI provided? Could you have written it yourself, given enough time? What did you learn from the interaction?

---

## Summary

Effective project management in creative coding requires:

1. **A consistent work log** documenting every session with specific details and visuals
2. **Honest LLM documentation** recording prompts, responses, and your assessment of understanding
3. **Iterative development** starting simple, changing one thing at a time, and following surprises
4. **Multi-disciplinary research** drawing on technical, artistic, and academic sources
5. **Clear progress reports** with visuals, specific challenges, and actionable plans
