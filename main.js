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
	var msgNewInfo = 'お知らせ 2026/11/13現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 11/14(土)、11/28(土)、12/5(土)、12/19(土)、1/16(土)、1/30(土)<br>※参考情報<br>11/21(土) 和坂小学校 音楽会<br>11/22(土) 地域探検ウオークラリー大会<br>1/16(土) 和坂小学校区 左義長</p>';
document.getElementById('dayOfAct').innerHTML = msgCalender;

}