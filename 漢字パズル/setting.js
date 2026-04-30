//管理用ボタンの非表示
function hide_manage(){

  //熟語のみの配列作成
  make_only_two_idioms();

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
