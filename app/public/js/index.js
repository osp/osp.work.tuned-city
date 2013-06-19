/*
 * index.js
 */

$(document).ready(function(){
    'strict';
    
    window.app = new tc.App;
    
    app.on('ready', function(){
        window.router = new tc.Router;
        window.Backbone.history.start({pushState: false});
    });
    
    $('body').on('click', '.route', function(evt){
        var that = $(this);
        that.addClass('visited');
        window.router.navigate(that.attr('data-route'));
    });
    
    app.start();
});
