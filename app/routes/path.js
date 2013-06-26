
/*
 * GET media.
 */

var Media = require('../models').Media;
var Path = require('../models').Path;

exports.path = function(req, res){
    res.render('path', {});
};
