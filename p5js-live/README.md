# p5.js Live Preview for VS Code

Edit `sketch.js` and see your changes in real-time inside VS Code.

## Setup (pick one method)

### Method 1: Live Server (Recommended)

1. Install the **Live Server** extension in VS Code (by Ritwick Dey)
2. Right-click `index.html` in the file explorer -> **Open with Live Server**
3. The preview opens in your browser. To keep it inside VS Code:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run **Simple Browser: Show**
   - Paste the Live Server URL (usually `http://127.0.0.1:5500/p5js-live/index.html`)
4. Edit `sketch.js`, save, and the preview auto-reloads

### Method 2: Five Server

1. Install the **Five Server** extension (by Yannick)
2. Right-click `index.html` -> **Open with Five Server**
3. Same workflow as above

### Method 3: Node.js http-server

```bash
npx http-server p5js-live -p 8080 -c-1
```

Then open `http://localhost:8080` in Simple Browser inside VS Code.

## File Structure

```
p5js-live/
  index.html    <- Main HTML file (loads p5.js from CDN + your sketch)
  sketch.js     <- YOUR CODE GOES HERE - edit and save to see changes
```

## Adding Libraries

To add more p5.js libraries or other JS libraries, add `<script>` tags to `index.html` before the `sketch.js` line. Examples:

```html
<!-- math.js for complex numbers (fractals) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/13.2.0/math.min.js"></script>

<!-- ml5.js for machine learning / computer vision -->
<script src="https://unpkg.com/ml5@0.12.2/dist/ml5.min.js"></script>
```

## GLSL Shaders

To use GLSL shaders, create `.vert` and `.frag` files in this folder and load them in your sketch:

```js
let myShader;

function preload() {
  myShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  shader(myShader);
  myShader.setUniform('u_time', millis() / 1000.0);
  myShader.setUniform('u_resolution', [width, height]);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}
```

## Tips

- Use `WEBGL` as the third argument to `createCanvas()` for shader work
- Press any key to call `saveCanvas()` if you add a `keyPressed()` function
- `windowResized()` is already set up to handle browser resize
- p5.sound is included for audio-reactive sketches
