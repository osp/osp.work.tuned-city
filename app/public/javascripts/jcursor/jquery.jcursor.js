$(function() {
    /*
     * objects definition
     */
    var Cursor = function(initial) {
        var proto = {
            init: function(initial) {
                this.src = initial.src;
                this.time = initial.time;
                this.comment = initial.comment;

                return this;
            }
        };
        
        return Object.create(proto).init(initial);
    }
    
    /*
     * utilities
     */


    /**
     * function relativeOffset (e, [currentTarget])
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
     * event handlers
     */
    var spectrogramMouseMoved = function(e) {
        var offsetLeft,
            $cursorElt;

        offsetLeft = relativeOffset(e).left;
        $cursorElt = $(this).find('.comment-cursor');

        $(this).find('.target').css("left", offsetLeft);
        $cursorElt.css("left", offsetLeft - ($cursorElt.width() / 2));
    }

    var spectrogramClicked = function(e) {
        var jPlayer = $("#audio").data("jPlayer");

        if (jPlayer.status.paused) {
            $('#audio').jPlayer("play");
        } else {
            $("#audio").jPlayer("playHead", relativeOffset(e).left / (600 / 100));
        }
    };

    var commentCursorClicked = function(e) {
        var jPlayer = $("#audio").data("jPlayer");

        e.stopPropagation();

        var pc = relativeOffset(e, "#spectrogram").left / (600 / 100);
        var clickedTime = jPlayer.status.duration / 100 * pc;
        var comment = window.prompt("Your comment");

        var cursor = Cursor({
            src: jPlayer.status.src, 
            time: clickedTime, 
            comment: comment
        });

        $(this).clone().toggleClass('comment-cursor').toggleClass('comment-cursor-persistant').insertBefore($(this));
    };

    $("#spectrogram").on('mousemove', spectrogramMouseMoved);
    $("#spectrogram").on("click", spectrogramClicked);
    $(".comment-cursor").on("click", commentCursorClicked);

    $("#audio").jPlayer({
        canplay: function () {
            loadFixtures();
        },
        ready: function () {
           $(this).jPlayer("setMedia", {
               oga: "http://video.constantvzw.org/Radio_la_cage/uitzending-la-cage1.ogg"
           });
        },
        timeupdate: function(event) {
            var currentPercentAbsolute = event.jPlayer.status.currentPercentAbsolute;

            $("#slider").slider("value", currentPercentAbsolute);
            $(".progress").css('width', 600 / 100 * currentPercentAbsolute);
            $(".cursor").css('left', 600 / 100 * currentPercentAbsolute);
        },
        errorAlerts: true,
        warningAlerts: false,
        swfPath: "../",
        supplied: "oga",
    });

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
