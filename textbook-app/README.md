# Computing Arts Textbook — Desktop App

A standalone Electron application for the **MAT 200C: Computing Arts** interactive textbook.

## Features

- All 15 chapters in one desktop app
- Interactive p5.js code editors with live preview
- GLSL shader runners
- Quizzes, code challenges, and exercises
- Progress tracking (saved locally)
- Dark/light theme toggle
- Keyboard shortcuts for chapter navigation (Ctrl+1 through Ctrl+9)

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Setup

**Windows:**
```
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual:**
```bash
# Copy textbook content
mkdir content
cp -r ../textbook/* content/

# Install dependencies
npm install

# Launch
npm start
```

## Building a Standalone Installer

```bash
# Windows (.exe installer)
npm run build-win

# macOS (.dmg)
npm run build-mac

# Linux (.AppImage)
npm run build-linux
```

Built files will appear in the `dist/` folder.

## Navigation

| Shortcut | Action |
|----------|--------|
| Ctrl+H | Go to Home (all chapters) |
| Ctrl+1-9 | Jump to Chapters 1-9 |
| F12 | Toggle Developer Tools |
| Ctrl+= / Ctrl+- | Zoom in / out |
| F11 | Toggle fullscreen |

## Note on Internet

The app loads fonts, KaTeX (math), CodeMirror (code editor), and p5.js from CDN URLs. An internet connection is required on first launch. After that, resources may be cached by the browser.
