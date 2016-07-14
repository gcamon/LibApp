'use strict';

var flash = require('connect-flash');
var salt = require('./salting');


var signUp = function (app,model) {
	app.post('/signup',function(req,res){
  var password = salt.createHash(req.body.password);
  model.newUser.findOne({"username": req.body.username},function(err,user){
  if(err) throw err;

  if(user){
    res.render('signup',{"message" : "username already exist"})
  } else {
    var student = new model.newUser({
      username: req.body.username,
      password: password,
      email: req.body.email,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      phone: req.body.phone,
      address: req.body.address
    })
    req.session.user = student;
    console.log(req.session.user)  

    student.save(function(err){
      if(err) throw err;
      console.log('person saved')
      res.render('confirmation',{"message":"SUCCESS!! YOU CAN NOW MAKE YOU OF OUR LIBRARY. Thank you for joining us."})
    });
    
  };
  });

});
}

module.exports = signUp;
