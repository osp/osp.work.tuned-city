/*
 * 
 * tc.app.js
 * 
 */


window.tc = window.tc || {};

(function(undefined){
    window.tc.App = function(){
        this.shelves = new tc.ShelfCollectionView();
    };
    window.tc.App.prototype.start = function(){
        this.shelves.collected.fetch({reset:true});
        $('body').append(this.shelves.el);
    };
})();


$(document).ready(function(){
    window.app = new tc.App();
    window.app.start();
});