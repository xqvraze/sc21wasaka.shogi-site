/*
 ARTS 佐々木氏のプログラムをベースに改造
 改造と基本的な機能の改造ではなく、コードの記述方法の修正などにとどめ、
 基本的には、コメントを付加して構造を理解することに努めた
 */
var canvas;

//キャンバスコンテキスト 2D/3D (2次元/3次元)
var ctx;

//コンテキストで使用するテキストサイズ
var ctx_font_size;

//駒の名前配列
var nametbl = [
  "玉","飛","角","金","銀","桂","香","歩",
  ""  ,"竜","馬",""  ,"全","圭","杏","と"
];

//駒の動きとしての移動先への移動量(先手番として表示)
/************************************************************
 真上から右回りに周囲の8マスに対してに動けるかどうかをあらわす
 周囲のマス目の他に最後に桂の動きの分を2つ用意で、10方向
    0: 	真上		x方向 :  0	y方向 : -1　
    1:  右上		x方向 :  1	y方向 : -1
    2:  右横		x方向 :  1	y方向 :  0
    3:  右下		x方向 :  1	y方向 :  1
    4:  真下		x方向 :  0	y方向 :  1
    5:  左下		x方向 : -1	y方向 :  1
    6:  左横		x方向 : -1	y方向 :  0
    7:  左上		x方向 : -1	y方向 : -1
    9:  右桂移動	x方向 :  1	y方向 : -2
   10:  左桂移動	x方向 : -1	y方向 : -2
**********************************************************/
var move_x = [ 0, 1, 1, 1, 0,-1,-1,-1, 1,-1];
var move_y = [-1,-1, 0, 1, 1, 1, 0,-1,-2,-2];

//各駒の動きの表
/************************************************************
 真上から右回りに周囲の8マスに対してに動けるかどうかをあらわす
 周囲のマス目の他に最後に桂の動きの分を2つ用意で、10方向
    0: 真上
    1:  右上
    2:  右横
    3:  右下
    4:  真下
    5:  左下
    6:  左横
    7:  左上
    9:  右桂移動
   10:  左桂移動

  方向への動きの可否
    0: 動けない、(王、金の成駒がない場合もすべてゼロ)
    1: その方向に1つ移動可能
    2: 飛、角、香などの場合の複数行ける場合
**********************************************************/
var movtbl = [
  [ 1,1,1,1,1,1,1,1,0,0 ], //王の動き
  [ 2,0,2,0,2,0,2,0,0,0 ], //飛の動き
  [ 0,2,0,2,0,2,0,2,0,0 ], //角の動き
  [ 1,1,1,0,1,0,1,1,0,0 ], //金の動き
  [ 1,1,0,1,0,1,0,1,0,0 ], //銀の動き
  [ 0,0,0,0,0,0,0,0,1,1 ], //桂の動き
  [ 2,0,0,0,0,0,0,0,0,0 ], //香の動き
  [ 1,0,0,0,0,0,0,0,0,0 ], //歩の動き
  [ 0,0,0,0,0,0,0,0,0,0 ], //王は成らない
  [ 2,1,2,1,2,1,2,1,0,0 ], //竜の動き
  [ 1,2,1,2,1,2,1,2,0,0 ], //馬の動き
  [ 0,0,0,0,0,0,0,0,0,0 ], //金は成らない
  [ 1,1,1,0,1,0,1,1,0,0 ], //成銀の動き
  [ 1,1,1,0,1,0,1,1,0,0 ], //成桂の動き
  [ 1,1,1,0,1,0,1,1,0,0 ], //成香の動き
  [ 1,1,1,0,1,0,1,1,0,0 ]  //と金の動き
];

//初期配置
//-1は駒のない位置
var setup = [
  [  7, 7, 7, 7, 7, 7, 7, 7, 7 ],
  [ -1, 2,-1,-1,-1,-1,-1, 1,-1 ],
  [  6, 5, 4, 3, 0, 3, 4, 5, 6 ]
];

//駒の文字の色 : 表の色、裏の色
var fontcolor = ["black","maroon"];

