var data = ["0","1","2","3","4","5","6","7","8","9"];
var data = ["0","1","2","3","4","5","6","7"];
//var data = ["0","1","2","3","4","5"];
//var data = ["0","1","2","3","4"];
//var data = ["0","1","2","3"];
//var data = ["0","1","2"];
var dataAll = [];

function made(){
console.log('★★★★★スタート★★★★★');

  var a ='';
  dataAll=[];
  Allseek(a,data)
  console.log(dataAll);
  alert(dataAll);
}

/************************
 全探索の定義
 最初から順列に合わせるのではない
 全ての数値が何度でも出てきても良い
 合計の数値の数は最初に用意された数値の数とする

 この全探索の状態に条件をつけて枝刈りを行う
 順列ならば、すでに出てきた数値は二度目はない

*************************/ 

//全探索
function Allseek(a,set_ini){

  for(var x in set_ini){
    //常に入力されたaにリセットして処理
    var b = a;

    if(b.indexOf(x) != -1){
      continue;
    }else{
      b += x;
      if(b.length == set_ini.length){
        if(dataAll.includes(b) == false){
          dataAll.push(b);
        }else{
          continue;
        }
      }else {         
        Allseek(b, set_ini);
      }
    }
  } 
}


/*****************************
いろいろ試行したときの名残
 
グローバル変数など消去したものもあるのでうまくは動作はしない

一応完成
//全探索
//
function Allseek(itime,a,set_ini){
Idx += 1;
console.log(Idx+'回目の呼び出し');
  for(var x in set_ini){
//常に入力されたaにリセットして処理
var b = a;
console.log('itime='+ itime+'個目のx = ' + x);
     if(b.length == set_ini.length){
        console.log('全て一通り達成しました a = ' + a);
        continue;
     }else{
       var xs = x;
       if(b.indexOf(x) != -1){
         console.log('既に使った値'+x+'を二度目に使おうとしましたのでリセット b = '+ b);
         continue;
       }else{
         b += x;
         console.log('a = ' + b);   
         if(b.length == set_ini.length){
            if(dataAll.includes(b) == false){
              dataAll.push(b);
            }else{
              continue;
            }
         }else {         
           Allseek(itime +=1,b, set_ini);
         }
       }
     } 
  }
}

***********************/
