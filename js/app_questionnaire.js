requirejs.config({
	baseUrl: 'js',
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

requirejs(['questionnaire/result', 'questionnaire/answer', 'storage'], function(Result, Answer, Storage){

	var inputs = [
		document.getElementById("range01"),
		document.getElementById("range02"),
		document.getElementById("range03"),
		document.getElementById("range04")
	];

	var result = new Result();

	var initInputs = function(){
		for(var i = 0; i < inputs.length; i++){
			inputs[i].value = 50;
		}
	};

	var nextAction = function(){
		var answer = new Answer({
			id: result.models.length,
			answer: inputs.map(function(input){
				return parseInt(input.value);
			})
		});
		result.add(answer);
		if(window.confirm("全員入力しましたか?")){
			finishAction();
		}
		initInputs();
	};

	var finishAction = function(){
		Storage.set("questionnaire", result);
		var json = result.toJSON();
		var score = Storage.get("score");
		Storage.set("score", score);
		window.location = "result.html";
	};

	var associateElements = function(){
		var nextButton = document.getElementById("next_button");
		nextButton.addEventListener("click", nextAction);
	};

	var main = function(){
		initInputs();
		associateElements();
	};

	main();
});
