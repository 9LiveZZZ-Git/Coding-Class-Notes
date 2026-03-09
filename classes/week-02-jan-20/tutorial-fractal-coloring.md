# Tutorial: Advanced Fractal Coloring Techniques

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## Overview

A basic Mandelbrot renderer gives us a two-color image: inside the set (converges) or outside (diverges). By counting how many iterations it takes to escape, we get a gradient. But we can do much better.

The iteration process traces a **path** through the complex plane. Each step jumps $z$ to a new position. That path carries a wealth of statistical information we can use to decide color. Combined with alternative color spaces like HSV and CIELAB, we can produce images that are far more visually rich than a simple grayscale gradient.

Reference sketch showing iteration paths: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>

Coloring tutorial reference: <https://mandelbrowser.y0.pl/tutorial/computing.html>

This tutorial covers:

1. Extracting iteration statistics (path length, average segment, distance, curvature)
2. Smooth coloring with the normalized iteration count
3. HSV color mapping in GLSL
4. CIELAB color space basics
5. Putting it all together with complete code examples

---

## 1. The Iteration Path

When we iterate $z_{n+1} = z_n^2 + c$, starting from $z_0 = 0$, the sequence $z_0, z_1, z_2, \ldots$ traces a path through the complex plane (a 2D space where the x-axis is the real part and the y-axis is the imaginary part).

For a pixel that escapes (diverges) after $N$ iterations, we have visited positions $z_0, z_1, z_2, \ldots, z_N$. Each consecutive pair $(z_i, z_{i+1})$ defines a **segment**. We can measure many things about this path.

### Statistic 1: Total Path Length

The total distance traveled by $z$ during iteration:

$$
L = \sum_{i=0}^{N-1} |z_{i+1} - z_i|
$$

In GLSL:

```glsl
float pathLength = 0.0;
vec2 prevZ = z;

for (int i = 0; i < MAX_ITER; i++) {
  vec2 newZ = cx_sqr(z) + c;
  pathLength += distance(newZ, z);
  z = newZ;
  if (dot(z, z) > 4.0) break;
  iterations++;
}
```

Points near the boundary of the set tend to have long, wandering paths before they escape. Points far from the set escape quickly with short paths. This gives us a measure of "how dramatic" the journey was.

### Statistic 2: Average Segment Length

The average distance per step:

$$
\bar{s} = \frac{L}{N}
$$

```glsl
float avgSegment = pathLength / float(iterations + 1);
```

This tells us whether the path moved in big leaps or small steps. Near the set boundary, $z$ tends to hover close before suddenly flying away, producing small average segments.

### Statistic 3: Distance from Start to End

The straight-line distance from $z_0$ to the final $z_N$:

$$
D = |z_N - z_0|
$$

```glsl
float startToEnd = length(z); // since z_0 = (0,0)
```

This is the "displacement" as opposed to the "distance traveled." Compare this to the total path length to see how much the path doubled back on itself.

### Statistic 4: Path Curvature (Tortuosity)

A measure of how curved or winding the path is. One simple approach is the ratio of total path length to displacement:

$$
\tau = \frac{L}{D}
$$

A straight path has $\tau = 1$. A very winding path has $\tau \gg 1$.

```glsl
float tortuosity = pathLength / max(length(z), 0.001);
```

Another approach to curvature: measure the sum of angle changes at each step.

```glsl
float totalCurvature = 0.0;
vec2 prevDir = vec2(1.0, 0.0);

for (int i = 0; i < MAX_ITER; i++) {
  vec2 newZ = cx_sqr(z) + c;
  vec2 dir = newZ - z;
  float dirLen = length(dir);
  if (dirLen > 0.001) {
    dir /= dirLen;
    // Angle between consecutive directions
    float cosAngle = dot(dir, prevDir);
    totalCurvature += acos(clamp(cosAngle, -1.0, 1.0));
    prevDir = dir;
  }
  z = newZ;
  if (dot(z, z) > 4.0) break;
  iterations++;
}
```

### Statistic 5: Average Orbit Distance

The average distance of $z$ from the origin during the iteration:

$$
\bar{r} = \frac{1}{N}\sum_{i=0}^{N} |z_i|
$$

```glsl
float sumR = 0.0;
for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  sumR += length(z);
  if (dot(z, z) > 4.0) break;
  iterations++;
}
float avgOrbitDist = sumR / float(iterations + 1);
```

