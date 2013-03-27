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
Cursor.remove({},function(err){console.log(err)});
Media.remove({},function(err){console.log(err)});
Path.remove({},function(err){console.log(err)});
Connection.remove({},function(err){console.log(err)});
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


cout('Creating Cursors');
var mongo_cursors ={};
mongo_cursors.c0 = new Cursor({media:mongo_medias[0], cursor:60});
mongo_cursors.c1 = new Cursor({media:mongo_medias[1], cursor:180});
mongo_cursors.c2 = new Cursor({media:mongo_medias[1], cursor:240});
mongo_cursors.c3 = new Cursor({media:mongo_medias[0], cursor:340});
for(var k in mongo_cursors)
{
    mongo_cursors[k].save();
}
cout('> Done');

cout('Creating Connections');
var con0 = new Connection({start:mongo_cursors.c0, end:mongo_cursors.c1, annotation:'Con #0'});
var con1 = new Connection({start:mongo_cursors.c2, end:mongo_cursors.c3, annotation:'Con #1'});
con0.save();
con1.save();
cout('> Done');

cout('Creating Path');
var p = new Path({title:'Path #0', trackpoints:[con0,con1]});
p.save();
cout('> Done');

mc.close(process.exit);


