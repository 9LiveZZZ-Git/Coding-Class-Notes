# Textbook Chapter: ShaderToy Translation, Fading Techniques, Algorithmic Problem-Solving, and Code Ethics

## MAT 200C: Computing Arts -- Week 9, March 3

---

## Introduction

This chapter brings together four topics that represent different facets of computing arts practice: translating shader code between platforms, implementing visual decay effects, solving algorithmic puzzles, and navigating the ethical landscape of code attribution. Each topic builds on skills developed earlier in the course while introducing new concepts that will serve you in your final projects and beyond.

---

## 1. Translating ShaderToy Shaders to p5.js

### 1.1 Why Translate?

ShaderToy (<https://www.shadertoy.com>) hosts thousands of stunning GLSL shader effects. Many are open source and can serve as inspiration or starting points for your own work. However, ShaderToy uses its own conventions that differ from p5.js. Learning to translate between the two environments is a practical skill that opens up a vast library of visual effects for your projects.

### 1.2 The ShaderToy Environment

A ShaderToy shader defines a single function:

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // your shader code
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

ShaderToy provides built-in uniforms automatically: `iResolution` (canvas size as `vec3`), `iTime` (elapsed seconds), `iMouse` (mouse state as `vec4`), and `iChannel0..3` (input textures).

### 1.3 The p5.js Shader Environment

In p5.js, you provide both a vertex and fragment shader, declare all uniforms yourself, and pass them from JavaScript using `setUniform()`.

**Standard vertex shader for a full-screen quad:**

```glsl
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}
```

**Fragment shader template:**

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 fragCoord = vTexCoord * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y; // flip Y

    // ... translated ShaderToy code goes here ...

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

### 1.4 Translation Rules

| ShaderToy | p5.js | Notes |
|---|---|---|
| `mainImage(out vec4 fragColor, in vec2 fragCoord)` | `void main()` | Entry point changes |
| `fragColor = ...` | `gl_FragColor = ...` | Output variable changes |
| `iResolution` | `u_resolution` | Declare as `uniform vec2` |
| `iTime` | `u_time` | Declare as `uniform float` |
| `iMouse` | `u_mouse` | Flip mouseY: `[mouseX, height - mouseY]` |
| `texture(iChannel0, uv)` | `texture2D(u_texture0, uv)` | WebGL 1.0 uses `texture2D` |
| `fragCoord` | `vTexCoord * u_resolution` | Compute from varying, flip Y |

### 1.5 Coordinate System

ShaderToy places the origin at the **bottom-left** with Y increasing upward. p5.js places the origin at the **top-left** with Y increasing downward. The fix is a single line:

```glsl
fragCoord.y = u_resolution.y - fragCoord.y;
```

### 1.6 Complete Example: Plasma Shader

**ShaderToy original:**

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime;
    float v = sin(uv.x * 10.0 + t) + sin(uv.y * 10.0 + t)
            + sin(uv.x * 10.0 + uv.y * 10.0 + t)
            + sin(length(uv - 0.5) * 20.0 - t * 2.0);
    v /= 4.0;
    vec3 col;
    col.r = sin(v * 3.14159) * 0.5 + 0.5;
    col.g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(v * 3.14159 + 4.188) * 0.5 + 0.5;
    fragColor = vec4(col, 1.0);
}
```

**p5.js translation:**

```js
let plasmaShader;

let vertSrc = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    vec4 p = vec4(aPosition, 1.0);
    p.xy = p.xy * 2.0 - 1.0;
    gl_Position = p;
}`;

let fragSrc = `
precision mediump float;
varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 fragCoord = vTexCoord * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;

    vec2 uv = fragCoord / u_resolution;
    float t = u_time;
    float v = sin(uv.x * 10.0 + t) + sin(uv.y * 10.0 + t)
            + sin(uv.x * 10.0 + uv.y * 10.0 + t)
            + sin(length(uv - 0.5) * 20.0 - t * 2.0);
    v /= 4.0;
    vec3 col;
    col.r = sin(v * 3.14159) * 0.5 + 0.5;
    col.g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(v * 3.14159 + 4.188) * 0.5 + 0.5;
    gl_FragColor = vec4(col, 1.0);
}`;

function setup() {
    createCanvas(800, 600, WEBGL);
    noStroke();
    plasmaShader = createShader(vertSrc, fragSrc);
}

function draw() {
    shader(plasmaShader);
    plasmaShader.setUniform("u_resolution", [width, height]);
    plasmaShader.setUniform("u_time", millis() / 1000.0);
    rect(0, 0, width, height);
}
```

