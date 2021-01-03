const { app, Menu, Tray, Notification } = require('electron');

class AppTray extends Tray {
  constructor(icon, mainWindow, aboutWindow) {
    super(icon);
    this.icon = icon;
    this.isDev = process.env.NODE_ENV !== 'production' ? true : false;
    this.isMac = process.platform === 'darwin' ? true : false;
    this.setTitle('00:00');

    this.mainWindow = mainWindow;
    this.aboutWindow = aboutWindow;
    this.menu = null;

    this.timer = null;
    this.carry = 0;
    this.hr = this.min = this.sec = 0;

    this.time = '00:00';

    this.isCountDown = false;

    this.template = [
      {
        label: 'Start',
        id: 'start',
        click: this.startTime.bind(this),
        enabled: true,
      },
      {
        label: 'Pause',
        id: 'pause',
        click: this.pauseTime.bind(this),
        enabled: false,
      },
      {
        label: 'Stop',
        id: 'stop',
        click: this.resetTime.bind(this),
        enabled: false,
      },
      {
        type: 'separator',
      },
      {
        label: 'Minutes',
        submenu: [
          { label: '1 Minute', click: this.countDown.bind(this, 1 * 60) },
          { label: '5 Minutes', click: this.countDown.bind(this, 5 * 60) },
          { type: 'separator' },
          { label: '10 Minutes', click: this.countDown.bind(this, 10 * 60) },
          { label: '15 Minutes', click: this.countDown.bind(this, 15 * 60) },
          { type: 'separator' },
          { label: '20 Minutes', click: this.countDown.bind(this, 20 * 60) },
          { label: '25 Minutes', click: this.countDown.bind(this, 25 * 60) },
          { type: 'separator' },
          { label: '30 Minutes', click: this.countDown.bind(this, 30 * 60) },
          { label: '35 Minutes', click: this.countDown.bind(this, 35 * 60) },
          { type: 'separator' },
          { label: '40 Minutes', click: this.countDown.bind(this, 40 * 60) },
          { label: '45 Minutes', click: this.countDown.bind(this, 45 * 60) },
          { type: 'separator' },
          { label: '50 Minutes', click: this.countDown.bind(this, 50 * 60) },
          { label: '55 Minutes', click: this.countDown.bind(this, 55 * 60) },
        ],
        id: 'minutes',
      },
      {
        label: 'Hours',
        submenu: [
          {
            label: '1 Hour',
            click: this.countDown.bind(this, 1 * 60 * 60),
          },
          { label: '2 Hours', click: this.countDown.bind(this, 2 * 60 * 60) },
          { label: '3 Hours', click: this.countDown.bind(this, 3 * 60 * 60) },
          { label: '4 Hours', click: this.countDown.bind(this, 4 * 60 * 60) },
          { label: '5 Hours', click: this.countDown.bind(this, 5 * 60 * 60) },
          { label: '6 Hours', click: this.countDown.bind(this, 6 * 60 * 60) },
          { label: '7 Hours', click: this.countDown.bind(this, 7 * 60 * 60) },
          { label: '8 Hours', click: this.countDown.bind(this, 8 * 60 * 60) },
          { label: '9 Hours', click: this.countDown.bind(this, 9 * 60 * 60) },
          { type: 'separator' },
          { label: '10 Hours', click: this.countDown.bind(this, 10 * 60 * 60) },
          { label: '12 Hours', click: this.countDown.bind(this, 12 * 60 * 60) },
          {
            label: '24 Hours',
            click: this.countDown.bind(this, 24 * 60 * 60 + 7),
          },
        ],
        id: 'hours',
      },
      {
        label: 'Customize',
        click: this.showMainWindow.bind(this),
        id: 'customize',
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        click: this.showAboutWindow.bind(this),
      },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ];

    this.setToolTip('Timer');
    this.on('click', this.onClick.bind(this));
    this.on('right-click', this.onRightClick.bind(this));
  }

  onClick() {
    if (this.mainWindow && this.mainWindow.isVisible() === true) {
      this.mainWindow.hide();
    }
    if (!this.menu) {
      this.menu = Menu.buildFromTemplate(this.template);
    }
    this.popUpContextMenu(this.menu);
  }

