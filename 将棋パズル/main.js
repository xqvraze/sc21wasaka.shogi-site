/*
 
 ARTS 佐々木氏のプログラムをベースに改造

★★★将棋パズルの仕様★★★


進む >>
戻る <<
最後 >>|
最初 |<<

先手番のみ 

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
var setups = [
  [ //作業盤の初期配置
    [ -1,-1,-1],
    [ -1,-1,-1],
    [ -1,-1,-1]
  ],

  [ //完成盤の初期配置
    [ -1,-1,-1],
    [ -1,-1,-1],
    [ -1,-1,-1]
  ],

  [ //駒台の初期配置
    [ -1, -1, -1 ], //空白 
    [  0, -1, -1 ], //王 
    [  1,  9, -1 ], //飛 竜
    [  2, 10, -1 ], //角 馬
    [  3, -1, -1 ], //金　
    [  4, 12, -1 ], //銀 成銀
    [  5, 13, -1 ], //桂 成桂
    [  6, 14, -1 ], //香 成香
    [  7, 15, -1 ]  //歩 と
  ]
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

//2次元配列の盤を3箇所
//全マス目範囲の盤
var board = [];

//盤の横マス (作業盤/完成盤/駒台)
ban_w = [ 3, 3, 3];

//盤の縦マス (作業盤/完成盤/駒台)
ban_h = [ 3, 3, 9];

//マス目の横 19マス(固定)
var bw = 19;

//マス目の縦 11マス(固定)
var bh = 11;

//盤配置のXオフセット  (作業盤/完成盤/駒台)
var ofsx = [ 3, 8, 14];

//盤配置のYオフセット  (作業盤/完成盤/駒台)
var ofsy = [ 4, 4, 1];

//モード
//セットモードとする
var mode = -1;

//どの盤上の駒なのかの識別
var inPrace = -1;

//手数カウント
var moves_count = 0;

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

//完成図
var board_Gall =[];

//タブレット、スマホ端末のOS名
var username = ["ipad","iphone","android"];

//各マス目オブジェクトの作成
/*
  id : -1:駒なし 0～15: 駒の名前配列 nametblのindexの駒あり
  inPlace : -1:関係なし、0:スタート盤、1:完成盤、2:駒台
  movable : 選択した駒が移動可能かどうか
  setable : 駒の配置が可能かどうか、完成盤、駒台はゲーム中は配置不可
  visible : 表示/非表示 (駒台はセット時以外は非表示)
 */
