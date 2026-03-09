# Tutorial: JavaScript Types, Strings, and Binary Data

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Why This Matters for Creative Coding

You might think data types are a dry computer science topic. But understanding types prevents confusing bugs, string manipulation lets you generate text art and parse data, and binary/typed arrays are essential for audio buffers, image processing, and communicating with hardware.

---

## JavaScript Primitive Types

JavaScript has seven primitive types. A primitive is a value that is not an object and has no methods of its own (though JavaScript wraps them temporarily when you call methods on them).

### `number`

JavaScript has only one number type. It handles both integers and floating-point decimals.

```js
let x = 42;         // Integer
let y = 3.14159;    // Floating point
let z = -0.001;     // Negative
let big = 1e6;      // Scientific notation: 1000000
let hex = 0xFF;     // Hexadecimal: 255
let binary = 0b1010; // Binary literal: 10

print(typeof x);    // "number"
print(typeof y);    // "number"
```

**Special number values:**

```js
print(Infinity);     // Division by zero: 1 / 0
print(-Infinity);    // Negative infinity
print(NaN);          // "Not a Number" -- result of invalid math
print(0.1 + 0.2);   // 0.30000000000000004 -- floating point imprecision!
```

The floating-point imprecision is important to understand. `0.1 + 0.2 !== 0.3` in JavaScript (and most languages). Never compare floating-point numbers with `===`. Instead, check if the difference is very small:

```js
// BAD
if (a === b) { ... }

// GOOD
if (abs(a - b) < 0.0001) { ... }
```

### `string`

Strings are sequences of characters. They can be created with single quotes, double quotes, or backticks.

```js
let s1 = 'hello';
let s2 = "hello";
let s3 = `hello`;    // Template literal (backtick)

print(typeof s1);    // "string"
```

### `boolean`

Either `true` or `false`.

```js
let isRunning = true;
let isPaused = false;

print(typeof isRunning); // "boolean"
```

### `undefined`

A variable that has been declared but not assigned a value is `undefined`.

```js
let x;
print(x);           // undefined
print(typeof x);    // "undefined"
```

### `null`

`null` means "intentionally empty." It is different from `undefined` (which means "not yet assigned").

```js
let selectedObject = null; // Nothing is selected
print(typeof null);        // "object" -- this is a famous JavaScript bug!
```

### `bigint`

For integers larger than `Number.MAX_SAFE_INTEGER` (2^53 - 1). Rarely needed in creative coding.

```js
let huge = 9007199254740993n; // Note the 'n' suffix
```

### `symbol`

Unique identifiers. Rarely used in creative coding.

```js
let id = Symbol("myId");
```

---

## Type Coercion: JavaScript's Dangerous Flexibility

JavaScript automatically converts between types in many situations. This is called **type coercion**, and it is a frequent source of bugs.

### String Concatenation vs. Addition

The `+` operator does addition for numbers but concatenation for strings. If one side is a string, the other is converted to a string.

```js
print(5 + 3);        // 8       (number + number = addition)
print("5" + 3);      // "53"    (string + number = concatenation!)
print(5 + "3");      // "53"    (number + string = concatenation!)
print("5" + "3");    // "53"    (string + string = concatenation)
print(5 + 3 + "px"); // "8px"   (left to right: 5+3=8, then 8+"px"="8px")
print("$" + 5 + 3);  // "$53"   ("$"+5="$5", then "$5"+3="$53")
```

### Loose Equality vs. Strict Equality

```js
print(5 == "5");     // true!  (loose equality -- coerces types)
print(5 === "5");    // false  (strict equality -- no coercion)
print(null == undefined);  // true
print(null === undefined); // false
```

**Always use `===` (strict equality) unless you have a specific reason not to.**

### Truthy and Falsy Values

In boolean contexts (like `if` statements), JavaScript treats some values as `false`:

