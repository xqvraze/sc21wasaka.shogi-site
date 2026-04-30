//組み直し 2022/5/25
/********************
 同じ筋に歩は2枚ない前提
 同じ筋に香車は2枚ない前提
 完成図と同じ位置になった桂は動くと完成しない前提

 → 桂馬、香車、歩は完成図と同じ位置になると動かす候補の駒から除外する

 1.探索深さを揃えて、浅い側から探索していく。
 2.手数毎に次の候補手があるある場合を全て見つけてから再帰処理を実行する
 3.最初に見つかった完成図のときの手数が最短手数となるので、その時点で探索を打ち切ればよい
 4.調べるべき局面が既に一度出てきているのなら、その局面での調査は既に進行しているので、調べる必要はなくなる

 5. 問題図、完成図がともに左右対称の場合には、局面文字列登録時に対称文字列も同時に登録する
アイデア
移動先マス(空白)を列挙して、そこに移動できる駒をピックアップしてに対して調べる

どんどん手数が深くなる方向(再帰呼び出し優先)でない方向も見る
再帰行く前にその段階の他の候補手で完成する場合は無駄な探索

動くと都合の悪いことが多い駒、歩、香、桂の方から探索し、本当にだめな局面を早めに多く集め
同一局面で効率よく？はじけるようにする。

一度、解けた経路を基により短手数を探る方法を考える

完成図側からも戻す


既にある棋譜を基にする場合は同じ局面が2度出てこないかチェックし
出てくるなら、その間の部分はカットして短くする

自分自身の今の棋譜履歴の中に同じ局面があれば探索中止
********************/

//完成図に到達できた局面履歴集
//次々に入れているので後ろから短い手順が入っている
//var AutoSolveHistory = [];
//不要であるがこれまでのSolver.jsでの使用

//最短手数の局面履歴
//途中の各面がより短手数で出てきた場合には最短手数の更新となる
//また、その後の局面は探索済みなので以降は探索不要で既探索を採用
var AutoSolveBest = [];

//出てきた作業盤の局面保管
//同一局面が出た場合にはそれ以上探索しない
//完成図は登録しない
//var CheckedBoard = [];

//最短手数
var min_moves_count = 1000;

//最短手数棋譜文字列
var min_total_board_strs = '';

//完成図ボード
var board_finish = [];

//最短手数
var max_seek;

//対称フラグ
var symmetry_flg = false;

//開始時刻
var start_time = new Date();

//局面対称文字列作成 2022/05/26
//左右対称の文字列を作成
function makeboard_strs_symmety(board_strs){
  var rs = board_strs.split(',');

  //対称な局面を作成
  var board_work = [];
  board_work = new Array(ban_h[0]);  
  for(var y = 0; y < ban_h[0]; y++){
    board_work[y] = new Array(ban_w[0]);
    for(var x = 0; x < ban_w[0]; x++){
      board_work[y][x] = rs[(ban_w[0] -1) - x + y * ban_w[0]] * 1;
    }
  }     

　var strX = '';
  for(var y = 0; y < ban_h[0]; y++){
    for(var x = 0; x < ban_w[0]; x++){
      strX += board_work[y][x] + ',';
    }
  }       
  return strX;
}

