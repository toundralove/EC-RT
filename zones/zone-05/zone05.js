(() => {
  const zone = document.querySelector(".bad-zone");
  const blurTable = document.getElementById("badBlurTable");
  const lens = document.getElementById("badLens");
  const lensTable = document.getElementById("badLensTable");

  if (!zone || !blurTable || !lens || !lensTable) return;

  const SCANS = [
    "./BAD-img/BAD_01.png",
    "./BAD-img/BAD_02.png",
    "./BAD-img/BAD_03.png",
  ];

  let zoom = 1;
  const minZoom = 1;
  const maxZoom = 3;

  let originX = 50;
  let originY = 50;

  let panX = 0;
  let panY = 0;

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;

  let lastTapTime = 0;

  let lensX = 0;
  let lensY = 0;

  let touchMode = null; // "lens" ou "pan"
  let touchStartX = 0;
  let touchStartY = 0;
  let touchPanStartX = 0;
  let touchPanStartY = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createPaper(src, data) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "bad-paper";

    img.style.left = `${data.x}%`;
    img.style.top = `${data.y}%`;
    img.style.zIndex = data.z;
    img.style.opacity = data.opacity;
    img.style.transform = `
      rotate(${data.rot}deg)
      scale(${data.scale})
    `;

    return img;
  }

  function createScene() {
    blurTable.innerHTML = "";
    lensTable.innerHTML = "";

    SCANS.forEach((src) => {
      const data = {
        x: rand(2, 62),
        y: rand(2, 58),
        rot: rand(-24, 24),
        scale: rand(1.0, 1.45),
        z: Math.floor(rand(1, 40)),
        opacity: rand(0.82, 0.98)
      };

      blurTable.appendChild(createPaper(src, data));
      lensTable.appendChild(createPaper(src, data));
    });

    applyZoom();
  }

  function applyZoom() {
    blurTable.style.transformOrigin = `${originX}% ${originY}%`;
    lensTable.style.transformOrigin = `${originX}% ${originY}%`;

    const transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

    blurTable.style.transform = transform;
    lensTable.style.transform = transform;
  }

  function updateOrigin(clientX, clientY) {
    const rect = zone.getBoundingClientRect();

    originX = ((clientX - rect.left) / rect.width) * 100;
    originY = ((clientY - rect.top) / rect.height) * 100;

    originX = clamp(originX, 0, 100);
    originY = clamp(originY, 0, 100);
  }

  function moveLens(clientX, clientY) {
    lensX = clientX;
    lensY = clientY;

    const zoneRect = zone.getBoundingClientRect();
    const lensSize = lens.offsetWidth;
    const radius = lensSize / 2;

    lens.style.left = `${clientX}px`;
    lens.style.top = `${clientY}px`;
    lens.style.opacity = "1";

    lensTable.style.width = `${zoneRect.width}px`;
    lensTable.style.height = `${zoneRect.height}px`;

    lensTable.style.left = `${zoneRect.left - clientX + radius}px`;
    lensTable.style.top = `${zoneRect.top - clientY + radius}px`;
  }

  function isInsideLens(clientX, clientY) {
    const dx = clientX - lensX;
    const dy = clientY - lensY;
    const r = lens.offsetWidth / 2;
    return Math.sqrt(dx * dx + dy * dy) <= r;
  }

  // DESKTOP — trackpad / souris
  zone.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      updateOrigin(e.clientX, e.clientY);

      if (e.ctrlKey) {
        const delta = -e.deltaY * 0.01;
        zoom = clamp(zoom + delta, minZoom, maxZoom);

        applyZoom();
        moveLens(e.clientX, e.clientY);
        return;
      }

      panX -= e.deltaX;
      panY -= e.deltaY;

      applyZoom();
      moveLens(e.clientX, e.clientY);
    },
    { passive: false }
  );

  zone.addEventListener("mousemove", (e) => {
    if (!isDragging) moveLens(e.clientX, e.clientY);
  });

  zone.addEventListener("mouseenter", (e) => {
    moveLens(e.clientX, e.clientY);
  });

  zone.addEventListener("mouseleave", () => {
    if (!isDragging && !isTouchDevice()) lens.style.opacity = "0";
  });

  zone.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;

    zone.classList.add("is-dragging");
    lens.style.opacity = "0";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    panX = panStartX + dx;
    panY = panStartY + dy;

    applyZoom();
  });

  window.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    isDragging = false;
    zone.classList.remove("is-dragging");

    moveLens(e.clientX, e.clientY);
  });

  // MOBILE / TABLET
  zone.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      const now = Date.now();
      const isDoubleTap = now - lastTapTime < 300;

      if (isDoubleTap) {
        updateOrigin(touch.clientX, touch.clientY);

        if (zoom > 1.2) {
          zoom = minZoom;
          panX = 0;
          panY = 0;
        } else {
          zoom = 2.4;
        }

        applyZoom();
        moveLens(lensX || touch.clientX, lensY || touch.clientY);

        lastTapTime = 0;
        return;
      }

      lastTapTime = now;

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchPanStartX = panX;
      touchPanStartY = panY;

      if (isInsideLens(touch.clientX, touch.clientY)) {
        touchMode = "lens";
      } else {
        touchMode = "pan";
      }

      lens.style.opacity = "1";
    },
    { passive: true }
  );

  zone.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      if (touchMode === "lens") {
        moveLens(touch.clientX, touch.clientY);
        return;
      }

      if (touchMode === "pan") {
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        panX = touchPanStartX + dx;
        panY = touchPanStartY + dy;

        applyZoom();
        moveLens(lensX, lensY);
      }
    },
    { passive: true }
  );

  zone.addEventListener(
    "touchend",
    () => {
      touchMode = null;
      lens.style.opacity = "1";
    },
    { passive: true }
  );

  function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  createScene();

  requestAnimationFrame(() => {
    const rect = zone.getBoundingClientRect();
    moveLens(rect.left + rect.width / 2, rect.top + rect.height / 2);
    if (!isTouchDevice()) lens.style.opacity = "0";
  });

  window.addEventListener("resize", () => {
    applyZoom();
    moveLens(lensX, lensY);
  });
})();