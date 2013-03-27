/*
 * Models
 */

var mongoose = require('mongoose');
var connection = require('./mongo_store').connection;

var Cursor = function(media, cursor){
    var proto = {
        media:mongoose.Types.ObjectId,
        cursor:Number,
    }
    var ret = Object.create(proto);
    if(media !== undefined)
    {
        ret.media = media._id;
        if(cursor !== undefined)
        {
            ret.cursor = cursor;
        }
    }
    return ret;
};

exports.Cursor = Cursor;

var MediaTypes = ['ogv', 'oga', 'ogg', 'mp3'];

var Media = mongoose.Schema({
    url:String,
    type:{type:String, enum:MediaTypes}
});
Media.set('toObject', {transform: function(doc, ret, options){
    var oid = ret._id;
    ret._id = oid.toString();
}});
exports.Media = connection.model('Media', Media);

var Connection = mongoose.Schema({
    start:Cursor(),
    end:Cursor(),
    annotation: String,
});
exports.Connection = connection.model('Connection', Connection);



var Path = mongoose.Schema({
    title:String,
    trackpoints:[Connection]
});
exports.Path = connection.model('Path', Path);

var Bookmark = mongoose.Schema({
    note:String,
    cursor:Cursor()
});
exports.Bookmark = Bookmark;

var Shelf = mongoose.Schema({
    title:String,
    bookmarks:[Bookmark]
});
exports.Shelf = connection.model('Shelf', Shelf);

// might prove usefull 
exports.mongo_connection = connection;