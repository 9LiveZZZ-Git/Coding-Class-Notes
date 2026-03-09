# Lesson: The Calculus You Need for Simulation

## MAT 200C: Computing Arts -- Week 5, February 5

---

## Who This Lesson Is For

You have never taken a calculus course, or you took one years ago and forgot everything. That is perfectly fine. This lesson explains the calculus concepts that matter for simulation -- and only those concepts -- using plain language, visual intuition, and code. No prior math beyond basic algebra is assumed.

---

## The Big Idea: Rates of Change

Calculus is fundamentally about two questions:

1. **How fast is something changing?** (Derivatives)
2. **How much has accumulated?** (Integrals)

These two questions are opposites of each other. If you know how fast something is changing at every moment, you can figure out the total accumulated change. If you know the total, you can figure out the rate.

In simulation, these questions map perfectly to physics:

- The **rate of change of position** is **velocity** (how fast an object is moving).
- The **rate of change of velocity** is **acceleration** (how fast the speed is changing).
- **Position** is the **accumulation** of velocity over time.
- **Velocity** is the **accumulation** of acceleration over time.

---

## Derivatives: Slopes and Rates

### What Is a Derivative?

Imagine you are driving a car and watching the odometer (total distance traveled). At 2:00 PM, the odometer reads 100 miles. At 3:00 PM, it reads 160 miles. You traveled 60 miles in 1 hour, so your average speed was 60 mph.

That average speed is an approximation of the derivative. The **derivative** is the **instantaneous rate of change** -- your speed at one exact moment, not averaged over an hour.

In math notation:

```
velocity = d(position) / dt
```

This reads: "velocity is the derivative of position with respect to time." It means: "velocity is how fast position is changing at this instant."

### The Derivative in Code

In a simulation, we do not have continuous time. We have discrete frames. Each frame is a small time step apart (let us call this step `dt`). So the derivative becomes an approximation:

```
velocity ≈ change in position / dt
```

Or equivalently:

```
change in position = velocity * dt
```

In p5.js, with `dt = 1` frame:

```js
position = position + velocity;
```

That single line is calculus. It says: "the new position equals the old position plus the velocity." Velocity is the rate at which position changes. Each frame, we add that rate to get the new position.

### Derivative as Slope

If you graph position over time, the derivative at any point is the **slope** of the graph at that point.

- A steep upward slope means high positive velocity (moving fast to the right).
- A flat slope means zero velocity (stationary).
- A downward slope means negative velocity (moving to the left).
- A curve that gets steeper over time means the velocity is increasing -- the object is accelerating.

```
Position over time:

     |           _---
     |         _/
     |       _/        <- Slope getting steeper = accelerating
     |      /
     |    /
     |  _/
     |_/
     +-------------------> time
```

### The Chain: Position, Velocity, Acceleration

There is a chain of three quantities:

```
position  ---(derivative)--->  velocity  ---(derivative)--->  acceleration
```

Going the other direction:

```
acceleration  ---(integral)--->  velocity  ---(integral)--->  position
```

- **Position** is where something is.
- **Velocity** is how fast position is changing. (First derivative of position.)
- **Acceleration** is how fast velocity is changing. (Second derivative of position, first derivative of velocity.)

In everyday language:
- Position: "I am at mile marker 50."
- Velocity: "I am going 60 miles per hour."
- Acceleration: "I am speeding up by 10 mph each second."

---

## Integrals: Accumulation

### What Is an Integral?

An integral is the reverse of a derivative. Instead of asking "what is the rate of change?", it asks "given the rate of change, what is the total accumulated value?"

If you know that your speed is 60 mph for 2 hours, you can compute the total distance: 60 * 2 = 120 miles. That multiplication is integration: you accumulated speed over time to get distance.

But what if your speed is not constant? What if you are accelerating? Then you need to add up many tiny contributions -- your speed at each tiny moment, multiplied by the tiny time step:

```
total distance = sum of (speed at each moment * tiny time step)
```

This is what integration is: adding up many tiny contributions.

### The Integral in Code

In code, integration is what happens every frame when you update position:

```js
// This IS integration:
velocity = velocity + acceleration;  // Integrate acceleration to get velocity
position = position + velocity;      // Integrate velocity to get position
```

