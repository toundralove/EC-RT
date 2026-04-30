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
     "./BAD-img/BAD_04.png",
  ];

  let zoom = 1;
  const minZoom = 1;
const maxZoom = 3.2;

  let originX = 50;
  let originY = 50;

  let pinchStartDistance = null;
  let pinchStartZoom = 1;

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

 zone.addEventListener(
  "wheel",
  (e) => {
    const isZoomIntent =
      e.ctrlKey ||              // trackpad pinch (Mac)
      Math.abs(e.deltaY) < 50;  // micro scroll = souvent zoom

    if (!isZoomIntent) return; // laisse scroller la page

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

  zone.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        pinchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);
        pinchStartZoom = zoom;
      }
    },
    { passive: true }
  );

  zone.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 2 && pinchStartDistance) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const ratio = currentDistance / pinchStartDistance;

        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        updateOrigin(centerX, centerY);

        zoom = clamp(pinchStartZoom * ratio, minZoom, maxZoom);

        applyZoom();
        moveLens(centerX, centerY);
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        moveLens(t.clientX, t.clientY);
      }
    },
    { passive: true }
  );

  zone.addEventListener("touchend", () => {
    pinchStartDistance = null;
  });

  function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  createScene();

  window.addEventListener("resize", () => {
    applyZoom();
  });
})();