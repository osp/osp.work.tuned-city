/*
 * Form.js
 */

window.tc = window.tc || {};


tc.Form = function()
{
    var upload = {
        init:function(form, data){},
        submit:function(form){},
        form:{
            action : "/api/Media/",
            enctype : "multipart/form-data",
            method : "post",
            html :
            [
            {
                type: "file",
                name: "media"
            },
            {
                type: "submit"
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
            
            var current_shelf = tc.app.shelves.current();
            
            if(current_shelf === undefined)
            {
                return false;
            }
            
            p.html('Insert a bookmark in <stromg>'+current_shelf.data.title+'</strong>');
            media.val(data.media);
            time.val(data.time);
            shelf.val(current_shelf.id);
            return true;
        },
        submit:function(form){
            var p = form.find('.form-info');
            var media = form.find('.form-media');
            var time = form.find('.form-time');
            var shelf = form.find('.form-shelf');
            var comment = form.find('.form-shelf');
            
            // first create a cursor
            $.post('/api/Cursor', { media:media.val(), cursor:time.val() },
                   function(cdata){
                       $.post('/api/Bookmark', { note:comment.val(), cursor:cdata._id },
                              function(bdata){
                                  $.getJSON('/api/Shelf/'+shelf.val(), function(sdata){
                                      var rdata = _.extend({},sdata);
                                      rdata.bookmarks.push(bdata._id);
                                      $.ajax('/api/Shelf/'+sdata._id,{
                                          type:'PUT',
                                          contentType: 'application/json',
                                          data: rdata,
                                          success: function(data){
                                              tc.shelves.current().add(bdata._id);
                                        }
                                    });
                                });
                            });
                });
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
                type: 'hidden',
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