//自動解答
//問題図から候補をしらみつぶしに探索
//最短手数を超える手数の探索は中止
//同じ局面(盤面変換文字列が同じ)場合は探索中止
function AutoAnswer(){
  //開始時刻
  start_time = new Date();

  //今現在の棋譜の最後の状態と完成図が一致している場合は
  //現在の状態で、最短手数などのデータを初期化
     
  max_seek = document.getElementById("seek_max").value * 1;
  if(max_seek == NaN){
    max_seek = 20;
  }   
   
  //最短完成図へ至る履歴文字列
  min_total_board_strs = '';

  CheckedBoard = [];

  //ゲームスタート処理一式
  GameStartProc();

  //完成盤データ
  board_finish = [];
  board_finish = new Array(ban_h[0]);
  for(var y = 0; y < ban_h[0]; y++){
    board_finish[y] = new Array(ban_w[0]);
    for(var x = 0; x < ban_w[0]; x++){
      board_finish[y][x] = setups[1][y][x];
    }
  }     
 
//console.log('最大探索手数' + max_seek + '手で探索する');

  //問題図データ作成
  var board_strs = make_board_strs(0);

console.log(board_strs);
console.log(makeboard_strs_symmety(board_strs));
  symmetry_flg = false;
  if(board_strs == makeboard_strs_symmety(board_strs) && board_goal_strs == makeboard_strs_symmety(board_goal_strs)){
    symmetry_flg = true;
  }

  //手順の局面図データ文字列作成
  var total_board_strs = board_strs;

  CheckedBoard.push(board_strs);

  //局面の文字列を入れて再帰的に探索
  //現在の盤面文字列から動かすべき駒のリスト(x,y)を列挙
  //x,yはその盤内のみの座標
  getMovableLists(0, [[board_strs, total_board_strs]]);

//console.log('自動解答結果 min_total_board_strs = ' + min_total_board_strs);

  if(min_total_board_strs == ''){

    document.getElementById("min_moves_answer").innerHTML = '最大探索手数内では最短手数は見つかりませんでした' ;

  }else{
    //終了時刻
    var end_time = new Date();

    //タイムスタンプ : 基準日(1970年1月1日午前(零時)からの経過ミリ秒数)
    var time1 = start_time.getTime();
    var time2 = end_time.getTime();

    //所要時間計算    
    var required_time = (time2 - time1) / 1000;

    document.getElementById("min_moves_answer").innerHTML = '最短手数 ' + min_moves_count +' ' + document.getElementById("quiz_name").innerHTML + '所要時間 : ' + required_time + '秒';

    //結果の完成に至る履歴の一番最後(最短)を棋譜としてセット
    //文字列を'(*)'で分割する
    var rs = min_total_board_strs.split('(*)');

    board_history = [];
    for(var i = 0; i < rs.length; i++){
      board_history.push(rs[i]);
    }
//console.log('履歴文字列',min_total_board_strs);
  }
}

