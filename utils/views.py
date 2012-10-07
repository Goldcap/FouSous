#!/usr/bin/env python

import hashlib
import string
import simplejson as json
import csv
import re
from decimal import *
from collections import defaultdict
from dateutil.parser import *
from xlrd import xldate_as_tuple

from django.http import HttpResponse
from django.core import serializers
from django.utils.importlib import import_module 

def hashFile(file,bin=False):
    #md5 = hashlib.md5()
    #print file
    file_reference = open(file,'rb').read()
    #with afile as f:
    #    for chunk in iter(lambda: f.read(8192), b''):
    #         md5.update(chunk)
    if bin:
        return hashlib.md5(file_reference).digest()
    else:
        return hashlib.md5(file_reference).hexdigest()

def hashPath(file):
    return file[:1] + '/' + file[:2] + '/' + file[:3]

def objEncoder(obj):
    item ={}
    for field in obj._meta.fields:
        item[field.name] = getattr(obj, field.name)
    return item

def textHttpOutput( response ):
    return HttpResponse(response, mimetype="application/json")
    
def jsonHttpOutput( meta, response, objects=None ):
    response_data = {'objects': objects, 'meta': meta, 'response': response}
    return HttpResponse(json.dumps(response_data), mimetype="application/json")

def dataTablesOutput( sEcho, iTotalRecords, iTotalDisplayRecords, aaData ):
    response_data = {'sEcho': sEcho, 'iTotalRecords': iTotalRecords, 'iTotalDisplayRecords': iTotalDisplayRecords, 'aaData' : aaData}
    return HttpResponse(json.dumps(response_data), mimetype="application/json")
    
def csvHttpOutput( name, objects=None, titles=None ):
    response = HttpResponse(mimetype='text/csv')
    response['Content-Disposition'] = 'attachment; filename='+name+'.csv'
    
    writer = csv.writer(response)
        
    if (titles):
        writer.writerow(titles)
    
    if objects:
        for row in objects:
            writer.writerow(row)
                        
    return response
    
#Stolen directly from here:
#https://docs.djangoproject.com/en/dev/topics/db/sql/#executing-custom-sql-directly
def dictfetchall(cursor):
    #"Returns all rows from a cursor as a dict"
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]

def undocode(str):
    #str = str.decode("utf_8","ignore")
    return str.encode("ascii", "ignore")

def stripdecode(str):
    str = str.encode("ascii", "ignore")
    return str.replace('"','')
    
def mini_clean_string (str):
    #str = str.decode("utf_8","ignore")
    str = str.encode("ascii", "ignore")
    for ch in """"'`""":
        str = string.replace(str, ch, '')
    return ''.join([c for c in str if ord(c) > 31 or ord(c) == 9])
            
def clean_string (str):
    #str = str.decode("utf_8","ignore")
    str = str.encode("ascii", "ignore")
    for ch in """!"#$%&()*,:;<=>?@[\\]? '`{|}?""":
        str = string.replace(str, ch, '_')
    return ''.join([c for c in str if ord(c) > 31 or ord(c) == 9])

def float_this_number (astr):
    if (astr == None):
        return float(0)
    if type(astr) == float:
        return astr
    if (astr == ''):
        return float(0)
    if type(astr) == int:
        return float(astr)

    format = ","
    #we have a comma, and more than one period
    if astr[-3:-2] == (","):
        format = "."
    if (astr.count(".") == 1) and (astr.count(",") > 1):
        format = ","
    if (astr.count(",") == 1) and (astr.count(".") > 1):
        format = "."
    var = astr.replace(format, "")
    try:
        return float(var)
    except:
        return float(0)

def filter_value (valfilter,**kwargs):
    #print "VAL FILTER IS " + valfilter
    if (not valfilter):
        return kwargs["val"]
    the_module,the_function = valfilter.split(':')
    engine = import_module(the_module)
    #try:
    return getattr(engine, the_function)(**kwargs)
    #except:
        #return kwargs["val"]

def parse_float (**kwargs):
    return float_this_number (kwargs["val"])
            
def parse_date (**kwargs):
    print "VAL IS " + str(kwargs["val"])
    return parse(kwargs["val"])
    try:
        return parse(kwargs["val"])
    except:
        return kwargs["val"]

