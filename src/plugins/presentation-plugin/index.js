const robot = require("robotjs");

class PresentationPlugin {
  static nextSlide() {
    robot.keyTap("right");
  }

  static prevSlide() {
    robot.keyTap("left");
  }
}

module.exports = PresentationPlugin;