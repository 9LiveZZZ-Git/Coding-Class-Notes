# Lesson: Pattern Formation in Nature

## MAT 200C: Computing Arts -- Week 4, January 29

---

## Patterns Are Everywhere

Look around the natural world and you will see patterns everywhere:

- The spots on a leopard and the stripes on a zebra
- The branching of a tree and the veins of a leaf
- The spiral of a nautilus shell and the whorl of a sunflower
- The ridges on your fingertips and the folds of your brain
- The hexagonal cells of a honeycomb and the rings of Saturn
- The spots on a giraffe and the patches on a cow

For most of human history, these patterns were simply observed and admired. But in 1952, the mathematician Alan Turing asked a revolutionary question: **Can a simple mathematical process explain how these patterns form?**

His answer was yes, and the mechanism he proposed -- reaction-diffusion -- remains one of the most important ideas in mathematical biology.

---

## Turing's Insight

### The Problem

How does a developing embryo "know" that this part should become a spot and that part should become background? Each cell in the embryo has the same DNA. No cell has a blueprint of the final pattern. So how do patterns emerge?

### The Solution: Chemical Interaction

Turing proposed that pattern formation can be explained by the interaction of two chemicals (which he called "morphogens," meaning "shape creators"):

1. An **activator** -- a chemical that promotes its own production and the production of an inhibitor
2. An **inhibitor** -- a chemical that suppresses the activator

The key insight: **the inhibitor must diffuse faster than the activator.**

This creates what is called a **local activation, long-range inhibition** system:

- The activator creates a local "peak" of high concentration
- The inhibitor spreads outward faster, suppressing the activator at a distance
- This creates an isolated spot or stripe of activator surrounded by a zone of inhibition
- The pattern of spots or stripes emerges from the competition between activation and inhibition

### An Analogy

Imagine a field of dry grass. A small fire starts (the activator). The fire spreads locally, burning grass nearby. But firefighters (the inhibitor) are dispatched and they drive faster than the fire spreads. They create a firebreak around the fire, preventing it from growing beyond a certain size.

Now imagine many fires starting simultaneously at random locations. Each fire is contained by its own ring of firefighters. The result is a pattern of burned patches (spots) separated by unburned grass -- much like the spots on a leopard.

If the fires start along a line rather than at random points, you get stripes instead of spots.

---

## Reaction-Diffusion: The Mathematical Framework

### What "Reaction" Means

In this context, "reaction" does not necessarily mean a chemical explosion. It means that the concentrations of the chemicals change according to some local rule. The rule depends only on the concentrations at that point:

- If there is a lot of activator and not much inhibitor, the activator grows.
- If there is a lot of inhibitor, the activator shrinks.
- The inhibitor is produced wherever the activator is high.
- The inhibitor also decays over time.

### What "Diffusion" Means

"Diffusion" means spreading out. If you drop a spot of ink in water, it diffuses -- the concentration spreads from high to low until it is uniform. In mathematical terms, diffusion moves a substance from areas of high concentration to areas of low concentration.

The rate of diffusion is controlled by a **diffusion coefficient**. A high coefficient means fast spreading; a low coefficient means slow spreading.

### Why Different Diffusion Rates Matter

The crucial requirement is that the inhibitor diffuses faster than the activator. Here is why:

1. The activator starts growing at some point.
2. The activator produces inhibitor at the same location.
3. The inhibitor spreads outward quickly, creating a "halo" of inhibition around the activator peak.
4. This halo prevents the activator from growing in the surrounding area.
5. But right at the center, the activator concentration is high enough to overcome the local inhibitor, so it persists.
6. The result: a stable, localized peak of activator surrounded by a suppressed zone.

If the inhibitor diffused at the same rate as the activator, it could never "get ahead" and create the surrounding suppression zone. The pattern would not form.

---

## From Equations to Patterns

### The Gray-Scott Model

One of the most commonly studied reaction-diffusion systems is the **Gray-Scott model**. It involves two chemicals, A and B:

- **Chemical A** is fed into the system and consumed by the reaction with B
- **Chemical B** is produced by the reaction and removed from the system

The balance between feeding A, the reaction that converts A to B, and the removal of B determines what kind of pattern forms.

### What Different Patterns Look Like

By changing just two parameters (the feed rate and the kill rate), the Gray-Scott model produces:

**Spots:** Isolated dots that may slowly divide like cells, creating more spots. This happens when the activator is just barely strong enough to sustain itself.

**Stripes and worms:** Elongated structures that wind through space. These form when the system is in a regime between spots and uniform states.

**Mazes:** Labyrinthine patterns with winding corridors. The stripes fold and branch to fill space.

**Holes:** The inverse of spots -- isolated holes in an otherwise uniform field. This is a "negative" pattern.

**Waves:** Moving fronts of chemical activity that wash across the surface.

**Chaos:** Turbulent, constantly changing patterns with no stable structure.

All of these emerge from the same two simple equations with different parameter values.

---