### 1.7 Multipass Shaders

ShaderToy's Buffer A, B, C, D correspond to `createFramebuffer()` objects in p5.js. Each buffer renders via its own shader, and the results are passed as textures to subsequent passes. The final "Image" tab becomes the shader that renders to the screen.

```js
let bufferA = createFramebuffer({ format: FLOAT });
// Render to bufferA with shaderA
bufferA.begin();
shader(shaderA);
shaderA.setUniform("iChannel0", bufferA); // self-feedback
rect(0, 0, width, height);
bufferA.end();

// Final pass to screen
shader(shaderImage);
shaderImage.setUniform("iChannel0", bufferA);
rect(0, 0, width, height);
```

---

## 2. Fading Techniques

### 2.1 The Problem

You want old visual content to gradually disappear while new content appears at full intensity. This is essential for painting tools, audio visualizers, particle trails, and any sketch where you want a "memory" that decays.

### 2.2 GPU Approach: Framebuffer Feedback

The GPU approach uses a framebuffer that reads its own previous contents each frame, drawing them back with reduced opacity.

**How it works:**

1. Draw the framebuffer's previous contents back into itself at 96% opacity.
2. Draw new content on top at full opacity.
3. Display the framebuffer.

Over time, old content fades: after $n$ frames at opacity $\alpha$, brightness is $\alpha^n$. At $\alpha = 0.96$, content is half-faded after about 17 frames and essentially invisible after 100 frames.

```js
let fbo;

function setup() {
    createCanvas(600, 600, WEBGL);
    fbo = createFramebuffer();
}

function draw() {
    background(0);
    fbo.begin();

    // Draw previous frame with slight fade
    push();
    tint(255, 245);
    texture(fbo);
    noStroke();
    plane(width, height);
    pop();

    // Draw new content
    if (mouseIsPressed) {
        fill(255, 100, 50);
        noStroke();
        circle(mouseX - width / 2, mouseY - height / 2, 30);
    }

    fbo.end();

    texture(fbo);
    noStroke();
    plane(width, height);
}
```

**Advantages:** Handles millions of pixels effortlessly. Smooth, uniform fading.

**Disadvantages:** Requires WEBGL mode. Difficult to fade individual elements at different rates.

### 2.3 GPU Approach with Custom Shader

For fading toward a specific color (not just black), use a shader with `mix()`:

```glsl
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D u_prev;
uniform vec3 u_bgColor;
uniform float u_fadeAmount;

void main() {
    vec4 prev = texture2D(u_prev, vTexCoord);
    vec3 faded = mix(prev.rgb, u_bgColor, u_fadeAmount);
    gl_FragColor = vec4(faded, 1.0);
}
```

The `mix(a, b, t)` function computes `a * (1 - t) + b * t`, moving each pixel 2% (or whatever `u_fadeAmount` is) closer to the background color every frame.

### 2.4 CPU Approach: Aging Data Structures

The CPU approach stores each visual element as an object with a lifetime:

```js
let strokes = [];

function setup() {
    createCanvas(600, 600);
}

function draw() {
    background(20);

    if (mouseIsPressed) {
        strokes.push({
            x: mouseX, y: mouseY,
            size: random(10, 40),
            r: random(100, 255), g: random(50, 200), b: random(150, 255),
            age: 0, maxAge: 120
        });
    }

    for (let i = strokes.length - 1; i >= 0; i--) {
        let s = strokes[i];
        s.age++;
        let life = 1.0 - s.age / s.maxAge;
        fill(s.r, s.g, s.b, life * 255);
        noStroke();
        circle(s.x, s.y, s.size * life);
        if (s.age >= s.maxAge) strokes.splice(i, 1);
    }
}
```

**Advantages:** Works in 2D mode. Per-element control over fade rate, color, behavior. Easy to understand.

**Disadvantages:** Performance degrades with many objects. Each object takes memory.

### 2.5 When to Use Each

