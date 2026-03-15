const buildUrl = "../Build";

const config = {

dataUrl: buildUrl + "/mamco.data",
frameworkUrl: buildUrl + "/mamco.framework.js",
codeUrl: buildUrl + "/mamco.wasm",

companyName: "ECART",
productName: "Zone02",
productVersion: "1.0"

};


const canvas = document.querySelector("#unity-canvas");
const progress = document.querySelector("#progress");


const script = document.createElement("script");

script.src = buildUrl + "/mamco.loader.js";

script.onload = () => {

createUnityInstance(canvas, config, (p)=>{

progress.style.width = (p*100)+"%";

}).then(()=>{

document.getElementById("unity-loading").style.display="none";

});

};

document.body.appendChild(script);