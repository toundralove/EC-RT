document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("infoToggle");
  const panel = document.getElementById("infoPanel");

  if (!btn || !panel) return;

  const close = panel.querySelector(".info-close");
  const data = window.ECART_INFO || {};

  const title = panel.querySelector(".info-title");
  const description = panel.querySelector(".info-description");
  const refBox = panel.querySelector(".info-ref");

  if (title) title.textContent = data.title || "Information";

  if (description) {
    description.innerHTML = `<p>${(data.description || "").replace(/\n/g, "<br><br>")}</p>`;
  }

  if (refBox && data.references?.length) {
    refBox.innerHTML =
      "<h3>Références</h3>" +
      data.references
        .map((item) => `<div class="info-ref-item">${item}</div>`)
        .join("");
  }

  function openPanel() {
    document.dispatchEvent(
      new CustomEvent("ecart:panel-open", {
        detail: { panel: "info" }
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
    if (e.detail?.panel !== "info") closePanel();
  });
});