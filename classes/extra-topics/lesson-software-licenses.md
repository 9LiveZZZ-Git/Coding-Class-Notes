# Lesson: Software Licenses and Copyright for Creative Coders

## MAT 200C: Computing Arts -- Supplementary Topic

---

## Why This Matters

Your final project requires you to choose a software license for your code and a Creative Commons license for your creative work. This is not just a bureaucratic checkbox -- it determines who can use your work, how, and under what conditions. As both a creator and a consumer of other people's code, you need to understand these concepts.

From the syllabus:

> If you "borrow" code from somewhere (like we all do), then it falls on you to know who wrote it and attribute the code to them. If the code has a license, research that license and adhere to it. Honor copyright if the code is copyrighted.

---

## What Is Copyright?

**Copyright** is automatic legal protection for creative works. The moment you write code, draw a picture, or compose music, you hold the copyright. You do not need to register it, put a copyright notice on it, or do anything special. It is automatic.

Copyright gives you, the creator, exclusive rights to:

- **Copy** the work
- **Distribute** the work
- **Create derivative works** (modified versions)
- **Display or perform** the work publicly

When someone uses your work without permission, that is **copyright infringement**. When someone presents your work as their own, that is **plagiarism** -- a related but distinct concept (plagiarism is an ethical violation; copyright infringement is a legal one).

### What Copyright Does NOT Protect

- **Ideas** -- you cannot copyright an idea, only its specific expression. "A program that draws fractals" is not copyrightable. Your specific fractal-drawing code is.
- **Facts** -- data itself is not copyrightable, but a particular arrangement or presentation of data may be.
- **Names and titles** -- "Schotter" as a title is not copyrightable.
- **Functional elements** -- the basic structure of a for loop or function is not copyrightable.

---

## What Is a Software License?

A **license** is the copyright holder's permission for others to use their work under specified conditions. Without a license, the default is "all rights reserved" -- nobody can legally copy, modify, or distribute your code.

When you publish code on GitHub without a license, it is technically copyrighted and nobody can use it (even though it is publicly visible). This is why choosing a license matters.

---

## Open Source Licenses

An **open source license** grants permission to use, study, modify, and distribute the code. Different licenses impose different conditions.

### MIT License

The **MIT License** is the simplest and most permissive popular license.

**What it says (paraphrased):**
- You can do anything with this code (use, copy, modify, distribute, sell)
- You must include the original copyright notice and the license text
- The software comes with no warranty

**What it means for you:**
- If you use MIT-licensed code, include the license and copyright notice somewhere in your project
- People who use your MIT-licensed code can do anything with it, including using it in proprietary software

**Who uses it:** p5.js, jQuery, React, and many other popular projects.

```
MIT License

Copyright (c) 2026 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED.
```

### GNU General Public License (GPL)

The **GPL** is a **copyleft** license. Copyleft means: if you use GPL code in your project, your entire project must also be GPL.

**What it says (paraphrased):**
- You can use, copy, modify, and distribute
- If you distribute a modified version, you must release your source code under the GPL
- You must include the license text

**What it means for you:**
- Using a small piece of GPL code in your project makes your entire project GPL
- This is intentional: the GPL is designed to keep code free and open forever
- Companies often avoid GPL code because it would force them to open-source their products

**Versions:** GPLv2 and GPLv3 are common. The LGPL (Lesser GPL) is a weaker version that allows linking without the copyleft requirement.

### Apache License 2.0

Similar to MIT but with an explicit patent grant and a requirement to document changes.

**Key differences from MIT:**
- Includes a patent license (protects users from patent claims by contributors)
- Requires you to note any files you changed
- More legally detailed

**Who uses it:** Android, TensorFlow, Apache web server.

### BSD Licenses

Very similar to MIT. The 2-clause BSD license is essentially identical to MIT. The 3-clause BSD adds a requirement: you cannot use the original author's name to endorse your derivative work.

---

## Creative Commons Licenses

