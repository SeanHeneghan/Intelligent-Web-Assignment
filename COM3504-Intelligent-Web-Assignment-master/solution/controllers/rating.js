var Rating = require('../models/rating');
const Ranking = require('../CollectiveIntelligence/Ranking');

//once a user has rated a story, update the existing records
//or create a new rating object and add to database
exports.updateRating= function (req, res){
    var ratingData = req.body;

    if (ratingData == null){
        res.status(403).send('No data sent!');
    }

    try{
        //check if a rating store exists
        Rating.findOne({story_id: ratingData.story_id, username: ratingData.username},
            function(err, rating){
                if (err){
                    res.status(500).send('Invalid data!');
                } else {
                    if (rating) {
                        //if exists and undo rating was pressed, delete the object
                        //so that it is not counted in the average calculation
                        if (ratingData.vote == 0) {
                            Rating.remove({
                                story_id: ratingData.story_id,
                                username: ratingData.username
                            }, function (err, result) {
                                if (err)
                                    err.status(500).send('Invalid data!')

                                console.log(ratingData);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(ratingData));
                            });
                        } else {
                            var ratingObj = {story_id: ratingData.story_id,
                                username: ratingData.username,
                                vote: ratingData.vote,
                                vote_date: ratingData.vote_date}
                            // update if exists
                            Rating.updateOne(ratingObj, function (err, result) {
                                if (err)
                                    err.status(500).send('Invalid data!');

                                console.log(result);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(ratingObj));
                            });

                        }

                     // if there is no entry create one
                    }else {
                            //create a rating object
                            var rating = new Rating({
                                story_id: ratingData.story_id,
                                username: ratingData.username,
                                vote: ratingData.vote,
                                vote_date: ratingData.vote_date,
                            });
                            console.log('received: ' + rating);
                            // if object does not exist save to database
                            rating.save(function (err, results) {
                                //console.log(results._id);
                                if (err)
                                    res.status(500).send('Invalid data!');

                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(rating));

                            });
                    }
                }
            });
    } catch (e){
        res.status(500).send('error ' + e);
    }

};

// return all ratings from database in order to sync with local storage
exports.getAllRatings = function(req, res) {
    Rating.find({},
        'story_id username vote vote_date',
        function (err, ratings) {
            if (err)
                err.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(ratings));
        }
    );
}