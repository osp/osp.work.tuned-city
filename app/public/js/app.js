/*
 * 
 * tc.app.js
 * 
 */



(function(undefined){
    'strict';
    
    var tc = window.tc;
    var Backbone = window.Backbone;
    
    var baseApp = Backbone.View.extend({
        registerComponent: function(name, view){
            if(this.components === undefined)
            {
                this.components = {};
            }
            this.components[name] = {
                view:view,
                visible:false,
                rendered: false,
            }
        },
        getView:function(comp){
            if(this.components[comp] === undefined)
                return null;
            return this.components[comp].view;
        },
        render:function(){
            for(var k in this.components){
                var c = this.components[k];
                console.log(k, c.visible, c.rendered);
                if(c.visible)
                {
                    
                    this.$el.append(c.view.el);
                    if(!c.rendered)
                    {
                        c.view.render();
                        c.rendered = true;
                    }
                }
                else
                {
                    c.view.$el.detach();
                }
            }
        },
        resetViews:function(comps){
            for(var i=0; i<comps.length; i++)
            {
                var c = comps[i];
                try{
                    this.components[c].rendered = false;
                }
                catch(e){
                    //                     console.log('Could not reset: '+c);
                }
            }
            this.render();
        },
        setComponents:function(comps){
            for(var k in this.components){
                var c = this.components[k];
                c.visible = false;
                c.view.$el.detach();
            }
            
            for(var i=0; i<comps.length; i++)
            {
                var c = comps[i];
                try{
                    this.components[c].visible = true;
                }
                catch(e){
                    //                     console.log('Could not activate: '+c);
                }
            }
            this.current_comps = comps;
            this.render();
        },
        unsetComponent:function(comp){
            if(this.components[comp] === undefined)
                return;
            this.components[comp].visible = false;
        },
        setComponent:function(comp){
            if(this.components[comp] === undefined)
                return;
            if(this.components[comp].view.activate)
                this.components[comp].view.activate();
            this.components[comp].visible = true;
        },
    });
    
    var app = baseApp.extend({
        el:'body',
        initialize:function(){
//             this.form = tc.Form();
            this.current_path = undefined;
            
            
            this.registerComponent('shelf', new tc.ShelfCollectionView);
            this.registerComponent('paths', new tc.PathCollectionView);
            this.registerComponent('player', new tc.PathView({model:new tc.Path}));
//             this.registerComponent('connections', new tc.ConnectionWidget);
        },
        
        start: function(){
            var $wait = $('<h1>Waiting for data to load, please be patient</h1>');
            this.getView('shelf').collected.on('reset', function(){
                $wait.remove();
                this.trigger('ready');
            }, this);
            this.getView('shelf').collected.fetch({reset: true});
            $wait.appendTo(this.el);
        },
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
                    that.getView('player').loadPath(that.current_path);
                    this.getView('player').playCurrent();
                }
            });
        },
        _setPathElements:function(elts){
            this.current_path = new tc.Path({_id:'Bookmark_P'});
            this.current_path.elements = elts;
            this.getView('player').loadPath(this.current_path);
            this.getView('player').playCurrent();
        },
 
    });
    
    tc.App = app;
    
})();


