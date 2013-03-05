/*
 * way.js
 */

var _models_ = require('../models');
var _utils_ = require('../lib/utils');

var Media = _models_.Media;
var Path = _models_.Path;
var rmft = _utils_.resolve_medias_from_trackpoints;

exports.way = function(req,res){
    Path.find({'_id':req.params.id}, function media_find(err, path){
        if(err) { res.send('500', err); }
        else
        {
            if(path.length <= 0){res.send('404', 'Could not find path ['+req.params.id+'] on this server');}
            else
            {
                var trackpoints_base = path[0].trackpoints.toObject();
                rmft(trackpoints_base, function(err, trackpoints){
                    if(err) { res.send('500', err); }
                    else
                    {
                        res.send(trackpoints);
                    }
                });
            }
        }
    });
};