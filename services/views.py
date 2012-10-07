# Create your views here.
import csv
import os

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

import simplejson as json

#from crm.models import Contact
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
        if 1==1:
            pass
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your File Upload failed to validate, with errors: %s' % form.errors
            objects = None

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