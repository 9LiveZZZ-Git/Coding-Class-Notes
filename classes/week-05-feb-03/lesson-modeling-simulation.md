# Lesson: Modeling and Simulation for Computing Arts

## MAT 200C: Computing Arts -- Week 5, February 3

---

## What Is a Model?

A **model** is a simplified representation of something. Every model deliberately leaves things out. A subway map, for example, is a model of a transit system. It shows you which stations are connected and in what order, but it does not show the exact geography, the depth of tunnels, or the number of seats in each car. Those details are omitted because they are not relevant to the model's purpose: helping you navigate from one station to another.

In computing arts, we build models of natural and imagined phenomena. We might model:

- How smoke rises and disperses
- How birds flock together
- How an epidemic spreads through a population
- How cells grow into organisms

The key principle is: **a model is not reality.** It is an abstraction that captures the aspects we care about and ignores everything else. There is no "correct" model -- only models that are useful for a particular purpose.

---

## Conceptual Models vs. Computational Models

A **conceptual model** is an idea or description of how something works. For example: "birds tend to fly near other birds, match their speed, but avoid getting too close." This is a conceptual model of flocking. It describes the behavior in words.

A **computational model** translates a conceptual model into precise rules that a computer can execute. The same flocking idea becomes:

1. For each bird, find all neighbors within 50 pixels.
2. Compute a vector pointing away from neighbors that are too close (separation).
3. Compute the average velocity of neighbors (alignment).
4. Compute the average position of neighbors and steer toward it (cohesion).
5. Combine these forces and update the bird's velocity and position.

The computational model forces you to be precise about things the conceptual model leaves vague. How close is "too close"? How strongly should each rule pull? These decisions define the behavior of the simulation.

---

## Why Simulate?

Simulation serves several purposes in computing arts:

**Understanding.** Building a simulation forces you to think carefully about how something works. You cannot code "birds flock together" until you break down what "flocking" actually means at the level of individual decisions.

**Exploration.** Once you have a simulation, you can change parameters and see what happens. What if separation is very strong but cohesion is weak? What if the world wraps around at the edges versus bouncing? Simulation lets you explore a vast space of possibilities that would be impractical to build physically.

**Emergence.** Some of the most interesting results come from simple rules producing unexpected complex behavior. This is called emergence. You define simple local rules, press play, and watch global patterns appear that you never explicitly programmed.

**Art.** Simulation is a medium for creating dynamic, responsive, ever-changing artworks. Instead of designing a static composition, you design a system that produces compositions -- an infinity of them, never quite the same twice.

---

## Physical Simulation

Physical simulation tries to reproduce how objects move in the physical world. At its core, it is built on Newton's Second Law:

**Force = Mass x Acceleration** (F = ma)

In code, the typical pattern is:

1. **Accumulate forces** acting on an object (gravity, wind, springs, friction).
2. **Compute acceleration** from those forces: `acceleration = totalForce / mass`.
3. **Update velocity**: `velocity = velocity + acceleration`.
4. **Update position**: `position = position + velocity`.
5. **Reset the accumulated force** for the next frame.

This is called **Euler integration**, and it is the simplest method for stepping a physical simulation forward in time. It is not the most accurate method, but it is easy to understand and works well for artistic simulations.

Physical simulations can model:

- Gravity pulling objects downward
- Springs connecting objects with elastic forces
- Friction and drag slowing objects down
- Collisions bouncing objects off each other or off walls
- Fluid-like behaviors using pressure and viscosity

---

## Particle Systems

A **particle system** is a collection of many simple objects (particles) that are individually managed. Each particle is typically:

- Born at an **emitter** with some initial velocity
- Subject to **forces** (gravity, wind, etc.)
- Short-lived -- it has a **lifespan** that decreases each frame
- Removed when it "dies" (lifespan reaches zero)

Particle systems were invented by William Reeves at Lucasfilm in 1983 and are still used extensively today in games, films, and art. They are effective for representing fuzzy, amorphous phenomena that are difficult to model as solid objects: fire, smoke, sparks, rain, snow, explosions, magical effects.

The key characteristics of particle systems:

- **Each particle is independent.** Particles do not know about each other. They just respond to forces and die.
- **Particles are born and die continuously.** The system manages creation and removal.
- **Visual richness comes from quantity.** Any single particle is simple and uninteresting. Hundreds or thousands together create a compelling effect.
- **Randomness is essential.** Initial velocity, lifespan, color, and size all have random variation, which prevents the system from looking mechanical.

---

## Agent Systems

An **agent system** (or agent-based model) looks superficially similar to a particle system -- it is a collection of many objects moving around. But there is a crucial difference: **agents make decisions based on their environment and their neighbors.**

In a particle system, each particle is passive. It has no awareness. Forces act on it from outside, and it simply responds according to Newton's laws.

In an agent system, each agent is active. It perceives its local environment (nearby agents, obstacles, food, predators) and chooses how to behave. Agents have **behaviors** rather than just **physics**.

| Feature | Particle System | Agent System |
|---|---|---|
| Awareness | None -- particles do not perceive | Local -- agents perceive nearby neighbors |
| Behavior | Passive response to forces | Active decision-making |
| Interaction | Particles are independent | Agents influence each other |
| Typical use | Fire, smoke, sparks, rain | Flocking, swarming, crowds, ecosystems |
| Complexity source | Quantity + randomness | Simple rules + emergence |

---

## Boids: The Classic Agent System

Craig Reynolds' **Boids** (1986) is the most famous agent-based model in computer graphics. It simulates flocking behavior with three rules:

