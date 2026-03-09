# Tutorial: Color Permutations -- Exploring Color Through Code

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Overview

Color is fundamental to visual art, and code gives us a precise, systematic way to explore it. In this tutorial, we will use combinatorics to generate every possible combination of R, G, and B at three discrete levels (0, 0.5, and 1), producing exactly 27 unique colors. We will display them as swatches, analyze the results, and learn about color spaces programmatically.

We will cover:

1. The RGB color model and how p5.js handles it
2. Why $3 \times 3 \times 3 = 27$ combinations
3. Generating all permutations with nested loops
4. Displaying color swatches in a grid
5. Sorting and organizing colors
6. Extending to other color spaces (HSB)

---

## Prerequisites

- Basic p5.js knowledge (setup/draw, shapes, color)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Part 1: The RGB Color Model

### How RGB Works

Every color on a computer screen is made by mixing three primary light colors:

- **R** (Red)
- **G** (Green)
- **B** (Blue)

Each channel has a value from 0 (none) to 255 (maximum). In GLSL and in many creative coding contexts, we normalize these values to the range 0.0 to 1.0.

Some examples:

| Color | R | G | B | Normalized (R, G, B) |
|---|---|---|---|---|
| Black | 0 | 0 | 0 | (0.0, 0.0, 0.0) |
| White | 255 | 255 | 255 | (1.0, 1.0, 1.0) |
| Red | 255 | 0 | 0 | (1.0, 0.0, 0.0) |
| Green | 0 | 255 | 0 | (0.0, 1.0, 0.0) |
| Blue | 0 | 0 | 255 | (0.0, 0.0, 1.0) |
| Yellow | 255 | 255 | 0 | (1.0, 1.0, 0.0) |
| Cyan | 0 | 255 | 255 | (0.0, 1.0, 1.0) |
| Magenta | 255 | 0 | 255 | (1.0, 0.0, 1.0) |
| Gray | 128 | 128 | 128 | (0.5, 0.5, 0.5) |

### p5.js Color Modes

By default, p5.js uses RGB with values from 0 to 255:

```js
fill(255, 0, 0);  // bright red
fill(0, 128, 255); // medium blue
```

You can switch to normalized (0-1) mode:

```js
colorMode(RGB, 1.0);
fill(1.0, 0.0, 0.0);  // bright red
fill(0.0, 0.5, 1.0);  // medium blue
```

---

## Part 2: Counting the Combinations

If each of R, G, B can take one of 3 values (0, 0.5, or 1), how many unique colors are there?

This is a simple combinatorics problem. Each channel has 3 independent choices:

$$\text{total colors} = 3 \times 3 \times 3 = 27$$

We can verify this: $x \cdot x = 27$ means $x = 3$, and $\sqrt{27} = 3\sqrt{3} \approx 5.196$.

These 27 colors include:

- **1 black** (0, 0, 0)
- **1 white** (1, 1, 1)
- **3 pure grays** at each level: (0, 0, 0), (0.5, 0.5, 0.5), (1, 1, 1)
- **6 primary/secondary colors** at full intensity
- **Many intermediate colors** with half-intensity channels

---

## Part 3: Generating All Combinations

### Approach: Nested Loops

The simplest way to generate all combinations is with three nested loops:

```js
let colors = [];
let values = [0, 0.5, 1.0];

for (let ri = 0; ri < values.length; ri++) {
  for (let gi = 0; gi < values.length; gi++) {
    for (let bi = 0; bi < values.length; bi++) {
      colors.push({
        r: values[ri],
        g: values[gi],
        b: values[bi]
      });
    }
  }
}

console.log(colors.length); // 27
```

Each iteration of the innermost loop creates one unique (r, g, b) triple. Since each loop runs 3 times, we get $3^3 = 27$ triples.

### Alternative: Single Loop with Math

You can also generate all combinations with a single loop using modular arithmetic:

```js
let colors = [];
let values = [0, 0.5, 1.0];
let n = values.length; // 3

for (let i = 0; i < n * n * n; i++) {
  let ri = i % n;
  let gi = Math.floor(i / n) % n;
  let bi = Math.floor(i / (n * n)) % n;
  colors.push({
    r: values[ri],
    g: values[gi],
    b: values[bi]
  });
}
```

This approach treats the color index as a base-3 number, where each "digit" selects a value for one channel.

---

## Part 4: Displaying Color Swatches

### Complete Working Example: Grid of 27 Swatches

