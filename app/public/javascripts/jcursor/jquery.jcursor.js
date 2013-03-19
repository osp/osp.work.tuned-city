$(function() {
    /*
     * Cursor
     */
    var Cursor = function(initial) {
        var proto = {
            init: function(initial) {
                this.src = initial.src;
                this.time = initial.time;
                this.comment = initial.comment;
            }
        };
        
        var ret = Object.create(proto);
        ret.init(initial);
        return ret;
    }

    /*
     * Player
     */
    var Player = function(elt, src) {
        var proto = {
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
                var comment = window.prompt("Your comment");

                var cursor = Cursor({
                    src: data.status.src, 
                    time: clickedTime, 
                    comment: comment
                });

                this.ui.commentCursor
                    .clone()
                    .toggleClass('comment-cursor')
                    .toggleClass('comment-cursor-persistant')
                    .insertBefore(this.ui.commentCursor);
            },
            initPlayer: function () {
                var that = this;

                var options = {
                    canplay: function () {
                        //loadFixtures();
                    },
                    ready: function () {
                       $(this).jPlayer("setMedia", {
                           oga: that.src
                       });
                    },
                    timeupdate: function(event) {
                        var currentPercentAbsolute = event.jPlayer.status.currentPercentAbsolute;

                        that.ui.progress.css('width', 600 / 100 * currentPercentAbsolute);
                        that.ui.cursor.css('left', 600 / 100 * currentPercentAbsolute);
                    },
                    cssSelectorAncestor: '.outer',
                    errorAlerts: true,
                    warningAlerts: false,
                    swfPath: "../",
                    supplied: "oga",
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
                    img            : $('<img>').attr('src', 'img/spectrogram.png'),
                    comment        : $('<div>').addClass('comment'),
                    commentCursor  : $('<div>').addClass('comment-cursor'),
                    play           : $('<button>').addClass('jp-play').text('play'),
                    pause          : $('<button>').addClass('jp-pause').text('pause')
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
                    .prepend(this.ui.innerContainer)
                    .append(this.ui.play)
                    .append(this.ui.pause);
            },
            init: function (elt, src) {
                this.elt = $(elt);
                this.src = src;
                console.log(this.src);

                this.initUi();
                this.initPlayer();

                // events binding
                this.ui.innerContainer.on('mousemove', this.innerContainerMouseMoved.bind(this));
                this.ui.innerContainer.on("click", this.innerContainerClicked.bind(this));
                this.ui.commentCursor.on("click", this.commentCursorClicked.bind(this));
            }
        };
        
        var ret = Object.create(proto);
        ret.init(elt, src);
        return ret;
    }

    window.Player = Player;
    
    /*
     * Utilities
     */


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


    /*
     * fixtures, for testing purpose
     */

    var loadFixtures = function () {
        var jPlayer = $("#audio").data("jPlayer");

        var fixtures = [
            {
                src: "http://video.constantvzw.org/Radio_la_cage/uitzending-la-cage1.ogg", 
                time: 442.30096435546875,
                comment: "Hello"
            },
            {
                src: "http://video.constantvzw.org/Radio_la_cage/uitzending-la-cage1.ogg", 
                time: 654.6054272460938, 
                comment: "world"
            }
        ];

        for (var i=0, max=fixtures.length; i < max; i++) {
            var cursor = Cursor(fixtures[i]);

            var duration = jPlayer.status.duration;
            var pc = fixtures[i].time / duration * 100;
            var left = (pc / 100) * 600;

            $("<div>")
                .addClass("comment-cursor-persistant")
                .css('left', left)
                .appendTo(".comment");
        }
    };
});
