var Story = require('../models/stories');
var Ratings = require('../models/rating');
const Ranking = require('../CollectiveIntelligence/Ranking');

//store a new story in database
exports.storeStory = function(req, res){
    var storyData = req.body;
    if (storyData == null) {
        res.status(403).send('No data sent!')
    }

    //compose the story id
    let story_id = storyData.username + storyData.story_date;
    let input_images = [];
    for (var i=0; i<storyData.input_image.length; i++){
        input_images[i] = storyData.input_image[i].toString();
    }
    // store to database
    try{
        var story = new Story({
            story_id: story_id,
            username: storyData.username,
            story_date: storyData.story_date,
            story_text: storyData.story_text,
            input_image: input_images,
        });

        story.save(function (err, results){
            //console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(story));

        });
    }catch(e){
        res.status(500).send('error ' + e);
    }
}

// recommendation algorithm returning all stories by order of recommendation
// takes the user that is logged in and uses Pearson correlation
// to suggest new stories for a user based on their own personal history
exports.getAllStories = function(req, res) {

    try{
        //get all the ratings
        //and create a table {user: {story: vote}}
        //to use for the recommendation algorithm
        Ratings.find({},
        'story_id username vote',
        function (err, ratings) {
            if (err)
                console.log('Invalid data!');

            let allRatings = {};
            ratings.forEach(function (rating) {
                let user = rating.username;
                let ratingItem = {};
                ratingItem[rating.story_id] = rating.vote;

                if (!(user in allRatings)) {
                    allRatings[user] = [];
                    allRatings[user].push(ratingItem);
                } else {
                    allRatings[user].push(ratingItem);
                }

            })

            // check if a user is logged in
            if (req.cookies.username !== undefined) {

                //get the user that is currently logged in
                let name = req.cookies.username.toString();
                let ranking = new Ranking();
                //find the best stories in order of preference using the recommendation algorithm
                let results = ranking.getRecommendations(allRatings, name);
                console.log(results[1]);

                // get all the stories now and sort them by
                // the order of the results from recommendation algorithm
                Story.find({},
                    'story_id username story_date story_text input_image',
                    function (err, story) {
                        if (err)
                            err.status(500).send('Invalid data!');

                        //create a new empty array and add in the correct order each story
                        //taken from the database
                        let sortedStories = [];
                        results.forEach(function (result) {
                            let obj = story.find(o => o.story_id === result);
                            //console.log(obj);
                            sortedStories.push(obj);
                            const i = story.indexOf(obj);
                            story.splice(i, 1);

                        });
                        //recommendation stories have been pushed
                        //add the rest of the stories at the end of the array
                        //to display if recommendation stories are not too much
                        sortedStories = sortedStories.concat(story);

                        console.log(sortedStories[1]);
                        res.setHeader('Content-Type', 'application/json');
                        //reverse because in local storage are stored the other way around
                        res.send(JSON.stringify(sortedStories.reverse()));
                    });
            } else {
                res.status(403).send("No data sent!");
            }
            });

    } catch (e){
        console.log('error ' + e);
    }


};