1. **Separation**: Steer away from neighbors that are too close. This prevents boids from colliding with each other.
2. **Alignment**: Steer toward the average heading (velocity) of nearby neighbors. This makes boids fly in the same direction as their flock-mates.
3. **Cohesion**: Steer toward the average position of nearby neighbors. This pulls boids toward the center of their local group.

Each boid only looks at its **local neighborhood** -- a small circle around itself. It has no concept of the flock as a whole. Yet the result is strikingly realistic flocking behavior. Groups form, split, merge, navigate around obstacles, and generally behave like a real flock of starlings or a school of fish.

This is the power of agent-based modeling: complex global behavior from simple local rules.

---

## Braitenberg Vehicles

**Valentino Braitenberg** was an Italian-Austrian neuroscientist who proposed a series of thought experiments in his 1984 book *Vehicles: Experiments in Synthetic Psychology*. He described simple vehicles with sensors and motors, connected by wires. Despite their simplicity, these vehicles exhibit behaviors that *look* intelligent -- aggression, fear, love, exploration.

The simplest Braitenberg vehicle has:

- **Two sensors** (for example, light sensors) on the left and right
- **Two motors** (wheels) on the left and right
- **Direct connections** from sensors to motors

The behavior depends entirely on how the sensors are wired to the motors:

**Vehicle 2a (Fear):** Each sensor is connected to the motor on the **same side**. When a light source is on the left, the left sensor activates the left motor, turning the vehicle away from the light. The vehicle avoids light sources -- it appears "fearful."

**Vehicle 2b (Aggression):** Each sensor is connected to the motor on the **opposite side**. When a light source is on the left, the left sensor activates the right motor, turning the vehicle toward the light. The vehicle charges at light sources -- it appears "aggressive."

Braitenberg's key insight was that even trivially simple mechanisms can produce behavior that looks purposeful and emotional to an observer. This challenges our tendency to attribute complex inner states to observed behavior.

---

## Artificial Life

**Artificial Life** (ALife) is a field that studies life-like behavior in artificial systems. Instead of analyzing existing biological life (as biology does), ALife tries to synthesize life-like phenomena in computers, robots, or chemistry.

Two important examples:

### Lenia

**Lenia** (by Bert Wang-Chak Chan, 2018) is a continuous generalization of Conway's Game of Life. Where the Game of Life operates on a grid of cells that are either alive or dead, Lenia uses continuous values and smooth update rules. The result is astonishing: life-like creatures emerge that move, pulse, grow, divide, and interact. These "organisms" are not designed by hand -- they emerge from the mathematical rules of the system.

Lenia demonstrates that complex, organic-looking behavior can arise from simple continuous mathematical rules. It blurs the line between "alive" and "not alive" in fascinating ways.

### Karl Sims' Virtual Creatures

**Karl Sims** created a landmark artificial life simulation in 1994. He evolved virtual creatures in a physically simulated 3D world. Each creature had:

- A body made of connected blocks (a **morphology**)
- A neural network controlling its muscles (a **brain**)
- Both morphology and brain defined by a **genome**

Using evolutionary algorithms (survival of the fittest), Sims let populations of creatures compete in tasks like swimming, walking, and competing for resources. Over many generations, the creatures evolved effective strategies for locomotion and competition -- strategies that were never designed by a human. Some walked, some slithered, some tumbled. The results were simultaneously alien and recognizable.

Sims' work shows how evolution -- another simple rule system (variation + selection) -- can produce complex, adaptive behavior.

---

## Connections Between These Ideas

All of these systems share a common thread: **simple rules produce complex behavior.**

- **Particle systems**: Simple physics (F = ma) + randomness produces fire, smoke, and other visual phenomena.
- **Boids**: Three simple steering rules produce realistic flocking.
- **Braitenberg vehicles**: Simple sensor-motor wiring produces behavior that looks emotional.
- **Lenia**: Simple continuous math produces organisms that look alive.
- **Karl Sims' creatures**: Variation + selection produces adaptive morphology and behavior.

None of these systems are explicitly told what to do. There is no line of code that says "form a flock" or "evolve a walking strategy." The complex behavior **emerges** from the interaction of simple components following simple rules.

This is one of the most powerful ideas in computing arts: you do not have to design every detail of an outcome. You can design a *system* and let the outcome emerge.

---

## Key Vocabulary

| Term | Definition |
|---|---|
| **Model** | A simplified representation that captures relevant aspects of a system |
| **Simulation** | Running a model forward in time to observe its behavior |
| **Particle system** | A collection of short-lived, independent objects subject to forces |
| **Agent system** | A collection of autonomous objects that perceive and respond to their environment |
| **Emergence** | Complex global behavior arising from simple local rules |
| **Euler integration** | The simplest method for stepping a physics simulation forward in time |
| **Steering force** | The force needed to change from current velocity to a desired velocity |
| **Artificial life** | The study and synthesis of life-like behavior in artificial systems |

---

## Further Reading

- Daniel Shiffman, *The Nature of Code* -- Chapters 4 (Particle Systems) and 6 (Autonomous Agents)
- Craig Reynolds, "Flocks, Herds, and Schools: A Distributed Behavioral Model" (1987)
- Valentino Braitenberg, *Vehicles: Experiments in Synthetic Psychology* (1984)
- Bert Wang-Chak Chan, "Lenia: Biology of Artificial Life" (2019)
- Karl Sims, "Evolving Virtual Creatures" (1994)
