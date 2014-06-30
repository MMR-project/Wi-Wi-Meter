define(["lib/jquery", "lib/backbone", "Storage"], function($, Backbone, Storage){

  var createButton = function(text, handler){
    return $("<a>").attr("href", "#").text(text).bind("click", handler);
  };

  var createSelectButton =  function(text, handler){
    return createButton(text, handler).addClass("select");
  };

  var createDeleteButton = function(text, handler){
    return createButton(text, handler).addClass("delete");
  };

  var formatDate =  function(date){
		return date.getFullYear() + "年" +
			(date.getMonth() + 1 ) + "月" +
			date.getDate() + "日" +
			date.getHours() + "時のミーテイング";
	};
  var view = Backbone.View.extend({
    tagName: "span",
    slotPrefix: "waiwai_data",
    initialize: function(config){
      this.$parentNode = $(config.parent);
      this.history = Storage.getHistory(this.slotname());
    },
    slotname: function(){
      return this.slotPrefix + "_" + this.$parentNode.attr("id");
    },
    hasData: function(){
      return this.history != null && this.history.length > 0;
    },
    setDataSlot: function(){
      Storage.setDataSlot(this.slotname());
      this.trigger("setDataSlot");
    },
    deleteDataSlot: function(){
      Storage.clearHistory();
      this.history = null;
      this.trigger("deleteDataSlot");
      this.render();
    },
    render: function(){
      this.$el.empty();
      if(this.hasData()){
        this._renderWithHistory();
      }else{
        this._renderWithNoHistory();
      }
      this.$parentNode.append(this.$el);
    },
    _renderWithHistory: function(){
      this.$el.append(createSelectButton(formatDate(this.history.latestItem().get("timestamp")),
                                         this.setDataSlot.bind(this)));
      this.$el.append(createDeleteButton("削除", this.deleteDataSlot.bind(this)));
    },
    _renderWithNoHistory: function(){
      this.$el.append(createSelectButton("No data", this.setDataSlot.bind(this)));
    }
  });
  return view;
});