function piece(){
  //駒の有無、駒の種類
  this.id = -1;

  //inPlace : -1:関係なし、0:スタート盤、1:完成盤、2:駒台
  this.inPlace = -1;

  //駒を選択して移動可能かどうか
  this.movable = false;

  //選択されいる駒をこの場所に配置が可能かどうか
  this.setable = false;

  //この場所の駒情報の表示
  this.visible = false;

  //駒の作業盤内でのX位置(将棋では右から左への数える)
  this.x = -1;

  //駒の作業盤内でのY位置(上から下へ数える)
  this.y = -1;
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

  //キャンパス全体の盤board配列の作成(横bwマス×縦bhマス)
  //各マス目のオブジェクトを格納
  board = new Array(bh);
  for (y = 0;y < bh; y++) {
    board[y] = new Array(bw);
    for (x = 0;x < bw; x++) {
      board[y][x] = new piece();
    };
  };

  //作業盤、完成盤、駒台の初期配置
  for (i = 0;i < ban_w.length; i++){
    for (y = 0;y < ban_h[i]; y++) {
      for (x = 0;x < ban_w[i]; x++) {
        //将棋盤部分での
        //上から下、左から右の方向へ並べる
        //将棋のマス目の基準は右上、プログラム上の基準は左上
        //プログラム上では、x,yともに昇順
 
        board[ofsy[i]+y][ofsx[i]+x].id = setups[i][y][x];  //駒情報
        board[ofsy[i]+y][ofsx[i]+x].inPlace = i;  	　　//盤の識別(作業盤、完成盤、駒台)
        board[ofsy[i]+y][ofsx[i]+x].movable = true;	 //駒を選択して移動可能かどうか
        board[ofsy[i]+y][ofsx[i]+x].setable = true;	 //選択されいる駒をこの場所に配置が可能かどうか
        board[ofsy[i]+y][ofsx[i]+x].visible = true;	 //この場所の駒情報の表示
        board[ofsy[i]+y][ofsx[i]+x].x = ban_w[i] - x;	 //作業盤でのX位置(右から左に数える)
        board[ofsy[i]+y][ofsx[i]+x].y = y + 1;		 //作業盤でのY位置(上から下に数える)

      }
    }
  }
  //再描画
  redraw();
}

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
  if ((cx < 0) || (cx >= bw) || ( cy < 0) || ( cy >= bh)){
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
  var x = -1;			//x方向のマス目位置
  var y = -1;			//y方向のマス目位置

  //非表示のマス目の駒は対象外
  //ゲーム中の駒台の上の駒は除外される
  if(board[cy][cx].visible == false){
    return;
  }

  //指定マス目の駒の有無、駒の種類
  //動かす対象として選択された駒の情報
  move_id = board[cy][cx].id;

  //駒がないマス目の場合は何もしない 
  if(move_id == -1){
     return;
  }

  //0: 作業盤, 1:完成盤、2駒台のどれの上の駒か
  inPlace =  board[cy][cx].inPlace;

  //ゲーム中の完成盤上の駒は対象外
  if(mode == 1 && inPlace == 1) {
    return;
  }

  //動かす対象の駒の元の位置
  startx = cx;
  starty = cy;

  //各マス目の描画
  //背景色を白色にして選択された場所を表示
  drawpiece(startx,starty,move_id,2)

  //盤面設定中かゲーム中により条件分岐
  //配置可能な場所の判定処理
  if(mode == 1){
    //ゲーム中 (作業盤内の駒のない場所にのみ動かせる)
    if(inPlace == 1){
      return;
    }
    //駒をおける場所をチェック(通常の将棋ルール)
    //ただし、行き場のない場所にも駒は移動可能

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
     
      //動かす選択をした駒の10方向について駒の動きとして移動可能(>0)な間は処理し続ける
      while(movtbl[move_id][dir] > 0){

        //駒の動きによる移動後のマス目の位置
/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
          var move_x = [ 0, 1, 1, 1, 0,-1,-1,-1, 1,-1];
	  var move_y = [-1,-1, 0, 1, 1, 1, 0,-1,-2,-2];
★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */
        x += move_x[dir];
        y += move_y[dir];
  
        //駒の動きによる移動後のマス目が作業盤外の場合はループ処理から抜ける
        if(board[y][x].inPlace != 0){
           break;
        }

        //移動先マス目の駒の有無、駒の情報
        temp_id = board[y][x].id;
  
        if (temp_id == -1){
  　　　　//drawpiece(位置X, 位置y, 駒情報, 背景色)
          //駒がない場合に、背景色 3:ピンク色でマス目を描画する
          drawpiece(x, y, temp_id, 3);
  
　    　　//そのマス目を移動可能な場所とする
          board[y][x].movable = true;
        }

        //動かす対象の駒の動きが1マス目しか移動できない場合はループを抜ける
        //複数マス目移動できるなら、盤外、自分の駒/相手の駒に当たるまで移動する
        if(movtbl[move_id][dir] == 1){
          break;
        }      
      }
    }
  }else{

    //盤面設定中(盤内ならば、どこへでも動かせる)
    //駒台の上の駒はなくならない
    //駒台の上には新たな駒は置くことができない
    //二歩はダメ
    //同種の駒がない場所はすべておける(駒があっても置き換わる)
    for(i = 0;i < 3;i++){
      for(x = ofsx[i];x < (ofsx[i] + ban_w[i]);x++){
        
        //自陣から一番離れたy位置
        var temp_y = ofsy[i];

        inPlace = board[temp_y][x].inPlace;
　　　　　
        //筋(x:固定)の将棋盤内のマス目の段を自陣から遠い方から順番にマス目を走査する
        while(inPlace != -1){
          temp_id = board[temp_y][x].id;
       
          //同種の駒でない場合はおける場所としてmovableを変更する
          //結果は同じなので、駒の種類の識別はせずにすべて置き換えられる処理としても良い
          if(temp_id != move_id){
             
            //drawpiece(位置X, 位置y, 駒情報, 背景色)
            //駒がないなので、プレイヤーはどちらでもOK、背景色 3:ピンク色
            drawpiece(x, temp_y, temp_id, 3);
　　　　　
　　　  　　//そのマス目を移動可能な場所とする
            board[temp_y][x].movable = true;
          }
          temp_y += 1;
          inPlace = board[temp_y][x].inPlace;
        }
      }
    }
    //持駒を打つ場合に、将棋盤内の空いているマス目に全て移動可能範囲に設定すれば処理としては完了
    return;
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

  //移動先に駒がある(すなわち、盤面設定中)場合は、移動先の駒情報を上書きするだけで良い
  //ただし、移動先が駒台の場合は上書きしない
  if(board[endy][endx].inPlace != 2){
    //移動先(相手の駒のあった所)へ移動元(自分の駒のあった所)の駒情報を移す 
    board[endy][endx].id = board[starty][startx].id;
  }

  //駒台の駒を他の場所に移す(つまり、盤面設定中)とき、駒台の駒は減らさない
  if(board[starty][startx].inPlace != 2){
    //移動元は駒がなくなったので、駒情報を変更
    board[starty][startx].id = -1;
  }
  
  if(mode == 1){
    moves_count += 1;
　　if(checkAnswer() == true){
      alert('良くできました');
    }
  }
}

