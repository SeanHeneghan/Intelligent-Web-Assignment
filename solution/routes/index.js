var express = require('express');
var router = express.Router();

router.get('/login',  function(req, res, next) {
  if (req.cookies.username !== undefined) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

router.get('/logout', function(req, res, next) {
  res.clearCookie('username');
  res.redirect('/login');
});

router.post('/login_check', function(req, res, next) {
  const loginObject = getLogin(req.body.username, req.body.password);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(loginObject));
});


router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/register_user', function(req, res, next){
  const registerUserObject = new Registration(req.body.username, req.body.password, req.body.confirm_password);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(registerUserObject));
});

router.post('/story_data', function(req, res, next) {
  const story_id = req.body.username + req.body.story_date;
  const storyObject = new Story(story_id, req.body.username, req.body.story_date, req.body.story_text, req.body.input_image);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(storyObject));
});

/* GET home page. */
router.get('/',  function(req, res, next) {
  console.log(req.url, req.cookies.username);
  if (req.cookies.username !== undefined) {
    res.render('index', {title: 'Social Media Platform', page: 'index' , username: (req.cookies.username), current_date: Date.now()});
  } else {
    res.redirect('/login');
  }
});

/* GET users listing. */
router.get('/profile', function(req, res, next) {
  if (req.cookies.username !== undefined) {
    res.render('profile', {title: req.cookies.username, page: 'profile', username: req.cookies.username, current_date: Date.now()});
  } else {
    res.redirect('/login');
  }
});

router.post('/rating_data', function(req, res, next) {
  const ratingObject = new Rating(req.body.story_id, req.body.username, req.body.vote, req.body.rating_date);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(ratingObject));
});

/**
 *
 * @param username
 * @param password
 * @constructor
 */
class Registration {
  constructor (username, password, confirm_password){
    this.username = username;
    this.password = password;
    this.confirm_password = confirm_password;
  }
}

/**
 *
 * @param username
 * @param password
 * @constructor
 */
class Login {
  constructor (username, password){
    this.username = username;
    this.password = password;
  }
}

/**
 *
 * @param username
 * @param first_name
 * @param last_name
 * @constructor
 */
class User {
  constructor (username, first_name, last_name){
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
  }
}

/**
 *

 * @param username
 * @param story_date
 * @param story_text
 * @param input_iamge
 * @contructor
 */
class Story {
  constructor (story_id, username, story_date, story_text, input_image) {
    this.story_id = story_id;
    this.username = username;
    this.story_date = story_date;
    this.story_text = story_text;
    this.input_image = input_image;
  }
}

/**
 * @param story_id
 * @param user_id
 * @param vote
 */
class Rating {
  constructor (story_id, username, vote, rating_date){
    this.story_id = story_id;
    this.username = username;
    this.vote = vote;
    this.rating_date = rating_date;
  }
}

function getLogin(username, password) {
  return new Login(username, password);
}

module.exports = router;