---

## 2. Smooth Coloring with the Normalized Iteration Count

The basic iteration count gives us integer values, which leads to visible "banding" in the image -- sharp boundaries between colors. We can fix this with the **normalized iteration count** (also called the "smooth iteration count").

### The Problem

If pixel A escapes at iteration 47 and pixel B escapes at iteration 48, they get different colors even though they might be nearly identical points. The color jumps discretely.

### The Solution

When $z$ escapes (say $|z| > R$ for some escape radius $R$), we know it escaped "somewhere between" iteration $n$ and iteration $n+1$. We can interpolate using the final magnitude:

$$
n_{\text{smooth}} = n + 1 - \frac{\log(\log|z_n|)}{\log 2}
$$

This formula comes from the theory of the Mandelbrot set's potential function. It gives us a continuous (smooth) value that eliminates banding.

### In GLSL

```glsl
int iterations = 0;
for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  if (dot(z, z) > 256.0) break; // use larger escape radius for smoothing
  iterations++;
}

// Smooth iteration count
float smoothIter = float(iterations);
if (iterations < MAX_ITER) {
  float logZn = log(dot(z, z)) / 2.0; // log|z|
  float nu = log(logZn / log(2.0)) / log(2.0);
  smoothIter = float(iterations) + 1.0 - nu;
}
float t = smoothIter / float(MAX_ITER);
```

Note that we use a larger escape radius (256 instead of 4) to make the smoothing work better. The formula is based on $z^2 + c$ specifically; for other iteration rules, you may need to adjust.

---

## 3. HSV Color Mapping in GLSL

### What is HSV?

**HSV** stands for **Hue, Saturation, Value**:

- **Hue** (0--360 degrees, or 0.0--1.0): The "color" -- red, orange, yellow, green, cyan, blue, purple, and back to red. It is cyclic.
- **Saturation** (0.0--1.0): How vivid the color is. 0 = gray, 1 = fully saturated.
- **Value** (0.0--1.0): How bright. 0 = black, 1 = full brightness.

HSV is a better color model for fractals than RGB because we can easily cycle through all colors by varying hue, while keeping brightness and saturation constant.

### HSV to RGB Conversion in GLSL

```glsl
vec3 hsv2rgb(vec3 c) {
  // c.x = hue (0-1), c.y = saturation (0-1), c.z = value (0-1)
  vec3 rgb = clamp(
    abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
  return c.z * mix(vec3(1.0), rgb, c.y);
}
```

### Using HSV for Fractal Coloring

```glsl
float t = smoothIter / float(MAX_ITER);

// Map iteration count to hue, keep saturation and value high
vec3 color = hsv2rgb(vec3(t, 0.8, 1.0));

// For converged points (inside the set), make them black
if (iterations == MAX_ITER) {
  color = vec3(0.0);
}
```

### Multiple Statistics to HSV Channels

We can map different statistics to different HSV channels:

```glsl
float hue = fract(smoothIter / 30.0);           // hue from iteration count
float sat = clamp(avgSegment * 2.0, 0.3, 1.0);  // saturation from avg segment
float val = clamp(1.0 - tortuosity * 0.1, 0.0, 1.0); // value from curvature

vec3 color = hsv2rgb(vec3(hue, sat, val));
```

---

## 4. Cosine Color Palettes

Inigo Quilez popularized a technique for generating smooth color palettes using a cosine function:

$$
\text{color}(t) = a + b \cdot \cos(2\pi(c \cdot t + d))
$$

where $a$, $b$, $c$, and $d$ are `vec3` parameters that control the palette.

```glsl
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}
```

Some beautiful palette presets:

```glsl
// Rainbow
vec3 color = palette(t,
  vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67)
);

// Hot (fire-like)
vec3 color = palette(t,
  vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5),
  vec3(1.0, 1.0, 1.0), vec3(0.0, 0.10, 0.20)
);

// Cool (ocean)
vec3 color = palette(t,
  vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5),
  vec3(1.0, 1.0, 1.0), vec3(0.30, 0.20, 0.20)
);

// Electric
vec3 color = palette(t,
  vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5),
  vec3(1.0, 0.7, 0.4), vec3(0.0, 0.15, 0.20)
);
```

