/*
 * 
 * tc.app.js
 * 
 */


window.tc = window.tc || {};


(function(undefined){
    
    window.tc.App = function(){
        this.shelves = new tc.ShelfCollectionView();
        this.paths = new tc.PathCollectionView();
        this.player = tc.MediaPlayer('video');
        this.current_path = undefined;
    };
    _.extend(window.tc.App.prototype, {
        start: function(){
            
//             $.getJSON('/config/root_way',function(config){
//                 //         var pid = config.root_way;
//                 //         tc.app.setPath(pid);
//             });
            
//             this.paths.collected.fetch({ reset:true, });
            var self = this;
//             this.shelves.collected.on('all',function(en){
//                 console.log('SE: '+en);
//             });
            this.shelves.collected.on('reset', function(){
                var l = this.length;
                var maxB = -1;
                var idx = -1;
                for(var i= 0; i < l; i++)
                {
                    var bc = this.at(i).get('bookmarks').length;
                    if( bc >= maxB)
                    {
                        maxB = bc;
                        idx = i;
                    }
                }
                
                this.at(idx).getPopulationReference('bookmarks', function(b){
                    b[b.length-1].getPopulationReference('cursor', function(c){
                        c.getPopulationReference('media', function(m){
                            self.shelves.collected.on('add', this.render_one, this);
                            $('body').append(self.shelves.el);
                            self.shelves.render();
                        });
                    });
                });
            }, this.shelves.collected);
            this.shelves.collected.fetch({ reset:true, });
            
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
                    that.player.loadPath(that.current_path);
                }
            });
        },
        _setPathElements:function(elts){
            this.current_path = new tc.Path({_id:'Bookmark_P'});
            this.current_path.elements = elts;
            this.player.loadPath(this.current_path);
        },
    });
 
    window.tc.PathElement = function(url, media_type, note_prev, note_next, media_id){
        var proto = {
            init:function(url, media_type, note_prev, note_next, media_id){
                this.url = url;
                this.media_id = media_id;
                this.media_type = media_type;
                this.annotation = {prev:note_prev, next:note_next};
                return this;
            },
        };
        
        return Object.create(proto).init(url, media_type, note_prev, note_next, media_id);
    };
    
    
    _.extend(window.tc.Bookmark.prototype, {
        /*
         *  Forge a path suitable for loading into media player
         */
        makePath:function(cb){
            var self = this;
            this.getPopulationReference('cursor', function(c){
                c.getPopulationReference('media', function(m){
                    var pe = [tc.PathElement(m.get('url'), m.get('type'), undefined, undefined, m.id)];
                    cb.apply(self, [pe]);
                });
            });
        },
    });
    
    
    _.extend(window.tc.Path.prototype,{
        collects : { trackpoints: 'Connection' },
        current_element: 0,
        elements: [],
        fill_elements:function(){
            var trackpoints = this.population.trackpoints;
            for(var i =0; i< trackpoints.length; i++)
            {
                var con = trackpoints[i];
                var media = con.population.end.population.media.url;
                var type = con.population.end.population.media.type;
                var a_prev = con.annotation;
                var a_next = null;
                if(i < (trackpoints.length - 1))
                {
                    a_next = trackpoints[i + 1].annotation;
                }
                this.elements.push(tc.PathElement(media, type, a_prev, a_next));
            }
        },
        begin: function(){
            this.current_element = 0;
            return this.current();
        },
        end: function(){
            this.current_element = this.elements.length - 1;
            return this.current();
        },
        next: function(){
            var cur = this.current_element + 1;
            if(cur > (this.elements.length - 1))
                return null;
            this.current_element = cur;
            return this.current();
        },
        previous: function(){
            var cur = this.current_element - 1;
            if(cur < 0)
                return null;
            this.current_element = cur;
            return this.current();
        },
        current: function(){
            return this.elements[this.current_element];
        },
        count: function(){
            return this.elements.length;
        },
        at: function(idx){
            return this.elements[idx];
        },
    });
    
    _.extend(window.tc.ShelfCollectionView.prototype,{
        events:{
            'click .shelf-create-submit': 'create_shelf',
        },
        create_shelf: function(evt){
            var input = this.$el.find('.shelf-create-input');
            var name = input.val();
            this.collected.create({title:name},{wait: true});
            input.val('');
        },
    });
    
    _.extend(window.tc.ShelfView.prototype,{
        events:{
            'click .BookmarkPlay':'play_bookmark',
        },
        play_bookmark:function(evt){
            console.log(arguments);
            var id = evt.currentTarget.id.split('_').pop();
            var bm = tc.BookmarkCollection.get(id);
            bm.makePath(function(p){
                app.setPath(p);
            });
        },
        postRender:function(data){
            return;
            // lazy loads <a rel="embed" />
            this.$el.find('[rel="embed"]').each(function(i) {
                var that = this;
                
                $(this).dynamicImg({
                    callback: function() {
                        console.log($el);
                        $el.css({
                            position: 'relative'
                        });
                        $(this.element).css({
                            position: 'absolute',
                            left: (i * 10) + "px",
                            top: (i * 10) + "px",
                            width: '100px',
                        });
                    }
                });
            });
        },
    });
    
})();


