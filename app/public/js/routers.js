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
            'bookmark/:id' :'bookmark',
        },
        
        index:function(){
            window.app.setComponents('shelf paths player'.split(' '));
        },
        path:function(id){
            
        },
        bookmark:function(id){
            
        },
    });
    
    tc.Router = router;
})();