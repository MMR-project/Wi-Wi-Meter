define(["lib/backbone"], function(Bacbone){

	var Answer = Backbone.Model.extend({
		add: function(value){
			var answer = this.get("answer") || [];
			answer.push(value);
			this.set("answer", answer);
		},
		toHash: function(){
			return {
				id: this.get("id"),
				answer: this.get("answer")
			};
		}
	});


	return Answer;
});
