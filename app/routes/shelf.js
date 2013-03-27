/*
 * shelf.js
 * 
 *  DEPRECATED 
 *  use api instaead of this
 * 
 */

var Shelf = require('../models').Shelf;

exports.shelf = function(req, res){
    var action = req.params.action;
    if(action === 'index')
    {
        // Return shelves' {title, id}s
        Shelf.find({}, function(err, shelves){
            if(err){ res.send('500', err); }
            else
            {
                res.send(shelves);
            }
        });
    }
    else if(action === 'create')
    {
        var s = new Shelf({title:req.params.title, bookmarks:[]});
        s.save();
    }
    else if(action === 'update')
    {
        var data = JSON.parse(req.params.bookmark);
        
        Shelf.update({title:req.params.title}, 
                     {$push:{bookmarks:data}}, 
                     {}, // options
                     function(err, doc){
                         if(err){ res.send('500', err); }
                         else
                         {
                             res.send(doc);
                         }
                    });
    }
};