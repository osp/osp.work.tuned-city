
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');
  
var settings = require('./settings').settings;
var rt_init = require('./routes/routes_table').init;

var admin_app = express();
admin_app.configure(function(){
  admin_app.set('views', __dirname + '/views');
  admin_app.set('view engine', 'ejs');
  admin_app.use(express.favicon());
  admin_app.use(express.logger('dev'));
  admin_app.use(express.bodyParser());
  admin_app.use(express.methodOverride());
  admin_app.use(express.cookieParser('your secret here'));
  admin_app.use(express.session());
  admin_app.use(admin_app.router);
  admin_app.use(require('less-middleware')({ src: __dirname + '/public' }));
  admin_app.use(express.static(path.join(__dirname, 'public')));
});

admin_app.configure('development', function(){
  admin_app.use(express.errorHandler());
});


var www_app = express();
www_app.configure(function(){
  www_app.set('views', __dirname + '/views');
  www_app.set('view engine', 'ejs');
  www_app.use(express.favicon());
  www_app.use(express.logger('dev'));
  www_app.use(express.bodyParser());
  www_app.use(express.methodOverride());
  www_app.use(express.cookieParser('your secret here'));
  www_app.use(express.session());
  www_app.use(www_app.router);
  www_app.use(require('less-middleware')({ src: __dirname + '/public' }));
  www_app.use(express.static(path.join(__dirname, 'public')));
});

var apps = { };
apps[settings.vhosts.admin] = admin_app;
apps[settings.vhosts.www] = www_app;
rt_init(apps);


var app = express();
for(var host in apps)
{
    app.use(express.vhost(host, apps[host]));
}

var PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, function(){
  console.log("Express server listening on port " + PORT);
});
