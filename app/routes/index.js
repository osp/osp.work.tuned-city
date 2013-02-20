
/*
 * GET home page.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;

exports.index = function(req, res){
//     Media.find({}, function media_find(err, m){
//         if(err)
//         {
//             console.log('Could not find medias');
//         }
//         else
//         {
//             console.log('Found medias:');
//             for(var i=0; i < m.length; i++)
//             {
//                 console.log('> '+m[i].url);
//             }
//             res.render('index', { title: 'Index',  medias:m});
//         }
//     });

    Path.find({}, function(err, ps){
        if(err)
        {
            console.log('Error: ' + err);
        }
        else
        {
            var media_ids = {};
            for(var i=0; i < ps.length; i++)
            {
                var cns = ps[i].trackpoints.toObject();
                for(var c = 0; c < cns.length; c++)
                {
                    var con = cns[c];
                    media_ids[con.start.media.toString()] = con.start.media;
                    media_ids[con.end.media.toString()] = con.end.media;
                }
            }
            var mia = [];
            Object.keys(media_ids).forEach(function(k){
                console.log('Ok : '+k);
                mia.push(media_ids[k]);
            });
            Media.find({'_id':{$in:mia}}, function(err, medias){
                if(err){
                    console.log(err);
                }
                else
                {
                    console.log('Found medias:');
                    for(var i=0; i < medias.length; i++)
                    {
                        console.log('> '+medias[i].url);
                    }
                    res.render('index', { title: 'Index',  medias:medias, paths:ps});
                }
            });
            
        }
    });
};