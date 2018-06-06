const {EventEmitter} = require("events");
const url = require("url");
const path = require("path");

const electron = require("electron");
const {
  app,
  BrowserWindow,
} = electron;
const _ = require("lodash");

class ElectronApplication extends EventEmitter {
  constructor() {
    super();
    this._windows = {};
  }

  static getUserFolderPath() {
    return app.getPath("userData");
  }

  createAuthorizationRequestWindow(deviceIpAddress, deviceCertificateFingerprint) {
    const window = new BrowserWindow({
      width: 768,
      height: 384,
      useContentSize: true,
      resizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      center: true,
      fullscreenable: false,
      minimizable: false
    });

    let state = {};

    window["setState"] = (newState) => state = newState;

    window["props"] = {
      deviceIpAddress,
      deviceCertificateFingerprint,
    };

    window.loadURL(url.format({
      pathname: path.join(__dirname, "windows", "connection-request", "index.html"),
      protocol: "file:",
      slashes: true
    }));

    window.on("closed", () => {
      this.emit("authorizationResponse", {
        deviceCertificateFingerprint,
        isConnectionAllowed: !!state["isConnectionAllowed"],
      });
    });
  }
}

module.exports = ElectronApplication;