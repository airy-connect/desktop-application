const electron = require("electron");
const _ = require("lodash");

const currentWindow = electron.remote.getCurrentWindow();
const {
  getIpAddress,
  getDevices,
  removeDevice,
  updateDevice,
} = currentWindow["props"];

const {MDCSlider} = window.mdc.slider;
const $slider = document.querySelector(".mdc-slider");
const mdcSlider = new MDCSlider($slider);

let selectedDevice = null;

async function main() {
  render();
  mdcSlider.listen("MDCSlider:change", () => {
    onCursorSpeedChanged(mdcSlider.value);
  });
  const oldDevices = getDevices();
  setInterval(() => {
    const newDevices = getDevices();
    if (!_.isEqual(oldDevices, newDevices)) {
      render();
    }
  }, 1000);
}

function renderStatusBar() {
  const $ipAddress = document.querySelector("[data-server-ip-address]");
  $ipAddress.textContent = getIpAddress();
}

function render() {
  const devices = getDevices();
  if (_.isEmpty(devices)) {
    document.querySelector(".container").style.display = "none";
    document.querySelector(".devices-list-empty").style.display = "";
    setTimeout(render, 1000);
    return;
  }

  document.querySelector(".container").style.display = "";
  document.querySelector(".devices-list-empty").style.display = "none";

  renderStatusBar();
  renderDevices();
  renderSettings();
}

function renderDevices() {
  const devices = getDevices();
  const $devicesList = document.querySelector("[data-devices-list]");

  $devicesList.innerHTML = "";

  for (const device of devices) {
    const id = devices.indexOf(device) + 1;
    const isSelected = _.isEqual(device, selectedDevice);
    const $devicesListItem = document.createElement("a");
    $devicesListItem.setAttribute("href", "javascript:void(0)");
    $devicesListItem.setAttribute("class", "mdc-list-item");
    if (isSelected) {
      $devicesListItem.classList.add("mdc-list-item--activated");
    }
    $devicesListItem.setAttribute("data-devices-list-item", "");
    const isDeviceOnline = (Date.now() - device.lastSeen) < 1000 * 60;
    $devicesListItem.setAttribute("data-is-device-online", isDeviceOnline.toString());
    $devicesListItem.innerHTML = `
        <i class="material-icons mdc-list-item__graphic" aria-hidden="true">fiber_manual_record</i>
        Устройство ${id}
    `;
    $devicesListItem.addEventListener("click", () => {
      selectedDevice = device;
      render();
    });

    $devicesList.appendChild($devicesListItem);
  }
}

function renderSettings() {
  if (_.isEmpty(selectedDevice)) {
    document.querySelector(".settings-list").style.display = "none";
    document.querySelector(".select-device-message").style.display = "";
    return;
  }

  const $ipAddress = document.querySelector("[data-ip-address]");
  $ipAddress.textContent = selectedDevice.lastIpAddress;

  const $oldRemoveButton = document.querySelector(".mdc-button--remove");
  const $removeButton = $oldRemoveButton.cloneNode(true);
  $removeButton.addEventListener("click", () => {
    removeDevice(selectedDevice.certificateFingerprint);
    selectedDevice = null;
    render();
  });
  $oldRemoveButton
    .parentNode
    .replaceChild($removeButton, $oldRemoveButton);

  document.querySelector(".settings-list").style.display = "";
  document.querySelector(".select-device-message").style.display = "none";

  mdcSlider.value = selectedDevice.cursorSpeed * 100;
  mdcSlider.layout();
}

function onCursorSpeedChanged(cursorSpeed) {
  selectedDevice.cursorSpeed = cursorSpeed / 100;
  updateDevice(selectedDevice);
  render();
}

main().catch(console.error);