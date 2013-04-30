/*
 * 
 * tc.views.js
 * 
 */

// Util.Template
window.template = {} || window.template;
window.template = _.extend(window.template,{
    base_url: '/js/templates/',
    cache: {},
    waiting: {},
    loading:{},
    render: function(name, el, cb){
        var that = this;
        if(this.cache[name] === undefined)
        {
            if(this.waiting[name] === undefined)
            {
                this.waiting[name] = [];
            }
            this.waiting[name].push({element:el, callback:cb});
            if(this.loading[name] === undefined)
            {
                this.loading[name] = true;
                $.get(that.base_url+name+'.html', function(html){
                    that.cache[name] = _.template(html);
                    for(var k = 0; k < that.waiting[name].length; k++)
                    {
                        var w = that.waiting[name][k];
                        w.callback.apply(w.element, [that.cache[name]]);
                    }
                });
            }
        }
        else
        {
            cb.apply(el, [that.cache[name]]);
        }
    }
});

window.tc = window.tc || {};

(function(undefined){
    'strict'
    
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        
        window.tc[elementView] = Backbone.View.extend({
            className:elt,
            initialize: function() {
                this.model.on('add', this.render, this);
                this.model.on('change', this.render, this);
                if(!this.model.isNew())
                {
                    this.render();
                }
            },
            render: function() {
                var $el = this.$el;
                $el.attr('id', elt+ '_' +this.model.id)
                $el.empty();
                var data = this.model.toJSON(true);
                
                template.render(elt, this, function(t){
                    $el.html(t(data));
//                     var pat = '.'+elt.toLowerCase()+'-items';
                });
                
                return this;
            },
        });
    });
    
    
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        var elementCollection = elt + 'Collection';
        var collectedView = elt + 'CollectionView' ;
        
        window.tc[collectedView] = Backbone.View.extend({
            className:elementCollection,
            initialize: function() {
                this.collected = window.tc[elementCollection];
                this.collected.on('reset', this.render, this);
                this.collected.on('add', this.render_one, this);
                
                this.rendered_items = {};
            },
            render_one: function(item){
                var $el = this.$el;
                var _v = window.tc[elementView];
                if(this.rendered_items[item.cid] === undefined)
                {
                    var itemView = new _v({model:item});
                    $el.append(itemView.render().el);
                    this.rendered_items[item.cid] = itemView;
                }
                return this;
            },
            render: function() {
                var $el = this.$el;
                $el.empty();
                var self = this;
                template.render(elementCollection, this, function(t){
                    $el.html(t({}));
                    this.collected.each(function( item ) {
                        self.render_one(item);
                    });
                });
                
                return this;
            },
        });
    });
    
    
    
    
})();