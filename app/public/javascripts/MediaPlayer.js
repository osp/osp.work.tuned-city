/*
 * MediaPlayer
 */


var MediaPlayer = function(container, media)
{
    var proto = {
        init:function(container, media){
            var that = this;
            this.ready = false;
            this._player = $('<div/>');
            container.append(this._player);
            this._player.jPlayer({
                supplied: media.type,
                solution: "html,flash",
                swfPath: '/javascripts/Jplayer.swf',
                errorAlerts: false,
                warningAlerts: false,
                ready: function(){that.ready = true;},
                cssSelectorAncestor:'#id_'+media._id,
                cssSelector:{
                    play: ".player-play",
                    pause: ".player-pause"
                }
            });
            var jmedia = {};
            jmedia[media.type] = media.url;
            this._player.jPlayer('setMedia', jmedia);
        },
        play:function(){
            this._player.jPlayer('play');
        },
        pause:function(){
            this._player.jPlayer('pause');
        }
    };
    
    var ret = Object.create(proto);
    ret.init(container, media);
    return ret;
}