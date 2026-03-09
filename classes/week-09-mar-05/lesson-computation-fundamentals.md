# Lesson: Computation Fundamentals -- From Logic Gates to CPUs

## MAT 200C: Computing Arts -- Week 9, March 5

---

## Why Should Creative Coders Care About Hardware?

You write JavaScript. JavaScript runs in a browser. The browser runs on an operating system. The operating system runs on a CPU. The CPU is made of billions of logic gates. Those gates are made of transistors.

Understanding this stack -- even at a high level -- changes how you think about code. When your Reaction-Diffusion simulation runs slowly on the CPU but fast on the GPU, understanding *why* requires knowing what a CPU actually does, clock cycle by clock cycle.

This lesson traces the path from the simplest possible logic gate (NAND) all the way up to a working computer. The ideas here are the foundation of the entire field of computing.

---

## The Fundamental Insight: Everything Is NAND

### What Is a Logic Gate?

A logic gate takes one or more binary inputs (0 or 1, true or false, on or off) and produces a binary output according to a fixed rule.

The simplest gates:

| Gate | Symbol | Rule |
|---|---|---|
| **NOT** | $\neg A$ | Output is the opposite of input |
| **AND** | $A \wedge B$ | Output is 1 only if both inputs are 1 |
| **OR** | $A \vee B$ | Output is 1 if either input is 1 |

Truth tables:

**NOT:**

| A | NOT A |
|---|---|
| 0 | 1 |
| 1 | 0 |

**AND:**

| A | B | A AND B |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**OR:**

| A | B | A OR B |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

### The NAND Gate

**NAND** stands for "NOT AND." It outputs 0 only when both inputs are 1; otherwise it outputs 1.

| A | B | A NAND B |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

### NAND Is Universal

Here is the remarkable fact: **NAND is a universal gate**. Every other logic gate can be built from NAND gates alone. This means that an entire computer -- your laptop, your phone, the servers running this course website -- can be built from nothing but NAND gates.

**NOT from NAND:** Connect both inputs of a NAND gate to the same signal.

```
NOT(A) = NAND(A, A)
```

| A | NAND(A, A) |
|---|---|
| 0 | 1 |
| 1 | 0 |

**AND from NAND:** NAND followed by NOT (which is itself a NAND).

```
AND(A, B) = NOT(NAND(A, B)) = NAND(NAND(A, B), NAND(A, B))
```

**OR from NAND:**

```
OR(A, B) = NAND(NOT(A), NOT(B)) = NAND(NAND(A, A), NAND(B, B))
```

This is not just theory. Real CPUs are built from transistors configured as NAND gates (and NOR gates, which are also universal). The entire digital world rests on this simple truth table.

---

## From Gates to Arithmetic: The Adder

### Half Adder

A half adder adds two single-bit numbers:

| A | B | Sum | Carry |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

- **Sum** = A XOR B
- **Carry** = A AND B

XOR ("exclusive or") can itself be built from NAND gates:

```
XOR(A, B) = NAND(NAND(A, NAND(A, B)), NAND(B, NAND(A, B)))
```

### Full Adder

A full adder takes three inputs: A, B, and a carry-in from the previous column. It produces a sum and a carry-out.

| A | B | Cin | Sum | Cout |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

A full adder is built from two half adders and an OR gate.

### Multi-bit Adder

Chain 16 full adders together (each carry-out feeds the next carry-in) and you have a **16-bit adder** that can add numbers up to 65,535. This is how your computer does addition.

---

## From Arithmetic to the ALU

The **Arithmetic Logic Unit (ALU)** is the part of the CPU that does computation. It can:

