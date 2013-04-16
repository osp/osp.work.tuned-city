/*
 * Shelf.js
 */

window.tc = window.tc || {};


tc.Bookmark = function(id)
{
    var proto = {
        init: function(id) {
            this.id = id;
            this.elt = $('<div />').addClass('bookmark');
            this.fetch();
        },
        fetch: function(){
            var that = this;
            $.getJSON('/api/Bookmark/'+this.id, function(data){
                that.data = data;
            });
        },
        render: function(){
            this.elt.html(this.data.note);
        },
        element:function(){
            return this.elt;
        },
        // Prepare it to return to mongoose model Bookmark
//         toJSON:function(){
//             return JSON.stringify({
//                 note:this.comment,
//                 cursor:{
//                     media:this.media,
//                     cursor:this.time
//                 }
//             });
//         }
    };
    
    var ret = Object.create(proto);
    ret.init(id);
    return ret;
}


tc.Shelf = function(sid)
{
    var proto = {
        init: function(sid) {
            this.id = sid;
            this.elements = {
                box :       $('<div class="shelf-box">'),
                titleBox :  $('<div class="shelf-title-box">'),
                title :     $('<div class="shelf-title" />'),
                itemsBox :  $('<div class="shelf-items-box">'),
            };
            this.elements.titleBox.append(this.elements.title);
            this.elements.box.append(this.elements.titleBox);
            this.elements.box.append(this.elements.items);
            
            this.bookmarks = {};
            this.fetch();
        },
        fetch: function(){
            var that = this;
            $.getJSON('/api/Shelf/'+this.id, function(data){
                that.elements.title.text(data.title);
                var bc = data.bookmarks.length;
                for(var i = 0; i < bc; i++)
                {
                    var b = data.bookmarks[i];
                    that.add(b);
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
    ret.init(sid);
    return ret;
}

tc.Shelves = function()
{
    var proto = {
        init: function(){
            this.elements = { box : $('<div class="shelf-top-box">') };
            this.shelves = {};
            this.fetch();
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
        create: function(sdata){
            var that = this;
            $.post('/api/Shelf', sdata, function(rdata){
                that.add(rdata._id);
            });
        },
        add: function(sid){
            var S = tc.Shelf(sid);
            this.shelves[sid] = S;
            this.elements.box.append(S.element());
        },
        element:function(){
            return this.elements.box;
        },
    };
    
    var ret = Object.create(proto);
    ret.init();
    return ret;
}