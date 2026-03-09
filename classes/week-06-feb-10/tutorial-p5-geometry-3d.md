# Tutorial: Creating 3D Geometry in p5.js

**MAT 200C: Computing Arts -- Week 6, February 10**

---

## Overview

In this tutorial, we will learn how to create custom 3D geometry in p5.js using WEBGL mode and the `p5.Geometry` class. By the end, you will be able to build your own 3D shapes from scratch, apply lighting, and render parametric surfaces.

We will cover:

1. Switching to WEBGL mode and understanding the 3D coordinate system
2. Built-in 3D primitives (box, sphere, torus, etc.)
3. Lighting basics: ambient, directional, and point lights
4. Materials and surface appearance
5. The `p5.Geometry` class for custom meshes
6. Vertices, faces, and normals
7. Building a parametric surface from scratch

---

## Prerequisites

- Familiarity with p5.js basics (setup/draw, shapes, color)
- Access to the p5.js web editor: <https://editor.p5js.org>

---

## Step 1: Entering WEBGL Mode

By default, p5.js draws in 2D. To work in 3D, you pass `WEBGL` as the third argument to `createCanvas()`:

```js
function setup() {
  createCanvas(600, 600, WEBGL);
}

function draw() {
  background(20);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.013);
  box(100);
}
```

### The 3D Coordinate System

In WEBGL mode, the coordinate system changes:

- The **origin (0, 0, 0)** is at the **center** of the canvas (not the top-left corner as in 2D mode).
- The **x-axis** points right.
- The **y-axis** points **down** (same as 2D p5.js, but note this is the opposite convention from many 3D tools).
- The **z-axis** points **toward the viewer** (out of the screen).

This means if you call `translate(100, 0, 0)`, the object moves to the right. If you call `translate(0, 0, 100)`, it moves toward the camera.

---

## Step 2: Built-In 3D Primitives

p5.js provides several built-in 3D shapes:

```js
function setup() {
  createCanvas(600, 600, WEBGL);
}

function draw() {
  background(20);
  lights(); // shortcut that adds default ambient + directional light

  // A box (width, height, depth)
  push();
  translate(-200, -100, 0);
  fill(200, 80, 80);
  box(80);
  pop();

  // A sphere (radius, detailX, detailY)
  push();
  translate(0, -100, 0);
  fill(80, 200, 80);
  sphere(50, 24, 16);
  pop();

  // A torus (radius, tubeRadius, detailX, detailY)
  push();
  translate(200, -100, 0);
  fill(80, 80, 200);
  torus(40, 15, 24, 16);
  pop();

  // A cylinder (radius, height, detailX, detailY)
  push();
  translate(-100, 100, 0);
  fill(200, 200, 80);
  cylinder(40, 100, 24, 1);
  pop();

  // A cone (radius, height, detailX, detailY)
  push();
  translate(100, 100, 0);
  fill(200, 80, 200);
  cone(40, 100, 24, 1);
  pop();
}
```

Each primitive accepts optional `detailX` and `detailY` parameters that control how many subdivisions (triangles) are used to approximate the curved surface. Higher values produce smoother shapes but cost more to render.

---

## Step 3: Lighting

Without lighting, 3D shapes look flat. p5.js offers several light types.

### `ambientLight(r, g, b)`

Ambient light illuminates all surfaces equally regardless of their orientation. It simulates indirect, scattered light in an environment. On its own, it produces flat-looking results, but it prevents completely dark shadows.

```js
ambientLight(60, 60, 60);
```

### `directionalLight(r, g, b, x, y, z)`

A directional light shines in a specific direction, as if from an infinitely distant source like the sun. The `(x, y, z)` parameters define the direction the light travels, not its position.

```js
// Light shining from the upper-right, toward the lower-left
directionalLight(255, 255, 255, -1, 1, -1);
```

### `pointLight(r, g, b, x, y, z)`

A point light radiates in all directions from a specific position in space, like a light bulb.

```js
// A warm point light hovering above and to the right
pointLight(255, 200, 150, 200, -200, 200);
```

