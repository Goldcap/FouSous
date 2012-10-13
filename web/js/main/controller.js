//********************************
//  CONTROLLERS
//********************************
App.homePageControl = Ember.Object.create({
    
    connection: null,
    meal_elements: null,
    
    form: null,
    meal: null,
    dish: null,
    meal_types: null,
    
    init: function() {
        
        this.set('meal_elements',Collectrium.Collection.create({"name":"meal_elements"}));
        this.meal_elements.set('clearpost',true);
        this.meal_elements.set('clearmethod','collate');
        this.meal_elements.set('clearid','id');
        this.meal_elements.set('type',App.MealElement);
        this.meal_elements.set('url',"/services/api/v1/meal_element/list/");
        this.meal_elements.fetch();
            
        this.set("meal_types",Collectrium.Collection.create());
        this.meal_types.set('clearpost',true);
        this.meal_types.set('clearmethod','collate');
        this.meal_types.set('clearid','id');
        this.meal_types.set('type',App.MealType);
        this.meal_types.set('url',"/services/api/v1/meal_types/list/");
        this.meal_types.fetch();
        
        this.set("signup",App.signupRequest.create());
        
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

$(document).foundationTabs();