/*
 * Fixture
 */

var Media = require('./models').Media;
var Path = require('./models').Path;
var Cursor = require('./models').Cursor;
var Connection = require('./models').Connection;
var mc = require('./models').mongo_connection;

var cout = console.log;

cout('Removing Data fron DB');
Media.remove({});
Path.remove({});
Connection.remove({});
cout('> Done');

var medias = [
{url:'http://video.constantvzw.org/VJ13/11-30_GML-recorder-1.ogv', type:'ogv'},
{url:'http://video.constantvzw.org/VJ13/11-30_GML-recorder-3.ogv', type:'ogv'},
];

cout('Creating Medias');
var mongo_medias = [];
for(var i = 0; i < medias.length; i++)
{
    var m = medias[i];
    var mm = new Media(m);
    mm.save();
    mongo_medias.push(mm);
}
cout('> Done');

cout('Creating Path');
var c0 = Cursor(mongo_medias[0], 60);
var c1 = Cursor(mongo_medias[1], 180);
var c2 = Cursor(mongo_medias[1], 240);
var c3 = Cursor(mongo_medias[0], 340);

var con0 = new Connection({start:c0, end:c1, annotation:'Con #0'});
var con1 = new Connection({start:c2, end:c3, annotation:'Con #1'});

var p = new Path({title:'Path #0', trackpoints:[con0,con1]});
p.save();
cout('> Done');

mc.close(process.exit);


