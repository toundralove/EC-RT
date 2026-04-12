document.addEventListener("DOMContentLoaded", () => {
  const viewers = document.querySelectorAll(".glb-viewer");

  viewers.forEach((viewer) => {

    // Quand le modèle est chargé
    viewer.addEventListener("load", () => {
      viewer.classList.add("is-ready");
    });

    // Si erreur (super utile en debug)
    viewer.addEventListener("error", () => {
      console.warn("Erreur chargement GLB :", viewer.getAttribute("src"));
    });

    // Interaction custom légère (optionnelle)
    viewer.addEventListener("mousedown", () => {
      viewer.classList.add("is-interacting");
    });

    window.addEventListener("mouseup", () => {
      viewer.classList.remove("is-interacting");
    });

  });
});