# Tutorial: Algorithmic Thinking -- Solving Puzzles with Code

## MAT 200C: Computing Arts -- Week 9, March 3

---

## Overview

Algorithmic thinking is the process of breaking a problem into precise, mechanical steps that a computer can follow. This tutorial explores two puzzles that exercise different aspects of algorithmic reasoning:

1. **The Pi Digit Divisibility Puzzle** -- searching for patterns in a massive sequence of digits (string manipulation, modular arithmetic, BigInt).
2. **The Egg Drop Optimization Puzzle** -- minimizing worst-case cost with limited resources (dynamic programming, mathematical reasoning).

These puzzles come from real job application challenges. They test your ability to translate a word problem into working code.

We will cover:

- How to approach a problem you have never seen before
- Clarifying ambiguities in problem statements
- Using JavaScript's BigInt for arbitrary-precision arithmetic
- String manipulation techniques for digit searching
- Dynamic programming for optimization problems
- Complete working solutions in JavaScript

---

## Prerequisites

- Basic JavaScript knowledge (loops, functions, arrays)
- Familiarity with p5.js is helpful but not required (solutions work in vanilla JS)
- Access to a browser console or the p5.js web editor

---

## Part 1: The Pi Digit Divisibility Puzzle

### The Problem

> **a)** What is the first consecutive sequence of digits in pi that is divisible by both 3 and 37?
>
> **b)** Where in pi is that sequence located?
>
> If the solution to part a) is ##### and this solution starts at b) pi's \*\*\*\*\*\*th decimal place, visit a#####b\*\*\*\*\*\*.com

### Step 1: Clarify the Problem

Before writing any code, we need to answer several clarifying questions:

1. **What digits of pi?** We use: `3.14159265358979323846...`. Do we include the `3` before the decimal point? The problem says "decimal place", suggesting we count digits after the decimal point. But the phrasing "consecutive sequence in pi" is ambiguous. We should try both interpretations.

2. **How do we count positions?** "The N-th decimal place" -- do we count from 0 or from 1? We should try both.

3. **What is a "consecutive sequence"?** It means a substring of adjacent digits. For example, in `314159`, the substring `1415` is a consecutive sequence starting at position 1 (if we start counting from 0).

4. **Divisible by both 3 and 37** means divisible by `lcm(3, 37) = 111` (since 3 and 37 are both prime).

5. **How long can the sequence be?** The domain name has a maximum length of 253 characters. The format `a#####b******.com` suggests the answer is a modest number of digits.

### Step 2: Get the Digits of Pi

We need many digits of pi. JavaScript's `Math.PI` only gives us about 15 decimal digits. We need thousands or more. Options:

- Download a text file of pi digits from the internet (e.g., <https://www.piday.org/million/>).
- Use a JavaScript library that computes pi to arbitrary precision.
- Hardcode a long string.

For this solution, we will work with a string of pi digits. Here is a snippet to get started (you would use a much longer string in practice):

```js
// First 1000 digits of pi after the decimal point
// In practice, download from https://www.piday.org/million/
let piDigits = "14159265358979323846264338327950288419716939937510" +
  "58209749445923078164062862089986280348253421170679" +
  "82148086513282306647093844609550582231725359408128" +
  "48111745028410270193852110555964462294895493038196" +
  "44288109756659334461284756482337867831652712019091" +
  "45648566923460348610454326648213393607260249141273" +
  "72458700660631558817488152092096282925409171536436" +
  "78925903600113305305488204665213841469519415116094" +
  "33057270365759591953092186117381932611793105118548" +
  "07446237996274956735188575272489122793818301194912" +
  "98336733624406566430860213949463952247371907021798" +
  "60943702770539217176293176752384674818467669405132" +
  "00056812714526356082778577134275778960917363717872" +
  "14684409012249534301465495853710507922796892589235" +
  "42019956112129021960864034418159813629774771309960" +
  "51870721134999999837297804995105973173281609631859" +
  "50244594553469083026425223082533446850352619311881" +
  "71010003137838752886587533208381420617177669147303" +
  "59825349042875546873115956286388235378759375195778" +
  "18577805321712268066130019278766111959092164201989";
```

### Step 3: The Search Algorithm

We need to find the first consecutive sequence of digits in pi that forms a number divisible by 111.

The brute-force approach: try every possible substring (every starting position and every ending position), convert it to a number, and check if it is divisible by 111.

But there is a problem: these substrings can be very long, and JavaScript numbers lose precision beyond about 15 digits. We need **BigInt** or a **modular arithmetic** trick.

#### Approach A: Using BigInt

JavaScript's `BigInt` type can handle arbitrarily large integers:

```js
let x = BigInt("14159265358979323846264338327950288419716939937510");
console.log(x % 111n); // 111n is 111 as a BigInt
```

#### Approach B: Incremental Modular Arithmetic

Instead of converting the entire substring to a BigInt each time, we can compute the remainder incrementally. If we know that the number formed by digits `d[start..end]` has remainder `r` when divided by 111, then the number formed by `d[start..end+1]` has remainder `(r * 10 + d[end+1]) % 111`.

This is much faster because we never build large numbers.

### Step 4: Complete Solution

Here is a complete solution using the sliding window approach with modular arithmetic:

```js
// Pi digits as a string (first 1000 digits after the decimal point)
// Use a longer string for a real search
let piDigits = "14159265358979323846264338327950288419716939937510" +
  "58209749445923078164062862089986280348253421170679" +
  "82148086513282306647093844609550582231725359408128" +
  "48111745028410270193852110555964462294895493038196" +
  "44288109756659334461284756482337867831652712019091" +
  "45648566923460348610454326648213393607260249141273" +
  "72458700660631558817488152092096282925409171536436" +
  "78925903600113305305488204665213841469519415116094" +
  "33057270365759591953092186117381932611793105118548" +
  "07446237996274956735188575272489122793818301194912" +
  "98336733624406566430860213949463952247371907021798" +
  "60943702770539217176293176752384674818467669405132" +
  "00056812714526356082778577134275778960917363717872" +
  "14684409012249534301465495853710507922796892589235" +
  "42019956112129021960864034418159813629774771309960" +
  "51870721134999999837297804995105973173281609631859" +
  "50244594553469083026425223082533446850352619311881" +
  "71010003137838752886587533208381420617177669147303" +
  "59825349042875546873115956286388235378759375195778" +
  "18577805321712268066130019278766111959092164201989";

function findDivisibleSequence(digits, divisor) {
  let results = [];

  // Try every starting position
  for (let start = 0; start < digits.length; start++) {
    let remainder = 0;

    // Extend the sequence one digit at a time
    for (let end = start; end < digits.length; end++) {
      let digit = parseInt(digits[end]);
      remainder = (remainder * 10 + digit) % divisor;

      // Check if the current sequence is divisible
      if (remainder === 0) {
        let seq = digits.substring(start, end + 1);

        // Skip sequences that are just "0" or start with "0" (edge case)
        if (seq.length > 0 && !(seq.length > 1 && seq[0] === '0')) {
          console.log(
            `Found: ${seq} at position ${start} (length ${seq.length})`
          );
          return { sequence: seq, position: start };
        }
      }
    }
  }

  return null;
}

// Search for first sequence divisible by both 3 and 37 (= 111)
let result = findDivisibleSequence(piDigits, 111);

if (result) {
  console.log(`Answer a: ${result.sequence}`);
  console.log(`Answer b: position ${result.position}`);
  console.log(`URL: a${result.sequence}b${result.position}.com`);
}
```

### Step 5: Thinking About Edge Cases

There are subtleties in this problem:

- **Starting position**: Does "decimal place" mean position 0 is the first digit after the decimal (`1` in `3.14159...`), or is it position 1?
- **The digit `3` itself**: Should we include the `3` before the decimal point in our search? The phrase "in pi" suggests we might.
- **Leading zeros**: Is `0111` a valid sequence? Probably not -- we typically mean sequences that form actual numbers.
- **Single digits**: `0` is divisible by everything, but that is probably not the intended answer. The first single digit divisible by 111 does not exist (no single digit is >= 111). So the sequence must be at least 3 digits long.

The answer turns out to be `111` -- the substring `111` appears in the digits of pi. The question is *where* it first appears. Running the search on a sufficient number of digits reveals the answer.

### Understanding the Approach: Why Modular Arithmetic Works

If we have a number $N$ and we append a digit $d$, the new number is $N \times 10 + d$. The remainder of this new number divided by 111 is:

$$(N \times 10 + d) \mod 111 = ((N \mod 111) \times 10 + d) \mod 111$$

This means we only ever need to track the remainder, not the full number. This is the fundamental insight that makes the algorithm efficient -- we never need BigInt for the modular arithmetic approach.

### p5.js Visualization

Here is a p5.js sketch that visualizes the search process:

```js
let piDigits = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
let currentStart = 0;
let currentEnd = 0;
let found = false;
let foundSeq = "";
let foundPos = -1;

function setup() {
  createCanvas(800, 400);
  textFont("monospace");
  textSize(14);
}

function draw() {
  background(20);

  // Display pi digits
  let charsPerRow = 50;
  fill(100);
  noStroke();
  for (let i = 0; i < piDigits.length; i++) {
    let col = i % charsPerRow;
    let row = floor(i / charsPerRow);
    let x = 20 + col * 14;
    let y = 40 + row * 24;

    // Highlight current search window
    if (!found && i >= currentStart && i <= currentEnd) {
      fill(255, 200, 0);
    } else if (found && i >= foundPos && i < foundPos + foundSeq.length) {
      fill(0, 255, 100);
    } else {
      fill(100);
    }
    text(piDigits[i], x, y);
  }

  // Display status
  fill(255);
  textSize(16);
  if (found) {
    text(`Found: ${foundSeq} at position ${foundPos}`, 20, height - 40);
  } else {
    text(`Searching: start=${currentStart} end=${currentEnd}`, 20, height - 40);
  }
  textSize(14);

  // Advance the search (one step per frame for visualization)
  if (!found) {
    advanceSearch();
  }
}

let remainder = 0;

function advanceSearch() {
  if (currentEnd < piDigits.length) {
    let digit = parseInt(piDigits[currentEnd]);
    remainder = (remainder * 10 + digit) % 111;

    if (remainder === 0 && currentEnd >= currentStart) {
      let seq = piDigits.substring(currentStart, currentEnd + 1);
      if (parseInt(seq) > 0) {
        found = true;
        foundSeq = seq;
        foundPos = currentStart;
        return;
      }
    }
    currentEnd++;
  } else {
    // Move start forward, reset
    currentStart++;
    currentEnd = currentStart;
    remainder = 0;
  }
}
```

---

## Part 2: The Egg Drop Puzzle

### The Problem

> You are standing at the bottom of a stairway that has 100 steps, with two identical eggs in your hand. You must find the highest step $S^*$ from which a dropped egg will not break.
>
> Assumptions:
> - If an egg survives a drop from step $k$, it survives from any step below $k$.
> - If an egg breaks from step $k$, it breaks from any step above $k$.
> - An egg may or may not break from the bottom or top step.
> - To reuse an unbroken egg, you must descend to retrieve it.
> - Ascending costs energy; descending does not. Minimize total upward steps.
>
> a) Find a strategy that minimizes the worst-case total upward steps.
> b) What is the worst-case total?