```js
// These are all "falsy" -- they evaluate to false in an if statement:
if (false) {}
if (0) {}
if ("") {}        // Empty string
if (null) {}
if (undefined) {}
if (NaN) {}

// Everything else is "truthy", including:
if (true) {}
if (42) {}
if ("hello") {}
if ([]) {}        // Empty array -- truthy!
if ({}) {}        // Empty object -- truthy!
```

### Explicit Type Conversion

When you need to convert types, do it explicitly:

```js
// String to number
let n = Number("42");         // 42
let n2 = parseInt("42px");    // 42 (ignores non-numeric suffix)
let n3 = parseFloat("3.14");  // 3.14

// Number to string
let s = String(42);           // "42"
let s2 = (42).toString();     // "42"

// To boolean
let b = Boolean(0);           // false
let b2 = Boolean("hello");   // true
```

---

## String Manipulation

### String Properties and Methods

```js
let s = "Hello, World!";

print(s.length);           // 13
print(s[0]);               // "H"
print(s.charAt(7));        // "W"

// Searching
print(s.indexOf("World")); // 7
print(s.includes("World")); // true
print(s.startsWith("Hello")); // true
print(s.endsWith("!"));   // true

// Extracting
print(s.slice(0, 5));     // "Hello"
print(s.slice(7));         // "World!"
print(s.substring(7, 12)); // "World"

// Transforming (returns a NEW string -- strings are immutable)
print(s.toUpperCase());    // "HELLO, WORLD!"
print(s.toLowerCase());    // "hello, world!"
print(s.replace("World", "p5js")); // "Hello, p5js!"
print(s.trim());           // Removes leading/trailing whitespace

// Splitting
let parts = "red,green,blue".split(","); // ["red", "green", "blue"]
let words = "hello world".split(" ");    // ["hello", "world"]
let chars = "ABC".split("");             // ["A", "B", "C"]

// Joining (array method, but related)
let joined = ["red", "green", "blue"].join(" - "); // "red - green - blue"
```

### Template Literals (Backtick Strings)

Template literals use backticks and allow embedded expressions and multi-line strings.

```js
let name = "p5js";
let version = 1.9;

// Embedding expressions with ${}
let msg = `Hello ${name}, version ${version}!`;
// "Hello p5js, version 1.9!"

// Embedded calculations
let info = `Canvas: ${width}x${height}, FPS: ${frameRate().toFixed(1)}`;

// Multi-line strings
let poem = `Roses are red,
Violets are blue,
Creative coding
Is fun for you.`;

// Expression inside ${}
let result = `The answer is ${2 + 2}`;  // "The answer is 4"
```

### Creative Coding Use: Text Art

```js
function setup() {
  createCanvas(600, 400);
  textFont("monospace");
  noLoop();
}

function draw() {
  background(0);
  fill(0, 255, 0);
  textSize(10);

  let chars = " .:-=+*#%@";

  for (let y = 0; y < height; y += 10) {
    let line = "";
    for (let x = 0; x < width; x += 6) {
      let d = dist(x, y, width / 2, height / 2);
      let brightness = map(d, 0, 200, chars.length - 1, 0);
      brightness = constrain(floor(brightness), 0, chars.length - 1);
      line += chars[brightness];
    }
    text(line, 0, y);
  }
}
```

### Parsing CSV Data

```js
let csvData = `name,x,y,size
circle1,100,200,30
circle2,300,150,50
circle3,200,350,20`;

function setup() {
  createCanvas(400, 400);
  let lines = csvData.split("\n");
  let headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    let values = lines[i].split(",");
    let obj = {};
    headers.forEach((h, j) => obj[h] = values[j]);

    // Parse numbers
    let x = Number(obj.x);
    let y = Number(obj.y);
    let size = Number(obj.size);

    fill(100, 200, 255);
    noStroke();
    circle(x, y, size);

    fill(255);
    textAlign(CENTER);
    text(obj.name, x, y - size / 2 - 5);
  }
}
```

---

## Typed Arrays

Regular JavaScript arrays can hold any type of value: `[42, "hello", true, null]`. **Typed arrays** hold only one type of number, stored as raw binary data. They are used for:

- Audio buffers (WebAudio API)
- Image pixel data (`Uint8ClampedArray`)
- Communication with WebGL/shaders
- Binary file formats

### Common Typed Arrays

| Type | Bytes | Range | Use Case |
|---|---|---|---|
| `Uint8Array` | 1 | 0 to 255 | Pixel data, byte buffers |
| `Uint8ClampedArray` | 1 | 0 to 255 (clamped) | Canvas pixel data (this is what `pixels[]` actually is) |
| `Int8Array` | 1 | -128 to 127 | Signed bytes |
| `Uint16Array` | 2 | 0 to 65535 | Audio samples (16-bit) |
| `Int16Array` | 2 | -32768 to 32767 | Audio samples |
| `Float32Array` | 4 | ~1.2e-38 to ~3.4e38 | WebGL vertices, audio buffers |
| `Float64Array` | 8 | ~5e-324 to ~1.8e308 | High-precision math |

### Creating and Using Typed Arrays

```js
// Create with a size
let buffer = new Float32Array(256);

// Create from values
let data = new Uint8Array([255, 128, 0, 64]);

// Fill with values
buffer.fill(0);

// Access elements (just like regular arrays)
buffer[0] = 1.0;
buffer[1] = 0.5;
print(buffer[0]); // 1.0

// Length
print(buffer.length); // 256

// Iterate
for (let i = 0; i < buffer.length; i++) {
  buffer[i] = sin(i * 0.1);
}
```

### Clamping Behavior

`Uint8ClampedArray` (used by canvas pixel data) automatically clamps values to 0-255:

```js
let pixels = new Uint8ClampedArray(4);
pixels[0] = 300; // Stored as 255 (clamped)
pixels[1] = -50; // Stored as 0 (clamped)
print(pixels[0]); // 255
print(pixels[1]); // 0
```

Regular `Uint8Array` wraps around instead:

```js
let arr = new Uint8Array(2);
arr[0] = 300; // Stored as 44 (300 % 256)
arr[1] = -1;  // Stored as 255 (wraps around)
```

### Creative Coding Use: Audio Buffer

```js
// Generate a sine wave buffer
let sampleRate = 44100;
let frequency = 440; // A4
let duration = 1.0;
let numSamples = sampleRate * duration;

let audioBuffer = new Float32Array(numSamples);
for (let i = 0; i < numSamples; i++) {
  let t = i / sampleRate;
  audioBuffer[i] = sin(TWO_PI * frequency * t) * 0.5;
}

// audioBuffer can now be passed to the WebAudio API
```

---

## Bit Manipulation

Bit manipulation operates on the binary representation of numbers. This is rarely needed in everyday coding, but it appears in creative coding for hash functions, pixel packing, and certain algorithms.

### Bit Operators

| Operator | Name | Example | Result |
|---|---|---|---|
| `&` | AND | `5 & 3` | `1` |
| `\|` | OR | `5 \| 3` | `7` |
| `^` | XOR | `5 ^ 3` | `6` |
| `~` | NOT | `~5` | `-6` |
| `<<` | Left shift | `1 << 3` | `8` |
| `>>` | Right shift | `16 >> 2` | `4` |

### Understanding in Binary

```
5 in binary:  101
3 in binary:  011

5 & 3:        001  (AND: both bits must be 1)       = 1
5 | 3:        111  (OR: either bit can be 1)         = 7
5 ^ 3:        110  (XOR: exactly one bit must be 1)  = 6
```

### Practical Uses

**Extracting color channels from a packed integer:**

```js
// Some APIs pack RGBA into a single 32-bit integer
let packedColor = 0xFF3366AA; // RRGGBBAA

let r = (packedColor >> 24) & 0xFF;  // 255
let g = (packedColor >> 16) & 0xFF;  // 51
let b = (packedColor >> 8) & 0xFF;   // 102
let a = packedColor & 0xFF;           // 170
```

**Fast floor for positive numbers:**

