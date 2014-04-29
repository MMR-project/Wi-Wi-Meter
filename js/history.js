define(["lib/backbone", "history/item"], function(Backbone, Item){

	var History = Backbone.Collection.extend({
		model: Item,
		toJSON: function(){
			var items = this.models.sort(Item.compare);
			return JSON.stringify(items);
		}
	});

	return History;
	
});