### Step 1: Understanding the Problem

This is not just about minimizing the number of *drops* -- it is about minimizing the total number of *upward steps climbed*. This is a crucial distinction.

If you drop the first egg from step 14 and it breaks, you must go back to step 1 and test steps 1 through 13 one at a time with the second egg. That costs $14 + 1 + 2 + 3 + ... + 13 = 14 + 91 = 105$ upward steps in the worst case.

### Step 2: The Linear Search Baseline

The simplest strategy: go up one step at a time, drop the egg, repeat. This uses only one egg and takes at most $1 + 2 + 3 + ... + 100 = 5050$ upward steps. Terrible.

### Step 3: The Fixed-Interval Strategy

Drop the first egg every $k$ steps: step $k$, $2k$, $3k$, etc. If it breaks at step $mk$, use the second egg to test steps $(m-1)k + 1$ through $mk - 1$ one at a time.

For the first egg dropped at step $mk$ and it breaks:
- Climbing cost for first egg drops: $k + 2k + 3k + ... + mk = k \cdot m(m+1)/2$... Wait, actually you climb $k$ steps to go from your current position to the next test point. Let us think more carefully.

Actually, the cost is the total *upward* steps. If you go from the bottom to step $k$, that is $k$ upward steps. If the egg survives and you then go from step $k$ to step $2k$, that is another $k$ upward steps. Each first-egg test costs $k$ upward steps from the previous position.

