window.Zone01Exploration = (() => {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("zoomImage");

  if (!viewer || !img) return null;

  const CONFIG = {
    minDepthToRecord: 0.18,
    stillDelay: 360,
    recordDelay: 1050,

    maxMemoryPoints: 36,

    recompositionStartDepth: 0.78,
    recompositionFullDepth: 0.28,
    returnMessageDepth: 0.34,

    memoryFadeDuration: 45000,
    messageDuration: 2200
  };

  let whisper = null;
  let localTrace = null;
  let recompositionLayer = null;

  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastMoveTime = performance.now();

  let currentDwell = 0;
  let lastRecordTime = 0;

  let messageText = "";
  let messageUntil = 0;
  let wasReturning = false;

  const memoryMarks = new Map();

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function distance(a, b, c, d) {
    return Math.hypot(a - c, b - d);
  }

  function showMessage(text, duration = CONFIG.messageDuration) {
    messageText = text;
    messageUntil = performance.now() + duration;
  }

  function updateMessage() {
    if (!whisper) return;

    const visible = performance.now() < messageUntil;
    whisper.textContent = visible ? messageText : "";
    whisper.classList.toggle("is-visible", visible);
  }

  function pointerToImage(cam) {
    return {
      x: clamp(
        0.5 + (cam.pointerX - cam.x) / (img.naturalWidth * cam.scale),
        0,
        1
      ),
      y: clamp(
        0.5 + (cam.pointerY - cam.y) / (img.naturalHeight * cam.scale),
        0,
        1
      )
    };
  }

  function imagePointToScreen(point, cam) {
    return {
      x: (point.x - 0.5) * img.naturalWidth * cam.scale + cam.x,
      y: (point.y - 0.5) * img.naturalHeight * cam.scale + cam.y
    };
  }

  function createInterface() {
    recompositionLayer = document.createElement("div");
    recompositionLayer.className = "memory-recomposition-layer";
    viewer.appendChild(recompositionLayer);

    localTrace = document.createElement("div");
    localTrace.className = "attention-local-trace";
    viewer.appendChild(localTrace);

    whisper = document.createElement("div");
    whisper.className = "archive-whisper";
    viewer.appendChild(whisper);
  }

  function trimMemoryIfNeeded() {
    const memories = window.Zone01Memory.all();

    if (memories.length <= CONFIG.maxMemoryPoints) return;

    const kept = memories.slice(memories.length - CONFIG.maxMemoryPoints);

    window.Zone01Memory.reset();

    kept.forEach(memory => {
      window.Zone01Memory.addPoint(memory);
    });
  }

  function registerAttention(point, dwellTime, depth) {
    const now = Date.now();

    const memory = {
      id: `m-${now}-${Math.floor(Math.random() * 99999)}`,

      x: point.x,
      y: point.y,

      dwellTime,
      strength: clamp(dwellTime / 2200, 0.22, 1),

      firstSeen: now,
      lastSeen: now,
      lastDepth: depth,
      zoomScale: depth,

      sizeSeed: 0.7 + Math.random() * 0.9,

      shapeA: 38 + Math.random() * 28,
      shapeB: 52 + Math.random() * 34,
      shapeC: 42 + Math.random() * 32,
      shapeD: 58 + Math.random() * 28,

      offsetX: (Math.random() - 0.5) * 18,
      offsetY: (Math.random() - 0.5) * 18
    };

    window.Zone01Memory.addPoint(memory);
    trimMemoryIfNeeded();

    rebuildRecomposition();
    updateMemoryCSS();

    showMessage("mémoire-image inscrite", 1500);
  }

  function updateMemoryCSS() {
    const memories = window.Zone01Memory.all();
    const totalStrength = memories.reduce((sum, m) => sum + m.strength, 0);
    const ratio = clamp(totalStrength / 7, 0, 1);

    viewer.style.setProperty("--memory", ratio.toFixed(3));
  }

  function updateStillness(cam) {
    const moved = distance(
      cam.pointerX,
      cam.pointerY,
      lastPointerX,
      lastPointerY
    );

    if (moved > 2.5) {
      lastMoveTime = performance.now();
      currentDwell = 0;
      lastPointerX = cam.pointerX;
      lastPointerY = cam.pointerY;
    }
  }

  function updateAttentionRecording(time, cam, dt) {
    const point = pointerToImage(cam);

    const canRecord =
      cam.depth >= CONFIG.minDepthToRecord &&
      performance.now() - lastMoveTime > CONFIG.stillDelay;

    if (canRecord) {
      currentDwell += dt;
    } else {
      currentDwell *= 0.86;
    }

    const dwellRatio = clamp(currentDwell / CONFIG.recordDelay, 0, 1);
    const screen = imagePointToScreen(point, cam);

    localTrace.style.transform = `
      translate(-50%, -50%)
      translate3d(${screen.x}px, ${screen.y}px, 0)
      scale(${0.7 + dwellRatio * 0.85 + cam.depth * 0.45})
    `;

    localTrace.style.opacity =
      canRecord ? 0.18 + dwellRatio * 0.76 : dwellRatio * 0.12;

    localTrace.style.setProperty("--dwell", dwellRatio.toFixed(3));

    if (dwellRatio >= 1 && time - lastRecordTime > 900) {
      registerAttention(point, currentDwell, cam.depth);

      currentDwell = 0;
      lastRecordTime = time;

      viewer.classList.add("archive-pulse");

      setTimeout(() => {
        viewer.classList.remove("archive-pulse");
      }, 750);
    }
  }

  function createMark(memory) {
    if (memoryMarks.has(memory.id)) return;

    const mark = document.createElement("div");
    mark.className = "memory-recomposition-mark";
    mark.dataset.memoryId = memory.id;

    const crop = img.cloneNode(true);
    crop.removeAttribute("id");
    crop.className = "memory-recomposition-crop";
    crop.setAttribute("aria-hidden", "true");
    crop.draggable = false;

    mark.appendChild(crop);
    recompositionLayer.appendChild(mark);

    memoryMarks.set(memory.id, {
      id: memory.id,
      el: mark,
      crop,
      phase: Math.random() * Math.PI * 2,
      screenX: 0,
      screenY: 0
    });
  }

  function rebuildRecomposition() {
    if (!recompositionLayer) return;

    const memories = window.Zone01Memory.all();

    memories.forEach(createMark);

    for (const [id, mark] of memoryMarks.entries()) {
      if (!memories.some(memory => memory.id === id)) {
        mark.el.remove();
        memoryMarks.delete(id);
      }
    }

    recompositionLayer
      .querySelectorAll(".memory-recomposition-line")
      .forEach(line => line.remove());
  }

  function returnVisibility(depth) {
    return (
      1 -
      smoothstep(
        CONFIG.recompositionFullDepth,
        CONFIG.recompositionStartDepth,
        depth
      )
    );
  }

  function updateRecomposition(cam, time) {
    const memories = window.Zone01Memory.all();
    const visible = returnVisibility(cam.depth);
    const active = memories.length > 0 && visible > 0.01;

    recompositionLayer.classList.toggle("is-visible", active);
    viewer.classList.toggle("is-return-blur", active);

    if (!active) return;

    const rect = viewer.getBoundingClientRect();

    memories.forEach((memory, index) => {
      const mark = memoryMarks.get(memory.id);
      if (!mark) return;

      const age = Date.now() - memory.lastSeen;
      const fade = clamp(1 - age / CONFIG.memoryFadeDuration, 0, 1);

      const baseX = rect.width * memory.x - rect.width / 2;
      const baseY = rect.height * memory.y - rect.height / 2;

      const strength = clamp(memory.strength, 0.18, 1);
      const dwellBoost = clamp(memory.dwellTime / 5000, 0, 1);

      const driftX =
        Math.sin(time * 0.00055 + mark.phase + index) * 7 * visible;

      const driftY =
        Math.cos(time * 0.00068 + mark.phase - index) * 6 * visible;

      const size =
        memory.sizeSeed *
        (0.42 + visible * 0.34 + strength * 0.26 + dwellBoost * 0.22);

      mark.screenX = baseX + driftX;
      mark.screenY = baseY + driftY;

      mark.el.style.transform = `
        translate(-50%, -50%)
        translate3d(${mark.screenX}px, ${mark.screenY}px, 0)
        scale(${size})
      `;

      mark.el.style.opacity =
        clamp((0.12 + visible * (0.55 + strength * 0.45)) * fade, 0, 0.78);

      mark.el.style.borderRadius = `
        ${memory.shapeA}% ${100 - memory.shapeA}%
        ${memory.shapeB}% ${100 - memory.shapeB}% /
        ${memory.shapeC}% ${100 - memory.shapeC}%
        ${memory.shapeD}% ${100 - memory.shapeD}%
      `;

      mark.el.style.setProperty("--strength", strength.toFixed(3));

      const cropZoom = 1.8 + memory.zoomScale * 7.5;

      mark.crop.style.transform = `
        translate(-50%, -50%)
        scale(${cropZoom})
      `;

      mark.crop.style.objectPosition = `
        ${clamp(memory.x * 100 + memory.offsetX, 0, 100)}%
        ${clamp(memory.y * 100 + memory.offsetY, 0, 100)}%
      `;
    });
  }

  function updateReturnMessage(cam) {
    const inReturn =
      cam.depth < CONFIG.returnMessageDepth &&
      window.Zone01Memory.count() > 0;

    if (inReturn && !wasReturning) {
      showMessage("les fragments regardés persistent", 1800);
    }

    wasReturning = inReturn;
  }

  function init() {
    createInterface();
    rebuildRecomposition();
    updateMemoryCSS();

    showMessage("zoomer, attendre, revenir", 3200);
  }

  let lastTime = 0;

  function update(time, cam) {
    const dt = lastTime ? Math.min(48, time - lastTime) : 16.666;
    lastTime = time;

    updateStillness(cam);
    updateAttentionRecording(time, cam, dt);
    updateRecomposition(cam, time);
    updateReturnMessage(cam);
    updateMessage();
  }

  return {
    init,
    update
  };
})();