### `spotLight(r, g, b, x, y, z, dirX, dirY, dirZ, angle, concentration)`

A spotlight has both a position and a direction, forming a cone of light.

```js
spotLight(255, 255, 255, 0, -200, 200, 0, 1, -1, PI / 4, 10);
```

### Combining Lights

You can use multiple lights together. A common setup:

```js
function draw() {
  background(20);

  // Soft ambient fill
  ambientLight(40, 40, 50);

  // Main directional light (key light)
  directionalLight(220, 220, 255, -0.5, 1, -0.5);

  // Warm fill point light
  pointLight(150, 100, 50, 200, -100, 300);

  // Draw your geometry here...
}
```

---

## Step 4: Materials

Materials determine how surfaces respond to light.

### `ambientMaterial(r, g, b)`

Responds only to ambient light. Produces a flat, matte look.

```js
ambientMaterial(200, 100, 100);
sphere(50);
```

### `specularMaterial(r, g, b)`

Responds to all light types and produces shiny highlights.

```js
specularMaterial(200, 200, 255);
shininess(50); // controls the size of the specular highlight
sphere(50);
```

### `emissiveMaterial(r, g, b)`

The surface appears to glow with its own light (though it does not actually illuminate other objects).

```js
emissiveMaterial(0, 100, 200);
sphere(50);
```

### `normalMaterial()`

A debugging tool that colors each face based on its normal direction. Useful for inspecting custom geometry.

```js
normalMaterial();
sphere(50);
```

---

## Step 5: Understanding p5.Geometry

The `p5.Geometry` class is how p5.js internally represents all 3D meshes. When you call `sphere()` or `box()`, p5.js creates a `p5.Geometry` object behind the scenes. You can also create your own.

A 3D mesh is fundamentally made of:

1. **Vertices** -- points in 3D space (stored as `p5.Vector` objects).
2. **Faces** -- triangles connecting three vertices each (stored as arrays of three vertex indices).
3. **Normals** -- vectors perpendicular to the surface at each vertex, used for lighting calculations.
4. **UV coordinates** (optional) -- 2D coordinates that map a texture onto the surface.

### Creating a Simple p5.Geometry

Here is the basic pattern:

```js
let myShape;

function setup() {
  createCanvas(600, 600, WEBGL);

  // Create a new p5.Geometry
  myShape = new p5.Geometry(
    1,   // detailX (not used when building manually)
    1,   // detailY
    function() {
      // 'this' refers to the p5.Geometry being constructed.

      // Define vertices
      this.vertices.push(new p5.Vector(-50, -50, 0));  // vertex 0
      this.vertices.push(new p5.Vector( 50, -50, 0));  // vertex 1
      this.vertices.push(new p5.Vector( 50,  50, 0));  // vertex 2
      this.vertices.push(new p5.Vector(-50,  50, 0));  // vertex 3

      // Define faces (two triangles forming a quad)
      this.faces.push([0, 1, 2]);
      this.faces.push([0, 2, 3]);

      // Compute normals automatically
      this.computeNormals();
    }
  );
}

function draw() {
  background(20);
  ambientLight(60);
  directionalLight(255, 255, 255, -1, 1, -1);

  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.013);

  fill(200, 100, 100);
  noStroke();
  model(myShape);
}
```

Key points:

- The constructor callback function is where you populate `this.vertices` and `this.faces`.
- Vertices are `p5.Vector` objects representing 3D positions.
- Faces are arrays of three integers, each referencing an index in the `this.vertices` array.
- `this.computeNormals()` automatically calculates smooth normals for lighting.
- Use `model(myShape)` in `draw()` to render the geometry.

---

## Step 6: Building a Custom Shape -- An Icosahedron

An icosahedron is a 20-faced polyhedron. Let us build one from its mathematical definition.

