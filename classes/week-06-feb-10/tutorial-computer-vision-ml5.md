# Tutorial: Computer Vision with ml5.js and p5.js

**MAT 200C: Computing Arts -- Week 6, February 10**

---

## Overview

In this tutorial, we will use ml5.js -- a beginner-friendly machine learning library built on top of TensorFlow.js -- to add computer vision capabilities to our p5.js sketches. We will detect hands, faces, and body poses using a webcam and use the tracking data to drive interactive visuals.

We will cover:

1. What ml5.js is and how it works
2. Setting up ml5.js in the p5.js web editor
3. Hand pose detection -- tracking finger joints
4. Face mesh detection -- mapping facial landmarks
5. Body pose detection -- tracking skeletal joints
6. Drawing tracked points on screen
7. Using tracking data to control generative visuals
8. A complete interactive sketch

---

## Prerequisites

- Familiarity with p5.js basics (setup/draw, shapes, color)
- A computer with a webcam
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: What Is ml5.js?

**ml5.js** is a JavaScript library that provides access to pre-trained machine learning models through a simple, p5.js-friendly API. You do not need to understand the mathematics of neural networks or train your own models. The models have already been trained on large datasets and can recognize hands, faces, bodies, objects, and more right out of the box.

Under the hood, ml5.js uses **TensorFlow.js**, Google's machine learning library for JavaScript. ml5.js wraps TensorFlow.js in a much simpler API designed for creative coders and beginners.

Key features:

- **Hand Pose**: detects 21 keypoints on each hand (fingertips, knuckles, wrist)
- **Face Mesh**: detects 468 keypoints on the face (eyes, nose, mouth, jawline, forehead)
- **Body Pose**: detects 17 keypoints on the body (shoulders, elbows, wrists, hips, knees, ankles)
- **Image Classifier**: identifies objects in images
- **Sound Classifier**: recognizes spoken commands

All processing happens **in the browser** -- your webcam data never leaves your computer.

---

## Step 2: Setting Up ml5.js

### In the p5.js Web Editor

1. Open <https://editor.p5js.org>
2. Click the **`>`** arrow on the left side to expand the file panel
3. Open **`index.html`**
4. Add the ml5.js script tag inside the `<head>` section, below the p5.js script tag:

```html
<script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>
```

Your `index.html` head should look something like this:

```html
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.js"></script>
  <script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
</head>
```

**Important**: We are using ml5.js version 1.x. Earlier tutorials you may find online use version 0.x, which has a significantly different API. Make sure you are referencing version 1 documentation.

---

## Step 3: Webcam Setup

Before we can detect anything, we need to capture video from the webcam:

```js
let video;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // hide the default HTML video element
}

function draw() {
  // Draw the video feed to the canvas (mirrored)
  push();
  translate(width, 0);
  scale(-1, 1); // mirror horizontally so it feels natural
  image(video, 0, 0, width, height);
  pop();
}
```

The `video.hide()` call hides the raw HTML `<video>` element that `createCapture()` creates. We draw the video manually in `draw()` so we can mirror it and overlay graphics on top.

---

## Step 4: Hand Pose Detection

Hand pose detection tracks 21 keypoints on each hand: the wrist, each knuckle, and each fingertip.

### Setting Up the Hand Pose Model

```js
let video;
let handPose;
let hands = [];

function preload() {
  // Load the hand pose model before setup runs
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting hands in the video
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  // This callback fires every time new hand data is available
  hands = results;
}

function draw() {
  // Draw mirrored video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Draw hand keypoints
  for (let hand of hands) {
    for (let keypoint of hand.keypoints) {
      // Mirror the x coordinate to match the flipped video
      let x = width - keypoint.x;
      let y = keypoint.y;

      fill(0, 255, 0);
      noStroke();
      circle(x, y, 10);
    }
  }
}
```

### Understanding Hand Keypoints

Each hand object contains a `keypoints` array with 21 points. The points are indexed as follows:

| Index | Keypoint |
|-------|----------|
| 0 | Wrist |
| 1-4 | Thumb (CMC, MCP, IP, Tip) |
| 5-8 | Index finger (MCP, PIP, DIP, Tip) |
| 9-12 | Middle finger (MCP, PIP, DIP, Tip) |
| 13-16 | Ring finger (MCP, PIP, DIP, Tip) |
| 17-20 | Pinky (MCP, PIP, DIP, Tip) |

