function initUnityMobileFix() {
  const canvas = document.getElementById("unity-canvas");
  const container = document.getElementById("unity-container");

  if (!canvas || !container) {
    console.warn("Unity canvas ou container introuvable");
    return;
  }

  canvas.tabIndex = 1;

  const UNITY_ASPECT = 16 / 9; // adapte si ta scène a un autre ratio

  function resizeUnityCanvas() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let canvasW = screenW;
    let canvasH = screenW / UNITY_ASPECT;

    if (canvasH > screenH) {
      canvasH = screenH;
      canvasW = screenH * UNITY_ASPECT;
    }

    container.style.width = screenW + "px";
    container.style.height = screenH + "px";

    canvas.style.width = canvasW + "px";
    canvas.style.height = canvasH + "px";
    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
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