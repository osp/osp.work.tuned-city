
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
                    
                    cursors.push(connection.start);
                    cursors.push(connection.end);
                    
                    ret.trackpoints.push(connection);
                }
                Cursor.find({'_id':{$in:cursors}}, function(err, cursors){
                    if(err){
                        // console.warn(err);
                    }
                    else{
                        var ms = [];
                        _.reduce(cursors, function(memo, value, index, list){
                            var cursor = value.toObject();
                            for(var t in memo)
                            {
                                if( !memo[t].start._id
                                    && memo[t].start.toString() === cursor._id.toString())
                                {
                                    memo[t].start = cursor;
                                }
                                if( !memo[t].end._id
                                    && memo[t].end.toString() === cursor._id.toString())
                                {
                                     memo[t].end = cursor;
                                }
                                if(!(cursor.media in ms))
                                    ms.push(cursor.media);
                            }
                            return memo;
                        }, ret.trackpoints);
                        Media.find({'_id':{$in:ms}},function(err, medias){
                            if(err){
                                // console.warn(err);
                            }
                            else
                            {
                                _.reduce(medias, function(memo, value){
                                    var media = value.toObject();
                                    for(var t in memo)
                                    {
                                        if(memo[t].start.media.toString() === media._id.toString())
                                        {
                                            memo[t].start.media = media;
                                        }
                                        if(memo[t].end.media.toString() === media._id.toString())
                                        {
                                            memo[t].end.media = media;
                                        }
                                    }
                                    return memo;
                                }, ret.trackpoints);
                                
                                res.render('path_detail', {path: ret});
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
                try{
                    var p = path.toObject();
                    forwardTrackoints(_.clone(p.trackpoints), res, p );
                }
                catch(e){
                    console.log(e);
                }
            }

        });
    } else {
        //  No path id was specified, so we pass all the paths to the template context.
        Path.find({}, function(err, ps) {
            if (err) {
                // console.log('Error: ' + err);
            }
            else {
                text = {};
                
                var getText = function(idx){
                    if(idx == ps.length)
                    {
                        return res.render('path_list', {
                            path_list: ps,
                            text: text
                        });
                    }
                    var P = ps[idx];
                    Connection.find({'_id':{$in:P.trackpoints}}, function(err, connections){
                        text[P._id] = [];
                        _.each(connections, function(con, i){
                            text[P._id].push(con.annotation);
                        });
                        getText(idx + 1);
                    });
                };
                
                getText(0);
            };
        });
    };
};