//各マス目の外枠線の色
//将棋盤外の駒置き場等 	: LimeGreen
//将棋盤の通常配置状態 	: gray
//将棋盤内の選択駒	: bule
//駒の移動可能範囲 	: red
var boxcolor = ["LimeGreen","gray","blue","red"];

//各マス目の背景色
//将棋盤外の駒置き場等 	: LimeGreen
//将棋盤の通常配置駒 	: gray
//将棋盤内の選択駒	: bule
//駒の移動可能範囲 	: red
var fillcolor = ["LimeGreen","Khaki","white","LightPink"];

//1マス目のサイズ 32×32
var psize = 32;

//将棋盤内の駒の状態配列
var board = [];

//盤の横マス (将棋盤/囲碁盤など)
ban_w = 9;

//盤の縦マス (将棋盤/囲碁盤など)
ban_h = 9;

//マス目の横 19マス (左余白 1 + 後手駒置き 3 + 余白 1 + 将棋盤 9 + 余白 1 + 先手駒置き 3 + 右余白 1)
var bw = 5 * 2 + ban_w;

//マス目の縦 11マス (上余白 1 + 将棋盤 9 + 下余白 1)
var bh = 1 * 2 + ban_h;

//将棋盤配置のXオフセット
var ofsx = 5;

//将棋盤配置のYオフセット
var ofsy = 1;

//0: 先手 1: 後手
var turn = 0;

/******
駒を動かす処理中の対象の駒の動く前の駒の元の位置
 動く対象の駒の元の位置
　-1:駒は動いていない
******/
var startx = -1;
var starty = -1;

//指定マス目の駒の有無、駒の種類
//動かす対象として選択された駒の情報
var move_id = -1;

//タブレット、スマホ端末のOS名
var username = ["ipad","iphone","android"];

//プレイヤーの識別
var playtbl = ["先手","後手"];

//各マス目オブジェクトの作成
/*
  id : -1:駒なし 0～15: 駒の名前配列 nametblのindexの駒あり
  player : 0: 先手駒, 1: 後手駒
  movable :
 */
function piece(){
  //駒の有無、駒の種類
  this.id = -1;

  //駒の所有者 0:先手番 1:後手番
  this.player = 0;

  //移動可能かどうか
  this.movable = false;
};

//ゲーム開始
function init(){
  //id = 'world'のエレメントをキャンバスとする
  canvas = document.getElementById("world");
  //キャンバスサイズ 640×400
  canvas.width = 640;
  canvas.height = 400;

  //2次元コンテキストとして使用
  ctx = canvas.getContext('2d');

  //使用フォント
  ctx.font = "24px 'MS Pゴシック'";

  //フォントサイズを数値に変換
  //文字列を * 1演算により強制的に数値に変換
  var text = ctx.font;
  	/* テキスト描画の基準点を調べる
		var m=ctx.measureText(text);
		alert(m.actualBoundingBoxLeft);		//基準点から左枠まで -1 
		alert(m.actualBoundingBoxRight); 	//基準点から右枠まで 約240
		alert(m.actualBoundingBoxAscent); 	//基準点から上枠まで 21
		alert(m.actualBoundingBoxDescent);	//基準点から下枠まで 5
	*/ 
  text = text.slice(0,text.indexOf('px'));
  ctx_font_size = text * 1;

  //端末のOSタイプ取得
  user = window.navigator.userAgent.toLowerCase();

  //端末を判断して、タブレットおよびスマホではタッチ、PCではマウスダウンのイベントリスナを登録
  var touch_flg = false;
  for(var i=0; i<username.length; i++){
    if(user.indexOf(username[i]) >= 0){
	touch_flg = true;
	break;
    }
  };

  if (touch_flg){
    document.addEventListener("touchstart", touchstart);
  } else {
    document.addEventListener("mousedown", mousedown);
  };

  //将棋盤board配列の作成(横bwマス×縦bhマス)
  //各マス目のオブジェクトを格納
  board = new Array(bh);
  for (y=0; y<bh; y++) {
    board[y] = new Array(bw);
    for (x=0; x<bw; x++) {
      board[y][x] = new piece();
    };
  };

  //陣の配置
/*******
var setup = [
  [  7, 7, 7, 7, 7, 7, 7, 7, 7 ],
  [ -1, 2,-1,-1,-1,-1,-1, 1,-1 ],
  [  6, 5, 4, 3, 0, 3, 4, 5, 6 ]
]
  敵陣は逆になる

 *******/

  for (y=0; y<3; y++) {
    for (x=0; x<9; x++) {
      //自陣の初期配置
      //将棋盤部分での
      //七段目から九段目を9筋から1筋の方向へ並べる
      //将棋のマス目の基準は右上、プログラム上の基準は左上
      //プログラム上では、x,yともに昇順
      board[ofsy+y+6][ofsx+x].id = setup[y][x];
      board[ofsy+y+6][ofsx+x].player = 0;

      //敵陣の初期配置
      //3段目から1段目を1筋から9筋の方向へ並べる
      //将棋のマス目の基準は右上、プログラム上の基準は左上
      //プログラム上では、x,yともに降順
      board[ofsy+2-y][ofsx+8-x].id = setup[y][x];
      board[ofsy+2-y][ofsx+8-x].player = 1;
    };
  };
  redraw();
};

