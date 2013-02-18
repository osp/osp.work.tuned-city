/*
 * Mongo store
 */


var mongoose = require('mongoose');
var settings = require('./settings').settings;

mongoose.connect('mongodb://'+settings.mongo_host+'/'+settings.mongo_db);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('MongoDB connection setup');
});

exports.connection = db;


