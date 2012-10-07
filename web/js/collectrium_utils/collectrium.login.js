// JavaScript Document
var collectrium = collectrium || {};
collectrium.login = function( options ){
  this.options = $.extend({
    userid: 0,
    username: null,
    email: null,
    loginValidator: null,
    signupValidator: null,
    newsletterValidator: null
	}, options);
	this.init();
}

collectrium.login.prototype = {

  init: function() {
    var scope = this;
    this.attatchEvents();
    /*
    var pmatch =  !!window.location.hash && window.location.hash.match(/pu=(\d+)/) ? window.location.hash.match(/pu=(\d+)/,'') : 0;
	if (pmatch.length > 0) {
       scope.showDialog();  
	}
    */
  },
  
  attatchEvents: function() {
    this.unlockInput();
    
    var scope = this;
    
    $("#reserve_signup_link").click(function(e){
        e.preventDefault();
        scope.showSignup();
    });
    
    $("#reserve_login_link").click(function(e){
        e.preventDefault();
        scope.showLogin();
    });
    
    $("input[name='role']").click(function(e){
       console.log("Clicked Artfair");
       scope.checkRole(e);
       //scope.showSignupTwo();
    });
    
    this.options.loginValidator = $("#login").validate({
      submitHandler: function(form) {
        scope.lockInput();
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("login_success", _.bind(scope.loginResult,scope));
        $(this.connection).bind("login_failure", _.bind(scope.loginResult,scope));
        this.connection.postForm( '/services/v1/login/', form, "login" );
      },
      errorElement: "small",
      rules: {
    	email: {
            required: true
            /*email: true*/
        },
        password: {
            required: true
        }
      }
    });
    
    this.options.signupValidator = $("#signup").validate({
      submitHandler: function(form) {
        if ($("#login_action").val() == "Next") {
            scope.showSignupTwo();
        } else {
            scope.lockInput();
            this.connection = new collectrium.apiConnection( {} );
            $(this.connection).bind("signup_success", _.bind(scope.loginResult,scope));
            $(this.connection).bind("signup_failure", _.bind(scope.loginResult,scope));
            this.connection.postForm( '/services/v1/signup/', form, "signup" );
        }
      },
      errorElement: "small",
      rules: {
    	email: {
            required: true,
            email: true
        },
        username: {
            required: true
        },
    	first_name: {
    	   required: true
    	},
        last_name: {
            required: true
        },
        password: {
            required: true
        },
        password_confirm: {
            required: true,
            equalTo: "#signup #password"
        },
        tos: {
            required: true
        },
        user_event_content: {
            required: true
        }
      }
    });

    this.options.newsletterValidator = $("#newsletter").validate({
      submitHandler: function(form) {
        scope.lockInput();
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("newsletter_success", _.bind(scope.newsletterResult, scope));
        $(this.connection).bind("newsletter_failure", _.bind(scope.newsletterResult, scope));
        this.connection.postForm('/services/v1/newsletter/', form, 'newsletter');
      },
      errorElement: "small",
      rules: {
        email_subscribe: {
            required: true,
            email: true
        }
      }
    });
    
  },
  
  loginResult: function( event, result ) {
    
    if (result.response.result == 'success') {
        this.options.userid = result.objects[0].userid;
        this.options.username = result.objects[0].username;
        this.options.email = result.objects[0].email;   
    }
    
    //error.showError(result.response.result,result.response.title,result.response.message);
    if (result.response.result == 'success') {
        if (result.meta.action == 'signup') {
            $(this).trigger('signupComplete',result);
        } else if (result.meta.action == 'login') {
            $(this).trigger('loginComplete',result);
        }
    } else {
        this.unlockInput();
        var razzle = {};
        razzle[result.response.title] = result.response.message;
        if (result.meta.action == 'signup') {
            this.options.signupValidator.showErrors(razzle);
        } else if (result.meta.action == 'login') {
            this.options.loginValidator.showErrors(razzle);
        }
    }
  },

  newsletterResult: function(event, result) {
    this.unlockInput();
    if (result.response.success) {
      $('#newsletter').parents('ul').find('p').text(result.response.message);
      $("#newsletter").remove();
    } else {
      this.options.newsletterValidator.showErrors({"email_subscribe": result.response.message});
    }
  },
  
  lockInput: function() {  
    console.log("Lockin!");
    $("input[type='submit']").attr("disabled", "true");
    $("#process_login").fadeIn(500);
  },
  
  unlockInput: function() {
    $("input[type='submit']").removeAttr("disabled");
    $("#process_login").fadeOut(500);
  },
  
  showLogin: function( event ) {
    this.unlockInput();
    $("#modal_signup").fadeOut(500).queue(function(){
        $("#modal_signup").hide();
        $("#modal_login").fadeIn(500);
        $(this).dequeue();    
    });
  },
  
  showSignup: function( event ) {
    this.unlockInput();
    $("#modal_login").fadeOut(500).queue(function(){
         $("#modal_login").hide();
        $("#modal_signup").fadeIn(500);
        $(this).dequeue();    
    });
    
  },
  
  showSignupTwo: function( event ) {
    this.swapSignupAction("Sign In \u00BB");
    $("#page_one").fadeOut(500).queue(function(){
        $("#page_one").hide();
        $("#page_two").fadeIn(500);
        $(this).dequeue();    
    });
    
  },
  
  checkRole: function( event ) {
    if (($("input[name='role']:checked").val() == 'artfair') ||
        ($("input[name='role']:checked").val() == 'museum') ||
        ($("input[name='role']:checked").val() == 'consultant')){
        this.swapSignupAction("Next");
    } else {
        this.swapSignupAction("Sign In \u00BB");
    }
  },
  
  swapSignupAction: function( value ) {
    $("#login_action").val(value);  
  }
  
}