If the first egg breaks at step $mk$, you have taken $mk$ upward steps total for the first egg. Then you descend to step $(m-1)k + 1$ (free), and climb one step at a time: that is at most $k - 1$ more upward steps.

Worst case: $mk + (k-1)$ where $mk = 100$, so $m = 100/k$. Total worst-case upward steps: $100 + (k - 1) = 99 + k$. This is minimized when $k$ is smallest, but that means more first-egg drops. Wait -- we need to reconsider.

### Step 4: The Decreasing-Interval Strategy

The key insight is that each first-egg drop costs cumulative climbing, so later drops should test smaller intervals. If the first egg is dropped at step $n_1$, then $n_1 + n_2$, then $n_1 + n_2 + n_3$, etc., we want:

$$n_1 + (n_1 + n_2 - 1) = n_1 + (n_1 + n_3 - 1) = ...$$

The optimal solution has the total worst-case cost be the same regardless of when the egg breaks. Let $f$ be the first drop height. If the egg breaks:
- Climb cost so far: $f$ steps.
- Second egg cost: test steps 1 through $f-1$ = at most $f - 1$ more upward steps.
- Total: $f + (f - 1) = 2f - 1$.

If the egg survives, we go up to $f + (f-1)$ on the next try (because the second segment should be one shorter):
- First egg cost: $f + (f - 1) = 2f - 1$ upward steps.
- If it breaks here, second egg cost: $f - 2$ more upward steps.
- Total: $(2f - 1) + (f - 2) = 3f - 3$.

Hmm, this is getting complicated. Let us solve it computationally with dynamic programming.

### Step 5: Dynamic Programming Solution

Let $\text{cost}(n, e)$ be the minimum worst-case upward steps needed to determine $S^*$ among $n$ steps with $e$ eggs.

With 1 egg, you must test from the bottom up: $\text{cost}(n, 1) = 1 + 2 + ... + n = n(n+1)/2$.

With 2 eggs and $n$ steps, if we drop the first egg from step $k$:
- If it breaks: we climbed $k$ steps, then need $\text{cost}(k - 1, 1)$ more upward steps.
- If it survives: we climbed $k$ steps, then need $\text{cost}(n - k, 2)$ more upward steps (but starting from step $k$, so the next climb begins from here).

Wait -- the cost accounting depends on absolute position, not just relative. Let us be more precise.

Here is a computational approach:

```js
function eggDrop(totalSteps, numEggs) {
  // dp[n][e] = minimum worst-case upward steps for n steps, e eggs
  // But we need to account for cumulative climbing cost.

  // Simpler model: Think in terms of number of "drops" first,
  // then compute step cost.

  // Actually, let's use a direct simulation approach.
  // cost(n, e) = min over k of: k + max(cost(k-1, e-1), cost(n-k, e))
  // where k is the step we drop from (relative to current base)

  let dp = [];
  for (let n = 0; n <= totalSteps; n++) {
    dp[n] = [];
    for (let e = 0; e <= numEggs; e++) {
      dp[n][e] = Infinity;
    }
  }

  // Base cases
  for (let e = 0; e <= numEggs; e++) {
    dp[0][e] = 0; // 0 steps to test = 0 cost
  }

  for (let n = 0; n <= totalSteps; n++) {
    dp[n][0] = Infinity; // 0 eggs = impossible
  }

  // With 1 egg, must go linearly: cost = 1 + 2 + ... + n
  for (let n = 1; n <= totalSteps; n++) {
    dp[n][1] = n * (n + 1) / 2;
  }

  // Fill DP table
  for (let e = 2; e <= numEggs; e++) {
    for (let n = 1; n <= totalSteps; n++) {
      dp[n][e] = Infinity;
      for (let k = 1; k <= n; k++) {
        // Drop from step k (relative to current position)
        // Climbing cost: k steps up
        // If breaks: cost(k-1, e-1) to search below
        // If survives: cost(n-k, e) to search above
        let worst = k + Math.max(dp[k - 1][e - 1], dp[n - k][e]);
        dp[n][e] = Math.min(dp[n][e], worst);
      }
    }
  }

  return dp[totalSteps][numEggs];
}

console.log("Minimum worst-case upward steps:", eggDrop(100, 2));
```

