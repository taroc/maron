'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const ipc = electron.ipc;

let win = null;
//let webview = null;

app.on('window-all-closed', function(){
    if(process.platform != 'darwin'){
        app.quit();
    }
});

app.on('ready', function(){
    // メニューをアプリケーションに追加
    Menu.setApplicationMenu(menu);

    // ブラウザ(Chromium)の起動, 初期画面のロード
    win = new BrowserWindow({width: 2000, height: 2300});
    win.loadURL('file://' + __dirname + '/index.html');

    win.on('closed', function(){
        win = null;
    });
});

// メニュー情報の作成
var template = [
    {
        label: 'ReadUs',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function(){
                    app.quit();
                }
            }
        ]
    }, {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'Command+O',
                click: function(){
                    // 「ファイルを開く」ダイアログの呼び出し
                    dialog.showOpenDialog({properties: ['openFile']},
                        function(filepath){
                            win.webContents.send('open-markdown', filepath);
                    });
                }
            },{
                label: 'Print',
                accelerator: 'Command+P',
                click: function(){
                    dialog.showSaveDialog(
                        {
                            defaltPath: __dirname,
                            filters: [
                                {name: 'PDF', extensions: ['pdf']}
                            ]
                        },
                        function(filepath){
                            win.webContents.send('print-pdf', filepath);
                    });
                }
            }
        ]
    }, {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'Command+R',
                click: function(){
                    win.webContents.send('reload');
                }
            },{
                label: 'Toggle DevTools',
                accelerator: 'Alt+Command+I',
                click: function(){
                    BrowserWindow.getFocusedWindow().toggleDevTools();
                }
            }
        ]
    }
];

var menu = Menu.buildFromTemplate(template);