# maron

Markdown形式のドキュメントを論文の書式でプレビュー、PDF書き出しができます。

## 使い方

### 数式

文章の途中に$で囲まれた部分があれば数式として表示されます。

例：

```
以下の値を$\alpha$とする。
```

以下の値を$\alpha$とする。

$$で囲めばtexのalign環境として表示されます。

例：

```
$$
E = mc^2
$$
```

$$
E = mc^2
$$

### 画像

```
![ラベル](パス "タイトル")
```

で画像を挿入できます。
また、```[fig](ラベル)```で図番号を参照できます。

例：

```
![label](./img/image.png "画像１")

[fig](label)
```

![label](./img/image.png "タイトル")

[fig](label)

### 表

```
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
|  This      |      This   |     This     |
|  column    |    column   |    column    |
|  will      |      will   |     will     |
|  be        |        be   |      be      |
|  left      |     right   |    center    |
|  aligned   |   aligned   |   aligned    |
|title:test:label:tb|

[table](label)
```

このように書くと以下のように出力されます。
一番最後の行は「title:タイトル:label:ラベル」の形式でタイトルとラベルを設定します。
```[table](ラベル)```で表番号を参照できます。


| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
|  This      |      This   |     This     |
|  column    |    column   |    column    |
|  will      |      will   |     will     |
|  be        |        be   |      be      |
|  left      |     right   |    center    |
|  aligned   |   aligned   |   aligned    |
|title:test:label:tb|

[table](label)