### Step 6: Recovering the Strategy

To find *which* steps to drop from, we track the optimal $k$ at each stage:

```js
function eggDropWithStrategy(totalSteps, numEggs) {
  let dp = [];
  let choice = [];

  for (let n = 0; n <= totalSteps; n++) {
    dp[n] = [];
    choice[n] = [];
    for (let e = 0; e <= numEggs; e++) {
      dp[n][e] = Infinity;
      choice[n][e] = -1;
    }
  }

  for (let e = 0; e <= numEggs; e++) dp[0][e] = 0;
  for (let n = 0; n <= totalSteps; n++) dp[n][0] = Infinity;

  for (let n = 1; n <= totalSteps; n++) {
    dp[n][1] = n * (n + 1) / 2;
    choice[n][1] = 1; // always start from step 1 with 1 egg
  }

  for (let e = 2; e <= numEggs; e++) {
    for (let n = 1; n <= totalSteps; n++) {
      for (let k = 1; k <= n; k++) {
        let worst = k + Math.max(dp[k - 1][e - 1], dp[n - k][e]);
        if (worst < dp[n][e]) {
          dp[n][e] = worst;
          choice[n][e] = k;
        }
      }
    }
  }

  // Print strategy
  console.log(`Optimal worst-case cost: ${dp[totalSteps][numEggs]} steps`);
  console.log("\nStrategy:");

  let base = 0;
  let n = totalSteps;
  let e = numEggs;

  while (n > 0 && e > 0) {
    let k = choice[n][e];
    let dropStep = base + k;
    console.log(`  Drop from step ${dropStep} (${n} steps remaining, ${e} eggs)`);
    console.log(`    If breaks: search steps ${base + 1} to ${dropStep - 1} with ${e - 1} egg(s)`);
    console.log(`    If survives: continue from step ${dropStep}`);

    // Assume egg survives (follow the "survives" branch for illustration)
    base += k;
    n -= k;
  }

  return dp[totalSteps][numEggs];
}

eggDropWithStrategy(100, 2);
```

### Step 7: The Mathematical Solution

For 2 eggs and $n$ steps, the optimal first drop is at step $k$ where $k$ is chosen so that the total worst-case cost is approximately:

$$\text{cost} \approx k + \frac{k(k-1)}{2} + \text{cost}(n - k, 2)$$

The classic solution for minimizing the number of *drops* (not steps) is to drop at step 14, then 27 (14+13), then 39 (14+13+12), etc. The decreasing intervals ensure equal worst-case drop counts.

For minimizing *upward steps* (our actual problem), the optimal solution is different and requires the DP computation above. Running the code reveals the answer.

### p5.js Visualization

