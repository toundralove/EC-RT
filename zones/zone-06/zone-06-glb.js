document.addEventListener("DOMContentLoaded", () => {
  const viewers = document.querySelectorAll(".glb-viewer");
  const cards = document.querySelectorAll(".glb-card");

  viewers.forEach((viewer) => {
    viewer.addEventListener("load", () => {
      viewer.classList.add("is-ready");
    });

    viewer.addEventListener("error", () => {
      console.warn("Erreur chargement GLB :", viewer.getAttribute("src"));
    });

    viewer.addEventListener("mousedown", () => {
      viewer.classList.add("is-interacting");
    });

    window.addEventListener("mouseup", () => {
      viewer.classList.remove("is-interacting");
    });

    viewer.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-active");
    });
  });
});