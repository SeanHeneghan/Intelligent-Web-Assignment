function loadRatingData(localRating) {
    var lastRatingUpdate = localStorage.getItem('lastRatingUpdate');
    if (lastRatingUpdate !== undefined) {
        if (localRating.rating_date <= lastRatingUpdate ) {
            addRatingToResults(localRating);
            return;
        }
    }
    var input = JSON.stringify(localRating);
    ajaxRequest('/rating_data', input, "application/json", "POST");
}

function getAverageRating(storyId) {
    var total = 0;
    var ratingCounter = 0;
    var localRatings = JSON.parse(localStorage.getItem('ratings'));
    for (var ratingItem in localRatings) {
        if (localRatings.hasOwnProperty(ratingItem)) {
            var ratingObject = localRatings[ratingItem];
            if (ratingObject.story_id === storyId) {
                ratingCounter += 1;
                total += ratingObject.vote;
            }
        }
    }
    var average = total/ratingCounter;
    if (isNaN(average)) average= 0;

    return average;
}

function handleRatingChange(n, storyId) {
    storyId = storyId.id;
    var username = document.cookie.split("=")[1]

    var ratingDate = Date.now();

    var ratingItem = {rating_id: storyId + username ,
        story_id: storyId, username: username,
        vote: n, rating_date: ratingDate}

    var ratingList = JSON.parse(localStorage.getItem('ratings'));
    if (ratingList == null) ratingList = [];

    ratingList.push(ratingItem);

    // find any duplicates
    var previousRating = ratingList.find(function (item) {
        return item.story_id === storyId &&
            item.username === username &&
            item.rating_date !== ratingDate;
    });


    // delete the previous rating from ratingList
    if (ratingList.indexOf(previousRating) > -1){
        ratingList.splice(ratingList.indexOf(previousRating), 1)
    }

    // delete rating
    if (ratingItem.vote === 0) {
        ratingList = ratingList.filter(function(elem) {
            return elem.rating_id !== ratingItem.rating_id;
        });
    }

    localStorage.setItem('ratings', JSON.stringify(ratingList));

    // store it in local storage
    storeRatingData(ratingItem);

    $('#'+"averageRating"+storyId).text("Average Rating: " + getAverageRating(storyId));

    addRatingToResults(ratingItem);

    ratingItem.vote_date = ratingItem.rating_date;
    delete ratingItem.rating_date;
    ajaxRequest('/rating_data', JSON.stringify(ratingItem), 'application/json', "POST" )
}

function addRatingToResults(ratingObject) {
    var storyId = ratingObject.story_id;
    var n = ratingObject.vote;

    var undoRatingButton = $('#' + "undoRatingButton" + storyId);

    var storyCard = $('#' + storyId);

    if (ratingObject.vote === 0) {
        undoRatingButton.hide()

        for (var k = 0; k<5; k++) {
            storyCard.find($('#' + 'star' + (k+1) + storyId)).attr('class', 'fa fa-star-o')
        }

        return;
    }

    undoRatingButton.show();


    // change UI of stars
    for (var i = 0; i <= n; i++) {
        var storyStar = storyCard.find($('#' + 'star' + (i) + storyId))
        storyStar.attr('class', 'fa fa-star')
    }
    for (var j = n; j < 5; j++) {
        var nextStoryStar = storyCard.find($('#' + 'star' + (j+1) + storyId))
        nextStoryStar.attr("class", 'fa fa-star-o');
    }
}

if (document.cookie) {
    socket.on('refreshRatings', function (ratingInput) {
        var ratingObj = JSON.parse(JSON.parse(ratingInput));

        ratingObj.rating_id = ratingObj.story_id + ratingObj.username
        delete ratingObj._id;

        var ratingDate = (new Date(ratingObj.vote_date).getTime());

        console.log(ratingDate);

        ratingObj.rating_date = ratingDate;

        delete ratingObj.vote_date;

        console.log("Rating input obj:", ratingObj);


        var ratingList = JSON.parse(localStorage.getItem('ratings'));
        if (ratingList == null) ratingList = [];


        // find any duplicates
        var previousRating = ratingList.find(function (item) {
            return item.rating_id === ratingObj.rating_id;
        });


        // delete the previous rating from ratingList
        if (ratingList.indexOf(previousRating) > -1) {
            ratingList.splice(ratingList.indexOf(previousRating), 1)
        }


        ratingList.push(ratingObj);

        // delete rating
        if (ratingObj.vote === 0) {
            ratingList = ratingList.filter(function (elem) {
                return elem.rating_id !== ratingObj.rating_id;
            });
        }

        localStorage.setItem('ratings', JSON.stringify(ratingList));

        // store it in local storage
        storeRatingData(ratingObj);

        $('#' + "averageRating" + ratingObj.story_id).text("Average Rating: " + getAverageRating(ratingObj.story_id));


        var loggedInUser = document.cookie.split("=")[1]
        if (loggedInUser === ratingObj.username) {
            addRatingToResults(ratingObj);
        }
    })
}