```js
let totalSteps = 100;
let numEggs = 2;
let dp, choice;
let computed = false;

function setup() {
  createCanvas(800, 600);
  computeDP();
}

function computeDP() {
  dp = [];
  choice = [];
  for (let n = 0; n <= totalSteps; n++) {
    dp[n] = [];
    choice[n] = [];
    for (let e = 0; e <= numEggs; e++) {
      dp[n][e] = Infinity;
      choice[n][e] = -1;
    }
  }
  for (let e = 0; e <= numEggs; e++) dp[0][e] = 0;
  for (let n = 1; n <= totalSteps; n++) {
    dp[n][1] = n * (n + 1) / 2;
    choice[n][1] = 1;
  }
  for (let e = 2; e <= numEggs; e++) {
    for (let n = 1; n <= totalSteps; n++) {
      for (let k = 1; k <= n; k++) {
        let worst = k + Math.max(dp[k - 1][e - 1], dp[n - k][e]);
        if (worst < dp[n][e]) {
          dp[n][e] = worst;
          choice[n][e] = k;
        }
      }
    }
  }
  computed = true;
}

function draw() {
  background(20);
  if (!computed) return;

  // Visualize the DP table as a heatmap
  let cellW = width / (totalSteps + 1);
  let cellH = 40;

  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`Egg Drop: ${totalSteps} steps, ${numEggs} eggs`, 20, 30);
  text(`Optimal worst-case: ${dp[totalSteps][numEggs]} upward steps`, 20, 55);

  // Draw DP values for 2 eggs
  textSize(10);
  let y = 100;
  text("Steps (n):", 10, y - 10);

  for (let n = 1; n <= totalSteps; n++) {
    let x = 10 + (n - 1) * (width - 20) / totalSteps;
    let val = dp[n][2];
    let maxVal = dp[totalSteps][2];

    // Color based on value
    let r = map(val, 0, maxVal, 50, 255);
    let g = map(val, 0, maxVal, 200, 50);
    let b = 100;

    fill(r, g, b);
    noStroke();
    let barH = map(val, 0, maxVal, 0, 300);
    rect(x, y + 300 - barH, (width - 20) / totalSteps - 1, barH);
  }

  // Show optimal first drop
  let firstDrop = choice[totalSteps][numEggs];
  fill(255);
  textSize(14);
  text(`Optimal first drop: step ${firstDrop}`, 20, y + 340);
  text(`Hover over bars to see dp[n][2] values`, 20, y + 365);

  // Highlight hovered bar
  let hoveredN = floor(map(mouseX, 10, width - 10, 1, totalSteps + 1));
  if (hoveredN >= 1 && hoveredN <= totalSteps) {
    fill(255);
    text(`dp[${hoveredN}][2] = ${dp[hoveredN][2]} upward steps`, 20, y + 390);
    text(`Best first drop for ${hoveredN} steps: step ${choice[hoveredN][2]}`, 20, y + 415);
  }
}
```

---

## Key Algorithmic Concepts

### Brute Force vs. Clever Approaches

The Pi puzzle can be solved with brute force (try every substring), but modular arithmetic makes it fast. The Egg Drop puzzle requires dynamic programming because the brute force (try every possible strategy) would be exponentially slow.

### State Space Thinking

Both problems involve defining a "state" and exploring how to transition between states:

- **Pi puzzle**: state = (start position, end position, current remainder)
- **Egg drop**: state = (number of remaining steps, number of remaining eggs)

### Modular Arithmetic

The key insight for the Pi puzzle: you do not need to store the entire number, just the remainder when divided by 111. This reduces memory and computation dramatically.

### Dynamic Programming

The key insight for the Egg Drop: the answer for $n$ steps and $e$ eggs can be computed from answers for smaller subproblems. We store these answers in a table to avoid redundant computation.

---

## Exercises

1. **Pi puzzle variant**: Find the first 5-digit sequence in pi that is a palindrome (reads the same forward and backward).

2. **Egg drop variant**: Solve the egg drop problem for 3 eggs instead of 2. How much does the optimal cost decrease?

3. **Visualization**: Create a p5.js sketch that animates the egg drop strategy -- show a staircase, animate the egg being dropped, and highlight the decision tree as it unfolds.

4. **BigInt practice**: Write a function that uses BigInt to find the first 20-digit number in pi that is a perfect square.

---

## Further Resources

- Pi Digits: <https://www.piday.org/million/>
- Dynamic Programming (Wikipedia): <https://en.wikipedia.org/wiki/Dynamic_programming>
- The Two Egg Problem (classic): <https://en.wikipedia.org/wiki/Dynamic_programming#Egg_dropping_puzzle>
- JavaScript BigInt: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt>