//現在の盤面文字列から動かすべき駒のリスト(x,y)を列挙し、
//その駒の動きによる局面を調査し、さらに探索が必要である場合をリストにして返す
//board_strs : 調べるべき局面
//total_board_strs : ここまでの局面履歴文字列
//ここまで手数Idxとboard_info[board_strs, total_board_strs]の配列を渡す
function getMovableLists(Idx, board_info){

//console.log('itime='+Idx+'手目の呼び出し');
//console.log(Idx+'手目の局面'+board_strs);
  var end_time = new Date();

  //タイムスタンプ : 基準日(1970年1月1日午前(零時)からの経過ミリ秒数)
  var time1 = start_time.getTime();
  var time2 = end_time.getTime();

  //所要時間計算    
  var required_time = (time2 - time1) / 1000;
console.log(Idx+'手目の局面 探索数' + board_info.length + ' この探索開始までの所要 : ' +  required_time + '秒');


  //最大探索数に達した場合終了
  if(max_seek == Idx){
//console.log('最大探索手数設定に到達しました\r\n終了します');    
    return;
  }

  //移動元となる駒
  var temp_id = -1;

  //作業用配列
  var board_workA = []; //現在の入力局面
  var board_workB = []; //候補手を入力した局面

  //次に渡すべき局面情報配列を用意
  var temp_board_info = [];  
       
  //今の局面から1手だけ動かして、完成図になる移動候補先があった場合には、
  //他の移動候補先はどう動かしても1手で完成図になることはない
  //他の駒を動かして続けると完成図になる状態があっても、手数がより多くなるので
  //その手順については調べる必要がない
  //また、手数のすくない順に探索しているので、最初に見つかる完成図は最短手数となる
  //それ以上の探索は必要なくなる
          
  //渡された局面情報配列について、すべての次の局面を調べる
  for(var i = 0; i < board_info.length;i++){

    //調べるべき局面
    var board_strs = board_info[i][0];         
          
//console.log('今から' +(Idx+1)+'手目の探索 ' + (i+1)+ ' / ' + board_info.length);
//console.log('今から' + board_strs+'の局面からの次の局面を探索');

//if(board_strs == '1,2,3,-1,7,-1,6,4,15,'){
//console.log('今から' + board_strs+ 'を調べます');
//}           
      
  //調べる局面のこれまでの局面履歴文字列
    var total_board_strs = board_info[i][1];
        
    //文字列を','で分割する
    var rs = board_strs.split(',');
           
    //文字列から盤面を復元
    //駒の状態だけの復元
    board_workA = new Array(ban_h[0]);
    for(var y = 0; y < ban_h[0]; y++){
      board_workA[y] = new Array(ban_w[0]);
      for(var x = 0; x < ban_w[0]; x++){
        //数字を表す文字列を数値にするために * 1
        board_workA[y][x] = rs[x + y * ban_w[0]] * 1;
//console.log(idx+'手目 座標(' + x + ',' + y + ')の駒調査' + board_workA[y][x]);
          
      }
    }
              
    //作業盤面を走査して、個別の駒に関して移動可能な候補を列挙
    for(y = 0;y < ban_h[0];y++){   
      for(x = 0;x < ban_w[0];x++){
     
        //移動元となるかどうか判定する
        //駒があれば移動元となる
        //文字列認識の数字を数値にする
        temp_id = board_workA[y][x];
      
//console.log(Idx+'手目 移動元座標('+x+','+y+')の駒の有無調査' + temp_id );
      
        //駒が配置していない場合はスキップ
        if(temp_id == -1){
          continue;
        }
       
        //盤面上にある駒についての移動先候補を列挙
        if(temp_id != -1){
      
          //移動元マスの座標取得
          var sx = x;
          var sy = y;
        
          /*★★★★★★★★★★
           桂馬(5)、香車(6)、歩(7)で完成図と同じ場所であれば
           それ以上は動かさないので、移動先候補を調べる必要はない
          ★★★★★★★★★★★*/
          if(temp_id == 5 || temp_id == 6 || temp_id == 7){
            if(board_finish[sy][sx] == temp_id){
              continue;
            }  
          }

//if(board_strs =='1,-1,2,-1,-1,-1,-1,-1,-1,'){
//console.log('指定局面で' + temp_id+ 'の駒の動きを調査します');
//}  
          
          //駒の周囲の移動可能方向を走査
          //周囲8方向と桂馬の動きの2方向
          //駒の動きとしての移動可能範囲を調べる
          for(var dir = 0;dir < 10;dir++){
       
            //移動元の駒に対する指定移動方向の移動可能性の値
            //0 : 移動不可能  1:1回のみ移動可能  2 : 空きマスがある限り移動可能
            var moveXYvalue = movtbl[temp_id][dir];
             
            //移動可能な方向でない場合は次の方向を調べる
            if(moveXYvalue == 0){
              continue;
            }
             
            //ここから先は駒の動きとしての移動は可能な状態を調べる
             
            //駒の動きとして移動可能な先の座標を計算するために
            //元々の移動元の座標を初期値として代入
            var mvX = x;
            var mvY = y;
              
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
//console.log((Idx + 1) + '手目 移動先候補座標('+mvX+','+mvY+')の駒調査'+board_workA[mvY][mvX]+'横'+ban_w[0]+'×縦'+ban_h[0]);
                
              //移動先の駒の情報
              var temp_to_id = board_workA[mvY][mvX]; 
                
              //移動先に駒がある場合は移動不可
              if(temp_to_id != -1){
                break;
              }
                
//console.log((Idx + 1) + '手目 移動先候補座標('+mvX+','+mvY+')の局面チェック');
                 
              //駒を移動させた局面を考えるために作業盤を複製
              //イテラブル変数は新規に指定
              board_workB = [];
              board_workB = new Array(ban_h[0]);
              for(var yB = 0; yB < ban_h[0]; yB++){
                board_workB[yB] = new Array(ban_w[0]);
                for(var xB = 0; xB < ban_w[0]; xB++){
                  board_workB[yB][xB] = board_workA[yB][xB];
                }
              }  
              
              //駒を移動した局面を作る
              
              //手数を進める
              //ただし、他の探索にも枝分かれするので、ここまでの手数を複製して進める
              var temp_Idx = Idx;
              temp_Idx += 1;
               
              //移動元の駒情報を空きマスとする
              board_workB[sy][sx] = -1;
              
              //移動先に移動対象の駒を置く
              board_workB[mvY][mvX] = temp_id;
               
              //移動後の局面を表す文字列を作成
              //盤から文字列を作成
              var strNewX = '';
              for(var yn = 0;yn < ban_h[0]; yn++){ 
                for(var xn = 0;xn < ban_w[0]; xn++){
                  strNewX += board_workB[yn][xn] + ',';
                }
              } 
                
              //調べるべき局面がすでに調べた局面である場合にはスキップ
              //★★★★★★★★
              //飛車、角、香車の場合の動きとして複数マスの途中のマスがすでに探索登録してある局面だとしても
              //その先の空きマスの局面が未探索であることがある  
              //★★★★★★★★
              if(CheckedBoard.indexOf(strNewX) != -1){
//if(board_strs =='1,-1,2,-1,-1,-1,-1,-1,-1,'){
//console.log(     '既に' + strNewX+ 'は探索局面として登録してありました');
//console.log(board_strs+ 'の局面の探索中です');
//}                  
                //駒の移動可能方向についてはmovtblにおいて、駒の種類毎に、移動可能 : 1
                //駒の種類が飛、角、香のように障害がなければ一気に移動可能な場合の移動可能 : 2
                //飛、角、香以外の移動可能な場合は、特定の方向に1候補のみ移動可能で終わりでループを抜ける
                //飛、角、香の場合には2つ目以降の候補先を調べる
                if(moveXYvalue == 1){
                  break;
                }else{
                  //飛車、角、香車の場合はもう一度同じ方向の移動マスを調べる
                  continue;
                }                         
              }              
              //移動後の局面まで含めた局面履歴の文字列を作成する
              //これは、枝分かれしてく探索があるので、ここまでの局面履歴の文字列を複製して利用
              var temp_total_board_strs = total_board_strs;              
              
              //ここまでの局面の履歴を示す文字列
              temp_total_board_strs += '(*)' + strNewX;
                
//console.log((Idx + 1) + '手目 移動先候補座標('+mvX+','+mvY+')の局面チェック\n' + strNewX +'\n' + board_goal_strs);
              
              //完成図と同じ局面になった場合は探索終了
              //完成図と同じでない場合は、さらに探索するべき候補としてboard_info配列に入れる
              if(strNewX != board_goal_strs){
               
                //この新しい局面でさらに再帰的に探索するリストとして配列に入れる
                //新しい手数 temp_Idx
                //新しい局面の盤面文字列 strNewX
                //ここまでの局面履歴文字列 temp_total_board_strs
                temp_board_info.push([strNewX, temp_total_board_strs]);
              
                //今回調べる候補局面を局面配列に追加
                CheckedBoard.push(strNewX);
                 
                //問題図/完成図がともに対称であった場合    
                if(symmetry_flg == true){
                  CheckedBoard.push(makeboard_strs_symmety(strNewX));
                }
//console.log(    '棋譜は '+makekifuStrfromText(board_strs, strNewX)+'を探索先として登録');
              
//if(board_strs =='1,-1,-1,-1,-1,-1,2,-1,-1,'){
//if(board_strs =='1,-1,2,-1,-1,-1,-1,-1,-1,'){
//console.log('今から' + strNewX+ 'を探索候補に登録します');
//console.log(board_strs+ '次の局面として'+strNewX+'を調べます');
//console.log(    '棋譜は '+makekifuStrfromText(board_strs, strNewX));
//}              
                 
                //同じ方向の動きで飛車、角、香車のように複数マスを移動できる駒の場合には、さらに移動可能マスを調べる
                
                //駒の移動可能方向についてはmovtblにおいて、駒の種類毎に、移動可能 : 1
                //駒の種類が飛、角、香のように障害がなければ一気に移動可能な場合の移動可能 : 2
                //飛、角、香以外の移動可能な場合は、特定の方向に1候補のみ移動可能で終わりでループを抜ける
                //飛、角、香の場合には2つ目以降の候補先を調べる
                if(moveXYvalue == 1){
                  break;
                }else{
                  //飛車、角、香車の場合はもう一度同じ方向の移動マスを調べる
                  continue;
                }                         
              }else{
console.log(     '完成図と同じになりました');
           
                //完成図に至り最短手数の自動解答が得られた場合
                //これ以上の探索が必要ない
           
                //最短手数の更新
                min_moves_count = temp_Idx;
              
                //最短手数の棋譜履歴文字列
                min_total_board_strs = temp_total_board_strs;
              
                return;
              }                 
            }
          }
        }
      }    
    }
  }
  if(temp_board_info != []){
    //さらに手数を増やしての探索を再帰的に行う
    getMovableLists(Idx + 1, temp_board_info);
  }
}