const audioToggle = document.getElementById("audioToggle");
const posterAudio = document.getElementById("posterAudio");

if (audioToggle && posterAudio) {
  audioToggle.addEventListener("click", () => {
    if (posterAudio.paused) {
      posterAudio.play();
    } else {
      posterAudio.pause();
    }
  });

  posterAudio.addEventListener("play", () => {
    audioToggle.classList.add("is-playing");
    audioToggle.setAttribute("aria-label", "Mettre en pause l'audio-description");
    audioToggle.querySelector(".audio-icon").textContent = "⏸";
    audioToggle.querySelector(".audio-text").textContent = "pause audio";
  });

  posterAudio.addEventListener("pause", () => {
    audioToggle.classList.remove("is-playing");
    audioToggle.setAttribute("aria-label", "Lancer l'audio-description");
    audioToggle.querySelector(".audio-icon").textContent = "🔊";
    audioToggle.querySelector(".audio-text").textContent = "audio description";
  });

  posterAudio.addEventListener("ended", () => {
    audioToggle.classList.remove("is-playing");
    audioToggle.setAttribute("aria-label", "Relancer l'audio-description");
    audioToggle.querySelector(".audio-icon").textContent = "🔊";
    audioToggle.querySelector(".audio-text").textContent = "rejouer audio";
  });
}