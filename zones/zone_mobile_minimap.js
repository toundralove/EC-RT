const STORAGE_KEY = "ecart_visited_zones";

function getVisitedZones() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function addVisitedZone(zoneId) {
  const visited = getVisitedZones();

  if (!visited.includes(zoneId)) {
    visited.push(zoneId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
  }
}

function applyVisitedZones(zones, currentZone) {
  const visitedZones = getVisitedZones();

  zones.forEach((zone) => {
    const id = zone.dataset.miniZone;
    const isVisited = visitedZones.includes(id);
    const isCurrent = id === currentZone;

    zone.classList.toggle("is-current", isCurrent);
    zone.classList.toggle("is-visited", isVisited && !isCurrent);
  });
}

function initMobileMiniMap() {
  const toggle = document.getElementById("mobileMapToggle");
  const overlay = document.getElementById("mobileMapOverlay");
  const panel = document.getElementById("mobileMapPanel");
  const status = document.getElementById("mobileMapStatus");

  if (!toggle || !overlay || !panel) return;

  const zones = overlay.querySelectorAll(".mini-zone");
  const currentZone = document.body.dataset.zone || "";
  let typingTimer = null;

  if (currentZone) {
    addVisitedZone(currentZone);
  }

  function setToggleState(isOpen) {
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Fermer la carte" : "Ouvrir la carte");
    overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  function stopTyping() {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }

  function resetZoneHints() {
    stopTyping();

    zones.forEach((zone) => {
      zone.classList.remove("is-armed");
      zone.dataset.armed = "false";

      const hint = zone.querySelector(".mobile-zone-hint");
      if (hint) hint.textContent = "";
    });
  }

  function resetStatus() {
    if (!status) return;
    status.textContent = "Sélectionne une zone.";
  }

  function openMap() {
    overlay.classList.add("is-open");
    setToggleState(true);
    resetZoneHints();
    applyVisitedZones(zones, currentZone);
  }

  function closeMap() {
    overlay.classList.remove("is-open");
    setToggleState(false);
    resetZoneHints();
    resetStatus();
  }

  function typeText(element, text, speed = 22) {
    if (!element) return;

    stopTyping();
    element.textContent = "";

    let i = 0;
    typingTimer = setInterval(() => {
      element.textContent = text.slice(0, i + 1);
      i += 1;

      if (i >= text.length) {
        stopTyping();
      }
    }, speed);
  }

  toggle.addEventListener("click", () => {
    const isOpen = overlay.classList.contains("is-open");
    if (isOpen) {
      closeMap();
    } else {
      openMap();
    }
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeMap();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMap();
    }
  });

  zones.forEach((zone) => {
    zone.dataset.armed = "false";

    zone.addEventListener("click", (event) => {
      const name = zone.dataset.zoneName || "zone";
      const hint = zone.querySelector(".mobile-zone-hint");
      const isArmed = zone.dataset.armed === "true";

      if (!isArmed) {
        event.preventDefault();

        zones.forEach((otherZone) => {
          if (otherZone !== zone) {
            otherZone.dataset.armed = "false";
            otherZone.classList.remove("is-armed");

            const otherHint = otherZone.querySelector(".mobile-zone-hint");
            if (otherHint) otherHint.textContent = "";
          }
        });

        zone.dataset.armed = "true";
        zone.classList.add("is-armed");

        if (status) {
          status.textContent = `Zone sélectionnée : ${name}`;
        }

        typeText(hint, `vers ${name}...`);
        return;
      }

      addVisitedZone(zone.dataset.miniZone);
    });
  });

  applyVisitedZones(zones, currentZone);
}

document.addEventListener("DOMContentLoaded", initMobileMiniMap);