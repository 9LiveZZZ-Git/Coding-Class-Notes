# Lesson: Games and Visual Art in Creative Coding

## MAT 200C: Computing Arts -- Supplementary Topic

---

## The Setup/Draw Game Loop

You have been using a game loop since day one without calling it that. The `setup()` / `draw()` pattern in p5.js is structurally identical to the core loop of every video game ever made:

```
1. Initialize (setup)
2. Loop forever:
   a. Process input
   b. Update state
   c. Render graphics
```

In p5.js:

```js
function setup() {
  // 1. Initialize
  createCanvas(400, 400);
}

function draw() {
  // 2a. Process input (mouseX, keyIsDown, etc.)
  // 2b. Update state (move objects, check collisions)
  // 2c. Render graphics (background, shapes)
}
```

Games and creative coding sketches share this fundamental structure. The difference is in what happens inside the loop: games emphasize rules, goals, and player agency; creative coding emphasizes aesthetics, emergence, and exploration.

---

## Interactive Art vs. Games

The boundary between interactive art and games is blurry and interesting.

**Games typically have:**
- Clear goals and win/lose conditions
- Rules that constrain the player
- Feedback loops (score, health, progress)
- Challenge that increases over time

**Interactive art typically has:**
- No explicit goals
- Open-ended exploration
- Aesthetic or conceptual focus
- The experience itself is the point

**Art games** deliberately blur these boundaries. Some examples:

- **_Passage_** (Jason Rohrer, 2007) -- A 5-minute game about life and death. You walk right; you age; you die. There are choices (explore alone or with a companion) but no winning.

- **_Flower_** (thatgamecompany, 2009) -- You are the wind, guiding flower petals across landscapes. There are no enemies, no score, no failure. But it is structured as a game with levels and progression.

- **_Everything_** (David OReilly, 2017) -- You can be anything in the universe, from an atom to a galaxy. Philosopher Alan Watts narrates. Is it a game? A meditation?

- **_Line Rider_** -- A drawing tool that becomes a game: draw lines, drop a character on a sled, watch physics happen. The joy is in creating and experimenting.

- **_Sandspiel_** (Max Bittker) -- A falling-sand simulation in the browser. Not a game (no goals), but deeply playful and interactive. <https://sandspiel.club>

---

## Collision Detection

Collision detection answers the question: "Are these two things overlapping?" This is fundamental to both games and interactive art.

### Circle-Circle Collision

Two circles collide when the distance between their centers is less than the sum of their radii.

```js
function circlesCollide(x1, y1, r1, x2, y2, r2) {
  let d = dist(x1, y1, x2, y2);
  return d < r1 + r2;
}
```

### Rectangle-Rectangle Collision (AABB)

Two axis-aligned rectangles overlap when they overlap on both axes.

```js
function rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}
```

### Point-Circle Collision

Is a point inside a circle?

```js
function pointInCircle(px, py, cx, cy, r) {
  return dist(px, py, cx, cy) < r;
}
```

### Point-Rectangle Collision

Is a point inside a rectangle?

```js
function pointInRect(px, py, rx, ry, rw, rh) {
  return px > rx && px < rx + rw && py > ry && py < ry + rh;
}
```

### Complete Example: Bouncing Balls with Collision

```js
let balls = [];

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < 10; i++) {
    balls.push({
      x: random(50, width - 50),
      y: random(50, height - 50),
      vx: random(-3, 3),
      vy: random(-3, 3),
      r: random(15, 30),
      col: color(random(100, 255), random(100, 255), random(100, 255))
    });
  }
}

function draw() {
  background(30);

  // Update positions
  for (let b of balls) {
    b.x += b.vx;
    b.y += b.vy;

    // Wall bounce
    if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;
    b.x = constrain(b.x, b.r, width - b.r);
    b.y = constrain(b.y, b.r, height - b.r);
  }

  // Check collisions between all pairs
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let a = balls[i];
      let b = balls[j];
      let d = dist(a.x, a.y, b.x, b.y);
      if (d < a.r + b.r) {
        // Simple elastic response: swap velocities
        let tempVx = a.vx;
        let tempVy = a.vy;
        a.vx = b.vx;
        a.vy = b.vy;
        b.vx = tempVx;
        b.vy = tempVy;

        // Separate the balls
        let overlap = (a.r + b.r) - d;
        let angle = atan2(b.y - a.y, b.x - a.x);
        a.x -= cos(angle) * overlap / 2;
        a.y -= sin(angle) * overlap / 2;
        b.x += cos(angle) * overlap / 2;
        b.y += sin(angle) * overlap / 2;

        // Visual feedback: flash white
        a.col = color(255);
        b.col = color(255);
      }
    }
  }

  // Draw balls
  for (let b of balls) {
    fill(b.col);
    noStroke();
    circle(b.x, b.y, b.r * 2);

    // Fade color back to original over time
    b.col = lerpColor(b.col, color(random(100, 255), random(100, 255), random(100, 255)), 0.02);
  }
}
```

