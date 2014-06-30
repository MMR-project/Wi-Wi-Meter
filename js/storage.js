define(["questionnaire/result", "history"], function(Result, History){

	var Storage = {
    key: {
      score: "score",
      questionnaire: "questionnaire",
      dataSlot: "data-slot",
      defaultDataSlot: "history"
    },
		getScore: function(){
			var score = null;
			if(window.sessionStorage != null &&
			   (score = window.sessionStorage.getItem(Storage.key.score)) != null){
				score = JSON.parse(score);
			}else{
				var data = window.location.href.split("?")[1];
				var text = data.split("=")[1];
				var decodetext = decodeURIComponent(text);
				var result = decodetext.split(",");
				score = {
					movie: result[0] || 0,
					audio: result[1] || 0
				};
			}
			return score;
		},
		setScore: function(scoreMovie, scoreAudio){
			var score = null;
			if(scoreMovie != null &&
			   scoreMovie.movie != null && scoreMovie.audio != null){
				score = scoreMovie;
			}else{
				score = {
					movie: scoreMovie,
					audio: scoreAudio
				};
			}
			window.sessionStorage.setItem(Storage.key.score, JSON.stringify(score));
			document.location  ="questionnaire.html";
		},
		getAnswer: function(){
			var json = window.sessionStorage.getItem(Storage.key.questionnaire) || "";
			var result = null;
			if(json.length > 0){
				json = JSON.parse(json);
				result = new Result(json);
			}
			return result;
		},
		setAnswer: function(result){
			var json = "";
			json = result.toJSON();
			window.sessionStorage.setItem(Storage.key.questionnaire, json);
		},
    getDataSlot: function(){
      return window.sessionStorage.getItem(Storage.key.dataSlot) || Storage.key.defaultDataSlot;
    },
    setDataSlot: function(slot){
      window.sessionStorage.setItem(Storage.key.dataSlot, slot);
    },
		getHistory: function(slot){
			var result = null;
      if(slot == null){
        slot = Storage.getDataSlot();
      }
			var json = window.localStorage.getItem(slot) || "";
			if(json.length > 0){
				json = JSON.parse(json);
				result = new History(json);
			}else{
        result = new History();
      }
			return result;
		},
		setHistory: function(history){
			var json = "";
			json = history.toJSON();
			window.localStorage.setItem(Storage.getDataSlot(), json);
		},
		clearHistory: function(){
			window.localStorage.setItem(Storage.getDataSlot(), null);
		}
	};

	var handlers = {
		get_score: Storage.getScore,
		set_score: Storage.setScore,
		get_answer: Storage.getAnswer,
		set_answer: Storage.setAnswer,
		set_questionnaire: Storage.getAnswer,
		set_questionnaire: Storage.setAnswer,
		set_history: Storage.setHistory,
		get_history: Storage.getHistory,
		clear_history: Storage.clearHistory
	};

	Storage["get"] = function(key){
		var name = "get_" + key;
		if(key != null && key.length >  0 && handlers[name] != null){
			return handlers[name].call();
		}
		return null;
	};

	Storage["set"] = function(key, value){
		var name = "set_" + key;
		if(key != null && key.length > 0 && handlers[name] != null){
			var values = [];
			for(var i = 1; i < arguments.length; i++){
				values.push(arguments[i]);
			}
			return handlers[name].apply(null, values);
		}
		return null;
	};

	Storage["clear"] = function(key){
		var name = "clear_" + key;
		if(key != null && key.length > 0 && handlers[name] != null){
			return handlers[name].call();
		}
	};
	
	return Storage;
	
});
