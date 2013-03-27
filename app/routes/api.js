/*
 * routes.api
 */

var _models_ = require('../models');
var _utils_ = require('../lib/utils');

exports.get = function(req, res){
    var type = req.params.type;
    var model = _models_[type];
    var cond = {};
    if(req.params.id)
    {
        cond._id = req.params.id;
    }
    model.find(cond, function media_find(err, m){
        if(err) { res.send('500', err); }
        else
        {
            if(m.length > 0)
                res.send(m);
            else
                res.send('404', 'Could not find *it* on this server');
        }
    });
};


exports.post = function(req, res){};


exports.patch = function(req, res){};