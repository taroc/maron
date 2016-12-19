var electron = require('electron');
var ipc = electron.ipcRenderer;
var fs = require('fs');

var webview = document.getElementById('mainWebView');

var markdownPath = '';
var pdfPath = '';

ipc.on('open-dev-tool', function(event, filepath){
    webview.openDevTools();
});

ipc.on('open-markdown', function(event, filepath){
    markdownPath = filepath;
    webview.send('load-markdown', filepath);
});

ipc.on('print-pdf', function(event, filepath){
    pdfPath = filepath;
    document.getElementById('print').style.display = 'block';
    webview.send('prepare-print');
});

ipc.on('reload', function(event){
    if(markdownPath != ''){
        console.log('reload')
        webview.send('reload-markdown', markdownPath);
    }else{
        webview.reload();
    }
});

webview.addEventListener('ipc-message', function(event) {
    console.log(event.channel)
    switch(event.channel){
        case 'standby-print':
            webview.printToPDF({
                marginsType: 0,
                pageSize: 'A4'
            }, function(err, data){
                console.log('pdf')
                if (err){
                    console.log(err)
                    throw err;
                }
                fs.writeFile(pdfPath, data, function(err) {
                    if (err) throw err;
                    console.log("Write PDF successfully.");
                    document.getElementById('print').style.display = 'none';
                    webview.send('done-print');
                });
            });
        break;
    }
});