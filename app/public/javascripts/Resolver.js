/*
 * 
 * Resolver.js
 * 
 */


window.tc = window.tc || {};

tc.Resolver = function(){
    
    function setNestedProperty(obj, path, value)
    {
        if(path.length === 1)
        {
            obj[path[0]] = value;
            return obj;
        }
        var c = obj[path[0]];
        for(var i = 1; i < path.length - 1; i++)
        {
            c = c[path[i]];
        }
        c[path[path.length - 1]] = value;
        return obj;
    }
    
    
    var proto = {
        init:function(){
            this.api = '/api/';
        },
        _resolve:function(T, id, cb){
            if(typeof T === 'string')
                $.get(this.api+T+'/'+id, cb);
            else
            {
                this._resolveRecursive(T.concat(), id, cb, []);
            }
        },
        _resolveRecursive:function(T, data, cb, kkeys, kdata){
            if(T.length === 0)
            {
                cb.apply(window, [kdata]);
                return;
            }
            var p = T.shift();
            var t = p[0];
            var k = p[1];
            kkeys.push(k);
            var id = data[k];
            var that = this;
            $.get(this.api+t+'/'+id, function(d){
                if(kdata === undefined)
                {
                    kdata = _.extend({},d);
                    kkeys = [];
                }
                else
                {
                    setNestedProperty(kdata, kkeys, d);
                }
                that._resolveRecursive(T, d , cb, kkeys, kdata);
            });
        },
        r:function(T, id, cb){this._resolve(T, id, cb)},
    }
    
    var ret = Object.create(proto);
    ret.init();
    return ret;
};