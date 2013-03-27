/*
 * Path
 */

var PathElement = function(url, media_type, note_prev, note_next){
    var proto = {
        init:function(url, media_type, note_prev, note_next){
            this.url = url;
            this.media_type = media_type;
            this.annotation = {prev:note_prev, next:note_next};
            return this;
        },
    };
    
    return Object.create(proto).init(url, media_type, note_prev, note_next);
};

var Path = function(path){
    
    function _outbound(){};
    
    var proto = {
        OUTBOUND: _outbound(),
        init:function(path){
            this.current_element = 0;
            this.make_elements(path.trackpoints);
        },
        make_elements:function(trackpoints){
            this.elements = [];
            for(var i =0; i< trackpoints.length; i++)
            {
                var con = trackpoints[i];
                var es = ['end', 'start'];
                var media = con.end.media.url;
                var type = con.end.media.type;
                var a_prev = con.annotation;
                var a_next = null;
                if(i < (trackpoints.length - 1))
                {
                    a_next = trackpoints[i + 1].annotation;
                }
                this.elements.push(PathElement(media, type, a_prev, a_next));
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
    };
    
    var ret = Object.create(proto);
    ret.init(path);
    return ret;
};