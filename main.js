ons.ready(function(){
	var options = {
		animation : 'slide',
		onTransitionEnd: function(){}
	};
	var navigator1 = document.getElementById('navigator1');
	navigator1.pushPage('page1', options);
});

function goPage(page){
	var options = {
		animation : 'slide',
		onTransitionEnd: function(){}
	};
	var navigator1 = document.getElementById('navigator1');
	navigator1.pushPage(page, options);
}


function change_text(){
	//お知らせ内容
	var msgNewInfo = 'お知らせ 2026/4/17現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 4/18(土)、5/9(土)、5/23(土)、6/6(土)、6/20(土)<br>※参考情報<br>5/2(土) ゴールデンウイーク初日</p>';
	document.getElementById('dayOfAct').innerHTML = msgCalender;

}