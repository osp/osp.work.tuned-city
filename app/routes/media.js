
/*
 * GET home page.
 */

var Media = require('../models').Media;

exports.media = function(req, res){
    Media.find({'_id':req.params.id}, function media_find(err, m){
        if(err)
        {
            res.send('500', err);
        }
        else
        {
            if(m.length > 0)
                res.send(m[0]);
            else
                res.send('404', 'Could not find media ['+req.params.id+'] on this server');
        }
    });
};