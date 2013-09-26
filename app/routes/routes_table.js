/*
 * routes_table
 */

var extend = require('underscore').extend;
var wrap = require('underscore').wrap;
var settings = require('../settings').settings;


var api = {
    // GET
    get:{url:'/api/:type/:id?', req:'./api', verb:'get'},
    
    // POST
    post:{url:'/api/:type', req:'./api', verb:'post'},
    
    // PATCH
    put:{url:'/api/:type/:id', req:'./api', verb:'put'},
    
    // DELETE
    destroy:{url:'/api/:type/:id', req:'./api', verb:'delete'},
    
};

var admin = {
    index:{url:'/', req:'./index', verb:'get'},
    jquerydynamicimg:{url:'/jquerydynamicimg.html', req:'./jquerydynamicimg', verb:'get'},
    poster:{url:'/poster/:id/:timestamp?', req:'./media', verb:'get'},
    spectrogram:{url:'/spectrogram/:id/', req:'./media', verb:'get'},
    config:{url:'/config/:key', req:'./config', verb:'get'},
    cross:{url:'/cross/:ca/:cb', req:'./cross', verb:'get'},
};

var admin_routes = extend(admin,api);

var www_routes = {
    path:{url:'/:path?', req:'./path', verb:'get'},
};

var routes = { };
routes[settings.vhosts.admin] = admin_routes;
routes[settings.vhosts.www] = www_routes;


exports.init = function(apps){
    for(var host in apps)
    {
        var app = apps[host];
        for(var k in routes[host])
        {
            var r = routes[host][k];
            var f = require(r.req)[k];
            app[r.verb](r.url, f);
        }
    }
};
