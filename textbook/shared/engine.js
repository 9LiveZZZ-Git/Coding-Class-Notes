/* ============================================================
   Computing Arts Interactive Textbook — Engine
   MAT 200C, UCSB

   Handles:
   - CodeMirror initialization
   - p5.js sketch runner (instance mode)
   - GLSL shader runner
   - Quiz engine (multiple choice, auto-graded)
   - Code challenge runner (test cases)
   - Progress tracking (localStorage)
   - Table of contents generation (scroll-spy)
   - Theme toggle (light/dark)
   - Chapter navigation
   ============================================================ */

(function () {
  'use strict';

  // ────────────────────────────────────────────
  // Configuration
  // ────────────────────────────────────────────
  const CHAPTER_ID = document.body.dataset.chapter || 'unknown';
  const STORAGE_KEY = 'mat200c-textbook';

  // ────────────────────────────────────────────
  // Progress Store
  // ────────────────────────────────────────────
  const store = {
    _data: null,

    load() {
      try {
        this._data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch {
        this._data = {};
      }
      if (!this._data[CHAPTER_ID]) {
        this._data[CHAPTER_ID] = { quizzes: {}, challenges: {}, visited: {} };
      }
      return this._data[CHAPTER_ID];
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      } catch { /* localStorage full or unavailable */ }
    },

    getChapter() {
      if (!this._data) this.load();
      return this._data[CHAPTER_ID];
    },

    setQuiz(id, correct) {
      this.getChapter().quizzes[id] = correct;
      this.save();
    },

    setChallenge(id, passed) {
      this.getChapter().challenges[id] = passed;
      this.save();
    },

    markVisited(sectionId) {
      this.getChapter().visited[sectionId] = true;
      this.save();
    },

    getProgress() {
      const ch = this.getChapter();
      const quizzes = document.querySelectorAll('.quiz[data-id]');
      const challenges = document.querySelectorAll('.code-challenge[data-id]');
      const total = quizzes.length + challenges.length;
      if (total === 0) return 100;
      let done = 0;
      quizzes.forEach(q => { if (ch.quizzes[q.dataset.id]) done++; });
      challenges.forEach(c => { if (ch.challenges[c.dataset.id]) done++; });
      return Math.round((done / total) * 100);
    },

    getAllProgress() {
      if (!this._data) this.load();
      const result = {};
      for (const key of Object.keys(this._data)) {
        const ch = this._data[key];
        const qCount = Object.keys(ch.quizzes || {}).length;
        const cCount = Object.keys(ch.challenges || {}).length;
        const qCorrect = Object.values(ch.quizzes || {}).filter(Boolean).length;
        const cPassed = Object.values(ch.challenges || {}).filter(Boolean).length;
        result[key] = { total: qCount + cCount, done: qCorrect + cPassed };
      }
      return result;
    }
  };

  // ────────────────────────────────────────────
  // CodeMirror Initialization
  // ────────────────────────────────────────────
  const editors = new Map(); // element → CodeMirror instance

  function initCodeMirror() {
    if (typeof CodeMirror === 'undefined') return;

    document.querySelectorAll('textarea.cm-editor').forEach(textarea => {
      const isReadOnly = textarea.hasAttribute('readonly');
      const mode = textarea.dataset.mode || 'javascript';
      const cm = CodeMirror.fromTextArea(textarea, {
        mode: mode === 'glsl' ? 'x-shader/x-fragment' : mode,
        theme: getTheme() === 'dark' ? 'material-darker' : 'one-light',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: !isReadOnly,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        readOnly: isReadOnly,
        viewportMargin: Infinity,
        lineWrapping: true
      });
      cm._originalValue = textarea.value;
      editors.set(textarea, cm);

      // Adjust height
      const container = textarea.closest('.code-runner, .code-challenge, .exercise');
      if (container) {
        const maxLines = parseInt(container.dataset.maxLines) || 30;
        const lineCount = cm.lineCount();
        if (lineCount > maxLines) {
          cm.setSize(null, maxLines * 1.55 + 'em');
        }
      }
    });
  }

  function updateCodeMirrorThemes() {
    const theme = getTheme() === 'dark' ? 'material-darker' : 'one-light';
    editors.forEach(cm => cm.setOption('theme', theme));
  }

  // ────────────────────────────────────────────
  // p5.js Runner
  // ────────────────────────────────────────────
  const activeP5Instances = new Map(); // container → p5 instance

  function runP5Sketch(container) {
    const textarea = container.querySelector('textarea.cm-editor');
    const cm = editors.get(textarea);
    if (!cm) return;

    const code = cm.getValue();
    const previewDiv = container.querySelector('.preview-container');
    const errorDiv = container.querySelector('.error-display');
    const consoleDiv = container.querySelector('.console-output');

    // Clear previous
    stopP5Sketch(container);
    if (errorDiv) { errorDiv.textContent = ''; errorDiv.classList.remove('visible'); }
    if (consoleDiv) { consoleDiv.innerHTML = ''; consoleDiv.classList.remove('visible'); }
    previewDiv.innerHTML = '';

    // Create canvas container
    const canvasHolder = document.createElement('div');
    canvasHolder.className = 'p5-canvas-holder';
    previewDiv.appendChild(canvasHolder);

    // Intercept console.log
    const logLines = [];
    const fakeConsole = {
      log: (...args) => {
        logLines.push({ type: 'log', text: args.map(String).join(' ') });
        updateConsole();
      },
      warn: (...args) => {
        logLines.push({ type: 'warn', text: args.map(String).join(' ') });
        updateConsole();
      },
      error: (...args) => {
        logLines.push({ type: 'error', text: args.map(String).join(' ') });
        updateConsole();
      }
    };

    function updateConsole() {
      if (!consoleDiv) return;
      consoleDiv.innerHTML = logLines.slice(-50).map(l =>
        `<div class="log-line ${l.type === 'error' ? 'log-error' : l.type === 'warn' ? 'log-warn' : ''}">${escapeHtml(l.text)}</div>`
      ).join('');
      consoleDiv.classList.add('visible');
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    try {
      // Wrap in p5 instance mode
      const sketch = function (p) {
        // Inject user code: we use Function constructor to create a scope
        // where p5 methods are available as globals via `with`
        const userFn = new Function('p', 'console', `
          with (p) {
            ${code}
            // Wire up lifecycle if defined
            if (typeof setup === 'function') p.setup = setup;
            if (typeof draw === 'function') p.draw = draw;
            if (typeof preload === 'function') p.preload = preload;
            if (typeof mousePressed === 'function') p.mousePressed = mousePressed;
            if (typeof mouseDragged === 'function') p.mouseDragged = mouseDragged;
            if (typeof mouseReleased === 'function') p.mouseReleased = mouseReleased;
            if (typeof mouseMoved === 'function') p.mouseMoved = mouseMoved;
            if (typeof keyPressed === 'function') p.keyPressed = keyPressed;
            if (typeof keyReleased === 'function') p.keyReleased = keyReleased;
            if (typeof keyTyped === 'function') p.keyTyped = keyTyped;
            if (typeof windowResized === 'function') p.windowResized = windowResized;
            if (typeof mouseWheel === 'function') p.mouseWheel = mouseWheel;
            if (typeof doubleClicked === 'function') p.doubleClicked = doubleClicked;
            if (typeof touchStarted === 'function') p.touchStarted = touchStarted;
            if (typeof touchMoved === 'function') p.touchMoved = touchMoved;
            if (typeof touchEnded === 'function') p.touchEnded = touchEnded;
          }
        `);
        userFn(p, fakeConsole);
      };

      const instance = new p5(sketch, canvasHolder);
      activeP5Instances.set(container, instance);

      // Show stop button, hide run button
      const runBtn = container.querySelector('.btn-run');
      const stopBtn = container.querySelector('.btn-stop');
      if (runBtn) runBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = '';

    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message;
        errorDiv.classList.add('visible');
      }
    }
  }

  function stopP5Sketch(container) {
    const instance = activeP5Instances.get(container);
    if (instance) {
      instance.remove();
      activeP5Instances.delete(container);
    }
    const runBtn = container.querySelector('.btn-run');
    const stopBtn = container.querySelector('.btn-stop');
    if (runBtn) runBtn.style.display = '';
    if (stopBtn) stopBtn.style.display = 'none';
  }

  function resetCode(container) {
    const textarea = container.querySelector('textarea.cm-editor');
    const cm = editors.get(textarea);
    if (cm && cm._originalValue !== undefined) {
      cm.setValue(cm._originalValue);
    }
    stopP5Sketch(container);
    const errorDiv = container.querySelector('.error-display');
    const consoleDiv = container.querySelector('.console-output');
    if (errorDiv) { errorDiv.textContent = ''; errorDiv.classList.remove('visible'); }
    if (consoleDiv) { consoleDiv.innerHTML = ''; consoleDiv.classList.remove('visible'); }
    const previewDiv = container.querySelector('.preview-container');
    if (previewDiv) previewDiv.innerHTML = '';
  }

  // ────────────────────────────────────────────
  // GLSL Shader Runner
  // ────────────────────────────────────────────
  const activeGLContexts = new Map();

  function runGLSL(container) {
    const textarea = container.querySelector('textarea.cm-editor');
    const cm = editors.get(textarea);
    if (!cm) return;

    const fragSource = cm.getValue();
    const previewDiv = container.querySelector('.preview-container');
    const errorDiv = container.querySelector('.error-display');

    // Clear previous
    stopGLSL(container);
    if (errorDiv) { errorDiv.textContent = ''; errorDiv.classList.remove('visible'); }
    previewDiv.innerHTML = '';

    const canvas = document.createElement('canvas');
    const width = parseInt(container.dataset.width) || 400;
    const height = parseInt(container.dataset.height) || 400;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    previewDiv.appendChild(canvas);

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      if (errorDiv) {
        errorDiv.textContent = 'WebGL not supported in this browser';
        errorDiv.classList.add('visible');
      }
      return;
    }

    // Default vertex shader
    const vertSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    // Compile shaders
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    }

    try {
      const vert = compileShader(gl.VERTEX_SHADER, vertSource);
      const frag = compileShader(gl.FRAGMENT_SHADER, fragSource);

      const program = gl.createProgram();
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
      }

      gl.useProgram(program);

      // Full-screen quad
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      const uResolution = gl.getUniformLocation(program, 'u_resolution');
      const uTime = gl.getUniformLocation(program, 'u_time');
      const uMouse = gl.getUniformLocation(program, 'u_mouse');

      let mouseX = 0, mouseY = 0;
      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = height - (e.clientY - rect.top);
      });

      const startTime = performance.now();
      let animId;

      function render() {
        const elapsed = (performance.now() - startTime) / 1000;
        gl.viewport(0, 0, width, height);
        if (uResolution) gl.uniform2f(uResolution, width, height);
        if (uTime) gl.uniform1f(uTime, elapsed);
        if (uMouse) gl.uniform2f(uMouse, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animId = requestAnimationFrame(render);
      }

      render();
      activeGLContexts.set(container, { gl, animId, canvas });

    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message;
        errorDiv.classList.add('visible');
      }
    }
  }

  function stopGLSL(container) {
    const ctx = activeGLContexts.get(container);
    if (ctx) {
      cancelAnimationFrame(ctx.animId);
      const ext = ctx.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      activeGLContexts.delete(container);
    }
  }

  // ────────────────────────────────────────────
  // Quiz Engine
  // ────────────────────────────────────────────
  function initQuizzes() {
    document.querySelectorAll('.quiz[data-id]').forEach(quiz => {
      const id = quiz.dataset.id;
      const checkBtn = quiz.querySelector('.btn-check');
      const options = quiz.querySelectorAll('.option');
      const explanation = quiz.querySelector('.explanation');
      const savedAnswer = store.getChapter().quizzes[id];

      // Restore saved state
      if (savedAnswer !== undefined) {
        restoreQuizState(quiz, savedAnswer);
        return;
      }

      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const selected = quiz.querySelector('input[type="radio"]:checked');
          if (!selected) return;

          const selectedOption = selected.closest('.option');
          const correctInput = quiz.querySelector('input[data-correct]');
          const correctOption = correctInput ? correctInput.closest('.option') : null;
          const isCorrect = selected.hasAttribute('data-correct');

          // Show results
          options.forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
            opt.querySelector('input').disabled = true;
          });

          if (correctOption) correctOption.classList.add('correct');
          if (!isCorrect) selectedOption.classList.add('incorrect');

          checkBtn.disabled = true;

          // Show result badge
          const resultSpan = document.createElement('span');
          resultSpan.className = `quiz-result ${isCorrect ? 'correct' : 'incorrect'}`;
          resultSpan.textContent = isCorrect ? 'Correct!' : 'Incorrect';
          checkBtn.parentNode.insertBefore(resultSpan, checkBtn.nextSibling);

          // Show explanation
          if (explanation) explanation.classList.add('visible');

          // Save
          store.setQuiz(id, isCorrect);
          updateProgressBar();
        });
      }
    });
  }

  function restoreQuizState(quiz, wasCorrect) {
    const options = quiz.querySelectorAll('.option');
    const checkBtn = quiz.querySelector('.btn-check');
    const explanation = quiz.querySelector('.explanation');
    const correctInput = quiz.querySelector('input[data-correct]');
    const correctOption = correctInput ? correctInput.closest('.option') : null;

    options.forEach(opt => {
      opt.querySelector('input').disabled = true;
    });
    if (correctOption) correctOption.classList.add('correct');
    if (checkBtn) {
      checkBtn.disabled = true;
      const resultSpan = document.createElement('span');
      resultSpan.className = `quiz-result ${wasCorrect ? 'correct' : 'incorrect'}`;
      resultSpan.textContent = wasCorrect ? 'Correct!' : 'Incorrect';
      checkBtn.parentNode.insertBefore(resultSpan, checkBtn.nextSibling);
    }
    if (explanation) explanation.classList.add('visible');
  }

  // ────────────────────────────────────────────
  // Code Challenge Runner
  // ────────────────────────────────────────────
  function initChallenges() {
    document.querySelectorAll('.code-challenge[data-id]').forEach(challenge => {
      const id = challenge.dataset.id;
      const submitBtn = challenge.querySelector('.btn-submit');
      const resultsDiv = challenge.querySelector('.test-results');
      const summaryDiv = challenge.querySelector('.test-summary');
      const textarea = challenge.querySelector('textarea.cm-editor');
      const testScript = challenge.querySelector('script.test-cases');
      let tests = [];

      try {
        tests = JSON.parse(testScript.textContent);
      } catch { return; }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const cm = editors.get(textarea);
          if (!cm) return;
          const code = cm.getValue();
          runTests(code, tests, resultsDiv, summaryDiv, id);
        });
      }
    });
  }

  function runTests(code, tests, resultsDiv, summaryDiv, challengeId) {
    let passed = 0;
    let html = '';

    for (const test of tests) {
      try {
        // Create a function from user code + test call
        const fn = new Function(code + '\nreturn ' + test.call + ';');
        const result = fn();
        const expected = test.expected;
        const ok = deepEqual(result, expected);

        if (ok) {
          passed++;
          html += `<div class="test-result-item test-pass">
            <span class="test-icon">&#10004;</span>
            <span><code>${escapeHtml(test.call)}</code> returned <code>${escapeHtml(JSON.stringify(result))}</code></span>
          </div>`;
        } else {
          html += `<div class="test-result-item test-fail">
            <span class="test-icon">&#10008;</span>
            <span><code>${escapeHtml(test.call)}</code> returned <code>${escapeHtml(JSON.stringify(result))}</code>, expected <code>${escapeHtml(JSON.stringify(expected))}</code></span>
          </div>`;
        }
      } catch (err) {
        html += `<div class="test-result-item test-fail">
          <span class="test-icon">&#10008;</span>
          <span><code>${escapeHtml(test.call)}</code> threw error: ${escapeHtml(err.message)}</span>
        </div>`;
      }
    }

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('visible');

    const allPass = passed === tests.length;
    if (summaryDiv) {
      summaryDiv.textContent = `${passed}/${tests.length} tests passed`;
      summaryDiv.className = 'test-summary ' + (allPass ? 'all-pass' : 'has-fail');
      summaryDiv.style.display = '';
    }

    store.setChallenge(challengeId, allPass);
    updateProgressBar();
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) < 0.0001; // float tolerance
    }
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEqual(v, b[i]));
    }
    if (typeof a === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(k => deepEqual(a[k], b[k]));
    }
    return false;
  }

  // ────────────────────────────────────────────
  // Table of Contents & Scroll Spy
  // ────────────────────────────────────────────
  function initTOC() {
    const tocList = document.querySelector('.toc-list');
    if (!tocList) return;

    const headings = document.querySelectorAll('.chapter-content h2, .chapter-content h3');
    headings.forEach((heading, i) => {
      if (!heading.id) heading.id = 'section-' + i;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      a.className = heading.tagName === 'H3' ? 'toc-h3' : '';
      a.addEventListener('click', e => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
        // Close mobile sidebar
        document.querySelector('.sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('visible');
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });

    // Scroll spy
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocList.querySelectorAll('a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
          store.markVisited(id);
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  // ────────────────────────────────────────────
  // Progress Bar
  // ────────────────────────────────────────────
  function updateProgressBar() {
    const fill = document.querySelector('.progress-bar-fill');
    const text = document.querySelector('.progress-text');
    if (!fill) return;

    const pct = store.getProgress();
    fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% complete';
  }

  // ────────────────────────────────────────────
  // Theme Toggle
  // ────────────────────────────────────────────
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function initTheme() {
    const saved = localStorage.getItem('mat200c-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      updateThemeButton(btn);
      btn.addEventListener('click', () => {
        const current = getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mat200c-theme', next);
        updateThemeButton(btn);
        updateCodeMirrorThemes();
      });
    }
  }

  function updateThemeButton(btn) {
    btn.textContent = getTheme() === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  // ────────────────────────────────────────────
  // Mobile Sidebar
  // ────────────────────────────────────────────
  function initMobileSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (hamburger && sidebar) {
      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('visible');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay.classList.remove('visible');
      });
    }
  }

  // ────────────────────────────────────────────
  // Scroll to Top
  // ────────────────────────────────────────────
  function initScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ────────────────────────────────────────────
  // Button Event Wiring
  // ────────────────────────────────────────────
  function initButtons() {
    // Run buttons
    document.querySelectorAll('.btn-run').forEach(btn => {
      btn.addEventListener('click', () => {
        const container = btn.closest('.code-runner, .exercise');
        if (!container) return;

        const mode = container.dataset.mode;
        if (mode === 'glsl') {
          runGLSL(container);
        } else {
          runP5Sketch(container);
        }
      });
    });

    // Stop buttons
    document.querySelectorAll('.btn-stop').forEach(btn => {
      btn.style.display = 'none';
      btn.addEventListener('click', () => {
        const container = btn.closest('.code-runner, .exercise');
        if (!container) return;

        const mode = container.dataset.mode;
        if (mode === 'glsl') {
          stopGLSL(container);
        } else {
          stopP5Sketch(container);
        }
      });
    });

    // Reset buttons
    document.querySelectorAll('.btn-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const container = btn.closest('.code-runner, .exercise');
        if (container) resetCode(container);
      });
    });
  }

  // ────────────────────────────────────────────
  // KaTeX Auto-Render
  // ────────────────────────────────────────────
  function initKaTeX() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // ────────────────────────────────────────────
  // Chapter End Quiz Score
  // ────────────────────────────────────────────
  function initChapterQuizScore() {
    const chapterQuiz = document.querySelector('.chapter-quiz');
    if (!chapterQuiz) return;

    const scoreBtn = chapterQuiz.querySelector('.btn-score');
    const scoreDiv = chapterQuiz.querySelector('.quiz-score');
    if (!scoreBtn || !scoreDiv) return;

    scoreBtn.addEventListener('click', () => {
      const quizzes = chapterQuiz.querySelectorAll('.quiz[data-id]');
      let total = quizzes.length;
      let correct = 0;

      quizzes.forEach(q => {
        const id = q.dataset.id;
        if (store.getChapter().quizzes[id] === true) correct++;
      });

      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      scoreDiv.textContent = `Score: ${correct}/${total} (${pct}%)`;
      scoreDiv.classList.add('visible');
      scoreDiv.className = 'quiz-score visible ' + (pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'needs-work');
    });
  }

  // ────────────────────────────────────────────
  // Utilities
  // ────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ────────────────────────────────────────────
  // Initialization
  // ────────────────────────────────────────────
  function init() {
    store.load();
    initTheme();
    initCodeMirror();
    initTOC();
    initButtons();
    initQuizzes();
    initChallenges();
    initMobileSidebar();
    initScrollTop();
    initKaTeX();
    initChapterQuizScore();
    updateProgressBar();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.TextbookEngine = { store, runP5Sketch, stopP5Sketch, runGLSL, stopGLSL };

})();
