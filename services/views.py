# Create your views here.
import csv
import os
import datetime
import math

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

import simplejson as json

#from crm.models import Contact
from django.contrib import auth
from django.contrib.auth import authenticate
from django.shortcuts import render, redirect

from registration.models import RegistrationProfile
from main.models import MealType
from main.models import Meal
from main.models import MealElement

from utils.views import *

def add_meal_element(request):
    meta = {'type': request.method}
    result = 'success'
    title = 'Dish Saved'
    message = 'Your dish was saved successfully.'
    objects = []
   
    if request.method == 'POST':
        if ("name" in request.POST) and ("fk_meal_element_type_id" in request.POST):
            if ("id" in request.POST) and (request.POST["id"] != "0"):
              
              me = MealElement.objects.get(pk=request.POST["id"])
              me.meal_element_name=request.POST["name"]
              me.fk_meal_element_type_id=request.POST["fk_meal_element_type_id"]
              me.save()
        
            else:
              me,created = MealElement.objects.get_or_create(meal_element_name=request.POST["name"],
                                                              fk_meal_element_type_id=request.POST["fk_meal_element_type_id"],
                                                              fk_user_id=request.user.id,
                                                              meal_element_date_created=datetime.datetime.now())
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your File Upload failed to validate'
            objects = None

    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)

def delete_meal_element(request):
    meta = {'type': request.method}
    result = 'success'
    title = 'Dish Deleted'
    message = 'Your dish was deleted successfully.'
    objects = []
   
    if request.method == 'POST':
        if "id" in request.POST:
            me = MealElement.objects.get(pk=request.POST["id"])
            me.delete()
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your Dish failed to delete'
            objects = None

    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)

    
def list_meal_element (request, meal = 'All', sort = 'name', page = 1, items_per_page=15, member=0, filter=None):
    total_images = 0
    processed_images = 0
    meta = {'type': request.method,'action': 'meal_elements'}
    result = 'success'
    title = 'Your Elements.'
    message = 'We were able to list your elements.'
    objects = []

    
    if ("sort" in request.GET):
        meal = int(request.GET["sort"])
    if ("meal" in request.GET):
        meal = int(request.GET["meal"])
    if ("page" in request.GET):
        page = int(request.GET["page"])
    if ("limit" in request.GET):
        items_per_page = int(request.GET["limit"])
    if ("filter" in request.GET):
        filter = request.GET["filter"]
    if ("member" in request.GET):
        member = request.GET["member"]
    else:
        member = request.user.id
    
    page = int(page)
    start_index = (page - 1) * items_per_page
    end_index = page * items_per_page

    elements = []
    try:
        if meal == 'unused':
            elements = MealElement.objects.filter(fk_user_id=request.user.id)
            element_count = MealElement.objects.filter(fk_user_id=request.user.id).count()
        elif meal == 'used':
            elements = MealElement.objects.filter(fk_user_id=request.user.id)
            element_count = MealElement.objects.filter(fk_user_id=request.user.id).count()
        elif meal == 'both':
            elements = MealElement.objects.filter(fk_user_id=request.user.id)
            element_count = MealElement.objects.filter(fk_user_id=request.user.id).count()
        elif meal == 'All':
            elements = MealElement.objects.filter(fk_user_id=request.user.id)
            element_count = MealElement.objects.filter(fk_user_id=request.user.id).count()
        else:
            elements = []
            element_count = 0
    except:
        elements = []
        element_count = 0
    
    for element in elements:
        item = {}
        item["id"] = element.id
        item["name"] = element.meal_element_name
        item["fk_meal_element_type_id"] = element.fk_meal_element_type_id
        objects.append(item)
    
    meta['pages'] = int(math.ceil(( element_count / items_per_page)))
    meta['totalresults'] = element_count
    meta['currentPage'] = page
    meta['rpp'] = items_per_page
    meta['sort'] = sort
    meta['filter'] = filter
    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)

def add_meal(request):
    meta = {'type': request.method}
    result = 'success'
    title = 'Dish Saved'
    message = 'Your meal was saved successfully.'
    objects = []
   
    if request.method == 'POST':
        if 1==1:
            pass
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your File Upload failed to validate, with errors: %s' % form.errors
            objects = None

    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)
    
def rate_meal(request):
    meta = {'type': request.method}
    result = 'success'
    title = 'Rating Saved'
    message = 'Your meal was rated successfully.'
    objects = []
   
    if request.method == 'POST':
        if 1==1:
            pass
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your File Upload failed to validate, with errors: %s' % form.errors
            objects = None

    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)

