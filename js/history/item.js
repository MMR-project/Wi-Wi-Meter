define(["lib/backbone"], function(Backbone){

	var History = Backbone.Model.extend({
		initialize: function(){
			this.set("timestamp", this.get("timestamp") || new Date());
			if(typeof this.get("timestamp") == "string"){
				this.set("timestamp", new Date(this.get("timestamp")));
			}
			this.set("score", this.get("score") || {
				movie: 0,
				audio: 0
			});
			this.set("questionnaire", this.get("questionnarie") || [0, 0, 0, 0]);
		}
	});
	History.compare = function(a, b){
		return a.get("timestamp").getTime() - b.get("timestamp").getTime();
	};

	return History;
	
});
