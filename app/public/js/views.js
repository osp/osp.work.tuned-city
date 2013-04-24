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
            initialize: function() {
            },
            render: function() {
                var data = this.model.toJSON();
                template.render(elt, this.$el, function(t){
                    this.html(t(data));
                });
                return this;
            },
        });
    });
    
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        var elementCollection = elt + 'Collection';
        var collectionView = elt + 'CollectionView' ;
        
        window.tc[collectionView] = Backbone.View.extend({
            initialize: function() {
                this.collection = new window.tc[elementCollection]();
                this.listenTo(this.collection, 'reset', this.render);
            },
            render: function() {
                this.$el.empty();
                this.collection.each(function( item ) {
                    var _v = window.tc[elementView];
                    var itemView = new _v({model:item});
                    itemView.render();
                    this.$el.append(itemView.el);
                }, this );
                return this;
            },
        });
    });
})();