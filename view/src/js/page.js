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
    this.pageSize = 1370;
    this.remainHeight = this.pageSize - this.footerHeight;
    this.num = 0;
};

pageManager.prototype.reset = function(){
    this.remainHeight = this.pageSize - this.footerHeight;
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

pageManager.prototype.createMargin = function(){
//余白の高さを分の大きさを持つ要素を作成する
    var rh = this.remainHeight;
    var fh = this.footerHeight;
    var h = rh + fh;
    
    var $div = $('<div></div>',{
        height:  h +'px',
        addClass: 'page-num'
    });
    $div.html('<div></div>');

    return $div;
};

pageManager.prototype.createNomreRoman = function(){
    var a = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
    ];
    var m = new Map(a);

    var roman = function(number) {
        var div = number;
        var r = "";
        for (var key of m.keys()) {
            while ((div / key) >= 1) {
                r += m.get(key);
                div -= key;
            } ;
        }
        //console.log(r);
        return r;
    };
//余白の高さを分の大きさを持つ要素を作成する
    var rh = this.remainHeight;
    var fh = this.footerHeight;
    var h = rh + fh;
    
    var $div = $('<div></div>',{
        height:  h +'px',
        addClass: 'page-num'
    });
    $div.html('<div>' + roman(this.num) + '</div>');

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
    var isFirstH1 = true;
    
    $views.each(function(i){
        var $elem = $(this);
        
        var $elemHeight = $elem.outerHeight(true);
        var tagName = $elem.prop('tagName')
    
        if(tagName == 'H1'){
            //h1は強制改ページ
            if(!isFirstH1){
                pm.num += 1;
                $elem.before(pm.createNomre());
                $elem.attr({'data-page':pm.num});
                pm.reset();
                pm.remainHeight -= $elemHeight;
                return;
            }
            isFirstH1 = false;
            $elem.attr({'data-page':pm.num+1});
            pm.remainHeight -= $elemHeight;
            return;
        }
        
        if($elem.hasClass('page_index')){
            return;
        }
        
        if($elem.attr('id') == 'front_cover'){
            return;
        }
        
        if(pm.remainHeight > $elemHeight){
            //要素がページに入るので改ページしない
            pm.remainHeight -= $elemHeight;
            
            //$elemがh2かh3で次の要素で改ページするならここで改ページする
            var $elemNext = $elem.next();
            var nextHight = $elemNext.outerHeight(true);
            if((tagName=='H2' || tagName=='H3') && pm.remainHeight < nextHight){
                pm.remainHeight += $elemHeight;
                pm.num += 1;
                $elem.before(pm.createNomre())
                pm.reset();
                pm.remainHeight -= $elemHeight;
                $elem.attr({'data-page':pm.num+1});
                return;
            //$elemがh2、次がh3で、h3の次で改ページする場合、h3がページに入っていてもh2で改ページする
            }else if(tagName == 'H2' && $elemNext.prop('tagName') == 'H3' && pm.remainHeight < nextHight + $elemNext.next().outerHeight(true)){
                pm.remainHeight += $elemHeight;
                pm.num += 1;
                $elem.before(pm.createNomre())
                pm.reset();
                pm.remainHeight -= $elemHeight;
                $elem.attr({'data-page':pm.num+1});
                return;
            }
            
            $elem.attr({'data-page':pm.num+1});
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
            $elem.attr({'data-page':pm.num+1});
        }
    });
    
    //最後の要素の後ろにページ番号を入れる
    pm.num += 1;
    $($views[$views.length - 1]).after(pm.createNomre());
};

page.create_index = function(){
    var $tmp = $('.page_index');
    $tmp.remove();
    var $index = $('<ol></ol>');
    $index.addClass('page_index');
    var $view = $('#view');
    $view.prepend($index);
    var $h1 = $('<h1>目次</h1>');
    $h1.addClass('page_index');
    $index.before($h1);
    var $views = $view.children();
    $views.each(function(){
        var $elem = $(this);
        var tagName = $elem.prop('tagName');
        if(tagName == 'H1'){
            if($elem.hasClass('page_index')){
                return;
            }
            var $list = $('<li>' + $elem.text() +'</li>');
            $list.addClass('chapter');
            $list.attr({'data-num':$elem.attr('data-num')});
            $list.attr({'data-page':$elem.attr('data-page')});
            $index.append($list);
        }
        if(tagName == 'H2'){
            var $list = $('<li>' + $elem.text() +'</li>');
            $list.addClass('section');
            $list.attr({'data-num':$elem.attr('data-num')});
            $list.attr({'data-page':$elem.attr('data-page')});
            $index.append($list);
        }
        if(tagName == 'H3'){
            var $list = $('<li>' + $elem.text() +'</li>');
            $list.addClass('subsection');
            $list.attr({'data-num':$elem.attr('data-num')});
            $list.attr({'data-page':$elem.attr('data-page')});
            $index.append($list);
        }
    });
    
    var $indexes = $index.children();

    var pm = new pageManager();
    pm.remainHeight -= $h1.outerHeight(true);
    
    $indexes.each(function(i){
        var $elem = $(this);
        
        var $elemHeight = $elem.outerHeight(true);
        
        if(pm.remainHeight > $elemHeight){
            //要素がページに入るので改ページしない
            pm.remainHeight -= $elemHeight;
            return;
        }
        
        //ここまでくるということは残りの高さより要素の高さが大きので改ページする
        this.num += 1;
        $elem.before(this.createNomreRoman());
        this.reset();
        this.remainHeight -= $elemHeight;
    });
    pm.num += 1;
    $($indexes[$indexes.length - 1]).after(pm.createNomreRoman());
};

page.create_cover = function(content){
    $('#front_cover').remove();
    
    var $cover = $(
        '<section id="front_cover">'
            +'<div class="category">' + content.category +'</div>'
            +'<h1>' + content.title + '</h1>'
            +'<h2>' + content.subtitle + '</h2>'
            +'<div class="department">'
                +'<div>' + content.department1 + '</div>'
                +'<div>' + content.department2 + '</div>'
            +'</div>'
            +'<div class="name">'
                +'<div>' + content.name1 + '</div>'
                +'<div>' + content.name2 + '</div>'
            +'</div>'
            +'<div class="teach">' + content.teach + '</div>'
            +'<div class="date">' + content.date + '</div>'
        +'</section>'
    );
    var $view = $('#view');
    $view.prepend($cover);
    
    var pm = new pageManager();
    pm.remainHeight -= $cover.outerHeight(true);
    $cover.after(pm.createMargin());
}