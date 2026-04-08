const currentZone = document.body.dataset.zone;
const zoneLinks = document.querySelectorAll('.zone-link');
const miniZones = document.querySelectorAll('.mini-zone');

function clearHoverStates() {
  zoneLinks.forEach(link => link.classList.remove('is-hovered'));
  miniZones.forEach(zone => zone.classList.remove('is-hovered'));
}

function setHoveredZone(zoneId) {
  clearHoverStates();

  document
    .querySelectorAll(`.zone-link[data-zone-link="${zoneId}"]`)
    .forEach(link => link.classList.add('is-hovered'));

  document
    .querySelectorAll(`.mini-zone[data-zone-link="${zoneId}"]`)
    .forEach(zone => zone.classList.add('is-hovered'));
}

if (currentZone) {
  document
    .querySelectorAll(`.zone-link[data-zone-link="${currentZone}"]`)
    .forEach(link => link.classList.add('active'));

  document
    .querySelectorAll(`.mini-zone[data-zone-link="${currentZone}"]`)
    .forEach(zone => zone.classList.add('active'));
}

zoneLinks.forEach(link => {
  const zoneId = zone.dataset.miniZone;

  link.addEventListener('mouseenter', () => {
    if (zoneId) setHoveredZone(zoneId);
  });

  link.addEventListener('mouseleave', () => {
    clearHoverStates();
  });
});

miniZones.forEach(zone => {
  const zoneId = zone.dataset.zoneLink;

  zone.addEventListener('mouseenter', () => {
    if (zoneId) setHoveredZone(zoneId);
  });

  zone.addEventListener('mouseleave', () => {
    clearHoverStates();
  });
});