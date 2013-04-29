/*
 * routes_table
 */

var extend = require('underscore').extend;


var api = {
    // GET
    get:{url:'/api/:type/:id?', req:'./api', verb:'get'},
    
    // POST
    post:{url:'/api/:type', req:'./api', verb:'post'},
    
    // PATCH
    put:{url:'/api/:type/:id', req:'./api', verb:'put'},
    
};

var web = {
    index:{url:'/', req:'./index', verb:'get'},
    poster:{url:'/poster/:id/:timestamp?', req:'./media', verb:'get'},
    spectrogram:{url:'/spectrogram/:id/', req:'./media', verb:'get'},
    config:{url:'/config/:key', req:'./config', verb:'get'},
    cross:{url:'/cross/:ca/:cb', req:'./cross', verb:'get'},
};

var routes = extend(web,api);

exports.init = function(app){
    for(var k in routes)
    {
        var r = routes[k];
        var f = require(r.req)[k];
        app[r.verb](r.url, f);
    }
};
