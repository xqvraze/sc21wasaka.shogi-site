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
	var msgNewInfo = 'お知らせ 2026/6/19現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 6/20(土)、7/11(土)、7/18(土)、8/8(土)、8/22(土)<br>※参考情報<br>7/4(土) 指導者都合<br>7/21(火) 1学期終業式<br>7/26(土) 和坂納涼祭<br>8/1(土)指導者都合<br>8/28(金)                                                                                                                                                                                                                                                                                                                                                                                                                   2学期始業式</p>';
document.getElementById('dayOfAct').innerHTML = msgCalender;

}