# Tutorial: Object-Oriented Programming in JavaScript for p5.js

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Why Object-Oriented Programming?

So far in this course, you have written sketches using variables and functions at the top level of your code. A bouncing ball might look like this:

```js
let x, y, vx, vy;

function setup() {
  createCanvas(400, 400);
  x = 200;
  y = 200;
  vx = 3;
  vy = 2;
}

function draw() {
  background(220);
  x += vx;
  y += vy;
  if (x > width || x < 0) vx *= -1;
  if (y > height || y < 0) vy *= -1;
  circle(x, y, 30);
}
```

This works fine for one ball. But what if you want 100 balls? You would need `x0, x1, x2, ...` or arrays like `let xs = []`. The code quickly becomes unmanageable.

**Object-Oriented Programming (OOP)** solves this by letting you define a **class** -- a blueprint for a thing -- and then create as many **instances** of that thing as you want. Each instance carries its own data (properties) and behavior (methods).

---

## What Is a Class?

A class is a template. It describes what a thing has (its **properties**) and what it can do (its **methods**). An **object** or **instance** is one specific thing created from that template.

Analogy: A cookie cutter is a class. Each cookie you cut out is an instance. All cookies have the same shape, but each cookie can have its own frosting color.

---

## Your First Class: Ball

```js
class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.size = 30;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > width || this.x < 0) this.vx *= -1;
    if (this.y > height || this.y < 0) this.vy *= -1;
  }

  display() {
    fill(100, 150, 255);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}
```

### Anatomy of a Class

**`class Ball { ... }`** -- declares a new class named `Ball`. By convention, class names start with an uppercase letter.

**`constructor(x, y)`** -- a special method that runs once when you create a new instance. This is where you set up initial values. The parameters `x` and `y` are passed in when you create the ball.

**`this`** -- refers to the specific instance being created or acted upon. `this.x` means "this ball's x coordinate." Without `this`, the variable would be local to the method and would disappear when the method ends.

**`update()`** and **`display()`** -- methods (functions that belong to the class). You can name them anything, but `update` and `display` are common conventions in creative coding.

### Using the Class

```js
let ball;

function setup() {
  createCanvas(400, 400);
  ball = new Ball(200, 200); // Create one Ball instance
}

function draw() {
  background(220);
  ball.update();   // Call the ball's update method
  ball.display();  // Call the ball's display method
}
```

The keyword **`new`** creates an instance. `new Ball(200, 200)` calls the constructor with x=200 and y=200, creating a ball object with all the properties and methods defined in the class.

---

## Many Objects from One Class

The real power of classes is creating many instances. Here we make 100 bouncing balls with one class definition:

```js
let balls = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 100; i++) {
    balls.push(new Ball(random(width), random(height)));
  }
}

function draw() {
  background(220);
  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
    this.size = random(10, 40);
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > width - this.size / 2 || this.x < this.size / 2) this.vx *= -1;
    if (this.y > height - this.size / 2 || this.y < this.size / 2) this.vy *= -1;
  }

  display() {
    fill(this.r, this.g, this.b, 180);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}
```

Each ball has its own position, velocity, size, and color. They are all independent. If you change one ball, the others are unaffected. This is called **encapsulation** -- each object encapsulates its own state.

---

## A Particle System

Particle systems are one of the most natural applications of OOP in creative coding. Each particle is an object with a position, velocity, lifespan, and visual appearance.

```js
let particles = [];

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(0, 20); // Semi-transparent background for trails

  // Spawn new particles at the mouse position
  if (mouseIsPressed) {
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle(mouseX, mouseY));
    }
  }

  // Update and display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();

    // Remove dead particles
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-4, -1);
    this.lifespan = 255; // Also used as alpha
    this.size = random(4, 12);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // Gravity
    this.lifespan -= 3;
  }

  display() {
    noStroke();
    fill(255, 100, 50, this.lifespan);
    circle(this.x, this.y, this.size);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
```

