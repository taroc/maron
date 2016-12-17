const marked = require('marked');

var renderer = new marked.Renderer();
module.exports = renderer;

//renderに要素の数を数える変数を追加
renderer.init_number = function(){
    this.counter_h1 = 0;
    this.counter_h2 = 0;
    this.counter_h3 = 0;

    this.counter_figcap = 0;
    
    this.counter_table = 0;

    this.counter_bib = 0;
};

renderer.image = function (src, title, label) {
    
    if(this.filepath != ''){
        if(/^\.\//.test(src)){
            src = src.replace(/^\.\//, this.filepath);
        }else{
            src = this.filepath + src;
        }
    }
    this.counter_figcap += 1;
    return '<figure id="fig-' + label + '" class="image">\n'
            + '<img src="' + src + '">\n'
            + '<figcaption class="image '+ label + '" '
            + 'data-num="'+ this.counter_h1 + '.' + this.counter_figcap + '"'
            + '>\n'
            + title
            + '</figcaption>\n'
            + '</figure>';
};

renderer.link = function (label, nouse, type) {
    //相互参照は(種類):(ラベル)の形
    //例えば、画像ならfig:label
    //参考文献ならbib:label
    
    //丸括弧だけの時は参照でない
    //この時、typeとlabelに同じものが入っているので
    //そのまま表示する
    if(type==label){
        return label
    }
    
    return '<a href="#' + type + '-' + label + '" class="cite">'
            + 'a'
            + '</a>';
};

renderer.listitem = function (text) {
    //[]で囲まれていれば参考文献
    var t = text.match(/\[(.*)\](.*)/);
    
    //[]がないので普通のリスト
    if (t==null) {
        return '<li>'
                + text
                + '</li>'
    }
    
    this.counter_bib += 1;
    var label = t[1];
    text = t[2];
    return '<li class="' + label + '" '
            + 'data-num="[' + this.counter_bib + ']">'
            + text
            + '</li>'
};

renderer.paragraph = function (text) {
    
    //数式だったらalign環境で囲む
    var re = /(\$\$[\s \S])([\s \S \w \d]*)(^\$\$$)/m;
    if (re.test(text)) {
        var equation = text.match(re);
        return '<p>$$\\begin{align}\n'
                //行末に章番号情報を埋め込む
                + equation[2].replace(/\/\/\//g, ' \\tag{' + this.counter_h1 + '}')+' \\tag{' + this.counter_h1 + '}\n'
                + '\\end{align}$$</p>';
    }
    
    //番号を振らないとき
    var re = /(\$\#)([\s \S \w \d]*)(\$\#)/m;
    if (re.test(text)) {
        var equation = text.match(re);
        return '<p>\\begin{align*}'
                + equation[2]
                + '\\end{align*}</p>';
    }

    //文章は行毎にspanで囲う
    var lines = text.split('\n');
    var p_text = '';
    
    //1文しかない場合
    if(lines.length==0){
        return '<p><span>'
            + text
            + '</span></p>'
    }
    
    for (var i=0, len=lines.length; i<len; i++) {
        p_text += '<span>' + lines[i] + '</span>';
    }
    return '<p>' + p_text + '</p>'
};

renderer.heading = function (text, level) {
    //hタグのdata-num属性に見出しの番号が入る

    if (level==1) {
        //参考文献の時は番号を降らない
        if (text=='参考文献') {
            return '<h1 class="bib">' + text + '</h1>';
        }

        //h1の数を数える
        //h2と画像はリセット
        this.counter_h1 += 1;
        this.counter_h2 = 0;
        this.counter_figcap = 0;

        return '<h' + level + ' '
                + 'data-num="第' + this.counter_h1 +'章">'
                + text
                + '</h' + level + '>';
    }
    if (level==2) {
        //h2の数を数える
        this.counter_h2 += 1;
        //h3はリセット
        this.counter_h3 = 0;

        return '<h' + level + ' '
                + ' data-num="' + this.counter_h1 + '.' + this.counter_h2 +'">'
                + text
                + '</h' + level + '>';
    }
    if (level==3) {
        //h3の数を数える
        this.counter_h3 += 1;

        return '<h' + level + ' '
                + 'data-num="' + this.counter_h1 + '.' + this.counter_h2 + '.' + this.counter_h3 +'">'
                + text
                + '</h' + level + '>';
    }

    //h4以降はそのまま(使わない前提)
    return '<h' + level + '>' + text + '</h' + level + '>';
};

renderer.table = function(header, body){
    return '<figure class="table">\n'
    + '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n'
    + '</figure>';
};

renderer.tablerow = function(content) {
    //タイトルを指定する行はfigcaptionに変換
    if(/^title:/.test(content)){
        this.counter_table += 1;
        var table_title = content.split(':')[1];
        var label = content.split(':')[3];
        return '<figcaption class="table ' + label + '"' + ' data-num="' + this.counter_h1 + '.' + this.counter_table + '">'
                + table_title;
                + '<\figcaption>'
    }
    
    return '<tr>\n' + content + '</tr>\n';
};

renderer.tablecell = function(content, flags) {
    //タイトルを指定する行はそのまま行の処理へ
    if(/^title:/.test(content)){
        return content;
    }
    
    var type = flags.header ? 'th' : 'td';
    var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
    return tag + content + '</' + type + '>\n';
};

renderer.code = function (code, language) {
    if(code.match(/^sequenceDiagram/)||code.match(/^graph/)){
        console.log(language)
        var title = language.split(':')[0];
        var label = language.split(':')[1];
        this.counter_figcap += 1;
        return '<figure id="fig:' + label + '" class="image">\n'
                + '<div class="mermaid">\n'
                + code
                + '</div>\n'
                + '<figcaption class="image '+ label + '" '
                + 'data-num="'+ this.counter_h1 + '.' + this.counter_figcap + '"'
                + '>\n'
                + title
                + '</figcaption>\n'
                + '</figure>';
    }
    else{
        return '<pre><code>'+code+'</code></pre>';
    }
};