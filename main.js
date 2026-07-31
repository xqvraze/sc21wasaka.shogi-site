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
	var msgNewInfo = 'お知らせ 2026/7/31現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 8/1(土)、8/8(土)、8/22(土)、9/5(土)、9/19(土)、10/17(土)、10/31(土)<br>※参考情報<br>8/28(金)                                                                                                                                                                                                                                                                                                                                                                                                                   2学期始業式<br>10/3(土) 野々池中学校体育大会<br>10/10(土) 和坂校区健康診断<br>10/24(土) 和坂小学校体育大会</p>';
document.getElementById('dayOfAct').innerHTML = msgCalender;

}