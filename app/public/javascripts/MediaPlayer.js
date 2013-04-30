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
        getSpectrogramWidth: function () {
            return this.ui.innerContainer.width();
        },
        resetPlayer: function (format) {
            var that = this;
            
            this._player = new MediaElementPlayer(this.ui.player, {
                features: ['playpause','current','progress','duration','volume'],
                success: function (mediaElement, domObject) {
                    // add event listener
                    mediaElement.addEventListener('timeupdate', function(event) {
                        var currentPercentAbsolute = (100 / this.duration) * this.currentTime;

                        that.ui.progress.css('width', currentPercentAbsolute + '%');
                        that.ui.cursor.css('left', currentPercentAbsolute + '%');

                        $('.time').text(this.currentTime.secondsTo('mm:ss') + ' / ' + this.duration.secondsTo('mm:ss'));
                    }, false);
                }
            });
        },
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

            var annotation = this.currentPath.elements[this.currentPath.current_element].annotation;

            if (annotation.next) {
                this.ui.next.text(annotation.next);
            }
            if (annotation.prev) {
                this.ui.previous.text(annotation.prev);
            }

            this._player.setSrc(node.url);

            $.getJSON('/spectrogram/' + node.media_id + '/', function(data) {
                that.ui.img.attr('src', data.url);
            });

            $.getJSON('/poster/' + node.media_id + '/', function(data) {
                that._player.media.poster = data.url
            });
        },
        playCurrent:function(){
            var node = this.currentPath.current();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        playNext:function(){
            var node = this.currentPath.next();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        playPrevious:function(){
            var node = this.currentPath.previous();
            if (node) {
                this.setNode(node);
                this._player.media.play();
            }
        },
        innerContainerMouseMoved: function (e) {
            var offsetLeft = relativeOffset(e).left;
            
            this.ui.target.css("left", offsetLeft);
            this.ui.commentCursor.css("left", offsetLeft - (this.ui.commentCursor.width() / 2));
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
            e.stopPropagation();
            
            var pc = relativeOffset(e, this.ui.innerContainer).left / (this.getSpectrogramWidth() / 100);
            var clickedTime = this._player.media.duration / 100 * pc;

            this._player.media.pause()
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
                player         : $('#mediaelement-player')
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
                //.append(this.ui.play)
                //.append(this.ui.pause)
                .append(this.ui.upload);

            this.ui.previous.next().andSelf().next().andSelf().wrapAll('<div>');
            
            //this.ui.play.on('click', this.playCurrent.bind(this));

            this.ui.next.on('click', this.playNext.bind(this));
            this.ui.previous.on('click', this.playPrevious.bind(this));
            this.ui.upload.on('click', function(evt){
                tc.app.form.open('upload');
            });
        },
        init: function (elt) {
            this.elt = $(elt);
            
            this.currentPath = undefined;
             
            this.initUi();
            
            // events binding
            this.ui.innerContainer.on('mousemove', this.innerContainerMouseMoved.bind(this));
            this.ui.innerContainer.on("click", this.innerContainerClicked.bind(this));
            this.ui.commentCursor.on("click", this.commentCursorClicked.bind(this));
        }
    };
    
    var ret = Object.create(proto);
    ret.init(elt);
    return ret;
}
