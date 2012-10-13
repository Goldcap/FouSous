// JavaScript Document
App.homePageActions = Ember.View.extend({
   doRate: function() {
        App.homePageControl.forms.set('action','rate');
        
   },
   
   doMeal: function() {
        App.homePageControl.forms.set('action','meal');
   
   },
   
   doDish: function() {
        App.homePageControl.forms.set('item',App.homePageControl.get('dish'));
        App.homePageControl.forms.set('action','dish');
   
   }
});

App.loginLaunch = Ember.View.extend({
    
    showSignup: function() {
        App.homePageControl.forms.set('action','signup');
    },
    
    showLogin: function() {
        App.homePageControl.forms.set('action','login');
    }
});

App.logoutLaunch = Ember.View.extend({
    
    showLogout: function() {
        App.homePageControl.forms.set('action','logout');
    }
});

App.loginSignupClick = Ember.View.extend({
    
    showSignup: function() {
        $('#form_login').trigger('reveal:close'); 
        App.homePageControl.forms.set('action','signup');
    }
    
});

App.signupLoginClick = Ember.View.extend({
    
    showLogin: function() {
        $('#form_signup').trigger('reveal:close'); 
        App.homePageControl.forms.set('action','login');
    }
});

App.mealElementListView = Ember.CollectionView.extend({
   itemViewClass: "App.mealElementListItemView",
   contentBinding: "App.homePageControl.meal_elements",
   classNames: ['link-list'],
   tagName: "ul"
});

App.mealElementListItemView = Ember.View.extend({
    
    doEdit: function() {
        App.homePageControl.set('dish',this.get('content'));
        App.homePageControl.forms.set('item',App.homePageControl.get('dish'));
        App.homePageControl.forms.set('action','dish');    
    },
    
    doDelete: function() {
        App.homePageControl.set('dish',this.get('content'));
        App.homePageControl.forms.set('item',App.homePageControl.get('dish'));
        App.homePageControl.forms.deleteDish();
    },
    
    template: Ember.Handlebars.compile('<ul class="link-list"><li>{{view.content.name}}</li><li {{ action doEdit}} >&nbsp;</li><li {{ action doDelete}} >&nbsp;</li></ul>'),
    classNames: ['menu-element'],
    tagName: "li"
}); 