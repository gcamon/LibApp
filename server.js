'use strict'

var express = require("express");
var path = require('path');
var configuration = require('./config');
var userLogin = require('./login');
var userSignUp = require('./signup');
var apiController = require('./apiController');
var htmlController = require('./htmlController');
var mongoose = require('mongoose');




var app = express()

var port = process.env.PORT || 3000;



mongoose.connect("mongodb://127.0.0.1:27017/library");
var db = require('./model');
var model = db();

app.listen(port);

configuration(app);
userLogin(app,model);
userSignUp(app,model);
apiController(app,model);
htmlController(app);








//config


//hashing password


//user login

//user signup


//admin log

//routing to pages




