/*

★★★漢字パズル★★★
2022/7/11作成開始

将棋パズルを基にしてているので、作成日付は錯綜した感じである




3×3=9マスの真ん中に空白マスを置く
上下左右に配した漢字と組み合わせたときに熟語となる1字を空白マスに入れる

選択 

*/


var canvas;

//キャンバスコンテキスト 2D/3D (2次元/3次元)
var ctx;

//コンテキストで使用するテキストサイズ
var ctx_font_size;

//管理用画面の表示
var manage_count = 0;

//初期配置
//熟語漢字の配置
var quiz_set_places = [
  [ 2, 1], //上
  [ 1, 2],  //左
  [ 2, 3],  //下
  [ 3, 2],  //右
];
  
var select_places = [
  [ 5, 1],  
  [ 5, 3],
  [ 7, 1],
  [ 7, 3],
];


//問題漢字
var Quiz_Kanji = ["近道", "歩道", "道草", "道楽"];

//選択肢漢字
var select_Kanji = ["道", "音", "日", "一"];

//ヒント
var hints = ["最短ルート", "歩行者が歩く部分", "寄り道のこと", "好きなことにふけること"];

//正解漢字
var correct_Kanji = "";

//二字熟語のみのリスト
var only_two_idioms = [];

//二字熟語のヒントリスト
var two_idiom_hints = [];

//解答漢字リスト
var answer_lists = ["あ"];

//文字の色 : 問題用の色、選択肢・解答の色
var fontcolor = ["black","maroon"];

//各マス目の外枠線の色
//背景 	: LimeGreen
// 	: gray
//	: bule
// 	: red
//var boxcolor = ["LimeGreen", "gray", "blue", "red", "brawn"];
var boxcolor = ["LimeGreen", "gray", "blue", "red"];


//各マス目の背景色
//背景 	: LimeGreen
//問題 	: khaki
//回答	: white
//var fillcolor = ["LimeGreen", "Khaki", "white"];
var fillcolor = ["LimeGreen", "Khaki", "white", "blue", "red"];

//1マス目のサイズ 64×64
var psize = 64;

//2次元配列の盤を2箇所
//全マス目範囲の盤
var board = [];

//マス目の横 9マス(固定)
var bw = 9;

//マス目の縦 4マス(固定)
var bh = 5;

//モード
//セットモードとする
var mode = -1;

//どの盤上の駒なのかの識別
var inPrace = -1;

//ゲームクリアフラグ
var game_clear = false;

//元号モード
var IsGengouMode = false;

//盤面
var board_history = [];

//問題インデックス
var QuizIndex = 0;

//管理モード
var manage_mode = true;

//選択肢を表示しないモード 2022/8/31
var IsDifficultMode = false; 

//選択肢を表示 2022/8/31
var IsSelectKanjiShow = true;

//タブレット、スマホ端末のOS名
var username = ["ipad","iphone","android"];

var audioC = document.getElementById("audioC");
var audioB = document.getElementById("audioB");

//元号漢字データ
var gengou_kanji = [];

//元号漢字のオブジェクトの作成 2022/8/13
/*
  kanji : 漢字
  times : 回数
  pre_times : 前出現回数
  back_kanji : 後ペア漢字
  back_times : 後出現回数
  pre_times : 前ペア漢字
*/
function gengou_kanji_piece(){
  this.inPlace = -1;
  this.kanji = '';
  this.kanji_color = 0;
  this.times = 0;
  this.pre_times = 0;
  this.back_kanji ='';
  this.back_times = 0;
  this.pre_kanji = '';
  this.visible = false;
  this.back_color = 0;
}

//各マス目オブジェクトの作成
/*
  id : -1:漢字なし 1: 漢字あり
  inPlace : -1:背景 0:漢字設定部 1: 空白
  movable : 選択した駒が移動可能かどうか
  setable : 駒の配置が可能かどうか、完成盤、駒台はゲーム中は配置不可
  visible : 表示/非表示 (駒台はセット時以外は非表示)
 */
function piece(){
  //表示場所の識別
  this.inPlace = -1;
  
  //この場所の漢字表示
  this.visible = false;

  //漢字
  this.kanji = "";

　//漢字の表示色
  this.kanji_color = 0;

  //ヒント
  this.hint = "";

  //マスのX位置(左から右へ数える)
  this.x = -1;

  //マスのY位置(上から下へ数える)
  this.y = -1;
};

//正解音を鳴らす
//2022/7/11
function correct_sound(){
  audioC.play();
}

//不正解音を鳴らす
//2022/7/11
function wrong_sound(){
  audioB.play();
}

