/*
 * utils.js
 */

var Media = require('../models').Media;

exports.resolve_medias_from_trackpoints = function(trackpoints , callback){
    
    function find_media(id, coll){
        for(var i = 0; i<coll.length; i++)
        {
            if(coll[i]._id.equals(id))
                return coll[i];
        }
        return {};
    };
    
    var media_ids = {};
    for(var pidx = 0; pidx < trackpoints.length; pidx++)
    {
        var con = trackpoints[pidx];
        media_ids[con.start.media.toString()] = con.start.media;
        media_ids[con.end.media.toString()] = con.end.media;
    }
    var ids = [];
    Object.keys(media_ids).forEach(function(k){
        ids.push(media_ids[k]);
    });
    
    Media.find({'_id':{$in:ids}}, function (err, medias){
        if(err) { callback(err); }
        else
        {
            var ret = [];
            for(var pidx = 0; pidx < trackpoints.length; pidx++)
            {
                var con = trackpoints[pidx];
                ret.push({
                    annotation:con.annotation,
                    start:{
                        media:find_media(con.start.media, medias),
                        cursor:con.start.cursor
                    },
                    end:{
                        media:find_media(con.end.media, medias),
                        cursor:con.end.cursor
                    }
                });
            }
            callback(err, ret);
        }
        });
}