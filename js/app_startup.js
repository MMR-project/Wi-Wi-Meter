require(["config", "storage", "data_slot"], function(config, Storage, DataSlot){

  var slots = [];
  var selected = null;

  var toArray = function(nodelist){
    return [].map.call(nodelist, function(elm){
      return elm;
    });
  };

  var resetSession = function(){
    var history = Storage.getHistory();
    history.newSession();
  };

  var initDataSlotList = function(){
    slots = toArray(document.querySelectorAll(".save-data")).map(function(slot){
      var view = new DataSlot({
        parent: slot
      });
      view.on("setDataSlot", function(){
        selected = view;
        render();
        showSelectedDataSlot();
      });
      if(view.slotname() == Storage.getDataSlot()){
        selected = view;
      }
      return view;
    });
  };

  var showSelectedDataSlot = function(){
    if(selected != null){
      selected.$el.prepend('<span class="selected">選択中：</span>');
    }
  };

  var render = function(){
    for(var i = 0; i < slots.length; i++){
      slots[i].render();
    }
  };

  var init = function(){
    resetSession();
    initDataSlotList();
    render();
    showSelectedDataSlot();
  };

  init();
  
});
