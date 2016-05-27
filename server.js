'use strict'

var express = require("express");

var path = require('path');

var app = express()

var port = process.env.PORT || 3000;

app.listen(port);

var fs = require('fs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
})

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
/*app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());*/

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
				  console.log(books);
				  console.log(books[4]);
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
	console.log(password)
	newUser.findOne({"username": req.body.username},function(err,user){
		if(err) throw err;

		console.log(user)
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
			})
			
		}
	})

});
//admin log
app.get('/admin/:id',function(req,res){
	if(req.params.id === "godson"){
		res.render('admin',{"message":"welcome " + req.params.id})
	}	
})


//borrowing book
app.get('/api/user/:thebook',function(req,res){
	var dt = datetime.create();
	var formatted = dt.format('m/d/Y H:M:S');
	newBook.update({book_id: req.params.thebook}, {$set: {status: "borrowed",date_of_collection: formatted}},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		})		
	})
})

//deleting a book
app.get('/api/delete',function(req,res){
	newBook.remove({book_id: req.query.id},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		})		
	})
})

app.get('/api/deleteAll',function(req,res){
	newBook.remove({},function(err,book){		
		newBook.find({},function(err,books){
			if(err) throw err;
			res.render('user',{"books": books})
		})		
	})
})

//api surcharging user
app.get('/api/surcharge',function(req,res){
  newBook.update({book_id: req.query.id}, {$inc: {surcharge: 100}},function(err,book){
		res.render('admin',{"message":""})
	})
})

//returning book by the admin
app.get('/api/return',function(req,res,next){
	var dt = datetime.create();
	var formatted = dt.format('m/d/Y H:M:S');
	newBook.update({book_id: req.query.id}, {$set: {status: "Available",date_of_collection: formatted,surcharge: 0}},function(err,book){
		res.render('admin',{"message":""})
	})
})

//Adding books by admin
app.post('/books',function(req,res){
	console.log(req.body.category)	
	newBook.findOne({"book_id": req.body.id},function(err,user){
		console.log(user)
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
			})

			student.save(function(err){
				if(err) throw err;
				console.log('book saved');
				res.render('confirmation',{"message":"Book added to the store!!"})
			})
			
		}
	});

	
});

//displaying content
app.get('/user/:val',function(req,res){
	if(req.params.val === "jkjustkidding"){
		newBook.find({},function(err,books){
			if(err) throw err;
			console.log(books)
			console.log(books[4])
			res.render('user',{"books": books})
		})
		
	}

})

//routing to pages
app.get('/',function(req,res){
  res.render('login',{"message":""})
});


app.get('/signup',function(req,res){
	res.render('signup',{"message":""})
})

app.get('/user',function(req,res){
	res.render('user')
})

app.get('/signout',function(req,res){
	req.logout()
	res.redirect('/')
});

app.get('/admin/godson',function(req,res){
	res.render('admin',{"message": ""})
})




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




//passport config

/*passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  newUser.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use('/assets',express.static(__dirname + '/public'));


passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {     	

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        newUser.findOne({ username :  username }, function(err, user) {

            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!isValidPassword(user,password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
		console.log(password);
		console.log(user.password)
  		return bCrypt.compareSync(password, user.password);
};

app.post('/login',passport.authenticate('login',{
	successRedirect: '/user',
	failureRedirect: '/login',
	failureFlash: true
}));

var bookIdFactory = function(){
	var bookId = {};
	return {
		set: function(sel){
			bookId['newBook'] += 1;
		},
		get: function(){
			return userId['newBook'];
		}
	}
};


passport.use('signup', new LocalStrategy({
	usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true 
},
function(req,username,password,done){
	process.nextTick(function(){
		
		newUser.findOne({username:username},function(err,user){
			if(err) return done(err);

			if(user){
				console.log("user exist")
				return done(null, false, req.flash('signupMessage', 'That email has already been use please find another one'));	
			} else {
				var User = new newUser({
					username: username,
					password: createHash(password),
					email: req.body.email
				});

				User.save(function(err){
					if(err) throw err;
					console.log("user save");
					console.log(User)
					return done(null,User);
				})
			}
		})
	})
}));

app.post('/signup',passport.authenticate('signup',{
	successRedirect: '/user',
	failureRedirect: '/signup',
	failureFlash: true
}));


passport.use('addBook', new LocalStrategy({
	usernameField : 'title',
    passwordField : 'password',
    passReqToCallback : true 
},
function(req,username,phone,done){
	process.nextTick(function(){
		console.log(username);
		console.log(phone);
		newBook.findOne({"bookInfo.title":phone},function(err,user){
			if(err) {
				return done(err);
			}

			if(user){
				console.log("book exist")
				return done(null, false, req.flash('signupMessage', 'Oops1! looks like this user have already registered please check your sms for your login details and login'));	
			} else {
				console.log(req.body);		
				
				console.log(req.query.title)	
				bookIdFactory.set();
				var bookNum = bookIdFactory.get();
				var book = new newBook({
					book_id: bookNum,
					Book_title: req.body.title,
					category: req.body.category,
					status: "Available",
					date_of_collection: req.body.date,
				});

				book.save(function(err){
					if(err) throw err;
					console.log("book save");
				})		
					
				
			}
		})
	})
}));


app.post('/admin/jkjustkidding',passport.authenticate('addBook',{
	successRedirect: '/user',
	failureRedirect: '/signup',
	failureFlash: true
}));



app.get("/admin/:id",function(req,res){
	if(req.params.id === "jkjustkidding"){

		res.render('admin')
	}else {
		res.render('login')
	}
	
})

app.get('/',function(req,res){
	res.render('login',{"message":"i see ya"})
});

app.get('/login',function(req,res){
	res.render('login',{"message": req.flash("loginMessage")})
});

app.get('/signup',function(req,res){
	res.render('signup',{"message": req.flash("signupMessage")})
});

app.get('/user',function(req,res){
	res.render('user')
})

app.get('/signout',function(req,res){
	req.logout()
	res.redirect('/')
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
});*/