# Lesson: Chaos Theory and Fractals

**MAT 200C: Computing Arts -- Week 2, January 15**

---

## Introduction

This lesson explores two deeply connected ideas -- **chaos theory** and **fractals** -- that transformed science and art in the late twentieth century. These ideas reveal that simple rules can produce staggering complexity, that deterministic systems can behave unpredictably, and that nature's most irregular forms have a hidden mathematical structure.

---

## Part 1: Chaos Theory

### What Is Chaos?

Chaos theory is the study of systems that are **deterministic** (they follow precise rules with no randomness) yet produce behavior that appears **random and unpredictable**.

The key word is *deterministic*. A chaotic system is not random. If you run it twice with exactly the same starting conditions, you get exactly the same result. But change the starting conditions by an unimaginably small amount -- one part in a billion -- and the results eventually diverge completely.

### James Gleick and the Story of Chaos

The story of how chaos theory developed is told brilliantly in **James Gleick's** 1987 book, *Chaos: Making a New Science*. Gleick traces the discovery of chaos through the stories of the scientists who stumbled upon it, often working in isolation, often met with skepticism.

The book was a bestseller, a finalist for the Pulitzer Prize and the National Book Award, and is considered a classic of popular science writing. It introduced the general public to concepts like the butterfly effect, strange attractors, and fractals.

Gleick went on to write *The Information: A History, a Theory, a Flood* (2011), which traces the idea of information from African talking drums through the telegraph to modern computing. He shows how our understanding of information as fundamentally digital -- reducible to bits -- emerged from practical engineering challenges and reshaped science.

### The Butterfly Effect

The most famous idea from chaos theory is the **butterfly effect**: the notion that a butterfly flapping its wings in Brazil could, in principle, set off a chain of atmospheric events that leads to a tornado in Texas weeks later.

This phrase comes from meteorologist **Edward Lorenz**, who in 1961 discovered chaos by accident. He was running a computer simulation of weather and decided to restart it from the middle, typing in numbers from a printout. But the printout had rounded the numbers from six decimal places to three. He expected the new run to closely match the original. Instead, the simulation diverged completely within a short time.

The technical name for this is **sensitive dependence on initial conditions**: tiny differences in starting values grow exponentially over time until the system's behavior is completely different.

### Sensitive Dependence: A Concrete Example

Consider the simple rule: $x_{n+1} = 2x_n$ (double the number each step).

Start with $x_0 = 1.0$: the sequence is $1, 2, 4, 8, 16, 32, 64, \ldots$

Start with $x_0 = 1.001$: the sequence is $1.001, 2.002, 4.004, 8.008, 16.016, \ldots$

After 10 steps, the first gives $1024$ and the second gives $1025.024$. After 20 steps, the difference is about $1048$. The gap between them grows *exponentially*. This is divergence, not chaos (it is too simple), but it illustrates how small differences amplify.

True chaos requires **nonlinearity** -- the system's rules involve multiplication, squaring, or other operations that create feedback between the components. The logistic map $x_{n+1} = rx_n(1 - x_n)$ is a classic example: despite being a single, simple equation, it produces period doubling, bifurcation, and genuine chaos depending on the parameter $r$.

### Determinism Without Predictability

Before chaos theory, scientists generally believed that deterministic systems were predictable. If you knew the rules and the starting conditions precisely enough, you could predict the future. Chaos theory shattered this assumption.

In a chaotic system, any measurement has finite precision. No matter how accurate your instruments, there is always some tiny error. In a chaotic system, that error grows exponentially, and after enough time, your prediction becomes worthless. The system is deterministic in principle but unpredictable in practice.

This has profound implications: weather can never be predicted beyond about two weeks, no matter how good our models and measurements become. The limitation is not technological -- it is mathematical.

---

## Part 2: Iteration and Feedback

### The Engine of Chaos

Chaos arises from a specific mechanism: **iteration with feedback**. You take some input, apply a rule, and feed the output back as the next input:

$$x_{n+1} = f(x_n)$$

Each repetition of the rule is one **iteration**. The output of each iteration becomes the starting point for the next. This is also called a **recurrence relation**.

### Fixed Points

Some iterations settle down to a stable value. For example:

$$x_{n+1} = \cos(x_n)$$

