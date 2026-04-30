//var data = [0,1,2,3,4,5,6,7,8,9];
var data = [0,1,2];
var dataAll = [];

function py(){
console.log(dataAll.length);
  for(var i = 0;i < dataAll.length;i++){
console.log(dataAll[i].length);
   for(var j = 0; j < dataAll[i].length;j++){
     
console.log('i='+i+'j='+j+' dataAll[i][j]'+dataAll[i][j]);
   }
  }
}

function made(){
  var Idx = data.length;
  dataAll =[];
console.log('fe');
  make(Idx,data);
}

function make(Idx,indata){
  var count = data.length;
  var pidx = count - Idx; 
console.log('Idx='+Idx);
  Idx -= 1;  
  if(Idx == 0){
     return true;  
  }

for(var j = 0; j < indata.length; j++){
//console.log(indata[j]);
  
}
  for(var i = pidx;i < indata.length;i++){
console.log('i='+i);
   
    //複製
    var VdataA = indata.slice();

for(var j = 0; j < VdataA.length; j++){
//console.log(VdataA[j]);
  
}
    
    //選ばれた1つの前の値
    var VdataB = VdataA.splice(pidx,1); 
//console.log(VdataA.length);
//console.log(VdataB.length);
                        

for(var j = 0; j < VdataB.length; j++){
//console.log(VdataB[j]);
  
}
for(var j = 0; j < VdataA.length; j++){
//console.log(VdataA[j]);
  
}
    //選ばれた1つを抜き出す
    var VdataC = VdataB.concat(VdataA);
     
    dataAll.push(VdataC);
//console.log('fe');
var flg = false;        
    flg = make(Idx, VdataC);
    
    while(flg == false){
console.log('fe');
sleep(100);
Alert('1');
    };
  }
 console.log('Idx最後'+Idx);  
 return true;
}