def parse_xlrd_date (**kwargs):
    print "VAL IS " + str(kwargs["val"])
    if kwargs["DOCTYPE"] == "excel":
        adate = xldate_as_tuple (kwargs["val"],kwargs["DATEMODE"])
        return "%04d-%02d-%02d %02d:%02d:%02d" % adate
    else:
        adate = parse_date (**kwargs)
        return adate.strftime('%Y-%m-%d %H:%M:%S')
    #try:
    #    return parse(kwargs["val"])
    #except:
    #    return kwargs["val"]
        
def conversion_factor(size):
    """
    Determines the multiplier for normalizing the size measurements.
    """
    # look for cm, in., ft., meters
    conversion_factor = Decimal('1.0')
    if 'in.' in size:
        conversion_factor = Decimal('2.54')
    elif 'ft.' in size:
        conversion_factor = Decimal('12.0') * Decimal('2.54')
    elif 'meter' in size:
        conversion_factor = Decimal('1000.0')
    return conversion_factor

def parse_size(**kwargs):
    """
    Normalizes a size measurement. Returns a float, in member default unit
    """
    member = kwargs["member"]
    val = kwargs["val"]
    
    #print("Member unit is: %s" % member.default_measurement_unit_id)
    #print("Value is: %s" % val)
    if (not val):
        return Decimal(0.00)
    
    regx = re.compile("(?P<size>\d+)\s?(?P<unit>.+)")
    r = regx.search(str(val))
    if r:
        #print("Found size of: %s" % r.group('size'))
        #print("Found unit of: %s" % r.group('unit'))
        #We'll convert to centimeters
        converter = conversion_factor(r.group('unit').lower())
        size = Decimal(r.group('size')) * converter
        if member.default_measurement_unit_id == 2: 
            userconverter = conversion_factor("in.")
        else:
            userconverter = Decimal('1.0')
        return Decimal(size * userconverter)
    else:
        return Decimal(0.00)
        
    
def parse_dimensions(**kwargs):
    """
    Normalizes a size measurement into centimeters. Returns a tuple of depth,
    height, width.
    """
    return kwargs["val"]
    
    converter = conversion_factor(size)
    depth = height = width = Decimal('0.0')

    # basic existence check
    if not size:
        return depth, height, width

    # look for num x num x num pattern
    # ex: '8.25 x 16.25 x 1 in.'
    d_h_w = re.compile("(?P<depth>\d+.?\d*) x (?P<height>\d+\.?\d*) x (?P<width>\d+\.?\d*)")
    r = d_h_w.search(size)
    if r:
        depth = Decimal(r.group('depth')) * converter
        height = Decimal(r.group('height')) * converter
        width = Decimal(r.group('width')) * converter
        return depth, height, width

    # look for num x num pattern
    # ex: '21.3 x 45 in.'
    h_w = re.compile("(?P<height>\d+\.?\d*) x (?P<width>\d+\.?\d*)")
    if 'and' in size:
        # there are two h/w pairs, return the larger
        # ex: '21.3 x 45 and 32 x 56 in. ea.'
        r = h_w.findall(size)
        r.sort(reverse=True)
        height = Decimal(r[0][0]) * converter
        width = Decimal(r[0][1]) * converter
        return depth, height, width

    # look for num x num pattern
    # ex: '21.3 x 45 in.'
    # single h/w pair only
    r = h_w.search(size)
    if r:
        height = Decimal(r.group('height')) * converter
        width = Decimal(r.group('width')) * converter
        return depth, height, width

    # look for num-num pattern
    # ex: '6-8 ft. tall'
    h = re.compile("(?P<shorter>\d+\.?\d*)-(?P<taller>\d+\.?\d*)")
    r = h.search(size)
    if r:
        height = Decimal(r.group('taller')) * converter
        return depth, height, width

    # look for any single number
    # ex: '8 ft. tall'
    h = re.compile("(?P<height>\d+\.?\d*)")
    r = h.search(size)
    if r:
        height = Decimal(r.group('height')) * converter
        return depth, height, width


def parse_year(year):
    """
    Normalizes the year or years a work of art was created. Returns a tuple of
    year started, year finished.
    """
    if not year or year.startswith('nd'):
        return 1, 1

    if year.startswith('c.'):
        year = year[2:]

    try:
        year = int(year)
        return year, year
    except ValueError:
        # year currently looks like "1995-96"
        start, end = year.split("-")
        start = start.strip()
        end = end.strip()
        if len(start) != 4:
            return 0, 0
        else:
            if len(end) != 4:
                end = ''.join((start[:2], end))
            return int(start), int(end)