Use the **GPU approach** when you want full-screen effects, painting tools, or generative textures where every pixel participates. Use the **CPU approach** when you have distinct objects (particles, shapes, brush strokes) that need individual behaviors. Use **both together** for the most flexibility: CPU-managed particles drawn into a GPU-faded framebuffer.

---

## 3. Algorithmic Problem-Solving

### 3.1 The Pi Digit Puzzle

**Problem:** Find the first consecutive sequence of digits in pi that is divisible by both 3 and 37.

**Key insight:** Since 3 and 37 are coprime, their LCM is $3 \times 37 = 111$. We need the first substring of pi's digits that forms a number divisible by 111.

**Algorithmic approach:**

1. Obtain a long string of pi's digits.
2. For each starting position, extend the substring one digit at a time.
3. Use modular arithmetic to check divisibility without building huge numbers.

The modular arithmetic trick: if the current substring's value modulo 111 is $r$, and we append digit $d$, the new remainder is $(r \times 10 + d) \mod 111$. We never need to construct the full number.

```js
let piDigits = "14159265358979323846..."; // many digits

function findFirstDivisible(digits, divisor) {
    for (let start = 0; start < digits.length; start++) {
        let remainder = 0;
        for (let end = start; end < digits.length; end++) {
            remainder = (remainder * 10 + parseInt(digits[end])) % divisor;
            if (remainder === 0 && end >= start) {
                let seq = digits.substring(start, end + 1);
                if (parseInt(seq) > 0) {
                    return { sequence: seq, position: start };
                }
            }
        }
    }
    return null;
}

let result = findFirstDivisible(piDigits, 111);
console.log(`Found: ${result.sequence} at position ${result.position}`);
```

**Clarifying questions that matter:**

- Do we include the `3` before the decimal point?
- Do we count positions from 0 or 1?
- What about leading zeros?

These ambiguities are part of the puzzle. In a real interview, asking these questions demonstrates careful thinking.

### 3.2 The Egg Drop Puzzle

**Problem:** 100 steps, 2 eggs. Find the highest safe step $S^*$ while minimizing worst-case upward steps climbed.

**Key insight:** This is an optimization problem. With 1 egg, you must test linearly (worst case $n(n+1)/2$ steps for $n$ stairs). With 2 eggs, you can use the first egg to skip ahead, then the second egg to search linearly within a segment.

**Dynamic programming formulation:**

Let $\text{dp}[n][e]$ = minimum worst-case upward steps for $n$ remaining stairs with $e$ eggs.

Base cases:
- $\text{dp}[0][e] = 0$ (no stairs to test)
- $\text{dp}[n][1] = n(n+1)/2$ (linear search, climbing 1+2+...+n)

Recurrence:
$$\text{dp}[n][e] = \min_{k=1}^{n} \left[ k + \max(\text{dp}[k-1][e-1], \text{dp}[n-k][e]) \right]$$

Here $k$ is the relative step we drop from. The $k$ cost accounts for climbing $k$ steps. If the egg breaks, we search $k-1$ stairs below with one fewer egg. If it survives, we search $n-k$ stairs above with both eggs.

```js
function eggDrop(totalSteps, numEggs) {
    let dp = Array.from({ length: totalSteps + 1 }, () =>
        new Array(numEggs + 1).fill(Infinity)
    );

    for (let e = 0; e <= numEggs; e++) dp[0][e] = 0;
    for (let n = 1; n <= totalSteps; n++) dp[n][1] = n * (n + 1) / 2;

    for (let e = 2; e <= numEggs; e++) {
        for (let n = 1; n <= totalSteps; n++) {
            for (let k = 1; k <= n; k++) {
                let worst = k + Math.max(dp[k - 1][e - 1], dp[n - k][e]);
                dp[n][e] = Math.min(dp[n][e], worst);
            }
        }
    }

    return dp[totalSteps][numEggs];
}

console.log("Minimum worst-case steps:", eggDrop(100, 2));
```

---

## 4. Code Ethics and Attribution

### 4.1 Attribution

Attribution means crediting the source of code you use. In comments, include who wrote it, where you found it, and what you changed.

### 4.2 LLM Usage

