const path = require('path');
const { app, ipcMain } = require('electron');
const Store = require('./Store');
const MainWindow = require('./MainWindow');
const AboutWindow = require('./AboutWindow');
const AppTray = require('./AppTray');

// Set env
process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
// const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;
let tray;

// Init store & defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      hour: 1,
      minute: 2,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow('./app/timer.html', isDev);
}

function createAboutWindow() {
  aboutWindow = new AboutWindow('./app/about.html', isDev);
}

// Don't show the app in the doc
app.dock.hide();

app.on('ready', () => {
  createMainWindow();
  createAboutWindow();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

  // Create tray
  tray = new AppTray(icon, mainWindow, aboutWindow);
});

// Set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value);
  mainWindow.webContents.send('settings:get', store.get('settings'));
});

ipcMain.on('timer:countdown', (evt, obj) => {
  const sec = parseInt(obj.minute) * 60 + parseInt(obj.hour) * 60 * 60;
  tray.countDown(sec);
  if (!tray.mainWindow.webContents.isDevToolsOpened()) {
    tray.mainWindow.hide();
  }
});

// app.on("window-all-closed", () => {
//   if (!isMac) {
//     app.quit();
//   }
// });

// app.on("activate", () => {
//   console.log(BrowserWindow.getAllWindows())
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createMainWindow();
//   }
// });

app.allowRendererProcessReuse = true;
