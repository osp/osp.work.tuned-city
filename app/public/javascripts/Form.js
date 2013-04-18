/*
 * Form.js
 */

window.tc = window.tc || {};


tc.Form = function()
{
    function createBookmark(media, time, comment, shelf){
        $.post('/api/Cursor', { media:media, cursor:time },
               function(cdata){
                   $.post('/api/Bookmark', { note:comment, cursor:cdata._id },
                          function(bdata){
                              $.getJSON('/api/Shelf/'+shelf, function(sdata){
                                  var rdata = _.omit(sdata,'_id','__v');
                                  rdata.bookmarks.push(bdata._id);
                                  $.ajax('/api/Shelf/'+sdata._id,{
                                      type:'PUT',
                                      dataType: 'json',
                                      contentType: 'application/json',
                                      data: JSON.stringify(rdata),
                                         success: function(data){
                                             tc.app.shelves.get(shelf).add(bdata._id);
                                         }
                                  });
                              });
                          });
    });
    };
    
    var upload = {
        init:function(form, data){
            var medias = tc.app.shelves.get('medias');
            if(medias === undefined)
            {
                var that = this;
                tc.app.shelves.create({title:'medias'},
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
            
            var current_shelf = tc.app.shelves.current();
            
            if(current_shelf === undefined)
            {
                alert('You got to select a shelf first.');
                return false;
            }
            
            p.html('Insert a bookmark in <strong>'+current_shelf.data.title+'</strong>');
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
