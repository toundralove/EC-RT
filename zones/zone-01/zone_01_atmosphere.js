window.Zone01Atmosphere = (() => {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("zoomImage");
  const audio = document.getElementById("posterAudio");

  if (!viewer || !img) return null;

  const CONFIG = {
    maxBlur: 1.8,
    veilStrength: 0.55,
    audioInfluence: 0.1,
    punishBlur: 1.8,
    punishVeil: 0.18
  };

  let lastDepth = 0;
  let punishedUntil = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function punish(duration = 650) {
    punishedUntil = performance.now() + duration;
  }

  function update(time, cam) {
    const d = cam.depth || 0;

    const velocity = Math.abs(d - lastDepth);
    const zoomingIn = d > lastDepth;

    if (zoomingIn && velocity > 0.05) {
      punish();
    }

    lastDepth = d;

    const punished = time < punishedUntil;

    const middleBlur =
      smoothstep(0.08, 0.34, d) *
      (1 - smoothstep(0.58, 0.82, d)) *
      CONFIG.maxBlur;

    const veil =
      smoothstep(0.08, 0.36, d) *
        (1 - smoothstep(0.62, 0.88, d)) *
        CONFIG.veilStrength +
      (punished ? CONFIG.punishVeil : 0);

    const audioPulse =
      audio && !audio.paused
        ? (Math.sin(time * 0.0016) * 0.5 + 0.5) * CONFIG.audioInfluence
        : 0;

    const finalVeil = clamp(veil + audioPulse, 0, 0.88);

    viewer.style.setProperty("--depth", d.toFixed(3));
    viewer.style.setProperty("--veil", finalVeil.toFixed(3));

    if (viewer.classList.contains("is-return-blur")) {
      return;
    }

    img.style.filter = `
      blur(${middleBlur + (punished ? CONFIG.punishBlur : 0)}px)
      contrast(${1 - finalVeil * 0.06})
      brightness(${1 - finalVeil * 0.03})
      saturate(${1 - finalVeil * 0.08})
    `;
  }

  return {
    update,
    punish
  };
})();