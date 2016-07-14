'use strict';

var datetime = require('node-datetime');



var api = function (app,model) {
	app.get('/admin/:id',function(req,res){
  if(req.params.id === "godson" && req.session && req.session.user){
    req.session.admin = req.params.id;
    res.render('admin',{"message":"welcome " + req.params.id})
  } else {
    res.redirect('/')
  }

});

//borrowing book
app.get('/api/user/:thebook',function(req,res){
  var dt = datetime.create();
  var formatted = dt.format('d/m/Y H:M:S');  
  if(req.session && req.session.user){
    model.newBook.find({book_id: req.params.thebook},function(err,item){
      console.log(item[0].status)
    if(err){
      res.send("Oops. seems like the book not in store");
    }

    if(item[0].status === "Available"){
      if(item[0].quantity > 0){
        item[0].quantity--;
      };
      model.newBook.update({book_id: req.params.thebook}, {$set: {status: "borrowed",
        date_of_collection: formatted,
        quantity : item[0].quantity,
        collector_firstname: req.session.user.firstname,
        collector_lastname: req.session.user.lastname,
        collector_phone: req.session.user.phone}},function(err,book){

          model.newBook.find({},function(err,books){
            if(err){
                res.send("error: 404 not found");
            }          
            res.render('user',{"books": books});
          });
      })
    } else {
        if(item[0].quantity < 1){
          res.send('<html><head><body><h3> Book already been borrowed by ' + item[0].collector_firstname + " " + item[0].collector_lastname +
         '</h3><br/>' + '<a href="/user/jkjustkidding">Back</a>' + '</body></head></html>');
        } else { 
        
          model.newBook.update({book_id : req.params.thebook,"multiple.id": 0}, {$set: {"multiple.$.firstname": req.session.user.firstname,
          "multiple.$.lastname": req.session.user.lastname,
          "multiple.$.check": true,
          "multiple.date_of_collection": formatted,
          "multiple.phone" : req.session.user.phone}},function(err,success){
            console.log(success)
            model.newBook.find({book_id: req.params.thebook},function(err,boo){
              console.log(boo.multiple);
            });
          });
          res.end("yes")

        };
    }; 

   });
      
  } else {
    req.session.destroy();
    res.redirect('/');
  }

});

//deleting a book
app.get('/api/delete',function(req,res){
  if(req.session && req.session.user && req.session.admin){
    model.newBook.remove({book_id: req.query.id},function(err,book){
      if(err){
        res.send("error: 404 not found");
      }   
      res.render('admin',{"message":""});
    });
  } else {
    res.send("error: 404 not found");
  }

});

//deleting all books
app.get('/api/deleteAll',function(req,res){
  if(req.session && req.session.user && req.session.admin){
    model.newBook.remove({},function(err,book){
      if(err){
        res.send("error: 404 not found");
      }   
      res.render('admin',{"message":""});
    });
  } else {
    res.send("Error 404 : Not found");
  }
});

//api surcharging user
app.get('/api/surcharge',function(req,res){
  if(req.session && req.session.user && req.session.admin){
    model.newBook.update({book_id: req.query.id}, {$inc: {surcharge: 100}},function(err,book){
      if(err){
        res.send("error: 404 not found")
      }
      res.render('admin',{"message":""})
    });
  } else {
    res.send("Error 404 : Not found");
  }
});

//returning book by the admin
app.get('/api/return',function(req,res,next){
  var dt = datetime.create();
  var formatted = dt.format('d/m/Y H:M:S');
  if(req.session && req.session.user && req.session.admin){
    model.newBook.find({book_id: req.query.id},function(err,item){
      if(err) throw err;

      if(item[0].status === "borrowed"){
        item[0].quantity++;
        model.newBook.update({book_id: req.query.id}, {$set: {status: "Available",
        date_of_collection: formatted,
        surcharge: 0,
        quantity:item[0].quantity,
        collector_firstname: " ",
        collector_lastname: " ",
        collector_phone: " "}},function(err,book){

          res.render('admin',{"message":""});
        });

      }
    })
    
  } else {
    res.send("Error 404 : Not found");
  }
});

//Adding books by admin
app.post('/books',function(req,res){
  model.newBook.findOne({"book_id": req.body.id},function(err,user){
    if(err){
      res.send("error: 404 not found")
    }
  if(user){
    res.render('admin',{"message": "Book identity number already exist"});

  } else {
    var dt = datetime.create();
    var formatted = dt.format('d/m/Y H:M:S');// e.g. 04/28/2015 21:13:09


    function sameBook (){
      var others = {
        id : 0,
        firstname : " ",
        lastname: " ",
        date_of_collection: formatted,
        check : false,
        phone : " ",
        surcharge : 0
      };   

      var copies = []

      while(req.body.quantity > 1){
        copies.push(others);
        req.body.quantity--;
      };

      return copies;
    }
      

    var student = new model.newBook({
      book_id: req.body.id,
      book_title: req.body.title,
      category: req.body.category,
      status: req.body.status || "Available",
      collector_firstname: " ",
      collector_lastname: " ",
      collector_address: " ",
      collector_phone: " ",
      date_of_collection: formatted,
      surcharge: 0,
      quantity: req.body.quantity || 1,
      multiple : sameBook(),
      check: false
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
    model.newBook.find({},function(err,books){
      if(err) throw err;    
      res.render('user',{"books": books,"message":""})
    });
    
  } else {
    res.redirect('/')
  };

});


}

module.exports = api;