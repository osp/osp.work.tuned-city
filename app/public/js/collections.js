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
                this.add({_id:id});
                var m = this.get(id);
                m.fetch({
                    success:function(){
                        m.populate();
                    },
                });
                return m;
            }
        });
        
        window.tc[elt+'Collection'] = new cm();
//         window.tc[elt+'Collection'].fetch();
    });
})();