// JavaScript Document
App.Meal = Ember.Object.extend({
    id: 0,
    meal_name: '',
    meal_date: '',
    meal_elements: null
});

App.MealElement = Ember.Object.extend ({
    id: 0,
    name: '',
    fk_meal_element_type_id: 0
});

App.MealType = Ember.Object.extend ({
    id: 0,
    name: ''
});
