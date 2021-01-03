const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      width: isDev ? 800 : 160,
      height: 200,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    // This is where the index.html file is loaded into the window
    this.loadFile(file);

    // Hide the window when it loses focus
    this.on('blur', () => {
      if (!this.webContents.isDevToolsOpened()) {
        this.hide();
      }
    });

    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
