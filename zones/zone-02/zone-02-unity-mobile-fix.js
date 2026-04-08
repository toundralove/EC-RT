function initUnityMobileFix() {
  const canvas = document.getElementById("unity-canvas");

  if (!canvas) {
    console.warn("Unity canvas introuvable");
    return;
  }

  // Permet de donner le focus au canvas
  canvas.tabIndex = 1;

  // 👉 Redimensionnement correct (important mobile)
  function resizeUnityCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }

  // 👉 Focus quand on clique / touche
  canvas.addEventListener("click", () => {
    canvas.focus();
  });

  canvas.addEventListener("touchstart", () => {
    canvas.focus();
  }, { passive: true });

  // 👉 Empêche le scroll de la page de casser le zoom Unity
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

  // 👉 Empêche le scroll tactile sur mobile
  document.addEventListener("touchmove", (e) => {
    if (e.target === canvas) {
      e.preventDefault();
    }
  }, { passive: false });

  // 👉 Resize écran / rotation téléphone
  window.addEventListener("resize", resizeUnityCanvas);
  window.addEventListener("orientationchange", resizeUnityCanvas);

  // 👉 Initialisation
  resizeUnityCanvas();

  console.log("Unity mobile fix activé");
}