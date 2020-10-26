var mongoose = require('mongoose');

var Story = mongoose.Schema(
    {
        story_id: {type: String, required: true},
        username: {type: String, required: true},
        story_date: {type: Date},
        story_text: {type: String},
        input_image: {type: Array}
    }
);

module.exports = mongoose.model('Story', Story);