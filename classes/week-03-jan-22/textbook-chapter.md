# Chapter: Frame Feedback, Signed Distance Functions, and Project Proposals

## MAT 200C: Computing Arts -- Week 3, January 22

---

## 1. Frame Feedback

### 1.1 The Concept

Frame feedback is one of the most powerful techniques in real-time visual art. The idea is elegantly simple: take the image you just rendered, transform it slightly, and draw it again as the background for the next frame. Anything new you add gets captured and fed back through the same transformation on subsequent frames.

This technique has deep roots in analog video art. Artists like Nam June Paik and the Vasulkas created mesmerizing visuals in the 1960s and 70s by pointing cameras at monitors displaying their own output. The digital version gives us precise control over the transformations applied to each feedback iteration.

### 1.2 Framebuffers: The Technical Foundation

A **framebuffer** is a region of memory that holds pixel data for an image. Your screen displays one framebuffer. When we create additional framebuffers, we get off-screen surfaces that we can draw to and read from independently.

In p5.js with WEBGL mode, `createFramebuffer()` creates such an off-screen surface:

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}
```

The framebuffer `fbo` acts like a secondary canvas. We can draw into it with `fbo.begin()` and `fbo.end()`, and we can use its contents as a texture.

### 1.3 The Feedback Loop

The feedback loop has five steps that repeat every frame:

1. Begin drawing into the framebuffer
2. Draw the framebuffer's own previous contents back into itself (with a transformation)
3. Draw any new elements on top
4. End drawing into the framebuffer
5. Display the framebuffer on screen

```js
let fbo;

function setup() {
  createCanvas(600, 600, WEBGL);
  fbo = createFramebuffer();
}

function draw() {
  background(0);

  fbo.begin();

  // Step 2: Draw previous frame with transformation
  push();
  tint(255, 248);        // Slight fade for decay
  scale(1.005);          // Slight zoom
  rotate(0.01);          // Slight rotation
  texture(fbo);
  noStroke();
  plane(width, height);
  pop();

  // Step 3: Draw new content
  push();
  fill(255, 150, 0);
  noStroke();
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  circle(mx, my, 15);
  pop();

  fbo.end();

  // Step 5: Display
  texture(fbo);
  noStroke();
  plane(width, height);
}
```

### 1.4 Controlling the Feedback

The character of the feedback is determined by three things:

**Decay rate:** How quickly old content fades. A tint alpha of 255 means no fade (dangerous -- the image will saturate to white). An alpha of 240 means rapid fade (short trails). Values around 248-253 give pleasingly long trails.

**Spatial transformation:** What geometric change is applied each frame.
- Scale > 1: content zooms outward (tunnel receding)
- Scale < 1: content zooms inward (vortex)
- Rotation: content spirals
- Translation: content drifts in a direction

**New content:** What you draw each frame gets captured by the feedback. Simple shapes work well because the feedback itself adds complexity.

### 1.5 Feedback in GLSL

For maximum control, implement the feedback transformation in a fragment shader:

```glsl
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D u_feedback;
uniform float u_time;

