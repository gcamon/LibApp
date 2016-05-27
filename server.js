'use strict'

var express = require("express");

var path = require('path');

var app = express()

var port = process.env.PORT || 3000;

app.listen(port);

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash')
var bCrypt = require('bcrypt-nodejs');
var datetime = require('node-datetime');

mongoose.connect("mongodb://127.0.0.1:27017/library");
var Schema = mongoose.Schema;

var personSchema = Schema({
  username: String,
  password: String,
  email: String
},{
  collection: "userInfo"
});

var bookSchema = Schema({
  book_id: String,
  book_title: String,
  category: String,
  status: String,
  date_of_collection: String,
  surcharge: Number
},{
  collection: "bookInfo"
});



var newUser = mongoose.model('userInfo', personSchema);
var newBook = mongoose.model('bookInfo',bookSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/assets',express.static(__dirname + '/public'));




var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
};

//user login

app.post('/login',function(req,res){		
  newUser.findOne({username:req.body.username},function(err,user){
	  	if(!user){
	  		res.render('login',{'message':"wrong username or password"})
	  	};

	  	if(user){
		  	if(isValidPassword(user,req.body.password)){    
			    newBook.find({},function(err,books){
				  if(err) throw err;				  
				  res.render('user',{"books": books})
				})	
			}else {
				res.render('login',{'message':"wrong username or password"})
			}
		}
	})
});

//user signup
app.post('/signup',function(req,res){
	var password = createHash(req.body.password);
	newUser.findOne({"username": req.body.username},function(err,user){
		if(err) throw err;
		if(user){
			res.render('signup',{"message" : "username already exist"})
		} else {
			var student = new newUser({
				username: req.body.username,
				password: password,
				email: req.body.email
			})

			student.save(function(err){
				if(err) throw err;
				console.log('person saved')
				res.render('confirmation',{"message":"SUCCESS!! YOU CAN NOW MAKE YOU OF OUR LIBRARY. Thank you for joining us."})
			});
			
		};
	});

});

//admin log
app.get('/admin/:id',function(req,res){
	if(req.params.id === "godson"){
		res.render('admin',{"message":"welcome " + req.params.id})
	}	
});


//borrowing book
app.get('/api/user/:thebook',function(req,res){
	var dt = datetime.create();
	var formatted = dt.format('m/d/Y H:M:S');
	newBook.update({book_id: req.params.thebook}, {$set: {status: "borrowed",date_of_collection: formatted}},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		});		
	});
});

//deleting a book
app.get('/api/delete',function(req,res){
	newBook.remove({book_id: req.query.id},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		});		
	});
});

app.get('/api/deleteAll',function(req,res){
	newBook.remove({},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		});		
	});
});

//api surcharging user
app.get('/api/surcharge',function(req,res){
  newBook.update({book_id: req.query.id}, {$inc: {surcharge: 100}},function(err,book){
		res.render('admin',{"message":""})
  });
});

//returning book by the admin
app.get('/api/return',function(req,res,next){
	var dt = datetime.create();
	var formatted = dt.format('m/d/Y H:M:S');
	newBook.update({book_id: req.query.id}, {$set: {status: "Available",date_of_collection: formatted,surcharge: 0}},function(err,book){
		res.render('admin',{"message":""})
	});
});

//Adding books by admin
app.post('/books',function(req,res){
	newBook.findOne({"book_id": req.body.id},function(err,user){
		if(user){
			res.render('admin',{"message": "Book identity number already exist"})
		} else {
			var dt = datetime.create();
			var formatted = dt.format('m/d/Y H:M:S');// e.g. 04/28/2015 21:13:09 			

			var student = new newBook({
				book_id: req.body.id,
				book_title: req.body.title,
				category: req.body.category,
				status: req.body.status,
				date_of_collection: formatted,
				surcharge: 0
			});

			student.save(function(err){
				if(err) throw err;
				console.log('book saved');
				res.render('confirmation',{"message":"Book added to the store!!"})
			});
			
		};
	});

	
});

//displaying content
app.get('/user/:val',function(req,res){
	if(req.params.val === "jkjustkidding"){
		newBook.find({},function(err,books){
			if(err) throw err;		
			res.render('user',{"books": books})
		});
		
	};

});

//routing to pages
app.get('/',function(req,res){
  res.render('login',{"message":""})
});


app.get('/signup',function(req,res){
	res.render('signup',{"message":""})
});

app.get('/user',function(req,res){
	res.render('user')
});

app.get('/signout',function(req,res){
	req.logout()
	res.redirect('/')
});

app.get('/admin/godson',function(req,res){
	res.render('admin',{"message": ""})
});

app.get('/assets', function(req,res,next){
	res.send('pages')
	next();
},function(req,res,next){
	res.send('js');
	next();
},function(req,res,next){
	res.send('css');
	next();
});




