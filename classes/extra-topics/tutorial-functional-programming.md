# Tutorial: Functional Programming in JavaScript for p5.js

## MAT 200C: Computing Arts -- Supplementary Topic

---

## What Is Functional Programming?

Functional programming (FP) is a style of writing code that emphasizes:

- **Functions as values** -- functions can be stored in variables, passed as arguments, and returned from other functions
- **Transforming data** rather than mutating it -- instead of changing an array in place, you create a new one
- **Pure functions** -- functions that always return the same output for the same input and have no side effects

You have already been using some FP concepts without knowing it. The p5.js `map()` function is a pure function. Arrow functions like `() => {}` are FP syntax. This tutorial makes these ideas explicit and shows you powerful patterns for creative coding.

---

## Arrow Functions

Arrow functions are a shorter way to write functions. They are especially useful when passing small functions as arguments.

```js
// Traditional function
function double(x) {
  return x * 2;
}

// Arrow function (same thing)
let double = (x) => {
  return x * 2;
};

// Even shorter: if the body is a single expression, omit the braces and return
let double = (x) => x * 2;

// Even shorter: if there is exactly one parameter, omit the parentheses
let double = x => x * 2;
```

All four versions do the same thing. Arrow functions are not just shorter syntax -- they also handle `this` differently (they inherit `this` from the surrounding scope), but for most p5.js work, the concise syntax is the main benefit.

```js
// Arrow functions with zero or multiple parameters
let greet = () => "hello";
let add = (a, b) => a + b;
let makeVector = (x, y) => createVector(x, y);
```

---

## Higher-Order Functions

A **higher-order function** is a function that either takes a function as an argument or returns a function as its result. This is the foundation of functional programming.

You have already used one: p5.js's `sort()` can take a comparison function.

```js
let numbers = [5, 2, 8, 1, 9];

// Sort ascending
numbers.sort((a, b) => a - b); // [1, 2, 5, 8, 9]

// Sort descending
numbers.sort((a, b) => b - a); // [9, 8, 5, 2, 1]
```

The arrow function `(a, b) => a - b` is passed into `sort()`, which calls it repeatedly to decide the order.

---

## The Big Three: map, filter, reduce

These three array methods are the workhorses of functional programming. They transform arrays without mutating the originals.

### `map()` -- Transform Every Element

`map()` creates a new array by applying a function to every element of the original array.

```js
let numbers = [1, 2, 3, 4, 5];

// Double every number
let doubled = numbers.map(n => n * 2);
// doubled is [2, 4, 6, 8, 10]
// numbers is still [1, 2, 3, 4, 5] -- unchanged

// Square every number
let squared = numbers.map(n => n * n);
// [1, 4, 9, 16, 25]
```

#### Creative Coding Use: Mapping Data to Visuals

```js
let data = [10, 45, 30, 80, 55, 20, 70];

function setup() {
  createCanvas(500, 300);
  noLoop();
}

function draw() {
  background(30);

  // Map data values to bar heights
  let barHeights = data.map(d => map(d, 0, 100, 0, height - 40));

  // Map data values to colors
  let barColors = data.map(d => {
    let hue = map(d, 0, 100, 200, 0); // Blue (low) to Red (high)
    return color(hue, 100, 80);
  });

  let barWidth = width / data.length;

  for (let i = 0; i < data.length; i++) {
    fill(barColors[i]);
    noStroke();
    rect(i * barWidth + 5, height - barHeights[i], barWidth - 10, barHeights[i]);
  }
}
```

### `filter()` -- Keep Only Matching Elements

`filter()` creates a new array containing only the elements for which the function returns `true`.

```js
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Keep only even numbers
let evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

// Keep only numbers greater than 5
let big = numbers.filter(n => n > 5);
// [6, 7, 8, 9, 10]
```

#### Creative Coding Use: Filtering Particles

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(0, 30);

  // Spawn particles
  particles.push(new Particle(width / 2, height / 2));

  // Update all particles
  particles.forEach(p => p.update());

  // Remove dead particles using filter
  particles = particles.filter(p => p.lifespan > 0);

  // Display all living particles
  particles.forEach(p => p.display());

  // Show count
  fill(255);
  noStroke();
  textSize(14);
  text("Particles: " + particles.length, 10, 20);
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-3, 0);
    this.lifespan = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03;
    this.lifespan -= 2;
  }

  display() {
    noStroke();
    fill(255, 150, 50, this.lifespan);
    circle(this.x, this.y, 6);
  }
}
```

The line `particles = particles.filter(p => p.lifespan > 0)` replaces the backwards-iterating splice loop from the OOP tutorial. It is cleaner and less error-prone.

### `reduce()` -- Combine All Elements into One Value

`reduce()` processes every element of an array and accumulates a single result.

```js
let numbers = [1, 2, 3, 4, 5];

// Sum all numbers
let sum = numbers.reduce((accumulator, current) => accumulator + current, 0);
// 15

// Find the maximum
let max = numbers.reduce((acc, cur) => cur > acc ? cur : acc, -Infinity);
// 5

