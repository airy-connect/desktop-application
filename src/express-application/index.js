const EventEmitter = require("events").EventEmitter;
const os = require("os");
const https = require("https");

const express = require("express");
const _ = require("lodash");

// Middlewares
const certificateMiddleware = require("./middlewares/certificate-middleware");
const deviceMiddleware = require("./middlewares/device-middleware");
const authorizationMiddleware = require("./middlewares/authorization-middleware");

// Models
const Device = require("../models/device");

// Plugins
const PresentationPlugin = require("../plugins/presentation-plugin");
const MultimediaControlPlugin = require("../plugins/multimedia-control-plugin");
const RemoteInputPlugin = require("../plugins/remote-input-plugin");
const ScreenshotPlugin = require("../plugins/screenshot-plugin");

class ExpressApplication extends EventEmitter {
  constructor(serverCertificate, caCertificate) {
    super();
    this._expressApplication = express();
    this._expressApplication.use(certificateMiddleware);
    this._expressApplication.use(deviceMiddleware);
    this._expressApplication.get("/getAuthorizationStatus", this._getAuthorizationStatus.bind(this));
    this._expressApplication.get("/sendAuthorizationRequest", this._sendAuthorizationRequest.bind(this));

    this._expressApplication.get(
      "/remoteInputPlugin/cursorMove",
      authorizationMiddleware,
      (request, response) => {
        const {deltaX, deltaY} = request.query;
        RemoteInputPlugin.moveCursor(+deltaX, +deltaY);
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/remoteInputPlugin/click",
      authorizationMiddleware,
      (request, response) => {
        const {button} = request.query;
        RemoteInputPlugin.click(button);
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/presentationPlugin/nextSlide",
      authorizationMiddleware,
      (request, response) => {
        PresentationPlugin.nextSlide();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/presentationPlugin/prevSlide",
      authorizationMiddleware,
      (request, response) => {
        PresentationPlugin.prevSlide();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/prev",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.prev();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/playOrPause",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.playOrPause();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/next",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.next();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/up",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.up();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/down",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.down();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/multimediaControlPlugin/muteOrUnmute",
      authorizationMiddleware,
      (request, response) => {
        MultimediaControlPlugin.muteOrUnmute();
        response.status(200).send();
      }
    );

    this._expressApplication.get(
      "/screenshotPlugin/get",
      authorizationMiddleware,
      async (request, response) => {
        const screenshot = await ScreenshotPlugin.get();
        response.status(200).send(screenshot.toString('base64'));
      }
    );

    const httpsServerOptions = {
      key: serverCertificate.getPrivateKey(),
      cert: serverCertificate.getPublicKey(),
      ca: [caCertificate.getPublicKey()],
      requestCert: true,
      rejectUnauthorized: true,
    };
    const ipAddress = this._getLocalIpAddress();
    const port = 8420;
    https
      .createServer(httpsServerOptions, this._expressApplication)
      .listen(port, ipAddress);
    console.log(`https://${ipAddress}:${port}/`);
  }

  _getAuthorizationStatus(request, response) {
    const device = request["device"];
    const {authorizationStatus} = device;
    response.send({authorizationStatus});
  }

  _sendAuthorizationRequest(request, response) {
    const device = request["device"];

    if (_.includes([
      Device.AUTHORIZATION_STATUS.AUTHORIZED,
      Device.AUTHORIZATION_STATUS.PENDING,
    ], device.authorizationStatus)) {
      return response.status(200).send();
    }

    device.authorizationRequestsNumber++;
    if (device.authorizationRequestsNumber >= 3) {
      device.authorizationStatus = Device.AUTHORIZATION_STATUS.BANNED;
    }
    device.save();

    if (_.isEqual(device.authorizationStatus, Device.AUTHORIZATION_STATUS.BANNED)) {
      return response.status(403).send();
    }

    if (_.isEqual(device.authorizationStatus, Device.AUTHORIZATION_STATUS.NOT_AUTHORIZED)) {
      device.authorizationStatus = Device.AUTHORIZATION_STATUS.PENDING;
      device.save();
      this.emit("authorizationRequest", {
        "deviceIpAddress": device.lastIpAddress,
        "deviceCertificateFingerprint": device.certificateFingerprint,
      });
    }

    return response.status(200).send();
  }

  _getLocalIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    return _(networkInterfaces)
      .values()
      .map(networkInterface => _.find(networkInterface, {
        family: "IPv4",
        internal: false,
      }))
      .compact()
      .map("address")
      .first();
  }
}

module.exports = ExpressApplication;