//setups配列から、作業盤、選択肢盤の設定情報をセット
function load_setups(){
 board[2][2].inPlace = 1; 	// 空白設定

  //問題用漢字表示場所  
  for (var i = 0;i < quiz_set_places.length; i++){
    x = quiz_set_places[i][0];
    y = quiz_set_places[i][1];
    board[y][x].inPlace = 0;	// 漢字表示場所
  }

  //回答選択肢の漢字表示場所
  for (i = 0;i < select_places.length; i++){
    x = select_places[i][0];
    y = select_places[i][1];
    board[y][x].inPlace = 0;	// 漢字表示場所
  }
}

//問題作成 & セット
//2022/7/11 2022/8/31更新
function make_Quiz(){

  //問題用の熟語配列を作成
  make_Quiz_set();

  //選択肢を最初から表示しないモードの場合の処理 2022/8/31
  var Difficultflg = document.getElementById("forDifficult");

  IsDifficultMode = Difficultflg.checked;

  if(IsDifficultMode){
    IsSelectKanjiShow = false;
  }else{
    IsSelectKanjiShow = true;
  }

  //これは実質は使っていない
  board[2][2].kanji = correct_Kanji;
  board[2][2].visible = false;

  //問題用漢字表示場所
  var index = 0;
  for (var i = 0;i < quiz_set_places.length; i++){
    x = quiz_set_places[i][0];
    y = quiz_set_places[i][1];
    var kindex =  Math.floor(index / 2);  
    board[y][x].kanji = Quiz_Kanji[index].charAt(kindex);
    board[y][x].kanji_color = 0;
    board[y][x].visible = true;
    board[y][x].hint = hints[index];
   index += 1;
  }

  //回答選択肢の漢字表示場所
  index = 0;
  for (i = 0;i < select_places.length; i++){
    x = select_places[i][0];
    y = select_places[i][1];  
    board[y][x].kanji = select_Kanji[index];
    board[y][x].kanji_color = 1;
    //2022/8/31 更新
    board[y][x].visible = IsSelectKanjiShow
    index += 1;
  }
}

//漢字のグレードがレベル設定にあっているかどうか
//2022/7/12
function is_grade_ok(kanji){
  //レベル
  var str_level = document.getElementById("select_level").value;

  var strX = '';
  for (i = 1;i <= str_level*1;i++){ 
    strX += kanji_grader[i]; 
  }

  var id = strX.indexOf(kanji);
  if (id == -1){
    return false;
  }else{
    return true;
  }
}

//指定漢字が学年レベルの漢字の何番目かを取得 2022/7/13
function get_select_kanji_index(kanji){
  //レベル
  var str_level = document.getElementById("select_level").value;

  //学年レベルの一覧取得
  var str_level_kanji_list = kanji_grader[str_level * 1];

  //学年レベルの漢字からindexを一つ選ぶ = 正解にする漢字のidx
  var idx = str_level_kanji_list.indexOf(kanji);
  return idx;
}

//熟語に使われている漢字を習い終わっている学年を取得
function get_kanji_gradeAB(kanjiA,kanjiB){
　//学年レベル数取得
　var element = document.getElementById("select_level")
  var grade_number = element.length;

  var idx = -1;
  var levelA = -1;
  var levelB = -1;
  for(var i = 1;i < element.length;i++){
    //学年レベルの一覧取得
    if(levelA == -1){
      idx = kanji_grader[i].indexOf(kanjiA);
      if(idx != -1){
        levelA = i;
      }
    }
    if(levelB == -1){
      idx = kanji_grader[i].indexOf(kanjiB);
      if(idx != -1){
        levelB = i;
      }
    }
　　if(levelA != -1 && levelB != -1){
      return Math.max(levelA, levelB);
    }
  }
  return element.length; 
}

//漢字を習う学年を取得 2022/7/14
function get_kanji_grade(kanji){
　//学年レベル数取得
　var element = document.getElementById("select_level")
  var grade_number = element.length;

  for(var i = 1;i < element.length + 1;i++){
    var idx = kanji_grader[i].indexOf(kanji);
    if(idx != -1){
      return i;        
    }
  }  
}

//出題可能な漢字かどうかのチェック
//出題可能(1番目、2番目の漢字になる熟語がそれぞれ2つ)あるかどうか
function able_to_ask(kanji){
  var grade_level = get_kanji_grade(kanji);

  var first = 0;
  var second = 0;
  for(var i = 0;i < only_two_idioms.length; i++){
    strX = only_two_idioms[i];
    var idx = strX.indexOf(kanji);
    if(idx != -1){

      var pair_kanji = strX.charAt(1-idx);      
      var pair_level = get_kanji_grade(pair_kanji);

      if(pair_level <= grade_level){
        if(idx == 0){
          first++;
        }else{
          second++;
        } 
      }
    }
    if(first >= 2 && second >= 2){
      return true;
    }   
  }
  return false;
}