## Turing Patterns in Biology

### Confirmed Examples

For decades after Turing's 1952 paper, scientists debated whether his mechanism actually operated in living organisms. In recent years, strong evidence has confirmed Turing patterns in several biological systems:

**Fish pigmentation:** The stripes on zebrafish and the spots on leopard sharks have been shown to form through a reaction-diffusion mechanism involving pigment-producing cells (melanophores) and pigment-inhibiting cells.

**Mouse hair follicle spacing:** The regular spacing of hair follicles on a mouse's skin is determined by a Turing-type interaction between WNT and DKK proteins.

**Digit formation:** The pattern of fingers and toes in developing embryos appears to involve a Turing mechanism, with bones forming at activator peaks.

**Palate ridges:** The parallel ridges on the roof of your mouth (the hard palate) form through a reaction-diffusion process.

### How Spots Become Stripes

On many animals, you can see a transition from spots to stripes on different parts of the body. For example, a cheetah has spots on its body but stripes on its tail. This happens because the geometry of the body part affects the pattern:

- On a wide surface (the body), spots are stable.
- On a narrow surface (the tail), the confinement forces spots to merge into stripes.

This is beautifully predicted by reaction-diffusion models when applied to different domain geometries.

### The Famous Quote

The mathematical biologist James Murray observed: "A leopard cannot change its spots, but it can change its parameters." This captures the idea that the same mechanism (reaction-diffusion) produces different patterns depending on the parameters, explaining why different species have different markings despite using fundamentally similar developmental processes.

---

## The Laplacian: The Engine of Diffusion

### What the Laplacian Measures

The **Laplacian** is the mathematical operator that drives diffusion. You do not need to understand calculus to grasp what it does. The Laplacian of a quantity at a point measures:

**How different that point's value is from the average of its neighbors.**

- If a point has a **higher** value than its neighbors: the Laplacian is **negative** (the value will decrease -- spreading outward).
- If a point has a **lower** value than its neighbors: the Laplacian is **positive** (the value will increase -- neighbors' values flow in).
- If a point has the **same** value as its neighbors: the Laplacian is **zero** (no change -- already in equilibrium).

This is exactly what diffusion does: it smooths out differences, moving substance from high concentration to low concentration.

### A Simple Example

Imagine a row of cups with different amounts of water:

```
Cup:    A    B    C    D    E
Water:  0    0    10   0    0
```

Cup C has much more water than its neighbors. The Laplacian at C is negative (it should lose water). The Laplacian at B and D is positive (they should gain water). After one step of diffusion:

```
Cup:    A    B    C    D    E
Water:  0    2    6    2    0
```

Water has flowed from C to its neighbors. Over many steps, the water eventually becomes uniform across all cups. That is diffusion, driven by the Laplacian.

---

## Beyond Biology: Pattern Formation in Art

### Reaction-Diffusion as an Artistic Medium

Reaction-diffusion is not just a scientific model -- it is a generative art system. Artists use it to create:

- Organic, living textures for digital surfaces
- Animations that appear to grow and evolve
- Interactive installations where viewer input seeds new patterns
- Architectural surface designs inspired by natural forms

### Video Feedback as Pattern Formation

Video feedback (pointing a camera at a monitor) is another form of pattern formation. The feedback loop creates its own "reaction-diffusion-like" dynamics:

- Regions of brightness amplify themselves (like the activator)
- Saturation and clipping act as limiting factors (like the inhibitor)
- The camera's zoom and rotation parameters control the spatial scale of the pattern

Analog video artists like the Vasulkas discovered patterns through video feedback that are strikingly similar to Turing patterns -- not because the physics are the same, but because both systems share the same abstract structure of local amplification with spatial spreading.

---

## Key Concepts Summary

| Concept | What It Means | Why It Matters |
|---------|---------------|----------------|
| Morphogen | A pattern-forming chemical | Turing's term for the chemicals that create spatial patterns |
| Activator | Self-promoting substance | Creates local peaks of concentration |
| Inhibitor | Activator-suppressing substance | Prevents activator from growing everywhere |
| Diffusion | Spreading from high to low concentration | The Laplacian drives this process |
| Reaction | Local interaction between chemicals | Determines the dynamics at each point |
| Emergence | Complex patterns from simple rules | The whole point -- patterns are not pre-programmed |

---

## Discussion Questions

1. If a leopard's spots are formed by a chemical reaction-diffusion process, could you hypothetically change the pattern by changing the chemical parameters? What would happen to the spots?

2. Why do you think it took over 60 years after Turing's paper for biologists to confirm his mechanism in living systems?

3. Video feedback and reaction-diffusion produce similar-looking patterns through very different physical mechanisms. What does this say about the relationship between pattern and process?

4. If you were designing a creature for a video game or movie, how could reaction-diffusion help you create realistic surface patterns?

5. The same reaction-diffusion equations can produce spots, stripes, or uniform fields depending on parameters. What does this say about the relationship between the "rules" and the "outcome" in complex systems?
