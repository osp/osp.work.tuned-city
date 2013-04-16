/*
 * routes.api
 */

var models = require('../models');
var _utils_ = require('../lib/utils');
var settings = require('../settings').settings;
var fs = require('fs');

exports.get = function(req, res){
    var type = req.params.type;
    var model = models[type];
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
            {
                if(req.params.id)
                    res.send(m[0]);
                else
                    res.send(m);
            }
            else
                res.send('404', 'Could not find *it* on this server');
        }
    });
};


exports.post = function(req, res){
    var type = req.params.type;
    
    var posters = {
        Media:function(req, res){
//             console.log(settings.public);
            var media = req.files.media;
            var media_dir = settings.public.media_dir;
            var media_url = settings.public.media_url;
            fs.readFile(media.path, function (err, data){
                if(err){res.send(err)}
                else
                {
                    var newPath =  media_dir + media.name ;
                    fs.writeFile(newPath, data, function (err){
                        if(err){res.send(err)}
                        else
                        {
                        var obj = {
                            url:  media_url + media.name,
                            type:media.type.split('/').pop()
                        };
                        var mm = new models.Media(obj);
                        mm.save();
                        res.send(mm);
                        }
                    });
                }
            });
        },
        _generic:function(type,req,res){
            var entity = req.body;
            var obj = new models[type](entity);
            obj.save();
            res.send(obj);
        },
    };
    
    if(posters[type] !== undefined)
    {
        posters[type](req, res);
    }
    else
    {
        posters._generic(type, req, res);
    }
};


exports.patch = function(req, res){
    res.send({status:'error', msg:'PATCH not implemented yet'});
};