See Inigo Quilez's article on this: <https://iquilezles.org/articles/palettes/>

---

## 5. CIELAB Color Space

### What is CIELAB?

**CIELAB** (also written CIE L\*a\*b\*) is a color space designed to be **perceptually uniform**: a given numerical change in color values produces a roughly equal perceived change in color, regardless of where in the color space you are.

- **L\*** (0--100): Lightness. 0 = black, 100 = white.
- **a\*** (roughly -128 to +127): Green-red axis. Negative = green, positive = red.
- **b\*** (roughly -128 to +127): Blue-yellow axis. Negative = blue, positive = yellow.

### Why CIELAB for Fractals?

RGB and even HSV have uneven perceptual properties. In RGB, the same numerical distance in different parts of the color cube looks very different to our eyes. Blue-to-green and red-to-yellow are not perceptually equivalent.

CIELAB ensures that equal numerical steps produce equal perceptual steps. This means gradients look smoother and more natural.

### CIELAB to RGB Conversion in GLSL

The conversion goes CIELAB -> XYZ -> linear RGB -> sRGB. It is more complex than HSV conversion:

```glsl
vec3 lab2rgb(vec3 lab) {
  // L*, a*, b* to XYZ
  float fy = (lab.x + 16.0) / 116.0;
  float fx = lab.y / 500.0 + fy;
  float fz = fy - lab.z / 200.0;

  float delta = 6.0 / 29.0;
  float delta2 = delta * delta;
  float delta3 = delta2 * delta;

  float x = (fx > delta) ? fx*fx*fx : (fx - 16.0/116.0) * 3.0 * delta2;
  float y = (fy > delta) ? fy*fy*fy : (fy - 16.0/116.0) * 3.0 * delta2;
  float z = (fz > delta) ? fz*fz*fz : (fz - 16.0/116.0) * 3.0 * delta2;

  // D65 white point
  x *= 0.95047;
  // y *= 1.0;
  z *= 1.08883;

  // XYZ to linear RGB
  float r =  3.2406 * x - 1.5372 * y - 0.4986 * z;
  float g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  float b =  0.0557 * x - 0.2040 * y + 1.0570 * z;

  // Linear to sRGB gamma
  r = (r > 0.0031308) ? 1.055 * pow(r, 1.0/2.4) - 0.055 : 12.92 * r;
  g = (g > 0.0031308) ? 1.055 * pow(g, 1.0/2.4) - 0.055 : 12.92 * g;
  b = (b > 0.0031308) ? 1.055 * pow(b, 1.0/2.4) - 0.055 : 12.92 * b;

  return clamp(vec3(r, g, b), 0.0, 1.0);
}
```

### Using CIELAB for Fractal Coloring

```glsl
float t = smoothIter / float(MAX_ITER);

// Map t to a path through CIELAB space
float L = 50.0 + 40.0 * cos(t * 6.28318);       // Lightness oscillates
float a = 80.0 * cos(t * 6.28318 * 3.0);          // green-red
float b = 80.0 * sin(t * 6.28318 * 3.0 + 1.0);   // blue-yellow

vec3 color = lab2rgb(vec3(L, a, b));
```

---

## 6. Complete Example: Multi-Statistic Fractal Coloring

Here is a complete p5.js sketch that tracks multiple iteration statistics and maps them to color using HSV.

```js
// Fractal Coloring Explorer
// MAT 200C -- Week 2
//
// Press 1-5 to switch coloring modes
// Move mouse to explore Julia sets
// Press S to save

let s;
let colorMode_i = 0;

let vertSrc = `
precision highp float;
attribute vec3 aPosition;
varying vec2 vPosition;
void main() {
  gl_Position = vec4(aPosition, 1.0);
  vPosition = gl_Position.xy;
}
`;

let fragSrc = `
precision highp float;
varying vec2 vPosition;
uniform vec2 resolution;
uniform vec2 mouse;
uniform int colorMode;

vec2 cx_sqr(vec2 z) {
  return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y);
}

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(
    abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0, 1.0
  );
  return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 palette(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.1, 0.2)));
}