```js
let colors = [];
let values = [0, 0.5, 1.0];

function setup() {
  createCanvas(600, 400);
  colorMode(RGB, 1.0);

  // Generate all 27 color combinations
  for (let ri = 0; ri < values.length; ri++) {
    for (let gi = 0; gi < values.length; gi++) {
      for (let bi = 0; bi < values.length; bi++) {
        colors.push({
          r: values[ri],
          g: values[gi],
          b: values[bi]
        });
      }
    }
  }

  noLoop(); // only draw once
}

function draw() {
  background(0.2);

  let cols = 9;
  let rows = 3;
  let swatchW = width / cols - 10;
  let swatchH = height / rows - 40;
  let margin = 10;

  textAlign(CENTER);
  textSize(9);

  for (let i = 0; i < colors.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = margin + col * (swatchW + margin / 2);
    let y = margin + row * (swatchH + 30);

    let c = colors[i];

    // Draw swatch
    noStroke();
    fill(c.r, c.g, c.b);
    rect(x, y, swatchW, swatchH, 4);

    // Draw label
    // Use contrasting text color
    let brightness = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
    fill(brightness > 0.5 ? 0 : 1);
    text(`${c.r}`, x + swatchW / 2, y + swatchH / 2 - 6);
    text(`${c.g}`, x + swatchW / 2, y + swatchH / 2 + 4);
    text(`${c.b}`, x + swatchW / 2, y + swatchH / 2 + 14);
  }

  // Title
  fill(1);
  textSize(14);
  textAlign(LEFT);
  text("All 27 RGB Combinations (R, G, B at 0, 0.5, 1)", 10, height - 10);
}
```

### What You Will See

The sketch displays a 9x3 grid of colored rectangles. Each rectangle shows its RGB values as text. You will notice:

- The corners of the grid contain the most extreme colors (pure primaries, secondaries, black, white).
- The center of the grid contains more neutral, muted colors.
- Gray appears three times: (0,0,0), (0.5,0.5,0.5), (1,1,1).

---

## Part 5: Sorting Colors

The order in which we display colors affects how we perceive them. Let us try different sorting strategies.

### Sort by Brightness

```js
colors.sort((a, b) => {
  let brightnessA = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
  let brightnessB = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
  return brightnessA - brightnessB;
});
```

The formula `0.299*R + 0.587*G + 0.114*B` is the standard perceived brightness (luminance) formula. It weights green most heavily because human eyes are most sensitive to green light.

### Sort by Hue

Convert to HSB first, then sort:

```js
colors.sort((a, b) => {
  colorMode(HSB, 1.0);
  let ca = color(a.r * 255, a.g * 255, a.b * 255);
  let cb = color(b.r * 255, b.g * 255, b.b * 255);
  colorMode(RGB, 255);
  return hue(ca) - hue(cb);
});
```

### Sort by Channel Sum

A simple sort by the total amount of "color":

```js
colors.sort((a, b) => {
  return (a.r + a.g + a.b) - (b.r + b.g + b.b);
});
```

---

## Part 6: Interactive Exploration

### Hover to Inspect

Add interactivity so hovering over a swatch shows detailed information:

```js
let colors = [];
let values = [0, 0.5, 1.0];
let hoveredIndex = -1;

function setup() {
  createCanvas(700, 500);
  colorMode(RGB, 1.0);

  for (let ri = 0; ri < values.length; ri++) {
    for (let gi = 0; gi < values.length; gi++) {
      for (let bi = 0; bi < values.length; bi++) {
        colors.push({ r: values[ri], g: values[gi], b: values[bi] });
      }
    }
  }
}

function draw() {
  background(0.15);

  let cols = 9;
  let swatchSize = 55;
  let gap = 8;
  let offsetX = 30;
  let offsetY = 30;

  hoveredIndex = -1;

  for (let i = 0; i < colors.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = offsetX + col * (swatchSize + gap);
    let y = offsetY + row * (swatchSize + gap);

    let c = colors[i];

    // Check hover
    if (mouseX > x && mouseX < x + swatchSize &&
        mouseY > y && mouseY < y + swatchSize) {
      hoveredIndex = i;
      stroke(1.0);
      strokeWeight(3);
    } else {
      noStroke();
    }

    fill(c.r, c.g, c.b);
    rect(x, y, swatchSize, swatchSize, 4);
  }

  // Info panel
  if (hoveredIndex >= 0) {
    let c = colors[hoveredIndex];
    let panelY = 280;

    // Large preview swatch
    noStroke();
    fill(c.r, c.g, c.b);
    rect(30, panelY, 100, 100, 8);

    // Text info
    fill(1);
    textSize(14);
    textAlign(LEFT);
    let r255 = floor(c.r * 255);
    let g255 = floor(c.g * 255);
    let b255 = floor(c.b * 255);

    text(`RGB (0-1):   ${c.r.toFixed(1)}, ${c.g.toFixed(1)}, ${c.b.toFixed(1)}`, 150, panelY + 20);
    text(`RGB (0-255): ${r255}, ${g255}, ${b255}`, 150, panelY + 40);
    text(`Hex:         #${hex(r255, 2)}${hex(g255, 2)}${hex(b255, 2)}`, 150, panelY + 60);

    // Perceived brightness
    let lum = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
    text(`Luminance:   ${lum.toFixed(3)}`, 150, panelY + 80);
  }
}

