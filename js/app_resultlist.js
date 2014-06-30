require(["config", "storage", "history"], function(config, Storage){

	var formatDate = function(date){
		return date.getFullYear() + "年" +
			(date.getMonth() + 1 ) + "月" +
			date.getDate() + "日" +
			date.getHours() + "時のミーテイング";

	};

	var formatHistory = function(item){
		var q = item.get("questionnaire");
		var li = document.createElement("li");
		li.innerHTML  = '<h2 class="date">' + formatDate(item.get("timestamp")) + '</h2>' +
			'<div><h3>客観的な指標</h3>' +
			'<span>盛り上がり: ' +
			item.get("score").movie + '</span>' +
			'<span>躍動感: ' +
			item.get("score").audio + '</span>' +
			'</div>' +
			'<div><h3>主観的な指標</h3>' +
			'<span>新規性: ' + q[0]  + '</span>' + 
			'<span>発言できた: ' + q[1]  + '</span>' +
			'<span>深い議論: ' + q[2]  + '</span>' +
			'<span>本音: ' + q[3]  + '</span>' + 
			'</div>';
		return li;
	};
	
	var heading = document.getElementById("results");
	var history = Storage.getHistory();
	var list = document.createElement("ul");
	list.setAttribute("class", "history");
	for(var i = 0; i < history.models.length; i++){
		list.appendChild(formatHistory(history.models[i]));
	}
	heading.parentNode.insertBefore(list, heading.nextSibling);
});
