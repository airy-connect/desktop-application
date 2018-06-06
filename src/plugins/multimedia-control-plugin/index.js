const robot = require("robotjs");

class MultimediaControlPlugin {
  static prev() {
    robot.keyTap('audio_prev');
  }

  static playOrPause() {
    robot.keyTap('audio_play');
  }

  static next() {
    robot.keyTap('audio_next');
  }

  static up() {
    robot.keyTap('audio_vol_up');
  }

  static down() {
    robot.keyTap('audio_vol_down');
  }

  static muteOrUnmute() {
    robot.keyTap('audio_mute');
  }
}

module.exports = MultimediaControlPlugin;