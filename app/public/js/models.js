/*
 * tc.models.js
 * 
 */



window.tc = window.tc || {};


(function(undefined){
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        window.tc[elt] = Backbone.Model.extend({
            idAttribute: '_id'
        });
    });
})();