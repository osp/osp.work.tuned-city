/*
 * MediaPlayer
 *
 * Depends:
 * timecode.js (prototypes extracted from https://github.com/oscarotero/jQuery.media)
 */

window.tc = window.tc || {};


tc.MediaPlayer = function(elt)
{
    /**
     * function relativeOffset (e [, currentTarget])
     *
     * Computes the relative offset of an event.
     *
     * By default, it is relative to the element the event is
     * bound to, but one can pass an arbitrary target element.
     *
     * Returns an object with top and left attributes.
     */
    var relativeOffset = function (e, currentTarget) {
        var $currentTarget = $(currentTarget || e.currentTarget);
        
        return {
            top: e.pageY - $currentTarget.offset().top,
            left: e.pageX - $currentTarget.offset().left,
        };
    };
    
    var proto = {
        init: function (elt) {
            this.elt = $(elt);
            
            this.currentPath = undefined;
            
            this.initUi();
//             this.initPlayer();
            
            // events binding
            this.ui.innerContainer.on('mousemove', this.innerContainerMouseMoved.bind(this));
            this.ui.innerContainer.on("click", this.innerContainerClicked.bind(this));
            this.ui.commentCursor.on("click", this.commentCursorClicked.bind(this));
        },
        getSpectrogramWidth: function () {
            return this.ui.innerContainer.width()
        },
        resetPlayer: function (format) {
            var that = this;
            this.elt.jPlayer("destroy");
            var options = {
                timeupdate: function(event) {
                    var currentPercentAbsolute = event.jPlayer.status.currentPercentAbsolute;
                    
                    that.ui.progress.css('width', that.getSpectrogramWidth() / 100 * currentPercentAbsolute);
                    that.ui.cursor.css('left', that.getSpectrogramWidth() / 100 * currentPercentAbsolute);
                    $('.time').text(event.jPlayer.status.currentTime.secondsTo('mm:ss') + ' / ' + event.jPlayer.status.duration.secondsTo('mm:ss'));
                },
                cssSelectorAncestor: '.outer',
                errorAlerts: true,
                warningAlerts: false,
                swfPath: "./Jplayer.swf",
                supplied: format,
            };
            
            this._player = this.elt.jPlayer(options);
        },
        initUi: function () {
            this.ui = {
                outerContainer : $('<div>').attr('id', 'mediaplayer').addClass('outer'),
                innerContainer : $('<div>').addClass('spectrogram'),
                progress       : $('<div>').addClass('progress'),
                cursor         : $('<div>').addClass('cursor'),
                target         : $('<div>').addClass('target'),
                img            : $('<img>'),
                comment        : $('<div>').addClass('comment'),
                commentCursor  : $('<div>').addClass('comment-cursor'),
                play           : $('<button>').addClass('jp-play').text('Play'),
                pause          : $('<button>').addClass('jp-pause').text('Pause'),
                next           : $('<button>').addClass('next').text('Next'),
                previous       : $('<button>').addClass('previous').text('Previous'),
                upload         : $('<button>').addClass('upload').text('Add Media'),
            };
            
            // builds the ui
            this.ui.comment.append(this.ui.commentCursor);
            
            this.ui.innerContainer
                .append(this.ui.progress)
                .append(this.ui.cursor)
                .append(this.ui.target)
                .append(this.ui.img)
                .append(this.ui.comment);
            
            
            this.ui.outerContainer = this.elt.wrap(this.ui.outerContainer).parent();
            this.ui.outerContainer
                .prepend(this.ui.previous)
                .append(this.ui.next)
                .append(this.ui.innerContainer)
                .append("<br>")
                .append(this.ui.play)
                .append(this.ui.pause)
                .append(this.ui.upload);

            this.ui.previous.next().andSelf().next().andSelf().wrapAll('<div>');
            
            this.ui.next.on('click', this.playNext.bind(this));
            this.ui.previous.on('click', this.playPrevious.bind(this));
            this.ui.upload.on('click', function(evt){
                tc.app.form.open('upload');
            });
        },
        innerContainerMouseMoved: function (e) {
            var offsetLeft = relativeOffset(e).left;
            
            this.ui.target.css("left", offsetLeft);
            this.ui.commentCursor.css("left", offsetLeft - (this.ui.commentCursor.width() / 2));
        },
        innerContainerClicked: function (e) {
            var data = this.elt.data("jPlayer");
            
            if (data.status.paused) {
                this.elt.jPlayer("play");
            } else {
                this.elt.jPlayer("playHead", relativeOffset(e).left / (this.getSpectrogramWidth() / 100));
            }
        },
        commentCursorClicked: function (e) {
            var data = this.elt.data("jPlayer");
            
            e.stopPropagation();
            
            var pc = relativeOffset(e, this.ui.innerContainer).left / (this.getSpectrogramWidth() / 100);
            var clickedTime = data.status.duration / 100 * pc;
//             
            this.elt.jPlayer('pause');
            tc.app.form.open('bookmark', {
                time:clickedTime,
                media:this.currentPath.current().media_id,
            });
            
            this.ui.commentCursor
                .clone()
                .toggleClass('comment-cursor')
                .toggleClass('comment-cursor-persistant')
                .insertBefore(this.ui.commentCursor);
        },
        
        // ...
        loadPath: function(path){
            this.currentPath = path;
            var node = this.currentPath.current();
            this.setNode(node);
        },
        setNode:function(node){
            this.resetPlayer(node.media_type);
            var media = {};
            var that = this;

            $('h2').html('Currently watching: <br />' + node.url);

            media[node.media_type] = node.url;
            $.getJSON('/spectrogram/' + node.media_id + '/', function(data) {
                that.ui.img.attr('src', data.url);
            });
            var jp = this.elt.data("jPlayer");
            if(jp.format[node.media_type].media === 'video')
            {
                $.getJSON('/poster/' + node.media_id + '/', function(data) {
                    media['poster'] = data.url
                    that.elt.jPlayer('setMedia', media);
                });
            }
            else
            {
                that.elt.jPlayer('setMedia', media);
            }
        },
        playCurrent:function(){
            var node = this.currentPath.current();
            this.setNode(node);
            this.elt.jPlayer('play');
        },
        playNext:function(){
            var node = this.currentPath.next();
            this.setNode(node);
            this.elt.jPlayer('play');
        },
        playPrevious:function(){
            var node = this.currentPath.previous();
            this.setNode(node);
            this.elt.jPlayer('play');
        },
    };
    
    var ret = Object.create(proto);
    ret.init(elt);
    return ret;
}