void main() {
  float aspect = resolution.x / resolution.y;
  vec2 c = vPosition * vec2(aspect, 1.0) * 1.5 - vec2(0.5, 0.0);
  vec2 z = vec2(0.0);

  const int MAX_ITER = 300;
  int iterations = 0;

  // Statistics
  float pathLength = 0.0;
  float sumOrbitDist = 0.0;
  float totalCurvature = 0.0;
  vec2 prevDir = vec2(1.0, 0.0);
  vec2 prevZ = z;

  for (int i = 0; i < MAX_ITER; i++) {
    vec2 newZ = cx_sqr(z) + c;

    // Segment length
    float segLen = distance(newZ, z);
    pathLength += segLen;

    // Orbit distance
    sumOrbitDist += length(newZ);

    // Curvature (angle between consecutive segments)
    vec2 dir = newZ - z;
    float dirLen = length(dir);
    if (dirLen > 0.0001 && i > 0) {
      dir /= dirLen;
      float cosA = clamp(dot(dir, prevDir), -1.0, 1.0);
      totalCurvature += acos(cosA);
      prevDir = dir;
    }

    z = newZ;
    if (dot(z, z) > 256.0) break;
    iterations++;
  }

  // Derived statistics
  float avgSegment = pathLength / max(float(iterations), 1.0);
  float displacement = length(z);
  float tortuosity = pathLength / max(displacement, 0.001);
  float avgOrbit = sumOrbitDist / max(float(iterations), 1.0);

  // Smooth iteration count
  float smoothIter = float(iterations);
  if (iterations < MAX_ITER) {
    float logZn = log(dot(z, z)) / 2.0;
    float nu = log(logZn / log(2.0)) / log(2.0);
    smoothIter = float(iterations) + 1.0 - nu;
  }
  float t = smoothIter / float(MAX_ITER);

  vec3 color = vec3(0.0);

  // Coloring modes
  if (colorMode == 0) {
    // Mode 0: Simple smooth iteration count
    color = palette(t * 5.0);

  } else if (colorMode == 1) {
    // Mode 1: HSV from iteration count
    float hue = fract(smoothIter / 40.0);
    color = hsv2rgb(vec3(hue, 0.85, 0.9));

  } else if (colorMode == 2) {
    // Mode 2: Path length mapped to hue
    float hue = fract(log(pathLength + 1.0) * 0.2);
    float val = clamp(t * 3.0, 0.0, 1.0);
    color = hsv2rgb(vec3(hue, 0.9, val));

  } else if (colorMode == 3) {
    // Mode 3: Multiple statistics
    float hue = fract(smoothIter / 30.0);
    float sat = clamp(avgSegment * 0.5, 0.3, 1.0);
    float val = clamp(1.0 - totalCurvature * 0.05, 0.2, 1.0);
    color = hsv2rgb(vec3(hue, sat, val));

  } else if (colorMode == 4) {
    // Mode 4: Orbit trap (distance to nearest axis crossing)
    float hue = fract(avgOrbit * 0.3);
    float sat = 0.7 + 0.3 * sin(tortuosity);
    float val = 0.5 + 0.5 * cos(t * 3.14159);
    color = hsv2rgb(vec3(hue, sat, val));
  }

  // Inside the set = black
  if (iterations == MAX_ITER) color = vec3(0.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  s = createShader(vertSrc, fragSrc);
  noStroke();
}

function draw() {
  shader(s);
  s.setUniform("resolution", [width, height]);
  s.setUniform("mouse", [
    map(mouseX, 0, width, -1, 1),
    map(mouseY, 0, height, 1, -1)
  ]);
  s.setUniform("colorMode", colorMode_i);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function keyPressed() {
  if (key === '1') colorMode_i = 0;
  if (key === '2') colorMode_i = 1;
  if (key === '3') colorMode_i = 2;
  if (key === '4') colorMode_i = 3;
  if (key === '5') colorMode_i = 4;
  if (key === 's' || key === 'S') saveCanvas('fractal-colored', 'png');
}
```

---

## 7. Orbit Traps

An **orbit trap** is a region or geometric shape placed in the complex plane. During iteration, we track the minimum distance from $z$ to this trap. This distance is then used for coloring.

### Point Trap

The simplest trap: track the minimum distance to a fixed point (often the origin).

```glsl
float minDist = 1e10;

for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  minDist = min(minDist, length(z));  // distance to origin
  if (dot(z, z) > 4.0) break;
  iterations++;
}

// Use minDist for coloring
float t = clamp(minDist * 0.5, 0.0, 1.0);
```

### Line Trap

Track minimum distance to the real axis (or imaginary axis):

```glsl
float minDistToAxis = 1e10;

for (int i = 0; i < MAX_ITER; i++) {
  z = cx_sqr(z) + c;
  minDistToAxis = min(minDistToAxis, abs(z.y)); // distance to real axis
  if (dot(z, z) > 4.0) break;
  iterations++;
}
```

### Cross Trap

Minimum distance to either axis:

```glsl
float trap = min(abs(z.x), abs(z.y));
minDist = min(minDist, trap);
```

### Circle Trap

Distance to a circle of radius $r$:

```glsl
float trap = abs(length(z) - r);
minDist = min(minDist, trap);
```

---

## 8. Combining Multiple Statistics

The most visually rich fractal images combine several statistics. Here is a pattern:

```glsl
// After the iteration loop, we have:
// - smoothIter:     smooth iteration count
// - pathLength:     total path length
// - avgSegment:     average segment length
// - displacement:   start-to-end distance
// - tortuosity:     pathLength / displacement
// - totalCurvature: sum of angle changes
// - minDist:        orbit trap distance
// - avgOrbit:       average distance from origin

// Map to color channels
float r = sin(smoothIter * 0.1) * 0.5 + 0.5;
float g = sin(pathLength * 0.05 + 2.0) * 0.5 + 0.5;
float b = sin(avgOrbit * 0.2 + 4.0) * 0.5 + 0.5;

vec3 color = vec3(r, g, b);
```

Or use HSV for more control:

```glsl
float hue = fract(smoothIter * 0.02 + minDist * 0.5);
float sat = clamp(0.4 + avgSegment * 0.3, 0.0, 1.0);
float val = clamp(smoothIter / float(MAX_ITER) * 2.0, 0.0, 1.0);

vec3 color = hsv2rgb(vec3(hue, sat, val));
```

---

## 9. Tips for Good Fractal Coloring

1. **Use smooth iteration count**: Always prefer the smooth count over raw integers to avoid banding.

2. **Use a larger escape radius**: For smooth coloring to work well, use an escape radius of at least 256 (check `dot(z,z) > 256.0` instead of `> 4.0`).

3. **Log-scale your statistics**: Path length and orbit distances can vary over many orders of magnitude. Taking `log(x + 1.0)` before mapping to color prevents a few extreme values from dominating.

4. **Normalize by iteration count**: Divide cumulative statistics like `pathLength` by `iterations` to get per-step values. This makes the statistics more comparable across different parts of the image.

5. **The set interior is tricky**: Points inside the set never escape, so iteration-based statistics are less meaningful. Consider using separate coloring logic for interior points (or just make them black).

6. **Cycle the palette**: Use `fract()` or `mod()` to cycle through colors multiple times. `fract(t * 5.0)` gives 5 full color cycles across the range.

7. **Experiment**: There is no single "correct" coloring. The whole point is creative exploration. Try mapping statistics to different channels, try different palettes, try multiplying and combining in unexpected ways.

---

## Exercises

1. **Smooth banding comparison**: Render the same fractal region with and without smooth iteration count. Compare the results side by side.

2. **Statistic explorer**: Create a sketch with 4 viewports (quadrants), each showing the same fractal colored by a different statistic: iteration count, path length, curvature, and orbit trap distance.

3. **Custom palette**: Design your own cosine palette parameters. Use Inigo Quilez's palette editor: <https://iquilezles.org/articles/palettes/>.

4. **CIELAB gradient**: Implement the CIELAB-to-RGB conversion and create a gradient through CIELAB space. Compare it visually to the same gradient in RGB (you should see that the CIELAB version looks more perceptually even).

5. **Orbit trap art**: Use a circle orbit trap with a mouse-controlled radius. As you move the mouse, the trap changes and the fractal patterns shift.

---

## Resources

- Iteration path visualization: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>
- Coloring tutorial: <https://mandelbrowser.y0.pl/tutorial/computing.html>
- Coloring sketch: <https://editor.p5js.org/kybr/sketches/NR0obTTlL>
- HSV color space: <https://en.wikipedia.org/wiki/HSL_and_HSV>
- CIELAB color space: <https://en.wikipedia.org/wiki/CIELAB_color_space>
- Inigo Quilez palette article: <https://iquilezles.org/articles/palettes/>
