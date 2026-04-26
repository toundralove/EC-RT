function initUnityMobileFix() {
  const canvas = document.getElementById("unity-canvas");
  const container = document.getElementById("unity-container");

  if (!canvas || !container) {
    console.warn("Unity canvas ou container introuvable");
    return;
  }

  canvas.tabIndex = 1;

  function focusCanvas() {
    canvas.focus();
  }

  canvas.addEventListener("click", focusCanvas);
  canvas.addEventListener("touchstart", focusCanvas, { passive: true });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    if (e.target === canvas || canvas.contains(e.target)) {
      e.preventDefault();
    }
  }, { passive: false });

  focusCanvas();
  console.log("Unity input fix activé");
}

window.addEventListener("load", initUnityMobileFix);