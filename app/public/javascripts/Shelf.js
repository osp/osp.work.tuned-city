/*
 * Shelf.js
 */


var Bookmark = function(media_id, time, comment)
{
    var proto = {
        init: function(media_id, time, comment) {
            this.media = media_id;
            this.time = time;
            this.comment = comment;
        }
        // Prepare it to return to mongoose model Bookmark
        toJSON:function(){
            return JSON.stringify({
                note:this.comment,
                cursor:{
                    media:this.media,
                    cursor:this.time
                }
            });
        }
    };
    
    var ret = Object.create(proto);
    ret.init(media_id, time, comment);
    return ret;
}


var Shelf = function(title)
{
    var proto = {
        init: function(title) {
            this.title = title;
            this.elements = {
                box :       $('<div class="shelf-box">'),
                titleBox :  $('<div class="shelf-title-box">'),
                title :     $('<div class="shelf-title">'+title+'</div>'),
                itemsBox :  $('<div class="shelf-items-box">'),
            };
            this.elements.titleBox.append(this.elements.title);
            this.elements.box.append(this.elements.titleBox);
            this.elements.box.append(this.elements.items);
        },
        add: function(media_id, time, comment){
            var item = $('<div class="shelf-item">'+comment+'</div>');
            var bookmark = Bookmark(media_id, time, comment);
            item.on('click', {bookmark:bookmark}, function(evt){
                var b
            });
        },
        element:function(){
            return this.elements.box;
        },
    };
    
    var ret = Object.create(proto);
    ret.init(title);
    return ret;
}