//タッチがあった場合の処理
function touchstart(e){
  //キャンバスの1タッチだけある場合
  if (e.targetTouches.length == 1){
    touch = e.targetTouches[0];

    //タッチした場合の各ピースの処理
    touchpiece(touch.pageX ,touch.pageY);
  }
}

//マウスダウンイベントがあった場合の処理
function mousedown(e){
  //マウスダウンした場合の各ピースの処理
  touchpiece(e.clientX ,e.clientY);
}

//座標から指定されたマス目に関する処理
function touchpiece(tx,ty){
  //横マス目の位置計算
  cx = Math.floor((tx-8)/psize);

  //縦マス目の位置計算
  cy = Math.floor((ty-8)/psize);

  //まず盤面または駒置でなかった場合は何もしない
  if (isinside(cx,cy,0,0,bw,bh)==false){
	return;
  }

  if (startx == -1){
    //駒を動かす前の状態ならば、駒を動かす処理に進む
    //駒を動かせる場所の表示
    movestart(cx,cy);
  } else {
    //駒を動かす処理中ならば、駒を移動を終わらせる処理に進む
    moveend(cx,cy);

    //駒を動かす前の処理状態を示す
    //動かす対象の駒のx方向位置を対象外のマス目にセット
    startx = -1;

    //全体描画を再描画する
    redraw();
  }
}