When using LLM-generated code:
1. Mark the code clearly with begin/end comments.
2. Name the LLM and version.
3. Include your prompts as comments.
4. Understand every line -- you are responsible for it.

```js
// --- BEGIN LLM-GENERATED CODE ---
// Generated by: Claude 3.5 Sonnet (Anthropic), March 2026
// Prompt: "Write a function that maps frequency to HSB color"
function freqToColor(freq) {
    let hue = map(log(freq / 20) / log(1000), 0, 1, 0, 240);
    return color(hue, 80, 90);
}
// --- END LLM-GENERATED CODE ---
```

### 4.3 Open Source Licenses

Common licenses in order of permissiveness:

1. **MIT** -- do anything, keep the copyright notice
2. **Apache 2.0** -- like MIT but with patent protection
3. **LGPL** -- can use the library but modifications must be shared (p5.js uses this)
4. **GPL** -- your entire project must be open source if you use GPL code
5. **No license** -- all rights reserved, do not use without permission

### 4.4 The Golden Rule

**When in doubt, over-attribute.** No one has ever been penalized for giving too much credit. If you are unsure whether something counts as borrowing, cite it anyway.

---

## Exercises

### ShaderToy Translation

1. **Translate a simple shader**: Go to <https://www.shadertoy.com>, find a shader tagged "simple" or "beginner", and translate it to run in the p5.js web editor. Document every change you made.

2. **Add mouse interaction**: Take the plasma shader example from this chapter and modify it so that the `iMouse` uniform controls the center of the pattern. The plasma should radiate outward from the mouse position.

3. **Multipass translation**: Find a ShaderToy shader that uses Buffer A (just one buffer pass). Translate it to p5.js using `createFramebuffer()`.

### Fading Techniques

4. **Color trails**: Modify the GPU fading example so that the fade color changes over time (cycle through hues). Hint: pass a time-varying `u_bgColor` to the shader.

5. **Multiple lifetimes**: In the CPU fading example, create three different brush types (press 1, 2, 3) with different `maxAge` values and colors.

6. **Hybrid system**: Combine GPU framebuffer fading with CPU-managed particles. The particles should be drawn into the framebuffer so they leave fading trails.

### Algorithmic Thinking

7. **Pi palindrome**: Write a function that finds the first 5-digit palindrome in pi's digits. A palindrome reads the same forward and backward (e.g., 14141).

8. **Egg drop generalization**: Modify the egg drop solution to work with 3 eggs. How much does the optimal cost decrease compared to 2 eggs?

9. **Visualization**: Create a p5.js sketch that animates the pi digit search. Highlight the current search window and flash green when a divisible sequence is found.

### Code Ethics

10. **License audit**: Pick three JavaScript libraries you have used this quarter. Find each library's license. Write a brief summary of what each license allows and requires.

11. **Attribution practice**: Take one of your previous assignments and add proper attribution to every external source you used (tutorials, Stack Overflow answers, classmate help, LLM usage).

---

## Summary

- ShaderToy shaders can be translated to p5.js by changing the entry point, uniform names, coordinate system, and texture sampling functions.
- Fading effects can be implemented on the GPU (framebuffer feedback) for uniform pixel-level decay, or on the CPU (aging data structures) for per-object control.
- Algorithmic puzzles test your ability to decompose problems, handle edge cases, and apply techniques like modular arithmetic and dynamic programming.
- Code attribution is both an ethical obligation and a professional practice. Always credit your sources, disclose LLM usage, and understand the licenses of code you use.

---

## Further Reading

- ShaderToy: <https://www.shadertoy.com>
- The Book of Shaders: <https://thebookofshaders.com>
- p5.js Framebuffer Reference: <https://p5js.org/reference/p5/createFramebuffer/>
- Pi Digits: <https://www.piday.org/million/>
- Dynamic Programming: <https://en.wikipedia.org/wiki/Dynamic_programming>
- Choose a License: <https://choosealicense.com>
- p5.js AI Usage Policy: <https://github.com/processing/p5.js/blob/dev-2.0/AI_USAGE_POLICY.md>
- Retro Video Feedback (ShaderToy): <https://www.shadertoy.com/view/ddf3zl>
- Retro Video Feedback (p5.js): <https://editor.p5js.org/erennie97/sketches/V1KPqUih1>
