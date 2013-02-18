/*
 * Models
 */


var Cursor = function(){
    var proto = {
        media:ObjectId,
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
    
};