**Creative Commons (CC)** licenses are designed for creative works (art, music, writing, images) rather than software. They are composed of four conditions that can be combined:

| Condition | Code | Meaning |
|---|---|---|
| Attribution | BY | You must credit the creator |
| ShareAlike | SA | Derivatives must use the same license |
| NonCommercial | NC | No commercial use |
| NoDerivatives | ND | No modifications allowed |

### Common Combinations

**CC BY** -- Attribution only. The most permissive CC license. Anyone can use, modify, and distribute your work (even commercially) as long as they credit you.

**CC BY-SA** -- Attribution + ShareAlike. Like CC BY, but derivatives must use the same license. This is the CC equivalent of copyleft. Wikipedia uses this.

**CC BY-NC** -- Attribution + NonCommercial. Free to use and modify, but not for commercial purposes.

**CC BY-NC-SA** -- Attribution + NonCommercial + ShareAlike. Free to use, modify, and share, but not commercially, and derivatives must use the same license.

**CC BY-ND** -- Attribution + NoDerivatives. Free to share (even commercially), but no modifications.

**CC BY-NC-ND** -- The most restrictive. Share only, with credit, no modifications, no commercial use.

**CC0** -- "No Rights Reserved." Waives all rights. Anyone can do anything with the work. This is essentially putting the work in the public domain.

### Choosing a CC License

The Creative Commons website has an interactive tool to help you choose: <https://creativecommons.org/choose/>

---

## Choosing a License for Your Project

For your MAT 200C final project, you need both:

1. A **software license** for your code
2. A **Creative Commons license** for your creative work (images, sounds, documentation)

### Quick Decision Guide

| Your Priority | Software License | CC License |
|---|---|---|
| Maximum openness | MIT | CC BY |
| Keep derivatives open | GPL | CC BY-SA |
| Prevent commercial exploitation | -- | CC BY-NC |
| Maximum control | No license (all rights reserved) | CC BY-NC-ND |
| "I don't care, just use it" | MIT | CC0 |

### For Most Students

A reasonable default for class projects is:

- **MIT License** for code (simple, permissive, widely understood)
- **CC BY** or **CC BY-SA** for creative work (allows sharing with credit)

If you want to prevent companies from using your art commercially while still sharing it freely:

- **MIT License** for code
- **CC BY-NC-SA** for creative work

---

## The Free Culture Movement

The **Free Culture** movement, articulated by Lawrence Lessig in his book _Free Culture_ (2004), argues that overly restrictive copyright laws stifle creativity, culture, and innovation. Key ideas:

- Culture has always been built on remixing, referencing, and building on the past
- Modern copyright law has expanded far beyond its original intent (originally 14 years, now life + 70 years)
- Digital technology makes sharing effortless, but current laws treat copying as a crime
- A balance is needed between protecting creators and enabling cultural participation

Creative Commons licenses were created as a practical response to this -- a way for creators to voluntarily share their work under terms they choose, rather than defaulting to "all rights reserved."

**Free Software** (as defined by the Free Software Foundation) focuses on four freedoms:
1. Freedom to **run** the program
2. Freedom to **study** how the program works
3. Freedom to **redistribute** copies
4. Freedom to **distribute modified versions**

The GPL was created to protect these freedoms through copyleft.

**Open Source** is a related but distinct movement that emphasizes practical benefits (better code quality, collaboration) over philosophical freedoms.

---

## How to Properly Attribute Code

When you use someone else's code, you need to attribute it. Here is how.

### In Your Source Code

```js
// This particle physics implementation is adapted from:
// Daniel Shiffman, "The Nature of Code" (2012)
// https://natureofcode.com
// Licensed under CC BY-NC 3.0

// This Perlin noise visualization is based on:
// https://editor.p5js.org/someuser/sketches/abc123
// Original author: Jane Doe
// Modified by: [Your Name], 2026

// This function was generated by Claude (Anthropic), 2026
// Prompt: "Write a function that computes the convex hull of a set of 2D points"
```

