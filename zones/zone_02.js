 const buildUrl = "./Build";
    const loaderUrl = buildUrl + "/mamco.loader.js";

    const config = {
      dataUrl: buildUrl + "/mamco.data",
      frameworkUrl: buildUrl + "/mamco.framework.js",
      codeUrl: buildUrl + "/mamco.wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "ECART",
      productName: "Zone02",
      productVersion: "1.0"
    };

    const container = document.querySelector("#unity-container");
    const canvas = document.querySelector("#unity-canvas");
    const loadingBar = document.querySelector("#unity-loading-bar");
    const progressBarFull = document.querySelector("#unity-progress-bar-full");
    const warningBanner = document.querySelector("#unity-warning");

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
    script.src = loaderUrl;

    script.onload = () => {
      createUnityInstance(canvas, config, (progress) => {
        progressBarFull.style.width = (progress * 100) + "%";
      })
      .then((unityInstance) => {
        loadingBar.style.display = "none";
      })
      .catch((message) => {
        unityShowBanner("Erreur Unity : " + message, "error");
      });
    };

    script.onerror = () => {
      unityShowBanner("Impossible de charger mamco.loader.js. Vérifie le chemin ./Build.", "error");
    };

    document.body.appendChild(script);