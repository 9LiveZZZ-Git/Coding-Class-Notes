// Basic vertex shader for p5.js WEBGL mode
precision highp float;

attribute vec3 aPosition;
varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  vTexCoord = (gl_Position.xy + 1.0) / 2.0;
}
