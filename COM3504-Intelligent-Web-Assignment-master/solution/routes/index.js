var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');

//uncomment in case uploading json from the website does not work
//put the json file in the app folders and setup the filepath
//let filePath = 'data/usersStoriesAndRatings.json';
//fs.readFile(filePath, handleFile);

var logins = require('../controllers/logins');
var stories = require('../controllers/stories');
var ratings = require('../controllers/rating');
var initDB = require('../controllers/init');
initDB.init();

/* GET home page. */
router.get('/',  function(req, res, next) {
  if (req.cookies.username !== undefined) {
    res.render('index', {title: 'Social Media Platform', page: 'index' , username: (req.cookies.username), current_date: Date.now()});
  } else {
    res.redirect('/login');
  }
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  if (req.cookies.username !== undefined) {
    res.render('profile', {title: req.cookies.username, page: 'profile', username: req.cookies.username, current_date: Date.now()});
  } else {
    res.redirect('/login');
  }
});

/* GET login page. */
router.get('/login',  function(req, res, next) {
  if (req.cookies.username !== undefined) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

/* sign out and clear cookies. */
router.get('/logout', function(req, res, next) {
  res.clearCookie('username');
  res.redirect('/login');
});

/* user tries to sign in. */
router.post('/login_check', logins.checkLogin);

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

/* POST to register a new user */
router.post('/register_user', logins.register);

/* send all stories to sync with the client-side database. */
router.post('/sync_stories', stories.getAllStories);

/* send all ratings to sync with the client-side database. */
router.post('/sync_ratings', ratings.getAllRatings);

/* POST to create a new story and add to the database */
router.post('/story_data', stories.storeStory);

/* POST method to handle the rating of a story change/update */
router.post('/rating_data', ratings.updateRating);

/* POST method to upload the json file */
router.post('/upload_json/:filename', function (req, res) {
    upload(req, res, async function(err) {
      if (err) {
        console.log("IN ERROR")
        res.status(400).send("Unable to upload file" + err);
        return;
      }
      var filename = req.params.filename;
      var filePath = 'public/data/'+ filename;
      fs.readFile(filePath, await handleFile);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(filename));

    });
  }
);

/**
 * function to handle the json file before storing to mongo database
 * modifies the file entries to match the structure of the database
 * then adds the data in the database - populates with users, stories and ratings
 * @param error
 * @param file
 * @returns {Promise<void>}
 */
async function handleFile(error, file) {
  if (error) return console.error('Error with input file', error);

  var data = JSON.parse(file);

  var storyIds = [];

  // adapt story data
  var storyData = data.stories;

  let t = new Date();

  storyData.forEach(function (story) {
    // when uploading, the Date.now() time is sometimes the same
    // for posts made by user. To avoid that, I add 1 ms to the Date.now()
    t.setMilliseconds(t.getMilliseconds() + 1);
    story.story_date = t.getTime();
    story.story_id = story.userId + story.story_date;
    story.username = story.userId;
    story.story_text = story.text;
    story.input_image = [];

    storyIds.push({inputId: story.storyId, mongoId: story.story_id})

    delete story.storyId;
    delete story.userId;
    delete story.text;
  });

  // adapt user and rating data
  var userData = data.users;
  var ratingData = [];
  ratingData.length = 0;

  userData.forEach(function (user) {
    user.username = user.userId;
    user.password = user.userId;

    var userRatings = user.ratings;

    // adapt ratings
    userRatings.forEach(function (rating) {
      var ratingItem = {}
      ratingItem.username = user.userId;

      // adapt story Id of rating
      var storyId = storyIds.find(elem => {
        return elem.inputId === rating.storyId;
      });
      ratingItem.story_id = storyId.mongoId;
      ratingItem.rating_id = ratingItem.story_id + ratingItem.username;
      ratingItem.vote = rating.rating;

      let t = new Date();
      //var x = new Date(t.setSeconds(t.getSeconds() + 10));
      t.setMilliseconds(t.getMilliseconds() + 1);
      ratingItem.vote_date = t.getTime();
      ratingData.push(ratingItem);
    });


    delete user.userId;
    delete user.ratings;
  });

  //uncomment to remove all data from db
  //await initDB.init();

  //uncomment to populate user data from json file
  await initDB.populateUserData(userData);

  //uncomment to populate story data from json file
  await initDB.populateStoryData(storyData);

  // uncomment to populate rating data from json file
  await initDB.populateRatingData(ratingData);

}

// Multer helper to upload the json file
var upload = multer({storage: storage}).single('input_json');


// storage called on upload using multer, specifying the
// destination of the file and the filename when stored
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/data');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)      //new Date().toISOString() converts the current date to a string
  }
});



module.exports = router;