// Count occurrences
let letters = ["a", "b", "a", "c", "b", "a"];
let counts = letters.reduce((acc, letter) => {
  acc[letter] = (acc[letter] || 0) + 1;
  return acc;
}, {});
// { a: 3, b: 2, c: 1 }
```

The second argument to `reduce()` is the initial value of the accumulator. For summing, we start at 0. For building an object, we start with `{}`.

#### Creative Coding Use: Computing the Center of Mass

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      mass: random(1, 5)
    });
  }
}

function draw() {
  background(30);

  // Draw particles
  for (let p of particles) {
    fill(200, 200, 255);
    noStroke();
    circle(p.x, p.y, p.mass * 4);
  }

  // Compute total mass
  let totalMass = particles.reduce((sum, p) => sum + p.mass, 0);

  // Compute center of mass using reduce
  let centerOfMass = particles.reduce(
    (acc, p) => ({
      x: acc.x + p.x * p.mass,
      y: acc.y + p.y * p.mass
    }),
    { x: 0, y: 0 }
  );
  centerOfMass.x /= totalMass;
  centerOfMass.y /= totalMass;

  // Draw center of mass
  fill(255, 0, 0);
  stroke(255);
  strokeWeight(2);
  circle(centerOfMass.x, centerOfMass.y, 15);
}
```

---

## `forEach()` -- Do Something with Each Element

`forEach()` is like `map()` but does not return a new array. Use it when you want to perform an action (like drawing) for each element.

```js
let points = [
  { x: 100, y: 200 },
  { x: 300, y: 150 },
  { x: 200, y: 350 }
];

function draw() {
  background(220);
  points.forEach(p => {
    fill(100, 150, 255);
    circle(p.x, p.y, 20);
  });
}
```

---

## `find()` and `findIndex()`

`find()` returns the first element that matches a condition. `findIndex()` returns its index.

```js
let agents = [
  { name: "Alpha", energy: 80 },
  { name: "Beta", energy: 30 },
  { name: "Gamma", energy: 95 }
];

// Find the first agent with low energy
let weakAgent = agents.find(a => a.energy < 50);
// { name: "Beta", energy: 30 }

// Find its index
let weakIndex = agents.findIndex(a => a.energy < 50);
// 1
```

---

## `some()` and `every()`

`some()` returns `true` if at least one element passes the test. `every()` returns `true` if all elements pass.

```js
let particles = [
  { alive: true },
  { alive: true },
  { alive: false }
];

let anyAlive = particles.some(p => p.alive);    // true
let allAlive = particles.every(p => p.alive);   // false
let allDead = particles.every(p => !p.alive);   // false
```

---

## Pure Functions

A **pure function** always returns the same output for the same input and does not modify anything outside itself (no side effects).

```js
// Pure -- same inputs always give same output
function add(a, b) {
  return a + b;
}

// Pure -- does not modify the input array
function doubled(arr) {
  return arr.map(x => x * 2);
}

// Impure -- modifies external state
let total = 0;
function addToTotal(n) {
  total += n; // Side effect: modifies external variable
  return total;
}

// Impure -- uses random (different output each time)
function randomOffset(x) {
  return x + random(-10, 10);
}
```

In creative coding, pure functions are ideal for transformations and calculations. Drawing functions are inherently impure (they modify the canvas), and that is fine. The goal is not to make everything pure, but to separate pure logic from impure side effects.

---

## Immutability Concepts

**Immutability** means not changing data after it is created. Instead of modifying an array, you create a new one.

```js
// Mutable approach -- changes the original array
let positions = [10, 20, 30];
positions[1] = 25; // Mutates the array

// Immutable approach -- creates a new array
let positions = [10, 20, 30];
let updated = positions.map((p, i) => i === 1 ? 25 : p);
// positions is still [10, 20, 30]
// updated is [10, 25, 30]
```

For creative coding, strict immutability can be impractical (updating 1000 particle positions every frame by creating new arrays is wasteful). The useful idea to take away is: **be intentional about when you mutate data**. Use `map` and `filter` to create new arrays when it makes the code clearer. Mutate in place when performance matters.

### The Spread Operator for Shallow Copies

```js
let original = [1, 2, 3];
let copy = [...original]; // Creates a new array with the same values
copy.push(4);
// original is still [1, 2, 3]
// copy is [1, 2, 3, 4]

let obj = { x: 10, y: 20 };
let updated = { ...obj, y: 25 }; // Copy with y overridden
// obj is still { x: 10, y: 20 }
// updated is { x: 10, y: 25 }
```

---

## Chaining Methods

Since `map`, `filter`, and others return new arrays, you can chain them:

```js
let data = [3, 7, 1, 9, 4, 6, 2, 8, 5];

let result = data
  .filter(n => n > 3)       // [7, 9, 4, 6, 8, 5]
  .map(n => n * 10)          // [70, 90, 40, 60, 80, 50]
  .sort((a, b) => a - b);   // [40, 50, 60, 70, 80, 90]
```

