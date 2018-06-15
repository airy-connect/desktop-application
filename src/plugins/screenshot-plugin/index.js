const screenshot = require("screenshot-desktop");

class ScreenshotPlugin {
  /**
   * @returns {Promise<Buffer>}
   */
  static get() {
    return screenshot();
  }
}

module.exports = ScreenshotPlugin;