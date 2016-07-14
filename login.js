'use strict';
var flash = require('connect-flash');
var salt = require('./salting');


var login = function (app,model) {	
	app.post('/user',function(req,res){    
	  	model.newUser.findOne({username:req.body.username},function(err,user){
	    
	    console.log(user)  
	    if(!user){
	    res.render('login',{'message':"wrong username or password"})
	  	};
	  	if(user){
		    if(salt.isValidPassword(user,req.body.password)){    
		      model.newBook.find({},function(err,books){
		      if(err) throw err;
		      req.session.user = user;
		      console.log(req.session)              
		      res.render('user',{"books": books})
		    })  
		    }else {
		      res.render('login',{'message':"wrong username or password"})
		    }
	  	}
	  	})

	});

}

module.exports = login;