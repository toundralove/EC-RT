(function () {
  const body = document.body;
  const title = document.querySelector(".site-title");
  const nav = document.querySelector(".zones-nav");

  if (!body || !title || !nav) return;
  if (!body.classList.contains("has-mobile-menu")) return;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    title.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    body.classList.add("menu-open");
    title.setAttribute("aria-expanded", "true");
  }

  function toggleMenu(event) {
    if (!isMobile()) return;

    event.preventDefault();

    if (body.classList.contains("menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  title.setAttribute("aria-expanded", "false");
  title.setAttribute("aria-controls", "zones-nav-mobile");

  if (!nav.id) {
    nav.id = "zones-nav-mobile";
  }

  title.addEventListener("click", toggleMenu);

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      body.classList.remove("menu-open");
      title.setAttribute("aria-expanded", "false");
    }
  });

  nav.querySelectorAll(".zone-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
})();