//駒を動かす処理を開始する
//選択した駒の移動可能範囲を表示する
function movestart(cx,cy){
　var pawn = 0;			//同一筋の自軍の歩の数を数える
  var temp_id = -1;		//マス目の一時的な駒情報保存
　var playerOfTemp_id = 0;	//マス目の一時的な駒の所有者情報保存

  var x = -1;			//x方向のマス目位置
  var y = -1;			//y方向のマス目位置
 
  //指定マス目の駒の有無、駒の種類
  //動かす対象として選択された駒の情報
  move_id = board[cy][cx].id;

  //駒がないマス目の場合は何もしない 
  if(move_id == -1){
     return;
  }

  //先手の駒か後手の駒かの判断
  var player = board[cy][cx].player;

  //手番でない駒が選択されていた場合には何もしない
  if(player != turn){
     return;
  }
  
  //動かす対象の駒の元の位置
  startx = cx;
  starty = cy;

  //各マス目の描画
  //背景色を白色にして選択された場所を表示
  drawpiece(startx,starty,move_id,player,2)

  //選択した駒が盤上の駒なのか持駒なのかの判断
  if (isinside(startx, starty, ofsx, ofsy, ban_w, ban_h) == false){
   /* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    選択された駒が盤外である(持駒が選択されている)場合
    二歩と桂、香、歩が打った後に動くことのできない位置を除けば、
    盤内の駒がない位置の全てに駒を打てることになる
   ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */

　　//9筋から1筋に向けて筋毎にチェック
    for (x = ofsx;x < (ofsx+ban_w);x++){
      //歩の数をチェック
      pawn = 0;
      //筋の段を走査し二歩となる歩が存在するかチェック
      for (y = ofsy;y < (ofsy+ban_h);y++){
        //二歩のチェックは、打とうとしてる駒が歩(move_id = 7)のときに必要であり、
        //打とうとしてる駒が歩でない場合は二歩のチェックは必要がない歩でない駒があった場合はループを抜ける
	if(move_id != 7){
	  break;
        }
        
        //マス目にある駒の情報
        temp_id = board[y][x].id;

        //マス目にある駒の所有者情報
        playerOfTemp_id = board[y][x].player; 
        
	//手番の駒であり、かつ　歩である場合
	if((playerOfTemp_id == turn) && (temp_id == 7)){
          pawn++;
          //基本的に二歩になっている状態はないのでループを抜ける
          break;
        }
      }
      /*******************
       pawn > 0とは、打とうとする駒が歩であり、調べた結果、その筋に自分の歩があったということ
       pawn = 0とは、打とうとする駒が歩でなく、全く歩のチェックをしていないか、
                     チェックしたが、その筋には自分の歩がなかった場合である
       よって、pawn > 0では二歩になるので打てる場所がその筋にはないのでスルーする
      *******************/
      if(pawn > 0)continue;

    /* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
       margin : 敵陣において、強制的にならないといけない場所の処理に使う　
               王 飛 角 金 銀 桂 香 歩 　
    ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */
     margin = [ 0, 0, 0, 0, 0, 2, 1, 1 ];

     /****************************
      0と1を、+1/-1の2値に変換する

      先手番のとき turn : 0
      後手番のとき trun : 1

      flip
       先手番のとき  1
       後手番のとき -1
      **************************/
      flip = 1-(turn * 2);

     /*******
      先手番のとき turn * 8 = 0
      後手番のとき turn * 8 = 8

      flip
       先手番のとき  1
       後手番のとき -1
　　　
　　　先手 王～銀 y=1、桂 y=3、香、歩 y=2
      後手 王～銀 y=9、桂 y=7、香、歩 y=8
      ★自陣から一番離れたy位置から走査するマス目の位置yを決定★
      *******/    
      y = ofsy + (turn * 8) + (margin[move_id] * flip);

      //筋(x:固定)の将棋盤内のマス目の段を自陣から遠い方から順番にマス目を走査する
      while(isinside(x, y, ofsx, ofsy, ban_w, ban_h) == true){
        //駒がない位置(-1)だった場合は駒がおける場所としてmovableを変更する
        if(board[y][x].id == -1){

          //drawpiece(位置X, 位置y, 駒情報, プレイヤー, 背景色)
          //駒がないなので、プレイヤーはどちらでもOK、背景色 3:ピンク色
          drawpiece(x, y, -1, 0, 3);
　　　　　
　　　　　//そのマス目を移動可能な場所とする
          board[y][x].movable = true;
        }
　　　　/*******************
          自陣から遠い方からマス目のy位置を走査しているので、
          先手番はyマス目は1つずつ足していく
          後手番はyマス目は1つずつ減らしていく
          flip : 先手番  1
                 後手番 -1
        *******************/
        y += flip;
      }
    }
    //持駒を打つ場合に、将棋盤内の空いているマス目に全て移動可能範囲に設定すれば処理としては完了
    return;
  }

/*******
  盤上の駒が選択された場合には、各駒の動きを示した、movetlb、move_x、move_y配列により
  各移動方向の移動先の駒の有無、駒情報を取得する
  移動先の状態(駒がない、自分の駒がある、相手の駒がある)により、移動可能かどうかを判断して、
  移動可能であれば、背景色をピンク色として描画する
 *******/
  for (var dir = 0;dir < 10;dir++){
    //移動前の選択された駒のマス目の位置
    x = startx;
    y = starty;

    //turnの[0,1]を[+1,-1]に変換する(説明はこの上のほうのflip変数出現時により詳しく説明済
    flip = 1 - (turn * 2);
   
    //動かす選択をした駒の10方向について駒の動きとして移動可能(>0)な間は処理し続ける
    while(movtbl[move_id][dir] > 0){

      //駒の動きによる移動後のマス目の位置
/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
	var move_x = [ 0, 1, 1, 1, 0,-1,-1,-1, 1,-1];
	var move_y = [-1,-1, 0, 1, 1, 1, 0,-1,-2,-2];
★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */
      x += move_x[dir];
      y += move_y[dir] * flip;

      //駒の動きによる移動後のマス目が将棋盤外の場合はループ処理から抜ける
      if(isinside(x, y, ofsx, ofsy, ban_w, ban_h) == false){
         break;
      }

      //移動先マス目の駒の有無、駒の情報
      temp_id = board[y][x].id;

      //移動先マス目の駒の所有者
      playerOfTemp_id = board[y][x].player;

      //自分の駒が移動先にある場合は移動できないので、処理から抜ける
      if((temp_id != -1) && (turn == playerOfTemp_id)){
        break;
      }

      //drawpiece(位置X, 位置y, 駒情報, プレイヤー, 背景色)
      //相手の駒と駒がない場合に、背景色 3:ピンク色でマス目を描画する
      drawpiece(x, y, temp_id, playerOfTemp_id, 3);

　　　//そのマス目を移動可能な場所とする
      board[y][x].movable = true;

      //相手の駒がある場合には、その先に移動できないので、ループを抜ける
      //自分の駒がある場合は既にループを抜けているので、駒がある場合は相手の駒である
      if(temp_id != -1){
         break;
      }
      //動かす対象の駒の動きが1マス目しか移動できない場合はループを抜ける
      //複数マス目移動できるなら、盤外、自分の駒/相手の駒に当たるまで移動する
      if(movtbl[move_id][dir] == 1){
        break;
      }
    }
  }
}