Start with any value and keep applying cosine. The sequence converges to approximately $0.739085...$, which is the **fixed point** of cosine: the value where $\cos(0.739...) = 0.739...$

Not all iterations converge:

- $x_{n+1} = \sin(x_n)$ converges slowly to $0$ (since $\sin(0) = 0$)
- $x_{n+1} = \cos(x_n)$ converges quickly to $0.739...$
- $x_{n+1} = 2x_n$ diverges (no fixed point -- the values grow without bound)

### Cobweb Plots

A **cobweb plot** is a way to visualize iteration graphically. You plot both $y = f(x)$ and $y = x$ on the same graph. Starting from an initial value on the $x$-axis:

1. Go up to the curve $y = f(x)$
2. Go horizontally to the line $y = x$
3. Repeat

If the "web" spirals inward, the iteration converges. If it spirals outward, the iteration diverges. If it forms a cycle, the iteration oscillates. Cobweb plots make the dynamics of iteration visible at a glance.

The Desmos visualization from class demonstrates this beautifully: <https://www.desmos.com/calculator/ipl6nklkzc>

### Three Possible Behaviors

When you iterate a function, three things can happen to the sequence:

1. **Convergence**: The values settle toward a fixed point. Example: $x_{n+1} = \cos(x_n)$ converges to $0.739...$

2. **Divergence**: The values grow without bound. Example: $x_{n+1} = 2x_n$ grows to infinity.

3. **Oscillation**: The values cycle or wander without settling or escaping. Example: $\sin(x)$ oscillates (though in this case it actually converges very slowly to $0$). True oscillation occurs with things like $x_{n+1} = -x_n$, which alternates between two values.

### The Connection to Chaos

When the iterated function is **nonlinear** (involves squares, cubes, sines, etc.), these three behaviors can coexist in the same system. Change the starting condition slightly, and the system might converge instead of diverge, or vice versa. The boundary between convergence and divergence becomes infinitely complex. That boundary is a **fractal**.

---

## Part 3: Fractals

### What Is a Fractal?

A **fractal** is a geometric shape that exhibits **self-similarity**: it looks similar at every scale. Zoom into a fractal and you find smaller copies of the whole shape, which themselves contain even smaller copies, and so on, potentially forever.

The word "fractal" was coined by mathematician **Benoit Mandelbrot** in 1975, from the Latin *fractus* meaning "broken" or "fragmented."

### Self-Similarity in Nature

Before Mandelbrot, most mathematicians studied smooth shapes: lines, circles, spheres. But nature is not smooth. Gleick writes that "clouds are not spheres, mountains are not cones, coastlines are not circles, and bark is not smooth."

Fractals capture the irregular, fragmented geometry of the natural world:

- **Coastlines**: Zoom into a coastline and you see bays within bays within bays. The amount of detail is similar at every scale. This is why the "length" of a coastline depends on the scale at which you measure it.
- **Trees**: A branch looks like a smaller version of the whole tree. Each sub-branch looks like a smaller branch. The pattern repeats down to the twigs.
- **Lungs**: The bronchial tubes branch repeatedly in a self-similar pattern, maximizing surface area in a compact volume.
- **Rivers**: River networks branch in fractal patterns. Tributary systems look like smaller versions of the whole network.
- **Mountains**: The jagged profile of a mountain range looks similar whether you view it from a mile away or examine a single rock face.

### Fractals from Iteration

The fractals we study in this class arise from iteration. The procedure is:

1. Choose a point in some space (for us, the complex plane).
2. Use that point as the initial condition for an iterated function.
3. Observe whether the iteration converges, diverges, or oscillates.
4. Color the point based on the behavior.
5. Repeat for every point.

The resulting image is a fractal. The boundary between regions that converge and regions that diverge has infinitely complex, self-similar structure.

The Mandelbrot set is the most famous example: for each point $c$ in the complex plane, we iterate $z_{n+1} = z_n^2 + c$ starting from $z_0 = 0$ and color the point based on whether the sequence stays bounded or escapes to infinity.

### Fractal Dimension

One of Mandelbrot's key insights was that fractals have **fractional dimension**. A line is 1-dimensional and a plane is 2-dimensional, but a coastline is somewhere in between -- its dimension might be 1.25. A fractal surface might have dimension 2.3. This "fractal dimension" quantifies how completely the object fills the space it occupies.

