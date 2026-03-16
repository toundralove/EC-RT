function loadUnity() {
  const buildPath = "../../unity/zone02/Build";

  const loaderUrl = buildPath + "/build-mamco-compress.loader.js";

  const config = {
    dataUrl: buildPath + "/build-mamco-compress.data",
    frameworkUrl: buildPath + "/build-mamco-compress.framework.js",
    codeUrl: buildPath + "/build-mamco-compress.wasm"
  };

  const canvas = document.querySelector("#unity-canvas");

  if (!canvas) {
    console.error("Canvas Unity introuvable");
    return;
  }

  const script = document.createElement("script");
  script.src = loaderUrl;

  script.onload = () => {
    createUnityInstance(canvas, config)
      .then(() => {
        console.log("Unity chargée avec succès");
      })
      .catch((err) => {
        console.error("Erreur createUnityInstance :", err);
      });
  };

  script.onerror = () => {
    console.error("Impossible de charger le loader Unity :", loaderUrl);
  };

  document.body.appendChild(script);
}

loadUnity();