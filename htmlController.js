'use strict';


var routes = function (app) {
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

}

module.exports = routes;