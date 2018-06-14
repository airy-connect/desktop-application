const path = require("path");
const fs = require("fs");

const _ = require("lodash");
const electron = require("electron");
const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const Memory = require("lowdb/adapters/Memory");

FileAsync.prototype.read = Memory.prototype.read;

const dbFilePath = path.resolve(electron.app.getPath("userData"), "devices.json");
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, "{}");
}
const state = JSON.parse(fs.readFileSync(dbFilePath));

const adapter = new FileAsync(dbFilePath);
const db = low(adapter);

db.setState(state);

const devices = db
  .defaults({"devices": []})
  .get("devices");

class Device {
  /**
   * @param {string} certificateFingerprint
   * @returns {Device|null}
   */
  static findByCertificateFingerprint(certificateFingerprint) {
    const device = devices
      .find({certificateFingerprint})
      .value();

    if (_.isUndefined(device)) return null;

    return new Device(
      device["certificateFingerprint"],
      device["lastIpAddress"],
      device["authorizationStatus"],
      device["authorizationRequestsNumber"],
    );
  }

  /**
   * @returns {Array<Device>}
   */
  static get all() {
    return devices
      .value()
      .map((device) => new Device(
        device["certificateFingerprint"],
        device["lastIpAddress"],
        device["authorizationStatus"],
        device["authorizationRequestsNumber"],
      ));
  }

  /**
   * @param {string} certificateFingerprint
   * @param {string} lastIpAddress
   * @param {Device.AUTHORIZATION_STATUS} authorizationStatus
   * @param {number} authorizationRequestsNumber
   * @constructor
   */
  constructor(
    certificateFingerprint,
    lastIpAddress,
    authorizationStatus = Device.AUTHORIZATION_STATUS.NOT_AUTHORIZED,
    authorizationRequestsNumber = 0,
  ) {
    this._certificateFingerprint = certificateFingerprint;
    this._lastIpAddress = lastIpAddress;
    this._authorizationStatus = authorizationStatus;
    this._authorizationRequestsNumber = authorizationRequestsNumber;
  }

  /**
   * @returns {string}
   */
  get certificateFingerprint() {
    return this._certificateFingerprint;
  }

  /**
   * @param {string} certificateFingerprint
   */
  set certificateFingerprint(certificateFingerprint) {
    this._certificateFingerprint = certificateFingerprint;
  }

  /**
   * @returns {string}
   */
  get lastIpAddress() {
    return this._lastIpAddress;
  }

  /**
   * @param {string} lastIpAddress
   */
  set lastIpAddress(lastIpAddress) {
    this._lastIpAddress = lastIpAddress;
  }

  /**
   * @returns {Device.AUTHORIZATION_STATUS}
   */
  get authorizationStatus() {
    return this._authorizationStatus;
  }

  /**
   * @param {Device.AUTHORIZATION_STATUS} authorizationStatus
   */
  set authorizationStatus(authorizationStatus) {
    this._authorizationStatus = authorizationStatus;
  }

  /**
   * @returns {number}
   */
  get authorizationRequestsNumber() {
    return this._authorizationRequestsNumber;
  }

  /**
   * @param {number} authorizationRequestsNumber
   */
  set authorizationRequestsNumber(authorizationRequestsNumber) {
    this._authorizationRequestsNumber = authorizationRequestsNumber;
  }

  /**
   *
   */
  save() {
    const {
      certificateFingerprint,
      lastIpAddress,
      authorizationStatus,
      authorizationRequestsNumber
    } = this;

    const isDeviceNotExists = devices
      .find({certificateFingerprint})
      .isUndefined()
      .value();

    if (isDeviceNotExists) {
      devices
        .push({
          certificateFingerprint,
          lastIpAddress,
          authorizationStatus,
          authorizationRequestsNumber,
        })
        .write();
    } else {
      devices
        .find({certificateFingerprint})
        .assign({
          lastIpAddress,
          authorizationStatus,
          authorizationRequestsNumber,
        })
        .write();
    }
  }
}

/**
 * @enum {string}
 */
Device.AUTHORIZATION_STATUS = {
  NOT_AUTHORIZED: "NOT_AUTHORIZED",
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  BANNED: "BANNED",
};

module.exports = Device;