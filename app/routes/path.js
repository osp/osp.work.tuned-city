
/*
 * GET media.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;
var Connection = require('../models').Connection;
var Connection = require('../models').Cursor;
var _ = require('underscore');

exports.path = function(req, res){
    
    
    var forwardTrackoints = function(trackpoints, response, ret){
        Connection.find({'_id':{$in:trackpoints}}, function(err, connections){
            if(err){response.status(500).send(err)}
            else{
                ret.trackpoints = [];
                var cursors = [];
                for(var c in connections){
                    var connection = connections[c].toObject();
                    cursors.push(connection.start);
                    cursors.push(connection.end);
                    ret.trackpoints.push(connection);
                }
                Cursor.find({'_id':{$in:cursors}},function(err, cursors){
                    if(err){response.status(500).send(err)}
                    else{
                        var medias = [];
                        _.reduce(cursors, function(memo, value, index, list){
                            for(t in memo)
                            {
                                var cursor = value.toObject();
                                if(memo[t].start === cursor._id)
                                    memo[t].start = cursor;
                                if(memo[t].end === cursor._id)
                                     memo[t].end = cursor;
                                if(!(cursor.media in medias))
                                    medias.push(cursor.media);
                                return memo;
                            }
                        }, ret.trackpoints);
                        Media.find({'_id':{$in:medias}},function(err, medias){
                            _.reduce(medias, function(memo, value){
                                for(t in memo)
                                {
                                    var media = value.toObject();
                                    if(memo[t].start.media === media._id)
                                        memo[t].start.media = media;
                                    if(memo[t].end.media === media._id)
                                        memo[t].end.media = media;
                                }
                                return memo;
                            }, ret.trackpoints);
                        });
                    }
                });
            }
        });
    };
    

    if ('path' in req.params && req.params['path'] != undefined) {
        // A path id was specified, so we search for it in order to pass it the template

        Path 
        .findById(req.params['path'])
        .exec(function (err, path) {
            if (err) res.status(500).send(err);
            else{
                forwardTrackoints(_.clone(path.trackpoints), res, path );
                res.render('path_detail', {path: path});
            }

        });
    } else {
        //  No path id was specified, so we pass all the paths to the template context.
        Path.find({}, function(err, ps) {
            if (err) {
                console.log('Error: ' + err);
            }
            else {
                console.log(ps);
                res.render('path_list', {path_list: ps});
            };
        });
    };
};