This was a radical idea. Dimension had always been a whole number. Mandelbrot showed that the geometry of nature requires a new concept of dimension.

---

## Part 4: The Connection Between Chaos and Fractals

Chaos and fractals are two sides of the same coin:

- **Chaos** is about the *behavior over time* of iterated systems: sensitivity to initial conditions, unpredictability, strange attractors.
- **Fractals** are about the *geometry* of the boundaries between different behaviors: self-similarity, infinite detail, fractional dimension.

When we visualize a chaotic system by coloring each initial condition according to its eventual behavior, the boundaries between different behaviors form fractals. The Mandelbrot set is exactly this: a map of initial conditions, colored by their fate under iteration, whose boundary is a fractal.

This is why iteration and feedback are so central to this week's material. Iteration is the engine that drives both chaos (unpredictable dynamics) and fractals (infinitely complex geometry). A simple recurrence relation like $z_{n+1} = z_n^2 + c$ encodes both phenomena simultaneously.

---

## Part 5: Chaos Theory and Art

### Why Should Artists Care?

Chaos theory and fractals have deep relevance for artists and creative practitioners:

1. **Simple rules, complex results.** You do not need complicated programs to create rich visual complexity. A few lines of code with iteration and feedback can produce infinite variety.

2. **The aesthetics of the boundary.** The most visually interesting regions are at the edge of chaos -- the boundary between order and disorder, convergence and divergence. This is a metaphor that extends well beyond mathematics.

3. **Nature's geometry.** If you want to generate natural-looking forms (trees, clouds, landscapes, organic textures), fractal geometry provides the mathematical foundation.

4. **Emergence.** Complex global patterns emerge from simple local rules. This is a theme that runs through the entire course, from fractals to cellular automata to agent systems.

5. **Unpredictability as a creative tool.** Chaotic systems are deterministic but surprising. They can generate forms that no human would design, yet that feel organic and meaningful.

---

## Key Vocabulary

- **Chaos theory**: The study of deterministic systems with sensitive dependence on initial conditions
- **Butterfly effect**: Small changes in initial conditions leading to vastly different outcomes
- **Sensitive dependence on initial conditions**: The defining property of chaotic systems
- **Iteration**: Repeatedly applying a function, using each output as the next input
- **Feedback**: Routing outputs back as inputs in a loop
- **Fixed point**: A value unchanged by the iterated function
- **Recurrence relation**: A formula defining each term of a sequence from previous terms
- **Cobweb plot**: A graphical method for visualizing iteration
- **Convergence**: A sequence approaching a stable value
- **Divergence**: A sequence growing without bound
- **Fractal**: A shape with self-similar structure at every scale
- **Self-similarity**: Looking the same (or statistically similar) at different magnifications
- **Nonlinearity**: A system whose output is not proportional to its input

---

## Further Reading and Viewing

### Books

- James Gleick, *Chaos: Making a New Science* (1987)
- James Gleick, *The Information: A History, a Theory, a Flood* (2011)
- Benoit Mandelbrot, *The Fractal Geometry of Nature* (1982)

### Videos

- 3Blue1Brown: [The meaning within the Mandelbrot set](https://www.youtube.com/watch?v=y9BK--OxZpY)
- 3Blue1Brown: [Beyond the Mandelbrot set, an intro to holomorphic dynamics](https://www.youtube.com/watch?v=LqbZpur38nw)
- 3Blue1Brown: [Newton's fractal (which Newton knew nothing about)](https://www.youtube.com/watch?v=-RdOwhmqP5s)
- twoswap: [Mandelbrot's Evil Twin](https://www.youtube.com/watch?v=Ed1gsyxxwM0)

### Interactive

- Desmos cobweb plot: <https://www.desmos.com/calculator/ipl6nklkzc>
- Fractal explorer: <https://v8.zsnout.com/fractal-explorer>
- Codepen fractal explorer: <https://codepen.io/mherreshoff/full/RwZPazd>
- FractalDex: <https://fractaldex.org>

### In-class Sketches

- Iteration and feedback: <https://editor.p5js.org/kybr/sketches/S1arxSxq8>
- Complex plane behavior: <https://editor.p5js.org/kybr/sketches/E9yDmPa4o>
