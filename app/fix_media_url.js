/*
 * Fixture
 */

var Media = require('./models').Media;
var _ = require('underscore');
var mc = require('./models').mongo_connection;

var cout = console.log;

Media.find({}, function(err, ms){

    var N = ms.length;
    _.each(ms, function(m){
        var newUrl = m.url.split('/').pop();
        
        Media.update({_id:m._id}, {$set: { url:newUrl} }, {}, function(err, numAffected){
            N -= 1;
            cout(N);
            if(N === 0)
            {
                process.emit('exit');
            }
        });
    });
    
});


process.on('exit', function() {
  console.log('About to exit.');
  mc.close(process.exit);
});




