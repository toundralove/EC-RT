function initUnityMobileFix() {
  const canvas = document.getElementById("unity-canvas");
  const container = document.getElementById("unity-container");

  if (!canvas || !container) {
    console.warn("Unity canvas ou container introuvable");
    return;
  }

  canvas.tabIndex = 1;

  function resizeUnityCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    container.style.width = w + "px";
    container.style.height = h + "px";

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }

  canvas.addEventListener("click", () => {
    canvas.focus();
  });

  canvas.addEventListener("touchstart", () => {
    canvas.focus();
  }, { passive: true });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    if (e.target === canvas) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("resize", resizeUnityCanvas);
  window.addEventListener("orientationchange", resizeUnityCanvas);

  resizeUnityCanvas();

  console.log("Unity mobile fix activé");
}