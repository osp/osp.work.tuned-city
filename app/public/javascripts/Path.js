/*
 * Path
 */



var Path = function(path){
    var proto = {
        init:function(path){
            this.titles = [];
            this.medias = [];
            for(var i =0; i< path.trackpoints.length; i++)
            {
                var con = path.trackpoints[i];
                this.titles.push(con);
                if(this.medias.indexOf(con.start.media) < 0)
                {
                    this.medias.push(con.start.media);
                }
                if(this.medias.indexOf(con.end.media) < 0)
                {
                    this.medias.push(con.end.media);
                }
            }
        },
        play:function(container, title_idx){
            title_idx = title_idx || 0;
            var player_tpl = '\
            <div class="player-view"></div>\
            <div class="player-controls">\
                <span class="player-play">play</span><span class="player-pause">pause</span>\
            </div>';
            var players = {};
            for(var i = 0; i < this.medias; i++)
            {
                
            }
        },
        
    };
    
    var ret = Object.create(proto);
    ret.init(path);
    return ret;
};