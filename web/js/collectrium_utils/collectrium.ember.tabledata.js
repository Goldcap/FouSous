// JavaScript Document
//TODO:: Move to 1.0 and use this.get('propertyNames')
Collectrium.TableData = Ember.Namespace.create();

Collectrium.TableData.TableCollection = Collectrium.Collection.extend({
    
    headers: null,
    
    init: function() {
        this._super();
        
        this.set('headers',[]);
        //The headers are considered a "row"
        //But they are in their own collection
        //And there is only one item in that collection
        this.set('headers',Collectrium.Collection.create());
        this.get('headers').set('clearpost',true);
        this.get('headers').set('type',this.type);
    },
    
    clearHeaders: function() {
        this.set('headers',[]);
    },
    
    unfetch: function() {
        console.log("@tabledata.clearContent");
        this._super();
        this.get('headers').get('firstObject').set('table_checked',false);
    },
    
    paginate: function() {
        console.log("@tabledata.paginate");
        this._super();
        this.get('headers').get('firstObject').set('table_checked',false);
    },
    
    //We'll be adding Headers from the object
    //Every time we add items to a collection
    complete: function() {
        this._super();
        if (this.get('step') != 'success') return;
        if (this.get('headers.length') == 1) return;
        this.get('headers').pushObject(this.type.create({"table_header":true}));
    }.observes('step'),
    
});

Collectrium.TableData.Table = Ember.Object.extend({
    
    table_action: null,
    sort_action_asc: null,
    sort_action_desc: null,
    filter: null,
    pagination: null,
    headers: null,
    args: {},
    
    filter_action: function() {
        return this.get('filter');    
    }.property('filter'),
    
    canseek: false,
    rpp: 4,
    
    init: function() {
        this._super();
        
        this.set('headers',[]);
        this.set('sort_action_asc',[]);
        this.set('sort_action_desc',[]);
        this.set('args',{});
        
        //Use this object to index properties on our specific model
        this.set('proto',this.get('itemType').create());
        
    },
    
    readArgs: function( target ) {
        
        //console.log(this.get('filter_action'));
        if (this.get('filter_action') != null)
            this.get(target+'.params').set("filter_action",this.get('filter_action'));
        
        sort="";
        if (this.get('sort_action_asc').length > 0) {
            for (i=0;i<this.get('sort_action_asc').length;i++){
                //console.log(this.get('sort_action_asc')[i] + ' asc,');
                sort += this.get('sort_action_asc')[i] + '|asc,';
            }
        }
        if (this.get('sort_action_desc').length > 0) {
            for (i=0;i<this.get('sort_action_desc').length;i++){
                //console.log(this.get('sort_action_desc')[i] + ' desc,');
                sort += this.get('sort_action_desc')[i] + '|desc,';
            }
        }
        if (sort == "") {
            sort = null;
        } else {
            this.get(target+'.params').set("sort",sort);
        }
        //this.args.sort = this.get('sort');
        this.get(target+'.params').set("rpp",this.get('rpp'));
    }
    
    
});

Collectrium.TableData.TableData = Ember.Mixin.create(Collectrium.Serializable,{
    
    table_checked: false,
    table_header: false,
    table_status: 'notstatus',
    
    //Use this to get a full list of our visible cells
    //Set in the model we're drawing
    listedPropertyNames: function() {
       //console.log(this.get('invisibles'));
       var scope = this;
       var propertyNames = [];
       $.each(this.get('listed'),function(index,item){
            
            if (item.substring(0,5) == "item_") {
               label=item.substring(5,item.length);
            } else {
               label = item;
            }
            var name = label.substring(0,1).toUpperCase() + label.substring(1,label.length).toLowerCase();
            
            propertyNames.push({"name":name,"label":label});
        });
        return propertyNames;
    }.property(),
    
    getVisiblePropertyNames: function() {
       //console.log(this.get('invisibles'));
       var propertyNames = [];
       var invisibles = this.get('invisibles') || [];
       $.each(this.getPropertyNames(),function(index,item){
            //console.log(item);
            if ($.inArray(item,invisibles) == -1){ 
                propertyNames.push(item);
            }
        });
        return propertyNames;
    }
});