---

## State Machines for Game States

Most games have multiple **states**: a title screen, gameplay, pause menu, game over screen. A **state machine** is a pattern for managing transitions between these states.

### Simple State Machine

```js
let state = "title"; // Current state
let score = 0;
let playerY;
let obstacles = [];

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (state === "title") {
    drawTitleScreen();
  } else if (state === "playing") {
    drawGameplay();
  } else if (state === "paused") {
    drawPauseScreen();
  } else if (state === "gameover") {
    drawGameOver();
  }
}

function drawTitleScreen() {
  background(30, 30, 60);
  fill(255);
  textSize(32);
  text("DODGE", width / 2, height / 3);
  textSize(16);
  text("Press ENTER to start", width / 2, height / 2);
  textSize(12);
  text("Arrow keys to move, P to pause", width / 2, height * 2 / 3);
}

function drawGameplay() {
  background(30);

  // Player
  fill(100, 200, 255);
  noStroke();
  let playerX = width / 2;
  playerY = constrain(playerY, 20, height - 20);
  circle(playerX, playerY, 20);

  // Move player
  if (keyIsDown(UP_ARROW)) playerY -= 4;
  if (keyIsDown(DOWN_ARROW)) playerY += 4;

  // Spawn obstacles
  if (frameCount % 30 === 0) {
    obstacles.push({
      x: width + 20,
      y: random(20, height - 20),
      speed: random(2, 5),
      size: random(10, 30)
    });
  }

  // Update and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= o.speed;

    fill(255, 80, 80);
    rect(o.x - o.size / 2, o.y - o.size / 2, o.size, o.size);

    // Collision check
    if (dist(playerX, playerY, o.x, o.y) < 10 + o.size / 2) {
      state = "gameover";
    }

    // Remove off-screen obstacles
    if (o.x < -o.size) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  // Score
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
  textAlign(CENTER, CENTER);
}

function drawPauseScreen() {
  // Draw the game behind the pause overlay
  drawGameplay();

  // Pause overlay
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  fill(255);
  textSize(32);
  text("PAUSED", width / 2, height / 2);
  textSize(16);
  text("Press P to resume", width / 2, height / 2 + 40);
}

function drawGameOver() {
  background(60, 20, 20);
  fill(255);
  textSize(32);
  text("GAME OVER", width / 2, height / 3);
  textSize(20);
  text("Score: " + score, width / 2, height / 2);
  textSize(16);
  text("Press ENTER to restart", width / 2, height * 2 / 3);
}

function keyPressed() {
  if (state === "title" && keyCode === ENTER) {
    state = "playing";
    score = 0;
    playerY = height / 2;
    obstacles = [];
  }

  if (state === "playing" && key === 'p') {
    state = "paused";
  } else if (state === "paused" && key === 'p') {
    state = "playing";
  }

  if (state === "gameover" && keyCode === ENTER) {
    state = "title";
  }
}
```

### State Transition Diagram

```
[Title] --ENTER--> [Playing] --collision--> [Game Over]
                      ^  |                       |
                      |  P                    ENTER
                      |  v                       |
                   [Paused]                   [Title]
```

---

## Scoring, Health, and Feedback

Games use **feedback loops** to communicate state to the player.

### Visual Feedback

```js
// Screen shake on impact
let shakeAmount = 0;

function draw() {
  if (shakeAmount > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.9; // Decay
  }

  // ... rest of drawing
}

function onHit() {
  shakeAmount = 10;
}
```

### Health Bar

```js
function drawHealthBar(x, y, w, h, current, maximum) {
  let fraction = current / maximum;
  let barColor;
  if (fraction > 0.6) barColor = color(50, 200, 50);
  else if (fraction > 0.3) barColor = color(255, 200, 50);
  else barColor = color(255, 50, 50);

  // Background
  fill(60);
  noStroke();
  rect(x, y, w, h);

  // Health fill
  fill(barColor);
  rect(x, y, w * fraction, h);

  // Border
  noFill();
  stroke(200);
  strokeWeight(1);
  rect(x, y, w, h);
}
```

### Score with Animation

```js
let displayScore = 0;
let targetScore = 0;

function addPoints(n) {
  targetScore += n;
}

function draw() {
  // ... game logic ...

  // Animate score counting up
  displayScore = lerp(displayScore, targetScore, 0.1);

  fill(255);
  textSize(20);
  text("Score: " + floor(displayScore), 10, 30);
}
```

---

## Timers and Spawning

Games need to track time for countdowns, cooldowns, and spawning.

### Frame-Based Timer

```js
let spawnInterval = 60; // Every 60 frames (about 1 second at 60fps)

function draw() {
  if (frameCount % spawnInterval === 0) {
    spawnEnemy();
  }
}
```

### Millisecond-Based Timer

More accurate and independent of frame rate:

```js
let lastSpawnTime = 0;
let spawnDelay = 2000; // 2 seconds

function draw() {
  let now = millis();
  if (now - lastSpawnTime > spawnDelay) {
    spawnEnemy();
    lastSpawnTime = now;
  }
}
```

---

## Complete Example: Minimal Art Game

This is a small game with aesthetic ambitions -- somewhere between a game and interactive art.

```js
let player;
let targets = [];
let ripples = [];
let score = 0;
let state = "playing";

function setup() {
  createCanvas(600, 600);
  player = { x: width / 2, y: height / 2, size: 12 };

  // Spawn initial targets
  for (let i = 0; i < 8; i++) {
    spawnTarget();
  }
}

function draw() {
  background(10, 10, 20, 30); // Slight trail effect

  if (state === "playing") {
    updateGame();
  }

  drawRipples();
  drawTargets();
  drawPlayer();
  drawUI();
}

function updateGame() {
  // Smooth player movement toward mouse
  player.x = lerp(player.x, mouseX, 0.08);
  player.y = lerp(player.y, mouseY, 0.08);

  // Check for target collection
  for (let i = targets.length - 1; i >= 0; i--) {
    let t = targets[i];
    t.pulse += 0.05;

    if (dist(player.x, player.y, t.x, t.y) < player.size + t.size) {
      // Collected!
      score++;
      ripples.push({
        x: t.x, y: t.y,
        radius: 0,
        maxRadius: 100 + score * 5,
        hue: t.hue,
        alpha: 200
      });
      targets.splice(i, 1);
      spawnTarget();
    }
  }
}

function spawnTarget() {
  targets.push({
    x: random(40, width - 40),
    y: random(40, height - 40),
    size: random(8, 15),
    hue: random(360),
    pulse: random(TWO_PI)
  });
}

function drawPlayer() {
  // Glowing player
  noStroke();
  for (let i = 3; i > 0; i--) {
    fill(200, 230, 255, 30 * i);
    circle(player.x, player.y, player.size * (1 + i * 0.8));
  }
  fill(200, 230, 255);
  circle(player.x, player.y, player.size);
}

function drawTargets() {
  colorMode(HSB, 360, 100, 100, 100);
  for (let t of targets) {
    let pulseFactor = 1 + sin(t.pulse) * 0.2;
    let displaySize = t.size * pulseFactor;

    // Glow
    noStroke();
    fill(t.hue, 60, 80, 15);
    circle(t.x, t.y, displaySize * 4);
    fill(t.hue, 60, 80, 30);
    circle(t.x, t.y, displaySize * 2);

    // Core
    fill(t.hue, 70, 95);
    circle(t.x, t.y, displaySize);
  }
  colorMode(RGB, 255);
}

function drawRipples() {
  colorMode(HSB, 360, 100, 100, 255);
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    r.radius += 3;
    r.alpha -= 3;

    noFill();
    stroke(r.hue, 60, 80, r.alpha);
    strokeWeight(2);
    circle(r.x, r.y, r.radius);

    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
  colorMode(RGB, 255);
}

function drawUI() {
  fill(200, 220, 255, 200);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text("collected: " + score, 15, 15);
}
```

---

## Design Principles for Art Games

1. **Constraint is creative.** Limiting mechanics to one or two actions forces you to make them meaningful. A game where you can only move and collect is more expressive than one with 20 buttons.

2. **Juice.** Small visual and audio responses to player actions make interactions feel satisfying. Screen shake, particle bursts, color flashes, easing animations -- these are "juice."

3. **Emergence over scripting.** Simple rules that interact to produce complex behavior are more interesting (and more like art) than heavily scripted sequences. This is the same principle behind cellular automata and agent systems.

4. **Let the player interpret.** Games do not need to explain everything. Abstract visuals and ambiguous mechanics invite the player to make their own meaning.

---

## Exercises

1. **Pong**: Implement a simple Pong game with two paddles (one controlled by the player, one by simple AI), a ball, and a score. Use state machines for title/play/gameover screens.

2. **Asteroids**: Create a simple asteroids-like game. A triangle ship in the center rotates with left/right arrows and thrusts forward with the up arrow. Asteroids drift across the screen. Add collision detection and scoring.

3. **Art Game**: Design a non-traditional game where the goal is aesthetic rather than competitive. Perhaps the player grows a garden, guides water through a landscape, or composes visual patterns. What makes it feel like a "game" versus an interactive sketch?

4. **Cellular Automata Game**: Build a game based on the Game of Life. The player places living cells, then presses play to see how they evolve. Score based on how many cells are alive after N generations.

---

## Further Reading and Inspiration

- Jason Rohrer, _Passage_: <http://hcsoftware.sourceforge.net/passage/>
- Ian Bogost, _How to Do Things with Videogames_
- Anna Anthropy, _Rise of the Videogame Zinesters_
- Sandspiel: <https://sandspiel.club>
- Explorable Explanations: <https://explorabl.es>
- _Art Game_ Wikipedia: <https://en.wikipedia.org/wiki/Art_game>