function hex(n, digits) {
  return n.toString(16).padStart(digits, '0').toUpperCase();
}
```

---

## Part 7: Extending to More Values

What happens with more steps? If each channel has $n$ values, we get $n^3$ colors.

| Steps per channel | Total colors | Grid size |
|---|---|---|
| 2 (0, 1) | 8 | 4 x 2 |
| 3 (0, 0.5, 1) | 27 | 9 x 3 |
| 4 (0, 0.33, 0.67, 1) | 64 | 8 x 8 |
| 5 | 125 | 25 x 5 |
| 6 | 216 | "Web safe" colors |
| 256 | 16,777,216 | All 24-bit colors |

The classic "web safe" palette from the 1990s used 6 steps per channel (0, 51, 102, 153, 204, 255), giving 216 colors.

### Generalized Version

```js
let colors = [];
let steps = 4; // try 2, 3, 4, 5, 6

function setup() {
  createCanvas(800, 600);
  colorMode(RGB, 1.0);

  for (let ri = 0; ri < steps; ri++) {
    for (let gi = 0; gi < steps; gi++) {
      for (let bi = 0; bi < steps; bi++) {
        colors.push({
          r: ri / (steps - 1),
          g: gi / (steps - 1),
          b: bi / (steps - 1)
        });
      }
    }
  }

  noLoop();
}

function draw() {
  background(0.1);

  let total = colors.length;
  let cols = ceil(sqrt(total));
  let rows = ceil(total / cols);
  let sw = width / cols;
  let sh = height / rows;

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let c = colors[i];
    noStroke();
    fill(c.r, c.g, c.b);
    rect(col * sw, row * sh, sw - 1, sh - 1);
  }
}
```

---

## Part 8: Understanding Color Spaces

### RGB as a Cube

The 27 colors we generated are evenly spaced points inside the **RGB color cube**:

- The cube has corners at (0,0,0) = black and (1,1,1) = white.
- The edges connect to pure colors: red, green, blue, cyan, magenta, yellow.
- The diagonal from (0,0,0) to (1,1,1) is the grayscale axis.

Our 27 colors are the points at every combination of {0, 0.5, 1} along each axis -- a $3 \times 3 \times 3$ grid inside the cube.

### HSB as an Alternative

The HSB (Hue, Saturation, Brightness) color model is often more intuitive for artists:

- **Hue**: the color wheel position (0-360 degrees)
- **Saturation**: how vivid the color is (0 = gray, 100 = pure color)
- **Brightness**: how light or dark (0 = black, 100 = full brightness)

```js
colorMode(HSB, 360, 100, 100);
fill(0, 100, 100);    // pure red
fill(120, 100, 100);  // pure green
fill(240, 100, 100);  // pure blue
fill(60, 100, 100);   // yellow
fill(0, 0, 50);       // gray (no saturation)
```

### Generating HSB Permutations

We can do the same 3-value permutation exercise in HSB space:

```js
let colors = [];

function setup() {
  createCanvas(800, 200);
  colorMode(HSB, 360, 100, 100);

  let hues = [0, 120, 240];         // 3 hues
  let sats = [0, 50, 100];          // 3 saturations
  let brights = [0, 50, 100];       // 3 brightnesses

  for (let h of hues) {
    for (let s of sats) {
      for (let b of brights) {
        colors.push({ h, s, b });
      }
    }
  }

  noLoop();
}

function draw() {
  background(0, 0, 10);

  let sw = width / colors.length;
  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    noStroke();
    fill(c.h, c.s, c.b);
    rect(i * sw, 0, sw - 1, height);
  }
}
```

---

## Exercises

1. **4x4x4 cube**: Generate all 64 colors with 4 steps per channel. Display them in an 8x8 grid. Sort them by brightness.

2. **3D visualization**: Use WEBGL mode to draw the 27 colors as small spheres positioned in a 3D cube, where X = R, Y = G, Z = B. Allow the user to orbit with the mouse.

3. **Complementary pairs**: For each of the 27 colors, compute its complement (1 - R, 1 - G, 1 - B). Display each color next to its complement.

4. **Color distance**: Write a function that takes two colors and computes the Euclidean distance in RGB space: $d = \sqrt{(r_1 - r_2)^2 + (g_1 - g_2)^2 + (b_1 - b_2)^2}$. Find the two most similar (non-identical) colors in the 27-color set.

5. **Random palette extraction**: From the 27 colors, randomly select 5 to form a palette. Display them as a row of large swatches. Refresh on click.

---

## Further Resources

- p5.js Color Reference: <https://p5js.org/reference/p5/color/>
- p5.js `colorMode()`: <https://p5js.org/reference/p5/colorMode/>
- Color permutation sketch (instructor): <https://editor.p5js.org/kybr/sketches/egBA_dDU3>
- Josef Albers, *Interaction of Color* (classic text on color perception)
- Web Safe Colors history: <https://en.wikipedia.org/wiki/Web_colors#Web-safe_colors>