```js
let ico;

function setup() {
  createCanvas(600, 600, WEBGL);

  ico = new p5.Geometry(1, 1, function() {
    // The golden ratio
    let phi = (1 + Math.sqrt(5)) / 2;
    let s = 60; // scale factor

    // 12 vertices of an icosahedron
    let verts = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ];

    for (let v of verts) {
      this.vertices.push(new p5.Vector(v[0] * s, v[1] * s, v[2] * s));
    }

    // 20 triangular faces (vertex indices)
    let faces = [
      [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
      [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
      [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
      [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
    ];

    for (let f of faces) {
      this.faces.push(f);
    }

    this.computeNormals();
  });
}

function draw() {
  background(20);
  ambientLight(60, 60, 70);
  directionalLight(240, 240, 255, -0.5, 1, -0.8);
  pointLight(255, 180, 100, 200, -200, 200);

  rotateX(frameCount * 0.005);
  rotateY(frameCount * 0.008);

  fill(100, 160, 220);
  noStroke();
  model(ico);
}
```

---

## Step 7: Parametric Surfaces

A parametric surface is a 3D shape defined by a function that takes two parameters (usually called `u` and `v`) and returns a 3D point `(x, y, z)`. This is an elegant way to generate complex curved surfaces.

### The Approach

1. Divide the `u` and `v` parameter ranges into a grid.
2. Evaluate the parametric function at each grid point to get a vertex.
3. Connect adjacent grid points into triangular faces.

### Example: A Torus Knot

A torus knot is a curve that winds around a torus shape. We can create a tubular surface around this curve.

```js
let torusKnot;

function setup() {
  createCanvas(600, 600, WEBGL);

  let p = 2; // winds around the torus p times
  let q = 3; // winds through the hole q times
  let R = 100; // major radius
  let r = 30;  // tube radius

  let stepsU = 200; // resolution along the knot
  let stepsV = 16;  // resolution around the tube

  torusKnot = new p5.Geometry(1, 1, function() {
    // Generate vertices
    for (let i = 0; i <= stepsU; i++) {
      let u = (i / stepsU) * TWO_PI * p;

      // Point on the torus knot curve
      let cx = cos(u / p) * (R + r * cos(u * q / p));
      let cy = sin(u / p) * (R + r * cos(u * q / p));
      let cz = r * sin(u * q / p);

      // We need a coordinate frame (tangent, normal, binormal) at this point
      // Approximate the tangent by finite difference
      let u2 = u + 0.01;
      let cx2 = cos(u2 / p) * (R + r * cos(u2 * q / p));
      let cy2 = sin(u2 / p) * (R + r * cos(u2 * q / p));
      let cz2 = r * sin(u2 * q / p);

      let tangent = createVector(cx2 - cx, cy2 - cy, cz2 - cz).normalize();

      // Create a normal and binormal using cross products
      let arbitrary = createVector(0, 1, 0);
      if (abs(tangent.dot(arbitrary)) > 0.9) {
        arbitrary = createVector(1, 0, 0);
      }
      let normal = p5.Vector.cross(tangent, arbitrary).normalize();
      let binormal = p5.Vector.cross(tangent, normal).normalize();

      for (let j = 0; j <= stepsV; j++) {
        let v = (j / stepsV) * TWO_PI;
        let tubeR = 8; // radius of the tube around the curve

        // Point on the tube surface
        let px = cx + tubeR * (cos(v) * normal.x + sin(v) * binormal.x);
        let py = cy + tubeR * (cos(v) * normal.y + sin(v) * binormal.y);
        let pz = cz + tubeR * (cos(v) * normal.z + sin(v) * binormal.z);

        this.vertices.push(new p5.Vector(px, py, pz));
      }
    }

    // Generate faces
    for (let i = 0; i < stepsU; i++) {
      for (let j = 0; j < stepsV; j++) {
        let a = i * (stepsV + 1) + j;
        let b = a + stepsV + 1;
        let c = b + 1;
        let d = a + 1;

        this.faces.push([a, b, d]);
        this.faces.push([b, c, d]);
      }
    }

    this.computeNormals();
  });
}

function draw() {
  background(15);
  ambientLight(40, 40, 50);
  directionalLight(220, 220, 255, -1, 0.5, -0.5);
  pointLight(255, 150, 80, 300, -200, 300);

  rotateX(frameCount * 0.003);
  rotateY(frameCount * 0.005);

  specularMaterial(180, 120, 220);
  shininess(30);
  noStroke();
  model(torusKnot);
}
```

