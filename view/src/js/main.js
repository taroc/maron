const $ = require('jquery');
const marked = require('marked');
const renderer = require('./renderer.js');
const page = require('./page.js');

$(document).ready(function(){
    
    var target = $("#view_wrapper");
    
    window.render_markdown = function(mdtext, filepath){
        renderer.init_number();
        renderer.filepath = filepath;
        
        //markdownをhtmlに
        var md = marked(mdtext, {renderer: renderer});
        var viewer = document.getElementById('view');
        viewer.innerHTML = md;
        //リンクの処理
        page.set_link_number();
        
        //数式を描画
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'view']);
        MathJax.Hub.Queue(function () {
            //ノンブルを計算
            page.calculate_pages();
            
            //改ページ部分の余白を設定
            //この余白は本文の余白ではないため
            //改ページの計算に含めてはいけない
            //そのため、calculate_pagesの後に設定し
            //PDFを書き出す直前に消す
            var $page_num = $('.page-num');
            $page_num.css({
               'border-bottom': '1px solid #000',
                'margin-bottom': '20mm',
            });
        });
    };

    $.ajax({
        url: target[0].attributes["src"].value,
    }).done(function(data){
        render_markdown(data, '');
    }).fail(function(data){
        console.log("This content failed to load.");
    });
});