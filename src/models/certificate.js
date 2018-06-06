const crypto = require("crypto");

const request = require("request-promise-native");

const CA_SERVER_URL = "http://localhost:8081";

class Certificate {
  constructor(publicKey, privateKey = null) {
    this._publicKey = publicKey;
    this._privateKey = privateKey;
  }

  getPrivateKey() {
    return this._privateKey;
  }

  getPublicKey() {
    return this._publicKey;
  }

  getFingerprint() {
    const re = /-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s*/g;
    const certificate = this._publicKey.replace(re, "");
    const buffer = Buffer.from(certificate, "base64");
    const hash = crypto.createHash("sha256")
      .update(buffer)
      .digest("hex");
    return hash.replace(/.{2}/g, "$&:").replace(/:$/, "");
  }

  static async generate() {
    const url = `${CA_SERVER_URL}/api/v1/certificate/server`;
    const certificate = await request.get(url, {json: true});
    return new Certificate(
      certificate["certificate"],
      certificate["key"],
    );
  }
}

module.exports = Certificate;