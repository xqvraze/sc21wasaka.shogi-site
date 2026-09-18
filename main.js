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
	var msgNewInfo = 'お知らせ 2026/9/18現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 9/19(土)、10/17(土)、10/31(土)、11/14(土)、11/28(土)<br>※参考情報<br>10/3(土) 野々池中学校 体育大会<br>10/10(土) 和坂校区健康診断<br>10/24(土) 和坂小学校 体育大会<br>11/7(土) 和坂校区健康診断<br>11/21(土) 和坂小学校 音楽会<br>11/22(土) 地域探検ウオークラリー大会</p>';
document.getElementById('dayOfAct').innerHTML = msgCalender;

}