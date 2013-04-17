/*
 * Shelf.js
 */

window.tc = window.tc || {};


tc.Bookmark = function(id, options)
{
    var proto = {
        init: function(id, options) {
            this.id = id;
            this.options = _.extend({
                fetch:true,
            }, options || {});
            this.elt = $('<div />').addClass('bookmark');
            var that = this;
            this.elt.on('click', function(evt){
                var path = that.makePath();
                tc.app.setPath(path);
            });
            if(this.options.data)
            {
                this.data = this.options.data;
            }
            if(this.options.fetch)
            {
                this.fetch();
            }
        },
        fetch: function(){
            var that = this;
            $.getJSON('/api/Bookmark/'+this.id, function(data){
                that.data = data;
                if(that.options.onDataComplete)
                {
                    if(typeof that.options.onDataComplete === 'function')
                        that.options.onDataComplete.apply(that, [data]);
                    else
                        that.options.onDataComplete.f.apply(that.options.onDataComplete.o, [data])
                }
                that.render();
            });
        },
        render: function(){
            this.elt.html(this.data.note);
        },
        element:function(){
            return this.elt;
        },
        /*
         *  Forge a path suitable for loading into media player
         */
        makePath:function(){
            var t0 = _.extend({},this.data.cursor);
            var t1 = _.extend({},this.data.cursor);
            t1.cursor = -1;
            var c0 = {
                start:t1,
                end:t0,
            };
            var c1 = {
                start:t0,
                end:t1,
            };
            
            var p = {
                title:'FP_'+this.id,
                trackpoints:[c0, c1],
            };
            
            return p;
        },
    };
    
    var ret = Object.create(proto);
    ret.init(id, options);
    return ret;
}


tc.Shelf = function(sid, options)
{
    var proto = {
        init: function(sid, options) {
            this.id = sid;
            this.options = _.extend({
                fetch:true,
            }, options || {});
            this.elements = {
                box :       $('<div class="shelf-box" />'),
                titleBox :  $('<div class="shelf-title-box" />'),
                title :     $('<div class="shelf-title" />'),
                itemsBox :  $('<div class="shelf-items-box" />'),
            };
            this.elements.titleBox.append(this.elements.title);
            this.elements.box.append(this.elements.titleBox);
            this.elements.box.append(this.elements.itemsBox);
            
            this.bookmarks = {};
            this.fetch();
        },
        fetch: function(){
            var that = this;
            $.getJSON('/api/Shelf/'+this.id, function(data){
                that.data = data;
                that.elements.title.text(data.title);
                var bc = data.bookmarks.length;
                for(var i = 0; i < bc; i++)
                {
                    var b = data.bookmarks[i];
                    that.add(b._id);
                }
                if(that.options.onDataComplete)
                {
                    if(typeof that.options.onDataComplete === 'function')
                        that.options.onDataComplete.apply(that, [data]);
                    else
                        that.options.onDataComplete.f.apply(that.options.onDataComplete.o, [data])
                }
            });
        },
        add: function(bid){
            var B = tc.Bookmark(bid);
            this.bookmarks[bid] = B;
            this.elements.itemsBox.append(B.element());
        },
        render:function(){
            for(var k in this.bookmarks)
            {
                this.bookmarks[k].render();
            }
        },
        element:function(){
            return this.elements.box;
        },
    };
    
    var ret = Object.create(proto);
    ret.init(sid, options);
    return ret;
}

tc.Shelves = function(options)
{
    var proto = {
        init: function(options){
            this.options = options || {};
            this._ui();
            this._current = undefined;
            this.shelves = {};
            this.fetch();
        },
        _ui:function(){
            this.elements = { 
                box : $('<div />').addClass('shelf-top-box'),
                menu: {
                    box:$('<div />').addClass('shelf-menu-box'),
                },
                create : {
                    box: $('<div />').addClass('shelf-create-box'),
                    input: $('<input type="text" />').addClass('shelf-create-input'),
                    submit: $('<div>create</div>').addClass('shelf-create-submit'),
                },
            };
            this.elements.create.box
                .append(this.elements.create.input)
                .append(this.elements.create.submit);
            
            this.elements.box
                .append(this.elements.menu.box);
            
            this.elements.box
                .append(this.elements.create.box);
            
            var that = this;
            this.elements.create.submit.on('click', function(evt){
                var name = that.elements.create.input.val();
                that.create({title:name});
                that.elements.create.input.val('');
            });
        },
        fetch: function(){
            var that = this;
            $.getJSON('/api/Shelf', function(data){
                var dc = data.length;
                for(var i = 0; i < dc; i++)
                {
                    var s = data[i];
                    that.add(s._id);
                }
            });
        },
        render:function(){
            for(var k in this.shelves)
            {
                this.shelves[k].render();
            }
        },
        add: function(sid){
            var menuItem = $('<div />').addClass('shelf-menu-item');
            this.elements.menu.box.append(menuItem);
            var S = tc.Shelf(sid, {
                onDataComplete:function(data){
                    menuItem.html(data.title);
                }
            });
            this.shelves[sid] = S;
//             this.elements.box.append(S.element());
            
            var that = this;
            menuItem.on('click', function(evt){
                if(!menuItem.hasClass('selected'))
                {
                    $('.shelf-menu-item').removeClass('selected');
                    if(that._current !== undefined)
                    {
                        that._current.element().detach();
                    }
                    that._current = S;
                    menuItem.addClass('selected');
                    that.elements.box.append(that._current.element());
                }
            });
            
        },
        element:function(){
            return this.elements.box;
        },
        current:function(){
            return this._current;
        }
    };
    
    var ret = Object.create(proto);
    ret.init(options);
    return ret;
}