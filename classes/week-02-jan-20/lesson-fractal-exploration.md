# Lesson: Exploring Fractal Parameter Spaces

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## The Alchemy Metaphor

We are doing [alchemy](https://en.wikipedia.org/wiki/Alchemy).

Medieval alchemists experimented with substances, mixing and heating them, searching for transformations they did not fully understand. They did not have the periodic table. They did not know about atomic structure. Yet through systematic experimentation, they discovered real chemical phenomena.

We are in a similar position with fractal formulas. We have the Mandelbrot set -- our "gold standard" -- and now we are trying different iteration rules: $z^3 + c$, $\sin(z) + c$, $e^z + c$, and beyond. We do not have a complete theoretical understanding of why each formula produces the structures it does. We are exploring, experimenting, observing patterns.

This is a legitimate and valuable mode of inquiry: **empirical exploration of mathematical structures**. The images we produce are not just pretty pictures -- they are visualizations of dynamical systems, maps of convergence and divergence, windows into the behavior of nonlinear functions.

---

## What Are We Actually Visualizing?

Every fractal we render answers a simple question: **does this iteration converge or diverge, and how fast?**

Given:
- A **rule**: some function $f(z, c)$ applied iteratively
- A **starting point**: often $z_0 = 0$
- A **parameter**: $c$, which varies across the complex plane (one per pixel)

We iterate: $z_{n+1} = f(z_n, c)$

For each pixel (each value of $c$), we ask:
1. Does the sequence $z_0, z_1, z_2, \ldots$ stay bounded (converge or stay near the origin) or does it fly off to infinity (diverge)?
2. If it diverges, how many iterations does it take?
3. What is the character of the orbit along the way?

The **set** (Mandelbrot, etc.) consists of all values of $c$ for which the iteration does **not** diverge. The colored region outside the set shows **how quickly** each point diverges.

---

## Nonlinear Dynamics

### Why Nonlinearity Matters

The key ingredient that produces fractal structure is **nonlinearity**. A linear function like $f(z) = 2z + c$ would produce simple, predictable behavior: every point either converges or diverges at a uniform rate. No fractal boundary would form.

The Mandelbrot iteration $z^2 + c$ is nonlinear because of the squaring. Squaring a complex number is a nonlinear transformation: it squares the magnitude and doubles the angle. This means nearby points can be sent to very different locations after just a few iterations.

### Sensitive Dependence on Initial Conditions

This is the [butterfly effect](https://en.wikipedia.org/wiki/Butterfly_effect). Two starting points that differ by an incredibly small amount can end up in completely different fates after enough iterations. One might converge; the other might diverge. This sensitivity is what creates the infinitely complex boundary of the fractal set.

Consider two values of $c$ that are 0.0001 apart, right near the boundary of the Mandelbrot set. After 50 iterations of $z^2 + c$, one sequence might have $|z| = 0.3$ (still bounded) while the other has $|z| = 10^{15}$ (escaped to infinity). The boundary between these fates is not a smooth curve -- it is a fractal.

### Chaos

[Chaos theory](https://en.wikipedia.org/wiki/Chaos_theory) studies deterministic systems that exhibit sensitive dependence on initial conditions. Our fractal iteration is:
- **Deterministic**: no randomness. Given the same $c$ and rule, we always get the same result.
- **Simple**: the rule is just a few lines of code.
- **Chaotic**: the boundary between convergent and divergent behavior is infinitely complex.

This is one of the central themes of the course: **simple rules can produce complex behavior**.

---

## Why Different Formulas Create Different Structures

### The Role of the Function

Each function $f(z)$ has its own geometry:

- **$z^2$** doubles angles and squares magnitudes. It wraps the complex plane around itself twice. This is why the Mandelbrot set has a mirror symmetry (the real axis) and the characteristic cardioid/bulb structure.

- **$z^3$** triples angles and cubes magnitudes. It wraps the plane around three times, giving the "Multibrot" set a 2-fold rotational symmetry (and looking somewhat like two copies of the Mandelbrot set glued together).

- **$z^n$** in general gives $(n-1)$-fold rotational symmetry.

- **$\sin(z)$** is periodic in the real direction (period $2\pi$), so the fractal repeats horizontally. It also grows exponentially in the imaginary direction (because $\sin(iy) = i\sinh(y)$), which produces the characteristic tree-like vertical structures.

- **$e^z$** is periodic in the imaginary direction (period $2\pi i$), so the fractal repeats vertically. It grows exponentially in the real direction.

- **$\cos(z)$** is similar to $\sin(z)$ but shifted.

### Symmetry and Structure

The symmetries of the function directly produce symmetries in the fractal:

| Function | Symmetry of function | Symmetry of fractal |
|----------|---------------------|---------------------|
| $z^2 + c$ | None (beyond conjugation) | Mirror symmetry (real axis) |
| $z^3 + c$ | $z \to z \cdot e^{2\pi i/2}$ | 2-fold rotational |
| $z^n + c$ | $z \to z \cdot e^{2\pi i/(n-1)}$ | $(n-1)$-fold rotational |
| $\sin(z) + c$ | $\sin(z + 2\pi) = \sin(z)$ | Horizontal periodicity |
| $e^z + c$ | $e^{z + 2\pi i} = e^z$ | Vertical periodicity |

### Fixed Points and Critical Points

The mathematical theory involves **critical points** -- values of $z$ where $f'(z) = 0$. The behavior of critical points under iteration determines the global structure of the fractal.

For $f(z) = z^2 + c$, the critical point is $z = 0$ (since $f'(z) = 2z = 0$ when $z = 0$). This is why we start the Mandelbrot iteration at $z_0 = 0$: we are tracking the fate of the critical point.

For $f(z) = \sin(z) + c$, the critical points are at $z = \pm\pi/2 + n\pi$. The theory says we should track these to determine the fractal structure. In practice, starting from $z_0 = 0$ still produces an interesting image, though it may not capture the full mathematical structure.

---

## The Mandelbrot Set and Julia Sets

### Two Ways to Slice the Parameter Space

There are two fundamental ways to use the iteration $z_{n+1} = z^2 + c$:

1. **Mandelbrot set**: Fix $z_0 = 0$, vary $c$ (one value per pixel). Each pixel answers: "for this value of $c$, does the critical orbit converge?"

2. **Julia set**: Fix $c$ (one value for the whole image), vary $z_0$ (one value per pixel). Each pixel answers: "for this starting point, does the orbit converge?"

Every point $c$ in the Mandelbrot set corresponds to a **connected** Julia set. Every point $c$ outside the Mandelbrot set corresponds to a **disconnected** Julia set (a "Cantor dust"). The Mandelbrot set is, in a sense, a catalog of all possible Julia sets.

### The Mandelbrot-Julia Correspondence

This is one of the deepest facts in fractal geometry:

> The Mandelbrot set is the **parameter space** of the quadratic family $z^2 + c$. Each point in it represents a Julia set. The Mandelbrot set tells us which Julia sets are connected.

When you zoom into the Mandelbrot set near a particular point $c_0$ and then look at the Julia set for $c = c_0$, you will find a strong resemblance between the local structure of the Mandelbrot set and the Julia set.

This idea generalizes to other formulas: the "Mandelbrot-like" set for $\sin(z) + c$ catalogs all Julia sets of the sine iteration.

### Exploring with the Mouse

A powerful way to see this connection is to use the mouse position as the $c$ parameter for a Julia set. As you move the mouse across the Mandelbrot set, the Julia set morphs continuously:

- Over the main cardioid: the Julia set is a deformed circle
- Over the period-2 bulb: the Julia set is a deformed figure-eight
- Near the boundary: the Julia set becomes increasingly intricate
- Outside the set: the Julia set shatters into disconnected dust

---

## The Space of All Formulas

### Beyond Single Functions

Once you start thinking of the iteration rule as a free parameter, you realize there is an enormous **space of possible fractals**. Each choice of function defines a different fractal landscape.

Some directions to explore:

1. **Power variations**: $z^n + c$ for different $n$, including non-integer $n$ (using the complex power function).

2. **Transcendental functions**: $\sin(z) + c$, $\cos(z) + c$, $\tan(z) + c$, $\tanh(z) + c$, $e^z + c$.

3. **Compositions**: $\sin(z^2) + c$, $e^{\sin(z)} + c$.

4. **Hybrid iterations**: alternate between two rules on odd and even steps.

5. **Higher-order methods**: Use Newton's method, Halley's method, or other root-finding algorithms.

6. **Multi-parameter families**: Use mouse/time to control additional parameters beyond $c$.

### The Logistic Map Connection

The Mandelbrot set is intimately connected to the [logistic map](https://en.wikipedia.org/wiki/Logistic_map) $x_{n+1} = rx_n(1 - x_n)$, one of the most famous examples of chaos. The bifurcation diagram of the logistic map can be found embedded in the Mandelbrot set along the real axis.

The iteration $z_{n+1} = z_n^2 + c$ is the complex generalization of the logistic map. This connection shows that the fractal boundary is not just a visual curiosity -- it is the 2D shadow of the same chaotic dynamics that produce period-doubling cascades and the onset of chaos.

---

## What Can We Learn From This?

### On Art and Exploration

The alchemy metaphor is not just decorative. Real insights come from hands-on exploration:

1. **Pattern recognition**: After exploring many formulas, you start to notice recurring structures. Spiral arms, Misiurewicz points, period-doubling cascades. These are universal features of nonlinear dynamics.

2. **Aesthetic judgment**: Not every formula produces interesting images. Learning to recognize and seek out visually compelling regions of parameter space is a form of artistic skill.

3. **Questions lead to theory**: "Why does this formula have 3-fold symmetry?" leads to understanding complex function theory. "Why is the boundary always fractal?" leads to understanding chaotic dynamics.

4. **Computation as telescope**: GLSL lets us compute millions of iterations per frame, exploring mathematical spaces that would be impossible to investigate by hand. The GPU is our instrument for observing the mathematical landscape.

### On Complexity from Simplicity

Every fractal we have seen comes from a rule that fits in a single line of code:

```glsl
z = cx_sqr(z) + c;
z = cx_sin(z) + c;
z = cx_exp(z) + c;
```

Yet the images contain infinite detail, self-similar structures across every scale, boundaries of infinite length. This gap between the simplicity of the rule and the complexity of the output is one of the most profound ideas in science and art.

Wolfram calls this "computational irreducibility" -- there is no shortcut to predicting the outcome except running the computation. We cannot look at $\sin(z) + c$ and predict, from the formula alone, what the fractal will look like. We must compute it.

---

## Vocabulary

- **Iteration**: Repeated application of a function, feeding the output back as input
- **Convergence/Divergence**: Whether a sequence stays bounded or grows without limit
- **Nonlinearity**: A function where doubling the input does not double the output
- **Sensitive dependence**: Small changes in initial conditions lead to large changes in outcome
- **Parameter space**: The space of all possible parameter values (the Mandelbrot set is a parameter space)
- **Julia set**: The boundary of the basins of attraction for a fixed $c$
- **Critical point**: Where $f'(z) = 0$; its orbit determines the fractal structure
- **Basin of attraction**: The set of starting points that converge to a particular attractor
- **Bifurcation**: A qualitative change in behavior as a parameter is varied

---

## Further Reading and Viewing

- 3Blue1Brown: [The meaning within the Mandelbrot set](https://www.youtube.com/watch?v=y9BK--OxZpY)
- 3Blue1Brown: [Beyond the Mandelbrot set, an intro to holomorphic dynamics](https://www.youtube.com/watch?v=LqbZpur38nw)
- Two Swap: [Mandelbrot's Evil Twin](https://www.youtube.com/watch?v=Ed1gsyxxwM0)
- Fractal explorer: <https://v8.zsnout.com/fractal-explorer>
- James Gleick, _Chaos: Making a New Science_ (1987)
- Paul Bourke's fractal gallery: <https://paulbourke.net/fractals>
