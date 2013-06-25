
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
            var timestamp = req.params.timestamp || 0;
            var fn = req.params.id + "_" + timestamp + ".jpg",
                path = __dirname + '/../public/posters/' + fn;

            if (fs.existsSync(path)) {
                res.send({url: '/posters/' + fn});
            } else {
                var ffmpeg = 'ffmpeg -i \'' + m[0].url + '\' -ss ' + timestamp + ' -vcodec mjpeg -vframes 1 -f image2 "' + path+'"';
                console.log('poster: '+ffmpeg);
                exec(ffmpeg,
                    function (error, stdout, stderr) {
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        } else {
                            res.send({url: '/posters/' + fn});
                        }
                });
            }
        }
    });
};

exports.spectrogram = function(req, res){
    Media.find({'_id':req.params.id}, function media_find(err, m){
        if(err)
        {
            res.send('500', err);
        }
        else
        {
            var timestamp = req.params.timestamp || 0;
            var fn = req.params.id + "_" + timestamp + ".png",
                path = __dirname + '/../public/spectrograms/' + fn;

            if (fs.existsSync(path)) {
                res.send({url: '/spectrograms/' + fn});
            } else {
                var cmd = [
                    'ffmpeg -y -i \'' + m[0].url + '\' -ac 2 /tmp/foo.wav',
                    'svt.py -s "' + path + '" -o 1 -w 600 -h 50 -p 3 /tmp/foo.wav',
                    'rm /tmp/foo.wav'
                ];

                exec(cmd.join(' && '), function (error, stdout, stderr) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    } else {
                        res.send({url: '/spectrograms/' + fn});
                    }
                });
            }
        }
    });
};