Each keypoint has `.x`, `.y`, and `.z` properties (z is depth, useful for 3D effects).

### Drawing Finger Connections

```js
function drawHandSkeleton(hand) {
  let kp = hand.keypoints;

  // Define finger connections
  let fingers = [
    [0, 1, 2, 3, 4],       // thumb
    [0, 5, 6, 7, 8],       // index
    [0, 9, 10, 11, 12],    // middle
    [0, 13, 14, 15, 16],   // ring
    [0, 17, 18, 19, 20]    // pinky
  ];

  stroke(0, 255, 0);
  strokeWeight(2);
  noFill();

  for (let finger of fingers) {
    beginShape();
    for (let idx of finger) {
      let x = width - kp[idx].x;
      let y = kp[idx].y;
      vertex(x, y);
    }
    endShape();
  }
}
```

---

## Step 5: Face Mesh Detection

Face mesh tracks 468 points across the face, giving you detailed contours of every facial feature.

```js
let video;
let faceMesh;
let faces = [];

function preload() {
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // Draw mirrored video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Draw face keypoints
  for (let face of faces) {
    for (let keypoint of face.keypoints) {
      let x = width - keypoint.x;
      let y = keypoint.y;

      fill(0, 255, 255);
      noStroke();
      circle(x, y, 3);
    }
  }
}
```

### Useful Face Landmark Indices

With 468 points, it helps to know which indices correspond to which features:

| Feature | Approximate Index Range | Key Indices |
|---------|------------------------|-------------|
| Left eye | 33, 133, 159, 145 | Various around the eye contour |
| Right eye | 362, 263, 386, 374 | Various around the eye contour |
| Nose tip | 1 | Single point at the nose tip |
| Upper lip | 13 | Center of upper lip |
| Lower lip | 14 | Center of lower lip |
| Left ear | 234 | Left ear tragion |
| Right ear | 454 | Right ear tragion |

### Measuring Facial Features

You can compute distances between keypoints to measure facial expressions:

```js
function getMouthOpenness(face) {
  let upperLip = face.keypoints[13];
  let lowerLip = face.keypoints[14];
  let mouthDist = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);

  // Normalize by face size (distance between ears)
  let leftEar = face.keypoints[234];
  let rightEar = face.keypoints[454];
  let faceWidth = dist(leftEar.x, leftEar.y, rightEar.x, rightEar.y);

  return mouthDist / faceWidth; // returns ~0.0 (closed) to ~0.3 (wide open)
}
```

---

## Step 6: Body Pose Detection

Body pose (also called pose estimation) tracks 17 keypoints across the full body.

```js
let video;
let bodyPose;
let poses = [];

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose.detectStart(video, gotPoses);
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  // Draw mirrored video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  for (let pose of poses) {
    // Draw keypoints
    for (let keypoint of pose.keypoints) {
      if (keypoint.confidence > 0.3) { // only draw confident detections
        let x = width - keypoint.x;
        let y = keypoint.y;

        fill(255, 0, 100);
        noStroke();
        circle(x, y, 12);

        // Label the keypoint
        fill(255);
        textSize(10);
        textAlign(CENTER);
        text(keypoint.name, x, y - 10);
      }
    }

    // Draw skeleton connections
    let connections = bodyPose.getSkeleton(pose);
    for (let connection of connections) {
      let pointA = connection[0];
      let pointB = connection[1];
      if (pointA.confidence > 0.3 && pointB.confidence > 0.3) {
        stroke(255, 0, 100);
        strokeWeight(2);
        line(
          width - pointA.x, pointA.y,
          width - pointB.x, pointB.y
        );
      }
    }
  }
}
```

### Body Pose Keypoints

| Index | Name |
|-------|------|
| 0 | nose |
| 1 | left_eye |
| 2 | right_eye |
| 3 | left_ear |
| 4 | right_ear |
| 5 | left_shoulder |
| 6 | right_shoulder |
| 7 | left_elbow |
| 8 | right_elbow |
| 9 | left_wrist |
| 10 | right_wrist |
| 11 | left_hip |
| 12 | right_hip |
| 13 | left_knee |
| 14 | right_knee |
| 15 | left_ankle |
| 16 | right_ankle |

