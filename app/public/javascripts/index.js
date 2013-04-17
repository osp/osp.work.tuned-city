/*
 * index.js
 */


//     var medias = {};
//     <% for(var i=0; i<medias.length; i++) { %>
//     medias['id_<%= medias[i]._id %>'] = <%= medias[i] %> ;
//     <% } %>
//     $(document).ready(function(){
    //         $('.media_item').each(function(idx, elem){
        //             var that = $(elem);
        //             var id = that.attr('id');
        //             MediaPlayer(that.find('.player').first(), medias[id]);
        //         });
        //     });

        
var app = {};


$(document).ready(function(){
    
    app.player = tc.MediaPlayer("#audio");
    app.current_path = undefined;
    app.shelves = tc.Shelves();
    
    $('body').append(app.shelves.element());
    
    $.getJSON('/config/root_way',function(config){
        var pid = config.root_way;
        $.getJSON('/api/Path/'+pid, function(path_data){
            app.current_path = tc.Path(path_data);
            app.player.loadPath(app.current_path);
        });
    });
});