/*
 * 
 * tc.views.js
 * 
 */


(function(undefined){
    'strict'
    
    var tc = window.tc = window.tc || {};
    var Backbone = window.Backbone;
    var template = window.Template;
    
    
    /**********************************
     * 
     * generic implementations
     * 
     * *******************************/
    
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        
        window.tc[elementView] = Backbone.View.extend({
            className:elt,
            initialize: function() {
                this.model.on('change', function(){console.log('CHANGE',elt, this.cid, this.model.changedAttributes());}, this);
                this.model.on('change', this.render, this);
            },
            render: function() {
                var $el = this.$el;
                $el.attr('id', elt+ '_' +this.model.id)
                var data = this.model.toJSON({populate:true});
                
                template.render(elt, this, function(t){
                    $el.html(t(data));
                    if(this.postRender)
                    {
                        this.postRender(data);
                    }
                });

                return this;
            },
        });
    });
    
    
    _.each(models, function(elt, idx){
        var elementView = elt + 'View';
        var elementCollection = elt + 'Collection';
        var collectedView = elt + 'CollectionView' ;
        
        window.tc[collectedView] = Backbone.View.extend({
            className:elementCollection,
            initialize: function() {
                this.collected = window.tc[elementCollection];
                this.rendered_items = {};
                
                this.collected.on('add', this.renderOne.bind(this));
                this.collected.on('reset', this.render.bind(this));
                this.collected.on('remove', this.render.bind(this));
            },
            renderOne: function(item){
                console.log('RENDER_ONE:',collectedView);
                var $el = this.$el;
                var _v = window.tc[elementView];
                if(this.rendered_items[item.cid] === undefined)
                {
                    var itemView = new _v({model:item});
                    itemView.render();
                    $el.append(itemView.el);
                    this.rendered_items[item.cid] = itemView;
                    console.log('APPEND:',itemView.el,'TO:',this.el);
                }
                return this;
            },
            render: function() {
                console.log('RENDER:',collectedView);
                var $el = this.$el;
                var self = this;
                template.render(elementCollection, this, function(t){
                    $el.html(t({}));
                    this.rendered_items = {};
                    this.collected.each(function( item ) {
                        self.renderOne(item);
                    });
                });
                
                return this;
            },
        });
    });
    
    
    /**********************************
     * 
     * implementation details
     * 
     * *******************************/
    
    var _BaseForm = Backbone.View.extend({
        className:'form',
        render:function(){
            if(this.formName && this.formData)
            {
                var $el = this.$el;
                var data = this.formData;
                if((typeof data) === 'function')
                {
                    data = data.apply(this, []);
                }
                
                template.render(this.formName, this, function(t){
                    $el.html(t(data));
                    if(this.postRender)
                    {
                        this.postRender(data);
                    }
                });
            }
            return this;
        },
        _submit:function(evt){
            if(this.submit && ((typeof this.submit) === 'function') )
            {
                this.submit();
            }
        },
        close:function(){
            this.$el.remove();
        },
        events:{
            'click .submit':'_submit',
            'click .close':'close',
        },
    });
    
    
    var createBookmark = function(media, time, comment, shelf){
        
        var c = new tc.Cursor({ media:media, cursor:time });
        c.on('sync', function(){
            var bm = new tc.Bookmark({ note:comment, cursor:c.id });
            bm.on('sync', function(){
                var s = tc.ShelfCollection.get(shelf);
                var bms = _.clone(s.get('bookmarks'));
                bms.push(bm.id);
                s.set({bookmarks:bms});
                s.save({},{wait:true});
            });
            bm.save({},{wait:true});
        });
        c.save({},{wait:true});
    };
    
    _.extend(tc.Media.prototype,{
        _synced:function(res){
            createBookmark(res._id, 
                           0, 
                           'Origin('+(this.fileName||res.url.split('/').pop())+')', 
                           this.get('shelf'));
            
            this.unset('media',{silent:true});
            this.unset('shelf',{silent:true});
            
            this.parse(res);
            this.trigger('sync', this, res, {});
            
        },
        _sync_error:function(jqXHR, textStatus, errorThrown){
            this.trigger('error', jqXHR, textStatus, errorThrown);
        },
        sync:function(method, model, options){
            
            if(model.get('media') && model.get('shelf')) // want to upload
            {
                var formdata = new FormData();
                var f = this.get('media');
                this.fileName = f.name;
                formdata.append('media', f);
                $.ajax({  
                    url: this.url(),  
                    type: "POST",  
                    data: formdata,  
                    processData: false,  
                    contentType: false,  
                })
                .done(this._synced.bind(this))
                .fail(this._sync_error.bind(this));
                
                return this;
            }
            else
            {
                return Backbone.sync.apply(this, [method, model, options]);
            }
        },
    });
    
    tc.FormUploadMedia = _BaseForm.extend({
        id:'upload-media',
        formName:'UploadMedia',
        formData:function(){
            var shelf = window.app.getView('shelf').collected;
            var medias = shelf.findWhere({title:'medias'});
            if(medias === undefined)
            {
                var that = this;
                shelf.create({title:'medias'});
            }
            return {shelves:shelf.toJSON()};
        },
        initialize:function(){
            
        },
        submit:function(){
            var $media = this.$el.find('[name=media]');
            var $shelf = this.$el.find('[name=shelf]');
            
            var f = $media[0].files[0];
            var s = $shelf.val();
            
            var media = tc.MediaCollection.create({media:f, shelf:s},{wait: true});
            this.close();
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
            this.get('cursor', true, function(c){
                c.get('media', true, function(m){
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
            'click .shelf-title-box':'toggle',
             'click .BookmarkPlay':'play_bookmark',
             'click .BookmarkDelete':'delete_bookmark',
        },
        toggle: function(evt){
            this.$el.toggleClass('uncollapsed');
        },
        play_bookmark:function(evt){
            var id = evt.currentTarget.id.split('_').pop();
            var bm = tc.BookmarkCollection.get(id);
            bm.makePath(function(p){
                app.setPath(p);
            });
        },
        delete_bookmark:function(evt){
            var id = evt.currentTarget.id.split('_').pop();
            var bms = this.model.get('bookmarks');
            var newbms = _.without(bms, id);
            this.model.set({bookmarks:newbms}).save({},{wait:true});
        },
        postRender:function(data){
            var $el = this.$el;
            $el.find('.Bookmark').draggable({revert:true, helper: function() {
                var clone = $(this).clone();
                clone.appendTo($('body'));
                return clone;
            }});
            
            //return;
            // lazy loads <a rel="embed" />
            this.$el.find('[rel="embed"]').each(function(i) {
                var that = this;
                
                $(this).dynamicImg({
                    callback: function() {
                        var offset = i * 10;
                        console.log(offset);
                        var bookmarks = $el.find('.Bookmark');
                        var len = bookmarks.length
                        
                        $el.find('.shelf-items').css({
                            position: 'relative',
                            height: 100 + (length * 10) + 30 + "px"
                        });
                        bookmarks.each(function(i) {
                            $(this).css({
                                position: 'absolute',
                                left: (i * 10)  + "px",
                                        top: (i * 10) + "px",
                                        height: '100px',
                            });
                        });
                    }
                });
            });
        },
    });
    
    var relativeOffset = function (e, currentTarget) {
        var $currentTarget = $(currentTarget || e.currentTarget);
        
        return {
            top: e.pageY - $currentTarget.offset().top,
            left: e.pageX - $currentTarget.offset().left,
        };
    };
    
    _.extend(window.tc.PathView.prototype,{
        id:'mediaplayer',
        className:'outer',
        initialize:function(){
            
        },
        render:function(){
            var $el = this.$el;
            $el.empty();
            
            var node = this.model.current();
            var data = {
                url:'',
                next:'Next',
                previous:'Previous',
            };
            if(node){
                data.url = node.url;
                if (node.annotation.next) {
                    data.next = node.annotation.next;
                }
                if (node.annotation.prev) {
                    data.previous = node.annotation.prev;
                }
            }
            
            template.render('Player', this, function(t){
                $el.html(t(data));
                this.setupPlayer(node);
            });
            
            return this;
        },
        getSpectrogramWidth: function () {
            return this.$el.find('.spectrogram').width();
        },
        setupPlayer: function(node){
            var that = this;
            var $el = this.$el;
            var $player = $('#mediaelement-player');
            var $progress = $el.find('.progress');
            var $cursor = $el.find('.cursor');
            var $time = $el.find('.time'); 
            
            this._player = new MediaElementPlayer($player, {
                features: ['playpause','current','progress','duration','volume'],
                success: function (mediaElement, domObject) {
                    // add event listener
                    mediaElement.addEventListener('timeupdate', function(event) {
                        var currentPercentAbsolute = (100 / this.duration) * this.currentTime;
                        
                        $progress.css('width', currentPercentAbsolute + '%');
                        $cursor.css('left', currentPercentAbsolute + '%');
                        
                        $time.text(this.currentTime.secondsTo('mm:ss') + ' / ' + this.duration.secondsTo('mm:ss'));
                    }, false);
                }
            });
            
            if(node)
            {
                $.getJSON('/spectrogram/' + node.media_id + '/', function(data) {
                    that.$el.find('.spectrogram-image').attr('src', data.url);
                });
                    
                $.getJSON('/poster/' + node.media_id + '/', function(data) {
                    that._player.media.poster = data.url
                });
            }
        },
        loadPath: function(path){
            this.model = path;
            var node = this.model.current();
            this.setNode(node);
        },
        setNode:function(node){
            this.render();
        },
        playCurrent:function(){
            var node = this.model.current();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        playNext:function(){
            var node = this.model.next();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        playPrevious:function(){
            var node = this.model.previous();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        innerContainerMouseMoved: function (e) {
            var offsetLeft = relativeOffset(e).left;
            
            this.$el.find('.target').css("left", offsetLeft);
            var $cc = this.$el.find('.comment-cursor');
            $cc.css("left", offsetLeft - ($cc.width() / 2));
        },
        innerContainerClicked: function (e) {
            if (this._player.media.paused) {
                this._player.media.play();
            } else {
                var pc = relativeOffset(e).left / (this.getSpectrogramWidth() / 100);
                var newTime = (this._player.media.duration / 100) * pc;
                this._player.media.setCurrentTime(newTime);
            }
        },
        commentCursorClicked: function (e) {
            var $cc = $(e.target);
            e.stopPropagation();
            
            var pc = relativeOffset(e, this.$el.find('.spectrogram')).left / (this.getSpectrogramWidth() / 100);
            var clickedTime = this._player.media.duration / 100 * pc;
            
            this._player.media.pause()
            app.form.open('bookmark', {
                time:clickedTime,
                media:this.model.current().media_id,
            });
            
//             var $cc = this.$el.find('.comment-cursor');
            
            $cc
            .clone()
            .toggleClass('comment-cursor')
            .toggleClass('comment-cursor-persistant')
            .insertBefore($cc);
        },
        uploadMedia:function(){
            var uf = new tc.FormUploadMedia;
            this.$el.append(uf.render().el);
        },
        events:{
            'mousemove .spectrogram':'innerContainerMouseMoved',
             'click .spectrogram':'innerContainerClicked',
             'click .comment-cursor':'commentCursorClicked',
             'click .next':'playNext',
             'click .previous':'playPrevious',
             'click .play-pause':'playpause',
             'click .upload':'uploadMedia',
        },
        
    });
    
})();
