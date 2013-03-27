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

$(document).ready(function(){
    $.getJSON('/config/root_way',function(config){
        var pid = config.root_way;
        $.getJSON('/api/Path/'+pid, function(path_data){
            var path = Path(path_data[0]);
            console.log(path);
        });
    });
});