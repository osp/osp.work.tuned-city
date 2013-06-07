/*
 * index.js
 */

$(document).ready(function(){
    'strict';
    
    window.app = new tc.App;
    window.router = new tc.Router;
    app.start();
    
    window.Backbone.history.start({pushState: false});
    
    $('body').on('click', '.route', function(evt){
        var that = $(this);
        that.addClass('visited');
        window.router.navigate(that.attr('data-route'));
    });
    
});
