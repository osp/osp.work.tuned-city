/*
 * Models
 */

var mongoose = require('mongoose');
var connection = require('./mongo_store').connection;

var Cursor = function(){
    var proto = {
        media:mongoose.Schema.ObjectId,
        cursor:Number,
    }
    var ret = Object.create(proto);
    return ret;
};

var MediaTypes = ['ogv', 'oga', 'mp3'];

var models = {
    
    Media:{
        url:String,
        type:{type:String, enum:MediaTypes}
    },
    
    Connection:{
        start:Cursor(),
        end:Cursor(),
        annotation: String,
    },
    
    Path:{
        title:String,
        trackpoints:[this.Connection]
    },
    
};

var transforms = {
    Media: function(doc, ret, options){
        var oid = ret._id;
        ret._id = oid.toString();
    }
};


for(var k in models)
{
    var schema = mongoose.Schema(models[k]);
    if(transforms[k] !== undefined)
    {
        schema.set('toObject', {transform:transforms[k]});
    }
    var model = connection.model(k, schema);
    exports[k] = model;
    
}