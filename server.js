'use strict'

var express = require("express");

var path = require('path');

var app = express()

var port = process.env.PORT || 3000;

app.listen(port);

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash')
var bCrypt = require('bcrypt-nodejs');
var datetime = require('node-datetime');
var morgan = require('morgan');

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


//model
var newUser = mongoose.model('userInfo', personSchema);
var newBook = mongoose.model('bookInfo',bookSchema);

//config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');    


//middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use('/assets',express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

//hashing password
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
};


//user login
app.post('/user',function(req,res){    
  newUser.findOne({username:req.body.username},function(err,user){
    
    console.log(user)  
    if(!user){
    res.render('login',{'message':"wrong username or password"})
  };
  if(user){
    if(isValidPassword(user,req.body.password)){    
      newBook.find({},function(err,books){
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

//admin log
app.get('/admin/:id',function(req,res){
  if(req.params.id === "godson" && req.session && req.session.user){
    res.render('admin',{"message":"welcome " + req.params.id})
  } else {
    res.redirect('/')
  }

});


//borrowing book
app.get('/api/user/:thebook',function(req,res){
  var dt = datetime.create();
  var formatted = dt.format('m/d/Y H:M:S');
  newBook.update({book_id: req.params.thebook}, {$set: {status: "borrowed",date_of_collection: formatted}},function(err,book){    
    newBook.find({},function(err,books){
    if(err){
        res.send("error: 404 not found")
      }
      res.render('user',{"books": books})
  });   
  });

});

//deleting a book
app.get('/api/delete',function(req,res){
  newBook.remove({book_id: req.query.id},function(err,book){
    if(err){
      res.send("error: 404 not found");
    }   
  res.render('admin',{"message":""});
  });

});

//deleting all books
app.get('/api/deleteAll',function(req,res){
  newBook.remove({},function(err,book){
    if(err){
      res.send("error: 404 not found")
    }   
  res.render('admin',{"message":""})
  });

});

//api surcharging user
app.get('/api/surcharge',function(req,res){
  newBook.update({book_id: req.query.id}, {$inc: {surcharge: 100}},function(err,book){
    if(err){
      res.send("error: 404 not found")
    }
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
    if(err){
      res.send("error: 404 not found")
    }
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
  if(req.params.val === "jkjustkidding" && req.session && req.session.user){
    newBook.find({},function(err,books){
      if(err) throw err;    
      res.render('user',{"books": books})
    });
    
  } else {
    res.redirect('/')
  };

});

//routing to pages
app.get('/',function(req,res){
  res.render('login',{"message":""})
});

app.get('/user',function(req,res){
  res.send('error 404 : not found')
})


app.get('/signup',function(req,res){
  res.render('signup',{"message":""})
});


app.get('/signout',function(req,res){
  req.session.destroy()
  res.redirect('/')
});

app.get('/admin/godson',function(req,res){
  res.render('admin',{"message": ""})
});

app.get('/assets', function(req,res,next){
  res.send('pages')
  next();
},function(req,res,next){
  res.send('css');
  next();
});




