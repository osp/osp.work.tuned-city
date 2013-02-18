
/*
 * GET home page.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;

exports.index = function(req, res){
//     var medias = new Media();
    var medias = [];
    Media.find({}, function media_find(err, m){
        if(err)
        {
            console.log('Could not find medias');
        }
        else
        {
            console.log('Found medias:');
            for(var i=0; i < m.length; i++)
            {
                console.log('> '+m[i].url);
                medias.push(m[i]);
            }
        }
    });
    res.render('index', { title: 'Index',  medias:medias});
};