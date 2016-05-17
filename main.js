/* eslint strict: 0 */
'use strict';

const electron = require('electron');

const {app, BrowserWindow, Menu, shell} = electron;

let menu;
let template;
let mainWindow = null;

var pkg = require('./package.json');

const {productName} = pkg;

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var {NODE_ENV} = process.env;

var DEV_ENV = NODE_ENV === 'development';

require('electron-debug')(
	{
		enabled: true,
		showDevTools: DEV_ENV
	}
);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
	var electronScreen = electron.screen;

	var size = electronScreen.getPrimaryDisplay().workAreaSize;

	global.USER_PREFS_PATH = app.getPath('userData');

	electron.ipcMain.on(
		'userPrefsPath',
		(event, arg) => {
			event.returnValue = global.USER_PREFS_PATH;
		}
	);

	var windowConfig = {
		height: size.height,
		resizable: true,
		titleBarStyle: 'hidden-inset',
		title: productName,
		width: 768
	};

	if (DEV_ENV) {
		// Account for the devtools being open
		windowConfig.width = Math.min(1400, size.width);
	}

	mainWindow = new BrowserWindow(windowConfig);

	mainWindow.loadURL(`file://${__dirname}/app/app.html`);

	var webContents = mainWindow.webContents;

	mainWindow.on(
		'closed',
		() => {
			mainWindow = null;
		}
	);

	if (process.platform === 'darwin') {
		template = [{
			label: productName,
			submenu: [
			{
				label: `About ${productName}`,
				selector: 'orderFrontStandardAboutPanel:'
			},
			{type: 'separator'},
			{
				label: 'Services',
				submenu: []
			},
			{type: 'separator'},
			{
				label: `Hide ${productName}`,
				accelerator: 'Command+H',
				selector: 'hide:'
			},
			{
				label: 'Hide Others',
				accelerator: 'Command+Shift+H',
				selector: 'hideOtherApplications:'
			},
			{
				label: 'Show All',
				selector: 'unhideAllApplications:'
			},
			{type: 'separator'},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click() {
					app.quit();
				}
			}
			].concat(
				DEV_ENV ?
				[
					{type: 'separator'},
					{
						label: 'Crash Main Process',
						click() {
							process.crash();
						}
					}
				]
				:
				[]

			)
		},
		{
			label: 'Edit',
			submenu: [
			{
				label: 'Undo',
				accelerator: 'Command+Z',
				selector: 'undo:'
			},
			{
				label: 'Redo',
				accelerator: 'Shift+Command+Z',
				selector: 'redo:'
			},
			{type: 'separator'},
			{
				label: 'Cut',
				accelerator: 'Command+X',
				selector: 'cut:'
			},
			{
				label: 'Copy',
				accelerator: 'Command+C',
				selector: 'copy:'
			},
			{
				label: 'Paste',
				accelerator: 'Command+V',
				selector: 'paste:'
			},
			{
				label: 'Select All',
				accelerator: 'Command+A',
				selector: 'selectAll:'
			}]
		},
		{
			label: 'View',
			submenu: [
			{
				label: 'Reload',
				accelerator: 'Command+R',
				click() {
					mainWindow.restart();
				}
			},
			{
				label: 'Toggle Full Screen',
				accelerator: 'Ctrl+Command+F',
				click() {
					mainWindow.setFullScreen(!mainWindow.isFullScreen());
				}
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: 'Alt+Command+I',
				click() {
					if (webContents.isDevToolsOpened()) {
						webContents.closeDevTools();
					}
					else {
						webContents.openDevTools({
							detach: true
						});
					}
				}
			}]
		},
		{
			label: 'Window',
			submenu: [
			{
				label: 'Minimize',
				accelerator: 'Command+M',
				selector: 'performMiniaturize:'
			},
			{
				label: 'Close',
				accelerator: 'Command+W',
				selector: 'performClose:'
			},
			{type: 'separator'},
			{
				label: 'Bring All to Front',
				selector: 'arrangeInFront:'
			}]
		},
		{
			label: 'Help',
			submenu: [
			{
				label: 'Learn More',
				click() {
					shell.openExternal('http://electron.atom.io');
				}
			},
			{
				label: 'Documentation',
				click() {
					shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
				}
			},
			{
				label: 'Community Discussions',
				click() {
					shell.openExternal('https://discuss.atom.io/c/electron');
				}
			},
			{
				label: 'Search Issues',
				click() {
					shell.openExternal('https://github.com/atom/electron/issues');
				}
			}]
		}];

		menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);
	} else {
		template = [{
			label: '&File',
			submenu: [
			{
				label: '&Open',
				accelerator: 'Ctrl+O'
			},
			{
				label: '&Close',
				accelerator: 'Ctrl+W',
				click() {
					mainWindow.close();
				}
			}]
		},
		{
			label: '&View',
			submenu: [
			{
				label: '&Reload',
				accelerator: 'Ctrl+R',
				click() {
					mainWindow.restart();
				}
			},
			{
				label: 'Toggle &Full Screen',
				accelerator: 'F11',
				click() {
					mainWindow.setFullScreen(!mainWindow.isFullScreen());
				}
			},
			{
				label: 'Toggle &Developer Tools',
				accelerator: 'Alt+Ctrl+I',
				click() {
					webContents.toggleDevTools();
				}
			}]
		},
		{
			label: 'Help',
			submenu: [
			{
				label: 'Learn More',
				click() {
					shell.openExternal('http://electron.atom.io');
				}
			},
			{
				label: 'Documentation',
				click() {
					shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
				}
			},
			{
				label: 'Community Discussions',
				click() {
					shell.openExternal('https://discuss.atom.io/c/electron');
				}
			},
			{
				label: 'Search Issues',
				click() {
					shell.openExternal('https://github.com/atom/electron/issues');
				}
			}]
		}];
		menu = Menu.buildFromTemplate(template);
		mainWindow.setMenu(menu);
	}
});