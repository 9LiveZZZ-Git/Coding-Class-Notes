# Lesson: Complex Numbers for Artists

**MAT 200C: Computing Arts -- Week 2, January 15**

---

## Introduction

Complex numbers sound intimidating, but they are really just **2D numbers**. If regular numbers live on a line (the number line), complex numbers live on a plane (the complex plane). That is the whole idea.

This lesson introduces complex numbers from scratch, assuming no math background beyond basic arithmetic. We will build up the concepts visually and intuitively, because understanding complex numbers is essential for creating fractals like the Mandelbrot set.

---

## Part 1: Why "Imaginary"?

### The Problem

Consider the equation:

$$x^2 = -1$$

What number, when multiplied by itself, gives $-1$?

- $1 \times 1 = 1$ (positive, not $-1$)
- $(-1) \times (-1) = 1$ (also positive, not $-1$)

No ordinary number works. Positive times positive is positive. Negative times negative is also positive. There is no real number whose square is negative.

### The Solution

Mathematicians decided to *invent* a number that solves this equation. They called it $i$ (for "imaginary"):

$$i^2 = -1$$

or equivalently:

$$i = \sqrt{-1}$$

The name "imaginary" is unfortunate -- it makes these numbers sound fake or useless. In reality, they are just as valid and useful as any other number. A better name might be "lateral numbers," since they extend the number line sideways into a second dimension.

### Kinds of Numbers

Numbers come in families, each extending the previous one:

- **Natural numbers**: $0, 1, 2, 3, \ldots$ (counting)
- **Integers**: $\ldots, -2, -1, 0, 1, 2, \ldots$ (adding negatives)
- **Rational numbers**: $\frac{1}{2}, \frac{3}{4}, -\frac{7}{5}, \ldots$ (adding fractions)
- **Real numbers**: $\pi, \sqrt{2}, e, \ldots$ (filling in the gaps on the number line)
- **Complex numbers**: $3 + 2i, -1 + 4i, \ldots$ (adding a second dimension)

Each family was controversial when it was introduced. Negative numbers were once called "absurd." Irrational numbers were once considered a scandal. Complex numbers are simply the next step.

---

## Part 2: What Is a Complex Number?

A complex number has two parts:

$$z = a + bi$$

- $a$ is the **real part** (an ordinary number)
- $b$ is the **imaginary part** (the coefficient of $i$)

Think of it as an ordered pair $(a, b)$, like a coordinate on a map.

### Examples

| Complex Number | Real Part ($a$) | Imaginary Part ($b$) |
|---|---|---|
| $3 + 2i$ | $3$ | $2$ |
| $-1 + 4i$ | $-1$ | $4$ |
| $5 + 0i$ (or just $5$) | $5$ | $0$ |
| $0 + 3i$ (or just $3i$) | $0$ | $3$ |
| $0 + 0i$ (or just $0$) | $0$ | $0$ |

Every real number is a complex number with an imaginary part of zero. Complex numbers are a *generalization* of real numbers, not a replacement.

---

## Part 3: The Complex Plane

### Turning a Line into a Plane

Real numbers live on the **number line** -- a single horizontal axis:

```
  -3   -2   -1    0    1    2    3
  -----|----|----|----|----|----|--->
```

Complex numbers live on the **complex plane** -- a 2D coordinate system:

```
  imaginary (i)
       ^
   3i  |         * (2 + 3i)
       |
   2i  |
       |
    i  |
       |
  -----+------|------|------|-----> real
       |      1      2      3
  -i   |
       |
  -2i  |              * (3 - 2i)
       |
```

- The horizontal axis is the **real axis** (ordinary numbers)
- The vertical axis is the **imaginary axis** (multiples of $i$)
- Every point on this plane is a complex number

### Visual Analogy

Think of the complex plane like a canvas in p5.js:

- The x-coordinate is the real part
- The y-coordinate is the imaginary part

A complex number is just a point. When we draw the Mandelbrot set, every pixel of our canvas corresponds to a complex number, and we color it based on what happens when we iterate $z^2 + c$ with that number.

---

## Part 4: Complex Addition

Adding complex numbers works exactly like adding 2D coordinates:

$$(a + bi) + (c + di) = (a + c) + (b + d)i$$

You add the real parts together and the imaginary parts together.

### Example

$$(3 + 2i) + (1 + 4i) = (3 + 1) + (2 + 4)i = 4 + 6i$$

### Visual Interpretation

Addition is like **vector addition** -- you slide one arrow tip-to-tail with the other:

```
  imaginary
       ^
   6i  |                   * (4 + 6i)  <-- sum
       |                 /
   4i  |    * (1+4i)   /
       |         \   /
   2i  |  * (3+2i) +
       |
  -----+------|------|------|-----> real
       |      1      2      3     4
```

