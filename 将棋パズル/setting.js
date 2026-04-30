//クイズリスト作成 2022/5/26
function makeQuizList(){
  //クイズリスト作成
  var strX = '<select id="quiz_drop_list">'; 
  
  //レベル
  var str_level = document.getElementById("select_level").value;

  //現在のレベルに合わせてQuizSetDataを再設定
  QuizSetData = [];
  for(var i = 0;i < QuizSetData0.length;i++){
    if(str_level == "初級" || str_level == "中級" || str_level == "上級"){
　　  if(QuizSetData0[i].indexOf(str_level) != -1){
        QuizSetData.push(QuizSetData0[i]);
      }
    }else{
      //その他
      var strL = QuizSetData0[i];

　　  if(strL.indexOf('初級') == -1 &&  strL.indexOf('中級') == -1 && strL.indexOf('上級') == -1){
        QuizSetData.push(QuizSetData0[i]);
      }
    }
  }

  //クイズのメニュー
  for(var i = 0;i < QuizSetData.length; i++){
    //クイズのデータ
    var QuizStr = QuizSetData[i];



    var lines = QuizStr.split('(*)');         

    //問題名取得 rs[1]
    var rs = lines[0].split(' ');

    strX += '<option value="' + i + '">' + rs[1] + '</option>';
  }
  strX += '</select><input type="button" value="問題へGo" onClick="gotoQuiz()">';
  //クイズドロップリスト表示
  document.getElementById("quiz_list").innerHTML = strX;
}

//正答例リスト作成 2022/5/26
function makeAnswerList(){
  //アンサーリスト作成
  strX = '<select id="answer_drop_list">'; 

  //レベル
  var str_level = document.getElementById("select_level").value;

  //現在のレベルに合わせて AnswerSetDataを再設定
  AnswerSetData = [];
  for(var i = 0;i < AnswerSetData0.length;i++){
    if(str_level == "初級" || str_level == "中級" || str_level == "上級"){
　　  if(AnswerSetData0[i].indexOf(str_level) != -1){
        AnswerSetData.push(AnswerSetData0[i]);
      }
    }else{
      //その他
      var strL = AnswerSetData0[i];
　　  if(strL.indexOf('初級') == -1 &&  strL.indexOf('中級') == -1 && strL.indexOf('上級') == -1){
        AnswerSetData.push(AnswerSetData0[i]);
      }
    }
  }

  for(i = 0;i < AnswerSetData.length; i++){
    //正解例のデータ
    var AnswerStr = AnswerSetData[i];


    lines = AnswerStr.split('(*)');         

    //問題名取得 rs[1]
    rs = lines[0].split(' ');

    strX += '<option value="' + i + '">' + rs[1] + '</option>';
  }
  strX += '</select><input type="button" value="正解例へGo" onClick="gotoAnswer()">';
  //正解例ドロップリスト表示
  document.getElementById("answer_list").innerHTML = strX;
}

//管理用ボタンの非表示
function hide_manage(){

  //クイズリスト作成
  makeQuizList();

  //正答例リスト作成 2022/5/26
  makeAnswerList();

  readQuizIndex();

//return;

  //非管理モード
  manage_mode = false;
  
  //ボタンを隠す
  //<div>タグで囲まれたクラス名"manage"を非表示にする
  var element = document.getElementsByClassName("manage");
  for(i = 0;i < element.length; i++){
    element[i].style.display = "none";
  }

  //ボタンを隠す
  //<div>タグで囲まれたクラス名"clear_pointmanage"を非表示にする
  var element = document.getElementsByClassName("clear_point");
  for(i = 0;i < element.length; i++){
    element[i].style.display = "none";
  }
}

//管理画面表示 2022/5/23
function show_manage(){
  //管理モード
  manage_mode = true;

 //<div>タグで囲まれたクラス名"manage"を表示にする
 var element = document.getElementsByClassName("manage");
 for(i = 0;i < element.length; i++){
   element[i].style.display = "inline";
 }
}