### Key Pattern: Removing Dead Objects

Notice we iterate backwards with `for (let i = particles.length - 1; i >= 0; i--)`. This is essential when removing elements from an array during iteration. If you iterate forwards and remove an element, the indices shift and you skip the next element.

### Key Pattern: Methods That Return Values

`isDead()` is a method that returns `true` or `false`. Methods can return anything, just like regular functions. This keeps the logic inside the class -- the main sketch does not need to know about lifespans.

---

## Properties vs. Methods

**Properties** are data stored on the object. They are set with `this.propertyName = value` and accessed with `object.propertyName`.

**Methods** are functions that belong to the object. They are defined inside the class body and called with `object.methodName()`.

```js
class Agent {
  constructor(x, y) {
    // Properties -- data about this agent
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.angle = random(TWO_PI);
    this.health = 100;
  }

  // Methods -- things this agent can do
  move() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
  }

  turnLeft() {
    this.angle -= 0.1;
  }

  turnRight() {
    this.angle += 0.1;
  }

  takeDamage(amount) {
    this.health -= amount;
  }

  isAlive() {
    return this.health > 0;
  }
}
```

---

## Methods That Take Parameters

Methods can accept parameters just like regular functions.

```js
class Mover {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = 1;
  }

  applyForce(force) {
    // F = ma, so a = F/m
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration each frame
  }

  display() {
    fill(200);
    stroke(0);
    circle(this.pos.x, this.pos.y, this.mass * 10);
  }
}
```

This pattern (position, velocity, acceleration with `applyForce`) is from Daniel Shiffman's _The Nature of Code_ and is extremely useful for simulations.

---

## Refactoring Procedural Code into OOP

Let us take a procedural sketch and transform it step by step.

### Before: Procedural

```js
let x1 = 100, y1 = 200, vx1 = 2, vy1 = 3;
let x2 = 300, y2 = 150, vx2 = -1, vy2 = 2;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  x1 += vx1; y1 += vy1;
  if (x1 > width || x1 < 0) vx1 *= -1;
  if (y1 > height || y1 < 0) vy1 *= -1;
  circle(x1, y1, 30);

  x2 += vx2; y2 += vy2;
  if (x2 > width || x2 < 0) vx2 *= -1;
  if (y2 > height || y2 < 0) vy2 *= -1;
  circle(x2, y2, 30);
}
```

The logic is duplicated. Adding a third ball means copying and pasting again.

### After: Object-Oriented

```js
let balls = [];

function setup() {
  createCanvas(400, 400);
  balls.push(new Ball(100, 200, 2, 3));
  balls.push(new Ball(300, 150, -1, 2));
  // Easy to add more:
  balls.push(new Ball(200, 300, 1.5, -2));
}

function draw() {
  background(220);
  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

class Ball {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > width || this.x < 0) this.vx *= -1;
    if (this.y > height || this.y < 0) this.vy *= -1;
  }

  display() {
    fill(100, 150, 255);
    noStroke();
    circle(this.x, this.y, 30);
  }
}
```

The logic exists in one place. Adding more balls is one line of code.

---

## Inheritance

Sometimes you want a new class that is similar to an existing one but with differences. **Inheritance** lets a new class (the **child** or **subclass**) extend an existing class (the **parent** or **superclass**), inheriting all its properties and methods.

```js
class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = [200, 200, 200];
  }

  display() {
    fill(this.color);
    noStroke();
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

class CircleShape extends Shape {
  constructor(x, y, diameter) {
    super(x, y); // Call the parent constructor
    this.diameter = diameter;
  }

  display() {
    super.display(); // Call the parent display (sets fill)
    circle(this.x, this.y, this.diameter);
  }
}

class RectShape extends Shape {
  constructor(x, y, w, h) {
    super(x, y);
    this.w = w;
    this.h = h;
  }

  display() {
    super.display();
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
  }
}
```

### Key Concepts

