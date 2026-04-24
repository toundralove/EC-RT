(() => {
  const img = document.getElementById("zoomImage");

  if (!img) return;

  let started = false;

  function init() {
    if (started) return;
    started = true;

    window.Zone01Camera?.init();
    window.Zone01Exploration?.init();

    requestAnimationFrame(loop);
  }

  function loop(time) {
    window.Zone01Camera?.update(time);

    const cam = window.Zone01Camera?.getState();

    if (cam) {
      window.Zone01Atmosphere?.update(time, cam);
      window.Zone01Exploration?.update(time, cam);
    }

    requestAnimationFrame(loop);
  }

  if (img.complete && img.naturalWidth > 0) {
    init();
  } else {
    img.addEventListener("load", init, { once: true });
  }
})();