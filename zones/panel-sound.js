document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("soundToggle");
  const panel = document.getElementById("soundPanel");

  if (!btn || !panel) return;

  const close = panel.querySelector(".sound-close");
  const container = panel.querySelector(".sound-panel-inner");
  const sounds = window.ECART_SOUND || [];

  let currentAudio = null;
  let currentButton = null;

  function formatTime(sec) {
    if (!Number.isFinite(sec)) return "00:00";

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);

    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function stopCurrentAudio() {
    if (!currentAudio) return;

    currentAudio.pause();

    if (currentButton) {
      currentButton.textContent = "Play";
    }

    currentAudio = null;
    currentButton = null;
  }

  function openPanel() {
    document.dispatchEvent(
      new CustomEvent("ecart:panel-open", {
        detail: { panel: "sound" }
      })
    );

    panel.classList.add("is-open");
    btn.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    panel.classList.remove("is-open");
    btn.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
  }

  if (container && sounds.length) {
    sounds.forEach((sound, index) => {
      const block = document.createElement("div");
      block.className = "sound-item";

      block.innerHTML = `
        <div class="sound-title">${sound.title || `Son ${index + 1}`}</div>

        <div class="sound-time">
          <span class="sound-current">00:00</span>
          <span class="sound-duration">--:--</span>
        </div>

        <div class="sound-progress">
          <div class="sound-progress-fill"></div>
        </div>

        <div class="sound-controls">
          <button class="play-btn" type="button">Play</button>
        </div>

        <audio preload="metadata" src="${sound.file}"></audio>
      `;

      container.appendChild(block);

      const audio = block.querySelector("audio");
      const play = block.querySelector(".play-btn");
      const fill = block.querySelector(".sound-progress-fill");
      const current = block.querySelector(".sound-current");
      const duration = block.querySelector(".sound-duration");

      audio.addEventListener("loadedmetadata", () => {
        duration.textContent = formatTime(audio.duration);
      });

      play.addEventListener("click", async () => {
        if (audio.paused) {
          if (currentAudio && currentAudio !== audio) {
            stopCurrentAudio();
          }

          try {
            await audio.play();
            play.textContent = "Pause";
            currentAudio = audio;
            currentButton = play;
          } catch (error) {
            console.warn("Audio playback blocked or failed:", error);
          }
        } else {
          audio.pause();
          play.textContent = "Play";
          currentAudio = null;
          currentButton = null;
        }
      });

      audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;

        const pct = (audio.currentTime / audio.duration) * 100;

        fill.style.width = `${pct}%`;
        current.textContent = formatTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        play.textContent = "Play";
        fill.style.width = "0%";
        current.textContent = "00:00";

        currentAudio = null;
        currentButton = null;
      });
    });
  }

  btn.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) {
      closePanel();
    } else {
      openPanel();
    }
  });

  if (close) {
    close.addEventListener("click", closePanel);
  }

  panel.addEventListener("click", (e) => {
    if (e.target === panel) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  document.addEventListener("ecart:panel-open", (e) => {
    if (e.detail?.panel !== "sound") closePanel();
  });
});