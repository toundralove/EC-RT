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

  let lastTapTime = 0;
  let touchMoved = false;

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

    blurTable.style.transform = `scale(${zoom})`;
    lensTable.style.transform = `scale(${zoom})`;
  }

  function updateOrigin(clientX, clientY) {
    const rect = zone.getBoundingClientRect();

    originX = ((clientX - rect.left) / rect.width) * 100;
    originY = ((clientY - rect.top) / rect.height) * 100;

    originX = clamp(originX, 0, 100);
    originY = clamp(originY, 0, 100);
  }

  function moveLens(clientX, clientY) {
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

  // ========================
  // DESKTOP (molette / zoom)
  // ========================
  zone.addEventListener(
    "wheel",
    (e) => {
      const isZoomIntent =
        e.ctrlKey ||
        Math.abs(e.deltaY) < 50;

      if (!isZoomIntent) return;

      e.preventDefault();

      updateOrigin(e.clientX, e.clientY);

      const delta = -e.deltaY * 0.0012;
      zoom = clamp(zoom + delta, minZoom, maxZoom);

      applyZoom();
      moveLens(e.clientX, e.clientY);
    },
    { passive: false }
  );

  zone.addEventListener("mousemove", (e) => {
    moveLens(e.clientX, e.clientY);
  });

  zone.addEventListener("mouseenter", (e) => {
    moveLens(e.clientX, e.clientY);
  });

  zone.addEventListener("mouseleave", () => {
    lens.style.opacity = "0";
  });

  // ========================
  // MOBILE / TABLET
  // ========================
  zone.addEventListener(
    "touchstart",
    () => {
      touchMoved = false;
    },
    { passive: true }
  );

  zone.addEventListener(
    "touchmove",
    () => {
      touchMoved = true;
      lens.style.opacity = "0"; // coupe la loupe pendant scroll
    },
    { passive: true }
  );

  zone.addEventListener(
    "touchend",
    (e) => {
      if (touchMoved) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const now = Date.now();
      const isDoubleTap = now - lastTapTime < 300;

      // ===== DOUBLE TAP → ZOOM =====
      if (isDoubleTap) {
        updateOrigin(touch.clientX, touch.clientY);

        zoom = zoom > 1.05 ? 1 : 2.2;

        applyZoom();
        moveLens(touch.clientX, touch.clientY);

        lens.style.opacity = "0";
        lastTapTime = 0;
        return;
      }

      // ===== TAP SIMPLE → LOUPE =====
      moveLens(touch.clientX, touch.clientY);
      lens.style.opacity = "1";

      setTimeout(() => {
        lens.style.opacity = "0";
      }, 900);

      lastTapTime = now;
    },
    { passive: true }
  );

  // ========================
  // INIT
  // ========================
  createScene();

  window.addEventListener("resize", () => {
    applyZoom();
  });
})();