Each keypoint has a `.confidence` property (0 to 1) indicating how sure the model is about that detection. Always check confidence before using a keypoint.

---

## Step 7: Using Tracking Data to Control Visuals

The real creative power comes from using the tracking data to drive generative visuals. Here are several approaches.

### Approach 1: Hand-Controlled Particle Emitter

```js
let particles = [];

function draw() {
  background(0, 30);

  // Draw mirrored video at reduced opacity
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 60);
  image(video, 0, 0, width, height);
  pop();
  noTint();

  // Emit particles from fingertips
  for (let hand of hands) {
    let fingertips = [4, 8, 12, 16, 20]; // tip indices
    for (let idx of fingertips) {
      let kp = hand.keypoints[idx];
      let x = width - kp.x;
      let y = kp.y;

      for (let i = 0; i < 3; i++) {
        particles.push({
          x: x,
          y: y,
          vx: random(-2, 2),
          vy: random(-3, 0),
          life: 255,
          hue: (frameCount + idx * 50) % 360,
          size: random(3, 8)
        });
      }
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05; // gravity
    p.life -= 3;
    p.size *= 0.99;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    noStroke();
    fill(p.hue, 80, 100, p.life / 255);
    circle(p.x, p.y, p.size);
  }
}
```

### Approach 2: Face-Driven Abstract Portrait

```js
function draw() {
  background(0, 20);

  for (let face of faces) {
    let kp = face.keypoints;

    // Draw connecting lines between random pairs of face points
    for (let i = 0; i < 20; i++) {
      let a = kp[floor(random(kp.length))];
      let b = kp[floor(random(kp.length))];

      let ax = width - a.x;
      let ay = a.y;
      let bx = width - b.x;
      let by = b.y;

      let d = dist(ax, ay, bx, by);
      if (d < 80) { // only connect nearby points
        stroke(
          map(ax, 0, width, 100, 255),
          map(ay, 0, height, 100, 255),
          200,
          map(d, 0, 80, 150, 20)
        );
        strokeWeight(map(d, 0, 80, 2, 0.3));
        line(ax, ay, bx, by);
      }
    }
  }
}
```

### Approach 3: Body Pose to Sound Visualization Mapping

```js
function draw() {
  background(20);

  for (let pose of poses) {
    let kp = pose.keypoints;

    // Use arm angle to control a visual parameter
    let leftShoulder = kp[5];
    let leftElbow = kp[7];
    let leftWrist = kp[9];

    if (leftShoulder.confidence > 0.3 &&
        leftElbow.confidence > 0.3 &&
        leftWrist.confidence > 0.3) {

      // Calculate angle of left forearm
      let armAngle = atan2(
        leftWrist.y - leftElbow.y,
        leftWrist.x - leftElbow.x
      );

      // Use the angle to control rotation of a shape
      push();
      translate(width / 2, height / 2);
      rotate(armAngle);
      noFill();
      stroke(200, 100, 255);
      strokeWeight(2);
      for (let i = 0; i < 12; i++) {
        rotate(TWO_PI / 12);
        let r = map(sin(frameCount * 0.02 + i * 0.5), -1, 1, 50, 200);
        ellipse(r, 0, 30, 60);
      }
      pop();
    }
  }
}
```

---

## Step 8: Complete Working Example -- Interactive Hand Art

Here is a complete sketch that combines hand tracking with generative visuals. Each fingertip leaves a colorful trail, and pinching your thumb and index finger together changes the drawing mode.

