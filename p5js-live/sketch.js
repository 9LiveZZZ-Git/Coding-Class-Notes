// p5.js Live Preview - Edit this file and save to see changes instantly!
// Use VS Code's "Live Server" extension or the built-in Simple Browser.
//
// Getting started:
//   1. Install "Live Server" extension in VS Code
//   2. Right-click index.html -> "Open with Live Server"
//   3. Edit this file, save, and the preview auto-reloads
//
// Alternatively, use VS Code's built-in preview:
//   1. Open the Command Palette (Ctrl+Shift+P)
//   2. Run "Simple Browser: Show"
//   3. Enter the URL from Live Server

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(30);
}

function draw() {
  // Draw a circle that follows the mouse
  fill(255, 100, 150, 40);
  noStroke();
  circle(mouseX, mouseY, 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
