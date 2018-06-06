const {
  app: electronApplication,
  BrowserWindow,
} = require("electron");
const fsExtra = require("fs-extra");
const path = require("path");
const url = require("url");

const ExpressApplication = require("./express-application");
const Certificate = require("./models/certificate");
const caCertificate = require("./ca-certificate");
const Device = require("./models/device");

electronApplication.on("ready", () => {
  main().catch(console.error);
});

electronApplication.on("window-all-closed", () => {
  console.log("All windows closed.");
});

async function main() {
  const userFolderPath = electronApplication.getPath("userData");
  const serverCertificate = await getServerCertificate(userFolderPath);
  const expressApplication = new ExpressApplication(serverCertificate, caCertificate);
  expressApplication.on("authorizationRequest", ({deviceIpAddress, deviceCertificateFingerprint}) => {
    createAuthorizationRequestWindow(deviceIpAddress, deviceCertificateFingerprint);
  });
}

async function getServerCertificate(folderPath) {
  const certificateKeyFilePath = path.resolve(folderPath, "certificate", "key.pem");
  const certificateFilePath = path.resolve(folderPath, "certificate", "certificate.pem");
  if (!await fsExtra.pathExists(certificateKeyFilePath) || !await fsExtra.pathExists(certificateFilePath)) {
    const certificate = await Certificate.generate();
    await fsExtra.outputFile(certificateKeyFilePath, certificate.getPrivateKey());
    await fsExtra.outputFile(certificateFilePath, certificate.getPublicKey());
    return certificate;
  }
  return new Certificate(
    await fsExtra.readFile(certificateFilePath, "utf8"),
    await fsExtra.readFile(certificateKeyFilePath, "utf8"),
  );
}

function createAuthorizationRequestWindow(deviceIpAddress, deviceCertificateFingerprint) {
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
    pathname: path.join(__dirname, "electron-application", "windows", "connection-request", "index.html"),
    protocol: "file:",
    slashes: true
  }));

  window.on("closed", () => {
    const device = Device.findByCertificateFingerprint(deviceCertificateFingerprint);
    if (state["isConnectionAllowed"]) {
      device.authorizationStatus = Device.AUTHORIZATION_STATUS.AUTHORIZED;
    } else {
      device.authorizationStatus = Device.AUTHORIZATION_STATUS.NOT_AUTHORIZED;
    }
    device.save();
  });
}