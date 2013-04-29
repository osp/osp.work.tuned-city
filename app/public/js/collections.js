/*
 * tc.collections.js
 * 
 */



window.tc = window.tc || {};

(function(undefined){
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        var cm = Backbone.Collection.extend({
            url:'/api/'+elt+'/',
            model:window.tc[elt],
            get_item:function(id){
                var ret = this.get(id);
                if(ret)
                    return ret;
                var m = new this.model( { url:this.url + id });
                m.fetch();
                this.add(m);
                return m;
            }
        });
        
        window.tc[elt+'Collection'] = new cm();
        window.tc[elt+'Collection'].fetch();
    });
})();