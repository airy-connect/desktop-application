const electron = require("electron");

async function main() {
  const window = electron.remote.getCurrentWindow();
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