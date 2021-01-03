const { BrowserWindow, app } = require('electron');

class AboutWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: 'About Timer',
      width: isDev ? 800 : 300,
      height: 300,
      resizable: false,
      backgroundColor: 'white',
      show: false,
    });

    this.loadFile(file);

    this.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        this.hide();
      }

      return true;
    });

    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = AboutWindow;