void main() {
  vec2 uv = vTexCoord;
  vec2 center = uv - 0.5;

  // Rotation matrix
  float angle = 0.015;
  float c = cos(angle);
  float s = sin(angle);
  center = mat2(c, -s, s, c) * center;

  // Scale
  center *= 0.995;

  // Sample previous frame at transformed coordinates
  vec2 feedUV = center + 0.5;
  vec4 prev = texture2D(u_feedback, feedUV);

  // Decay
  prev *= 0.985;

  gl_FragColor = prev;
}
```

The shader approach lets you do things that are difficult with p5.js transforms alone, such as per-pixel distortions, color channel separation, and non-linear coordinate transformations.

---

## 2. Signed Distance Functions for 2D Shapes

### 2.1 What Is a Signed Distance Function?

A **Signed Distance Function (SDF)** is a function that, given a point in space, returns the shortest distance from that point to the surface of a shape. The "signed" part means:

- **Positive values** indicate the point is **outside** the shape
- **Negative values** indicate the point is **inside** the shape
- **Zero** means the point is exactly **on the boundary**

SDFs are enormously useful in shader programming because they give you a single, smooth mathematical description of a shape that you can use for rendering, blending, and animation.

### 2.2 SDF for a Circle

The simplest SDF is for a circle. A circle centered at the origin with radius `r`:

```glsl
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}
```

- `length(p)` gives the distance from the point `p` to the origin.
- Subtracting `r` shifts the zero-crossing to the circle's boundary.
- Points inside the circle have `length(p) < r`, so the result is negative.
- Points outside have `length(p) > r`, so the result is positive.

**Using it to draw a circle:**

```glsl
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

  float d = sdCircle(uv, 0.3);

  // Sharp edge
  vec3 col = d < 0.0 ? vec3(1.0) : vec3(0.0);

  // Or smooth edge using smoothstep
  // vec3 col = vec3(1.0 - smoothstep(0.0, 0.005, d));

  gl_FragColor = vec4(col, 1.0);
}
```

### 2.3 SDF for a Box

A 2D box (rectangle) centered at the origin with half-dimensions `b`:

```glsl
float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
```

This formula, from Inigo Quilez's invaluable resource at [iquilezles.org/articles/distfunctions2d](https://iquilezles.org/articles/distfunctions2d/), handles both the interior and exterior distances correctly, including rounded corners at the exterior.

**Breaking it down:**

- `abs(p)` exploits symmetry -- we only need to consider one quadrant.
- `abs(p) - b` gives the signed distance in each axis independently.
- The `length(max(d, 0.0))` part handles the exterior (Euclidean distance from the corner).
- The `min(max(d.x, d.y), 0.0)` part handles the interior (negative distance).

### 2.4 SDF for a Line Segment

A line segment from point `a` to point `b`:

```glsl
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
```

The `clamp(dot(...), 0.0, 1.0)` projects point `p` onto the line defined by `a` and `b`, clamped to the segment endpoints.

### 2.5 More 2D SDFs

Inigo Quilez has compiled an extensive catalog of 2D SDFs at [iquilezles.org/articles/distfunctions2d](https://iquilezles.org/articles/distfunctions2d/). Here are a few more commonly used ones:

**Equilateral Triangle:**

```glsl
float sdEquilateralTriangle(vec2 p, float r) {
  const float k = sqrt(3.0);
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) {
    p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  }
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
```

**Ring (annulus):**

```glsl
float sdRing(vec2 p, float outerR, float innerR) {
  return abs(length(p) - outerR) - innerR;
}
```

### 2.6 Combining SDFs

One of the most powerful aspects of SDFs is how easily they combine:

**Union (OR):** Take the minimum of two SDFs.

```glsl
float opUnion(float d1, float d2) {
  return min(d1, d2);
}
```

**Intersection (AND):** Take the maximum.

```glsl
float opIntersection(float d1, float d2) {
  return max(d1, d2);
}
```

**Subtraction (NOT):** Negate one SDF and take the maximum.

```glsl
float opSubtraction(float d1, float d2) {
  return max(d1, -d2);
}
```

**Smooth union:** Blend two shapes together with a smooth transition.

```glsl
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}
```

The parameter `k` controls how smooth the blend is. Higher values create a more gradual merge.

### 2.7 Complete SDF Example

Here is a complete shader that draws multiple shapes using SDFs:

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

void main() {
  // Normalize coordinates: centered, aspect-corrected
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

  // Animated circle
  vec2 circlePos = vec2(sin(u_time) * 0.3, 0.0);
  float circle = sdCircle(uv - circlePos, 0.15);

  // Static box
  float box = sdBox(uv, vec2(0.1, 0.1));

  // Smooth union of both
  float d = opSmoothUnion(circle, box, 0.1);

  // Color based on distance
  vec3 col = vec3(1.0) - sign(d) * vec3(0.1, 0.4, 0.7);
  col *= 1.0 - exp(-3.0 * abs(d));           // Darken near boundary
  col *= 0.8 + 0.2 * cos(150.0 * d);         // Contour lines
  col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));  // White border

  gl_FragColor = vec4(col, 1.0);
}
```

This shader draws a circle and a box that smoothly blend together. The circle moves back and forth using `sin(u_time)`. The distance field is visualized with contour lines and a sharp white border at `d = 0`.

---

## 3. Writing a Project Proposal

### 3.1 Why Write a Proposal?

A project proposal helps you:

- **Clarify your own thinking** before you start coding
- **Communicate your vision** to instructors and peers
- **Identify potential challenges** early, when you can still plan for them
- **Set a scope** that is achievable within the given timeframe

