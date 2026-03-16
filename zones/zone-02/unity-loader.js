function loadUnity() {
  const buildPath = "../../unity/zone02/Build";
  const loaderUrl = buildPath + "/build-mamco_compress.loader.js";

  const config = {
    dataUrl: buildPath + "/build-mamco_compress.data.unityweb",
    frameworkUrl: buildPath + "/build-mamco_compress.framework.js.unityweb",
    codeUrl: buildPath + "/build-mamco_compress.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "MAMCO",
    productVersion: "1.0"
  };

  const canvas = document.querySelector("#unity-canvas");
  const loading = document.getElementById("unity-loading");
  const progressBar = document.getElementById("unity-progress-bar");
  const progressValue = document.getElementById("unity-progress-value");

  if (!canvas) {
    console.error("Canvas Unity introuvable");
    return;
  }

  const script = document.createElement("script");
  script.src = loaderUrl;

  script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
      const percent = Math.round(progress * 100);
      if (progressBar) progressBar.style.width = percent + "%";
      if (progressValue) progressValue.textContent = percent + "%";
    })
      .then(() => {
        if (loading) loading.classList.add("is-hidden");
        console.log("Unity chargée");
      })
      .catch((err) => {
        console.error("Erreur Unity :", err);
      });
  };

  script.onerror = () => {
    console.error("Loader Unity introuvable :", loaderUrl);
  };

  document.body.appendChild(script);
}

window.addEventListener("load", loadUnity);