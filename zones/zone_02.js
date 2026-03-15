const buildUrl = "../unity/zone02/Build"

const config = {
  dataUrl: buildUrl + "build mamco.data",
  frameworkUrl: buildUrl + "build mamco.framework.js",
  codeUrl: buildUrl + "build mamco.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "ECART",
  productName: "Zone02",
  productVersion: "1.0"
};

const canvas = document.getElementById("unity-canvas");
const loadingBar = document.getElementById("unity-loading-bar");
const progressBarFull = document.getElementById("unity-progress-bar-full");
const warningBanner = document.getElementById("unity-warning");

function showWarning(message) {
  warningBanner.style.display = "block";
  warningBanner.textContent = message;
}

const script = document.createElement("script");
script.src = buildUrl + "/build mamco.loader.js";

script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    progressBarFull.style.width = `${progress * 100}%`;
  })
    .then(() => {
      loadingBar.style.display = "none";
    })
    .catch((message) => {
      showWarning("Erreur Unity : " + message);
    });
};

script.onerror = () => {
  showWarning("Impossible de charger build mamco.loader.js. Vérifie le dossier Build.");
};

document.body.appendChild(script);