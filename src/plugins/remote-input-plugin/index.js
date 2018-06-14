const robot = require("robotjs");

class RemoteInputPlugin {
  static moveCursor(deltaX, deltaY) {
    const {x, y} = robot.getMousePos();
    robot.moveMouseSmooth(x + deltaX, y + deltaY);
  }

  static click(button) {
    robot.mouseClick(button);
  }
}

module.exports = RemoteInputPlugin;