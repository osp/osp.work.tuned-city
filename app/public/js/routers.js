/*
 * 
 * routers.js
 * 
 */


(function(undefined){
    'strict';
    var tc = window.tc;
    var Backbone = window.Backbone;

    
    var router = Backbone.Router.extend({
        navigate:function(route, options){
            options = _.extend({trigger: true}, options);
            Backbone.Router.prototype.navigate.apply(this, [route, options]);
        },
        
        routes:{
            '': 'index',
            'index': 'index',
            'path/:id' :'path',
            'bookmark/play/:id' :'bookmarkPlay',
        },
        
        index:function(){
            window.app.setComponents('shelf paths player'.split(' '));
        },
        path:function(id){
            
        },
        bookmarkPlay:function(id){
            window.app.setComponents('shelf paths player'.split(' '));
            var bm = tc.BookmarkCollection.get(id);
            if(!bm)
            {
                tc.BookmarkCollection.add({_id:id});
                bm = tc.BookmarkCollection.get(id);
            }
            bm.on('change', function(){
                bm.makePath(function(p){
                    window.app.setPath(p);
                });
            });
            if(bm.has('cursor'))
            {
                bm.makePath(function(p){
                    window.app.setPath(p);
                });
            }
            bm.fetch();
        },
    });
    
    tc.Router = router;
})();