**`extends`** -- declares that a class inherits from another class.

**`super()`** -- calls the parent class's constructor. You must call `super()` before using `this` in a child constructor.

**`super.methodName()`** -- calls the parent's version of a method. Useful when you want to extend behavior rather than replace it.

### Using Inherited Classes

```js
let shapes = [];

function setup() {
  createCanvas(400, 400);
  shapes.push(new CircleShape(100, 200, 60));
  shapes.push(new RectShape(300, 200, 80, 50));
  shapes.push(new CircleShape(200, 100, 40));

  // Set colors -- this method is inherited from Shape
  shapes[0].color = [255, 100, 100];
  shapes[1].color = [100, 255, 100];
  shapes[2].color = [100, 100, 255];
}

function draw() {
  background(220);
  for (let s of shapes) {
    s.display(); // Each shape knows how to display itself
    s.move(random(-1, 1), random(-1, 1)); // Inherited method
  }
}
```

Even though `shapes` contains both `CircleShape` and `RectShape` objects, the loop works because both have a `display()` method. This is called **polymorphism** -- different classes respond to the same method call in their own way.

---

## Complete Example: Ball-to-Ball Collision

This is a more advanced example that combines OOP with physics. Each ball detects collisions with every other ball and bounces off.

```js
let balls = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 15; i++) {
    let r = random(15, 40);
    balls.push(new Ball(random(r, width - r), random(r, height - r), r));
  }
}

function draw() {
  background(30);

  // Check all pairs for collision
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].collideWith(balls[j]);
    }
  }

  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

class Ball {
  constructor(x, y, radius) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-3, 3), random(-3, 3));
    this.radius = radius;
    this.mass = radius * radius; // Mass proportional to area
    this.col = color(random(100, 255), random(100, 255), random(100, 255));
  }

  update() {
    this.pos.add(this.vel);

    // Bounce off walls
    if (this.pos.x - this.radius < 0) {
      this.pos.x = this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.x + this.radius > width) {
      this.pos.x = width - this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.y - this.radius < 0) {
      this.pos.y = this.radius;
      this.vel.y *= -1;
    }
    if (this.pos.y + this.radius > height) {
      this.pos.y = height - this.radius;
      this.vel.y *= -1;
    }
  }

  display() {
    fill(this.col);
    noStroke();
    circle(this.pos.x, this.pos.y, this.radius * 2);
  }

  collideWith(other) {
    let d = p5.Vector.sub(other.pos, this.pos);
    let distance = d.mag();
    let minDist = this.radius + other.radius;

    if (distance < minDist) {
      // Normalize the collision vector
      let normal = d.copy().normalize();

      // Separate the balls so they do not overlap
      let overlap = minDist - distance;
      let totalMass = this.mass + other.mass;
      this.pos.sub(p5.Vector.mult(normal, overlap * (other.mass / totalMass)));
      other.pos.add(p5.Vector.mult(normal, overlap * (this.mass / totalMass)));

      // Compute relative velocity along the collision normal
      let relativeVel = p5.Vector.sub(this.vel, other.vel);
      let velAlongNormal = relativeVel.dot(normal);

      // Do not resolve if velocities are separating
      if (velAlongNormal > 0) return;

      // Compute impulse (elastic collision)
      let impulse = (2 * velAlongNormal) / totalMass;

      // Apply impulse
      this.vel.sub(p5.Vector.mult(normal, impulse * other.mass));
      other.vel.add(p5.Vector.mult(normal, impulse * this.mass));
    }
  }
}
```

### What Makes This Work

The `collideWith(other)` method takes another Ball as a parameter. This is a powerful pattern: objects interacting with other objects of the same type. The collision detection and response are encapsulated inside the Ball class -- the main sketch does not need to understand the physics.

---

## Complete Example: Agent System with OOP

This example creates agents that wander, avoid edges, and sense each other -- similar to Braitenberg vehicles.

