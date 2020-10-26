var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;


mongoose.Promise = global.Promise;
var mongoDB = 'mongodb://localhost:27017/pwa_data';

mongoose.Promise = global.Promise;
try{
    connection = mongoose.connect(mongoDB,  {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongoDB is successful! (Login)');
} catch (e) {
    console.log('error in db connection: ' + e.message);
}