//学年別漢字使用状況チェック 2022/7/14
//出題可能(1番目、2番目の漢字になる熟語がそれぞれ2つ)あるかどうか
function check_kanji_use_number(){
　var len_ary = document.getElementById("select_level").length + 1;
  var grade_idioms = new Array(len_ary);
  var grade_idioms_kanji = new Array(len_ary);
  for(var i = 0;i < len_ary;i++){
    grade_idioms[i] = 0;
    grade_idioms_kanji[i] ='';
  }

  for(i = 1;i < len_ary;i++){
    var len_ary1 = kanji_grader[i].length;
    for(j = 0;j < len_ary1;j++){
      if(able_to_ask(kanji_grader[i][j])){
        grade_idioms[i] += 1;
      }else{
        grade_idioms_kanji[i] += kanji_grader[i][j];
      }
    } 
  }

  var dStrX = '';
  for(i = 1;i < grade_idioms.length;i++){
    len_ary = kanji_grader[i].length;
    if(i < 7){
      dStrX += '小学' + i + '年 ' + grade_idioms[i] + ' / ' + len_ary + ' ' + grade_idioms_kanji[i] + '\r\n';
    }else{
      var idx = i - 6;
      dStrX += '中学' + idx + '年 ' + grade_idioms[i] + ' / ' + len_ary + ' ' + grade_idioms_kanji[i] + '\r\n';
    }
  }

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(dStrX);
  a.download = '学年別出題可能な漢字数.txt';  
  a.click();                                 
}

//学年別熟語数 2022/7/14
function check_idioms_number(){
　var len_ary = document.getElementById("select_level").length + 2;
  var grade_idioms = new Array(len_ary);
  for(var i = 0;i < len_ary;i++){
    grade_idioms[i] = 0;
  }

  for(i = 0;i < only_two_idioms.length; i++){
    strX = only_two_idioms[i];
    var pair_Kanji0 = strX.charAt(0);
    var pair_Kanji1 = strX.charAt(1);

    //漢字を習う学年を取得
    var grade_level = get_kanji_gradeAB(pair_Kanji0, pair_Kanji1);

    grade_idioms[grade_level] += 1;
  }

  var dStrX = '';
  for(i = 1;i < grade_idioms.length;i++){
    if(i < 7){
      dStrX += '小学' + i + '年 ' + grade_idioms[i] + '\r\n';
    }else{
      var idx = i - 6;
      dStrX += '中学' + idx + '年 ' + grade_idioms[i] + '\r\n';
    }
  }

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(dStrX);
  a.download = '学年別該当熟語数.txt';  
  a.click();                                 
}

//回答数チェック 2022/7/14
//出題の回答に該当する漢字の数をチェックする
//出題形式は固定
//本来、正解数が複数となる場合はやり直しのために利用しようとしたが、
//それでは、出題可能となる問題数が少なくなるので、提示する選択肢により
//正解数を一つに絞れるように、正解となる漢字を戻り値とする
function check_answer_number(){
  var answer_kanji = new Array(Quiz_Kanji.length);
  for(var i = 0;i < Quiz_Kanji.length;i++){
    answer_kanji[i] = '';
  }

  for(var i = 0;i < only_two_idioms.length;i++){
    var strX = only_two_idioms[i];

    var pair1 = strX.charAt(0);
    var pair2 = strX.charAt(1);

    for(var j = 0;j < Quiz_Kanji.length;j++){
      var strX1 = Quiz_Kanji[j];
      if(j < 2){
        if(pair1 == strX1.charAt(0)){
          answer_kanji[j] += pair2;
        }
      }else{
        if(pair2 == strX1.charAt(1)){
          answer_kanji[j] += pair1;
        }
      }
    }
  }
//console.log(answer_kanji);

  select_strX = '';
  for(i = 0;i < answer_kanji[0].length;i++){
    strX = answer_kanji[0][i];
    
    if(answer_kanji[1].indexOf(strX) != -1){
      continue;
    }
    if(answer_kanji[2].indexOf(strX) != -1){
      continue;
    }
    if(answer_kanji[3].indexOf(strX) != -1){
      continue;
    }
    slect_strX = 'A' + + 'A';
  }
  return select_strX;
}