- Add two numbers
- Subtract (add the two's complement)
- Bitwise AND, OR, NOT
- Compare (is A greater than B?)
- Shift bits left or right

All of these operations are built from NAND gates, multiplexers (which select between inputs), and the adder we just described.

The ALU takes:

- Two data inputs (e.g., two 16-bit numbers)
- A control code that tells it which operation to perform

And produces:

- A result
- Flags (zero? negative? overflow?)

---

## Memory: Storing Data

### The SR Latch

A logic gate produces output only while it has input. To **remember** a value, we need feedback: the output of a gate feeding back into its own input.

An SR (Set-Reset) latch is made from two NAND gates with cross-coupled feedback:

```
     ___
S --|   |--+-- Q
    |NAND|  |
  +-|___|  |
  |        |
  |  ___   |
  +-|   |--+-- Q'
    |NAND|
R --|___|
```

- Set S=0: Q becomes 1 (stored)
- Set R=0: Q becomes 0 (cleared)
- Both high: Q holds its previous value

### From Latches to Registers

An SR latch stores one bit. Group 16 latches together and you have a **16-bit register** that can store a number. A CPU has several registers (typically 8-32) that hold the data it is currently working with.

### RAM

Random Access Memory (RAM) is a large array of registers (or similar storage cells). Each has an **address** (a number that identifies it). The CPU can read from or write to any address.

A computer with 64 KB of RAM has 65,536 addressable bytes. Each byte is stored in a group of 8 latches.

---

## The CPU: Putting It All Together

A CPU is a machine that repeats three steps, billions of times per second:

1. **Fetch**: Read the next instruction from memory (at the address stored in the Program Counter register).
2. **Decode**: Figure out what the instruction means (add? store? jump?).
3. **Execute**: Do the operation (run the ALU, access memory, update registers).

### The Instruction Set

Instructions are just numbers. For example, in a simple 16-bit CPU:

- `0001 0010 0011 0100` might mean "add register 2 and register 3, store result in register 4"
- `0010 0001 0000 1010` might mean "load the value at memory address 10 into register 1"
- `0011 0000 0010 0000` might mean "jump to instruction at address 32"

Every program you have ever used -- p5.js, Chrome, Windows, Photoshop -- is ultimately a sequence of these simple numerical instructions.

### The Clock

The CPU's clock is a crystal that oscillates at a fixed frequency (e.g., 3 GHz = 3 billion cycles per second). Each tick of the clock advances the fetch-decode-execute cycle by one step.

When we say a computer is "3 GHz," we mean it can potentially execute 3 billion simple operations per second. This is why your Reaction-Diffusion on the CPU can process about 500,000 pixels per frame at 60 fps ($500{,}000 \times 60 = 30{,}000{,}000$ operations/second), but struggles with more: even 3 billion operations per second runs out when each pixel needs dozens of operations.

---

## How This Connects to Your Code

### Why p5.js Is "Slow"

When you write:

```js
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    pixels[(y * width + x) * 4] = computeColor(x, y);
  }
}
```

This loop runs on a **single CPU core**. At 600x600 pixels, that is 360,000 iterations. Each iteration involves the `computeColor` function, array indexing, and loop overhead -- perhaps 100 CPU instructions each. That is 36,000,000 instructions per frame. At 60 fps, you need 2.16 billion instructions per second. You are approaching the limits of a single CPU core.

### Why the GPU Is Fast

The GPU has thousands of cores. A fragment shader runs on **every pixel simultaneously**. Those same 360,000 pixels are processed in parallel across, say, 2,048 cores. Instead of 360,000 sequential iterations, you have roughly 176 parallel batches. The GPU finishes in microseconds what takes the CPU tens of milliseconds.

This is the fundamental reason we moved from CPU Reaction-Diffusion (slow) to GPGPU (fast) to WebGPU compute shaders (fast and clean).

### Why Understanding Matters

When your sketch is slow, understanding the hardware helps you diagnose the problem:

- **CPU-bound**: Too much computation per pixel. Solution: move to GPU.
- **Memory-bound**: Too much data being read/written. Solution: optimize data access patterns.
- **Draw-call-bound**: Too many separate shapes. Solution: batch draws, use instancing.
- **Bandwidth-bound**: Too much data being sent between CPU and GPU. Solution: keep data on the GPU.

---

## nand2tetris and nandgame

### nand2tetris

The **nand2tetris** project (<https://www.nand2tetris.org>) is a course where you build an entire computer from scratch, starting with NAND gates and ending with a working operating system running Tetris. It has two parts:

1. **Hardware** (Chapters 1-6): Build gates, ALU, memory, CPU, and a complete computer using a hardware simulator.
2. **Software** (Chapters 7-12): Build an assembler, virtual machine, compiler, and operating system.

This is one of the most highly recommended courses in computer science. If you want to truly understand what your code is doing at every level of the stack, work through nand2tetris.

### nandgame

**nandgame** (<https://nandgame.com>) is a browser-based puzzle game where you build logic circuits from NAND gates. Each level asks you to build a more complex component:

1. NOT gate from NAND
2. AND gate from NAND
3. OR gate from NAND
4. XOR gate
5. Half adder
6. Full adder
7. Multi-bit adder
8. Incrementer
9. ALU
10. Registers
11. Memory
12. CPU

It is free, runs in the browser, and you can complete it in a few hours. It provides a hands-on, interactive way to understand the concepts in this lesson.

---

## From Binary to Art

All digital art is, at its lowest level, numbers in memory being processed by logic gates. When you write `fill(255, 0, 0)`, you are setting binary values in memory that will be sent to a display controller that will illuminate red subpixels on your screen.

Understanding this does not change how you write p5.js code day to day. But it changes your *mental model* of what the computer is doing. When you choose between a CPU approach and a GPU approach, when you optimize a tight loop, when you decide how to structure your data -- these decisions become informed by an understanding of the machine, not just the language.

As creative coders, we work at the intersection of ideas and machines. The more deeply you understand both, the more effectively you can bring your ideas to life.

---

## Key Takeaways

1. **NAND is universal**: every computation can be built from NAND gates.
2. **Adders do arithmetic**: chain full adders together for multi-bit addition.
3. **The ALU combines operations**: addition, logic, comparison -- all from gates.
4. **Memory stores state**: cross-coupled NAND gates (latches) hold bits.
5. **The CPU is a loop**: fetch, decode, execute -- billions of times per second.
6. **CPU = sequential, GPU = parallel**: this is why shaders are fast.
7. **Understanding hardware informs software decisions**: choose the right tool for the job.

---

## Exercises

1. **nandgame challenge**: Complete levels 1 through 6 of nandgame (<https://nandgame.com>). Write a brief reflection on which level was hardest and why.

2. **Binary addition by hand**: Add the binary numbers `1011` and `0110` by hand, showing the carry at each step. Verify your answer by converting to decimal.

3. **Gate count**: How many NAND gates does it take to build a NOT gate? An AND gate? An OR gate? An XOR gate? A half adder? (Count carefully.)

4. **Performance estimation**: Your sketch processes a 500x500 grid 60 times per second. Each cell requires approximately 50 arithmetic operations. How many operations per second is that? Compare this to a 3 GHz CPU's theoretical maximum.

---

## Further Resources

- nand2tetris: <https://www.nand2tetris.org>
- nandgame: <https://nandgame.com>
- *Code: The Hidden Language of Computer Hardware and Software* by Charles Petzold (book)
- *The Elements of Computing Systems* by Nisan and Schocken (the nand2tetris textbook)
- Ben Eater's YouTube channel (builds a CPU on breadboards): <https://www.youtube.com/c/BenEater>
