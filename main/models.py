# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.

from django.db import models

class MealType(models.Model):
    id = models.IntegerField(primary_key=True)
    meal_type_name = models.CharField(max_length=765, blank=True)
    meal_type_date_created = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = u'meal_type'
        
class Meal(models.Model):
    id = models.IntegerField(primary_key=True)
    meal_name = models.CharField(max_length=765, blank=True)
    meal_date = models.DateTimeField(null=True, blank=True)
    meal_date_created = models.DateTimeField(null=True, blank=True)
    fk_user_id = models.IntegerField(null=True, blank=True)
    fk_meal_type_id = models.ForeignKey(MealType)
    meal_elements = models.ManyToManyField('MealElement', null=True, blank=True, related_name = 'meal_elements', through="MealMealElement")
    class Meta:
        db_table = u'meal'

class MealElement(models.Model):
    id = models.IntegerField(primary_key=True)
    meal_element_name = models.CharField(max_length=765, blank=True)
    fk_meal_element_type_id = models.IntegerField(null=True, blank=True)
    fk_user_id = models.IntegerField(null=True, blank=True)
    meal_element_date_created = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = u'meal_element'

class MealMealElement(models.Model):
    id = models.IntegerField(primary_key=True)
    fk_meal_id = models.ForeignKey(Meal)
    fk_meal_element_id = models.ForeignKey(MealElement)
    class Meta:
        db_table = u'meal_meal_element'
