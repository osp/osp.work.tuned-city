/*
 * Form.js
 */

window.tc = window.tc || {};


tc.Form = function()
{
    function createBookmark(media, time, comment, shelf){
        
        var c = new tc.Cursor({ media:media, cursor:time });
        c.on('sync', function(){
            var bm = new tc.Bookmark({ note:comment, cursor:c._id });
            bm.on('sync', function(){
                var s = tc.ShelfCollection.get(shelf);
                var bms = s.get('bookmarks');
                bms.push(bm.id);
                s.set({bookmarks:bms});
                s.save();
            });
            bm.save({},{wait:true});
        });
        c.save({},{wait:true});
    };
    
    var upload = {
        init:function(form, data){
            var medias = window.app.shelves.collected.get('medias');
            if(medias === undefined)
            {
                var that = this;
                window.app.shelves.collected.create({title:'medias'},
                    function(sdata){
                        that.shelf = sdata._id;
                    });
            }
            else{
                this.shelf = medias.id;
            }
            return true;
        },
        submit:function(form){
            var media = form.find('.form-media');
            var formdata = new FormData();
            var f = media[0].files[0];
            var f_name = f.name;
            console.log('UMT: '+f.type);
//             return;
            formdata.append(media.attr('name'), f);
            var that = this;
            $.ajax({  
                url: "/api/Media",  
                type: "POST",  
                data: formdata,  
                processData: false,  
                contentType: false,  
                success: function(res) {  
                    console.log(res);
                    createBookmark(res._id, 0, 'Origin('+f_name+')', that.shelf);
                }  
            });  
        },
        form:{
            html :
            [
            {
                type: 'file',
                name: 'media',
                class: 'form-media',
            }
            ]
        }
    };
    
    var bookmark = {
        init:function(form, data){
            /*
             * data.time 
             * data.media
             */
            var p = form.find('.form-info');
            var media = form.find('.form-media');
            var time = form.find('.form-time');
            var shelf = form.find('.form-shelf');
            
//             var current_shelf = window.app.shelves.current();
//             
//             if(current_shelf === undefined)
//             {
//                 alert('You got to select a shelf first.');
//                 return false;
//             }
//             
            p.html('Insert a bookmark');
            media.val(data.media);
            time.val(data.time);
//             shelf.val(current_shelf.id);
            return true;
        },
        submit:function(form){
            var p = form.find('.form-info');
            var media = form.find('.form-media');
            var time = form.find('.form-time');
            var shelf = form.find('.form-shelf');
            var comment = form.find('.form-comment');
            
            createBookmark(media.val(), time.val(), comment.val(), shelf.val());
        },
        form:{
            html:
            [
            {
                type: 'p',
                class: 'form-info',
            },
            {
                type: 'hidden',
                class: 'form-media',
            },
            {
                type: 'hidden',
                class: 'form-time',
            },
            {
                type: 'select',
                options:(function(){
                    var ret = {};
                    tc.ShelfCollection.each(function( item ) {
                        ret[item.id] = item.get('title');
                    });
                    return ret;
                })(),
                class: 'form-shelf',
            },
            {
                type: 'textarea',
                name: 'comment',
                class: 'form-comment',
            }
            ]
        }
    };
    
    
    var forms_proto = {
        upload: upload,
        bookmark: bookmark,
    };
    
    
    var proto = {
        init: function(){
            this.e = $('<div />');
            $('body').append(this.e);
        },
        open: function(template, data){
            var f = forms_proto[template];
            this.e.empty();
            this.e.attr('title', template+' form');
            this.e.dform(f.form);
            if(!f.init(this.e, data))
            {
                console.log('Failed to init form template: '+template);
                this.e.empty();
                return;
            }
            var that = this;
            this.e.dialog({
//                 autoOpen: false,
                height: 600,
                width: 650,
                modal: true,
                buttons:{
                    Save:function(){
                        f.submit($(this));
                        $(this).dialog( "close" );
                    },
                    Cancel:function(){
                        $(this).dialog( "close" );
                    }
                },
                close:function(){
                    $(this).dialog( "destroy" );
                    that.e.empty();
                }
            });
        }
    };
    
    var ret = Object.create(proto);
    ret.init();
    return ret;
}