```js
let agents = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 30; i++) {
    agents.push(new Agent(random(width), random(height)));
  }
}

function draw() {
  background(30, 30, 50);

  for (let agent of agents) {
    agent.sense(agents);
    agent.update();
    agent.display();
  }
}

class Agent {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(1.5);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2.5;
    this.maxForce = 0.1;
    this.wanderAngle = random(TWO_PI);
    this.size = 8;
    this.hue = random(360);
  }

  sense(others) {
    // Wander behavior
    this.wanderAngle += random(-0.3, 0.3);
    let wanderForce = p5.Vector.fromAngle(this.wanderAngle).mult(0.05);
    this.acc.add(wanderForce);

    // Separation: steer away from nearby agents
    let separationForce = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      if (other === this) continue;
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d < 40 && d > 0) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize().div(d); // Weight by distance
        separationForce.add(diff);
        count++;
      }
    }
    if (count > 0) {
      separationForce.div(count);
      separationForce.setMag(this.maxSpeed);
      separationForce.sub(this.vel);
      separationForce.limit(this.maxForce);
      this.acc.add(separationForce);
    }

    // Edge avoidance
    let margin = 40;
    if (this.pos.x < margin) this.acc.x += 0.05;
    if (this.pos.x > width - margin) this.acc.x -= 0.05;
    if (this.pos.y < margin) this.acc.y += 0.05;
    if (this.pos.y > height - margin) this.acc.y -= 0.05;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Wrap around screen
    if (this.pos.x < -10) this.pos.x = width + 10;
    if (this.pos.x > width + 10) this.pos.x = -10;
    if (this.pos.y < -10) this.pos.y = height + 10;
    if (this.pos.y > height + 10) this.pos.y = -10;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // Draw a triangle pointing in the direction of movement
    colorMode(HSB, 360, 100, 100);
    fill(this.hue, 70, 90);
    noStroke();
    triangle(
      this.size, 0,
      -this.size / 2, -this.size / 2,
      -this.size / 2, this.size / 2
    );
    pop();
  }
}
```

---

## When to Use Classes

Use classes when you have:

- **Multiple instances** of the same kind of thing (particles, agents, enemies, notes)
- **State and behavior that go together** (a ball has position, velocity, and knows how to bounce)
- **Complex interactions** between objects (collision, attraction, communication)
- **A need to organize** code that is getting unwieldy

You do not need classes for everything. A simple sketch that draws a single pattern does not benefit from OOP. Use the approach that makes your code clearer.

---

## Common Mistakes

**Forgetting `this`**: Inside a method, `x` is a local variable. `this.x` is the object's property. If you write `x = 5` instead of `this.x = 5`, you are creating a local variable that disappears when the method ends.

**Forgetting `new`**: Writing `let b = Ball(100, 200)` without `new` will not create an object. It will call `Ball` as a regular function and you will get an error. Always use `new`.

**Forgetting `super()`**: If your class extends another class, you must call `super()` in the constructor before using `this`.

---

## Exercises

1. **Particle Colors**: Modify the Particle class so particles change color as they age (e.g., from yellow to red as lifespan decreases).

2. **Click to Spawn**: Create a sketch where clicking spawns a new Ball at the click position. Each ball should have a random color and size.

3. **Predator and Prey**: Create two classes, `Predator` and `Prey`, both extending a base `Creature` class. Predators chase the nearest prey. Prey flee from the nearest predator. What emergent behavior do you see?

4. **Solar System**: Create a `Planet` class with mass, position, and velocity. Apply gravitational attraction between all pairs of planets. Start with a large central "sun" and smaller orbiting planets.

---

## Further Reading

- Daniel Shiffman, _The Nature of Code_, Chapters 1-4: <https://natureofcode.com>
- MDN: Classes in JavaScript: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes>
- The Coding Train OOP playlist: <https://www.youtube.com/playlist?list=PLRqwX-V7Uu6YgpA3Oht-7B4NBQwFVe3pr>
