/*
 * 
 * app.js
 * (client side)
 * 
 */


window.tc = window.tc || {};

(function(ns, undefined){
    function app(){
        this.player = tc.MediaPlayer('#audio');
        this.shelves = tc.Shelves();
        this.form = tc.Form();
        this.R = tc.Resolver();
        this.current_path = undefined;
        
        $('body').append(this.shelves.element());
    };
    
    var proto = {
        setPath: function(pid_or_obj){
            if(typeof pid_or_obj === 'string')
                this._setPathId(pid_or_obj);
            else
                this._setPathObject(pid_or_obj);
        },
        _setPathId:function(pid){
            var that = this;
            that.current_path = tc.Path(pid, {
                onDataComplete:function(e){
                    that.player.loadPath(that.current_path);
                }
            });
        },
        _setPathObject:function(pobj){
            this.current_path = tc.Path(pobj);
            this.player.loadPath(this.current_path);
        },
    };
    
    app.prototype = Object.create(proto);
    ns.app = new app();
})(window.tc);