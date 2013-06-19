/*
 * tc.models.js
 * 
 */



window.tc = window.tc || {};


(function(undefined){
    'strict';
    
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        window.tc[elt] = Backbone.Model.extend({
            urlRoot: '/api/'+elt+'/',
            idAttribute: '_id',
            initialize: function() {
                this.population = {};
                this.on('change', function(){
                    if(this._populator)
                        this._populator.trigger('change');
                    
                    var cks = _.keys(this.collects || {});
                    var chks = _.keys(this.changedAttributes() || {});
                    var its = _.intersection(cks, chks);
                    if(its.length > 0)
                    {
                        this.populate();
                    }
                }, this);
                this.populate();
                if(this.postInitialize){
                    this.postInitialize();
                }
            },
            populator:function(m){
                this._populator = m;
                return this;
            },
            populate:function()
            {
                if(this.id && (this.collects !== undefined) && (!this._populating))
                {
                    this._populating = true;
                    for(var k in this.collects)
                    {
                        var _mn = this.collects[k];
                        var _c = window.tc[_mn + 'Collection'];
                        var item_ids = this.get(k);
                        if(item_ids === undefined)
                        {
                            this._populating = false;
                            return;
                        }
                        
                        
                        var self = this;
                        console.log('populate '+elt+ ' '+self.id+'\n>> ' + _mn +'('+item_ids+')');
                        if(!Array.isArray(item_ids))
                        {
                            this.population[k] = _c.get_item(item_ids).populator(this);
                            self.trigger('change');
                            if(this.population[k].collects === undefined)
                            {
                                self.trigger('populated');
                            }
                        }
                        else
                        {
                            this.population[k] = [];
                            for(var i=0; i < item_ids.length; i++)
                            {
                                var id = item_ids[i];
                                if(id !== undefined)
                                {
                                    this.population[k].push(_c.get_item(id).populator(this));
                                    self.trigger('change');
                                }
                                
                            }
                            if((item_ids.length === 0) || (this.population[k][0].collects === undefined))
                            {
                                self.trigger('populated');
                            }
                        }
                    }
                    this._populating = false;
                }
                return this;
            },
            toJSON:function(options){
                var ret = Backbone.Model.prototype.toJSON.apply(this,[options]);
                if(options && options.populate && (this.collects !== undefined))
                {
                    for(var k in this.collects)
                    {
                        try
                        {
                            if(!Array.isArray(ret[k]))
                                ret[k] = this.population[k].toJSON(options);
                            else
                            {
                                ret[k] = [];
                                for(var i = 0; i < this.population[k].length; i++)
                                {
                                    ret[k].push(this.population[k][i].toJSON(options));
                                }
                            }
                        }
                        catch(e)
                        {
                            //console.log(k + ' NOT IN ' + elt + this.id);
                        }
                    }
                }
                return ret;
            },
            _getPopulationReference:function(attr, cb){
                console.log(elt+'.getPopulationReference #'+attr);
                if(this.population === undefined
                    || this.population[attr] === undefined)
                {
                    var self = this;
                    window.setTimeout(function(){
                        self._getPopulationReference(attr, cb);
                    }, 300);
                }
                else
                {
                   var ref = this.population[attr];
                   cb.apply(this, [ref]);
                }
            },
            get:function(attr, population, cb){
                var ret = Backbone.Model.prototype.get.apply(this, [attr]);
                if(population 
                    && (this.attributes[attr] !== undefined)
                    && (this.collects !== undefined) 
                    && (this.collects[attr] !== undefined))
                {
                    
                    ret = this.population[attr];
                    if(cb)
                    {
                        this._getPopulationReference(attr, cb);
                    }
                    if(ret === undefined)
                    {
                        this.populate();
                    }
                }
                return ret;
            },
        });
    });
    
    
    window.tc.PathElement = Backbone.Model.extend({
        initialize:function(){
        },
    });
    
    _.extend(window.tc.Bookmark.prototype, {
        /*
         *  Forge a path suitable for loading into media player
         */
        makePath:function(cb){
            var self = this;
            this.get('cursor', true, function(c){
                c.get('media', true, function(m){
                    var pe = [new tc.PathElement({
                        media:{
                            id:m.id, 
                            url:m.get('url'), 
                        },
                        type:m.get('type'), 
                                                annotation:{
                                                    prev:undefined, 
                                                next:undefined
                                                }
                    })];
                    
                    cb.apply(self, [pe]);
                });
            });
        },
    });
    
    _.extend(window.tc.Path.prototype,{
        postInitialize:function(){
            this.current_element = 0;
            this.elements = [];
        },
        fill_elements:function(){
            var trackpoints = this.population.trackpoints;
            for(var i =0; i< trackpoints.length; i++)
            {
                var con = trackpoints[i];
                var media = con.population.end.population.media.url;
                var type = con.population.end.population.media.type;
                var mid = con.population.end.population.media._id;
                var a_prev = con.annotation;
                var a_next = null;
                if(i < (trackpoints.length - 1))
                {
                    a_next = trackpoints[i + 1].annotation;
                }
                this.elements.push(new tc.PathElement({
                    media:{
                        id:mid, 
                        url:media, 
                    },
                    type:type, 
                    annotation:{
                        prev:a_prev, 
                        next:a_next
                    }
                }));
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
    });
    
    _.extend(window.tc.Shelf.prototype, {collects:{bookmarks: 'Bookmark'}});
    
    _.extend(window.tc.Connection.prototype, {collects:{ start: 'Cursor', end: 'Cursor'}});
    
    _.extend(window.tc.Bookmark.prototype, {collects:{cursor: 'Cursor'}});
    
    _.extend(window.tc.Cursor.prototype, {collects:{media: 'Media'}});
    
    _.extend(window.tc.Path.prototype,{ collects : { trackpoints: 'Connection' } });
    
    
    
    
})();
