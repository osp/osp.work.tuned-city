/*
 * 
 * Resolver.js
 * 
 */


window.tc = window.tc || {};

tc.Resolver = function(){
    var proto = {
        init:function(){
            this.api = '/api/';
        },
        resolve:function(T, id, cb){
            $.get(this.api+T+'/'+id, cb);
        },
        r:function(T, id, cb){this.resolve(T, id, cb)},
    }
    
    var ret = Object.create(proto);
    ret.init();
    return ret;
};