//駒の移動候補先が表示されている状態でタッチがあった場合の処理
function moveend(endx,endy){
  //移動可能な位置がタッチされなかった場合は処理終了
  //処理から抜けると、その先の処理で駒の移動候補先処理はリセットされる
  if(board[endy][endx].movable == false){
    return;
  }

  //移動対象の駒は既にmovestart処理で指定されている
  //グローバル変数のmove_idを使用
  //move_id = board[starty][startx].id;

/*******
  盤上での駒の移動元/移動先の位置により、駒が成るかどうかを判断する
　相手陣に入ってる状態かどうかを移動元/移動先について調べる
 *******/
  exist_start = isinside(startx, starty, ofsx, ofsy + 6 * turn, ban_w, 3);
  exist_end = isinside(endx ,endy , ofsx, ofsy + 6 * turn, ban_w, 3);

  //盤上にある駒が成ることができ、持駒を打つ場合はいきなり成ることはできない
  if (isinside(startx, starty, ofsx, ofsy, ban_w, ban_h) == true){
    //移動元/移動先のどちらかが相手陣である場合
    if((exist_start == true)||(exist_end == true)){

      //成っていない駒であり、かつ　成れる駒である場合
/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      'A | B' : バイナリビット演算子(論理和)
      A、Bをそれぞれバイナリビット表示して、論理和をとる
      
      //駒の動きによる移動後のマス目の位置
　　　例1 : move_id  0 : 0000　　　　　 nametbl[0]           : '王'
                     8 : 1000
           move_id | 8 : 1000 2値 → 8  nametbl[move_id | 8] : ''

　　　例2 : move_id  7 : 0111 　　　　　nametbl[7] 	     : '歩'
                     8 : 1000
           move_id | 8 : 1111 2値 → 15 nametbl[move_id | 8] : 'と'
  
★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */
      if((move_id < 8) && (nametbl[move_id | 8] != "")){
	//成るかどうかの確認ダイアログ
        if(confirm("成りますか？")){

　　　　　//'|=' ビット論理和(OR)の値を代入する(ビット論理は上の説明を参考に見る)
          //移動元の駒情報を成った駒に入れ換える
	  board[starty][startx].id |= 8;
        }
      }
    }
  }

  //移動先に駒がある(すなわち、相手の駒が)場合は、駒を取り持ち駒とする処理を行う
  //駒置き場は横方向のオフセット分をフルで使う
  if(board[endy][endx].id != -1){
/*******
　　A * (1-turn) + B * turn
    先手番の位置 : A * (1 - turn)　先手番に指定したい位置をAに指定、後手番は0になる
    後手番の位置 : B * turn	   後手番に指定したい位置をBに指定、先手番は0になる
　　合わせて使うと、A * (1 - turn) + B * turnとすることで、1つの式で同時に2つの異なる位置指定が可能

    tx : 横方向の並べはじめるマス目のx方向位置
      先手番 tx:14　
      後手番 tx: 4

    ty : 縦方向の並べはじめるマス目のy方向位置 
      先手番 ty: 8
      後手番 ty: 1

　　dx : 横方向の移動
      先手番 dx: 1
      後手番 dx:-1
    dy : 縦方向の移動
      先手番 dy:-1
      後手番 dy: 1 
 *******/
　　//駒置き場の横方向の開始位置
    tx = (1 - turn) * (bw - ofsx) + turn * (ofsx - 1);

    //駒置き場の縦方向の開始位置
    ty = (1 - turn) * (bh - (ofsy + 1)) + turn * ofsy;

　  //駒置き場での横方向の移動量
    //(1-turn) * 1  + turn *(-1)をまとめる
    dx = 1 - (turn * 2);

    //駒置き場での縦方向の移動量
    //(1-turn) * (-1) +turn * 1をまとめる
    dy = (turn * 2) - 1;
　　
　　//自分の王以外の駒40枚すべてを持ち駒とする場合を想定
    for (var i=0;i < 40;i++){
      //%:剰余演算子
      x = tx + (i % ofsx) * dx;

      // '/':除算演算子
      y = ty + Math.floor(i / ofsx) * dy;

      //駒がない場所(つまり、持駒をおけるスペース)を見つけたらループを抜ける      
      if(board[y][x].id == -1){
	break;
      }
    }

    //取った相手の駒を表の状態にして、駒置き場の空きスペースに置く
    //移動先にあった相手の駒を表の状態を示すidに戻す
　　//board[endy][endx].id & 7 
    board[y][x].id = board[endy][endx].id & 7;

    //現在の手番が駒の所有者 
    board[y][x].player = turn;
  }

  //相手の駒をとって、自分の駒を置く
  //移動先(相手の駒のあった所)へ移動元(自分の駒のあった所)の駒情報を移す 
  board[endy][endx].id = board[starty][startx].id;

  //移動先の駒は手番の駒なので、駒の所有者情報を変更
  board[endy][endx].player = turn;

  //移動元は駒がなくなったので、駒情報を変更
  board[starty][startx].id = -1;

/*******
　　^ : バイナリビットXOR(exclusiv OR)論理和
    A ^ B : AかつBを除いたすべて
            (Aではない)かつ(Bではない)
　　A  B   A XOR B   
    0  0      0
    1  0      1
    0  1      1
    1  1      0      

　　^= : A ^= B はつまり、A = A ^ B
 *******/
  //手番の交代

  turn ^= 1;
}

