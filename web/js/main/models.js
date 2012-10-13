// JavaScript Document
App.signupRequest = Ember.Object.extend(Collectrium.Serializable,{
    name: '',
    password: '',
    password_conf: ''
});

App.Meal = Ember.Object.extend(Collectrium.Serializable,{
    id: 0,
    meal_name: '',
    meal_date: '',
    meal_elements: null
});

App.MealElement = Ember.Object.extend (Collectrium.Serializable,{
    id: 0,
    name: '',
    fk_meal_element_type_id: 0
});

App.MealType = Ember.Object.extend (Collectrium.Serializable,{
    id: 0,
    name: ''
});