### 3.2 Structure of a Computing Arts Proposal

A good proposal for a creative computing project includes the following sections:

**Title**
A working title for your project. It does not have to be final.

**Concept (1-2 paragraphs)**
What is the core idea? What will the viewer/user experience? What inspired this project? This is the "what" and "why."

**Technical Approach (1-2 paragraphs)**
How will you implement this? What tools, libraries, and techniques will you use? This is the "how." Be specific -- "I will use frame feedback with GLSL shaders to create recursive zoom effects" is better than "I will use shaders."

**Visual References (3-5 images or links)**
Include references to existing artwork, natural phenomena, or other projects that are related to what you want to create. These help communicate your aesthetic goals.

**Timeline / Milestones**
Break the project into stages. For example:
- Week 1: Basic prototype with core algorithm working
- Week 2: Visual refinement, parameter tuning, color palette
- Week 3: Interaction design, performance optimization
- Week 4: Final polish, documentation, presentation preparation

**Potential Challenges**
What might go wrong? What are you uncertain about? Identifying risks early shows maturity and helps you plan.

### 3.3 Example Proposal Excerpt

> **Title:** Recursive Bloom
>
> **Concept:** Recursive Bloom is an interactive visual piece that uses frame feedback to create organic, flower-like patterns that grow and evolve in response to the viewer's mouse movements. The piece is inspired by the recursive geometry found in plant growth (phyllotaxis) and the analog video feedback experiments of the 1970s. Viewers paint with light, and each stroke is captured, rotated, and scaled to create spiraling, self-similar structures that bloom outward from the center.
>
> **Technical Approach:** The piece will be built in p5.js using WEBGL mode with a custom fragment shader for the feedback loop. The shader will apply a rotation matrix and slight scale transformation to the previous frame's texture, with parameters controlled by mouse position. The rotation angle will be mapped to mouseX, and the scale factor to mouseY, allowing real-time exploration of different spiral structures. Color will be generated using HSB mode, with hue cycling over time.

### 3.4 Common Pitfalls in Proposals

- **Too vague:** "I want to make something cool with shaders" does not give enough direction. Be specific about the technique and the aesthetic goal.
- **Too ambitious:** A proposal that requires mastering five new technologies in three weeks is setting you up for frustration. Focus on one core technique and do it well.
- **No visual references:** Without references, the reader has to imagine your vision from words alone. Images communicate aesthetic intent much more effectively than text.
- **No timeline:** Without milestones, you cannot track progress. You will reach the deadline unsure of whether you are "done."

### 3.5 The Proposal as a Living Document

Your proposal is not a contract. It is a starting point. As you work on the project, you will discover things that change your direction. That is fine and expected. Update your proposal as you go. The final project may look quite different from the original proposal, and that is a sign of healthy creative exploration.

---

## 4. Exercises

### Exercise 1: Feedback Exploration
Implement a frame feedback sketch in p5.js WEBGL mode. Experiment with different combinations of scale and rotation values. Document (in comments or a short write-up) three distinct visual effects you discovered and the parameter values that produced them.

### Exercise 2: SDF Composition
Using the SDF functions from Section 2, create a fragment shader that draws a composite shape made from at least three primitives (circles, boxes, line segments) combined with union, intersection, and/or subtraction. Animate at least one parameter using `u_time`.

### Exercise 3: SDF Visualization
Write a shader that visualizes the distance field itself, not just the shape boundary. Use color to show distance (e.g., warm colors for positive distance, cool colors for negative). Add contour lines by using the `fract()` or `cos()` function on the distance value.

### Exercise 4: Project Proposal Draft
Write a first draft of your project proposal following the structure in Section 3. Include at least three visual references (they can be URLs or descriptions of images). Share it with a classmate for feedback.

---

## References

- Inigo Quilez, "2D Distance Functions," [iquilezles.org/articles/distfunctions2d](https://iquilezles.org/articles/distfunctions2d/)
- Inigo Quilez, "Smooth Minimum," [iquilezles.org/articles/smin](https://iquilezles.org/articles/smin/)
- [p5.js createFramebuffer() reference](https://p5js.org/reference/p5/createFramebuffer/)
- The Book of Shaders, [thebookofshaders.com](https://thebookofshaders.com/)