If you have used `createVector()` in p5.js, this is the same as `p5.Vector.add()`. Complex addition is just vector addition.

---

## Part 5: Complex Multiplication

This is where complex numbers become different from ordinary 2D vectors. Multiplication is more interesting.

### The Derivation

Let us multiply two complex numbers $(a + bi)$ and $(c + di)$ using the distributive property (FOIL):

$$(a + bi)(c + di)$$
$$= ac + adi + bci + bdi^2$$

Since $i^2 = -1$:

$$= ac + adi + bci - bd$$

Group the real parts and imaginary parts:

$$= (ac - bd) + (ad + bc)i$$

So:

- **Real part of the product:** $ac - bd$
- **Imaginary part of the product:** $ad + bc$

### Example

$$(3 + 2i)(1 + 4i)$$
$$= (3 \cdot 1 - 2 \cdot 4) + (3 \cdot 4 + 2 \cdot 1)i$$
$$= (3 - 8) + (12 + 2)i$$
$$= -5 + 14i$$

### Squaring a Complex Number

For the Mandelbrot set, we need to square a complex number: $z^2 = z \cdot z$. Let $z = a + bi$:

$$(a + bi)(a + bi)$$
$$= a^2 + abi + abi + b^2 i^2$$
$$= a^2 + 2abi - b^2$$
$$= (a^2 - b^2) + (2ab)i$$

So:

- **Real part of $z^2$:** $a^2 - b^2$
- **Imaginary part of $z^2$:** $2ab$

### Visual Interpretation: Rotation and Scaling

Here is the beautiful thing about complex multiplication: it simultaneously **rotates** and **scales**.

When you multiply two complex numbers:

- The **magnitudes** (distances from origin) multiply: $|z_1 \cdot z_2| = |z_1| \cdot |z_2|$
- The **angles** (measured from the positive real axis) add: $\angle(z_1 \cdot z_2) = \angle z_1 + \angle z_2$

So multiplying by a complex number with magnitude 2 and angle 45 degrees will double the distance from the origin and rotate by 45 degrees.

Squaring a complex number **squares the magnitude** and **doubles the angle**. This is why iterated squaring creates spiraling, swirling patterns -- each iteration doubles the rotation angle.

---

## Part 6: Magnitude (Absolute Value)

The **magnitude** (or **absolute value** or **modulus**) of a complex number is its distance from the origin:

$$|z| = |a + bi| = \sqrt{a^2 + b^2}$$

This is just the Pythagorean theorem applied to the point $(a, b)$.

### Examples

- $|3 + 4i| = \sqrt{9 + 16} = \sqrt{25} = 5$
- $|1 + i| = \sqrt{1 + 1} = \sqrt{2} \approx 1.414$
- $|5 + 0i| = \sqrt{25} = 5$ (magnitude of a real number is its absolute value)

### In Code (math.js)

```js
let z = math.complex(3, 4);
let mag = math.abs(z); // 5
```

### Why It Matters for Mandelbrot

In the Mandelbrot iteration, we check if $|z| > 2$ to determine if the sequence is diverging. The magnitude tells us how far from the origin the iteration has wandered. Once it passes 2, it is guaranteed to escape to infinity.

---

## Part 7: Phase (Argument / Angle)

The **phase** (also called **argument**) of a complex number is the angle it makes with the positive real axis, measured counterclockwise:

$$\theta = \angle z = \tan^{-1}\left(\frac{b}{a}\right)$$

More precisely, this is `atan2(b, a)` which correctly handles all four quadrants.

### Examples

- $\angle(1 + i) = 45°$ (or $\pi/4$ radians)
- $\angle(i) = 90°$ (or $\pi/2$ radians)
- $\angle(-1) = 180°$ (or $\pi$ radians)
- $\angle(1 + 0i) = 0°$

### In Code (math.js)

```js
let z = math.complex(1, 1);
let angle = math.arg(z); // 0.7854... (pi/4 radians, which is 45 degrees)
```

### Visual Analogy

Think of a complex number as an arrow from the origin to the point $(a, b)$:

- **Magnitude** = the length of the arrow
- **Phase** = the direction the arrow points

This is the **polar representation**: instead of describing the number by its coordinates $(a, b)$, we describe it by its distance $r$ and angle $\theta$.

---

## Part 8: Polar vs. Cartesian Coordinates

Every complex number can be expressed in two ways:

### Cartesian Form

$$z = a + bi$$

You specify the horizontal and vertical coordinates.

### Polar Form

$$z = r(\cos\theta + i\sin\theta) = re^{i\theta}$$

You specify the distance from origin ($r$) and the angle ($\theta$).

### Converting Between Them

**Cartesian to Polar:**

$$r = \sqrt{a^2 + b^2}$$
$$\theta = \tan^{-1}(b/a)$$

