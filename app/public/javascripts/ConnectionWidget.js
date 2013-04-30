/*
 * 
 * ConnectionWidget.js
 * 
 */


window.tc = window.tc || {};

tc.ConnectionWidget = Backbone.View.extend({
    className:'ConnectionWidget',
    initialize:function(){
        this.trig = $('<div></div>').addClass('cw_trig');
        this.ctnr = $('<div></div>').addClass('cw_ctnr');
        this.nr = $('<div>Add Connection</div>').addClass('cw_nr');
        this.sb = $('<div>Save</div>').addClass('cw_save');
        
        this.nr.on('click', this.add_row.bind(this));
        this.sb.on('click', this.save.bind(this));
        
        this.$el.append(this.trig);
        this.$el.append(this.ctnr);
    },
    render:function(data){
        data = data || {title:'',connections:[]};
        var ctnr = this.ctnr;
        this.sb.detach();
        this.nr.detach();
        ctnr.empty();
        template.render('ConnectionWidget', this, function(t){
            ctnr.append(this.sb);
            ctnr.append(t(data));
            ctnr.append(this.nr);
        });
    },
    add_row:function(){
        var ctnr = this.ctnr;
        template.render('ConnectionWidgetNewRow', this, function(t){
            var html = $(t({}));
            ctnr.append(html);
            this.nr.detach();
            ctnr.append(this.nr);
            html.find('.drop').droppable({
                accept: ".Bookmark",
                tolerance: "pointer" ,
                drop: function( event, ui ) {
                    console.log(ui);
                    var elt = ui.draggable;
                    var id = elt.attr('id').split('_').pop();
                    var model = tc.BookmarkCollection.get_item(id);
                    var note = model.get('note');
                    var that = $(this);
                    that.html(note);
                    var isIn = that.hasClass('in');
                    if(isIn)
                        that.attr('id', 'In_'+id);
                    else
                        that.attr('id', 'Out_'+id);
                }
            });
        });
    },
    save:function(){
        var ctnr = this.ctnr;
        var title = ctnr.find('.title').val();
        var cids = [];
        var conns = ctnr.find('.new_conn');
        var f = function(){
            tc.PathCollection.create({
                title:title,
                trackpoints:cids
            }, 
            {
                wait:true,
                attrs:
                    {
                        title:title,
                        trackpoints:cids
                    }
            });
        }
        var save_all = _.after(conns.length, f);
        conns.each(function(idx, el){
            var $el = $(el);
            var _in = $el.find('.in').attr('id').split('_').pop();
            var _out = $el.find('.out').attr('id').split('_').pop();
            var cin = tc.BookmarkCollection.get(_in).get('cursor');
            var cout = tc.BookmarkCollection.get(_out).get('cursor');
            var anot = $el.find('.annotation').val();
            var m = new tc.Connection({start:cin, end:cout, annotation:anot});
//             tc.ConnectionCollection.create(m, {wait:true});
            m.on('sync', function(){
                cids.push(m.id);
                save_all();
            });
            m.save();
        });
    },
});