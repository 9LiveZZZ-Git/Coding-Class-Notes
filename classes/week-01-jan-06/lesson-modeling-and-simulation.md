# Lesson: Modeling and Simulation

## MAT 200C: Computing Arts -- Week 1, January 6

---

## Humans Are Modelers

You are already a modeler. You have been one your entire life.

When you catch a ball, you do not consciously solve differential equations. But somewhere in your brain, a prediction is being made: given the ball's current position, speed, and arc, your hand moves to where the ball *will be* in half a second. You are running a simulation of the future -- an internal model of how objects move through space.

When you plan your morning commute, you model traffic patterns. When you choose an umbrella, you model the weather. When you read someone's facial expression and adjust what you are about to say, you model another person's emotional state. These are all **models** -- simplified representations of reality that let you predict what will happen next and decide what to do about it.

Modeling is not a niche technical skill. It is one of the most fundamental things that minds do.

---

## What Is a Model?

A model is a **simplified representation** of something. The key word is *simplified*. A model is never the thing itself. A map is not the territory. A blueprint is not a building. A weather forecast is not the weather.

Models work by **leaving things out**. A good model keeps the parts that matter for your purpose and discards the rest. A subway map ignores the actual geography of the city -- streets, buildings, hills -- because for the purpose of navigating the subway, those details are irrelevant. What matters is which stations connect to which lines.

This is not a flaw. It is the entire point. If your model included every detail of reality, it would be as complex as reality itself -- and therefore useless. The power of a model is in its simplification.

### Examples of Models

| Model | What it represents | What it leaves out |
|---|---|---|
| A map | Geographic space | Smells, sounds, weather, people |
| A recipe | A cooking process | The chef's experience, improvisation, kitchen quirks |
| Sheet music | A musical performance | Timbre, emotion, the room's acoustics |
| An architectural blueprint | A building | Construction process, material wear, occupants |
| A physics equation | Object motion | Friction, air resistance, quantum effects |
| A climate model | Earth's atmosphere | Individual clouds, specific rainstorms |

Every model makes choices about what to include and what to ignore. These choices determine what the model is good for and what it cannot tell you.

---

## Mental Models vs. Computational Models

### Mental Models

The models in your head -- intuitions about how the world works -- are **mental models**. They are fast, flexible, and often good enough. You do not need a calculator to catch a ball.

But mental models have limitations:

- They are **imprecise**. Your intuition about a projectile's arc might be "roughly like this," not "it will land at coordinates (347.2, 0) in 4.3 seconds."
- They are **hard to share**. You cannot copy your intuition about ball-catching into someone else's head.
- They are **prone to bias**. Human intuition is notoriously unreliable for certain kinds of predictions (exponential growth, probability, long-term consequences).
- They **cannot scale**. You might be able to mentally simulate two or three balls at once, but not a thousand.

### Computational Models

A **computational model** is a model expressed as a set of precise instructions -- a program -- that a computer can execute. You take the rules of your mental model, write them down as code, and let the machine do the simulation.

Computational models have complementary strengths:

- They are **precise**. Every step is defined exactly. The same inputs always produce the same outputs (if the model is deterministic).
- They are **shareable**. You can send code to anyone, and they can run the same model.
- They are **scalable**. A computer can simulate a thousand balls as easily as one (well, a thousand times slower, but still fast in human terms).
- They are **repeatable**. You can run the same simulation a million times with slightly different starting conditions.

But they also have weaknesses: they are only as good as the assumptions you encode into them. If you model gravity but forget air resistance, your simulation will diverge from reality in cases where air resistance matters. The model does not "know" what it is missing.

---

## Importing and Exporting Models: Communication

One of the most powerful aspects of computational models is that they are **communicable**. When you write a model as code, you are doing two things:

1. **Exporting** your understanding. You are taking the mental model in your head -- your understanding of how something works -- and expressing it in precise, unambiguous language.

2. **Enabling import.** Someone else can read your code, run it, modify it, and build upon it. They are *importing* your model into their own understanding.

This is, in a deep sense, what all communication is. Language, mathematics, diagrams, music -- these are all technologies for exporting models from one mind and importing them into another. Code is simply a very precise form of this.

In a course on computing arts, this matters doubly. When you create a generative artwork -- a piece of art defined by code -- you are exporting a model of an aesthetic process. The code *is* the artwork, in the sense that the code contains all the rules and logic that produce the visual or sonic or interactive experience. Someone else can read that code, understand your creative decisions, modify them, and create something new.

---

## Analytical vs. Numerical Approaches

