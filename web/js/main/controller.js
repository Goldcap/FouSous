//********************************
//  CONTROLLERS
//********************************
App.homePageControl = Ember.Object.create({
    
    connection: null,
    form: null,
    meal: null,
    dish: null,
    meal_types: null,
    
    init: function() {
        
        this.set("meal_types",Collectrium.Collection.create());
        this.meal_types.set('clearpost',true);
        this.meal_types.set('clearmethod','collate');
        this.meal_types.set('clearid','id');
        this.meal_types.set('type',App.MealType);
        this.meal_types.populate([{'id':1,'name':'Breakfast'}]);
        
        this.set("forms",App.homePageForms);
        this.set("meal",App.Meal.create()); 
        this.set("dish",App.MealElement.create());
        
        this._super();
        
    },
    
    showError: function( type, title, message ) {
        //console.log("SHOWING ERROR of " + type + " WITH " + title + " AND " + message);
        Collectrium.Error.showError( type, title, message );    
    },
    
    
});