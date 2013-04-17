/*
 * MediaPlayer
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
        resetPlayer: function (format) {
            var that = this;
            
            var options = {
                timeupdate: function(event) {
                    var currentPercentAbsolute = event.jPlayer.status.currentPercentAbsolute;
                    
                    that.ui.progress.css('width', 600 / 100 * currentPercentAbsolute);
                    that.ui.cursor.css('left', 600 / 100 * currentPercentAbsolute);
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
                outerContainer : $('<div>').addClass('outer'),
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
            .append(this.ui.pause);

            this.ui.previous.next().andSelf().next().andSelf().wrapAll('<div>');
            
            this.ui.next.on('click', this.playNext.bind(this));
            this.ui.previous.on('click', this.playPrevious.bind(this));
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
                this.elt.jPlayer("playHead", relativeOffset(e).left / (600 / 100));
            }
        },
        commentCursorClicked: function (e) {
            var data = this.elt.data("jPlayer");
            
            e.stopPropagation();
            
            var pc = relativeOffset(e, this.ui.innerContainer).left / (600 / 100);
            var clickedTime = data.status.duration / 100 * pc;
//             var comment = window.prompt("Your comment");
            
//             var cursor = Cursor({
//                 src: data.status.src, 
//                 time: clickedTime, 
//                 comment: comment
//             });
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
            console.log(node);

            $('h2').html('Currently watching: <br />' + node.url);

            media[node.media_type] = node.url;
            $.getJSON('/spectrogram/' + node.media_id + '/', function(data) {
                that.ui.img.attr('src', data.url);
            });

            $.getJSON('/poster/' + node.media_id + '/', function(data) {
                media['poster'] = data.url
                that.elt.jPlayer('setMedia', media);
            });
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

/**
 * $media jQuery plugin (v.2.1.1)
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * Extends the String object to convert any number to seconds
 *
 * '00:34'.toSeconds(); // 34
 *
 * @return float The value in seconds
 */
String.prototype.toSeconds = function () {
    'use strict';

    var time = this, ms;

    if (/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}(\.[0-9]+)?(,[0-9]+)?$/.test(time)) {
        time = time.split(':', 3);

        if (time.length === 3) {
            ms = time[2].split(',', 2);
            ms[1] = ms[1] || 0;

            return ((((parseInt(time[0], 10) * 3600) + (parseInt(time[1], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
        }

        ms = time[1].split(',', 1);
        ms[1] = ms[1] || 0;

        return ((((parseInt(time[0], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
    }

    return parseFloat(time).toSeconds();
};



/**
 * Extends the String object to convert any number value to seconds
 *
 * '34'.secondsTo('mm:ss'); // '00:34'
 *
 * @param string outputFormat One of the avaliable output formats ('ms', 'ss', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')
 *
 * @return string The value in the new format
 */
String.prototype.secondsTo = function (outputFormat) {
    'use strict';

    return this.toSeconds().secondsTo(outputFormat);
};



/**
 * Extends the Number object to convert any number to seconds
 *
 * (23.34345).toSeconds(); // 23.343
 *
 * @return float The value in seconds
 */
Number.prototype.toSeconds = function () {
    'use strict';

    return Math.floor(this * 1000) / 1000;
};


/**
 * Extends the Number object to convert any number value to seconds
 *
 * 34.secondsTo('mm:ss'); // '00:34'
 *
 * @param string outputFormat One of the avaliable output formats ('ms', 'ss', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')
 *
 * @return string The value in the new format
 */
Number.prototype.secondsTo = function (outputFormat) {
    'use strict';

    var time = this;

    switch (outputFormat) {
        case 'ms':
            return Math.floor(time * 1000);

        case 'ss':
            return Math.floor(time);

        case 'mm:ss':
        case 'hh:mm:ss':
        case 'hh:mm:ss.ms':
            var hh = '';

            if (outputFormat !== 'mm:ss') {
                hh = Math.floor(time / 3600);
                time = time - (hh * 3600);
                hh += ':';
            }

            var mm = Math.floor(time / 60);
            time = time - (mm * 60);
            mm = (mm < 10) ? ("0" + mm) : mm;
            mm += ':';

            var ss = time;

            if (outputFormat.indexOf('.ms') === -1) {
                ss = Math.floor(ss);
            } else {
                ss = Math.floor(ss*1000)/1000;
            }
            ss = (ss < 10) ? ("0" + ss) : ss;

            return hh + mm + ss;
    }

    return time;
};
