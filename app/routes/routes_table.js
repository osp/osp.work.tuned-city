/*
 * routes_table
 */


var routes = {
    index:{url:'/', req:'./index', verb:'get'},
    media:{url:'/media/:id', req:'./media', verb:'get'},
    poster:{url:'/poster/:id/:timestamp', req:'./media', verb:'get'},
    way:{url:'/way/:id', req:'./way', verb:'get'},
    config:{url:'/config/:key', req:'./config', verb:'get'},
    shelf:{url:'/shelf/:action/:title?', req:'./shelf', verb:'all'},
};

exports.init = function(app){
    for(var k in routes)
    {
        var r = routes[k];
        var f = require(r.req)[k];
        app[r.verb](r.url, f);
    }
};
