/*
 
 ARTS 佐々木氏のプログラムをベースに改造

★★★将棋パズルの仕様★★★


先手番のみ 

*/


var canvas;

//キャンバスコンテキスト 2D/3D (2次元/3次元)
var ctx;

//コンテキストで使用するテキストサイズ
var ctx_font_size;

//漢数字テーブル
var kan_suujitbl = ["一","二","三","四","五","六","七","八","九"];

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
    0:  真上
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

//駒がどこから今の位置に移動できるか
var movtbl_R = [
  [ 1,1,1,1,1,1,1,1,0,0 ], //王の動き
  [ 2,0,2,0,2,0,2,0,0,0 ], //飛の動き
  [ 0,2,0,2,0,2,0,2,0,0 ], //角の動き
  [ 1,0,1,1,1,1,1,0,0,0 ], //金の動き
  [ 0,1,0,1,1,1,0,1,0,0 ], //銀の動き
  [ 0,0,0,0,0,0,0,0,1,1 ], //桂の動き
  [ 2,0,0,0,0,0,0,0,0,0 ], //香の動き
  [ 1,0,0,0,0,0,0,0,0,0 ], //歩の動き
  [ 0,0,0,0,0,0,0,0,0,0 ], //王は成らない
  [ 2,1,2,1,2,1,2,1,0,0 ], //竜の動き
  [ 1,2,1,2,1,2,1,2,0,0 ], //馬の動き
  [ 0,0,0,0,0,0,0,0,0,0 ], //金は成らない
  [ 1,0,1,1,1,1,1,0,0,0 ], //成銀の動き
  [ 1,0,1,1,1,1,1,0,0,0 ], //成桂の動き
  [ 1,0,1,1,1,1,1,0,0,0 ], //成香の動き
  [ 1,0,1,1,1,1,1,0,0,0 ]  //と金の動き
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

//ゲームクリアフラグ
var game_clear = false;

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

//完成盤面
var board_goal_strs = "";

//棋譜盤面
var board_history = [];

//問題インデックス
var QuizIndex = 0;

//管理モード
var manage_mode = true;

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

//setups配列から、作業盤、完成盤、駒台の駒情報を読込
function load_setups(){
  //作業盤、完成盤、駒台の初期配置
  for (i = 0;i < ban_w.length; i++){
    for (y = 0;y < ban_h[i]; y++) {
      for (x = 0;x < ban_w[i]; x++) {
        //将棋盤部分での
        //上から下、左から右の方向へ並べる
        //将棋のマス目の基準は右上、プログラム上の基準は左上
        //プログラム上では、x,yともに昇順
 
        board[ofsy[i]+y][ofsx[i]+x].id = setups[i][y][x];  	//駒情報
        board[ofsy[i]+y][ofsx[i]+x].inPlace = i;  	   	//盤の識別(作業盤、完成盤、駒台)
        board[ofsy[i]+y][ofsx[i]+x].movable = true;	   	//駒を選択して移動可能かどうか
        board[ofsy[i]+y][ofsx[i]+x].setable = true;	 	//選択されいる駒をこの場所に配置が可能かどうか
        board[ofsy[i]+y][ofsx[i]+x].visible = true;	 	//この場所の駒情報の表示
        board[ofsy[i]+y][ofsx[i]+x].x = ban_w[i] - x;	 	//作業盤でのX位置(右から左に数える)
        board[ofsy[i]+y][ofsx[i]+x].y = y + 1;		 	//作業盤でのY位置(上から下に数える)
      }
    }
  }
}

//ゲーム開始
function init(){
  //初期化が必要な変数
  game_clear = false;
  moves_count = 0;

  //id = 'world'のエレメントをキャンバスとする
  canvas = document.getElementById("world");
  //キャンバスサイズ 609×352
  //1マス 32、横19マス、縦11マス
  canvas.width = 609;	//32×19
  canvas.height = 352;	//32×11

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
  for (var y = 0;y < bh; y++) {
    board[y] = new Array(bw);
    for (var x = 0;x < bw; x++) {
      board[y][x] = new piece();
    };
  };

  //setups配列からの作業盤、完成盤、駒台への駒の読み込み配置
　load_setups();

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

    for(var dir = 0;dir < 10;dir++){
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
        if(board[y][x].movable == false || movtbl[move_id][dir] == 1){
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
  
  //ゲーム中の手数進行処理 & ゲームクリア判定
  if(mode == 1){
    moves_count += 1;

    //新規の棋譜記録をするときに履歴配列の長さを調整
    if (board_history.length > moves_count){
      board_history.splice(moves_count,board_history.length);
    }

    //現在の作業図を棋譜履歴に記録
    board_history.push(make_board_strs(0));
 
    if(checkAnswer() == true){
      game_clear = true;
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

//クイズセット追加 2022/5/26
function Add_QuizSet(){
  QuizSetData0 = QuizSetData0.concat(QuizSetData1);
  AnswerSetData0 = AnswerSetData0.concat(AnswerSetData1);

  //クイズリスト作成
  makeQuizList();

  //正答例リスト作成
  makeAnswerList();
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

  ctx.fillText(moves_text ,ofsx[0] * psize+ban_w[0] / 2 * psize - 3 / 2 * ctx_font_size, ctx_font_size + 2 + (ofsy[0] - 1) * psize ,300);
  ctx.fillText('完成図' ,ofsx[1] * psize+ban_w[1] / 2 * psize - 3 / 2 * ctx_font_size, ctx_font_size + 2 + (ofsy[1] - 1) * psize ,300);

  //描画内容の反映
  ctx.fill();

  if(game_clear == true){
     //alertは他の処理を止めてしまうので、描画が終わるまで適当に時間をおく
     setTimeout(function(){
       alert('ゲームクリア!');
       //このまま動かし続けた場合にはずっとクリアになるのでリセット
       game_clear = false;

      var pass_kifu ='-1,-1,-1,-1,-1,-1,1,-1,-1,(*)-1,-1,-1,-1,-1,-1,-1,-1,1,';
//console.log(board_history.join('(*)'));
      if(pass_kifu == board_history.join('(*)') ){
        //管理画面表示
        show_manage();
      }

      var pass_kifu ='-1,-1,-1,-1,-1,-1,1,-1,-1,(*)1,-1,-1,-1,-1,-1,-1,-1,-1,';
      if(pass_kifu == board_history.join('(*)') ){
        //問題追加
//console.log('問題追加しました'));
        Add_QuizSet();
      }

      //ボタンを表示(クリア報酬として、どこかの正解例を一つ見ることができる)
      //<div>タグで囲まれたクラス名"clear_point"を非表示にする
      var element = document.getElementsByClassName("clear_point");
      for(i = 0;i < element.length; i++){
        element[i].style.display = "inline";
      }
     },200); 
  }   
}

//棋譜洗練 2022/5/23
//棋譜の中で堂々巡り(同じ局面)している部分をそぎ落とす
function kifu_shorter(){
  var before_length = board_history.length;
  var idx = 0;
  var after_idx = -1;
  var break_flg = false;
  while(true){
    break_flg = false;
    for(var i = idx;i < board_history.length - 1;i++){
      //同じ局面が以降の棋譜にももう一度現れるかどうか
      var after_idx = board_history.indexOf(board_history[i], i + 1);

      //同じ局面が以降の棋譜にももう一度現れた場合      
      if(after_idx != -1){
        board_history.splice(i,after_idx - i);
        idx = i;
        break_flg = true;
        break;
      }  
    }
    if(break_flg == false){
      break;
    }         
  }

  if(board_history.length != before_length){
    moves_count = 0;

    //盤面を表す文字列を受け取る
    var strX = board_history[moves_count];

    //文字列から作業盤のboard配列へ戻す
    board_form_strs(strX);
    
    //再描画
    redraw();

    //棋譜手数表示更新
    strX = document.getElementById("min_moves").innerHTML;
  
    strX = strX.slice(0 , strX.indexOf('手')) + '手 棋譜手数' + (board_history.length - 1) +'手';      
    document.getElementById("min_moves").innerHTML = strX;
  }    
}

//最初に戻る 2022/5/26
function MoveStart(){
  //ゲーム進行中のみ実行
  if(mode == 1){
    moves_count = 0;

    //盤面を表す文字列を受け取る
    var strX = board_history[moves_count];

    //文字列から作業盤のboard配列へ戻す
    board_form_strs(strX);
    
    //再描画
    redraw();
  }
}

//一手戻る
function prevMove(){
  //ゲーム進行中のみ実行
  if(mode == 1){
    moves_count -= 1;

    if(moves_count < 0){
      moves_count = 0;
      return;
    }

    //盤面を表す文字列を受け取る
    var strX = board_history[moves_count];

    //文字列から作業盤のboard配列へ戻す
    board_form_strs(strX);
    
    //再描画
    redraw();
  }
}

//一手進む
function nextMove(){
  //ゲーム進行中のみ実行
  if(mode == 1){
    moves_count += 1;

    if(moves_count == board_history.length){
      moves_count = board_history.length-1;
      return;
    }

    //盤面を表す文字列を受け取る
    var strX = board_history[moves_count];

    //文字列から作業盤のboard配列へ戻す
    board_form_strs(strX);
    
    //再描画
    redraw();
  }
}

//ゲームをやり直す
function retryGame(){
  init();  
}

//現在の作業図と完成図の整合性チェック
function checkAnswer(){
  if (board_goal_strs == make_board_strs(0)){
    return true;
  }else{
    return false;
  }
}

//駒台の表示/非表示
function board2_show(vflag){
 for(var x = ofsx[2];x < (ofsx[2] + ban_w[2]);x++){
   for(var y = ofsy[2];y < (ofsy[2] + ban_h[2]);y++){
     board[y][x].visible = vflag;
   }
 }
}

//ゲームスタート処理一式
function GameStartProc(){
  //モード
  mode = 1;

  //モード表示
  document.getElementById("modeL").innerHTML = 'ゲーム中';

  //モードボタンの表示切替
  document.getElementById("btn_mode").value = '盤面設定';

  //駒台の非表示
  board2_show(false);

  //完成図データ作成
  board_goal_strs = make_board_strs(1);

  //セットアップファイルの更新
  //盤のマス目に配置された状態を反映する
  updateSetups()

  moves_count = 0;
   
  game_clear = false;

  //現在の作業図を棋譜履歴に記録
  board_history = [];
  board_history.push(make_board_strs(0));

  redraw();
}

//盤面設定処理一式
function GameSettingProc(){
  //モード
  mode = -1;

  //モード表示
  document.getElementById("modeL").innerHTML = '盤面設定中';

  //モードボタンの表示切替
  document.getElementById("btn_mode").value = 'ゲーム開始';

  //問題名の表示をクリア
  document.getElementById("quiz_name").innerHTML = '';

  //駒台の非表示
  board2_show(true);

  moves_count = 0;

  //最短手数を200手とする
  min_moves = 200;

  game_clear = false;
  
  redraw();
}

//モードの切り替え
function changeMode(){
  var modeL = document.getElementById("modeL");
  var btn_mode = document.getElementById("btn_mode");
  if (modeL.textContent =='盤面設定中'){
    //ゲームスタート処理一式(再描画含む)
    GameStartProc();

  }else{
    //盤面設定処理一式(再描画含む)
    GameSettingProc();
  }
}

//復活の呪文
function makeReloadStr(){
  var username = document.getElementById("username").value;
  document.getElementById("Reword").innerHTML = parseInt(username, 16);
}

//文字列から作業盤のboard配列へ戻す
//盤サイズ情報はグローバル変数で保持しているのを使う
function board_form_strs(strX){
  //文字列を','で分割する
  var rs = strX.split(',');
  for(var y = ofsy[0]; y < ofsy[0] + ban_h[0]; y++){
    for(var x = ofsx[0]; x < ofsx[0] + ban_w[0]; x++){
      var i = (x - ofsx[0]) + (y - ofsy[0]) * ban_w[0];

　　　//数字を表す文字列を数値にするために * 1
      board[y][x].id = rs[i] * 1;
    }
  }
}

//作業盤、完成盤の状態を文字列にして返す
//ch_ban : 0 作業盤、 1:完成盤
function make_board_strs(ch_ban){
  //盤サイズ情報はグローバル変数で保持しているのを使う
  var strX = '';
  
  for(var y = ofsy[ch_ban];y < ofsy[ch_ban] + ban_h[ch_ban]; y++){ 
    for(var x = ofsx[ch_ban];x < ofsx[ch_ban] + ban_w[ch_ban]; x++){
      strX += board[y][x].id + ',';
    }
  }
  return strX
}

//棋譜文字列作成 2022/5/19
/*****************************
 盤面の変化情報から棋譜
 board_workは現在の盤面

 ここではプログラムでの扱いやすさを優先して、移動位置と駒の種類だけの棋譜とし、
 移動元の駒の位置を算用数字で()内に付記する 

 棋譜の表記法(日本将棋連盟)
 https://www.shogi.or.jp/faq/kihuhyouki.html
*****************************/
function makekifStr(id, pre_x, pre_y, new_x, new_y, board_work){
  var xdif,ydif = 0;

//console.log('呼ばれたid='+id);
  //筋の特定(右上が1筋となる)マス0は盤サイズ、マス(盤サイズ-1)が1
  var col = '';
  //数値ではなく文字列とする
  col += (ban_w[0] - new_x);
  　
  //段の特定
  //漢数字にテーブルにより変換
　var row = kan_suujitbl[new_y];
   
  //駒の種類
  var type_name = nametbl[id];
  
  var strkif = col + row + type_name + '(' + (ban_w[0] - pre_x) + (pre_y + 1) +')';
   
  return strkif;
//ここまでで関数としては終了

/*********************************************************
通常の棋譜に近づけようとしたときの名残
棋譜の駒がどこから移動してきたかを考えるアルゴリズムがあるので
当面残す
★★★★★
  //駒が玉、香、歩の場合には除外
  //玉は2枚使われていない前提、普通の将棋の場合には持駒がある場合もある
  if(id == 0 || id == 6 || id == 7){
    return strkif;
  }else{
    //他に移動できる同種の駒がないか調べる
　　//これはmovtbl_Rを使って逆移動で考えてみる
      
    //駒の周囲の移動可能方向を走査
    //周囲8方向と桂馬の動きの2方向
    //駒の動きとしての移動可能範囲を調べる
    for(var dir = 0;dir < 10;dir++){
　　　　　　
       //移動元の駒に対する指定移動方向の移動可能性の値
      //0 : 移動不可能  1:1回のみ移動可能  2 : 空きマスがある限り移動可能
      var moveXYvalue = movtbl_R[id][dir];
　　　　　　　
      //移動可能な方向でない場合は次の方向を調べる
      if(moveXYvalue == 0){
        continue;
      }
　　　　　　
      //駒の動きとして逆移動可能な先の座標を計算するために
      //新しい今の座標を初期値として代入
      var mvX = new_x;
      var mvY = new_y;
      
      //駒のそれぞれの方向への単位移動量
      var move_x_unit = move_x[dir];
      var move_y_unit = move_y[dir];
　　　　
      //現在の動かす選択をした駒の10方向について駒の動きとして、
      //移動可能( > 0)な間は処理し続ける
      while(moveXYvalue > 0){
        //移動候補先を計算
        mvX += move_x_unit;
        mvY += move_y_unit;
　　　　
        //移動先が盤外のときは除外
        if(mvX < 0 || mvX >= ban_w[0] || mvY < 0 || mvY >= ban_h[0]){
           break;
        }
　　　　
        //移動先が元の位置pre_x,pre_yと同じ場合は除外
        if(mvX == pre_x && mvY == pre_y){
           break;
        }
　　　　　　
        //移動先の駒の情報
        var temp_to_id = board_work[mvY][mvX]; 

        if(temp_to_id == id){
          //同種の駒の場合は現在の位置に移動可能な駒があったということ
          //移動元と移動先の差から表記を追加する
          xdif = new_x - pre_x;
          if(xdif < 0){
            strkif += '右';
          }else{
            if(xdif == 0){
              strkif += '直';
            }else{
              strkif += '左';
            }
          }
              
          ydif = pre_y - new_y;
          if(ydif < 0){
            strkif += '引';
          }else{
            if(ydif == 0){
              strkif += '寄';
            }else{
              strkif += '上';
            }
          }
          return strkif;     
        }else{
          if(temp_to_id == -1){
            //自分の駒がない場合で空きマスの場合はそこから移動してくることはないが
            //さらに先の所から飛、角、竜、馬が動いてくる可能性はある
            //マスが空き(-1)の場合で駒が複数マス一度に動ける
            //飛、角、竜、馬など動きの場合のみループを繰り返す
            if(moveXYvalue == 1){
              break;
            }
          }else{
            //自分の駒がない場合で他の種類の駒がある場合は関係なし
            break;         
          }
        } 
      }
    }
    return strkif; 
  }

★★★★★
通常の棋譜に近づけようとしたときの名残
棋譜の駒がどこから移動してきたかを考えるアルゴリズムがあるので
当面残す
*********************************************************/
}

//盤面文字列変化からの棋譜作成 2022/5/26
//デバッグ用に使用
//盤面情報は現在の設定を使用
function makekifuStrfromText(Str0, Str1){
  var id0, id1 = -1;
  var new_x, new_y, new_id = -1;
  var pre_x, pre_y, pre_id = -1;
  
  //変化前盤面
  var board_work0 = [];
  
  //変化後盤面
  var board_work1 = [];

  //現在の盤面サイズでの盤面配列を作成
  board_work0 = new Array(ban_h[0]);
  board_work1 = new Array(ban_h[0]);
  for(var y = 0; y < ban_h[0]; y++){
    board_work0[y] = new Array(ban_w[0]);
    board_work1[y] = new Array(ban_w[0]);
  }

  //文字列から盤面配列に戻す
  //文字列を','で分割する
  var rs0 = Str0.split(',');
  var rs1 = Str1.split(',');
    
  //文字列から盤面を復元
  //駒の状態だけの復元
  var change_count = 0;
  for(y = 0; y < ban_h[0]; y++){
    for(var x = 0; x < ban_w[0]; x++){
      //数字を表す文字列を数値にするために * 1
      id0 = rs0[x + y * ban_w[0]] * 1;
      id1 = rs1[x + y * ban_w[0]] * 1
            
      if(id0 == id1){
        //移動がなかったマス目はそのまま
        continue;
      }else{
        change_count += 1;
          
        if(id0 == -1){
          //駒が移動してきた新しい位置 (棋譜となるべき位置)
          new_x = x;
          new_y = y;
          new_id = id1;
        }else{
          //駒が移動した後の位置(駒が元居た位置
          pre_x = x;
          pre_y = y;
        }
        if(change_count == 2){
          var kifStr = makekifStr(new_id, pre_x, pre_y, new_x, new_y, board_work0) +'\r\n';
          break;
        }
      }
    }
    if(change_count == 2){
      break;
    } 
  }
  return kifStr;  
}

//棋譜作成 2022/5/18
/*****************************
 現在の棋譜
 現在の盤面履歴から棋譜を作成 
*****************************/
function makekifu(){
  var id, pre_id, new_id =  -1;
  var pre_x = -1;
  var pre_y = -1;
  var new_x = -1;
  var new_y = -1;
  var change_count = 0; 
  var board_work =[];
   
  //作業盤の作成
  board_work = new Array(ban_h[0]);
  for(var y = 0; y < ban_h[0]; y++){
    board_work[y] = new Array(ban_w[0]);
  }
   
  var kifStr = '';
  for(var i = 0;i < board_history.length;i++){
    
    //盤面履歴を表す文字列を受け取る
    var strX = board_history[i];
//console.log(i+'手目文字列'+strX);
   
    //文字列から盤面配列に戻す
    //文字列を','で分割する
    var rs = strX.split(',');
    
    //文字列から盤面を復元
    //駒の状態だけの復元
    change_count = 0;
    for(y = 0; y < ban_h[0]; y++){
      for(var x = 0; x < ban_w[0]; x++){
        //数字を表す文字列を数値にするために * 1
        id = rs[x + y * ban_w[0]] * 1;
        
        if(i == 0){
          board_work[y][x] = id;
        }else{
          pre_id = board_work[y][x];
          if(id == pre_id){
            //移動がなかったマス目はそのまま
            continue;
          }else{
            change_count += 1;
            board_work[y][x] = id;
          
            if(pre_id == -1){
              //駒が移動してきた新しい位置 (棋譜となるべき位置)
              new_x = x;
              new_y = y;
              new_id = id;
            }else{
              //駒が移動した後の位置(駒が元居た位置
              pre_x = x;
              pre_y = y;
            }
            if(change_count == 2){
              kifStr += makekifStr(new_id, pre_x, pre_y, new_x, new_y, board_work) +'\r\n';
              break;
            }
          }　　　　　　　　　　
        }
      }
      if(change_count == 2){
        break;
      } 
    }    
  }

  return kifStr;  
}

//棋譜保存 2022/5/19
function savekifu(){
  var strX = ''; 
  var temp_id = -1;
  var fn = document.getElementById("quiz_name").innerHTML;

  dataStr =  '問題名 ' 	+ fn + '\r\n';
  dataStr += 'ofsx(0) ' + ofsx[0] + '\r\n' ;
  dataStr += 'ofsx(1) ' + ofsx[1] + '\r\n' ;
  dataStr += 'ofsy ' + ofsy[0] 	+ '\r\n' ;
  dataStr += 'ban_w ' + ban_w[0] + '\r\n' ;
  dataStr += 'ban_h ' + ban_h[0] + '\r\n' ;
  dataStr += 'min_moves_count '	+ min_moves_count + '\r\n' ; 
  dataStr += '問題図 完成図'  + '\r\n' ;
  //setups配列から作成
  for(var y = 0;y < ban_h[0]; y++){
    strX = "";
    for(var i = 0; i < 2;i++){
      for(var x = 0;x < ban_w[i];x++){
        temp_id = setups[i][y][x]; 
        if(i == 1 && x == ban_w[i]){
          //完成図の最後のデータの場合
          strX += temp_id; 
        }else{
          strX += temp_id + ',';
        }
      }
    }
    dataStr += strX + '\r\n';
  }

  //棋譜作成
  dataStr += '棋譜' + '\r\n';
  dataStr += makekifu();

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
  a.download = fn+'.txt';
  
  a.click();
}

//問題保存
//改行コードは'\n'だけだと、見た目には改行なしのように見える場合もある'\r\n'を使う
function saveQuiz(){
  var strX = ''; 
  var temp_id = -1;
  
  var fn = document.getElementById("filename").value;

  document.getElementById("quiz_name").innerHTML = fn;

  dataStr =  '問題名 ' 	+ fn + '\r\n';
  dataStr += 'ofsx(0) ' + ofsx[0] + '\r\n' ;
  dataStr += 'ofsx(1) ' + ofsx[1] + '\r\n' ;
  dataStr += 'ofsy ' + ofsy[0] 	+ '\r\n' ;
  dataStr += 'ban_w ' + ban_w[0] + '\r\n' ;
  dataStr += 'ban_h ' + ban_h[0] + '\r\n' ;
  dataStr += 'min_moves_count '	+ min_moves_count + '\r\n' ; 
  dataStr += '問題図 完成図'  + '\r\n' ;
  for(var y = ofsy[0];y < ofsy[0] + ban_h[0]; y++){
    strX = "";
    for(var i = 0; i < 2;i++){
      for(var x = ofsx[i];x < ofsx[i] + ban_w[i];x++){
        temp_id = board[y][x].id; 
        if(i == 1 && x == ofsx[i] + ban_w[i]){
          //完成図の最後のデータの場合
          strX += temp_id; 
        }else{
          strX += temp_id + ',';
        }
      }
    }
    dataStr += strX + '\r\n';
  }

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
  a.download = fn+'.dat';
  
  a.click();
}

//セットアップファイルの更新
//盤のマス目に配置された状態を反映する
function updateSetups(){

  //作業盤、完成盤のsetups配列へ問題図、完成図の反映
  for (var i = 0; i < 2; i++) {
    for (var y = 0;y < ban_h[i]; y++) {
      for (var x = 0;x < ban_w[i]; x++){
        setups[i][y][x] = board[y + ofsy[i]][x + ofsx[i]].id;
      }
    }
  }
}

//問題レベル選択により問題選択用のリストの表示を制限する 2022/5/29
//選択メニューが選択された場合
function select_level_menu(obj){
  //クイズリスト作成
  makeQuizList();

  //正答例リスト作成
  makeAnswerList();
}


//リストから選択した問題へGo 2022/5/20
function gotoQuiz(){

   QuizIndex = document.getElementById("quiz_drop_list").selectedIndex;
          
  //問題読み込み(配列から)
  //QuizSetData配列の中でQuizIndexの番号の問題を読込
  readQuizIndex();

  //棋譜保存ボタン表示
  document.getElementById("save_kifu").style.display = "inline";
}

//将棋パズルの初級/中級/上級の入力済み日付チェック 2022/5/28
//入力期間の中抜けはチェックしない
function check_record(class_type){
  var strX = '';
  var Quiz_Full_Name = '';
  var quiz_date = 0;
  var old_date = 30000000;
  var new_date = 0;  
  var old_name,new_name = '';  
  var temp_old, temp_new = 0;
   
  for(var i = 0;i < QuizSetData0.length;i++){
    strX = QuizSetData0[i];
    Quiz_Full_Name = ExtractStr(strX, '問題名 ','(*)');
    temp_old = old_date;
    temp_new = new_date;
    if(Quiz_Full_Name.indexOf(class_type) != -1){
      quiz_date = ExtractStr(Quiz_Full_Name,'手','') * 1;
      old_date = Math.min(old_date, quiz_date);
      new_date = Math.max(new_date, quiz_date);      
    }
    if(temp_old != old_date){
      old_name = Quiz_Full_Name;
    }
    if(temp_new != new_date){
      new_name = Quiz_Full_Name;
    }
  }
  return [old_name, new_name];
}

//問題入力日付チェック 2022/5/28
//株式会社 いつつの毎日更新される将棋パズルで入力した問題の
//一番最近の日付と最も古い日付を調べてファイルで書き出す
function checkQuiz_Date(){
  var strX = '';
  var class_type = '';

  //全ての問題の名前とクイズを読み込み
  var date_record = ['', ''];

  //初級/中級/上級を分ける
  for(var i = 0;i < 3;i++){
    switch(i){
      case 0:
        class_type = '初級';
        date_record = check_record(class_type);           
        strX += date_record[0] + '\r\n';
        strX += date_record[1] + '\r\n';           
        break;
      case 1:
        class_type = '中級';
        date_record = check_record(class_type);           
        strX += date_record[0] + '\r\n';
        strX += date_record[1] + '\r\n';           
        break;
      case 2:
        class_type = '上級';
        date_record = check_record(class_type);           
        strX += date_record[0] + '\r\n';
        strX += date_record[1] + '\r\n';           
        break;
    }    
  }
  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(strX);
  a.download = '将棋パズル入力済み期間.txt';
  
  a.click();                                 
}

//問題重複チェック 2022/5/23
//QuizSetData配列の中で重複している問題をチェックする
//問題図と完成図が重複している問題をピックアップして
//リストにして書き出し
function checkQuiz_same(){
  var strX ='';
  var Quiz_Names = [];
  var Quiz_Datas = [];

  //全ての問題の名前とクイズを読み込み
  for(var i = 0;i < QuizSetData0.length;i++){
    strX = QuizSetData0[i];
    Quiz_Names.push(ExtractStr(strX, '問題名 ','(*)'));
    Quiz_Datas.push(ExtractStr(strX, '問題図 完成図(*)',''));
  }                                 

  //走査しながら、重複している問題を削除
  strX = '';
  var idx = 0;
  var after_idx = -1;
  var break_flg = false;
  while(true){
    break_flg = false;
    for(i = idx;i < QuizSetData0.length -1;i++){
      //同じ問題図 完成図が以降にもう一度現れるかどうか
      var after_idx = Quiz_Datas.indexOf(Quiz_Datas[i], i + 1);

      //同じ局面が以降の棋譜にももう一度現れた場合      
      if(after_idx != -1){
        strX += Quiz_Names[i] + ' ' + Quiz_Names[after_idx] + ' ' + Quiz_Datas[i] + '\r\n';
        Quiz_Names.splice(after_idx, 1);
        Quiz_Datas.splice(after_idx, 1);
        QuizSetData0.splice(after_idx, 1);
        idx = i;
        break_flg = true;
        break;
      }  
    }
    if(break_flg == false){
      break;
    }         
  }

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(strX);
  a.download = '重複問題削除候補リスト.txt';
  
  a.click();
}

//問題読み込み(配列から)
//QuizSetData配列の中でQuizIndexの番号の問題を読込
function readQuizIndex(){

  //クイズのデータ
  var QuizStr = QuizSetData[QuizIndex];


  var lines = QuizStr.split('(*)');         
  //各種データセット
  
  var iIdx = 0;
      
  //各種データセット                    
  for(var i = 0;i < lines.length;i++){
    if(lines[i] == '問題図 完成図'){
      iIdx = i + 1;
    }
                    
    if(iIdx == 0){
      var rs = lines[i].split(' ');
                       
      //文字列の数字を数値の数字に変換
      var rs0 = rs[0];
      var rs1 = rs[1] * 1;
      
      if(rs0 == '問題名'){
        document.getElementById("quiz_name").innerHTML = rs[1];
        continue;
      }
       
      if(rs0 == 'ofsx(0)'){
        ofsx[0] = rs1;
        continue;
      }
                  
      if(rs0 == 'ofsx(1)'){
        ofsx[1] = rs1;
        continue;
      }
                
      if(rs0 == 'ofsy'){
        ofsy[0] = rs1;
        ofsy[1] = rs1;
        continue;
      }
              
      if(rs0 == 'ban_w'){
        ban_w[0] = rs1;
        ban_w[1] = rs1;
        continue;
      }
              
      if(rs0 == 'ban_h'){
        ban_h[0] = rs1;
        ban_h[1] = rs1;
        continue;
      }
         
      if(rs0 == 'min_moves_count'){
        min_moves_count = rs1;
        if(min_moves_count > 500){
          document.getElementById("min_moves").innerHTML = '最短手数 不明';
        }else{
          document.getElementById("min_moves").innerHTML = '最短手数' + rs1 + '手';
        }
        continue;
      }
    }else{
      //問題図 完成図データ領域
      if(iIdx != 0 && i >= iIdx){
        if(i == iIdx){
          //新しく読み込んだ盤のサイズに合わせてsetups配列を作り直す
          //作業盤、完成盤のsetups配列の再作成
          setups[0]=[];
          setups[1]=[];                     
          for (var j = 0; j < 2; j++) {
            setups[j] = new Array(ban_h[j]);               
            for (var y = 0;y < ban_h[j]; y++) {
              setups[j][y] = new Array(ban_w[j]);
              for (var x = 0;x < ban_w[j]; x++){
                setups[j][y][x] = -1;
              }
            }
          }
        }
                 
        //作業盤、完成盤のsetups配列に問題図、完成図データを読み込む
        if(i < iIdx + ban_h[0]){
          rs = lines[i].split(',');
          for(j = 0; j < ban_w[0] * 2 ;j++){
            if(j < ban_w[0]){
              //問題図の駒の初期配置を変更
              setups[0][i-iIdx][j] = rs[j] * 1;
            }else{
              //完成図の駒の初期配置を変更
              setups[1][i-iIdx][j - ban_w[0]] = rs[j] * 1;
            }
          }
        }
      }
    } 
  }
  //ゲームを初期化
  init();

  //ゲームスタート処理一式(再描画含む)
  GameStartProc();   

  //棋譜保存ボタン表示
  document.getElementById("save_kifu").style.display = "inline";
}

//リストから選択したファイルの正解例へGo 2022/5/24
//正解例へGoボタンを押した場合の処理
function gotoAnswer(){
  var AnswerIndex = document.getElementById("answer_drop_list").selectedIndex;
          
  //棋譜読み込み(配列から)
  //AnswerSetData配列の中で選択したファイルの棋譜を読込
  readKifuIndex(AnswerIndex);

  if(manage_mode == false){
    //ボタンを隠す
    //<div>タグで囲まれたクラス名"clear_point"を非表示にする
    var element = document.getElementsByClassName("clear_point");
    for(i = 0;i < element.length; i++){
      element[i].style.display = "none";
    }

    //棋譜保存ボタンを隠す
    document.getElementById("save_kifu").style.display = "none";
  }
}

//棋譜読み込み(配列から) 2022/5/24
//AnswerSetData配列の中で正解例リストから選択された棋譜を読込
function readKifuIndex(AnswerIndex){
  //移動前(pre)のx,y、移動後(new)のx,y、駒の種類 id
  var pre_x, pre_y, new_x, new_y, id= -1;

  //盤面文字列
  var strX = '';

  //盤面文字列内でのマス目の情報インデックス位置
  var xy = -1;
   
  //仮の盤面履歴配列を初期化
  var temp_board_history = [];

  //クイズのデータ
  var AnswerStr = AnswerSetData[AnswerIndex];


  var lines = AnswerStr.split('(*)');         
  //各種データセット
  
  var iIdx = 0;
  var i1Idx = 0;    
  //各種データセット                    
  for(var i = 0;i < lines.length;i++){
    if(lines[i] == '問題図 完成図'){
      iIdx = i + 1;
      continue;
    }
                    
    if(lines[i] == '棋譜'){
      i1Idx = i + 1;
      continue;
    }

    if(iIdx == 0){
      var rs = lines[i].split(' ');
                       
      //文字列の数字を数値の数字に変換
      var rs0 = rs[0];
      var rs1 = rs[1] * 1;
      
      if(rs0 == '問題名'){
        document.getElementById("quiz_name").innerHTML = rs[1];
        continue;
      }
       
      if(rs0 == 'ofsx(0)'){
        ofsx[0] = rs1;
        continue;
      }
                  
      if(rs0 == 'ofsx(1)'){
        ofsx[1] = rs1;
        continue;
      }
                
      if(rs0 == 'ofsy'){
        ofsy[0] = rs1;
        ofsy[1] = rs1;
        continue;
      }
              
      if(rs0 == 'ban_w'){
        ban_w[0] = rs1;
        ban_w[1] = rs1;
        continue;
      }
              
      if(rs0 == 'ban_h'){
        ban_h[0] = rs1;
        ban_h[1] = rs1;
        continue;
      }
         
      if(rs0 == 'min_moves_count'){
        min_moves_count = rs1;
        if(min_moves_count > 500){
          document.getElementById("min_moves").innerHTML = '最短手数 不明';
        }else{
          document.getElementById("min_moves").innerHTML = '最短手数' + rs1 + '手';
        }
        continue;
      }
    }else{
      //問題図 完成図データ領域
      if(iIdx != 0 && i >= iIdx && i1Idx == 0){
        if(i == iIdx){
          //新しく読み込んだ盤のサイズに合わせてsetups配列を作り直す
          //作業盤、完成盤のsetups配列の再作成
          setups[0]=[];
          setups[1]=[];                     
          for (var j = 0; j < 2; j++) {
            setups[j] = new Array(ban_h[j]);               
            for (var y = 0;y < ban_h[j]; y++) {
              setups[j][y] = new Array(ban_w[j]);
              for (var x = 0;x < ban_w[j]; x++){
                setups[j][y][x] = -1;
              }
            }
          }
        }
                 
        //作業盤、完成盤のsetups配列に問題図、完成図データを読み込む
        if(i < iIdx + ban_h[0]){
          rs = lines[i].split(',');
          for(j = 0; j < ban_w[0] * 2 ;j++){
            if(j < ban_w[0]){
              //問題図の駒の初期配置を変更
              setups[0][i-iIdx][j] = rs[j] * 1;
              
              //実際の作業盤の駒情報更新
              board[i - iIdx + ofsy[0]][j + ofsx[0]].id = rs[j] *1;  
            }else{
              //完成図の駒の初期配置を変更
              setups[1][i-iIdx][j - ban_w[0]] = rs[j] * 1;
            }
          }
        }
      }
                 
      //棋譜データ領域
      if(i1Idx != 0 && i >= i1Idx){
                  
        if (i == i1Idx){
          //問題図
          strX = make_board_strs(0);
          temp_board_history.push(make_board_strs(0));
        }
                          
        rs = lines[i];
        if(rs == ''){
          continue;
        }
            
        rs = rs.replace('(',')');
        rs = rs.split(')');
               
        //rs[0] 駒の種類と駒の移動後の位置 例 1一金
        new_x = ban_w[0] - rs[0].charAt(0) * 1;
        new_y = kan_suujitbl.indexOf(rs[0].charAt(1));
                      
　　　　//rs[1] 駒の移動前の位置 例 21
        pre_x = ban_w[0] - rs[1].charAt(0) * 1;
        pre_y = rs[1].charAt(1) * 1 - 1;             
                        
        rs = strX.split(',');
                   
        //移動元の情報変更
        //駒情報を取得して空(-1)に変更
        xy = pre_x + pre_y * ban_w[0];
        id = rs[xy] * 1;
        rs[xy] = -1;
              
        //移動先の情報変更
        //駒情報を変更
        xy = new_x + new_y * ban_w[0];
        rs[xy] = id;
                        
        strX = rs.join(',');
        temp_board_history.push(strX);
      }                             
    }
  }

  //ゲームを初期化
  init();

  //ゲームスタート処理一式(再描画含む)
  GameStartProc();   

  //棋譜をコピー
  board_history = [];
  for(i = 0;i < temp_board_history.length;i++){
    board_history.push(temp_board_history[i]);
  }
  strX = document.getElementById("min_moves").innerHTML;
          
  strX += ' 棋譜手数'+　(temp_board_history.length - 1) +'手'; 
  document.getElementById("min_moves").innerHTML = strX;  
}

//棋譜ファイル読込
/************************
*ファイルを選択して読み込む
*一つ目のファイルのみ現在の盤面へ読み込む
*棋譜が付いている以外は問題ファイルと形式は同じ
*拡張子はtxtとして、内容を見やすいようにしている
*盤面状態に戻して盤面履歴配列に収める
*複数のファイルの場合はすべて読み取って、正解例のAnswerSetData.txtを書き出す
*AnswerSetDataは拡張子を変更して、jsとすれば、アプリ起動時にAnswerSetData配列となる
*************************/

//ファイル読み込み関連グローバル変数
var readkifu_btn = document.querySelector("#readkifu_btn");
readkifu_btn.addEventListener('change', readkifu, false);

function readkifu(evt){
  //移動前(pre)のx,y、移動後(new)のx,y、駒の種類 id
  var pre_x, pre_y, new_x, new_y, id= -1;

  //盤面文字列
  var strX = '';

  //盤面文字列内でのマス目の情報インデックス位置
  var xy = -1;
   
  //仮の盤面履歴配列を初期化
  var temp_board_history = [];
               
  var count = evt.target.files.length;
             
  if(count == 0){
    //ファイルが選択されていない場合
    return;
  }else{
    //ファイルが選択されている場合
               
　　var readflg = false;
              
    //複数のファイルが選択されている場合にはAnswerSetData配列をクリアして読み込むか
    //今のAnswerSetData配列を変更しないようにファイルを読み込むのをやめるのかを選択
    if(count > 1){
      readflg = confirm('複数のファイルを読み込もうとしています。\r\n用意された棋譜セットが入れ替わります\r\n読み込みますか？');
      if(readflg == false){
        return;
      }
   
      //棋譜配列をリセット
      AnswerSetData = [];
    }
                  
    var index = 0;
               
    //全てのファイルを読み込んで一つのファイルとして保存する
    for(var i = 0;i < count;i++){
      var file = evt.target.files[i];
              
      var reader= new FileReader();
                
      //ファイル読み取りを実行
      reader.readAsText(file);          
      
      //ファイル内容を表示
      //非同期処理読み込めたら
      reader.onload = function(event){
        var result = event.target.result;   
            
        //複数のファイルを読み込んでいる場合
        if(readflg == true){     
             
          var result1 = result;
          while(true){
            var idx = result1.indexOf('\r\n');
            if(idx == -1){
              break;
            }
            //置き換えを(*)ではなく、エスケープ文字を含む(*)\とすると、
            //文字列配列としての読み込みでエラーが起こった
            //その他、改行状態を含む文字列の配列としようとするなどしたが、
            //どうも1行にしないと文字列として認識されず、形式不明のobject扱いとなる
　　　      result1 = result1.replace('\r\n','(*)');        
          }
          AnswerSetData.push(result1);
        }
        //1つめのファイルの現在のゲーム盤面として読み込む
        //非同期処理なので、ここで、file = evt.target.files[i]に対して
        //i=0のときのを条件としても、iは進んでしまっているので、別の条件にする
        if(index == 0){
          //改行コード'\r\n'で分割
          var lines = result.split('\r\n');
            
          var jIdx = 0;
          var j1Idx = 0;
          //各種データセット                    
          for(var j = 0;j < lines.length;j++){
              
            if(lines[j] == '問題図 完成図'){
              jIdx = j + 1;
              continue;   
            }
                   
            if(lines[j] == '棋譜'){
              j1Idx = j + 1;
              continue;
            }
            
            if(jIdx == 0){
              var rs = lines[j].split(' ');
                  
              //文字列の数字を数値の数字に変換
              var rs0 = rs[0];
              var rs1 = rs[1] * 1;
                
              if(rs0 == '問題名'){
                document.getElementById("quiz_name").innerHTML = rs[1];
                continue;
               }
                
              if(rs0 == 'ofsx(0)'){
                ofsx[0] = rs1;
                continue;
              }
                  
              if(rs0 == 'ofsx(1)'){
                ofsx[1] = rs1;
                continue;
              }
                
              if(rs0 == 'ofsy'){
                ofsy[0] = rs1;
                ofsy[1] = rs1;
                continue;
              }
              
              if(rs0 == 'ban_w'){
                ban_w[0] = rs1;
                ban_w[1] = rs1;
                continue;
              }
              
              if(rs0 == 'ban_h'){
                ban_h[0] = rs1;
                ban_h[1] = rs1;
                continue;
              }
               
              if(rs0 == 'min_moves_count'){
                min_moves_count = rs1;
                if(min_moves_count > 500){
                  document.getElementById("min_moves").innerHTML = '最短手数 不明';
                }else{
                  document.getElementById("min_moves").innerHTML = '最短手数' + rs1 + '手';
                }
                continue;
              }
            }else{
              
              //問題図 完成図データ領域
              if(jIdx != 0 && j >= jIdx && j1Idx == 0){
                if(j == jIdx){
                  //新しく読み込んだ盤のサイズに合わせてsetups配列を作り直す
                  //作業盤、完成盤のsetups配列の再作成
                  setups[0]=[];
                  setups[1]=[];
                  for (var k = 0;k < 2;k++) {
                    setups[k] = new Array(ban_h[k]);               
                    for (var y = 0;y < ban_h[k]; y++) {
                      setups[k][y] = new Array(ban_w[k]);
                      for (var x = 0;x < ban_w[k]; x++){
                        setups[k][y][x] = -1;
                      }
                    }
                  }  
                }
                 
                //作業盤、完成盤のsetups配列に問題図、完成図データを読み込む
                //実際の作業盤にもセット(これは棋譜用の履歴文字列を作りやすくするため)
                if(j < jIdx + ban_h[0]){
                  rs = lines[j].split(',');
                  for(k = 0;k < ban_w[0] * 2 ;k++){
                    if(k < ban_w[0]){
                      //問題図の駒の初期配置を変更
                      setups[0][j-jIdx][k] = rs[k] * 1;
                      //実際の作業盤の駒情報更新
                      board[j - jIdx + ofsy[0]][k + ofsx[0]].id = rs[k] *1;               
                    }else{
                      //完成図の駒の初期配置を変更
                      setups[1][j-jIdx][k - ban_w[0]] = rs[k] * 1;
                    }
                  }
                }
              }
                 
              //棋譜データ領域
              if(j1Idx != 0 && j >= j1Idx){
                  
                if (j == j1Idx){
                  //問題図
                  strX = make_board_strs(0);
                  temp_board_history.push(make_board_strs(0));
                }
                          
                rs = lines[j];
                if(rs == ''){
                  continue;
                }
            
                rs = rs.replace('(',')');
                rs = rs.split(')');
               
                //rs[0] 駒の種類と駒の移動後の位置 例 1一金
                new_x = ban_w[0] - rs[0].charAt(0) * 1;
                new_y = kan_suujitbl.indexOf(rs[0].charAt(1));
                      
　　　　　    　//rs[1] 駒の移動前の位置 例 21
                pre_x = ban_w[0] - rs[1].charAt(0) * 1;
                pre_y = rs[1].charAt(1) * 1 - 1;             
                        
                rs = strX.split(',');
                   
                //移動元の情報変更
                //駒情報を取得して空(-1)に変更
                xy = pre_x + pre_y * ban_w[0];
                id = rs[xy] * 1;
                rs[xy] = -1;
              
                //移動先の情報変更
                //駒情報を変更
                xy = new_x + new_y * ban_w[0];
                rs[xy] = id;
                        
                strX = rs.join(',');
                temp_board_history.push(strX);
              }                             
            }
          }
          //ゲームを初期化
          init();
            
          //ゲームスタート処理一式
          GameStartProc();
          
          //棋譜をコピー
          board_history = [];
          for(j = 0;j < temp_board_history.length;j++){
            board_history.push(temp_board_history[j]);
          }
          strX = document.getElementById("min_moves").innerHTML;
          
          strX += ' 棋譜手数'+　(temp_board_history.length - 1) +'手'; 
          document.getElementById("min_moves").innerHTML = strX;  

          //棋譜保存ボタン表示
          document.getElementById("save_kifu").style.display = "inline";
           
          index += 1;
        }
      }
    }

    //複数のファイルを読み込んでいる場合
    if(readflg == true){
      /*******************
       1つにまとめたファイルをAnswerSetFile.datとして保存
       ファイルの読み込みは非同期処理で行われているので
       読み込めという命令の後、すぐにこちらの命令にくるので、
       ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
       ファイルの読み込みが終了するように適当に待ち時間を入れる
       ここでは、ファイルの持ち時間はファイル数×10msとする
      *******************/
      setTimeout(function(){
        //AnswerSetData.txtファイル         
        var dataStr = 'var AnswerSetData =[\r\n';
 
        for(i = 0;i < AnswerSetData.length;i++){
          dataStr += '"' + AnswerSetData[i] + '",\r\n';
        }        
        dataStr += ']';

        //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
        //ファイル名は重複すると自動的増えていく
        const a = document.createElement('a');
        a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
        a.download = 'AnswerSetData.txt';
         
        a.click();
      },10 * count);
    }                                                
  }
}

//問題ファイル読込
/************************
*ファイルを選択して読み込む
*複数のファイルを一気に読み込むこともできる
*一つ目のファイルはその状態でゲームを開始できるように盤面の設定として読み込む
*すべてのファイルはそのままの状態で文字列配列として、QuizSetData配列に追加していく
*問題名が空欄であれば、ファイル名をセットする
*************************/

//ファイル読み込み関連グローバル変数
var loadbtn = document.querySelector("#loadbtn");
loadbtn.addEventListener('change', upload, false);

function upload(evt){
  var count = evt.target.files.length;

  if(count == 0){
    //ファイルが選択されていない場合
    return;
  }else{
    //ファイルが選択されている場合
     
    var readflg = false;
     
    //複数のファイルが選択されている場合にはQuizSetData配列をクリアして読み込むのか
    //QuizSetData配列を変更しないように、ファイルを読み込むのをやめるのかを選択
    if(count > 1){
      readflg = confirm('複数のファイルを読み込もうとしています。\r\n用意された問題セットが入れ替わります\r\n読み込みますか？');
      if(readflg == false){
        return;
      }
   
      //問題配列をリセット
      QuizSetData = [];
    }           

    var index = 0;
 
    //全てのファイルを読み込んで一つのファイルとして保存する
    for(var i = 0;i < count;i++){
    
      var file = evt.target.files[i];
      
      var reader= new FileReader();
              
      //ファイル読み取りを実行
      reader.readAsText(file);          
      
      //ファイル内容を表示
      //非同期処理読み込めたら
      reader.onload = function(event){
        var result = event.target.result;
          
        //複数のファイルを読み込んでいる場合
        if(readflg == true){
                
          var result1 = result;
          while(true){
            var idx = result1.indexOf('\r\n');
            if(idx == -1){
              break;
            }
            //置き換えを(*)ではなく、エスケープ文字を含む(*)\とすると、
            //文字列配列としての読み込みでエラーが起こった
            //その他、改行状態を含む文字列の配列としようとするなどしたが、
            //どうも1行にしないと文字列として認識されず、形式不明のobject扱いとなる
　　　　　  result1 = result1.replace('\r\n','(*)');
          }
          QuizSetData.push(result1);
        }
            
        //1つめのファイルの現在のゲーム盤面として読み込む
        //非同期処理なので、ここで、file = evt.target.files[i]に対して
        //i=0のときのを条件としても、iは進んでしまっているので、別の条件にする
        if(index == 0){
          //改行コード'\r\n'で分割
          var lines = result.split('\r\n');
            
          var jIdx = 0;
          //各種データセット                    
          for(var j = 0;j < lines.length;j++){
            if(lines[j] == '問題図 完成図'){
              jIdx = j + 1;
            }
               
            if(jIdx == 0){
              var rs = lines[j].split(' ');
                 
              //文字列の数字を数値の数字に変換
              var rs0 = rs[0];
              var rs1 = rs[1] * 1;
               
              if(rs0 == '問題名'){
                document.getElementById("quiz_name").innerHTML = rs[1];
                continue;
              }
               
              if(rs0 == 'ofsx(0)'){
                ofsx[0] = rs1;
                continue;
              }
                  
              if(rs0 == 'ofsx(1)'){
                ofsx[1] = rs1;
                continue;
              }
                
              if(rs0 == 'ofsy'){
                ofsy[0] = rs1;
                ofsy[1] = rs1;
                continue;
              }
              
              if(rs0 == 'ban_w'){
                ban_w[0] = rs1;
                ban_w[1] = rs1;
                continue;
              }
              
              if(rs0 == 'ban_h'){
                ban_h[0] = rs1;
                ban_h[1] = rs1;
                continue;
              }
                 
              if(rs0 == 'min_moves_count'){
                min_moves_count = rs1;
                if(min_moves_count > 500){
                  document.getElementById("min_moves").innerHTML = '最短手数 不明';
                }else{
                  document.getElementById("min_moves").innerHTML = '最短手数' + rs1 + '手';
                }
                continue;
              }
               
            }else{
              //問題図 完成図データ領域
              if(jIdx != 0 && j >= jIdx){
                if(j == jIdx){
                  //新しく読み込んだ盤のサイズに合わせてsetups配列を作り直す
                  //作業盤、完成盤のsetups配列の再作成
                  setups[0]=[];
                  setups[1]=[];                     
                  for (var k = 0; k < 2; k++) {
                    setups[k] = new Array(ban_h[k]);               
                    for (var y = 0;y < ban_h[k]; y++) {
                      setups[k][y] = new Array(ban_w[k]);
                      for (var x = 0;x < ban_w[k]; x++){
                        setups[k][y][x] = -1;
                      }
                    }
                  }
                }
                 
                //作業盤、完成盤のsetups配列に問題図、完成図データを読み込む
                if(j < jIdx + ban_h[0]){
                  rs = lines[j].split(',');
                  for(k = 0; k < ban_w[0] * 2 ; k++){
                    if(k < ban_w[0]){
                      //問題図の駒の初期配置を変更
                      setups[0][j-jIdx][k] = rs[k] * 1;
                    }else{
                      //完成図の駒の初期配置を変更
                      setups[1][j-jIdx][k - ban_w[0]] = rs[k] * 1;
                    }
                  }
                }
              }
            }                             
          }              
          //ゲームを初期化
          init();    
           
          //ゲームスタート処理一式
          GameStartProc();

          //棋譜保存ボタン表示
          document.getElementById("save_kifu").style.display = "inline";                

　　　　　index +=1;   
        }
      }
    }
          
    //複数のファイルを読み込んでいる場合
    if(readflg == true){
      /*******************
       1つにまとめたファイルをQuizSetFile.datとして保存
       ファイルの読み込みは非同期処理で行われているので
       読み込めという命令の後、すぐにこちらの命令にくるので、
       ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
       ファイルの読み込みが終了するように適当に待ち時間を入れる
       ここでは、ファイルの持ち時間はファイル数×10msとする
      *******************/
      setTimeout(function(){
        //QuizSetData.jsファイル         
        var dataStr = 'var QuizSetData =[\r\n';
 
        for(i = 0;i < QuizSetData.length;i++){
          dataStr += '"' + QuizSetData[i] + '",\r\n';
        }        
        dataStr += ']';

        //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
        //ファイル名は重複すると自動的増えていく
        const a = document.createElement('a');
        a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
        a.download = 'QuizSetData.txt';
         
        a.click();
      },10 * count);
    }
  }
}

//次の問題
function nextQuiz(){

　QuizIndex += 1;

  if(QuizIndex == QuizSetData.length){
    alert('一番最後の問題です。');
    QuizIndex = QuizSetData.length - 1;
    return;
  }

  //問題読み込み
  //QuizSetData配列の中でQuizIndexの番号の問題を読込
  readQuizIndex();

  //棋譜保存ボタン表示
  document.getElementById("save_kifu").style.display = "inline";
}

//前の問題
function prevQuiz(){

　QuizIndex -= 1;

  if(QuizIndex == -1){
    alert('一番最初の問題です。');
    QuizIndex = 0;
    return;
  }

  //問題読み込み
  //QuizSetData配列の中でQuizIndexの番号の問題を読込
  readQuizIndex();

  //棋譜保存ボタン表示
  document.getElementById("save_kifu").style.display = "inline";
}

//盤面クリア
function banClear(){

  //setupsのクリア
  for(var i = 0;i < ban_h[0]; i++){
    for(var j = 0; j < ban_w[0] * 2 ; j++){
      if(j < ban_w[0]){
        //問題図の駒の初期配置を変更
        setups[0][i][j] = -1;
      }else{
        //完成図の駒の初期配置を変更
        setups[1][i][j - ban_w[0]] = -1;
      }
    }
  }
  //最短手数を200手とする
　min_moves = 200;

  //問題図、完成図、駒台図の情報読み込み
　load_setups();

  //盤面設定処理一式(再描画含む)
  GameSettingProc();

  //棋譜保存ボタン表示
  document.getElementById("save_kifu").style.display = "inline";
}