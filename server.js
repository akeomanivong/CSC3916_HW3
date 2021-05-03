/*
CSC3916 HW3
File: Server.js
Description: Web API scaffolding for Movie API
 */

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, username: userToken, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Invalid username or password.'});
            }
        })
    })
});


router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        if (!req.body.title || !req.body.releaseYear || !req.body.genre) {
            console.log("Error. Title, releaseYear or genre not found!");
            res.json({success: false, message: "Error. Title, release year or genre not found!"});

        }


        else if (!req.body.actors[2]) {
            console.log("Error. Each movie requires at least 3 actors!");
            res.json({success: false, message: "Error. Each movie requires at least 3 actors!"});
        }

        else{
            var movie = new Movie();
            movie.title = req.body.title;
            movie.genre = req.body.genre;
            movie.releaseYear = req.body.releaseYear;
            movie.actors = req.body.actors;

            movie.save(function (err) {
                if (err) {
                    console.log("Error! Movie already exists.");
                    res.json({success: false, message: "Error! Movie already exists."})
                } else {
                    res.json({success: true, message: "New movie created!"});
                }


            });
        }


    })

    .get(authJwtController.isAuthenticated, function (req, res){
        Movie.find(function(err, movies){
            if(err){
                console.log("There was an error getting movie :(");
                res.json({success: false, message :"There was an error getting movie"})
            }

            else{
                console.log("You got a movie");
                res.json(movies);
            }
        });
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        if (!req.body.title || !req.body.item || !req.body.update) {
            console.log("Error. Must contain movie title, item to be updated, and the updated value");
            return res.error;
        }

        var update = req.body.item;
        var objUpdate = {};
        objUpdate[update] = req.body.update;

        Movie.findOneAndUpdate({title: req.body.title}, objUpdate, function (err, status) {
            if (err) {
                res.json({error: err});
            } else {
                res.json({success: true, message: 'Movie has been updated successfully!'});
            }

        });

    })


    .delete(authJwtController.isAuthenticated, function (req, res){
        Movie.findOneAndDelete({title: req.body.title}, function (err, movie) {
            if (err)
            {
                res.status(400).json({success: false, message: "Error"})
            }
            else if(movie == null)
            {
                res.json({success: false, message : "Movie not found"})
            }
            else{
                res.json({success: true, message :"Movie has been deleted"})}
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


