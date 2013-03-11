/*
 * Path
 */



var Path = function(path){
    var proto = {
        init:function(path){
            this.titles = [];
            this.medias = {};
            this.medias_ready = false;
            var that = this;
            var marray = [];
            for(var i =0; i< path.trackpoints.length; i++)
            {
                var con = path.trackpoints[i];
                this.titles.push(con);
                var es = ['end', 'start'];
                for(var e =0;e<es.length; e++)
                {
                    marray.push(con.start.media._id);
                    marray.push(con.end.media._id);
                }
            }
            this.fill_media(marray);
            this.trackpoints = path.trackpoints;
        },
        fill_media:function(marray){
            if(marray.length === 0)
            {
                this.medias_ready = true;
                return;
            }
            var mid = marray.pop();
            var that = this;
            if(this.medias[mid] === undefined)
            {
                $.getJSON('/media/'+mid, function(data){
                    that.medias[data._id] = data; 
                    that.fill_media(marray);
                });
            }
            else
            {
                that.fill_media(marray);
            }
        },
        play:function(container, title_idx){
            if(!this.medias_ready)
            {
                var that = this;
                window.setTimeout(function(){that.play(container, title_idx);}, 500);
            }
            title_idx = title_idx || 0;
            var player_tpl = '\
            <div class="player-view"></div>\
            <div class="player-controls">\
                <span class="player-play">play</span><span class="player-pause">pause</span>\
            </div>';
            var players = {};
            for(var mid in this.medias)
            {
                var media_ctnr = $('<div />');
                media_ctnr.attr('id', 'id_'+mid);
                media_ctnr.append(player_tpl);
                container.append(media_ctnr);
                players[mid] = MediaPlayer(media_ctnr, this.medias[mid]);
            }
        },
        layout:function(ctnr_id){
            var m_containers = {};
            var that = this;
            d3.select('#'+ctnr_id)
                .selectAll('div')
                .data(that.trackpoints)
                .enter()
                .append('div').text(function(con){
                    return con.annotation;
                })
                .selectAll('div')
                .data(function(con){
                    return [con.start, con.end];
                })
                .enter()
                .append('div').each(function(cursor){
                    var mplayer = MediaPlayer($(this), cursor.media);
                });
        },
    };
    
    var ret = Object.create(proto);
    ret.init(path);
    return ret;
};