Each frame, you take the current rate of change (velocity or acceleration) and add a tiny bit of it to the accumulated total (position or velocity). Over many frames, these tiny additions accumulate into the total change.

### Visualizing Integration

If you graph velocity over time, the integral (total distance traveled) is the **area under the curve**.

```
Velocity over time:

     |  ________
     | |        |
     | |  AREA  |     <- This area = total distance traveled
     | |        |
     +-------------------> time
```

A constant velocity of 5 for 10 frames means a total distance of 5 * 10 = 50 pixels. That is the area of the rectangle: height 5, width 10.

If velocity is changing (a triangle, a curve), the area is harder to compute exactly, but our frame-by-frame addition (`position += velocity`) approximates it by breaking the area into thin vertical strips, one per frame.

---

## The Connection: Derivatives and Integrals Are Opposites

These two operations undo each other:

- If you **differentiate** position, you get velocity.
- If you **integrate** velocity, you get back position (plus a starting point).

In code terms:
- Differentiation: "What is the difference between this frame and last frame?"
- Integration: "Add this frame's contribution to the running total."

The simulation loop is essentially continuous integration:

```
Each frame:
  1. Compute forces -> get acceleration (physics tells us the derivative)
  2. Integrate acceleration -> update velocity (accumulate acceleration)
  3. Integrate velocity -> update position (accumulate velocity)
```

---

## Why Discrete Approximation Works (Mostly)

Real calculus deals with infinitely small time steps. Our simulation uses finite time steps (1 frame = about 16 milliseconds). This means our integration is an **approximation** of the true continuous result.

The approximation is good when:
- The time step is small relative to how fast things are changing.
- The forces are smooth (not jerky or sudden).

The approximation breaks down when:
- The time step is too large (things change too much between frames).
- Forces are very strong and change rapidly.

For example, imagine a ball bouncing off a wall. If the ball is moving at 100 pixels per frame and the wall is at position 300, the ball might be at 250 one frame and 350 the next -- it teleported through the wall! The time step was too large relative to the ball's speed.

For artistic simulations, the frame rate of 60 fps is usually fine. If you see instability (things blowing up or passing through barriers), try reducing forces, adding damping, or increasing the number of simulation steps per frame.

---

## Real-World Analogy: The Bank Account

Here is an analogy that connects all the concepts:

- **Position** = your bank balance (total money)
- **Velocity** = your income rate (how fast money is coming in)
- **Acceleration** = raises (how fast your income is increasing)

- **Derivative**: If your bank balance went from $10,000 to $13,000 this month, your income rate (velocity) was $3,000/month.
- **Integral**: If your income is $3,000/month for 12 months, your total accumulated income (position change) is $36,000.
- **Second derivative**: If your income went from $3,000/month to $3,500/month, your "raise rate" (acceleration) is $500/month/month.

In the simulation:

```js
income += raise;        // velocity += acceleration (integrate acceleration)
balance += income;      // position += velocity (integrate velocity)
```

---

## Summary Table

| Concept | Calculus Term | Physics Term | In Code |
|---|---|---|---|
| Where something is | Function value | Position | `position` |
| How fast it is changing | First derivative | Velocity | `velocity` |
| How fast the change is changing | Second derivative | Acceleration | `acceleration` |
| Adding up changes over time | Integration | Accumulation | `position += velocity` |
| Finding the rate of change | Differentiation | Rate | `velocity = posNow - posLast` |

---

## What You Need to Remember

1. **Velocity is the rate of change of position.** In code: `position += velocity`.
2. **Acceleration is the rate of change of velocity.** In code: `velocity += acceleration`.
3. **Forces determine acceleration** (Newton's second law: a = F/m).
4. **Integration is just adding a little bit each frame.** That is the entire simulation loop.
5. **The approximation is good enough** for artistic simulations at 60 fps. You do not need to worry about higher-order integration methods unless you are doing scientific computing.

You now know all the calculus needed for simulation. Everything else is just applying these ideas to different systems.

---

## Further Reading

- 3Blue1Brown, "The Essence of Calculus" (YouTube series) -- exceptionally visual explanations
- Daniel Shiffman, *The Nature of Code*, Chapter 1: Vectors and Chapter 2: Forces
- Betterexplained.com, "A Gentle Introduction to Learning Calculus"