//マス目一つの描画
/******
 x 	: 全体での横X位置
 y 	: 全体での縦Y位置
 id  	: その位置の駒情報(駒の有無/駒の種類)
 player : 駒の所有者(先手/後手)
 color  : 背景色(将棋盤の内か外)
******/
function drawpiece(x,y,id,player,color){
  //指定位置の左上の座標
  px = x*psize;
  py = y*psize

  /*
    //文字の縦位置の調査用のコード
    ctx.textBaseline = 'top';
    ctx.textBaseline = 'hanging';
    ctx.textBaseline = 'middle';
    ctx.textBaseline = 'alphabetic'; //ディフォルト
    ctx.textBaseline = 'ideographic';
    ctx.textBaseline = 'bottom';
  */

  //塗りつぶしの矩形外枠の色を指定
  ctx.fillStyle = boxcolor[color];

  //塗りつぶしの矩形を描画
  ctx.fillRect(px, py, psize, psize);

  //少し小さい矩形を描画することで外枠があるようになる
  //背景色
  ctx.fillStyle = fillcolor[color];

  //少し小さい矩形を描画することで外枠の幅1
  ctx.fillRect(px + 1, py + 1, psize - 2, psize - 2);

  //駒がない場合スルー
  if(id == -1){
     return;
  }

  /********
   id : 0～7 表の駒の種類、8～15 裏の駒の種類
   裏の駒は2^3と3bit目が常に1である
   id >> 3 : 3ビット右にシフトすると、常に2^0の1ビット目が常に1となる
   これと、1との論理積(どちらのビットも1)になっている所だけ抜き出す 
   → 0～7:表で、((id >>3) & 1) = 0、8～15:裏で、((id >>3) & 1) = 1

   id<8 ? 0:1;と同じだが、ビット演算の方が高速？ 
  ********/
  ctx.fillStyle = fontcolor[(id >> 3) & 1];
//  ctx.fillStyle = fontcolor[(id<8) ? 0:1];

/* ★★★★★★★★
 文字自体が回転して描画されることはなく、常に上下左右そのままの状態で描画される
 したがって、上下逆の文字を描画したければ、上下逆のキャンバス(つまり、180°回転したキャンパス)に
 上下左右が普通のテキストを描画し、そこから、元の状態にキャンパスを戻すと、上下反転した文字を描画したことになる

 よって、
    文字を描画するときの座標位置は、キャンパスの回転とともに回転した位置
    文字の描画が終われば、キャンパスを回転させて、元のキャンパス位置に戻す
 ★★★★★★★★*/
  //後手の駒の場合は文字を上下逆で描画
  if(player){
    //180°回転したキャンパスでの文字を描画すべき位置に変更
     /*****k
      上下反転した文字の基準位置は、通常表示の左上から、右下に移動している 
      px → px+psize
      py → py+psize

      -x=cos(x+π)
      -y=sin(y+π)
     *****/
    px = -(px+psize);
    py = -(py+psize);

    //180°(π)回転
    ctx.rotate(Math.PI);
  }

  //文字の描画
  //ctx.fillText(nametbl[id], px+4, py+24,300);
  //32×32のマス目の中央に24pxサイズの文字をきれいに配置しようとした場合の計算式
  ctx.fillText(nametbl[id], px+((psize - ctx_font_size) / 2), py+ctx_font_size,300);

  //後手番の描画の場合にはキャンパスを回転させて元に戻す
  if(player)ctx.rotate(Math.PI);
}

