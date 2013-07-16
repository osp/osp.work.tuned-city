
/*
 * GET media.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;
var settings = require('../settings').settings;

exports.index = function(req, res){
    res.render('index', { title: 'Index', config:settings.public});
};