const currentZone = document.body.dataset.zone;
const zoneLinks = document.querySelectorAll(".zone-link");
const miniZones = document.querySelectorAll(".mini-zone");

zoneLinks.forEach((link) => {
  if (link.dataset.zoneLink === currentZone) {
    link.classList.add("active");
  }
});

miniZones.forEach((zone) => {
  if (zone.dataset.miniZone === currentZone) {
    zone.classList.add("active");
  }
});

const viewer = document.getElementById("imageViewer");
const img = document.getElementById("zoomImage");

if (viewer && img) {
  let scale = 1.4;
  const minScale = 0.4;
  const maxScale = 8;

  let posX = 0;
  let posY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    img.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  function centerImage() {
    scale = 1.4;
    posX = 0;
    posY = 0;
    updateTransform();
  }

  viewer.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    viewer.classList.add("dragging");
    viewer.setPointerCapture(e.pointerId);
  });

  viewer.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  viewer.addEventListener("pointerup", (e) => {
    isDragging = false;
    viewer.classList.remove("dragging");
    viewer.releasePointerCapture(e.pointerId);
  });

  viewer.addEventListener("pointercancel", (e) => {
    isDragging = false;
    viewer.classList.remove("dragging");
    viewer.releasePointerCapture(e.pointerId);
  });

viewer.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = 0.1;

  if (e.deltaY < 0) {
    scale += zoomFactor;
  } else {
    scale -= zoomFactor;
  }

  scale = Math.max(0.4, Math.min(6, scale));

  updateTransform();
}, { passive: false });
  viewer.addEventListener("dblclick", () => {
    centerImage();
  });

  img.addEventListener("dragstart", (e) => e.preventDefault());

  centerImage();
}