const electron = require("electron");

async function main() {
  const window = electron.remote.getCurrentWindow();

  const props = window["props"];
  document.querySelector("[data-client-ip-address]").textContent = props["clientIpAddress"];
  document.querySelector("[data-client-certificate-fingerprint]").innerHTML = props["clientCertificateFingerprint"];
  document.querySelector("[data-server-certificate-fingerprint]").innerHTML = props["serverCertificateFingerprint"];

  const setState = window["setState"];
  const state = {
    "isConnectionAllowed": false,
  };
  setState(state);
  document.querySelector(".mdc-button--green").addEventListener("click", () => {
    state["isConnectionAllowed"] = true;
    setState(state);
    window.close();
  });
  document.querySelector(".mdc-button--red").addEventListener("click", () => {
    window.close();
  });
}

main().catch(console.error);