//マス目一つの描画
/******
 x 	: 全体での横X位置
 y 	: 全体での縦Y位置
 id  	: その位置の駒情報(駒の有無/駒の種類)
 color  : 背景色(将棋盤の内か外)
******/
function drawpiece(x,y,id,color){

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

  //駒がない場合、あるいは駒の非表示設定の場合スルー
  if(id == -1 || board[y][x].visible == false){
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

  //文字の描画
  //32×32のマス目の中央に24pxサイズの文字をきれいに配置しようとした場合の計算式
  ctx.fillText(nametbl[id], px+((psize - ctx_font_size) / 2), py+ctx_font_size,300);
}

//キャンパスすべてのマス目の再描画
//個別のマス目の状態を調べ
function redraw(){
  for (y=0; y<bh; y++){
    //表の色か裏の色かの変数
    var c=1;
    for (x=0; x<bw; x++){
      if (board[y][x].inPlace == -1){
	  c=0;
      }else{
          c=1;
      }
      id = board[y][x].id;
      //マス目の描写
      drawpiece(x,y,id,c);

      //全てのマス目の設定を移動不可で初期化
      board[y][x].movable = false;
    }
  }
  ctx.fillStyle = fontcolor[0];

  //最大幅300で問題図、完成図、手番の文字表示
  //  y位置は上は 2マス目のpsize+2を基準、下は、11マス目のpsizeを基準にしたい
  //  これにより、上は下側に、下は上側に寄った配置となり、将棋盤に近い形でテキストを表示できる 
　var moves_text = moves_count + '手';
  if (moves_count == 0) moves_text = '問題図';

  ctx.fillText(moves_text ,ofsx[0] * psize+ban_w[0] / 2 * psize - 3 / 2 * ctx_font_size, ctx_font_size + 2 + ban_h[0] * psize ,300);
  ctx.fillText('完成図' ,ofsx[1] * psize+ban_w[1] / 2 * psize - 3 / 2 * ctx_font_size, ctx_font_size + 2 + ban_h[1] * psize ,300);
}

//現在の作業図と完成図のチェック
function checkAnswer(){
  for (var y = 0;y < ban_h[0]; y++) {
    for (var x = 0;x < ban_w[0]; x++) {
      if(board_Gall[y][x] != board[y + ofsy[0]][x + ofsx[0]].id){
        return false;
      }
    }
  }
  return true;
}

//完成図のボードデータ作成
function make_board_Gall(){
  board_Gall = new Array(ban_h[1]);
  for (var y = 0;y < ban_h[1]; y++) {
    board_Gall[y] = new Array(ban_w[1]);
    for (var x = 0;x < ban_w[1]; x++) {
      board_Gall[y][x] = board[y + ofsy[1]][x + ofsx[1]].id;
    };
  };
}

//駒台の表示/非表示
function board2_show(vflag){
 for(var x = ofsx[2];x < (ofsx[2] + ban_w[2]);x++){
   for(var y = ofsy[2];y < (ofsy[2] + ban_h[2]);y++){
     board[y][x].visible = vflag;
   }
 }
}

//モードの切り替え
function changeMode(){
　//モード切替
  mode *= -1;

  var modeL = document.getElementById("modeL");
　var btn_mode = document.getElementById("btn_mode");
  if (modeL.textContent =='盤面設定中'){
    modeL.textContent = 'ゲーム中';
    btn_mode.value = '盤面設定';

    //駒台の非表示
    board2_show(false);

    //完成図データ作成
    make_board_Gall();

    moves_count = 0;
  }else{
    modeL.textContent = '盤面設定中';
    btn_mode.value = 'ゲーム開始';
    moves_count = 0;

    //駒台の表示
    board2_show(true);
  }
 redraw();
}