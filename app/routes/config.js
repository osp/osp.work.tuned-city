
/*
 * config.
 */

var settings = require('../settings').settings;

exports.config = function(req, res){
    var pub_config = settings.public;
    var key = req.params.key;
    try{
        var ret = {};
        ret[key] = pub_config[key];
        res.send(ret);
    }
    catch(e){
        res.send('404', 'No such key: ' + key);
    }
};