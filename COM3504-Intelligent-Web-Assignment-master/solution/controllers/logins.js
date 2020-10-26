var Login = require('../models/logins');
var bcrypt = require('bcryptjs');
const saltRounds = 10;

//register a user once signed up
//add user record to the database
exports.register = function (req, res) {
    var registerData = req.body;

    if (registerData == null){
        res.status(403).send('No data sent!')
    }

    try{
        // check if password and confirm password match
        if (registerData.password !== registerData.confirm_password){
            res.statusMessage = "Passwords do not match.";
            res.status(403).send('Passwords do not match!');
            return;
        }
        Login.find({username: registerData.username}, {_id: 1},
            function(err, login){
                if (err) {
                    res.status(500).send('Invalid data!');
                    console.log(err);
                }
                // check if user already exists
                if (login.length > 0) {
                    res.statusMessage = "Username exists.";
                    res.status(500).send('Invalid data!');
                }
                else{

                    //encrypt password and create a new object
                    bcrypt.hash(registerData.password, saltRounds, function(err, hash){
                        var registration = new Login({
                            username: registerData.username,
                            password: hash,
                        });
                        console.log('received: '+ registration);
                        //store to database
                        registration.save(function(err, results){
                            console.log(results._id);
                            if (err){
                                console.log(err);
                                res.status(500).send('Invalid data!');
                            }
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(registration));


                        });
                    });
                }
            });

    } catch (e){
        console.log(e);
        res.status(500).send(e.message);
    }
};


// check login and authorize user
exports.checkLogin = function(req, res){
    var loginData = req.body;
    console.log(loginData.username);
    if (loginData == null){
        res.status(403).send('No data sent!')
    }
    try{
        Login.findOne({username: loginData.username},
            function(err, user){
                if (err) {
                    res.status(500).send('Invalid data!');
                } else {
                    // if user exists check the password
                    // else send an error status message
                    if (user){
                        console.log(user);
                        bcrypt.compare(loginData.password, user.password, function(err, result){
                            if (result == true){
                                console.log(user);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(user));
                            } else{
                                res.statusMessage = "Username/Password incorrect. Please try again.";
                                res.status(500).send('Invalid data!');
                            }
                        });
                    } else{
                        res.statusMessage = "Username/Password incorrect. Please try again.";
                        res.status(500).send('Invalid data!');
                    }
                }
            });
    } catch (e){
        res.status(500).send(e.message);
    }
};