//問題用の熟語配列を作成
//4つの熟語、ヒント、答えの選択肢の配列をセット
//2022/7/12
function make_Quiz_set(){
  // レベル
  var str_level = document.getElementById("select_level").value;

  // 指定レベルまでの2つ乱数を発生させる
  var r1 = Math.random();
  var r2 = Math.random();

  // 乱数に偏りを持たせるために、2つの乱数を掛け合わせる
  var grade_level_value = str_level * 1 - Math.floor(r1 * r2 * (str_level * 1 -1));

  try{
    //学年レベルの漢字数取得
    var len_ary = kanji_grader[grade_level_value].length;
  }catch(e){
    //問題作成のやり直し
    make_Quiz_set();
    return;
  }

  //学年レベルの漢字からindexを一つ選ぶ = 正解にする漢字のidx
  var idx = Math.floor(Math.random() * len_ary);

  //正解にする漢字
  correct_Kanji = kanji_grader[grade_level_value][idx];
  
  //直近と同じ答えは使わない
  if(answer_lists.indexOf(correct_Kanji) != -1){
    //問題作成のやり直し
    make_Quiz_set();
    return;
  }

  //選択肢にする漢字の用意
  var str_select_X = 'A' + correct_Kanji + 'A';

  var strX ='';
  var top_left = [];		//上左用熟語配列
  var top_left_hints = [];	//上左用ヒント配列  
  var bottom_right = [];	//下右用熟語配列		
  var bottom_right_hints = [];	//下右用ヒント配列

  for(i=0; i < only_two_idioms.length - 1; i++){
    strX = only_two_idioms[i];
    var id = strX.indexOf(correct_Kanji);
    if(id == 1){
      var pair_Kanji = strX.charAt(0);
      if (is_grade_ok(pair_Kanji)){
        top_left.push(strX);
        top_left_hints.push(two_idiom_hints[i]);
        id = get_select_kanji_index(pair_Kanji);
        if(id != -1){
          str_select_X += 'A' + pair_Kanji + 'A';
        }
      }
    }else if(id == 0){
      var pair_Kanji = strX.charAt(1);
      if (is_grade_ok(pair_Kanji)){
        bottom_right.push(strX);
        bottom_right_hints.push(two_idiom_hints[i]);
        id = get_select_kanji_index(pair_Kanji);
        if(id != -1){
          str_select_X += 'A' + pair_Kanji + 'A';
        }
      }
    }
  }  

  len_ary = top_left.length;
  len_ary1 = bottom_right.length;
　if(len_ary < 2 || len_ary1 < 2){
    //問題作成のやり直し
    make_Quiz_set();
    return;    
  }　
  idx = Math.floor(Math.random() * len_ary);
  while(true){
    var idx1 = Math.floor(Math.random() * len_ary);
    if (idx != idx1){
      break;
    }
  }
  idx2 = Math.floor(Math.random() * len_ary1);
  while(true){
    var idx3 = Math.floor(Math.random() * len_ary1);
    if (idx3 != idx2){
      break;
    }
  }

  //問題漢字
  Quiz_Kanji = [top_left[idx], top_left[idx1], bottom_right[idx2], bottom_right[idx3]]; 

  //複数正解の場合の他の漢字リストを登録する
  str_select_X += check_answer_number();

  //ヒント
  hints =  [top_left_hints[idx], top_left_hints[idx1], bottom_right_hints[idx2], bottom_right_hints[idx3]]; 

  select_Kanji = [];
  len_ary = kanji_grader[str_level * 1].length;
  for (var i=0;i < 3;i++){

    while(true){
      idx = Math.floor(Math.random() * len_ary);
      var str_Kanji = kanji_grader[str_level * 1][idx];
      if (str_select_X.indexOf('A' + str_Kanji + 'A') == -1){
        str_select_X += 'A'+ str_Kanji + 'A';
        if(idx % 2 == 1){
          select_Kanji.push(kanji_grader[str_level * 1][idx]);
        }else{
          select_Kanji.unshift(kanji_grader[str_level * 1][idx]);        
        }
        break;
      }            
    }
  }

  //学年レベルの漢字からindexを一つ選ぶ = 正解にする漢字のidx
  idx = Math.min(Math.floor(Math.random() * 4),3);
  select_Kanji.splice(idx, 0, correct_Kanji);

  //解答漢字リスト
  answer_lists.push(correct_Kanji);
 
  if(answer_lists.length > 20){
    answer_lists.splice(0, 1);
  }
}

//元号モードサポート 2022/8/15
function initGengou(){
  IsGengouMode = true;

  //マス目の横 9マス
  bw = 10;

  //マス目の縦 4マス(固定)
  bh = 7;

  //1マス 64、横9マス、縦5マス
  canvas.width = 64 * bw;	//64×9
  canvas.height = 64 * bh;	//64×5

  //2次元コンテキストとして使用
  ctx = canvas.getContext('2d');

  //使用フォント
  ctx.font = "48px 'MS Pゴシック'";
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
      var Idx = bw * y + x;
      if(Idx < gengou_kanji.length){
        board[y][x] = gengou_kanji[Idx];
//console.log("x=" +x+ " y=" +y + " Idx=" + Idx+ " "+ board[y][x].kanji+ " "+ board[y][x].times);
      }else{
        board[y][x] = new gengou_kanji_piece();
      }
    };
  };

  //再描画
  redraw();
}

