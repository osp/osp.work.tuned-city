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
            render: function(callback) {
                var $el = this.$el;
                $el.attr('id', elt+ '_' +this.model.id)
                var data = this.model.toJSON({populate:true});
                
                template.render(elt, this, function(t){
                    $el.html(t(data));
                    if(callback && ((typeof callback) === 'function'))
                    {
                        callback.apply(this, []);
                    }
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
                var that = this;
                var formdata = new FormData();
                var f = this.get('media');
                this.fileName = f.name;
                formdata.append('media', f);
                $.ajax({  
                    xhr: function() {
                      var xhr = new window.XMLHttpRequest();
                      //Upload progress
                      xhr.upload.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          //Do something with upload progress
                          if (options.progress) {
                                options.progress.apply(that, [percentComplete])
                          };
                          console.log(percentComplete);
                        }
                      }, false);
                      //Download progress
                      xhr.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                          var percentComplete = evt.loaded / evt.total;
                          //Do something with download progress
                          console.log(percentComplete);
                        }
                      }, false);
                      return xhr;
                    },
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
            
            var files = $media[0].files;
            var s = $shelf.val();

            var to_remain = files.length; 
            var that = this;

            for (var i = 0; i < files.length; i++) {

                var $file = $('<div>').addClass('file'); 
                var $filename = $('<div>').addClass('filename'); 
                var $progressBar = $('<div>').addClass('progress-bar'); 
                var $progress = $('<div>').addClass('progress'); 
                    
                $filename.text(files[i].name);

                $progressBar.append($progress);
                $file.append($filename);
                $file.append($progressBar);

                $("#progress-list").append($file);

                var media = tc.MediaCollection.create({media:files[i], shelf:s},{wait: true, progress: function(pc) {
                    $progress.width((pc * 100) + '%');
                }});
                media.on('sync', function() {
                    $file.remove();
                    to_remain--;
                    if (to_remain === 0) {
                        that.close();
                    };
                });
            };
        },
    });
    
    tc.FormCreateBookmark = _BaseForm.extend({
        formName:'CreateBookmark',
        formData:function(){
            var shelf = window.app.getView('shelf').collected;
            return _.extend({shelves:shelf.toJSON()}, this.options);
        },
        initialize:function(){
            
        },
        submit:function(){
            var $note = this.$el.find('[name=note]');
            var $shelf = this.$el.find('[name=shelf]');
            var s = $shelf.val();
            var n = $note.val();
            
            createBookmark(this.options.media, this.options.ctime, n, s);
            
            this.close();
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
            'click .BookmarkDelete':'delete_bookmark',
        },
        toggle: function(evt){
            this.$el.toggleClass('uncollapsed');
        },
//         play_bookmark:function(evt){
//             var id = evt.currentTarget.id.split('_').pop();
//             var bm = tc.BookmarkCollection.get(id);
//             bm.makePath(function(p){
//                 app.setPath(p);
//             });
//         },
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
    
    _.extend(tc.PathCollectionView.prototype,{
        events:{
            'click .new-path-submit':'newPath',
            'click .path-title':'editPath',
            'click .PathDelete':'delete_path',
        },
        
        delete_path:function(evt){
            var id = evt.currentTarget.id.split('_').pop();
            var model = this.collected.get(id);
            model.destroy({wait: true});
        },
        
        newPath:function(){
            var title =  this.$el.find('.new-path-input').val();
            tc.PathCollection.create({
                title:title,
            });
        },
        
        editPath:function(evt){
            var pid = $(evt.target).attr('data-id');
            window.app.resetPath(pid);
        },
    });
    
    var relativeOffset = function (e, currentTarget) {
        var $currentTarget = $(currentTarget || e.currentTarget);
        
        return {
            top: e.pageY - $currentTarget.offset().top,
            left: e.pageX - $currentTarget.offset().left,
        };
    };
    
    window.tc.PlayerView = window.tc.PathView.extend({
        id:'mediaplayer',
        className:'outer',
        initialize:function(){
            
        },
        render:function(callback){
            var $el = this.$el;
            this._playerReady = false;
            
            var node = this.model.current();
            var data = {
                url:undefined,
                next:'Next',
                previous:'Previous',
                type: undefined,
            };
            
            if(node){
                var media = node.get('media');
                data.url = media.url;
                data.type = media.type;
                
                if (node.get('annotation').next) {
                    data.next = node.get('annotation').next;
                }
                if (node.get('annotation').prev) {
                    data.previous = node.get('annotation').prev;
                }
            }
            
            template.render('Player', this, function(t){
                $el.html(t(data));
                this.setupPlayer(node);
                if(callback && ((typeof callback) === 'function'))
                {
                    callback.apply(this, []);
                }
            });
            
            return this;
        },
        
        getSpectrogramWidth: function () {
            return this.$el.find('.spectrogram').width();
        },
        
        _timeUpdate: function (event) {
            var ctx = {
                $progress: this.$el.find('.progress'),
                $cursor : this.$el.find('.cursor'),
            };
            
            var currentPercentAbsolute = event.jPlayer.status.currentPercentAbsolute;
            
            ctx.$progress.css('width', currentPercentAbsolute + '%');
            ctx.$cursor.css('left', currentPercentAbsolute + '%');
           
        },
        
        setupPlayer: function(node){
            var self = this;
            if( node 
                && node.has('media') 
                && node.get('media').url 
                && node.get('media').type )
            {
                var mime = node.get('media').type.split('/');
                var subtype = mime.pop();
                var media = { };
                media[subtype] =  node.get('media').url;
                
                var player = this.$el.find(".player");
                player.jPlayer({
                    ready: function(){ 
                        $(this).jPlayer("setMedia", media); 
                        self._playerReady = true;
                        self.trigger('player:ready');
                    },
                    swfPath: "/javascripts/Jplayer.swf",
                    supplied: subtype,
                    cssSelectorAncestor: "#mediaplayer .controls",
                    cssSelector: {
                        play: ".play",
                        pause: ".pause",
                        mute: ".mute",
                        unmute: ".unmute",
                        currentTime: ".currentTime",
                        duration: ".duration"
                    },
                    size: {
                        width: "600px",
//                         height: "180px",
                    }
                });
                
                this._playerData = this.$el.find(".player").data('jPlayer');
                this._player = function(){
                    player.jPlayer.apply(player, arguments);
                };
                
                player.on($.jPlayer.event.timeupdate, this._timeUpdate.bind(this));
                
                $.getJSON('/spectrogram/' + node.get('media').id + '/', function(data) {
                    that.$el.find('.spectrogram-image').attr('src', data.url);
                });
                    
                $.getJSON('/poster/' + node.get('media').id + '/', function(data) {
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
            if(node) {
                this.once('player:ready', function(){
                    this._player('play', node.get('cursor'));
                }, this);
                this.render();
            }
        },
        setCurrentTime:function(time){
            var duration = this._playerData.status.duration;
            if(duration > 0)
                this._player('playHead', time * 100.0 / this._playerData.status.duration);
        },
        playCurrent:function(){
            this.setNode(this.model.current());
        },
        playNext:function(){
            this.setNode(this.model.next());
        },
        playPrevious:function(){
            this.setNode(this.model.previous());
        },
        innerContainerMouseMoved: function (e) {
            var offsetLeft = relativeOffset(e).left;
            
            this.$el.find('.target').css("left", offsetLeft);
            var $cc = this.$el.find('.comment-cursor');
            $cc.css("left", offsetLeft - ($cc.width() / 2));
        },
        innerContainerClicked: function (e) {
            if (this._playerData.status.paused) {
                this._player('play');
            } else {
                var pc = relativeOffset(e).left / (this.getSpectrogramWidth() / 100);
                var newTime = (this._playerData.status.duration / 100) * pc;
                this._player('play', newTime);
            }
        },
        commentCursorClicked: function (e) {
            this._player('pause');
            var $cc = $(e.target);
            e.stopPropagation();
            
            var pc = relativeOffset(e, this.$el.find('.spectrogram')).left / (this.getSpectrogramWidth() / 100);
            var clickedTime = this._playerData.status.duration / 100 * pc;
            
            var node = this.model.current();
            var media = node.get('media');
            var form = new tc.FormCreateBookmark({
                media: media._id,
                ctime: clickedTime,
            });
            
            this.$el.append(form.render().el);
            
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
    
    
    // connection widget
    
    _.extend(tc.ConnectionView.prototype,{
        postRender:function(){
            this.$el.find('.drop').droppable({
                    accept: ".Bookmark",
                    tolerance: "pointer" ,
                    drop: this.drop.bind(this),
                });
        },
        drop:function( event, ui ){
            var elt = ui.draggable;
            var id = elt.attr('id').split('_').pop();
            var bookmark = tc.BookmarkCollection.get_item(id);
            var cursor = bookmark.get('cursor');
            var that = $(event.target);
            var isIn = that.hasClass('in');
            if(isIn)
            {
                this.model.set({start: cursor});
            }
            else
            {
                this.model.set({end: cursor});
            }
        },
        save:function(){
            var start = this.$('.in').attr('data-id');
            var end = this.$('.out').attr('data-id');
            var anot = this.$('.annotation').val();
            this.model.save({
                start:start,
                end:end,
                annotation:anot,
            });
        },
    });
    
    window.tc.ConnectionWidget = Backbone.View.extend({
        className:'ConnectionWidget',
        
        initialize:function(){
            if(this.model)
                this.model.on('change', this.render.bind(this));
            this.connections = {};
        },
        
        renderConnection:function(conId){
            if(this.connections[conId] === undefined)
            {
                var con = tc.ConnectionCollection.get(conId);
                this.connections[conId] = new tc.ConnectionView({model:con});
                this.connections[conId].render().$el.appendTo(this.$el);
            }
        },
        
        render:function(data){
            var data = {};
            if(this.model)
                data = this.model.toJSON({populate:true});
            
            template.render('ConnectionWidget', this, function(t){
                this.connections = {};
                this.$el.html(t(data));
                var cons = this.model.get('trackpoints');
                if(cons)
                {
                    for(var i=0; i < cons.length; i++)
                    {
                        this.renderConnection(cons[i]);
                    }
                }
            });
            
            return this;
        },
        
        events:{
            'click .add':'add_row',
            'click .save':'save',
        },
        
        resetModel:function(model){
//             this.model.off('change');
            this.model = model;
            this.model.on('change', this.render.bind(this));
            this.render();
        },
        
        add_row:function(){
            var self = this;
            this.model.once('sync', function(){
                var conn = tc.ConnectionCollection.create({
                    start:0,
                    end:0,
                    annotation:'Annotation',
                })
                .once('sync', function(model){
                    var cids = _.clone(self.model.get('trackpoints'));
                    cids.push(model.id);
                    self.model.set({trackpoints:cids});
                });
            });
            this.save();
        },
        
        save:function(){
            var self = this;
            var ctnr = this.ctnr;
            var title = this.$el.find('.title').val();
            var cids = [];
            
            for(var ck in this.connections)
            {
                var cv = this.connections[ck];
                cv.save();
                cids.push(cv.model.id);
            }
            
            this.model.set({
                title:title,
                trackpoints:cids,
            });
            this.model.save();
        },
    });
    
    
})();