```js
let video;
let handPose;
let hands = [];
let trailCanvas;

function preload() {
  handPose = ml5.handPose({ maxHands: 2 });
}

function setup() {
  createCanvas(640, 480);
  colorMode(HSB, 360, 100, 100, 100);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  trailCanvas = createGraphics(640, 480);
  trailCanvas.colorMode(HSB, 360, 100, 100, 100);
  trailCanvas.background(0, 0, 10);

  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // Slowly fade the trail canvas
  trailCanvas.noStroke();
  trailCanvas.fill(0, 0, 10, 2);
  trailCanvas.rect(0, 0, width, height);

  for (let hand of hands) {
    let kp = hand.keypoints;

    // Check for pinch gesture (thumb tip close to index tip)
    let thumbTip = kp[4];
    let indexTip = kp[8];
    let pinchDist = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);
    let isPinching = pinchDist < 30;

    // Draw from each fingertip
    let fingertips = [4, 8, 12, 16, 20];

    for (let f = 0; f < fingertips.length; f++) {
      let tip = kp[fingertips[f]];
      let x = width - tip.x; // mirror
      let y = tip.y;

      let hue = (f * 72 + frameCount) % 360;
      let brushSize = isPinching ? 20 : 6;

      if (isPinching) {
        // Pinch mode: draw connected lines between all fingertips
        for (let g = f + 1; g < fingertips.length; g++) {
          let tip2 = kp[fingertips[g]];
          let x2 = width - tip2.x;
          let y2 = tip2.y;

          trailCanvas.stroke(hue, 70, 90, 40);
          trailCanvas.strokeWeight(2);
          trailCanvas.line(x, y, x2, y2);
        }
      }

      // Always draw dots at fingertips
      trailCanvas.noStroke();
      trailCanvas.fill(hue, 80, 95, 60);
      trailCanvas.circle(x, y, brushSize);

      // Add a glow effect
      trailCanvas.fill(hue, 60, 100, 15);
      trailCanvas.circle(x, y, brushSize * 3);
    }

    // Draw wrist indicator
    let wrist = kp[0];
    let wx = width - wrist.x;
    let wy = wrist.y;
    trailCanvas.noFill();
    trailCanvas.stroke(0, 0, 80, 30);
    trailCanvas.strokeWeight(1);
    trailCanvas.circle(wx, wy, 30);
  }

  // Draw video at low opacity as background reference
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(0, 0, 100, 20); // very faint video
  image(video, 0, 0, width, height);
  pop();

  // Draw the trail canvas on top
  image(trailCanvas, 0, 0);

  // Instructions
  fill(0, 0, 100, 80);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("Move your hands to draw. Pinch to change mode.", 10, 10);
}
```

**How to use:**

1. Open the p5.js web editor
2. Add the ml5.js script tag to `index.html` (see Step 2)
3. Paste this code into `sketch.js`
4. Click Play and allow webcam access
5. Move your hands in front of the camera to draw
6. Pinch your thumb and index finger together to switch to connected-line mode

---

## Troubleshooting

### "ml5 is not defined"

You forgot to add the ml5.js script tag to `index.html`, or the URL is incorrect.

### Model takes a long time to load

The first time you use a model, it downloads the neural network weights (several MB). Subsequent runs use cached data. You can add a loading indicator:

```js
let modelReady = false;

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  // ... setup code ...
  handPose.detectStart(video, (results) => {
    modelReady = true;
    hands = results;
  });
}

function draw() {
  if (!modelReady) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Loading model...", width / 2, height / 2);
    return;
  }
  // ... rest of draw
}
```

### Low frame rate

ml5.js models are computationally expensive. Tips:

- Use a smaller video resolution: `video.size(320, 240)`
- Reduce the canvas size
- Limit the number of hands/poses detected: `ml5.handPose({ maxHands: 1 })`

### Webcam permission denied

Check your browser settings. In Chrome, click the camera icon in the address bar to manage permissions.

---

## Summary

| Concept | Key Function |
|---|---|
| Load ml5 model | `ml5.handPose()`, `ml5.faceMesh()`, `ml5.bodyPose()` |
| Start detection | `model.detectStart(video, callback)` |
| Access keypoints | `result.keypoints[index]` with `.x`, `.y`, `.z` |
| Confidence check | `keypoint.confidence > 0.3` |
| Mirror x coordinate | `x = width - keypoint.x` |
| Webcam capture | `createCapture(VIDEO)` |
| Hide HTML video | `video.hide()` |

---

## Further Exploration

- Use hand distance (z-axis) to control the size of drawn elements, creating a sense of depth.
- Combine face mesh with body pose for a full-body interactive installation.
- Use the detected hand gesture to trigger different generative art algorithms.
- Record the tracking data over time and play it back as an animation.
- Explore ml5.js image classification to create sketches that respond to objects shown to the camera.