//ゲーム開始
function init(){
  //初期化が必要な変数
  game_clear = false;
  moves_count = 0;

  IsGengouMode = false;

  //マス目の横 9マス
  bw = 9;

  //マス目の縦 4マス(固定)
  bh = 5;

  //id = 'world'のエレメントをキャンバスとする
  canvas = document.getElementById("world");
  //キャンバスサイズ 576×320
  //1マス 64、横9マス、縦5マス
  canvas.width = 64 * bw;	//64×9
  canvas.height = 64 * bh;	//64×5

  //2次元コンテキストとして使用
  ctx = canvas.getContext('2d');

  //使用フォント
  ctx.font = "48px 'MS Pゴシック'";
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

  //setups配列からの作業盤、選択肢盤の読み込み配置
  load_setups();

  //問題作成
  make_Quiz();

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


//座標から指定されたマス目に関する処理(元号モード) 2022/8/15
function gengoutouch(tx,ty){

  //横マス目の位置計算
  cx = Math.floor((tx-8)/psize);

  //縦マス目の位置計算
  cy = Math.floor((ty-8)/psize);

  //まずマス目でなかった場合は何もしない
  if ((cx < 0) || (cx >= bw) || ( cy < 0) || ( cy >= bh)){
	return;
  }

  //一旦、すべてのバックカラーをリセット
  for(var y = 0;y < bh;y++){
    for(var x = 0;x < bw;x++){
      board[y][x].back_color = 0;
    }
  }

  //指定漢字
  var select_kanji = board[cy][cx].kanji;
  
  //指定漢字のマス目の色
  board[cy][cx].back_color = 1;

  //前ペア漢字
  var back_kanji = board[cy][cx].back_kanji;

  //前ペア漢字のマス目の色指定
  for(var y = 0;y < bh;y++){
    for(var x = 0;x < bw;x++){
      if(back_kanji.indexOf(board[y][x].kanji) >= 0){
        board[y][x].back_color = 2;
      }
    }
  }

  //後ペア漢字
  var pre_kanji = board[cy][cx].pre_kanji;

  for(var y = 0;y < bh;y++){
    for(var x = 0;x < bw;x++){
      if(pre_kanji.indexOf(board[y][x].kanji) >= 0){
        board[y][x].back_color = 3;
      }
    }
  }
  redraw();
}

//座標から指定されたマス目に関する処理 2022/8/31更新
function touchpiece(tx,ty){
  if(IsGengouMode){
    gengoutouch(tx,ty);
    return;
  }

  //横マス目の位置計算
  cx = Math.floor((tx-8)/psize);

  //縦マス目の位置計算
  cy = Math.floor((ty-8)/psize);

  //まずマス目でなかった場合は何もしない
  if ((cx < 0) || (cx >= bw) || ( cy < 0) || ( cy >= bh)){
	return;
  }

  //問題用漢字表示場所 : ヒント表示  
  for (var i = 0;i < quiz_set_places.length; i++){
    var x = quiz_set_places[i][0];
    var y = quiz_set_places[i][1];
    if ((cx == x) && (cy == y)){
      show_hint(x,y);
      return;
    }
  }

  //2022/8/31 更新
  if(IsSelectKanjiShow){
    //回答選択肢の漢字表示場所 : 回答チェック
    for (i = 0;i < select_places.length; i++){
      x = select_places[i][0];
      y = select_places[i][1];
      if ((cx == x) && (cy == y)){
        check_quiz(x,y);
        manage_count++;
        return;
      }
    }
  }

  //中央の正解場所のクリックの場合の処理 2022/8/31
  if(IsDifficultMode){
    if ((cx == 2) && (cy == 2)){
      IsSelectKanjiShow = true;

      //回答選択肢の漢字表示場所
      index = 0;
      for (i = 0;i < select_places.length; i++){
        x = select_places[i][0];
        y = select_places[i][1];  
       //2022/8/31 更新
       board[y][x].visible = IsSelectKanjiShow
       index += 1;
      }
      redraw();
    }
  }
}

//指定漢字の熟語リスト書き出し 2022/8/3
function output_idioms(kanji){
　var strXout = "";
  for(var i = 0;i < only_two_idioms.length - 1; i++){
    var strX = only_two_idioms[i];
    var id = strX.indexOf(kanji);

    if(id != -1){
      strXout += two_idioms[i] + "\r\n";
    }
  }

  //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
  //ファイル名は重複すると自動的増えていく
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(strXout);
  a.download = '個別漢字の熟語リスト.txt';
  
  a.click();                                 
}

//正誤判定 2022/7/11
function check_quiz(x,y){
  var kanji = board[y][x].kanji;
  if (kanji == correct_Kanji){
    //正解音
    correct_sound();

    manage_count = 0;

    //問題作成
    make_Quiz();

    //再描画
    redraw();
  }else{
    //不正解音
    wrong_sound();
    
    var manageflg = document.getElementById("forManage");
    if(manageflg.checked){ 
      if(able_to_ask(kanji)){
        board[y][x].kanji_color = 0;
      }
      //個別漢字の熟語リスト書き出し
      output_idioms(kanji);
    }

    if(manage_count > 10){
        //管理画面表示
        show_manage();
    }

    //再描画
    redraw();
  }
}

//ヒントのクリア 2022/7/11
function clear_hint(){
  y = 4;
  for (x = 0;x < bw;x++){
    drawpiece(x,y,0)
  }
}

//ヒント表示 2022/7/11
function show_hint(x,y){
  //ヒントのクリア
  clear_hint();

  var hint = board[y][x].hint;

  //指定位置の左上の座標
  px = psize;
  py = 4 * psize
  
  ctx.fillStyle = fontcolor[0];
  ctx.fillText(hint, px, py+ctx_font_size,300);
  ctx.font = "48px 'MS Pゴシック'"; 
}

//マス目一つの描画
/******
 x 	: 全体での横X位置
 y 	: 全体での縦Y位置
 color  : 背景色(問題用漢字、回答欄漢字、選択肢漢字)
******/
//2022/8/31 更新
function drawpiece(x,y,color){

  //指定位置の左上の座標
  px = x * psize;
  py = y * psize

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
  if(board[y][x].visible == false){
     return;
  }

  ctx.fillStyle = fontcolor[board[y][x].kanji_color];

  var kanji_text = board[y][x].kanji;

  //文字の描画
  //64×64のマス目の中央に48pxサイズの文字をきれいに配置しようとした場合の計算式
  ctx.fillText(kanji_text, px+((psize - ctx_font_size) / 2), py+ctx_font_size,300);
}

//キャンパスすべてのマス目の再描画
//個別のマス目の状態を調べ 2022/8/31更新
function redraw(){
  
  if(IsGengouMode){
    //元号モード時
    for (var y = 0; y < bh; y++){
      var c=1;
      for (var x = 0; x < bw; x++){
        if (board[y][x].inPlace == -1){
          c = 0;
        }else{
          c = board[y][x].back_color;
        }
        //マス目の描写
        drawpiece(x,y,c);
      }
    }
  }else{
    for (y = 0;y < bh;y++){
      //表の色のみの変数(常にc=1)
      var c=1;
      for (x=0; x<bw; x++){
        if (board[y][x].inPlace == -1){
        c = 0;
        }else{
          if (board[y][x].inPlace == 0){
            c = 1;
          }else{
            c = 2;
          }
        }
        //マス目の描写
        drawpiece(x,y,c);
      }
    }
  }

  ctx.fillStyle = fontcolor[0];

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

//元号漢字の分析 2022/8/13
function get_kanji_analize_data(kanji){
  var times = 0;
  var pre_times = 0;
  var back_kanji = "";
  var back_times = 0;
  var pre_kanji = "";

  for(var i = 0;i < gengou.length;i++){
    var gengou_idiom = gengou[i];

    var kanji1 = gengou_idiom[0];
    var kanji2 = gengou_idiom[1];

    if(kanji == kanji1){
      times++;
      pre_times++;
      back_kanji += kanji2;
    }
    if(kanji == kanji2){
      times++;
      back_times++;
      pre_kanji += kanji1;
    }  
  }

  return [times, pre_times, back_kanji, back_times, pre_kanji]; 
}

//元号漢字の全出現回数順並び替え 2022/8/17
function AllTimesSort(){
  gengou_kanji.sort(function(a,b){
    return(a.times > b.times) ? -1 : 1;
  });
  
  //出現回数ゼロをわかりやすく
  for(var i = 0 ;i < gengou_kanji.length;i++){
    if(gengou_kanji[i].times == 0){
      gengou_kanji[i].kanji_color = 1;
    }else{
      gengou_kanji[i].kanji_color = 0;
    }
  }

  initGengou();
}

//元号漢字の前側出現回数順並び替え 2022/8/17
function PreTimesSort(){
  gengou_kanji.sort(function(a,b){
    return(a.pre_times > b.pre_times) ? -1 : 1;
  });

  //出現回数ゼロをわかりやすく
  for(var i = 0 ;i < gengou_kanji.length;i++){
    if(gengou_kanji[i].pre_times == 0){
      gengou_kanji[i].kanji_color = 1;
    }else{
      gengou_kanji[i].kanji_color = 0;
    }
  }
  
  initGengou();
}

//元号漢字の後側出現回数順並び替え 2022/8/17
function BackTimesSort(){
  gengou_kanji.sort(function(a,b){
    return(a.back_times > b.back_times) ? -1 : 1;
  });

  //出現回数ゼロをわかりやすく
  for(var i = 0 ;i < gengou_kanji.length;i++){
    if(gengou_kanji[i].back_times == 0){
      gengou_kanji[i].kanji_color = 1;
    }else{
      gengou_kanji[i].kanji_color = 0;
    }
  }
  
  initGengou();
}

//元号漢字分析 2022/8/13
//元号漢字の分析を行う
//出現回数
//前出現回数
//後ペア漢字
//後出現回数
//前ペア漢字ほほほ
function gengou_kanji_analize(){
  var strX = '';
  var Kanji_list = '';
  gengou_kanji = [];
  for(var i = 0;i < gengou.length;i++){
    for(var j = 0;j < 2;j++){
      strX = gengou[i];
      strX = strX[j];
      if(Kanji_list.indexOf(strX) == -1){
        Kanji_list += strX;
        var gengou_one_kanji = new gengou_kanji_piece;
        var gengou_kanji_ary = get_kanji_analize_data(strX);
        gengou_one_kanji.inPlace = 0;
        gengou_one_kanji.kanji = strX;
        gengou_one_kanji.times = gengou_kanji_ary[0];
        gengou_one_kanji.pre_times = gengou_kanji_ary[1];
        gengou_one_kanji.back_kanji = gengou_kanji_ary[2];
        gengou_one_kanji.back_times = gengou_kanji_ary[3];
        gengou_one_kanji.pre_kanji = gengou_kanji_ary[4];
        gengou_one_kanji.visible = true;
        gengou_one_kanji.back_color = 0;
 
        gengou_kanji.push(gengou_one_kanji);
      } 
    }
  }

  /*******************
   元号分析.txtとして保存
   ファイルの読み込みは非同期処理で行われているので
   読み込めという命令の後、すぐにこちらの命令にくるので、
   ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
   ファイルの読み込みが終了するように適当に待ち時間を入れる
  *******************/
/******
  分析ファイルの書き出しは毎回は不要
  setTimeout(function(){
    //元号分析.txtファイル         
    dataStr = '';
    for(i = 0;i < gengou_kanji.length;i++){
      dataStr += gengou_kanji[i].kanji + ' ' + gengou_kanji[i].times + '回出現' + '\r\n';
      dataStr += '前' + gengou_kanji[i].pre_times + '回出現　' + gengou_kanji[i].back_kanji + '\r\n';
      dataStr += '後' + gengou_kanji[i].back_times + '回出現　' + gengou_kanji[i].pre_kanji + '\r\n';
      dataStr += '\r\n';
    }

    //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
    //ファイル名は重複すると自動的増えていく
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
    a.download = '元号分析.txt';         
    a.click();
  },1000);
*******/
　//元号用のボードに切り替え
  IsGengouMode = true;

  //元号ボード用初期化
  initGengou();
}

//ゲームをやり直す
function retryGame(){
//  init();  
}

//現在の作業図と完成図の整合性チェック
function checkAnswer(){
  if (board_goal_strs == make_board_strs(0)){
    return true;
  }else{
    return false;
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

//作業盤、完成盤の状態を文字列にして返す
//ch_ban : 0 作業盤、 1:完成盤
function make_board_strs(ch_ban){
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

//問題保存
//改行コードは'\n'だけだと、見た目には改行なしのように見える場合もある'\r\n'を使う
function saveQuiz(){
}

//セットアップファイルの更新
//盤のマス目に配置された状態を反映する
function updateSetups(){
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

//熟語のみの配列作成 2022/7/12
//一緒にヒント配列も作成する
//ヒント未設定の場合も対応
function make_only_two_idioms(){   
  var id = 0;
  var strX = '';
  var strX1 = '';
  for(i = 0;i < two_idioms.length -1;i++){
    id = two_idioms[i].indexOf(' ');
    if (id == -1){
      strX = two_idioms[i];
      strX1 = 'ヒントなし';
    }else{       
      strX = ExtractStr(two_idioms[i],'',' ');
      strX1 = ExtractStr(two_idioms[i],' ','');
    }
    only_two_idioms.push(strX);
    two_idiom_hints.push(strX1);
  }  
}

//二重熟語重複チェック 2022/7/12
//two_idiom配列の中で重複している熟語をチェックする
//重複している熟語をピックアップしてリストにして書き出し
function check_idiom_same(){
 var id = 0;
 var strX = '';

  //熟語部分のみの配列を作る
  var temp_two_idioms = [];
  for(i = 0;i < two_idioms.length -1;i++){
    id = two_idioms[i].indexOf(' ');
    if (id == -1){
      strX = two_idioms[i];
    }else{       
      strX = ExtractStr(two_idioms[i],'',' ');
    }
    temp_two_idioms.push(strX);
  }  
  
  //走査しながら、重複している問題を削除
　strX = '';
  var strX1 = '';
  var idx = 0;
  var after_idx = -1;
  var break_flg = false;
  while(true){
    break_flg = false;
    for(i = idx; i < temp_two_idioms.length - 1;i++){
      //同じ熟語が以降にもう一度現れるかどうか
      after_idx = temp_two_idioms.indexOf(temp_two_idioms[i], i + 1);

      if(after_idx != -1){
        strX += two_idioms[i] + ' ' + two_idioms[after_idx]  + '\r\n';
        two_idioms.splice(after_idx, 1);
        temp_two_idioms.splice(after_idx, 1);
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
  a.download = '重複熟語削除候補リスト.txt'; 
  a.click();

  //熟語のみの配列作成
  make_only_two_idioms();

  /*******************
   idiom_data.txtとして保存
   ファイルの読み込みは非同期処理で行われているので
   読み込めという命令の後、すぐにこちらの命令にくるので、
   ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
   ファイルの読み込みが終了するように適当に待ち時間を入れる
   ここでは、ファイルの持ち時間はファイル数×10msとする
  *******************/
  setTimeout(function(){
    //idiom_data.jsファイル         
    var dataStr = 'var two_idioms =[\r\n';

    for(i = 0;i < two_idioms.length;i++){
      dataStr += '"' + two_idioms[i] + '",\r\n';
    }
        
    dataStr += ']';

    //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
    //ファイル名は重複すると自動的増えていく
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
    a.download = 'idiom_data.txt';         
    a.click();
  },1000);

  /*******************
   二字熟語.txtとして保存
   ファイルの読み込みは非同期処理で行われているので
   読み込めという命令の後、すぐにこちらの命令にくるので、
   ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
   ファイルの読み込みが終了するように適当に待ち時間を入れる
  *******************/
  setTimeout(function(){
    //二字熟語.txtファイル         
    dataStr = '';
    for(i = 0;i < two_idioms.length;i++){
      dataStr += two_idioms[i] + '\r\n';
    }

    //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
    //ファイル名は重複すると自動的増えていく
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
    a.download = '二字熟語.txt';         
    a.click();
  },1000);

  /*******************
   gengou_data.txtとして保存
   ファイルの読み込みは非同期処理で行われているので
   読み込めという命令の後、すぐにこちらの命令にくるので、
   ファイルの読み込み終了後の変数をここで保存しようとしても期待通りの結果が得られない
   ファイルの読み込みが終了するように適当に待ち時間を入れる
   ここでは、ファイルの持ち時間はファイル数×10msとする
  *******************/
  setTimeout(function(){
    //gengou_data.jsファイル         
    dataStr = 'var gengou =[\r\n';

    for(i = 0;i < gengou.length;i++){
      dataStr += '"' + gengou[i] + '",\r\n';
    }
        
    dataStr += ']';

    //テキストデータをローカルのダウンロードフォルダにダウンロードする形で作成
    //ファイル名は重複すると自動的増えていく
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(dataStr);
    a.download = 'gengou_data.txt';         
    a.click();
  },1000);
}

//問題読み込み(配列から)
//QuizSetData配列の中でQuizIndexの番号の問題を読込
function readQuizIndex(){
  //ゲームを初期化
  init();
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
}

//元号ファイル読込 2022/8/13

/************************
*ファイルを選択して読み込む
*Gengous配列に追加していく
*************************/

//ファイル読み込み関連グローバル変数
var load_gengou_btn = document.querySelector("#load_gengou_btn");
load_gengou_btn.addEventListener('change', upload, false);

function upload(evt){
  var strX = '';
  
  //元号配列を初期化
  gengou = [];
               
  var file = evt.target.files[0];
              
  var reader= new FileReader();
                
  //ファイル読み取りを実行
  reader.readAsText(file);          
      
  //ファイル内容を表示
  //非同期処理読み込めたら
  reader.onload = function(event){
    var result = event.target.result;   

    //改行コード'\r\n'で分割
    var lines = result.split('\r\n');
            
    //各種データセット                    
    for(var i = 0;i < lines.length;i++){
      two_idioms.push(lines[i]); 
      gengou.push(lines[i]);               
    }

　　//二重熟語重複チェック
    check_idiom_same();
  }                                                
}

//二字熟語ファイル読込
/************************
*ファイルを選択して読み込む
*一つ目のファイルのみ現在の盤面へ読み込む
*拡張子はtxtとして、内容を見やすいようにしている
*複数のファイルの場合はすべて読み取って、正解例のAnswerSetData.txtを書き出す
*AnswerSetDataは拡張子を変更して、jsとすれば、アプリ起動時にAnswerSetData配列となる
*************************/

//ファイル読み込み関連グローバル変数
var read_idiom_btn = document.querySelector("#read_idiom_btn");
read_idiom_btn.addEventListener('change', read_idiom, false);

function read_idiom(evt){
  var strX = '';
  
  //二字熟語配列を初期化
  two_idioms = [];
               
  var file = evt.target.files[0];
              
  var reader= new FileReader();
                
  //ファイル読み取りを実行
  reader.readAsText(file);          
      
  //ファイル内容を表示
  //非同期処理読み込めたら
  reader.onload = function(event){
    var result = event.target.result;   

    //改行コード'\r\n'で分割
    var lines = result.split('\r\n');
            
    //各種データセット                    
    for(var i = 0;i < lines.length;i++){
      two_idioms.push(lines[i]);               
    }

　　//二重熟語重複チェック
    check_idiom_same();
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