//将棋盤内か外かの判断
/******
 ax : 将棋盤までのx方向オフセット
 ay : 将棋盤までのy方向オフセット
 W  : 将棋盤の横マス数(囲碁の盤面にするなど応用が可能)
 h  : 将棋盤の縦マス数(囲碁の盤面にするなど応用が可能)
******/
function isinside(x,y,ax,ay,w,h){
  if((x<ax)||(x>=(ax+w))||(y<ay)||(y>=(ay+h))){
	return(false);
  }else{
        return(true);
  }
}

//将棋盤内外の全てのマス目の再描画
//個別のマス目の状態を調べ
function redraw(){
  for (y=0; y<bh; y++){
    //表の色か裏の色かの変数
    var c=1;
    for (x=0; x<bw; x++){
      if(isinside(x,y,ofsx,ofsy,ban_w,ban_h)){
	  c=1;
      }else{
          c=0;
      }
      id = board[y][x].id;
      player = board[y][x].player;
      //マス目の描写
      drawpiece(x,y,id,player,c);

      //全てのマス目の設定を移動不可で初期化
      board[y][x].movable = false;
    }
  }
  ctx.fillStyle = fontcolor[0];

  //最大幅300で先手番か後手番かの文字を表示
  //  ctx.fillText(playtbl[turn] ,280 ,(1-turn)*318+26,300);
  //  y位置は上は 2マス目のpsize+2を基準、下は、11マス目のpsizeを基準にしたい
  //  これにより、上は下側に、下は上側に寄った配置となり、将棋盤に近い形でテキストを表示できる 
  ctx.fillText(playtbl[turn] ,ofsx * psize+ban_w / 2 * psize - ctx_font_size, (1-turn) * ((bh - 1) * psize -2) + (ctx_font_size+2) ,300);
}