---

## Step 8: A Simpler Parametric Surface -- A Wavy Sphere

Here is a more approachable parametric surface: a sphere with sinusoidal displacement.

```js
let wavySphere;

function setup() {
  createCanvas(600, 600, WEBGL);

  let detailU = 48;
  let detailV = 32;
  let baseRadius = 120;

  wavySphere = new p5.Geometry(1, 1, function() {
    // Generate vertices on a sphere with wavy displacement
    for (let i = 0; i <= detailU; i++) {
      let u = (i / detailU) * TWO_PI; // longitude (0 to 2*PI)

      for (let j = 0; j <= detailV; j++) {
        let v = (j / detailV) * PI; // latitude (0 to PI)

        // Displacement based on spherical harmonics-like pattern
        let displacement = sin(u * 5) * sin(v * 4) * 15;
        let r = baseRadius + displacement;

        // Spherical to Cartesian conversion
        let x = r * sin(v) * cos(u);
        let y = r * cos(v);
        let z = r * sin(v) * sin(u);

        this.vertices.push(new p5.Vector(x, y, z));

        // UV coordinates for potential texturing
        this.uvs.push([i / detailU, j / detailV]);
      }
    }

    // Generate faces from the grid
    for (let i = 0; i < detailU; i++) {
      for (let j = 0; j < detailV; j++) {
        let a = i * (detailV + 1) + j;
        let b = a + detailV + 1;
        let c = b + 1;
        let d = a + 1;

        this.faces.push([a, b, d]);
        this.faces.push([b, c, d]);
      }
    }

    this.computeNormals();
  });
}

function draw() {
  background(15);
  ambientLight(50, 40, 60);
  directionalLight(200, 200, 255, -1, 0.8, -0.5);
  pointLight(255, 180, 100, 250, -200, 250);

  rotateX(frameCount * 0.004);
  rotateY(frameCount * 0.007);

  specularMaterial(140, 200, 220);
  shininess(40);
  noStroke();
  model(wavySphere);
}
```

---

## Step 9: Animating Geometry

Since `p5.Geometry` is created once and then rendered with `model()`, it is efficient for static shapes. If you need to animate the geometry itself (not just rotate/translate it), you have two strategies:

### Strategy 1: Recreate the Geometry Each Frame

For simple geometry, you can rebuild it every frame. This is not efficient for complex meshes but works fine for low-poly shapes.

```js
function draw() {
  background(15);
  lights();

  let geo = new p5.Geometry(1, 1, function() {
    let time = frameCount * 0.02;
    for (let i = 0; i <= 30; i++) {
      for (let j = 0; j <= 30; j++) {
        let u = (i / 30) * TWO_PI;
        let v = (j / 30) * PI;
        let r = 100 + sin(u * 3 + time) * cos(v * 2 + time) * 20;
        let x = r * sin(v) * cos(u);
        let y = r * cos(v);
        let z = r * sin(v) * sin(u);
        this.vertices.push(new p5.Vector(x, y, z));
      }
    }
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        let a = i * 31 + j;
        let b = a + 31;
        this.faces.push([a, b, a + 1]);
        this.faces.push([b, b + 1, a + 1]);
      }
    }
    this.computeNormals();
  });

  rotateX(0.3);
  rotateY(frameCount * 0.005);
  fill(180, 100, 220);
  noStroke();
  model(geo);
}
```

### Strategy 2: Use `beginShape()` / `endShape()` for Dynamic Geometry

For meshes that change every frame, using immediate mode drawing can be more straightforward:

