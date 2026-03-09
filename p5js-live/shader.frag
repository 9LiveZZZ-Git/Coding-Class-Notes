// Basic fragment shader template
// Modify this for GLSL experiments
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

varying vec2 vTexCoord;

void main() {
  // Normalized pixel coordinates (0 to 1)
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Simple gradient with time animation
  vec3 color = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(u_time));

  gl_FragColor = vec4(color, 1.0);
}
