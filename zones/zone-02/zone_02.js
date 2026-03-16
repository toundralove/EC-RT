const buildUrl = "../unity/zone02/Build";

const config = {
  dataUrl: buildUrl + "/build-mamco.data.br",
  frameworkUrl: buildUrl + "/build-mamco.framework.js.br",
  codeUrl: buildUrl + "/build-mamco.wasm.br",
  streamingAssetsUrl: "../unity/zone02/StreamingAssets",
  companyName: "ECART",
  productName: "Zone02",
  productVersion: "1.0",
  showBanner: unityShowBanner
};

const canvas = document.getElementById("unity-canvas");
const loadingBar = document.getElementById("unity-loading-bar");
const progressBarFull = document.getElementById("unity-progress-bar-full");
const warningBanner = document.getElementById("unity-warning");

function unityShowBanner(message, type) {
  warningBanner.style.display = "block";
  warningBanner.textContent = message;

  if (type === "error") {
    warningBanner.style.background = "red";
  } else {
    warningBanner.style.background = "orange";
  }
}

const script = document.createElement("script");
script.src = buildUrl + "/build-mamco.loader.js";

script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    progressBarFull.style.width = `${progress * 100}%`;
  })
    .then(() => {
      loadingBar.style.display = "none";
    })
    .catch((message) => {
      unityShowBanner("Erreur Unity : " + message, "error");
    });
};

script.onerror = () => {
  unityShowBanner("Impossible de charger le loader Unity. Vérifie le dossier Build.", "error");
};

document.body.appendChild(script);