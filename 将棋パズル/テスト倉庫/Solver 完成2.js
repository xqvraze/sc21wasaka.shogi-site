/********************
 同じ筋に歩は2枚ない前提
 同じ筋に香車は2枚ない前提
 完成図と同じ位置になった桂は動くと完成しない前提

 → 桂馬、香車、歩は完成図と同じ位置になると動かす候補の駒から除外する

 1. 再帰処理(探索深さが深くなる)をより深い探索を発見した時点でその部分をどんどん深堀していく全探索
 2. この方法だと、一度出てきた局面が前回出てきたよりも短手数(探索深さとして浅い状態)で
    現れることもありうるので、同一局面の探索をうまく枝刈りできない



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
var AutoSolveHistory = [];

//最短手数の局面履歴
//途中の各面がより短手数で出てきた場合には最短手数の更新となる
//また、その後の局面は探索済みなので以降は探索不要で既探索を採用
var AutoSolveBest = [];

//出てきた作業盤の局面保管
//同一局面が出た場合にはそれ以上探索しない
//完成図は登録しない
var CheckedBoard = [];

//最短手数
var min_moves_count = 1000;

//最短手数棋譜文字列
var min_total_board_strs = '';

//完成図ボード
var board_finish = [];

//最大探索手数を指定しての自動解答
//問題図から候補をしらみつぶしに探索
//最短手数を調べるアルゴリズムを洗練しないと、
//単に全探索するだけでは、最初に設定する最大手数が多いと
//探索時間が長くかかるので、最大手数を少な目で探索し、
//それで、解答が見つからない場合には探索手数を増やしていく手法をとる
function AutoAnswerProc(seek_max){
  min_moves_count = seek_max;
  
  var temp_count = 0;

  //問題図データ作成
  var board_strs = make_board_strs(0);

  //手順の局面図データ文字列作成
  var total_board_strs = board_strs;

  //局面の文字列を入れて再帰的に探索
  //現在の盤面文字列から動かすべき駒のリスト(x,y)を列挙
  //x,yはその盤内のみの座標
  getMovableLists(temp_count, board_strs, total_board_strs);
}

//自動解答
//問題図から候補をしらみつぶしに探索
//最短手数を超える手数の探索は中止
//同じ局面(盤面変換文字列が同じ)場合は探索中止
function AutoAnswer(){
  //開始時刻
  var start_time = new Date();

  var limit_seek = 20;

  //今現在の棋譜の最後の状態と完成図が一致している場合は
  //現在の状態で、最短手数などのデータを初期化
　
　if(board_history[board_history.length - 1] == board_goal_strs){
    //現在の棋譜を最短手数の初期値として採用
    AutoSolveBest = board_history.slice(0);
    
    limit_seek = board_history.length - 1;

    min_moves_count = board_history.length - 1;
   
    //最短完成図へ至る履歴文字列
    min_total_board_strs = board_history.join('(*)');
　  AutoSolveHistory = [];
    AutoSolveHistory.push(board_history.join('(*)'));
    
    //問題図の盤面を表す文字列を受け取る
    var strX = board_history[0];
     
    //文字列から作業盤のboard配列へ戻す
    board_form_strs(strX);
    
    //再描画
    redraw();

    //最短完成図へ至る履歴文字列
  　min_total_board_strs = '';
console.log('完成図に至る棋譜あり');
  }else{
     
    limit_seek = document.getElementById("seek_max").value * 1;
    if(limit_seek == NaN){
      limit_seek = 20;
    }
    
    AutoSolveBest = [];
　  AutoSolveHistory = [];
    
    //最短完成図へ至る履歴文字列
  　min_total_board_strs = '';
  }  

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
   
  //最大探索手数の初期値をどうするか？
  //問題図と完成図での一致していないマスの数とする
  var max_seek = 0;
  for(var y = 0;y < ban_h[0]; y++){
    for(var x = 0;x < ban_w[0]; x++){
      if(setups[0][y][x] !=　setups[1][y][x]){
        max_seek += 1;
      }
    }
  } 
  
  //問題図がすでに完成図になっている場合
  if(max_seek == 0){
    return;
  }

  var itimes = 1;
  var max_seek_init = max_seek;
  //完成図に到達して、最短履歴文字列が得られていない場合は探索手数を増やしていく
  while(min_total_board_strs == ''){
    if(AutoSolveBest.length > 0){
      max_seek = AutoSolveBest.length - 1;
    }
console.log('最大探索手数' + max_seek + '手で探索する');

    //最大探索手数を指定しての自動解答探索
    AutoAnswerProc(max_seek);

    if(max_seek >= limit_seek){
      break;
    }
    itimes += 1;   
    max_seek = max_seek_init * itimes;  
    if(max_seek >= limit_seek){
      max_seek = limit_seek;
    } 
  }

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
console.log('履歴文字列',min_total_board_strs);
  }
}

//現在の盤面文字列から動かすべき駒のリスト(x,y)を列挙し、
//x,yはその盤内のみの座標
//board_strs : 調べるべき局面
//total_board_strs : ここまでの局面履歴文字列
function getMovableLists(Idx, board_strs, total_board_strs){

//console.log('itime='+Idx+'手目の呼び出し');
//console.log(Idx+'手目の局面'+board_strs);

  //移動元となる駒
  var temp_id = -1;

  //作業用配列
  var board_workA = []; //現在の入力局面
  var board_workB = []; //候補手を入力した局面

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

  //今の局面から1手だけ動かして、完成図になる移動候補先があった場合には、
  //他の移動候補先はどう動かしても1手で完成図になることはない
  //また、他の駒を1手動かすことでも完成図になることはなく、
  //他の駒を動かして続けると完成図になる状態があっても、手数がより多くなるので
  //その手順については調べる必要がない
  var getfinish = false;

  //手数を増やしての次の探索がなかった場合は
  //同一局面が出てきてもさらに探索をする必要はなくなるのでチェック
  var next_step_flg = false;

  //作業盤面を走査して、個別の駒に関して移動可能な候補を列挙
  for(y = 0;y < ban_h[0];y++){
    //この局面から1手動かして完成図になる状態が見つかったので
    //この局面でのこれ以上の探索は必要なし
    if(getfinish == true){
      break;
    }
    
    for(x = 0;x < ban_w[0];x++){
     
      //この局面から1手動かして完成図になる状態が見つかったので
      //この局面でのこれ以上の探索は必要なし
      if(getfinish == true){
        break;
      }
      //移動元となるかどうか判定する
      //駒があれば移動元となる
      //文字列認識の数字を数値にする
      temp_id = board_workA[y][x];
      
//console.log(Idx+'手目 移動元座標('+x+','+y+')の駒の有無調査' + temp_id );
      
      //駒が配置していない場合はスルー
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
        
        //駒の周囲の移動可能方向を走査
        //周囲8方向と桂馬の動きの2方向
        //駒の動きとしての移動可能範囲を調べる
        for(var dir = 0;dir < 10;dir++){
         
          //移動によって完成図となる状態が見つかったので、
          //駒の動きとしての他の移動方向を調べる必要はなくなった
          if(getfinish == true){
//console.log(Idx+'手目 この局面から1手動かしての完成図が見つかったので、この局面でのこれ以上の探索中止');
            break;
          }
        
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
　　　　　　　　　　　　　　
//console.log((Idx + 1) + '手目 移動先候補座標('+mvX+','+mvY+')の局面チェック\n' + strNewX +'\n' + board_goal_strs);
　　　　　　　　　　　　　　
            //完成図と同じ局面の場合は、既により長手数で登録してある場合も考慮
            if(strNewX != board_goal_strs){
            
              /*******************************
              //★★★
                完成図に至る局面である場合には、既出の同一局面であっても
                より少ない手数で完成図に至る場合があるので探索は必要
              //★★★
              *******************************/

              //今回作成した文字列strNewXが今探索中の履歴のtotal_board_strsの中に
              //含まれていた場合は、堂々巡りとなるので探索中止
              if(total_board_strs.indexOf(strNewX) != -1){
                if(moveXYvalue == 1){
                  break;
                }else{
                  //飛車、角、香車の場合はもう一度同じ方向の移動マスを調べる
                  continue;
                }            　　　　　　　　　　　　　
              }　

              //Clearへつながる局面かどうかを、これまでの完成図へ至る局面履歴の
              //文字列の中に現在の局面文字列が含まれるかどうかで判断
              var gotoClear = false;
              for(var stc = 0; stc < AutoSolveHistory.length; stc++){
                strClear = AutoSolveHistory[stc];
                if(strClear.indexOf(strNewX) != -1){
                  gotoClear = true;
                  break;
                }
              }
                   
              if(gotoClear = false){  
/******************************
★★★★★★★★★★★★★★★
この部分、一度出てきた局面を登録しカットするのは、
すでに登録されている局面がてできた手数よりも多い状況で出てきた場合には妥当であるが、
少ない手数で出てきた場合には、手数深さのために打ち切られた局面で、その次の手で
完成というのに、完成には至らずに登録された局面であった場合には、
最短経路を求められないことになる　➡ 修正が必要 2022/5/19
★★★★★★★★★★★★★★★
******************************/
　　　　　　　　　　　　　
                //移動後の局面がすでに調べて行き止まりになった局面と同じ場合は
                //駒の動きによって探索中止
                if(CheckedBoard.includes(strNewX) == true){
                  if(moveXYvalue == 1){
                    break;
                  }else{
                    //飛車、角、香車の場合はもう一度同じ方向の移動マスを調べる
                    continue;
                  }
                }
              }else{
                //これまでの最短手数に出てくる局面である場合
                   
                if(AutoSolveBest.indexOf(strNewX) != -1){
                  //より短手数でこの局面が出てきている場合
                  var bestIdx = AutoSolveBest.indexOf(strNewX);  

                  //長手数の場合の1手目、2手目程度が最短手順と同じということは十分ありうる
                  //したがってこれだけで探索中止にしてはいけない
                  if(temp_Idx < bestIdx){
                        
console.log('完成図履歴にある局面により少ない手数(同手数含む)で同じになりました');
                       
                    //最短手数の更新
                    min_moves_count -= bestIdx -temp_Idx;
console.log('最短手数更新' + min_moves_count);
　                  　　　　　　　　
                    //最短手数の棋譜履歴文字列
                    //現在の手数に、局面以降の最短手数の棋譜履歴を追加
                    for(var i = bestIdx;i < AutoSolveBest.length;i++){
                      temp_total_board_strs += '(*)' + AutoSolveBest[i];
                    }
                    min_total_board_strs = temp_total_board_strs;
                            
                    //完成図に至る局面履歴を表す文字列を完成履歴文字列配列に追加
                    AutoSolveHistory.push(temp_total_board_strs);
                         
                    //完成履歴文字列を最短手数配列に入れ替え
                    AutoSolveBest = temp_total_board_strs.split('(*)');
                  }
                }
              }
            }
　　　　　　　
            //ここに流れついている局面は
            //1.一手進めた局面文字列strXが完成図と同じ場合、
            //2.一手進めた局面文字列strXが完成図と違うし、これまでの完成図に至る局面にも属していない場合
            //3.一手進めた局面文字列strXが完成図と違うし、これまでに行き止まり判定された局面でもない場合
             
            //移動後の局面まで含めた局面履歴の文字列を作成する
            //これは、枝分かれしてく探索があるので、ここまでの局面履歴の文字列を複製して利用
            var temp_total_board_strs = total_board_strs;
　　　　　　　　　　　
            //ここまでの局面の履歴を示す文字列
            temp_total_board_strs += '(*)' + strNewX;
　　　　　　　　　　
            //完成図と同じになったかどうか調べる
            //手数がこれまでの最短手数を超えている場合は探索中止されいるので
　　　　　　　　　
            //今の手数は最短手数の更新か同手数となる
            if(strNewX == board_goal_strs){
              //完成図と同じ場合
console.log('完成図と同じになりました');
              
              //最短手数の更新
              min_moves_count = temp_Idx;
　　　　　　　　　　　
              //最短手数の棋譜履歴文字列
              min_total_board_strs = temp_total_board_strs;
                            
              //完成図に至る局面履歴を表す文字列を完成履歴文字列配列に追加
              AutoSolveHistory.push(temp_total_board_strs);
　　　　　　　　　　             
              //クリアフラグ
              getfinish = true;
　　　　　　　　　　　
              //これ以上の探索は必要ない
              //仮に飛車、角、香車であっても、別の移動先を調べる必要はない
              //また、今の駒を動かして完成図になるはずがないので、これ以外の移動先候補の調査も不要
              break;
            }else{   
              //完成図と同じではないが、手数が最短手数より少ない場合は
              //その先の局面の探索を再帰的に実施する
              if(temp_Idx < min_moves_count){
                //この新しい局面でさらに再帰的に探索する
                //新しい手数 temp_Idx
                //新しい局面の盤面文字列 strNewX
                //ここまでの局面履歴文字列 temp_total_board_strs
                next_step_flg = true;
                getMovableLists(temp_Idx, strNewX, temp_total_board_strs);
              }              
            }
               
            //駒の移動可能方向についてはmovtblにおいて、駒の種類毎に、移動可能 : 1
            //駒の種類が飛、角、香のように障害がなければ一気に移動可能な場合の移動可能 : 2
            //飛、角、香以外の移動可能な場合は、特定の方向に1候補のみ移動可能で終わりでループを抜ける
            //飛、角、香の場合には2つ目以降の候補先を調べる
            if(moveXYvalue == 1){
              break;
            }
          }
        }
      }    
    }
  }

  //呼び出した局面で一度もさらに再帰的呼び出しを行われなかった局面は
  //今後も探索する必要がないので、既出の局面に追加する/
  if(next_step_flg == false){
    CheckedBoard.push(board_strs);
  }
}