```js
function draw() {
  background(15);
  lights();
  noStroke();
  fill(100, 180, 220);

  rotateX(0.3);
  rotateY(frameCount * 0.005);

  let time = frameCount * 0.02;
  let res = 30;

  for (let i = 0; i < res; i++) {
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j <= res; j++) {
      for (let di = 0; di <= 1; di++) {
        let u = ((i + di) / res) * TWO_PI;
        let v = (j / res) * PI;
        let r = 100 + sin(u * 3 + time) * cos(v * 2 + time) * 20;
        let x = r * sin(v) * cos(u);
        let y = r * cos(v);
        let z = r * sin(v) * sin(u);
        vertex(x, y, z);
      }
    }
    endShape();
  }
}
```

---

## Complete Working Example: Interactive Parametric Surface

Here is a complete sketch that brings together everything from this tutorial. It generates a parametric surface that you can rotate with the mouse and morph with a slider.

```js
let mySurface;
let morphSlider;

function setup() {
  createCanvas(700, 700, WEBGL);
  morphSlider = createSlider(0, 100, 50);
  morphSlider.position(20, 20);
  morphSlider.style('width', '200px');

  buildSurface(morphSlider.value() / 100);
}

function buildSurface(morph) {
  let detU = 50;
  let detV = 30;

  mySurface = new p5.Geometry(1, 1, function() {
    for (let i = 0; i <= detU; i++) {
      let u = (i / detU) * TWO_PI;

      for (let j = 0; j <= detV; j++) {
        let v = (j / detV) * PI;

        // Blend between a sphere and a spiky shape
        let baseR = 120;
        let spikes = sin(u * 6) * sin(v * 5) * 40 * morph;
        let r = baseR + spikes;

        let x = r * sin(v) * cos(u);
        let y = r * cos(v);
        let z = r * sin(v) * sin(u);

        this.vertices.push(new p5.Vector(x, y, z));
        this.uvs.push([i / detU, j / detV]);
      }
    }

    for (let i = 0; i < detU; i++) {
      for (let j = 0; j < detV; j++) {
        let cols = detV + 1;
        let a = i * cols + j;
        let b = a + cols;
        let c = b + 1;
        let d = a + 1;

        this.faces.push([a, b, d]);
        this.faces.push([b, c, d]);
      }
    }

    this.computeNormals();
  });
}

function draw() {
  background(15, 15, 25);

  // Rebuild if slider changed
  buildSurface(morphSlider.value() / 100);

  // Lighting
  ambientLight(30, 30, 50);
  directionalLight(200, 200, 255, -0.5, 0.8, -0.5);
  pointLight(255, 180, 100, 300, -250, 300);

  // Mouse-driven rotation
  orbitControl();

  // Draw the surface
  specularMaterial(120, 180, 240);
  shininess(30);
  noStroke();
  model(mySurface);
}
```

**How to use:** Open the p5.js web editor, paste this code, and click Play. Drag the slider to morph the shape between a smooth sphere and a spiky organic form. Click and drag on the canvas to rotate, scroll to zoom.

---

## Summary

| Concept | Key Function / Class |
|---|---|
| Enable 3D | `createCanvas(w, h, WEBGL)` |
| Built-in shapes | `box()`, `sphere()`, `torus()`, `cylinder()`, `cone()` |
| Ambient light | `ambientLight(r, g, b)` |
| Directional light | `directionalLight(r, g, b, dx, dy, dz)` |
| Point light | `pointLight(r, g, b, x, y, z)` |
| Materials | `ambientMaterial()`, `specularMaterial()`, `normalMaterial()` |
| Custom geometry | `new p5.Geometry(detX, detY, callback)` |
| Render custom geometry | `model(geometryObject)` |
| Smooth normals | `geometry.computeNormals()` |
| Mouse 3D navigation | `orbitControl()` |

---

## Further Exploration

- Try different parametric equations: Klein bottle, Mobius strip, seashell spirals.
- Combine multiple `p5.Geometry` objects in a single scene.
- Apply textures using `texture()` with UV coordinates.
- Experiment with `shininess()` values and multiple colored lights.
- Look at the p5.js source code for `sphere()` to see how it builds its internal `p5.Geometry`.
