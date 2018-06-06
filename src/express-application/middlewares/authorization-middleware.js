const _ = require("lodash");

const Device = require("../../models/device");

function authorizationMiddleware(request, response, next) {
  const device = request["device"];

  if (!_.isEqual(device.authorizationStatus, Device.AUTHORIZATION_STATUS.AUTHORIZED)) {
    return response.status(401).end();
  }

  next();
}

module.exports = authorizationMiddleware;