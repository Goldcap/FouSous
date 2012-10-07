// JavaScript Document
App.homePageActions = Ember.View.extend({
   doRate: function() {
        App.homePageControl.forms.set('action','rate');
        
   },
   
   doMeal: function() {
        App.homePageControl.forms.set('action','meal');
   
   },
   
   doDish: function() {
        App.homePageControl.forms.set('action','dish');
   
   }
});