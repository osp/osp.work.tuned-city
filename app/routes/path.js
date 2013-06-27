
/*
 * GET media.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;
var Connection = require('../models').Connection;

exports.path = function(req, res){

    if ('path' in req.params && req.params['path'] != undefined) {
        // A path id was specified, so we search for it in order to pass it the template
        console.log('path is specified');

        Path 
        .findById(req.params['path'])
        .populate('trackpoints')
        .exec(function (err, path) {
            if (err) return handleError(err);

            //var mia = [];
            //Object.keys(media_ids).forEach(function(k){
                //console.log('Ok : '+k);
                //mia.push(media_ids[k]);
            //});
            var trackpoints = [];
            for (var i = 0; i < path.trackpoints.length; i++) {
                Connection
                .findById(path.trackpoints[i]._id)
               // .populate('start end')
                .exec(function (err, con) {
                    console.log('push con',con);
                    trackpoints.push(con);
                });
            };
            console.log(path.trackpoints.length, trackpoints.length);
            path.trackpoints = trackpoints;

            res.render('path_detail', {path: path});

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

    //Path.find({}, function(err, ps){
        //if(err)
        //{
            //console.log('Error: ' + err);
        //}
        //else
        //{
            //var media_ids = {};
            //for(var i=0; i < ps.length; i++)
            //{
                //var cns = ps[i].trackpoints.toObject();
                //for(var c = 0; c < cns.length; c++)
                //{
                    //var con = cns[c];
                    //media_ids[con.start.media.toString()] = con.start.media;
                    //media_ids[con.end.media.toString()] = con.end.media;
                //}
            //}
            //var mia = [];
            //Object.keys(media_ids).forEach(function(k){
                //console.log('Ok : '+k);
                //mia.push(media_ids[k]);
            //});
            //Media.find({'_id':{$in:mia}}, function(err, medias){
                //if(err){
                    //console.log(err);
                //}
                //else
                //{
                    //console.log('Found medias:');
                    //for(var i=0; i < medias.length; i++)
                    //{
                        //console.log('> '+medias[i].url);
                    //}
                    //res.render('index', { title: 'Index',  medias:medias, paths:ps});
                //}
            //});
            
        //}
    //});
};
