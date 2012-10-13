from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()
from main import urls as main_urls
#from registration import urls as registration_urls

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'main.views.main', name='main'),
    url(r'^services/api/v1/meal_element/add/$', 'services.views.add_meal_element', name='add_meal_element'),
    url(r'^services/api/v1/meal_element/delete/$', 'services.views.delete_meal_element', name='delete_meal_element'),
    url(r'^services/api/v1/meal_element/list/$', 'services.views.list_meal_element', name='list_meal_element'),
    url(r'^services/api/v1/meal/add/$', 'services.views.add_meal', name='add_meal'),
    url(r'^services/api/v1/meal/rate/$', 'services.views.rate_meal', name='rate_meal'),
    url(r'^services/api/v1/meal_types/list/$', 'services.views.list_meal_types', name='list_meal_types'),
    url(r'^services/api/v1/login/$','services.views.login', name='login'),
    url(r'^services/api/v1/signup/$','services.views.signup', name='signup'),
    url(r'^services/api/v1/logout/$','services.views.logout', name='logout'),
    (r'^accounts/', include('registration.backends.default.urls')),
    # url(r'^public/', include('public.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

#urlpatterns += registration_urls.urlpatterns