/*
 * tc.collections.js
 * 
 */



window.tc = window.tc || {};

(function(undefined){
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        window.tc[elt+'Collection'] = Backbone.Collection.extend({
            url:'/api/'+elt+'/',
            model:window.tc[elt],
        });
    });
})();