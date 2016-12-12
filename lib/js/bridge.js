var electron = require('electron');
var ipc = electron.ipcRenderer;
var fs = require('fs');
var chokidar = require('chokidar');

ipc.on('load-markdown', function(event, filepath){
    
    var filedir = filepath[0].match(/(.*)(\/.*.md$)/)[1]+'/'
    
    var watcher = chokidar.watch([], {
        depth: 1
    });
    //ファイルが変更されたときにリロードする
    watcher.on('change', function(){
        fs.readFile(filepath[0], 'utf8', function (err, mdtext) {
            if (err) throw error;
            window.render_markdown(mdtext, filedir);
        });
    });
    watcher.add(filepath);
    
    //ファイルをロード
    fs.readFile(filepath[0], 'utf8', function (err, mdtext) {
        if (err) throw error;
        window.render_markdown(mdtext, filedir);
    });
});

ipc.on('reload-markdown', function(event, filepath){
    
    var filedir = filepath[0].match(/(.*)(\/.*.md$)/)[1]+'/'
    
    //ファイルをロード
    fs.readFile(filepath[0], 'utf8', function (err, mdtext) {
        if (err) throw error;
        window.render_markdown(mdtext, filedir);
    });
});


ipc.on('prepare-print', function(){
    var nombre = document.querySelectorAll('.page-num');
    for(var i=0, len=nombre.length; i<len; i++){
        nombre[i].style.border = 'none';
        nombre[i].style.margin = '0';
    }
    console.log('standby')
    ipc.sendToHost('standby-print');
});

ipc.on('done-print', function(){
    console.log('done')
    var nombre = document.querySelectorAll('.page-num');
    for(var i=0, len=nombre.length; i<len; i++){
        nombre[i].style.borderBottom = '1px solid #000';
        nombre[i].style.marginBottom = '20mm';
    }
});