There are two fundamentally different ways to work with models, and understanding the distinction is essential.

### Analytical (Closed-Form) Solutions

An **analytical solution** is an exact mathematical formula that gives you the answer directly. For example, the position of a projectile under constant gravity is:

```
y(t) = y_initial + v_initial * t + (1/2) * g * t^2
```

You plug in the time `t`, and you get the exact position. No approximation. No iteration. Just arithmetic.

Analytical solutions are elegant and exact, but they only exist for relatively simple systems. As soon as the forces become complicated (varying with position, depending on other objects, etc.), analytical solutions often cannot be found.

### Numerical Solutions

A **numerical solution** does not try to find a formula. Instead, it **steps through time**, computing the state of the system at each step based on the state at the previous step.

```
At time 0: I know the position and velocity.
At time 1: I compute the new velocity from the acceleration, then the new position from the velocity.
At time 2: I repeat.
...
```

This is what we did in our Euler integration tutorial. We never found a formula for the ball's position. We just updated it frame by frame.

Numerical methods are **approximate** -- they introduce small errors at each step. But they are **general** -- they work for virtually any system, no matter how complex the forces. And by taking smaller time steps, you can make the approximation as accurate as you need.

Almost all modern simulation -- weather forecasting, structural engineering, film special effects, video game physics, molecular dynamics -- uses numerical methods.

### A Useful Analogy

Think of the difference this way:

- **Analytical**: "The answer is 42." (Instant, exact, but only possible for simple questions.)
- **Numerical**: "Let me count... 1, 2, 3, ... , 41, 42. The answer is 42." (Takes more effort, approximate for complex problems, but always possible.)

For the ballistics simulation we built, an analytical solution exists and is straightforward. But the moment we add air resistance, wind, bouncing, or multiple interacting objects, the analytical approach breaks down, and numerical integration becomes essential.

---

## Determinism

An important property of many computational models is **determinism**: given the same starting conditions, the model produces the same results every time.

Our ballistics simulation is deterministic. If you fire a ball at the same angle with the same speed, it will always follow the same path. There is no randomness, no uncertainty. The trajectory is fully determined by the initial conditions and the rules (gravity, Euler integration).

This is a powerful property. It means you can:

- **Debug** the simulation by reproducing problems exactly
- **Compare** different models by giving them the same inputs
- **Predict** outcomes with certainty (within the model)

However, determinism is a choice, not a requirement. Many models deliberately introduce **randomness** (stochastic models) to capture uncertainty or to explore a range of possibilities. We will encounter this throughout the course in generative art, where randomness is an essential creative tool.

Even deterministic models can produce behavior that *appears* random or unpredictable. This is the domain of **chaos theory** -- systems where tiny differences in starting conditions lead to wildly different outcomes. The rules are deterministic, but the sensitivity to initial conditions makes long-term prediction effectively impossible. Weather is a classic example: the atmosphere follows deterministic physics, but a tiny change in conditions can lead to a completely different forecast a week later.

---

## Why This Matters for Computing Arts

In this course, you will build models constantly. Some will model physics (gravity, collisions, fluid flow). Some will model biology (growth, flocking, evolution). Some will model abstract aesthetic rules (color harmony, rhythm, symmetry).

Every time you write a sketch, you are:

1. **Choosing what to model** -- deciding which aspects of reality (or imagination) to represent
2. **Choosing what to leave out** -- simplifying ruthlessly, because a model is only useful insofar as it is simpler than the thing it represents
3. **Expressing your model as code** -- translating your understanding into precise instructions
4. **Running the model** -- letting the computer execute your instructions and watching what emerges
5. **Interpreting the results** -- deciding whether the output matches your intention, and if not, revising the model

This cycle -- model, run, observe, revise -- is the core loop of both scientific inquiry and creative practice. In science, you iterate toward truth. In art, you iterate toward expression. The process is the same.

---

## Key Takeaways

1. **Humans are natural modelers.** We constantly build simplified representations of the world to predict the future and make decisions.

2. **A model is a simplification.** Its power comes from what it leaves out, not just what it includes.

3. **Computational models are precise, shareable, and scalable.** They take the models in our heads and make them concrete.

4. **Code is a medium for communicating models.** Writing code is a form of exporting your understanding; reading code is importing it.

5. **Analytical solutions are exact but limited.** Numerical solutions are approximate but general.

6. **Determinism means same inputs yield same outputs.** It is a useful property, but deliberate randomness is also a powerful tool.

7. **The modeling cycle -- build, run, observe, revise -- is the core of both science and art.**