  onRightClick() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    this.popUpContextMenu(contextMenu);
  }

  showMainWindow() {
    const getWindowPosition = (mainWindow, tray) => {
      const windowBounds = mainWindow.getBounds();
      const trayBounds = tray.getBounds();

      const x = Math.round(
        trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
      );

      const y = Math.round(trayBounds.y + trayBounds.height);

      return { x, y };
    };

    const position = getWindowPosition(this.mainWindow, this);
    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  showAboutWindow() {
    this.aboutWindow.show();
  }

  formatTime(time) {
    return Math.floor(time).toString().padStart(2, '0');
  }

  startTime() {
    if (this.isCountDown) {
      this.countDown();
      return;
    }

    this.isCountDown = false;
    this.menu.getMenuItemById('start').enabled = false;
    this.menu.getMenuItemById('pause').enabled = true;
    this.menu.getMenuItemById('stop').enabled = true;
    this.menu.getMenuItemById('minutes').enabled = false;
    this.menu.getMenuItemById('hours').enabled = false;
    this.menu.getMenuItemById('customize').enabled = false;

    clearInterval(this.timer);

    const startTime = Date.now();
    let curTime = startTime;

    this.timer = setInterval(() => {
      curTime = Date.now();
      let elapsedSec = (this.carry * 1000 + curTime - startTime) / 1000;
      this.hr = this.formatTime((elapsedSec / 3600) % 24);
      this.min = this.formatTime((elapsedSec / 60) % 60);
      this.sec = this.formatTime(elapsedSec % 60);
      this.time =
        this.hr === '00'
          ? `${this.min}:${this.sec}`
          : `${this.hr}:${this.min}:${this.sec}`;
      this.displayTime();
    }, 1000);
  }

  pauseTime() {
    this.menu.getMenuItemById('start').enabled = true;
    this.menu.getMenuItemById('pause').enabled = false;
    this.menu.getMenuItemById('stop').enabled = true;
    this.menu.getMenuItemById('minutes').enabled = false;
    this.menu.getMenuItemById('hours').enabled = false;
    this.menu.getMenuItemById('customize').enabled = false;

    clearInterval(this.timer);

    if (!this.isCountDown) {
      this.carry =
        parseInt(this.hr) * 3600 + parseInt(this.min) * 60 + parseInt(this.sec);
    }
    this.displayTime();
  }

  resetTime() {
    this.menu.getMenuItemById('start').enabled = true;
    this.menu.getMenuItemById('pause').enabled = false;
    this.menu.getMenuItemById('stop').enabled = false;
    this.menu.getMenuItemById('minutes').enabled = true;
    this.menu.getMenuItemById('hours').enabled = true;
    this.menu.getMenuItemById('customize').enabled = true;

    clearInterval(this.timer);

    this.carry = 0;
    this.time = '00:00';
    this.displayTime();
    this.isCountDown = false;
  }

  displayTime() {
    this.setImage(this.icon);
    this.setTitle(this.time);
  }

  countDown(sec) {
    this.menu.getMenuItemById('start').enabled = false;
    this.menu.getMenuItemById('pause').enabled = true;
    this.menu.getMenuItemById('stop').enabled = true;
    this.menu.getMenuItemById('minutes').enabled = false;
    this.menu.getMenuItemById('hours').enabled = false;
    this.menu.getMenuItemById('customize').enabled = false;

    this.isCountDown = true;

    clearInterval(this.timer);
    let countDownDate = 0;
    if (this.carry === 0) {
      countDownDate = Date.now() + (sec + 1) * 1000;
    } else {
      countDownDate = Date.now() + (this.carry + 1) * 1000;
    }

    this.timer = setInterval(() => {
      const curDate = Date.now();
      const diff = countDownDate - curDate;

      const elapsedSec = Math.floor(diff / 1000);
      this.carry = elapsedSec;

      if (elapsedSec <= 0) {
        const notification = {
          title: "Time's up!",
          timeoutType: 'never',
        };
        new Notification(notification).show();
        this.resetTime();
      }

      this.hr = this.formatTime((elapsedSec / 3600) % 24);
      this.min = this.formatTime((elapsedSec / 60) % 60);
      this.sec = this.formatTime(elapsedSec % 60);
      this.time =
        this.hr === '00'
          ? `${this.min}:${this.sec}`
          : `${this.hr}:${this.min}:${this.sec}`;

      this.displayTime();
    }, 1000);
  }
}

module.exports = AppTray;
