const _ = require("lodash");

const Device = require("../../models/device");

function deviceMiddleware(request, response, next) {
  const certificate = request["certificate"];
  const fingerprint = certificate.getFingerprint();

  const ip = (
    request.headers["x-forwarded-for"] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress
  ).split(",").shift();

  let device = Device.findByCertificateFingerprint(fingerprint);
  if (_.isNull(device)) {
    device = new Device(fingerprint, ip);
  } else {
    device.lastIpAddress = ip;
    device.lastSeen = Date.now();
  }
  device.save();

  request["device"] = device;

  next();
}

module.exports = deviceMiddleware;