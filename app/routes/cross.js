/*
 * routes.cross
 */

var models = require('../models');
var mongoose = require('mongoose');
var async = require('async');

var ObjectId = mongoose.Schema.ObjectId;

function _cross(c1,c2, res){
    var media = c1.media._id;
    models.Path.find({}, function(err, cns){
        if(err){throw new Error(err)}
        var results = [];
        for(var i =0; i< cns.length; i++)
        {
            var cn =cns[i];
            console.log(cn._id+' '+cn.trackpoints.length);
            for(var j = 0; j < cn.trackpoints.length; j++)
            {
                var c = cn.trackpoints[j];
                if(c.start.media._id === media)
                {
                    results.push({path:cn._id, cursor:c._id, rel:'start'});
                }
                if(c.end.media._id === media)
                {
                    results.push({path:cn._id, cursor:c._id, rel:'end'});
                }
            }
        }
        res.send(results);
    });
};


function findCursor(id, callback)
{
    models.Cursor.findById(id,function(err,c){
        callback(err, c);
    })
};

exports.cross = function(req,res){
    var ca = req.params.ca;
    var cb = req.params.cb;
    var cursor_a = models.Cursor.findById(ca);
    var cursor_b = models.Cursor.findById(cb);
    
    async.parallel({ 
        cursor_a:function(callback){
            findCursor(ca, callback);
        }, 
        cursor_b:function(callback){
            findCursor(cb, callback);
        },
    },
    function(err, r){
        if(err){throw new Error(err)}
        
        if(r.cursor_a.media._id !== r.cursor_b.media._id)
        {
            throw new Error('Cannot cross cursors referencing different medias');
        }
        _cross(r.cursor_a, r.cursor_b, res);
    }
    );
    
    
   
};