def list_meal_types (request, meal = 'All', sort = 'name', page = 1, items_per_page=15, member=0, filter=None):
    total_images = 0
    processed_images = 0
    meta = {'type': request.method,'action': 'meal_elements'}
    result = 'success'
    title = 'Your Elements.'
    message = 'We were able to list your elements.'
    objects = []

    
    if ("sort" in request.GET):
        meal = int(request.GET["sort"])
    if ("meal" in request.GET):
        meal = int(request.GET["meal"])
    if ("page" in request.GET):
        page = int(request.GET["page"])
    if ("limit" in request.GET):
        items_per_page = int(request.GET["limit"])
    if ("filter" in request.GET):
        filter = request.GET["filter"]
    if ("member" in request.GET):
        member = request.GET["member"]
    else:
        member = request.user.id
    
    page = int(page)
    start_index = (page - 1) * items_per_page
    end_index = page * items_per_page

    elements = []
    try:
        elements = MealType.objects.filter()
        element_count = MealType.objects.filter().count()
    except:
        elements = []
        element_count = 0
    
    for element in elements:
        item = {}
        item["id"] = element.id
        item["name"] = element.meal_type_name
        objects.append(item)
    
    meta['pages'] = int(math.ceil(( element_count / items_per_page)))
    meta['totalresults'] = element_count
    meta['currentPage'] = page
    meta['rpp'] = items_per_page
    meta['sort'] = sort
    meta['filter'] = filter
    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)
    
def login(request):
    meta = {'type': request.method,'action': 'login'}
    result = 'error'
    title = 'Sorry, there was an error.'
    message = 'We were unable to authenticate your account.'
    objects = []

    #Not using Django Forms
    #KISS
    if request.method == 'POST':
        if not 'name' in request.POST or not 'password' in request.POST:
            response = {'result': result, 'title': title, 'message': message}
            return jsonHttpOutput(meta, response, objects)

        auth.logout(request)

        username = request.POST['name'].strip()
        password = request.POST['password'].strip()
        user = authenticate(username = username, password = password)
        if user and user.is_active == 1:
            
            auth.login(request, user)
            result = 'success'
            title = 'Your login was successful.'
            message = 'Your login was successful.'
            objects = [{
                "userid": user.id, "name": user.email,
            }]
        elif user and user.is_active == 0:
            title = 'email'
        else:
            try:
                user = User.objects.filter(email=username)
                title = 'password'
                message = 'The password you entered does not match our records. If you have forgotten you password, <a href="/forgot_password/">reset it here</a>.'
            except:
                title = 'email'
                message = 'We are sorry, no account with that username was found. Your username is the email address you used to create the account. If you cannot locate your username, please email <a href="mailto: support@collectrium.com">support@collectrium.com</a>.'



    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)
    

def signup(request):
    meta = {'type': request.method,'action': 'signup'}
    result = 'notice'
    title = 'Sorry, there was an error.'
    message = 'We were unable to create your account.'
    objects = []

    dologin = True

    #Not using Django Forms
    if request.method == 'POST':
        #,'username'
        FIELDS = ['name','password','password_conf']
        for FIELD in FIELDS:
            if FIELD not in request.POST:
                result = 'error'

        if result != 'error':
            print request.POST['password']       
            if request.POST['password'] != request.POST['password_conf']:
                result = 'error'
                title = 'Password Mismatch'
                message = 'Your passwords don\'t match'
            else:

                member = User.objects.create_user(request.POST['name'], 
                                                  request.POST['name'],
                                                  request.POST['password'],)
                member.is_active = True
                member.save()

                registration_profile = RegistrationProfile.objects.create_profile(member)

                if not member:
                    result = 'error'
                    title = 'Sorry, there was an error.'
                    message = 'We were unable to create your account.'
                else:
                    user = authenticate(username=request.POST['name'], password=request.POST['password'])
                    if user is not None:
                        if user.is_active:
                            auth.login(request, user)
                    result = 'success'
                    title = 'Your account was created.'
                    message = 'You can login using the email and password you provided.'
                    objects = [ {"userid":member.id,"email":member.email,"username":member.username} ]

    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)

def logout(request):
    meta = {'type': request.method,'action': 'login'}
    result = 'success'
    title = 'You were logged out.'
    message = 'You were logged out.'
    objects = []

    #Not using Django Forms
    #KISS
    auth.logout(request)
    
    response = {'result': result, 'title': title, 'message': message}
    return jsonHttpOutput(meta, response, objects)