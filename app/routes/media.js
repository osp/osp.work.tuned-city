
/*
 * GET home page.
 */

var Media = require('../models').Media;
var exec = require('child_process').exec;
var fs = require('fs');

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

exports.poster = function(req, res){
    Media.find({'_id':req.params.id}, function media_find(err, m){
        if(err)
        {
            res.send('500', err);
        }
        else
        {
            var fn = req.params.id + "_" + req.params.timestamp + ".jpg",
                path = __dirname + '/../public/posters/' + fn;

            if (fs.existsSync(path)) {
                res.send('<img src="/posters/' + fn + '" />');
            } else {
                exec('ffmpeg -i /tmp/saturdaytimelapse.ogv -ss ' + req.params.timestamp + ' -vcodec mjpeg -vframes 1 -f image2 ' + path,
                    function (error, stdout, stderr) {
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);

                        if (error !== null) {
                            console.log('exec error: ' + error);
                        } else {
                            res.send('<img src="/posters/' + fn + '" />');
                        }
                });
            }
        }
    });
};
