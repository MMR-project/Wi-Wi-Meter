define(["lib/backbone", "questionnaire/answer"], function(Backbone, Answer){

	var Result = Backbone.Collection.extend({
		model: Answer,
		
		average: function(){
			var self = this;
			var result = [];
			for(var i = 0; i < self.models.length; i++){
				var answer = self.models[i].get("answer") || [];
				for(var j = 0; j < answer.length; j++){
					result[j] = result[j] || 0.0;
					result[j] += answer[j] * 1.0;
				}
			}
			result = result.map(function(item){
				return item / self.models.length;
			});
			return result;
		},
		toJSON: function(){
			var tmp = this.models.map(function(answer){
				return answer.toJSON();
			});
			return JSON.stringify(tmp);
		}
	});

	return Result;
	
});

