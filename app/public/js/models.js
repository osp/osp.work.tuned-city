/*
 * tc.models.js
 * 
 */



window.tc = window.tc || {};


(function(undefined){
    var models = 'Bookmark Cursor Connection Path Media Shelf'.split(' ');
    _.each(models, function(elt, idx){
        window.tc[elt] = Backbone.Model.extend({
            urlRoot: '/api/'+elt+'/',
            idAttribute: '_id',
            initialize: function() {
                this.population = {};
//                 this.on('add', this.populate, this);
                this.on('change', function(){
                    if(this._populator)
                        this._populator.trigger('change');
                }, this);
                this.populate();
            },
            populator:function(m){
                this._populator = m;
                return this;
            },
            populate:function()
            {
                if(this.id && (this.collects !== undefined))
                {
                    for(var k in this.collects)
                    {
                        var _mn = this.collects[k];
                        var _c = window.tc[_mn + 'Collection'];
                        var item_ids = this.get(k);
                        if(item_ids === undefined)
                            return;
                        
                        
                        var self = this;
                        console.log('populate '+elt+ ' '+self.id+'\n>> ' + _mn +'('+item_ids+')');
                        if(!Array.isArray(item_ids))
                        {
                            this.population[k] = _c.get_item(item_ids).populator(this);
                            self.trigger('change');
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
                        }
                    }
                }
                return this;
            },
            toJSON:function(populate){
                var ret = Backbone.Model.prototype.toJSON.apply(this);
                if(populate && (this.collects !== undefined))
                {
                    for(var k in this.collects)
                    {
                        try
                        {
                            if(!Array.isArray(ret[k]))
                                ret[k] = this.population[k].toJSON(true);
                            else
                            {
                                ret[k] = [];
                                for(var i = 0; i < this.population[k].length; i++)
                                {
                                    ret[k].push(this.population[k][i].toJSON(true));
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
            getPopulationReference:function(attr, cb){
                console.log(elt+'.getPopulationReference #'+attr);
                if(this.population === undefined
                    || this.population[attr] === undefined)
                {
                    var self = this;
                    window.setTimeout(function(){
                        self.getPopulationReference(attr, cb);
                    }, 300);
                }
                else
                {
                   var ref = this.population[attr];
                   cb.apply(this, [ref]);
                }
            },
            get:function(attr, population, cb){
                ret = Backbone.Model.prototype.get.apply(this, [attr]);
                if(population 
                    && (this.collects !== undefined) 
                    && (this.collects[attr] !== undefined))
                {
                    ret = this.population[attr];
                    if(cb)
                    {
                        this.getPopulationReference(attr, cb);
                    }
                }
                return ret;
            },
        });
    });
    
    
    _.extend(window.tc.Shelf.prototype, {collects:{bookmarks: 'Bookmark'}});
    
    _.extend(window.tc.Connection.prototype, {collects:{ start: 'Cursor', end: 'Cursor'}});
    
    _.extend(window.tc.Bookmark.prototype, {collects:{cursor: 'Cursor'}});
    
    _.extend(window.tc.Cursor.prototype, {collects:{media: 'Media'}});
    
    _.extend(window.tc.Path.prototype,{ collects : { trackpoints: 'Connection' } });
    
    
    
})();
