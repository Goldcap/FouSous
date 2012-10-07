// JavaScript Document
App.homePageForms = Em.Object.create({
    
  item: null,
  connection: null,
  result: null,
  
    init: function() {
    
        this.model =     {  'rate_meal':'/services/api/v1/meal/rate/',
                            'add_dish':'/services/api/v1/meal_element/add/',
                            'add_meal':'/services/api/v1/meal/add/'}
        
    },
  
    takeAction: function() {
        if (this.get('action') == 'rate') {
            this.doRate();
        } else if (this.get('action') == 'meal') {    
            this.doMeal();
        } else if (this.get('action') == 'dish') {    
            this.doDish();
        } 
        return false;
    }.observes('action'),
  
    
  doRate: function() {
    
    var scope = this;
   
    $("#rate_meal").validate({
      submitHandler: function(form) {
        var item = {};
        if (scope.item != null) {
            item = scope.item.serialize()
        }
        
        scope.set('connection',Collectrium.Connection.create());
        scope.connection.ajaxPost( scope.model.rate_meal, item, "rate_meal" );
        return false;
      },
      errorElement: "small",
      rules: {
    	}
    });
    
    $('#form_rate_meal').reveal({
       closeonbackgroundclick: true,              //if you click background will modal close?
       dismissmodalclass: 'close-reveal-modal',
       close: scope.clear()
    });
  },
  
  doMeal: function() {
    
    var scope = this;
   
    $("#add_meal").validate({
      submitHandler: function(form) {
        var item = {};
        if (scope.item != null) {
            item = scope.item.serialize()
        }
        
        scope.set('connection',Collectrium.Connection.create());
        scope.connection.ajaxPost( scope.model.add_meal, item, "add_meal" );
        return false;
      },
      errorElement: "small",
      rules: {
    	}
    });
    
    $('#form_add_meal').reveal({
       closeonbackgroundclick: true,              //if you click background will modal close?
       dismissmodalclass: 'close-reveal-modal',
       close: scope.clear()
    });
  },
  
  doDish: function() {
    
    var scope = this;
   
    $("#add_dish").validate({
      submitHandler: function(form) {
        var item = {};
        if (scope.item != null) {
            item = scope.item.serialize()
        }
        
        scope.set('connection',Collectrium.Connection.create());
        scope.connection.ajaxPost( scope.model.add_dish, item, "add_dish" );
        return false;
      },
      errorElement: "small",
      rules: {
    	}
    });
    
    $('#form_add_dish').reveal({
       closeonbackgroundclick: true,              //if you click background will modal close?
       dismissmodalclass: 'close-reveal-modal',
       close: scope.clear()
    });
  },
  
  formSuccess: function( event, result ) {
    //Some Wonky RESULT From Ember
    if (result == 'connection.status') {
        var result = this.connection.get('result');
    } else {
        //Some strangeness due to fileupload
        var result = result.result;
    }
    if ((typeof event == 'undefined') || (typeof event.type == 'undefined')) {
        var event = this.connection.get('status');
    } else  {
        var event = event.type;
    }
    //console.log(event);
    //console.log(result);
     
    switch(event) {
      case "rate_meal_success": 
        App.homePageControl.showError(result.response.result,result.response.title,result.response.message); 
        break;
      case "add_dish_success":
        App.homePageControl.showError(result.response.result,result.response.title,result.response.message); 
        break;
      case "add_meal_success":
        App.homePageControl.showError(result.response.result,result.response.title,result.response.message); 
        break;
      default:
        break;
    }
        
    this.set('action',null);
    
    //this.clear();
    
  }.observes('connection.status'),
  
  clear: function() {       
    this.set('item',null);
    this.set('action',null);
    this.set('result',null);
  },
  
  formFailure: function( event, result ) {
    error.showError("error","Your information not saved.","Please check your data and try again."); 
  }
  
});