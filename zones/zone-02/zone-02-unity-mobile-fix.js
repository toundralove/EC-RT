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

  window.addEventListener("resize", resizeUnityCanvas);
  window.addEventListener("orientationchange", () => {
    setTimeout(resizeUnityCanvas, 250);
  });

  resizeUnityCanvas();
  focusCanvas();

  console.log("Unity mobile fix activé");
}

window.addEventListener("load", initUnityMobileFix);