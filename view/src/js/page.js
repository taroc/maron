const $ = require('jquery');
var page = {};
module.exports = page;

page.set_link_number = function(){
    //何かを参照しているリンクを全て取得
    var $cites = $('.cite');
    
    //全てのリンクに対して参照先を調べて、番号を入れる
    $cites.each(function(){
        var $link = $(this);
        var href = $link.attr('href');
        var type = href.split('-')[0];
        var label = href.split('-')[1];
        
        var target = null;
        switch(type){
            case '#fig':
                target = $(href + ' figcaption');
                $link.html(target.attr('data-num'));
                return;
                break;
            case '#table':
                target = $(href + ' figcaption');
                $link.html(target.attr('data-num'));
                return;
                break;
            case '#bib':
                target = $(href);
                $link.html(target.attr('data-num'));
                return;
                break;
            case '#eq':
                target = $(href);
                $link.html(target.text());
                return;
                break;
        };
        
        $link.html('???');
    });
};
var pageManager = function(){
    this.footerHeight = 30;
    this.remainHeight = 1170 - this.footerHeight;
    this.num = 0;
};

pageManager.prototype.reset = function(){
    this.remainHeight = 1170 - this.footerHeight;
};

pageManager.prototype.createNomre = function(){
//余白の高さを分の大きさを持つページ番号要素を作成する
    var rh = this.remainHeight;
    var fh = this.footerHeight;
    var h = rh + fh;
    
    var $div = $('<div></div>',{
        height:  h +'px',
        addClass: 'page-num'
    });
    $div.html('<div>' + this.num + '</div>');

    return $div;
};

pageManager.prototype.newPage = function($elem, height){
    //改ページする
    this.num += 1;
    $elem.before(this.createNomre());
    this.reset();
    this.remainHeight -= height;
};

page.calculate_pages = function(){
    //要素の高さを調べてページ番号を振る

    var $views = $('#view').children();

    var pm = new pageManager();

    $views.each(function(i){
        var $elem = $(this);
        
        var $elemHeight = $elem.outerHeight(true);
        var tagName = $elem.prop('tagName');
    
        if(tagName == 'H1'){
            //h1は強制改ページ
            if(i!=0){
                pm.num += 1;
                $elem.before(pm.createNomre());
                pm.reset();
            }
            pm.remainHeight -= $elemHeight;
            return;
        }
        
        if(pm.remainHeight > $elemHeight){
            //要素がページに入るので改ページしない
            pm.remainHeight -= $elemHeight;
            return;
        }
        
        //ここまでくるということは残りの高さより要素の高さが大きので改ページする
        if(tagName == 'P'){
            //pタグは分割してから改ページする
            var $ps = $elem.children();
            var isOverPage = false;
            var $pUp = $('<p></p>',{'class':'up'});
            var $pDown = $('<p></p>',{'class':'down'});
            $elem.after($pUp);
            $pUp.after($pDown);
            $ps.each(function(i){
                var $span = $(this);

                if(isOverPage){
                    $pDown.append($span);
                }else{
                    $pUp.append($span);

                    if(pm.remainHeight < $pUp.outerHeight(true)){
                        isOverPage = true;
                        $pDown.append($span);
                        pm.remainHeight -= $pUp.outerHeight(true);
                        pm.num += 1;
                        $pUp.after(pm.createNomre())
                        pm.reset();
                    }
                }
            });
            pm.remainHeight -= $pDown.outerHeight(true);
            if($pUp.children().length == 0){$pUp.remove();}
            $elem.remove();
        }else{
            //pタグ以外は分割しないのでそのまま改ページする
            pm.newPage($elem, $elemHeight);
        }
    });
    
    //最後の要素の後ろにページ番号を入れる
    pm.num += 1;
    $($views[$views.length - 1]).after(pm.createNomre());
};