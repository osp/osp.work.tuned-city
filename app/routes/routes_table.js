/*
 * routes_table
 */


var routes = {
    index:{url:'/', req:'./index'},
    media:{url:'/media/:id', req:'./media'},
};


exports.init = function(app){
    for(var k in routes)
    {
        var r = routes[k];
        var f = require(r.req)[k];
        app.get(r.url, f);
    }
};