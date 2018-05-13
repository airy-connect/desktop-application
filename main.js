const path = require('path');
const url = require('url');

const {
  app,
  BrowserWindow
} = require('electron');
const _ = require('lodash');

const windows = {};

function createMainWindow() {
  windows['main'] = new BrowserWindow({width: 800, height: 600});
  windows['main'].loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  windows['main'].on('closed', function () {
    delete windows['main'];
  });
}

app.on('ready', createMainWindow);

app.on('window-all-closed', function () {
  if (!_.isEqual(process.platform, 'darwin')) {
    app.quit();
  }
});

app.on('activate', function () {
  if (!_.has(windows, 'main')) {
    createMainWindow();
  }
});