```js
let floored = (3.7) | 0;  // 3  (bitwise OR with 0 truncates decimals)
```

**XOR patterns (generating visual textures):**

```js
function setup() {
  createCanvas(256, 256);
  pixelDensity(1);
  noLoop();
}

function draw() {
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;
      let val = (x ^ y) & 0xFF;
      pixels[i] = val;
      pixels[i + 1] = val;
      pixels[i + 2] = val;
      pixels[i + 3] = 255;
    }
  }
  updatePixels();
}
```

### Using Bits as Flags

Store multiple boolean values in a single number:

```js
const HAS_GRAVITY = 1;       // bit 0: 0001
const HAS_COLLISION = 2;     // bit 1: 0010
const IS_VISIBLE = 4;        // bit 2: 0100
const IS_INTERACTIVE = 8;    // bit 3: 1000

let flags = HAS_GRAVITY | IS_VISIBLE; // 0101 = 5

// Check if a flag is set
if (flags & HAS_GRAVITY) {
  // Apply gravity
}

// Set a flag
flags = flags | HAS_COLLISION; // 0111 = 7

// Clear a flag
flags = flags & ~IS_VISIBLE; // 0011 = 3

// Toggle a flag
flags = flags ^ HAS_GRAVITY; // 0010 = 2
```

---

## The `typeof` Operator

Use `typeof` to check a value's type at runtime:

```js
print(typeof 42);          // "number"
print(typeof "hello");     // "string"
print(typeof true);        // "boolean"
print(typeof undefined);   // "undefined"
print(typeof null);        // "object"  (historical bug!)
print(typeof [1, 2, 3]);   // "object"  (arrays are objects)
print(typeof {x: 1});      // "object"
print(typeof function(){}); // "function"

// To check for arrays specifically:
print(Array.isArray([1, 2, 3])); // true
print(Array.isArray({x: 1}));    // false
```

---

## Complete Example: Type-Aware Debug Display

```js
function setup() {
  createCanvas(500, 400);
  noLoop();
}

function draw() {
  background(30);

  let values = [
    42,
    3.14,
    "hello",
    true,
    null,
    undefined,
    [1, 2, 3],
    { x: 10, y: 20 },
    NaN,
    Infinity
  ];

  textFont("monospace");
  textSize(14);

  for (let i = 0; i < values.length; i++) {
    let y = 30 + i * 35;
    let v = values[i];
    let typeStr = typeof v;
    if (Array.isArray(v)) typeStr = "array";
    if (v === null) typeStr = "null";

    // Color by type
    let typeColors = {
      number: [100, 200, 255],
      string: [100, 255, 100],
      boolean: [255, 200, 100],
      null: [200, 200, 200],
      undefined: [150, 150, 150],
      array: [255, 150, 200],
      object: [200, 150, 255]
    };

    let col = typeColors[typeStr] || [255, 255, 255];
    fill(col);
    noStroke();
    text(`${typeStr}`, 10, y);
    fill(200);
    text(`${JSON.stringify(v)}`, 120, y);
  }
}
```

---

## Exercises

1. **Type Coercion Quiz**: Predict the output of each expression, then verify in the console:
   - `"5" - 3`
   - `"5" + 3`
   - `true + true`
   - `"" == false`
   - `[] + {}`

2. **String Art**: Use template literals and string methods to generate ASCII art patterns. For example, generate a triangle made of `*` characters and display it with `text()`.

3. **Binary Visualizer**: Create a sketch that takes a number from a slider (0-255) and displays its binary representation as 8 colored squares (filled = 1, empty = 0). Use bit operations to extract each bit.

4. **Typed Array Waveform**: Create a `Float32Array` of 512 values representing a waveform (sine, square, sawtooth, or triangle). Display the waveform on screen. Add a dropdown to switch between waveform types.

---

## Further Reading

- MDN: JavaScript data types: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures>
- MDN: Typed arrays: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays>
- MDN: Template literals: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals>
- MDN: Bitwise operators: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND>
