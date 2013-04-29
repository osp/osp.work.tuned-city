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
    render: function(name, el, cb){
        if(this.cache[name] === undefined)
        {
            var that = this;
            $.get(that.base_url+name+'.html', function(html){
                that.cache[name] = _.template(html);
                cb.apply(el, [that.cache[name]]);
            });
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
            model:window.tc[elt],
            initialize: function() {
                
            },
            populate:function($el)
            {
                if(this.collects !== undefined)
                {
                    for(var k in this.collects)
                    {
                        var _mn = this.collects[k];
                        var _c = window.tc[_mn + 'Collection'];
                        var _v = window.tc[_mn + 'View'];
                        var item_ids = this.model.get(k);
                        var items = [];
                        this[k] = items;
                        
                        for(var i=0; i < item_ids.length; i++)
                        {
                            var id = item_ids[i];
                            var model = _c.get_item(id);
                            var view = new _v({model:model});
                            $el.append(view.el);
                            view.render();
                            items.push(view);
                        };
                    }
                }
            },
            render: function() {
                var $el = this.$el;
                $el.empty();
                var data = this.model.toJSON();
                
                template.render(elt, this, function(t){
                    $el.html(t(data));
                    var pat = '.'+elt+'Items';
                    var items = $el.find(pat);
                    console.log('find("'+pat+'") => '+items.length);
                    if(items.length > 0)
                    {
                        this.populate(items);
                    }
                });
                
                return this;
            },
        });
    });
    
    window.tc.ShelfView.prototype.collects = { 'bookmarks': 'Bookmark' };
    
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        var elementCollection = elt + 'Collection';
        var collectedView = elt + 'CollectionView' ;
        
        window.tc[collectedView] = Backbone.View.extend({
            initialize: function() {
                this.collected = window.tc[elementCollection];
                this.listenTo(this.collected, 'reset', this.render);
            },
            render: function() {
                var $el = this.$el;
                $el.empty();
                
                template.render(elementCollection, this, function(t){
                    $el.html(t({}));
                    this.collected.each(function( item ) {
                        var _v = window.tc[elementView];
                        var itemView = new _v({model:item});
                        itemView.render();
                        $el.append(itemView.el);
                    });
                    
                });
                
                return this;
            },
        });
    });
    
    
    
    
})();