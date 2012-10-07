# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'MealType'
        db.create_table(u'meal_type', (
            ('id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
            ('meal_type_name', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('meal_type_date_created', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal('main', ['MealType'])

        # Adding model 'Meal'
        #db.create_table(u'meal', (
        #    ('id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
        #    ('meal_name', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
        #    ('meal_date', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        #    ('meal_date_created', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        #    ('fk_user_id', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
        #    ('fk_meal_type_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.MealType'])),
        #))
        #db.send_create_signal('main', ['Meal'])

        # Adding model 'MealElement'
        #db.create_table(u'meal_element', (
        #    ('id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
        #    ('meal_element_name', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
        #    ('fk_meal_element_type_id', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
        #    ('fk_user_id', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
        #    ('meal_element_date_created', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        #))
        #db.send_create_signal('main', ['MealElement'])

        # Adding model 'MealMealElement'
        #db.create_table(u'meal_meal_element', (
        #    ('id', self.gf('django.db.models.fields.IntegerField')(primary_key=True)),
        #    ('fk_meal_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Meal'])),
        #    ('fk_meal_element_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.MealElement'])),
        #))
        #db.send_create_signal('main', ['MealMealElement'])


    def backwards(self, orm):
        # Deleting model 'MealType'
        db.delete_table(u'meal_type')

        # Deleting model 'Meal'
        db.delete_table(u'meal')

        # Deleting model 'MealElement'
        db.delete_table(u'meal_element')

        # Deleting model 'MealMealElement'
        db.delete_table(u'meal_meal_element')


    models = {
        'main.meal': {
            'Meta': {'object_name': 'Meal', 'db_table': "u'meal'"},
            'fk_meal_type_id': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.MealType']"}),
            'fk_user_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'meal_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'meal_date_created': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'meal_elements': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'meal_elements'", 'to': "orm['main.MealElement']", 'through': "orm['main.MealMealElement']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'meal_name': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'})
        },
        'main.mealelement': {
            'Meta': {'object_name': 'MealElement', 'db_table': "u'meal_element'"},
            'fk_meal_element_type_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'fk_user_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'meal_element_date_created': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'meal_element_name': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'})
        },
        'main.mealmealelement': {
            'Meta': {'object_name': 'MealMealElement', 'db_table': "u'meal_meal_element'"},
            'fk_meal_element_id': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.MealElement']"}),
            'fk_meal_id': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Meal']"}),
            'id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'})
        },
        'main.mealtype': {
            'Meta': {'object_name': 'MealType', 'db_table': "u'meal_type'"},
            'id': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True'}),
            'meal_type_date_created': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'meal_type_name': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'})
        }
    }

    complete_apps = ['main']