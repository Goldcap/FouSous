# Create your views here.
import json
import csv
import sys
import os
import re  
import datetime
import openpyxl
import xlrd
import random
import string
import shutil
import zipfile
import math 

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F
from django.db.models import Q
from django.utils.importlib import import_module
from django.core.files import File
from django.shortcuts import render
from django.db.models.fields.files import ImageFieldFile
from django.views.decorators.cache import cache_control
from django.template.response import TemplateResponse 
from django.contrib.auth.decorators import login_required
from django.conf import settings

def main (request):
    """ Viewing artifact details """
    
    template = 'main/pages/index.html'
    
    return render(request, template)
