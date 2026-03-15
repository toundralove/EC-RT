const currentZone = document.body.dataset.zone;
const zoneLinks = document.querySelectorAll('.zone-link');
const miniZones = document.querySelectorAll('.mini-zone');

zoneLinks.forEach((link) => {
  if (link.dataset.zoneLink === currentZone) {
    link.classList.add('active');
  }
});

miniZones.forEach((zone) => {
  if (zone.dataset.miniZone === currentZone) {
    zone.classList.add('active');
  }

// Nav image 
const viewer = document.getElementById("imageViewer");
const img = document.getElementById("zoomImage");

let scale = 1;
let posX = -400;
let posY = -650;
let isDragging = false;
let startX = 0;
let startY = 0;

function updateTransform() {
  img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

viewer.addEventListener("mousedown", (e) => {
  isDragging = true;
  viewer.classList.add("dragging");
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  viewer.classList.remove("dragging");
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

viewer.addEventListener("wheel", (e) => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 4);
  updateTransform();
}, { passive: false });

updateTransform();
});
