/*
 * routes.api
 *
 */

var models = require('../models');
var _utils_ = require('../lib/utils');
var settings = require('../settings').settings;
var fs = require('fs');
var _ = require('underscore');
var slugify = require('slug');

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
                    var fname = slugify(media.name);
                    var newPath =  media_dir + fname ;
                    fs.writeFile(newPath, data, function (err){
                        if(err){res.send(err)}
                        else
                        {
                            var t = media.type.split('/');
                            var mtype = t.pop();
                            var type = t.pop();
                            if(mtype === 'webm')
                            {
                                if(type === 'video')
                                    mtype = 'webmv';
                                else
                                    mtype = 'webma';
                            }
                            if(mtype === 'ogg')
                            {
                                if(type === 'video')
                                    mtype = 'ogv';
                                else
                                    mtype = 'oga';
                            }
                            var obj = {
                                url:  media_url + fname,
                                type: mtype,
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


exports.put = function(req, res){
    var type = req.params.type;
    
    var patchers = {
        _generic:function(type, req, res){
            var entity = req.body;
            models[type].update({_id: req.params.id},
                                entity, 
                                { upsert: true }, 
                                function(err, numberAffected, raw){
                                    if(err) { res.send('500', _.extend(err,{entity:entity})); }
                                    else
                                    {
                                        res.send(raw);
                                    }
                                });
        },
    };
    
    if(patchers[type] !== undefined)
    {
        patchers[type](req, res);
    }
    else
    {
        patchers._generic(type, req, res);
    }
};