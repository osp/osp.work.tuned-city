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
//             model:window.tc[elt],
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
                $el.empty();
                var data = this.model.toJSON(true);
                
                console.log('RENDER: '+elt);
                console.log(data);
                template.render(elt, this, function(t){
                    $el.html(t(data));
                    var pat = '.'+elt+'Items';
//                     var items = $el.find(pat);
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
            initialize: function() {
                this.collected = window.tc[elementCollection];
                this.collected.on('reset', this.render, this);
                this.collected.on('add', this.render_one, this);
                
                this.rendered_items = {};
            },
            render_one: function(item){
                var $el = this.$el;
                var _v = window.tc[elementView];
                if(this.rendered_items[item.cid])
                {
//                     this.rendered_items[item.cid].render();
                }
                else
                {
                    var itemView = new _v({model:item});
                    $el.append(itemView.el);
                    this.rendered_items[item.cid] = itemView;
                }
                return this;
            },
            render: function() {
                var $el = this.$el;
                $el.empty();
                template.render(elementCollection, this, function(t){
                    $el.html(t({}));
                    var self = this;
                    this.collected.each(function( item ) {
                        self.render_one(item);
                    });
                });
                
                return this;
            },
        });
    });
    
    
    
    
})();