### In Your README or Documentation

```
## Credits and Attribution

- Particle physics engine adapted from Daniel Shiffman's "The Nature of Code"
  (CC BY-NC 3.0) https://natureofcode.com
- Sobel edge detection algorithm from Wikipedia (CC BY-SA 4.0)
- UI layout inspired by [Artist Name]'s project [Project Name]
- LLM-generated code: [specific sections] generated by Claude (Anthropic)
  with prompts documented in source comments

## License

Code: MIT License (see LICENSE file)
Creative work: CC BY-SA 4.0
```

### For LLM-Generated Code

From the syllabus:

> If you use a LLM to generate code, then you must say so. Clearly mark the code as "LLM-generated", include the name and version of the LLM. Include the prompts in the code as comments.

```js
// LLM-generated code below
// Model: Claude (Anthropic, 2026)
// Prompt: "Write a p5.js function that draws a recursive tree with
//          branching angle and depth as parameters"
function drawTree(x, y, len, angle, depth) {
  if (depth <= 0) return;
  let x2 = x + cos(angle) * len;
  let y2 = y + sin(angle) * len;
  line(x, y, x2, y2);
  drawTree(x2, y2, len * 0.7, angle - PI / 6, depth - 1);
  drawTree(x2, y2, len * 0.7, angle + PI / 6, depth - 1);
}
// End LLM-generated code
```

---

## Adding a License to Your Project

### Step 1: Create a LICENSE File

In your project repository, create a file called `LICENSE` (no extension) containing the full text of your chosen license. GitHub provides templates when you create a new repository.

### Step 2: Add a License Header to Your Code

At the top of your main source file:

```js
/*
 * [Project Name]
 * Copyright (c) 2026 [Your Name]
 * Licensed under the MIT License
 * See LICENSE file for details
 */
```

### Step 3: Add Creative Commons to Your Creative Work

For creative content (images, sounds, documentation), add a notice:

```
This work is licensed under a Creative Commons Attribution-ShareAlike 4.0
International License. https://creativecommons.org/licenses/by-sa/4.0/
```

---

## Common Mistakes

**"I found it on the internet, so it's free to use."** -- No. Everything on the internet is copyrighted by default. Only works with explicit licenses or public domain dedications are free to use.

**"I changed it enough that it's mine now."** -- This is a legal gray area. Substantial modification creates a "derivative work," but you still need permission (a license) to create derivatives.

**"It's for a school project, so fair use applies."** -- Fair use is a defense, not a right, and it is narrower than most people think. Educational use is one factor courts consider, but it does not automatically make all uses fair.

**Mixing incompatible licenses.** -- You cannot combine GPL code with proprietary code (or with code under some other licenses). Check compatibility before mixing.

---

## Quick Reference

| License | Permissions | Conditions | Restrictions |
|---|---|---|---|
| MIT | Use, modify, distribute, sell | Include license/copyright | None |
| GPL v3 | Use, modify, distribute | Source must be GPL, include license | Cannot be made proprietary |
| Apache 2.0 | Use, modify, distribute, patent use | Include license, state changes | None |
| CC BY | Use, modify, distribute, sell | Credit the creator | None |
| CC BY-SA | Use, modify, distribute, sell | Credit, share alike | Derivatives must be same license |
| CC BY-NC | Use, modify, distribute | Credit, non-commercial only | No commercial use |
| CC0 | Anything | None | None |

---

## Further Reading

- Choose an open source license: <https://choosealicense.com>
- Creative Commons license chooser: <https://creativecommons.org/choose/>
- Lawrence Lessig, _Free Culture_ (2004): <https://en.wikipedia.org/wiki/Free_Culture_(book)>
- The Open Source Initiative: <https://opensource.org/licenses>
- GNU License recommendations: <https://www.gnu.org/licenses/license-recommendations.html>
- p5.js license (LGPL): <https://github.com/processing/p5.js/blob/main/license.txt>
