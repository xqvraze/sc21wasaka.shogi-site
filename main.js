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
	var msgNewInfo = 'お知らせ 2026/5/8現在';
	document.getElementById('newInfo').innerHTML = msgNewInfo;

	//当面の活動日
	var msgCalender = '<p>当面の活動日 5/9(土)、5/23(土)、<span style="text-decoration-line: line-through; text-decoration-style: double;">6/6(土)</span>、※追加6/20(土)、7/11(土)、7/18(土)<br>※参考情報<br>6/6(土) 修学旅行<br>6/20(土) 5年生自然学校<br>7/4(土) 指導者都合<br>7/21(火) 1学期終業式<br>7/26(土) 和坂納涼祭</p>';
document.getElementById('dayOfAct').innerHTML = msgCalender;

}