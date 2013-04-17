/*
 * Models
 */

var mongoose = require('mongoose');
var connection = require('./mongo_store').connection;


var ObjectId = mongoose.Schema.ObjectId


var MediaTypes = ['ogv', 'oga', 'ogg', 'mp3'];

var MediaSchema = mongoose.Schema({
    url:String,
    type:{type:String, enum:MediaTypes}
});

MediaSchema.set('toObject', {transform: function(doc, ret, options){
    var oid = ret._id;
    ret._id = oid.toString();
}});

var CursorSchema = mongoose.Schema({
    media:{type:ObjectId, ref:'Media' },
    cursor:Number,
});
CursorSchema.pre('init', function(next, doc, query){
    query.populate('media');
    next();
    //     return doc;
});



var ConnectionSchema = mongoose.Schema({
    start:{type:ObjectId, ref:'Cursor'},
    end:{type:ObjectId, ref:'Cursor'},
    annotation: String,
});
ConnectionSchema.pre('init', function(next, doc, query){
    query.populate('start').populate('end');
    next();
});



var PathSchema = mongoose.Schema({
    title: String,
    trackpoints: [{type:ObjectId, ref:'Connection'}]
});
PathSchema.pre('init', function(next, doc, query){
    query.populate('trackpoints');
    next();
});




var BookmarkSchema = mongoose.Schema({
    note:String,
    cursor:{type:ObjectId, ref:'Cursor'}
});
BookmarkSchema.pre('init', function(next, doc, query){
    query.populate('cursor');
    next();
});

var ShelfSchema = mongoose.Schema({
    title:String,
    bookmarks:[{type:ObjectId, ref:'Bookmark'}]
});
ShelfSchema.pre('init', function(next, doc, query){
    query.populate('bookmarks');
    next();
});



exports.Cursor = connection.model('Cursor', CursorSchema);
exports.Media = connection.model('Media', MediaSchema);
exports.Connection = connection.model('Connection', ConnectionSchema);
exports.Path = connection.model('Path', PathSchema);
exports.Bookmark = connection.model('Bookmark', BookmarkSchema);
exports.Shelf = connection.model('Shelf', ShelfSchema);
// might prove usefull 
exports.mongo_connection = connection;
