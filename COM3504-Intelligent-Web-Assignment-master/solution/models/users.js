var mongoose = require('mongoose');

var User = mongoose.Schema(
    {
        username: {type: String, required:true, max: 100},
        first_name: {type: String, required: true, max: 100},
        last_name: {type: String, required: true, max: 100}
    }
);

module.exports = mongoose.model('User', User);