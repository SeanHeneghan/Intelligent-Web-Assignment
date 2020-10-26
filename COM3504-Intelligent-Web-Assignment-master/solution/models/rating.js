var mongoose = require('mongoose');

var Rating = mongoose.Schema(
    {
        story_id: {type: String, required: true},
        username: {type: String, required: true},
        vote: {type: Number, required: true},
        vote_date: {type: Date}
    }
);

module.exports = mongoose.model('Rating', Rating);