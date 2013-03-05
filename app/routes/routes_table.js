/*
 * routes_table
 */


var routes = {
    index:{url:'/', req:'./index'},
    media:{url:'/media/:id', req:'./media'},
    poster:{url:'/poster/:id/:timestamp', req:'./media'},
    way:{url:'/way/:id', req:'./way'},
};


exports.init = function(app){
    for(var k in routes)
    {
        var r = routes[k];
        var f = require(r.req)[k];
        app.get(r.url, f);
    }
};
