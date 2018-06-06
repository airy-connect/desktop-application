const Certificate = require("../../models/certificate");

function certificateMiddleware(request, response, next) {
  const publicKeyPart = request
    .connection
    .getPeerCertificate()["raw"]
    .toString("base64");

  let publicKey = "-----BEGIN CERTIFICATE-----\n";
  publicKey += publicKeyPart;
  publicKey += "-----END CERTIFICATE-----\n";

  request["certificate"] = new Certificate(publicKey);

  next();
}

module.exports = certificateMiddleware;