Collectrium.TableData.TableView = Ember.ContainerView.extend({
    
    childViews: ["filter","header","list","footer"],
    managerBinding: null,
    contentBinding: null,
    
    selector: null,
    action: null,
    target: null,
    classNames: ['row'],
    
    init: function() {
        
        this._super();  
         
    },
    
    donePage: function() {
        this.get('childViews')[2].forceHeight(this.get("content.clearstate"));
    }.observes('content.clearstate'),
    
    filter: Ember.View.extend({
        
        rpp_opts: [ 15, 30, 50 ],
        
        template: Ember.Handlebars.compile('<div class="one columns">{{view Ember.Select contentBinding="view.rpp_opts" valueBinding="view.parentView.content.pagination.rpp" selectionBinding="view.parentView.content.pagination.rpp"}}</div><div class="one columns"><button class="button secondary small" {{action doRpp}}>List</button></div><div class="four columns offset-by-five doright">{{view Ember.TextField valueBinding="view.parentView.manager.filter"}}</div><div class="one columns doright"><button class="button secondary small" {{action doFilter}}>Filter</button></div>'),
        classNames: ['twelve','columns','editable-filter'],
        
        init: function() {
            this._super();
            this.set('rpp',this.get('parentView.content.pagination.rpp'));
        },
        
        doRpp: function() {
            //console.log(this.get('rpp'));           
            this.set('parentView.content.pagination.page',1);
            this.get('parentView.content').refresh();
            //console.log(this.get('filter'));    
        },
        
        doFilter: function() {
            //console.log(this.get('parentView.manager.filter'));
            
            this.set('parentView.content.pagination.page',1);
            this.get('parentView.content.params').set('filter',this.get('parentView.manager.filter'));
            this.get('parentView.content').refresh();
              
        }
        
    }),
    
    header: Ember.CollectionView.extend({
        contentBinding: "parentView.content.headers",
        itemViewClass: "Collectrium.tableDataRow",
        tagName: "table",
        classNames: ['editable','editable-header']
    }),
    
    list: Ember.CollectionView.extend({
        contentBinding: "parentView.content",
        itemViewClass: "Collectrium.tableDataRow",
        tagName: "table",
        classNames: ['editable','editable-body'],
        
        forceHeight: function(aheight) {
            console.log(this.get('parentView.content.length'));
            if (this.get('parentView.content.length') > 0) {
                this.$().css('height',($('.editable-body td').height() * this.get('parentView.content.length')) + 'px');
                //this.$().css('overflow-y','none');
            }
        }
    }),
    
    footer: Collectrium.PaginatorView.extend({
        "collectionBinding":"parentView.content",
        classNames:['editable-pagination']
    })
    
});

Collectrium.tableDataRow = Ember.ContainerView.extend({
    
    tagName: "tr",
    action: null,
    classNameBindings: ['content.table_status'],
    
    didInsertElement: function() {
        
        var scope = this;
        $.each(this.get('parentView.parentView.manager.proto.listedPropertyNames'),function(index,item){
            if ((scope.get('content.views')) && (scope.get('content.views')[index]) && (scope.get('content.views')[index] != null)) {
                var td = Ember.get(scope.get('content.views')[index]).create({content: scope.get('content').get(item["label"]),"index":index,"name":item["name"],"label":item["label"]});
            } else {
                var td = Collectrium.TableDataCell.create({"index":index,"name":item["name"],"label":item["label"],content:scope.get('content.'+item["label"])});
            }
            scope.get('childViews').pushObject(td);
        });
       
    }
    
});

Collectrium.TableDataCellBase = Ember.View.extend({
    attributeBindings: ["style"],
    
    style: function(){
        if ((this.get('parentView.content.widths')) && (this.get('parentView.content.widths')[this.get('index')] != null))
            return "width:" + this.get('parentView.content.widths')[this.get('index')];
    }.property(),
});

