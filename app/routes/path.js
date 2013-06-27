
/*
 * GET media.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;
var Connection = require('../models').Connection;
var Cursor = require('../models').Cursor;
var _ = require('underscore');

exports.path = function(req, res){
    
    
    var forwardTrackoints = function(trackpoints, response, ret){
        Connection.find({'_id':{$in:trackpoints}}, function(err, connections){
            if(err){
                // console.warn(err);
            }
            else{
                ret.trackpoints = [];
                var cursors = [];
                for(var c in connections){
                    var connection = connections[c].toObject();
                    
                    // console.log('connection', connection);
                    cursors.push(connection.start);
                    cursors.push(connection.end);
                    
                    ret.trackpoints.push(connection);
                }
                // console.log('ret.trackpoints', ret.trackpoints);
                Cursor.find({'_id':{$in:cursors}}, function(err, cursors){
                    if(err){
                        // console.warn(err);
                    }
                    else{
                        var ms = [];
                        _.reduce(cursors, function(memo, value, index, list){
                            for(var t in memo)
                            {
                                // console.log('memo', t, memo[t]);
                                var cursor = value.toObject();
                                if(memo[t].start === cursor._id)
                                    memo[t].start = cursor;
                                if(memo[t].end === cursor._id)
                                     memo[t].end = cursor;
                                if(!(cursor.media in ms))
                                    ms.push(cursor.media);
                                return memo;
                            }
                        }, ret.trackpoints);
                        Media.find({'_id':{$in:ms}},function(err, medias){
                            if(err){
                                // console.warn(err);
                            }
                            else
                            {
                                _.reduce(medias, function(memo, value){
                                    for(var t in memo)
                                    {
                                        // console.log('media',value);
                                        // console.log('memo', t, memo[t]);
                                        var media = value.toObject();
                                        if(memo[t].start.media === media._id)
                                            memo[t].start.media = media;
                                        if(memo[t].end.media === media._id)
                                            memo[t].end.media = media;
                                    }
                                    return memo;
                                }, ret.trackpoints);
                            }
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
                var p = path.toObject();
                forwardTrackoints(_.clone(path.trackpoints), res, p );
                res.render('path_detail', {path: p});
            }

        });
    } else {
        //  No path id was specified, so we pass all the paths to the template context.
        Path.find({}, function(err, ps) {
            if (err) {
                // console.log('Error: ' + err);
            }
            else {
                // console.log(ps);
                res.render('path_list', {path_list: ps});
            };
        });
    };
};
