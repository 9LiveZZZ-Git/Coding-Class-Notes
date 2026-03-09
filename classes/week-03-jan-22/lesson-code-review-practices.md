# Lesson: Reviewing Creative Code

## MAT 200C: Computing Arts -- Week 3, January 22

---

## Why Review Creative Code?

Code review is a standard practice in professional software engineering, but it is equally valuable in creative coding. When you review someone else's creative code (or your own), you are doing two things at once:

1. **Evaluating the code** -- Is it readable? Does it do what it intends? Could it be simpler?
2. **Evaluating the output** -- Does it produce compelling visual results? How could the aesthetics be improved?

In this lesson, we will focus on both dimensions, with special attention to reviewing fractal implementations and iterative visual work.

---

## Part 1: What to Look For in Any Creative Code Review

### 1. Readability and Organization

Creative code is often written quickly, in a flow state. That is fine during creation, but when reviewing, ask:

- **Are variables named meaningfully?** A variable called `s` could be anything. A variable called `branchScale` tells you exactly what it does.
- **Are magic numbers explained?** If you see `rotate(0.4)`, a comment explaining why 0.4 was chosen (or a named constant like `let branchAngle = 0.4`) makes the code much clearer.
- **Is the code structured into functions?** A 200-line `draw()` function is hard to follow. Breaking it into functions like `drawBranch()`, `applyColor()`, and `updateAnimation()` makes the intent clear.

**Example -- Before:**

```js
function draw() {
  background(0);
  translate(width/2, height);
  stroke(255);
  line(0, 0, 0, -120);
  translate(0, -120);
  rotate(0.4);
  line(0, 0, 0, -90);
  // ... 150 more lines
}
```

**Example -- After:**

```js
let trunkLength = 120;
let branchAngle = 0.4;
let branchShrink = 0.75;

function draw() {
  background(0);
  translate(width / 2, height);
  drawBranch(trunkLength, 8);
}

function drawBranch(len, depth) {
  stroke(255);
  line(0, 0, 0, -len);
  translate(0, -len);

  if (depth > 0) {
    push();
    rotate(branchAngle);
    drawBranch(len * branchShrink, depth - 1);
    pop();

    push();
    rotate(-branchAngle);
    drawBranch(len * branchShrink, depth - 1);
    pop();
  }
}
```

The second version is longer but vastly more understandable. You can immediately see the recursive structure, and the parameters are named and easy to tweak.

### 2. Parameterization

Good creative code exposes its key parameters clearly. Ask:

- **Can I easily change the behavior?** If someone wants to experiment with different branch angles, can they change one number, or do they need to hunt through the code?
- **Are parameters at the top of the file?** Grouping all tweakable values at the top makes experimentation easy.
- **Could sliders or GUI controls help?** For exploratory work, consider suggesting `createSlider()` or a library like dat.gui.

### 3. Correctness

Even in creative code, bugs exist. Look for:

- **Off-by-one errors** in loops
- **Incorrect coordinate transformations** (forgetting `push()`/`pop()`, wrong order of translate/rotate/scale)
- **Unintended behavior** -- does the code actually produce what the author describes?
- **Edge cases** -- what happens when the recursion depth is 0? What happens at the boundary of the canvas?

### 4. Performance

Creative code that runs slowly is frustrating to interact with. Look for:

- **Unnecessary computation inside `draw()`** -- is anything being calculated every frame that only needs to happen once?
- **Excessive recursion depth** -- a fractal tree with depth 20 means 2^20 = 1,048,576 branches. That will be slow.
- **Memory leaks** -- are objects being created every frame but never cleaned up?

---

## Part 2: Reviewing Fractal Implementations Specifically

Fractals have specific patterns and pitfalls worth paying attention to.

### The Recursive Structure

Most fractal implementations use recursion. When reviewing, check:

- **Base case:** Does the recursion stop? Every recursive function needs a condition that prevents it from calling itself forever. Usually this is a depth counter or a minimum size threshold.

```js
// Good: clear base case
function drawFractal(x, y, size, depth) {
  if (depth <= 0) return;    // Base case: stop when depth reaches 0

  // Draw something
  rect(x, y, size, size);

  // Recurse
  drawFractal(x + size, y, size * 0.5, depth - 1);
  drawFractal(x, y + size, size * 0.5, depth - 1);
}
```

- **Depth parameter:** Is the maximum depth reasonable? Fractal branching grows exponentially, so even going from depth 10 to depth 12 can quadruple the number of elements drawn.

- **Size reduction:** Each level of recursion should make things smaller (or otherwise converge). If the size does not shrink, the fractal will not resolve.

### Push/Pop Discipline

Fractal code heavily relies on coordinate transformations. Every `push()` must have a matching `pop()`. A missing `pop()` causes subsequent branches to be drawn in the wrong position, and the error compounds with each recursive call.

```js
// WRONG: missing pop() -- transforms accumulate incorrectly
function branch(len, depth) {
  line(0, 0, 0, -len);
  translate(0, -len);
  if (depth > 0) {
    push();
    rotate(0.3);
    branch(len * 0.7, depth - 1);
    // Forgot pop()! The rotation is never undone.

    push();
    rotate(-0.3);
    branch(len * 0.7, depth - 1);
    pop();
  }
}
```

