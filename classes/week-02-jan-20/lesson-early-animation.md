# Lesson: Pioneers of Abstract Animation

**MAT 200C: Computing Arts -- Week 2, January 20**

---

## Introduction

Before computers, artists experimented with abstract, non-representational animation. They worked with film, paint, wax, light, and sound to create moving images that had no characters, no narrative, no recognizable objects -- only shape, color, rhythm, and motion.

These pioneers are directly relevant to our work in computing arts. The fractal visualizations, shader-generated patterns, and generative animations we create today are the digital continuation of a tradition that began nearly a century ago. Understanding this history deepens our work and connects us to a lineage of artists who asked the same fundamental question: **what happens when abstract forms move?**

---

## Oskar Fischinger (1900--1967)

### The Artist

Oskar Fischinger was a German-American abstract animator, filmmaker, and painter. He is one of the most important figures in the history of visual music and abstract animation.

Fischinger believed that **abstract moving images could function as a visual equivalent of music**. Just as music creates emotional responses through non-representational sounds (pitches, rhythms, timbres), he argued that abstract visual forms -- shapes, colors, movements -- could create equally powerful experiences without depicting anything from the real world.

### Wax Experiments (1921--1926)

- Video: [Oskar Fischinger, Wax Experiments (excerpt)](https://www.youtube.com/watch?v=zXqIKlCzqL0)

Fischinger's "Wax Experiments" are among the most remarkable works of early animation. The technique:

1. He created large blocks of wax embedded with layers of colored material.
2. He sliced the wax block thin, one slice at a time, photographing each cross-section.
3. When played back as animation, the cross-sections create continuously morphing abstract forms.

This is essentially **a 3D volume rendered as a sequence of 2D slices** -- the same principle behind CT scans, MRI visualization, and volumetric rendering. Fischinger arrived at this idea decades before medical imaging or computer graphics.

The resulting animations show organic, flowing forms that emerge, transform, and dissolve. They feel alive in a way that hand-drawn animation rarely achieves, because they derive from the genuine three-dimensional structure of the wax.

### Connection to Computing Arts

Fischinger's work anticipates several ideas central to our course:

- **Procedural generation**: The wax block is a kind of 3D data structure; slicing it is a procedure that generates a sequence of images.
- **Cross-sections of higher-dimensional objects**: Like taking 2D slices through a 3D fractal, or projecting 4D objects into 3D space.
- **Visual music**: Mapping audio structure to visual form.
- **Generative aesthetics**: The forms are not individually designed; they emerge from the material and the slicing process.

Fischinger later created more conventional (though still abstract) animations synchronized to music, including work for Disney's _Fantasia_ (1940) -- though he left the project in frustration, feeling Disney compromised his vision.

---

## Heider and Simmel (1944)

### The Experiment

- Video: [Heider and Simmel (1944) animation](https://www.youtube.com/watch?v=VTNmLt7QX8E)

Fritz Heider and Marianne Simmel were psychologists, not animators. In 1944, they created a short animation showing simple geometric shapes -- two triangles and a circle -- moving around a rectangle. They showed it to test subjects and asked: "What happened?"

### The Result

Almost every viewer described the animation in terms of **intentional agents**: the big triangle is "aggressive" or "bullying"; the small triangle and circle are "trying to escape"; the shapes are "fighting" or "flirting." People spontaneously attributed personality, emotion, motivation, and social relationships to simple geometric shapes.

### Why This Matters

This experiment demonstrates something profound about human perception: **we cannot help but see agency in motion**. When shapes move in certain ways -- approaching, retreating, accelerating, hesitating -- our brains automatically interpret these movements as purposeful behavior by sentient beings.

This has deep implications for computing arts:

1. **Minimal means, maximum effect**: You do not need realistic characters to create compelling animation. A triangle can be a villain. A circle can be a victim. The motion is what matters.

2. **Attribution of agency**: This is a fundamental cognitive bias. When we create agent-based simulations (a topic we will cover later in this course), viewers will see intentions and relationships in the agents' movements even if we programmed no such thing.

3. **Braitenberg vehicles**: The reading for this week, _Vehicles: Experiments in Synthetic Psychology_ by Valentino Braitenberg, explores the same idea from an engineering perspective. Simple machines with sensors and motors can exhibit behavior that looks purposeful, emotional, even intelligent.

4. **The uncanny and the minimal**: There is something powerful about the gap between what we *know* (these are just triangles) and what we *feel* (that triangle is angry). This tension between knowing and feeling is fertile ground for art.

### Design Principles from Heider and Simmel

What properties of motion trigger the attribution of agency?

- **Velocity changes**: Accelerating toward something looks like pursuit; decelerating looks like hesitation.
- **Path curvature**: Curved paths look more intentional than straight ones.
- **Timing**: Pauses look like "thinking" or "deciding."
- **Contingency**: When one shape's motion depends on another's, we see interaction.
- **Approach/avoidance**: Moving toward something looks like desire; moving away looks like fear.

When you build interactive and generative animations later in this course, remember: the simplest motions can tell powerful stories.

---

## Norman McLaren (1914--1987)

### The Artist

Norman McLaren was a Scottish-Canadian animator who worked at the National Film Board of Canada. He is widely regarded as one of the most inventive animators in history, pioneering techniques that pushed the boundaries of what animation could be.

### Dots (1940)

- Video: [Norman McLaren - Dots (1940)](https://www.youtube.com/watch?v=E3-vsKwQ0Cg)

_Dots_ is an early experiment in "cameraless animation" -- McLaren drew and scratched directly onto the film strip itself, creating both the visual and audio tracks by hand.

Key observations:

- The visuals are nothing more than **dots** (small circles) that move, multiply, and change size.
- The soundtrack is created by scratching the optical sound area of the film strip, producing percussive, rhythmic sounds directly correlated with the visual marks.
- The synchronization between image and sound is intimate because **both are physical marks on the same strip of celluloid**.

### Techniques

McLaren developed several techniques relevant to computing arts:

1. **Direct animation**: Drawing or painting directly on film. No camera needed. Each frame is handmade. This is analogous to our pixel-level GLSL work, where we compute each pixel individually.

2. **Optical sound**: McLaren drew sound waveforms directly on the film's soundtrack area. This is essentially **additive synthesis by hand** -- he was programming audio at the waveform level, the same thing we do with WebAudio.

3. **Pixilation**: Using live actors as stop-motion subjects. People "animated" in real space.

4. **Generative processes**: In later works, McLaren developed systematic approaches to generating frames, anticipating algorithmic and generative art.

### McLaren's Philosophy

McLaren famously said:

> "Animation is not the art of drawings that move, but the art of movements that are drawn."

This distinction is crucial. In computing arts, we are similarly not in the business of making pictures that change -- we are in the business of designing **processes that produce change**. The process (the algorithm, the rule, the system) is the artwork. The images are outputs.

---

## Mary Ellen Bute (1906--1983)

### The Artist

Mary Ellen Bute was an American avant-garde filmmaker who pioneered the use of electronic and oscilloscope-based imagery in abstract animation. She was one of the first artists to use electronic signals to generate abstract visual forms.

### Tarantella (1940)

- Video: [Mary Ellen Bute - Tarantella (1940)](https://www.youtube.com/watch?v=czDsy8BYP1M)

_Tarantella_ synchronizes abstract visual patterns with the music of Edwin Grieg. The visuals include:

- Oscilloscope traces: Lissajous figures and waveforms generated by electronic oscillators
- Hand-animated geometric shapes
- Light patterns created by moving lights in front of a camera

Bute's work is notable because she was **using electronic signal generation as an art tool** in the 1930s and 1940s, decades before the emergence of video synthesizers or computer graphics.

### Bute's Innovation

Bute systematically explored the relationship between mathematical forms and visual aesthetics. She studied with Leon Theremin (inventor of the Theremin, an early electronic instrument) and Joseph Schillinger (a music theorist who developed mathematical approaches to composition).

Her approach was essentially what we would now call **data-driven visualization**: she took electronic signals (which are mathematical functions of time) and made them visible. The oscilloscope traces in her films are direct visual representations of voltage over time -- the same data we might plot with `p5.js` or render with GLSL.

### Connection to Our Work

Bute's oscilloscope work is a direct ancestor of:

- **Shader-based visualization**: We convert mathematical functions to pixel colors. She converted electronic signals to phosphor traces.
- **Visual music**: Her films are synchronized to music, using mathematical correspondences between visual and auditory parameters.
- **Real-time generation**: The oscilloscope generates imagery in real time from a function. Our shaders do the same.

---

## Curtis Roads and Sonal Atoms (Referenced)

- Video: [Curtis Roads - Half-life, part I: Sonal atoms (1999)](https://www.youtube.com/watch?v=jOzOZvoyUJ4)

Curtis Roads is a computer music composer and researcher who developed **granular synthesis** -- the idea of building complex sounds from vast numbers of tiny sonic "grains" or "atoms." The visual component of _Half-life_ applies the same principle to visual imagery.

This connects to our work through:
- **Particle systems**: Building complex visual behavior from many simple elements
- **Emergence**: Complex sonic/visual textures arising from the accumulation of simple units
- **Time scales**: Working at the micro-level (individual samples/pixels) to create macro-level phenomena

---

## Common Themes

### What These Artists Share

Despite working in different decades with different technologies, these pioneers share several key ideas that run directly through our course:

1. **Abstraction as a legitimate artistic language**: None of these works represent real-world objects. They prove that abstract form, color, and motion can carry meaning and emotional weight on their own.

2. **Process over product**: McLaren's direct-on-film technique, Fischinger's wax slicing, Bute's oscilloscope -- all of these are *systems* for generating imagery. The artist designs the system; the system produces the images. This is the essence of algorithmic art.

3. **Mathematics as aesthetics**: These artists did not use math reluctantly. They saw mathematical relationships -- periodicity, symmetry, harmonic ratios, geometric transformations -- as inherently beautiful and artistically meaningful.

4. **Synesthesia and cross-modal correspondence**: The connection between visual and auditory experience runs through all of this work. Shapes have rhythm. Colors have pitch. Motion has melody.

5. **Technology as instrument**: Each artist adopted the technology of their time (film, wax, oscilloscopes, scratch techniques) and turned it into an artistic instrument. We do the same with GPUs and GLSL.

### The Line from Film to GLSL

Consider the parallel:

| Then | Now |
|------|-----|
| Drawing on film, frame by frame | Writing a fragment shader, pixel by pixel |
| Oscilloscope traces from electronic signals | GLSL functions generating pixel colors |
| Wax block sliced into cross-sections | 3D data sampled on a 2D plane |
| Synchronizing visuals to a musical score | Using audio-reactive uniforms |
| Scratching film to generate sound | WebAudio synthesis from code |

The medium has changed profoundly. The questions have not.

---

## For Discussion

1. Watch the Heider and Simmel animation. Write down what you see *before* reading about the experiment. Then compare your description to others'. What does the consistency (or inconsistency) of interpretations tell us?

2. Fischinger believed abstract animation was a universal visual language. Do you agree? Can abstract moving forms communicate across cultures and generations?

3. McLaren said animation is "the art of movements that are drawn." How does this apply to shader programming? Are we drawing movements, or are we drawing rules that produce movements?

4. Bute used oscilloscopes -- the most advanced real-time visualization technology of her era. What is our equivalent? Are GPUs and shaders our oscilloscopes?

---

## Resources

- [Oskar Fischinger, Wax Experiments (excerpt)](https://www.youtube.com/watch?v=zXqIKlCzqL0)
- [Heider and Simmel (1944) animation](https://www.youtube.com/watch?v=VTNmLt7QX8E)
- [Norman McLaren - Dots (1940)](https://www.youtube.com/watch?v=E3-vsKwQ0Cg)
- [Mary Ellen Bute - Tarantella (1940)](https://www.youtube.com/watch?v=czDsy8BYP1M)
- [Curtis Roads - Half-life, part I: Sonal atoms (1999)](https://www.youtube.com/watch?v=jOzOZvoyUJ4)
- Heider, F. & Simmel, M. (1944). "An Experimental Study of Apparent Behavior." _American Journal of Psychology_, 57(2), 243--259.
- Braitenberg, V. (1984). _Vehicles: Experiments in Synthetic Psychology_. MIT Press.
