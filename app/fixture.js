/*
 * Fixture
 */

var Media = require('./models').Media;

var medias = [
{url:'http://video.constantvzw.org/VJ13/11-30_GML-recorder-1.ogv', type:'ogv'},
{url:'http://video.constantvzw.org/VJ13/11-30_GML-recorder-3.ogv', type:'oga'},
];

for(var i = 0; i < medias.length; i++)
{
    var m = medias[i];
    var mm = new Media(m);
    mm.save();
}