Collectrium.TableDataCell = Collectrium.TableDataCellBase.extend({
    
    tagName: 'td',
    name: null,
    value: null,
    checked: null,
    classNameBindings: ['name'],
    
    sorting: 'both',
    editing: 'notediting',      
    viewing: 'viewing',
    attrs: {},
    nullVal: "No Data",
    
    index: 0,
    
    name_header: function() {
        if ((this.get('parentView.content.names')) && (this.get('parentView.content.names')[this.get('index')] != null))
            return this.get('parentView.content.names')[this.get('index')];
        return this.get('name').replace('_',' ');    
    }.property('name'),
    
    
    //HREF's are pipe-delimited strings, with content|href format
    href: function() {
        //console.log(this.get('content').toString());
        if ((this.get('content') != null) && (this.get('content') != "undefined")) {
            return this.get('content').toString().split("|")[0];
            //return '<a href="'+attrs[1]+'">'+ attrs[0] + '</a>';
        } else {
            return "No Data";
        }
    }.property('content'),
    
    hrefClick: function() {
        if ((this.get('content') != null) && (this.get('content') != "undefined")) {
            window.open(this.get('content').toString().split("|")[1]);
        } else {
            return "No Data";
        }
    },
    
    as: function() {
        if ((this.get('parentView.content.types')) && (this.get('parentView.content.types')[this.get('index')] != null))
            return this.get('parentView.content.types')[this.get('index')];
        return 'text';
    }.property(),
    
    sortable: function() {
        if ((this.get('parentView.content.sorts')) && (this.get('parentView.content.sorts')[this.get('index')] != null))
            return this.get('sorting');
    }.property('sorting'),
        
    doBlur: function() {
        this.set('editing','notediting');
        this.set('viewing','viewing');
    },
    
    doClick: function() {
        if (this.get('editing') =='notediting') {
            this.set('editing','editing');
            this.set('viewing','notviewing');
        } else {
            this.set('editing','notediting');
            this.set('viewing','viewing');
        }
    },
    
    facetedClick: function() {
        //console.log(this.get('content') + " " + this.get('label'));
        this.get('parentView.content').set(this.get('label'),this.get('content'));
        this.get('parentView.parentView.parentView.manager.form').set('facet',this.get('label'));
        this.get('parentView.parentView.parentView.manager.form').set('item',this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action','facet');
        return;
        //console.log("FACET");
    },
    
    editClick: function() {
        this.get('parentView.parentView.parentView.manager.form').set('item',this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action','edit');
        return true;
    },
    
    deleteClick: function() {
        this.get('parentView.parentView.parentView.manager.form').set('item',this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action','delete');
        return true;
    },
    
    selectAllClick: function() {
        if (this.get('parentView.content.table_checked')) {
            this.get('parentView.content').set('table_checked',false);
            //this.get('parentView.parentView.parentView.headers').setEach('table_checked',false);
            this.get('parentView.parentView.parentView.content').setEach('table_checked',false);
        } else {
            this.get('parentView.content').set('table_checked',true); 
            //this.get('parentView.parentView.parentView.headers').setEach('table_checked',true);
            this.get('parentView.parentView.parentView.content').setEach('table_checked',true);
        }
        this.hardUpdateCount();
        return true;
    },
    
    checkClick: function() {
        if (this.get('parentView.content.table_checked')) {
            this.get('parentView.content').set('table_checked',false);
            this.get('parentView.parentView.parentView.content').set('table_checked',false);
        } else {
            this.get('parentView.content').set('table_checked',true);
            this.get('parentView.parentView.parentView.content').set('table_checked',true);
        }
        this.hardUpdateCount();
        return true;
    },
    
    //Never did get this binding working...
    //Too busy to figure out why:
    hardUpdateCount: function() {
        var len = this.get('parentView.parentView.parentView.content.content').filterProperty('table_checked',true).get('length');
        this.get('parentView.parentView.parentView.content').set('selected',len);
    },
         
    headerClick: function() {
        if (this.get('sorting') == 'none') return;
        if (this.get('sorting') == 'both') {
            this.get('parentView.childViews').setEach('sorting','both');
            this.set('sorting','asc');
            this.set('parentView.parentView.parentView.manager.sort_action_desc',[]);
            this.get('parentView.parentView.parentView.manager.sort_action_asc').pushObject(this.get('value'));
        } else if (this.get('sorting') == 'asc') {
            this.get('parentView.childViews').setEach('sorting','both');
            this.set('sorting','desc');
            this.set('parentView.parentView.parentView.manager.sort_action_asc',[]);
            this.get('parentView.parentView.parentView.manager.sort_action_desc').pushObject(this.get('value'));
        } else {
            this.get('parentView.childViews').setEach('sorting','both');
            this.set('parentView.parentView.parentView.manager.sort_action_desc',[]);
            this.set('parentView.parentView.parentView.manager.sort_action_asc',[]);
            this.set('sorting','both'); 
        }
        this.set('parentView.parentView.parentView.manager.canseek',true);
        return true;
    },
    
    template: function() {
        if (this.get('parentView.content.table_header')) {
            if (this.get('as') == 'checkbox') {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner"><input type="checkbox" {{action selectAllClick}} {{bindAttr checked="view.parentView.content.table_checked"}} /></div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span {{ bindAttr class="view.sortable" }} {{ action headerClick }}>{{view.name_header}}</span></div></div>');
            }
        } else if (this.get('as') == 'html') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner">{{{view.content}}}</div></div>');
        } else if (this.get('as') == 'href') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><a {{ action hrefClick }}>{{{ view.href }}}</a></div></div>');
        } else if (this.get('as') == 'boolean') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">True</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">False</div></div>');
            }
        } else if (this.get('as') == 'yesno') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">Yes</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">No</div></div>');
            }
        } else if (this.get('as') == 'pending') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">Approved</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">Pending</div></div>');
            }
        } else if (this.get('as') == 'checkbox') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><input type="checkbox" {{action checkClick}} {{bindAttr value="view.parentView.content"}} {{bindAttr checked="view.parentView.content.table_checked"}} /></div></div>');
        } else if (this.get('as') == 'edit') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><img src="/_resources/images/Neu/12x12/actions/document.png" {{ action editClick }} /></div></div>');
        } else if (this.get('as') == 'delete') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><img src="/_resources/images/Neu/12x12/actions/dialog-cancel.png" {{ action deleteClick }} /></div></div>');
        } else if (this.get('as') == 'editable') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span {{ bindAttr class="view.viewing" }} {{ action doClick }} >{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}</span><span {{ bindAttr class="view.editing" }} >{{view Collectrium.EditableTextField valueBinding="view.content" parentBinding="view"  }}</span></div></div>');
        } else if (this.get('as') == 'text') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span>{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}</span></div></div>');
        } else {
            console.log("untyped columns aren't allowed");
        }
    }.property()
});
