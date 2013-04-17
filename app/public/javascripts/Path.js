/*
 * Path
 */

window.tc = window.tc || {};

tc.PathElement = function(url, media_type, note_prev, note_next, media_id){
    var proto = {
        init:function(url, media_type, note_prev, note_next, media_id){
            this.url = url;
            this.media_id = media_id;
            this.media_type = media_type;
            this.annotation = {prev:note_prev, next:note_next};
            return this;
        },
    };
    
    return Object.create(proto).init(url, media_type, note_prev, note_next, media_id);
};

tc.Path = function(path, options){
    
    var proto = {
        init:function(id, options){
            this.options = _.extend({
                fetch:true,
            }, options || {});
            this.id = id;
            this.current_element = 0;
            this.elements = [];
            
            if(this.options.data)
            {
                this.elements = this.options.data;
            }
            if(this.options.fetch)
            {
                this.fetch();
            }
        },
        fetch:function(){
            var that = this;
            
            tc.app.R.r('Path', this.id, function(pdata){
                var trackpoints = pdata.trackpoints;
                var trackpoints_remain = trackpoints.length;
                for(var i =0; i< trackpoints.length; i++)
                {
                    var con = trackpoints[i];
                    tc.app.R.r('Connection', con, function(cdata){
                        tc.app.R.r('Cursor', cdata.end, function(enddata){
                            tc.app.R.r('Cursor', cdata.start, function(startdata){
                                tc.app.R.r('Media', enddata.media, function(mediadata){
                                    var a_prev = cdata.annotation;
                                    var a_next = null;
    //                                  if(i < (trackpoints.length - 1))
    //                                  {
    //                                      a_next = trackpoints[i + 1].annotation;
    //                                  }
                                    that.elements.push(tc.PathElement(mediadata.url,
                                                                    mediadata.type, 
                                                                    a_prev, 
                                                                    a_next, 
                                                                    enddata.media));
                                    trackpoints_remain -= 1;
                                    if(trackpoints_remain <= 0)
                                    {
                                        if(that.options.onDataComplete)
                                        {
                                            if(typeof that.options.onDataComplete === 'function')
                                                that.options.onDataComplete.apply(that, [that.elements]);
                                            else
                                                that.options.onDataComplete.f.apply(that.options.onDataComplete.o, [that.elements])
                                        }
                                    }
                                });
                            });
                        });
                    });
                }
            });
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
    ret.init(path, options);
    return ret;
};