```js
// CORRECT: every push has its pop
function branch(len, depth) {
  line(0, 0, 0, -len);
  translate(0, -len);
  if (depth > 0) {
    push();
    rotate(0.3);
    branch(len * 0.7, depth - 1);
    pop();

    push();
    rotate(-0.3);
    branch(len * 0.7, depth - 1);
    pop();
  }
}
```

### Visual Quality Checklist

When looking at the visual output of a fractal, consider:

- **Does it fill the space well?** A fractal crammed into one corner, or one that overflows the canvas, suggests the initial position or scale needs adjustment.
- **Is the level of detail appropriate?** Too few iterations looks sparse. Too many looks like a blob (and runs slowly).
- **Are the proportions pleasing?** The ratio of branch length reduction, the angle between branches, and the number of sub-branches all affect the visual quality.
- **Is color used effectively?** Color can reveal the structure of the fractal (e.g., mapping depth to hue) or can obscure it (e.g., random colors with no relationship to structure).

---

## Part 3: Iterating on Visual Quality

Creative coding is an iterative process. A first implementation is rarely the final one. Here is a framework for improving visual output.

### Step 1: Get It Working

First, make the basic algorithm work correctly. Do not worry about beauty yet. Use simple colors (black and white), default stroke weights, and a moderate recursion depth. Verify that the structure is correct.

### Step 2: Adjust Proportions

Tweak the core parameters:

- **Scaling ratios:** How much does each level shrink? Try values from 0.5 to 0.8 and see what looks best.
- **Angles:** For branching structures, try different angles. The golden angle (137.5 degrees) often produces pleasing results.
- **Number of branches:** Two branches gives a tree. Three or more gives a bush or snowflake.

### Step 3: Add Visual Refinement

Once the structure is right, add visual polish:

- **Vary stroke weight by depth:** Thick lines for the trunk, thin lines for twigs.
- **Vary color by depth or position:** Map depth to a color gradient.
- **Add slight randomness:** Introduce small random variations in angle or length to break the perfect symmetry and make things look more natural.

```js
function branch(len, depth, maxDepth) {
  // Vary stroke weight by depth
  strokeWeight(map(depth, 0, maxDepth, 1, 5));

  // Vary color by depth
  let hue = map(depth, 0, maxDepth, 120, 30); // green to brown
  stroke(hue, 80, 90);

  line(0, 0, 0, -len);
  translate(0, -len);

  if (depth > 0) {
    // Add slight randomness to angle and length
    let angleVariation = random(-0.1, 0.1);
    let lengthVariation = random(0.9, 1.1);

    push();
    rotate(0.4 + angleVariation);
    branch(len * 0.7 * lengthVariation, depth - 1, maxDepth);
    pop();

    push();
    rotate(-0.4 + angleVariation);
    branch(len * 0.7 * lengthVariation, depth - 1, maxDepth);
    pop();
  }
}
```

### Step 4: Consider Composition

- **Where is the fractal positioned on the canvas?** Centered? Growing from the bottom? Off to one side with negative space?
- **What is the background?** A dark background with bright fractal lines has a very different feel than a white background with dark lines.
- **Is there a border or margin?** Does the fractal touch the edges of the canvas, or is there breathing room?

### Step 5: Get Feedback from Others

Show your work to classmates. Things to ask:

- "What do you notice first?"
- "Does anything feel off or unbalanced?"
- "What would you change?"

Avoid asking "Do you like it?" -- that does not give you actionable information.

---

## Part 4: A Code Review Checklist

Use this checklist when reviewing your own or someone else's creative code:

**Code Quality:**
- [ ] Variables have meaningful names
- [ ] Magic numbers are explained or named
- [ ] Code is broken into functions with clear purposes
- [ ] Key parameters are easy to find and change
- [ ] `push()` and `pop()` are balanced
- [ ] The recursion has a clear base case
- [ ] Performance is reasonable (runs at a smooth frame rate)

**Visual Quality:**
- [ ] The output fills the canvas appropriately
- [ ] The level of detail is appropriate (not too sparse, not too dense)
- [ ] Color enhances the structure rather than obscuring it
- [ ] Stroke weights are appropriate for the scale
- [ ] The composition is intentional
- [ ] Small random variations add natural feeling (if appropriate)

**Documentation:**
- [ ] There is a comment at the top describing what the sketch does
- [ ] Any non-obvious algorithm choices are explained
- [ ] The source or inspiration is credited

---

## Part 5: Giving Constructive Feedback

When reviewing a classmate's code, follow these principles:

1. **Start with what works.** "The branching structure is really clear" or "I love how the colors shift with depth."

2. **Be specific.** Instead of "the code is messy," say "the branch angle and length ratio could be pulled out as named constants at the top for easier experimentation."

3. **Suggest, do not command.** "Have you tried mapping the stroke weight to the depth?" is better than "You need to change the stroke weight."

4. **Focus on the work, not the person.** "This loop could be simplified" rather than "You wrote a complicated loop."

5. **Ask questions.** "What happens if you increase the depth to 10?" or "What would it look like if the branches curved?" Questions open exploration rather than shutting it down.

---

## Summary

Reviewing creative code is a skill that combines software engineering judgment with artistic sensibility. The best creative code is:

- **Clear** enough that someone else (or your future self) can understand it
- **Parameterized** so that experimentation is easy
- **Correct** in its implementation of the intended algorithm
- **Visually refined** through deliberate iteration on proportions, color, and composition

Practice reviewing code -- both your own and others' -- and your work will improve faster than if you only write code in isolation.
