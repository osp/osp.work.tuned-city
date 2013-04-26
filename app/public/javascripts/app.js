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
        setPath: function(pid_or_elts){
            if(typeof pid_or_elts === 'string')
                this._setPathId(pid_or_elts);
            else
                this._setPathElements(pid_or_elts);
        },
        _setPathId:function(pid){
            var that = this;
            console.log(pid);
            that.current_path = tc.Path(pid, {
                onDataComplete:function(e){
                    that.player.loadPath(that.current_path);
                }
            });
        },
        _setPathElements:function(elts){
            this.current_path = tc.Path('-NN-', {
                data:elts,
                fetch:false
            });
            this.player.loadPath(this.current_path);
        },
    };
    
    app.prototype = Object.create(proto);
    ns.app = new app();
})(window.tc);
