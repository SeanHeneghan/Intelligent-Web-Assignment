var mongoose = require('mongoose');

var Login = require('../models/logins');
var bcrypt = require('bcryptjs');
const saltRounds = 10;

var Story = require('../models/stories');
var Rating = require('../models/rating');

let allData = [];

// remove records from database before adding initial data
exports.init = async function() {
    // uncomment if you need to drop the database

    await Login.remove({}, function(err) {
        console.log('Login removed')
    });

    await Story.remove({}, function(err) {
        console.log('Stories removed')
    });

    await Rating.remove({}, function(err) {
        console.log('Ratings removed')
    });

    //uncomment to upload only one record per collection

    //encrypt password and create a new object
    bcrypt.hash("password", saltRounds, function(err, hash) {
        var login = new Login({
            username: 'admin',
            password: hash,
        });
        login.save(function (err, results){
            console.log('Admin stored!');
        });
    });
    //


    /*
    var stories = new Story({
        story_id: 'test',
        username: 'test',
        story_date: '',
        story_text: 'test',
        input_image: 'test',
    });

    stories.save(function (err, results){
        console.log(results._id);
    });

    var ratings = new Rating({
        story_id: 'test',
        username: 'test',
        vote: 'test',
        vote_date: '',
    });

    ratings.save(function (err, results){
        console.log(results._id);
    });*/

}

//take the userData from json file and store in database
//encrypt the passwords before storing them
//check if each document in collection exists and create a new one if not
exports.populateUserData = async function(userData){
    console.log("Adding users...");
    for (const user of userData) {

        try{
            await Login.find({username: user.username}, {_id: 1},
                function(err, login) {
                    if (err) {
                        console.log(err);
                    }
                    // check if user already exists
                    if (login.length > 0) {
                        //console.log('Username already exists!');
                    } else {

                        //encrypt password
                        bcrypt.hash(user.password, saltRounds, function (err, hash) {
                            var registration = new Login({
                                username: user.username,
                                password: hash,
                            });
                            //console.log('received: ' + registration);

                            registration.save(function (err, results) {
                                if (err) {
                                    console.log(err);
                                }


                            });
                        });


                    }
            });

    } catch (e){
        console.log(e);
    }

    }

};

//take the storyData from json file and store in database
//check if each document in collection exists and create a new one if not
exports.populateStoryData = async function(storyData){
    console.log("Adding stories...");
    for (const story of storyData) {
        try{
            await Story.find({story_id: story.story_id}, {_id: 1},
                function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    // check if story already exists
                    if (result.length > 0) {
                        console.log('Story already inserted!');
                    } else {

                        var new_story = new Story({
                            story_id: story.story_id,
                            username: story.username,
                            story_date: story.story_date,
                            story_text: story.story_text,
                        });

                        new_story.save(function (err, results) {
                            //console.log(results._id);
                            if (err)
                                console.log('Invalid data!');
                        });
                    }
            });
        } catch (e){
            console.log(e);
        }
    }
};

//take ratingData from json file and store in database
//check if each document in collection exists and create a new one if not
exports.populateRatingData = async function(ratingData){
    console.log("Adding ratings...");
    for (const rating of ratingData) {
        try{
            await Rating.find({story_id: rating.story_id, username: rating.username}, {_id: 1},
                function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    // check if user already exists
                    if (result.length > 0) {
                        console.log('Rating already inserted!');
                    } else {

                        var new_rating = new Rating({
                            story_id: rating.story_id,
                            username: rating.username,
                            vote: rating.vote,
                            vote_date: rating.vote_date,
                        });

                        new_rating.save(function (err, results) {
                            //console.log(results._id);
                            if (err)
                                console.log('Invalid data!');
                        });
                    }
                });
        } catch (e){
            console.log(e);
        }
    }
};