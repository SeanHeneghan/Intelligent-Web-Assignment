var mongoose = require('mongoose');

var Login = mongoose.Schema (
    {
        username: {type: String, required: [true, 'Username is required'], max: 100, min: [5, 'Minimum characters: 5']},
        password: {type: String, required: [true, 'Password is required'], max: 100, min:5}
    }
);

module.exports = mongoose.model('Login', Login);