---

## Complete Example: Functional Particle Trail

This sketch uses functional programming throughout -- `map`, `filter`, `forEach`, and arrow functions -- to create a colorful trail that follows the mouse.

```js
let trail = [];

function setup() {
  createCanvas(600, 400);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(0, 0, 10, 20);

  // Add a new point to the trail
  trail.push({
    x: mouseX + random(-5, 5),
    y: mouseY + random(-5, 5),
    age: 0,
    maxAge: 120,
    hue: frameCount % 360
  });

  // Age all points (using map to create updated versions)
  trail = trail.map(p => ({ ...p, age: p.age + 1 }));

  // Remove old points
  trail = trail.filter(p => p.age < p.maxAge);

  // Draw all points
  trail.forEach(p => {
    let alpha = map(p.age, 0, p.maxAge, 80, 0);
    let size = map(p.age, 0, p.maxAge, 12, 2);
    noStroke();
    fill(p.hue, 80, 90, alpha);
    circle(p.x, p.y, size);
  });

  // Display info
  fill(0, 0, 100);
  noStroke();
  textSize(12);
  text(`Points: ${trail.length}`, 10, 20);
}
```

---

## Complete Example: Data Visualization with Functional Transforms

```js
// Monthly temperature data (Celsius)
let rawData = [5, 7, 12, 18, 23, 28, 31, 30, 25, 18, 11, 6];
let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function setup() {
  createCanvas(700, 400);
  noLoop();
}

function draw() {
  background(30);

  let padding = 60;
  let chartWidth = width - padding * 2;
  let chartHeight = height - padding * 2;

  // Transform data into screen coordinates using map
  let points = rawData.map((temp, i) => ({
    x: padding + (i / (rawData.length - 1)) * chartWidth,
    y: padding + chartHeight - map(temp, 0, 35, 0, chartHeight),
    temp: temp,
    month: months[i]
  }));

  // Find hot months (above 25 C) using filter
  let hotMonths = points.filter(p => p.temp > 25);

  // Compute average temperature using reduce
  let avgTemp = rawData.reduce((sum, t) => sum + t, 0) / rawData.length;
  let avgY = padding + chartHeight - map(avgTemp, 0, 35, 0, chartHeight);

  // Draw average line
  stroke(255, 255, 0, 80);
  strokeWeight(1);
  line(padding, avgY, width - padding, avgY);
  noStroke();
  fill(255, 255, 0);
  textSize(11);
  text(`avg: ${avgTemp.toFixed(1)}C`, width - padding + 5, avgY + 4);

  // Draw lines connecting points
  stroke(100, 200, 255);
  strokeWeight(2);
  noFill();
  beginShape();
  points.forEach(p => vertex(p.x, p.y));
  endShape();

  // Highlight hot months
  hotMonths.forEach(p => {
    noStroke();
    fill(255, 100, 50, 60);
    circle(p.x, p.y, 30);
  });

  // Draw all points
  points.forEach(p => {
    let isHot = p.temp > 25;
    fill(isHot ? color(255, 100, 50) : color(100, 200, 255));
    noStroke();
    circle(p.x, p.y, 8);

    fill(200);
    textSize(10);
    textAlign(CENTER);
    text(p.month, p.x, height - 20);
    text(p.temp + "C", p.x, p.y - 12);
  });
}
```

---

## Functional vs. Imperative: A Comparison

```js
// Imperative: step-by-step instructions
let result = [];
for (let i = 0; i < data.length; i++) {
  if (data[i] > 10) {
    result.push(data[i] * 2);
  }
}

// Functional: describe the transformation
let result = data
  .filter(x => x > 10)
  .map(x => x * 2);
```

Both produce the same result. The functional version is more concise and often easier to read once you are comfortable with `filter` and `map`. The imperative version may be faster for very large arrays because it iterates only once.

---

## Exercises

1. **Brightness Sorted**: Create an array of 20 random colors (as objects with `r`, `g`, `b` properties). Use `map` to compute each color's brightness (`0.299*r + 0.587*g + 0.114*b`), then use `sort` to order them. Display them as a gradient bar.

2. **Keyboard History**: Track the last 30 keys pressed (use `keyPressed` and `push`). Use `filter` to count how many vowels vs. consonants. Display the history as colored blocks.

3. **Reduce a Drawing**: Create an array of `{x, y, size}` objects. Use `reduce` to compute the bounding box (minimum and maximum x and y). Draw the bounding box around the shapes.

4. **Chain Challenge**: Given an array of particle objects with `{x, y, vx, vy, alive}`, write a single chained expression that filters out dead particles, maps them to updated positions, and sorts them by y-coordinate.

---

## Further Reading

- MDN: Array methods: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array>
- Eloquent JavaScript, Chapter 5: Higher-Order Functions: <https://eloquentjavascript.net/05_higher_order.html>
- Fun Fun Function (YouTube): Functional programming in JavaScript: <https://www.youtube.com/playlist?list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84>
