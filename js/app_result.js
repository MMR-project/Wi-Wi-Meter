requirejs.config({
    baseUrl: 'js',
    paths: {
        lib: './lib'
    },
	shim: {
		"lib/backbone": {
			deps: ["lib/underscore", "lib/jquery"],
			exports: "Backbone"
		},
		"lib/underscore":{
			exports: "_"
		},
		"lib/jquery": {
			exports: "jQuery"
		}
	}
});

require(["lib/radar", "storage", "history", "history/item"], function(html5jp, Storage, History, HistoryItem){
	html5jp = html5jp || window.html5jp;
	var score = Storage.get("score");
	var answers = Storage.get("answer");
	var history = Storage.get("history") || new History();
	var average = answers.average();
	var aveEnq = 0;

	var showSubjectiveEvaluation = function(){
		var rc = new html5jp.graph.radar("evaluation");
		if(rc != null) {
			var items = average.slice(0, average.length);
			items.unshift("評価");
			items.push(score.audio, score.movie);
			var params = {
 				aCap: ["新規性 "+items[1], "発言できた "+items[2], "深い議論 "+items[3], "本音 "+items[4], "盛り上がり "+score.audio, "躍動感 "+score.movie],
 				aMax: 100
			};
			rc.draw([items], params);
			aveEnq = (items[1] + items[2] + items[3] + items[4]) / 4;
		}
	};

	var showObjectiveEvaluation = function(){
		aveMon = (score.audio + score.movie) / 2;
		scoreTotal = (aveMon + aveEnq) / 2;
		document.getElementById("scoreTotal").innerHTML = 
			'総合点: <span class="value">' + scoreTotal + '</span> 点';
		document.getElementById("scoreMon").innerHTML =
			'モニタ点: <span class="value">' + aveMon + '</span> 点';
		document.getElementById("scoreEnq").innerHTML = 
			'アンケート点: <span class="value">' + aveEnq + '</span> 点';
	};


	/*
	 * save the result
	 */
	var saveHistory = function(){
		var history_item = new HistoryItem({
			questionnarie: average,
			score: score
		});
		history.add(history_item);
		Storage.set("history", history);
	};
	
	var showTotalEvaluation = function(){
		var display = document.getElementById("result");
		var total_score = score.movie + score.audio;
		
		if( total_score > 180){
    		display.setAttribute("class", "excellent");
		} else if(total_score > 140){
			display.setAttribute("class", "great");
		} else if(total_score > 90){
			display.setAttribute("class", "good");
		} else {
			display.setAttribute("class", "not_bad");
		}
	};
	
	showSubjectiveEvaluation();
	showObjectiveEvaluation();
	showTotalEvaluation();
	saveHistory();
});
