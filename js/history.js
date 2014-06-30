define(["lib/backbone", "history/item"], function(Backbone, Item){

	var History = Backbone.Collection.extend({
		model: Item,
    sessionName: "session",
		toJSON: function(){
			var items = this.models.sort(Item.compare);
			return JSON.stringify(items);
		},
    merge: function(merged){
      for(var i = 0; i < merged.length; i++){
        this.add(merged.at(i));
      }
    },
    newSession: function(){
      window.sessionStorage.removeItem(this.sessionName);
    },
    toSave: function(){
      return window.sessionStorage.getItem(this.sessionName) == null;
    },
    addItem: function(item){
      if(this.toSave()){
        window.sessionStorage.setItem(this.sessionName, true);
        this.add(item);
      }
    },
    latestItem: function(){
      return this.at(this.length - 1);
    }
	});

	return History;
	
});
