const currentZone = document.body.dataset.zone;
const zoneLinks = document.querySelectorAll('.zone-link');
const miniZones = document.querySelectorAll('.mini-zone');

zoneLinks.forEach((link) => {
  if (link.dataset.zoneLink === currentZone) {
    link.classList.add('active');
  }
});

miniZones.forEach((zone) => {
  if (zone.dataset.miniZone === currentZone) {
    zone.classList.add('active');
  } });
  
const buildUrl = "../BuildZone02";
const loaderUrl = buildUrl + "/Build.loader.js";

const config = {
  dataUrl: buildUrl + "/Build.data",
  frameworkUrl: buildUrl + "/Build.framework.js",
  codeUrl: buildUrl + "/Build.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "ECART",
  productName: "Zone02",
  productVersion: "1.0"
};

const canvas = document.getElementById("unity-canvas");
const loading = document.getElementById("unity-loading");

const script = document.createElement("script");
script.src = loaderUrl;

script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    // ici tu peux plus tard ajouter une barre si tu veux
    console.log("Unity loading:", Math.round(progress * 100) + "%");
  })
    .then((unityInstance) => {
      loading.classList.add("hidden");
      window.unityInstance = unityInstance;
    })
    .catch((message) => {
      loading.querySelector(".unity-loading-text").textContent =
        "Erreur de chargement de la scène Unity.";
      console.error(message);
    });
};

script.onerror = () => {
  loading.querySelector(".unity-loading-text").textContent =
    "Impossible de charger le loader Unity.";
};

document.body.appendChild(script);