**Polar to Cartesian:**

$$a = r\cos\theta$$
$$b = r\sin\theta$$

### Why Both?

- **Cartesian** is better for addition (just add the components)
- **Polar** is better for multiplication (multiply the magnitudes, add the angles)
- **Cartesian** is what we use in code (a complex number is `vec2(a, b)` in GLSL)

### In-class Demonstration

The polar coordinate sketch from class shows this interactively: <https://editor.p5js.org/kybr/sketches/Nj-FI1NgB>

---

## Part 9: Complex Numbers in Code

### Using math.js (JavaScript / p5.js)

```js
// Create complex numbers
let z = math.complex(3, 4);     // 3 + 4i
let w = math.complex(-1, 2);    // -1 + 2i

// Addition
let sum = math.add(z, w);       // 2 + 6i

// Multiplication
let product = math.multiply(z, w); // (-3-4) + (6-4)i = ...
// Let's verify: (3+4i)(-1+2i) = -3+6i-4i+8i^2 = -3+2i-8 = -11+2i

// Squaring
let zSquared = math.multiply(z, z);
// (3+4i)^2 = 9+24i+16i^2 = 9+24i-16 = -7+24i

// Magnitude
let mag = math.abs(z);           // sqrt(9+16) = 5

// Phase
let angle = math.arg(z);         // atan2(4, 3) = 0.9273 radians

// Access parts
print(z.re); // 3
print(z.im); // 4
```

### Using vec2 in GLSL

Since GLSL has no complex number type, we represent them as `vec2`:

```glsl
// Create complex numbers
vec2 z = vec2(3.0, 4.0);     // 3 + 4i
vec2 w = vec2(-1.0, 2.0);    // -1 + 2i

// Addition (works automatically)
vec2 sum = z + w;              // vec2(2.0, 6.0)

// Multiplication (must use custom function)
vec2 complex_multiply(vec2 a, vec2 b) {
  return vec2(
    a.x * b.x - a.y * b.y,    // real part
    a.x * b.y + a.y * b.x     // imaginary part
  );
}
vec2 product = complex_multiply(z, w);

// Magnitude
float mag = length(z);        // sqrt(9+16) = 5

// Phase
float angle = atan(z.y, z.x); // atan2 equivalent in GLSL
```

---

## Part 10: Putting It Together -- Why Complex Numbers Make Fractals

Here is the payoff. The Mandelbrot set uses the iteration:

$$z_{n+1} = z_n^2 + c$$

where $z$ and $c$ are complex numbers. Why does this simple equation produce such intricate structure?

1. **Squaring rotates and scales.** Each iteration doubles the angle and squares the magnitude. Points near the origin get pulled inward; points far from the origin get flung outward. Points at exactly the right distance walk a delicate tightrope.

2. **Adding $c$ shifts the result.** After the rotation and scaling of squaring, we translate the result by adding $c$. Different values of $c$ create different balances between the inward pull and the outward push.

3. **The boundary is fractal.** For some values of $c$, the iteration settles into a stable pattern. For others, it flies off to infinity. The boundary between these two behaviors is infinitely intricate -- a fractal.

4. **Small changes in $c$ can change everything.** Two nearby values of $c$ can produce completely different behavior. One might converge after 3 iterations; the other might diverge after 300. This is chaos -- sensitive dependence on initial conditions.

5. **The pattern repeats at every scale.** Zoom into the boundary of the Mandelbrot set and you find miniature copies of the whole set, surrounded by their own fractal tendrils. This self-similarity is a hallmark of fractal geometry.

All of this emerges from one line of math: $z^2 + c$. The complexity is not in the equation -- it is in the *iteration*.

---

## Summary

| Concept | What It Means | In Code |
|---|---|---|
| Complex number $z = a + bi$ | A 2D number | `math.complex(a, b)` or `vec2(a, b)` |
| Real part $a$ | Horizontal coordinate | `z.re` or `z.x` |
| Imaginary part $b$ | Vertical coordinate | `z.im` or `z.y` |
| Addition | Add components | `math.add()` or `z1 + z2` |
| Multiplication | Rotate and scale | `math.multiply()` or custom function |
| Magnitude $\|z\|$ | Distance from origin | `math.abs()` or `length()` |
| Phase $\angle z$ | Angle from real axis | `math.arg()` or `atan(z.y, z.x)` |

---

## References

- In-class polar coordinates sketch: <https://editor.p5js.org/kybr/sketches/Nj-FI1NgB>
- In-class complex iteration sketch: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>
- math.js complex number documentation: <https://mathjs.org/docs/datatypes/complex_numbers.html>
- Wikipedia - Complex number: <https://en.wikipedia.org/wiki/Complex_number>
- Wikipedia - Kinds of numbers: <https://en.wikipedia.org/wiki/List_of_types_of_numbers>
