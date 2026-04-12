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

    viewer.addEventListener("pointerdown", () => {
      viewer.classList.add("is-interacting");
    });

    window.addEventListener("pointerup", () => {
      viewer.classList.remove("is-interacting");
    });

    viewer.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.stopPropagation();

      const isAlreadyActive = card.classList.contains("is-active");

      cards.forEach((otherCard) => {
        otherCard.classList.remove("is-active");
      });

      if (!isAlreadyActive) {
        card.classList.add("is-active");
      }
    });
  });

  document.addEventListener("click", () => {
    cards.forEach((card) => {
      card.classList.remove("is-active");
    });
  });
});