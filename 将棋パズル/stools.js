//個人的ツール関数

//文字列の取り出し 2022/5/24
//指定文字の間に挟まれた文字列を抜き出して返す
//strX : 対象文字列、str_start : 前側の文字、後側の文字
//str_startに''を指定した場合は、最初から
//str_endに''を指定した場合は、最後まで
function ExtractStr(strX, str_start, str_end){
  var start_idx = 0;
  var end_idx = 0;

  //文字抜き出し開始位置の決定
  if(str_start == ''){
    start_idx = 0;
  }else{
    //指定文字列が初めて出てくる位置
    start_idx = strX.indexOf(str_start);

    if(start_idx != -1){
      start_idx += str_start.length;  
    }else{
      start_idx = 0;      
    }   
  }

  //文字抜き出し終了位置の決定
  if(str_end == ''){
    return strX.slice(start_idx);
  }else{
    //開始位置より後ろで、指定文字列が初めて出てくる位置
    end_idx = strX.indexOf(str_end, start_idx);

    if(end_idx != -1){
      return strX.slice(start_idx, end_idx);
    }else{
      return strX.slice(start_idx);
    }     
  }
}