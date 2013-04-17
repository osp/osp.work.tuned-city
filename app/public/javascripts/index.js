/*
 * index.js
 */


$(document).ready(function(){
    $.getJSON('/config/root_way',function(config){
        var pid = config.root_way;
        tc.app.setPath(pid);
    });
});